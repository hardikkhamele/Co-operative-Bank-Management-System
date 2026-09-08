import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Download, CheckCircle2, User, Calendar, Users, MapPin, CreditCard, 
  FileText, AlertCircle, Loader2, ShieldCheck, Copy, History, Search, 
  RefreshCw, Eye, ArrowLeft, CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight, FileCheck, X, Filter
} from 'lucide-react';
import { kycService } from '../../api/kycService';
import { toast } from 'react-toastify';
import { validateAadhaar, validatePAN, sanitizeDigits, sanitizePAN } from '../../utils/validation';
import PageHeader from '../../components/common/PageHeader';

const KycVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Read initial params from URL searchParams
  const tabParam = (searchParams.get('tab') || searchParams.get('view') || '').toLowerCase();
  const initialTab = (tabParam === 'history' || tabParam === 'pan' || tabParam === 'aadhaar')
    ? tabParam
    : (searchParams.get('refid') || location.state?.refid ? 'history' : 'aadhaar');

  const initialSearch = searchParams.get('search') || '';
  const initialDoc = (searchParams.get('doc') || searchParams.get('documentType') || 'ALL').toUpperCase();
  const initialStatus = (searchParams.get('status') || 'ALL').toUpperCase();
  const initialStartDate = searchParams.get('startDate') || '';
  const initialEndDate = searchParams.get('endDate') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialRefId = searchParams.get('refid') || location.state?.refid || '';

  const [step, setStep] = useState(initialRefId ? 'result' : 'form'); // 'form' or 'result'
  const [activeTab, setActiveTab] = useState(initialTab); // 'aadhaar' | 'pan' | 'history'
  
  // 3-part 4-4-4 Aadhaar state
  const [aadhaarParts, setAadhaarParts] = useState(['', '', '']);
  const part1Ref = useRef(null);
  const part2Ref = useRef(null);
  const part3Ref = useRef(null);

  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    panNumber: '',
  });

  const [touched, setTouched] = useState({
    aadhaar: false,
    pan: false,
  });
  
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [fullReportRecord, setFullReportRecord] = useState(null);
  const [currentRefId, setCurrentRefId] = useState(initialRefId || null);

  // History State with Server Pagination & Filters (API 4.5)
  const [historyList, setHistoryList] = useState([]);
  const [backendStats, setBackendStats] = useState(null);
  const [globalStats, setGlobalStats] = useState(null);
  const [historyPagination, setHistoryPagination] = useState({ total: 0, page: isNaN(initialPage) || initialPage < 1 ? 1 : initialPage, limit: 10, totalPages: 1 });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState(initialSearch);
  const [historyDocFilter, setHistoryDocFilter] = useState(initialDoc);
  const [historyStatusFilter, setHistoryStatusFilter] = useState(initialStatus);
  const [historyStartDate, setHistoryStartDate] = useState(initialStartDate);
  const [historyEndDate, setHistoryEndDate] = useState(initialEndDate);
  const [lookupRefId, setLookupRefId] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(isNaN(initialPage) || initialPage < 1 ? 1 : initialPage);
  const historyPerPage = 10;

  // Helper to update URL search parameters cleanly
  const updateUrl = useCallback((updates, replace = true) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === undefined || val === '' || val === 'ALL') {
          next.delete(key);
        } else {
          next.set(key, String(val));
        }
      });
      return next;
    }, { replace });
  }, [setSearchParams]);

  // Fetch overall global KYC stats on mount
  const fetchGlobalStats = useCallback(async () => {
    try {
      // Fetch unfiltered records with high limit to compute accurate global counts
      const res = await kycService.getKycHistory({ page: 1, limit: 100 });
      if (res && res.data) {
        const items = res.data.items || [];
        const total = res.data.pagination?.total || items.length;
        const verified = items.filter(i => (i.status || '').toUpperCase() === 'VERIFIED').length;
        const aadhaarVerified = items.filter(i => (i.documentType || '').toUpperCase() === 'AADHAAR' && (i.status || '').toUpperCase() === 'VERIFIED').length;
        const panVerified = items.filter(i => (i.documentType || '').toUpperCase() === 'PAN' && (i.status || '').toUpperCase() === 'VERIFIED').length;
        const failed = items.filter(i => {
          const s = (i.status || '').toUpperCase();
          return s === 'FAILED' || s === 'REJECTED';
        }).length;

        const bStats = res.data.stats;
        setGlobalStats({
          totalKyc: bStats?.totalKyc || total,
          verified: (bStats?.verified !== undefined && bStats.verified >= verified) ? bStats.verified : verified,
          aadhaarVerified: (bStats?.aadhaarVerified !== undefined && bStats.aadhaarVerified >= aadhaarVerified) ? bStats.aadhaarVerified : aadhaarVerified,
          panVerified: (bStats?.panVerified !== undefined && bStats.panVerified >= panVerified) ? bStats.panVerified : panVerified,
          failed: (bStats?.failed !== undefined && bStats.failed >= failed) ? bStats.failed : failed,
        });
      }
    } catch (e) {
      console.warn('Could not fetch global KYC stats:', e);
    }
  }, []);

  useEffect(() => {
    fetchGlobalStats();
  }, [fetchGlobalStats]);

  // Filter out failed records so they are never visible in the table
  const visibleHistoryList = useMemo(() => {
    return historyList.filter(item => {
      const st = (item.status || '').toUpperCase();
      return st !== 'FAILED' && st !== 'REJECTED';
    });
  }, [historyList]);

  // Load History from API 4.5: GET /v1/society/kyc-verification/history
  const fetchHistory = useCallback(async (pageNo = historyPage) => {
    setHistoryLoading(true);
    try {
      const params = {
        page: pageNo,
        limit: historyPerPage,
      };
      if (historySearch.trim()) params.search = historySearch.trim();
      if (historyDocFilter && historyDocFilter !== 'ALL') params.documentType = historyDocFilter;
      if (historyStatusFilter && historyStatusFilter !== 'ALL') params.status = historyStatusFilter;
      if (historyStartDate) {
        const startD = new Date(historyStartDate);
        startD.setHours(0, 0, 0, 0);
        params.startDate = startD.toISOString();
      }
      if (historyEndDate) {
        const endD = new Date(historyEndDate);
        endD.setHours(23, 59, 59, 999);
        params.endDate = endD.toISOString();
      }

      const res = await kycService.getKycHistory(params);
      if (res && res.data) {
        const items = res.data.items || (Array.isArray(res.data) ? res.data : []);
        // Strictly filter out failed records so failed data is never visible in the table
        const visibleItems = items.filter(item => {
          const st = (item.status || '').toUpperCase();
          return st !== 'FAILED' && st !== 'REJECTED';
        });
        setHistoryList(visibleItems);
        if (res.data.stats) {
          setBackendStats(res.data.stats);
          // If unfiltered query, keep globalStats up to date
          if ((!params.documentType || params.documentType === 'ALL') &&
              (!params.status || params.status === 'ALL') &&
              (!params.search)) {
            setGlobalStats(res.data.stats);
          }
        }
        if (res.data.pagination) {
          setHistoryPagination(res.data.pagination);
        } else {
          const totalCount = res.data.stats?.totalKyc || visibleItems.length;
          setHistoryPagination({
            total: totalCount,
            page: pageNo,
            limit: historyPerPage,
            totalPages: Math.ceil(totalCount / historyPerPage) || 1,
          });
        }
      }
    } catch (err) {
      console.warn('Failed to load KYC verification history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage, historyPerPage, historySearch, historyDocFilter, historyStatusFilter, historyStartDate, historyEndDate]);

  // Handle tab change and sync to URL
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (newTab === 'history') {
      updateUrl({
        tab: 'history',
        doc: historyDocFilter !== 'ALL' ? historyDocFilter : null,
        status: historyStatusFilter !== 'ALL' ? historyStatusFilter : null,
        search: historySearch.trim() || null,
        startDate: historyStartDate || null,
        endDate: historyEndDate || null,
        page: historyPage > 1 ? historyPage : null,
        refid: null,
      });
    } else {
      updateUrl({
        tab: newTab,
        doc: null,
        status: null,
        search: null,
        startDate: null,
        endDate: null,
        page: null,
        refid: null,
      });
      handleReset();
    }
  };

  // Determine which KPI card is currently active (if on History tab)
  const activeKpiCard = useMemo(() => {
    if (activeTab !== 'history') return null;
    if (historyDocFilter === 'AADHAAR' && historyStatusFilter === 'VERIFIED') return 'AADHAAR_VERIFIED';
    if (historyDocFilter === 'PAN' && historyStatusFilter === 'VERIFIED') return 'PAN_VERIFIED';
    if (historyDocFilter === 'ALL' && historyStatusFilter === 'VERIFIED') return 'VERIFIED';
    if (historyDocFilter === 'ALL' && historyStatusFilter === 'ALL' && !historySearch && !historyStartDate && !historyEndDate) return 'ALL';
    return null;
  }, [activeTab, historyDocFilter, historyStatusFilter, historySearch, historyStartDate, historyEndDate]);

  // Quick filter from top KPI stat cards with toggle capability
  const handleCardFilterClick = (cardKey) => {
    // If clicking an already active filtered card, toggle back to ALL
    if (activeTab === 'history' && activeKpiCard === cardKey && cardKey !== 'ALL') {
      setHistoryDocFilter('ALL');
      setHistoryStatusFilter('ALL');
      setHistorySearch('');
      setHistoryPage(1);
      setActiveTab('history');
      updateUrl({
        tab: 'history',
        doc: null,
        status: null,
        search: null,
        startDate: historyStartDate || null,
        endDate: historyEndDate || null,
        page: null,
        refid: null,
      });
      return;
    }

    let nextDoc = 'ALL';
    let nextStatus = 'ALL';

    if (cardKey === 'VERIFIED') {
      nextStatus = 'VERIFIED';
    } else if (cardKey === 'AADHAAR_VERIFIED') {
      nextDoc = 'AADHAAR';
      nextStatus = 'VERIFIED';
    } else if (cardKey === 'PAN_VERIFIED') {
      nextDoc = 'PAN';
      nextStatus = 'VERIFIED';
    }

    setHistoryDocFilter(nextDoc);
    setHistoryStatusFilter(nextStatus);
    setHistorySearch('');
    setHistoryPage(1);
    setActiveTab('history');
    updateUrl({
      tab: 'history',
      doc: nextDoc !== 'ALL' ? nextDoc : null,
      status: nextStatus !== 'ALL' ? nextStatus : null,
      search: null,
      startDate: historyStartDate || null,
      endDate: historyEndDate || null,
      page: null,
      refid: null,
    });
  };

  // Sync state when URL params change (e.g., Browser Back/Forward navigation)
  useEffect(() => {
    const tabFromUrl = (searchParams.get('tab') || searchParams.get('view') || '').toLowerCase();
    const targetTab = (tabFromUrl === 'history' || tabFromUrl === 'pan' || tabFromUrl === 'aadhaar')
      ? tabFromUrl
      : (searchParams.get('refid') ? 'history' : 'aadhaar');

    if (activeTab !== targetTab) {
      setActiveTab(targetTab);
    }

    const refidParam = searchParams.get('refid');
    if (refidParam && refidParam !== currentRefId) {
      handleLookupReport(refidParam, false);
    } else if (!refidParam && step === 'result' && !location.state?.refid) {
      setStep('form');
      setCurrentRefId(null);
    }
  }, [searchParams]);

  // Sync history filters to URL
  useEffect(() => {
    if (activeTab === 'history') {
      updateUrl({
        tab: 'history',
        doc: historyDocFilter !== 'ALL' ? historyDocFilter : null,
        status: historyStatusFilter !== 'ALL' ? historyStatusFilter : null,
        search: historySearch.trim() || null,
        startDate: historyStartDate || null,
        endDate: historyEndDate || null,
        page: historyPage > 1 ? historyPage : null,
      });
    }
  }, [activeTab, historyPage, historySearch, historyDocFilter, historyStatusFilter, historyStartDate, historyEndDate, updateUrl]);

  // Trigger fetch with debounce on filter/page updates
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory(historyPage);
    }, 300);
    return () => clearTimeout(timer);
  }, [historyPage, historySearch, historyDocFilter, historyStatusFilter, historyStartDate, historyEndDate]);

  // Check if returning from callback with a refid
  useEffect(() => {
    if (location.state?.refid) {
      const fetchReport = async () => {
        setLoading(true);
        try {
          const response = await kycService.getKycReport(location.state.refid);
          if (response.success && response.data) {
            setFullReportRecord(response.data);
            setReportData(response.data.personalDetails || response.data);
            setCurrentRefId(response.data.refid || location.state.refid);
            setActiveTab(response.data.documentType ? response.data.documentType.toLowerCase() : 'aadhaar');
            setStep('result');
            fetchHistory();
            window.history.replaceState({}, document.title);
          }
        } catch (error) {
          toast.error('Failed to load KYC report.');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchReport();
    }
  }, [location.state]);

  // Handle direct lookup by refid (4.3 Get KYC Report)
  const handleLookupReport = async (refIdToLookup, shouldUpdateUrl = true) => {
    const targetRefId = (refIdToLookup || lookupRefId).trim();
    if (!targetRefId) {
      toast.warn('Please enter a valid Reference ID to lookup.');
      return;
    }

    setLookupLoading(true);
    try {
      const response = await kycService.getKycReport(targetRefId);
      if (response.success && response.data) {
        setFullReportRecord(response.data);
        setReportData(response.data.personalDetails || response.data);
        setCurrentRefId(response.data.refid || targetRefId);
        setActiveTab(response.data.documentType ? response.data.documentType.toLowerCase() : 'aadhaar');
        setStep('result');
        if (shouldUpdateUrl) {
          updateUrl({ refid: response.data.refid || targetRefId });
        }
        toast.success(response.message || 'KYC verification report retrieved successfully.');
        fetchHistory();
      } else {
        toast.error(response.message || 'Verification record not found for this Reference ID.');
      }
    } catch (error) {
      console.error('Lookup error:', error);
      const errMsg = error.response?.data?.message || 'Failed to retrieve report for this Reference ID.';
      toast.error(errMsg);
    } finally {
      setLookupLoading(false);
    }
  };

  // Handle 4-4-4 Aadhaar input changes
  const handleAadhaarPartChange = (index, value) => {
    const clean = sanitizeDigits(value, 4);
    const newParts = [...aadhaarParts];
    newParts[index] = clean;
    setAadhaarParts(newParts);

    const fullAadhaar = newParts.join('');
    setFormData((prev) => ({ ...prev, aadhaarNumber: fullAadhaar }));
    setTouched((prev) => ({ ...prev, aadhaar: true }));

    // Auto-focus next input when 4 digits are typed
    if (clean.length === 4) {
      if (index === 0 && part2Ref.current) {
        part2Ref.current.focus();
      } else if (index === 1 && part3Ref.current) {
        part3Ref.current.focus();
      }
    }
  };

  // Handle backspace navigation across 4-4-4 Aadhaar inputs
  const handleAadhaarKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !aadhaarParts[index]) {
      if (index === 1 && part1Ref.current) {
        part1Ref.current.focus();
      } else if (index === 2 && part2Ref.current) {
        part2Ref.current.focus();
      }
    }
  };

  // Handle pasting full 12-digit Aadhaar
  const handleAadhaarPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text') || '';
    const digits = sanitizeDigits(pasted, 12);
    if (!digits) return;

    const p1 = digits.slice(0, 4);
    const p2 = digits.slice(4, 8);
    const p3 = digits.slice(8, 12);

    setAadhaarParts([p1, p2, p3]);
    setFormData((prev) => ({ ...prev, aadhaarNumber: digits }));
    setTouched((prev) => ({ ...prev, aadhaar: true }));

    if (p3.length > 0 && part3Ref.current) {
      part3Ref.current.focus();
    } else if (p2.length > 0 && part2Ref.current) {
      part2Ref.current.focus();
    }
  };

  // Handle PAN input typing & sanitization
  const handlePanChange = (e) => {
    const val = e.target.value || '';
    const clean = sanitizePAN(val);
    setFormData((prev) => ({ ...prev, panNumber: clean }));
    setTouched((prev) => ({ ...prev, pan: true }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Real-time validation results
  const aadhaarValidation = validateAadhaar(formData.aadhaarNumber, { required: false });
  const panValidation = validatePAN(formData.panNumber, { required: false });

  const isAadhaarValid = formData.aadhaarNumber.length === 12 && aadhaarValidation.isValid;
  const isPanValid = formData.panNumber.length === 10 && panValidation.isValid;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConsentChecked) {
      toast.warn('Please give your consent to verify identity via DigiLocker.');
      return;
    }

    const idNumber = activeTab === 'aadhaar' ? formData.aadhaarNumber : formData.panNumber;

    // Strict frontend validation
    if (activeTab === 'aadhaar') {
      const validation = validateAadhaar(idNumber);
      if (!validation.isValid) {
        setTouched((prev) => ({ ...prev, aadhaar: true }));
        toast.error(validation.error || 'Aadhaar number must be exactly 12 digits');
        return;
      }
    } else if (activeTab === 'pan') {
      const validation = validatePAN(idNumber);
      if (!validation.isValid) {
        setTouched((prev) => ({ ...prev, pan: true }));
        toast.error(validation.error || 'Invalid PAN number format (e.g. ABCDE1234F)');
        return;
      }
    }

    setLoading(true);
    try {
      let redirectUrl = import.meta.env.VITE_KYC_REDIRECT_URL;
      if (!redirectUrl || !redirectUrl.startsWith('http')) {
        redirectUrl = `${window.location.origin}/kyc/callback`;
      }
      
      const payload = {
        documentType: activeTab.toUpperCase(),
        idNumber: idNumber.toUpperCase(),
        consent: isConsentChecked,
        redirectUrl,
      };

      const response = await kycService.initiateKyc(payload);
      
      if (response.success && response.data) {
        if (response.data.alreadyVerified) {
          toast.info('This document is already verified.');
          setFullReportRecord(response.data);
          setReportData(response.data.personalDetails || response.data);
          setCurrentRefId(response.data.refid);
          setStep('result');
          fetchHistory();
        } else if (response.data.status === 'INITIATED') {
          sessionStorage.setItem('kyc_refid', response.data.refid);
          sessionStorage.setItem('kyc_requested_id', idNumber.toUpperCase());
          sessionStorage.setItem('kyc_requested_doc_type', activeTab.toUpperCase());
          fetchHistory();
          
          // 1. Ensure OAuth URL forces fresh login prompt and pre-fills the entered ID
          let authUrl = response.data.authorizationUrl;
          if (authUrl) {
            try {
              const urlObj = new URL(authUrl);
              urlObj.searchParams.set('prompt', 'login');
              urlObj.searchParams.set('login_hint', idNumber.toUpperCase());
              authUrl = urlObj.toString();
            } catch (e) {
              authUrl += (authUrl.includes('?') ? '&' : '?') + 'prompt=login&login_hint=' + encodeURIComponent(idNumber.toUpperCase());
            }
          }

          // 2. Clear any active DigiLocker citizen session via invisible iframes and image pings
          const logoutEndpoints = [
            'https://accounts.digilocker.gov.in/logout',
            'https://digilocker.meripehchaan.gov.in/logout',
            'https://api.digitallocker.gov.in/public/oauth2/1/logout'
          ];

          try {
            logoutEndpoints.forEach((url) => {
              // Iframe ping
              const iframe = document.createElement('iframe');
              iframe.src = url;
              iframe.style.position = 'absolute';
              iframe.style.width = '0px';
              iframe.style.height = '0px';
              iframe.style.border = 'none';
              iframe.style.display = 'none';
              document.body.appendChild(iframe);

              // Image ping (fires cross-origin cookie destruction)
              const img = new Image();
              img.src = `${url}?t=${Date.now()}`;
            });
          } catch (logoutErr) {
            console.warn('Could not pre-clear DigiLocker session:', logoutErr);
          }

          // 3. Allow 700ms for DigiLocker session to clear, then redirect to fresh login
          setTimeout(() => {
            window.location.href = authUrl;
          }, 700);
        }
      }
    } catch (error) {
      const serverMsg = error.response?.data?.message;
      if (serverMsg && serverMsg.includes('DigiLocker API request failed')) {
        toast.error('DigiLocker Gateway error (403 Forbidden). Please ensure backend server IP and DigiLocker credentials are valid.');
      } else {
        toast.error(serverMsg || error.message || 'Failed to initiate KYC. Please try again.');
      }
      console.error('KYC Initiation Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAadhaarParts(['', '', '']);
    setFormData({
      aadhaarNumber: '',
      panNumber: '',
    });
    setTouched({
      aadhaar: false,
      pan: false,
    });
    setIsConsentChecked(false);
    setReportData(null);
    setFullReportRecord(null);
    setCurrentRefId(null);
    setLookupRefId('');
    setStep('form');
    updateUrl({ refid: null });
    // Clear router state to prevent old refid from reloading
    if (location.state) {
      window.history.replaceState({}, document.title);
    }
  };

  const [copiedRef, setCopiedRef] = useState(false);

  const handleCopyRef = (ref) => {
    if (!ref) return;
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    toast.success('Reference ID copied to clipboard');
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleDownload = async (docType) => {
    if (!currentRefId) return;
    const targetDoc = (docType || (activeTab === 'pan' ? 'PAN' : 'AADHAAR')).toUpperCase();
    try {
      setLoading(true);
      const blob = await kycService.downloadKycPdf(currentRefId, targetDoc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kyc_${targetDoc.toLowerCase()}_${currentRefId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${targetDoc} KYC PDF downloaded successfully.`);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to download ${targetDoc} PDF report.`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Metrics strictly taken from API response data.stats or globalStats
  const currentStats = globalStats || backendStats;
  const totalVerifications = currentStats?.totalKyc ?? historyPagination?.total ?? 0;
  const verifiedCount = currentStats?.verified ?? 0;
  const failedCount = currentStats?.failed ?? 0;
  const aadhaarVerificationsCount = currentStats?.aadhaarVerified ?? (currentStats?.aadhaar ?? 0);
  const panVerificationsCount = currentStats?.panVerified ?? (currentStats?.pan ?? 0);

  return (
    <div className="w-full h-full flex flex-col">
      {step === 'form' ? (
        <div className="flex flex-col gap-6 w-full">
          {/* Header */}
          <PageHeader
            title="KYC Verification & History"
            breadcrumbs={[
              { label: "Dashboard", to: "/dashboard" },
              { label: "Verification" },
              { label: "KYC Verification" }
            ]}
            showBack={false}
            backUrl="/dashboard"
          />

          {/* Stats Summary Cards (Matching Backend Keys: totalKyc, verified, aadhaarVerified, panVerified) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Total Verifications Done */}
            <div 
              onClick={() => handleCardFilterClick('ALL')}
              title={activeKpiCard === 'ALL' ? 'Showing all KYC requests' : 'Click to view all KYC requests in history'}
              className={`p-4.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                activeKpiCard === 'ALL'
                  ? 'bg-blue-50/60 border-2 border-[#225091] ring-3 ring-blue-500/20 shadow-sm'
                  : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-xs shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  activeKpiCard === 'ALL' ? 'text-[#225091]' : 'text-gray-500 group-hover:text-[#225091]'
                }`}>
                  Total KYC Requests
                </span>
                {activeKpiCard === 'ALL' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#225091] text-white flex items-center gap-1 shadow-2xs">
                    ✓ All Records
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-gray-400 group-hover:text-[#225091] transition-colors">
                    Click to view
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">{totalVerifications}</span>
                  <span className="text-[11px] font-medium text-gray-400">total</span>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  activeKpiCard === 'ALL'
                    ? 'bg-[#225091] text-white shadow-xs'
                    : 'bg-blue-50 text-[#225091] group-hover:bg-[#225091] group-hover:text-white'
                }`}>
                  <FileCheck size={22} />
                </div>
              </div>
            </div>

            {/* Verified Successfully */}
            <div 
              onClick={() => handleCardFilterClick('VERIFIED')}
              title={activeKpiCard === 'VERIFIED' ? 'Filter active. Click to clear filter' : 'Click to filter verified KYC requests'}
              className={`p-4.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                activeKpiCard === 'VERIFIED'
                  ? 'bg-emerald-50/60 border-2 border-emerald-600 ring-3 ring-emerald-500/20 shadow-sm'
                  : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-xs shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  Verified
                </span>
                {activeKpiCard === 'VERIFIED' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
                    ✓ Filter Active
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-gray-400 group-hover:text-emerald-700 transition-colors">
                    Click to filter
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-700">{verifiedCount}</span>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {totalVerifications > 0 ? `${Math.round((verifiedCount / totalVerifications) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  activeKpiCard === 'VERIFIED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                }`}>
                  <CheckCircle2 size={22} />
                </div>
              </div>
            </div>

            {/* Aadhaar Verifications */}
            <div 
              onClick={() => handleCardFilterClick('AADHAAR_VERIFIED')}
              title={activeKpiCard === 'AADHAAR_VERIFIED' ? 'Filter active. Click to clear filter' : 'Click to filter Aadhaar verified requests'}
              className={`p-4.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                activeKpiCard === 'AADHAAR_VERIFIED'
                  ? 'bg-cyan-50/60 border-2 border-cyan-600 ring-3 ring-cyan-500/20 shadow-sm'
                  : 'bg-white border-gray-100 hover:border-cyan-200 hover:shadow-xs shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-cyan-800 uppercase tracking-wider">
                  Aadhaar Verified
                </span>
                {activeKpiCard === 'AADHAAR_VERIFIED' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-600 text-white flex items-center gap-1 shadow-2xs">
                    ✓ Filter Active
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-gray-400 group-hover:text-cyan-700 transition-colors">
                    Click to filter
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-cyan-800">{aadhaarVerificationsCount}</span>
                  <span className="text-[11px] font-medium text-gray-400">UIDAI</span>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  activeKpiCard === 'AADHAAR_VERIFIED'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-cyan-50 text-cyan-700 group-hover:bg-cyan-700 group-hover:text-white'
                }`}>
                  <CreditCard size={22} />
                </div>
              </div>
            </div>

            {/* PAN Verifications */}
            <div 
              onClick={() => handleCardFilterClick('PAN_VERIFIED')}
              title={activeKpiCard === 'PAN_VERIFIED' ? 'Filter active. Click to clear filter' : 'Click to filter PAN verified requests'}
              className={`p-4.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                activeKpiCard === 'PAN_VERIFIED'
                  ? 'bg-indigo-50/60 border-2 border-indigo-600 ring-3 ring-indigo-500/20 shadow-sm'
                  : 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-xs shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
                  PAN Verified
                </span>
                {activeKpiCard === 'PAN_VERIFIED' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1 shadow-2xs">
                    ✓ Filter Active
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-gray-400 group-hover:text-indigo-700 transition-colors">
                    Click to filter
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-indigo-800">{panVerificationsCount}</span>
                  <span className="text-[11px] font-medium text-gray-400">ITD</span>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  activeKpiCard === 'PAN_VERIFIED'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-700 group-hover:text-white'
                }`}>
                  <FileText size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTabChange('aadhaar')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'aadhaar'
                    ? 'bg-[#225091] text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <CreditCard size={18} />
                Aadhaar Verification
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('pan')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'pan'
                    ? 'bg-[#225091] text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <FileText size={18} />
                PAN Verification
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('history')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-[#225091] text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <History size={18} />
                <span>Verification History</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                }`}>
                  {totalVerifications}
                </span>
              </button>
            </div>

            {/* Quick Ref ID Search / Fetch Form in Tab bar */}
            {activeTab !== 'history' && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={lookupRefId}
                    onChange={(e) => setLookupRefId(e.target.value)}
                    placeholder="Search Reference ID (KYC_...)"
                    className="pl-8 pr-3 py-2 text-xs border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#225091] w-56 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleLookupReport()}
                  disabled={lookupLoading || !lookupRefId.trim()}
                  className="px-3 py-2 rounded-lg bg-[#225091] text-white text-xs font-semibold hover:bg-[#193e73] transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {lookupLoading ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
                  <span>Get Report</span>
                </button>
              </div>
            )}
          </div>

          {/* Form Container (Aadhaar or PAN) */}
          {(activeTab === 'aadhaar' || activeTab === 'pan') && (
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#e6f4f5] to-blue-50/40 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#225091] flex items-center gap-2">
                    {activeTab === 'aadhaar' ? <CreditCard size={20} /> : <FileText size={20} />}
                    {activeTab === 'aadhaar' ? 'Instant Aadhaar Paperless e-KYC' : 'Instant PAN Verification'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activeTab === 'aadhaar' 
                      ? 'Authenticate directly from the UIDAI Aadhaar repository via DigiLocker.'
                      : 'Verify identity and PAN status directly against Income Tax Department records.'}
                  </p>
                </div>
                <span className="text-[11px] font-semibold bg-[#225091]/10 text-[#225091] px-2.5 py-1 rounded-full border border-[#225091]/20">
                  DigiLocker 2.0 API
                </span>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8">
                <div className="max-w-xl space-y-2 mb-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700 block">
                      {activeTab === 'aadhaar' ? 'Aadhaar Number (4-4-4 Digits)' : 'Permanent Account Number (PAN)'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <span className="text-xs text-gray-400 font-mono">
                      {activeTab === 'aadhaar' 
                        ? `${formData.aadhaarNumber.length}/12 digits` 
                        : `${formData.panNumber.length}/10 characters`}
                    </span>
                  </div>

                  {/* 4-4-4 Digit Aadhaar Input Layout */}
                  {activeTab === 'aadhaar' ? (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <input
                        ref={part1Ref}
                        type="text"
                        name="aadhaarPart1"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={aadhaarParts[0]}
                        onChange={(e) => handleAadhaarPartChange(0, e.target.value)}
                        onKeyDown={(e) => handleAadhaarKeyDown(0, e)}
                        onPaste={handleAadhaarPaste}
                        onBlur={() => handleBlur('aadhaar')}
                        placeholder="1234"
                        className={`w-28 sm:w-32 text-center text-lg font-mono tracking-widest px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#225091] focus:border-transparent transition-all shadow-xs ${
                          touched.aadhaar && (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12 || !aadhaarValidation.isValid)
                            ? 'border-red-400 bg-red-50/20'
                            : 'border-gray-200 bg-gray-50/40'
                        }`}
                      />
                      <span className="text-gray-400 font-bold">-</span>
                      <input
                        ref={part2Ref}
                        type="text"
                        name="aadhaarPart2"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={aadhaarParts[1]}
                        onChange={(e) => handleAadhaarPartChange(1, e.target.value)}
                        onKeyDown={(e) => handleAadhaarKeyDown(1, e)}
                        onPaste={handleAadhaarPaste}
                        onBlur={() => handleBlur('aadhaar')}
                        placeholder="5678"
                        className={`w-28 sm:w-32 text-center text-lg font-mono tracking-widest px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#225091] focus:border-transparent transition-all shadow-xs ${
                          touched.aadhaar && (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12 || !aadhaarValidation.isValid)
                            ? 'border-red-400 bg-red-50/20'
                            : 'border-gray-200 bg-gray-50/40'
                        }`}
                      />
                      <span className="text-gray-400 font-bold">-</span>
                      <input
                        ref={part3Ref}
                        type="text"
                        name="aadhaarPart3"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        value={aadhaarParts[2]}
                        onChange={(e) => handleAadhaarPartChange(2, e.target.value)}
                        onKeyDown={(e) => handleAadhaarKeyDown(2, e)}
                        onPaste={handleAadhaarPaste}
                        onBlur={() => handleBlur('aadhaar')}
                        placeholder="9012"
                        className={`w-28 sm:w-32 text-center text-lg font-mono tracking-widest px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#225091] focus:border-transparent transition-all shadow-xs ${
                          touched.aadhaar && (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12 || !aadhaarValidation.isValid)
                            ? 'border-red-400 bg-red-50/20'
                            : 'border-gray-200 bg-gray-50/40'
                        }`}
                      />
                    </div>
                  ) : (
                    /* Standard PAN Input with live uppercase sanitization & validation */
                    <div className="relative">
                      <input
                        type="text"
                        name="panNumber"
                        id="panNumber"
                        maxLength={10}
                        value={formData.panNumber}
                        onChange={handlePanChange}
                        onBlur={() => handleBlur('pan')}
                        placeholder="e.g. ABCDE1234F"
                        autoComplete="off"
                        className={`w-full text-base font-mono tracking-wider px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#225091] focus:border-transparent uppercase transition-all shadow-xs ${
                          touched.pan && (!formData.panNumber || !panValidation.isValid)
                            ? 'border-red-400 bg-red-50/20'
                            : isPanValid
                            ? 'border-emerald-400 bg-emerald-50/10'
                            : 'border-gray-200 bg-gray-50/40'
                        }`}
                      />
                    </div>
                  )}

                  {/* Validation Messages for Aadhaar */}
                  {touched.aadhaar && activeTab === 'aadhaar' && (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12 || !aadhaarValidation.isValid) && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle size={14} className="shrink-0" /> {aadhaarValidation.error || 'Please enter a valid 12-digit Aadhaar number.'}
                    </p>
                  )}
                  {isAadhaarValid && activeTab === 'aadhaar' && (
                    <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1 font-medium">
                      <CheckCircle size={14} className="shrink-0" /> Valid 12-digit Aadhaar format.
                    </p>
                  )}

                  {/* Validation Messages for PAN */}
                  {touched.pan && activeTab === 'pan' && (!formData.panNumber || !panValidation.isValid) && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle size={14} className="shrink-0" /> {panValidation.error || 'Invalid PAN format. Must be 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).'}
                    </p>
                  )}
                  {isPanValid && activeTab === 'pan' && (
                    <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1 font-medium">
                      <CheckCircle size={14} className="shrink-0" /> Valid PAN format.
                    </p>
                  )}
                </div>

                {/* Consent Box */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-w-xl mb-8 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    checked={isConsentChecked}
                    onChange={(e) => setIsConsentChecked(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#225091] focus:ring-[#225091] cursor-pointer"
                  />
                  <label htmlFor="consent" className="text-xs text-gray-600 leading-relaxed cursor-pointer select-none">
                    I hereby give my explicit consent to fetch and verify identity documents directly from the official DigiLocker repository for KYC verification purposes.
                  </label>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl text-gray-600 font-semibold border border-gray-200 hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                  >
                    Reset Form
                  </button>
                  <button
                    type="submit"
                    disabled={
                      loading || 
                      !isConsentChecked || 
                      (activeTab === 'aadhaar' ? !isAadhaarValid : !isPanValid)
                    }
                    className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#225091] text-white font-semibold hover:bg-[#163a6c] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs text-sm cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Connecting to DigiLocker...</span>
                      </>
                    ) : (
                      <span>Verify with DigiLocker</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Verification History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden flex flex-col gap-4 p-6">
              {/* Active Filter Notice Banner */}
              {activeKpiCard && activeKpiCard !== 'ALL' && (
                <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50/80 border border-blue-200 px-4 py-2.5 rounded-xl text-xs text-[#225091]">
                  <div className="flex items-center gap-2 font-medium">
                    <Filter size={15} className="text-[#225091] shrink-0" />
                    <span>
                      Filtered by Stat Card: <strong className="font-bold text-gray-900">
                        {activeKpiCard === 'VERIFIED' && 'Verified (All Documents)'}
                        {activeKpiCard === 'AADHAAR_VERIFIED' && 'Aadhaar Verified (UIDAI)'}
                        {activeKpiCard === 'PAN_VERIFIED' && 'PAN Verified (ITD)'}
                      </strong>
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px]">
                        {historyPagination.total} {historyPagination.total === 1 ? 'record' : 'records'}
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCardFilterClick('ALL')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-red-600 bg-white hover:bg-red-50 border border-gray-200 px-3 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  >
                    <X size={12} /> Reset to All Records
                  </button>
                </div>
              )}

              {/* Top History Controls Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Search box */}
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => { setHistorySearch(e.target.value); setHistoryPage(1); }}
                    placeholder="Search by Ref ID, Applicant Name, or Document Number..."
                    className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#225091] bg-gray-50/50"
                  />
                  {historySearch && (
                    <button
                      type="button"
                      onClick={() => { setHistorySearch(''); setHistoryPage(1); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filters and Refresh */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Doc Type Filter */}
                  <select
                    value={historyDocFilter}
                    onChange={(e) => { setHistoryDocFilter(e.target.value); setHistoryPage(1); }}
                    className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#225091] text-gray-700 cursor-pointer"
                  >
                    <option value="ALL">All Documents</option>
                    <option value="AADHAAR">Aadhaar Card</option>
                    <option value="PAN">PAN Card</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={historyStatusFilter}
                    onChange={(e) => { setHistoryStatusFilter(e.target.value); setHistoryPage(1); }}
                    className="px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#225091] text-gray-700 cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="INITIATED">Initiated</option>
                    <option value="EXPIRED">Expired</option>
                  </select>

                  {/* Date Filters */}
                  <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1">
                    <Calendar size={13} className="text-gray-400 shrink-0" />
                    <input
                      type="date"
                      value={historyStartDate}
                      onChange={(e) => { setHistoryStartDate(e.target.value); setHistoryPage(1); }}
                      title="Start Date"
                      className="text-xs bg-transparent text-gray-700 focus:outline-none cursor-pointer"
                    />
                    <span className="text-xs text-gray-400">to</span>
                    <input
                      type="date"
                      value={historyEndDate}
                      onChange={(e) => { setHistoryEndDate(e.target.value); setHistoryPage(1); }}
                      title="End Date"
                      className="text-xs bg-transparent text-gray-700 focus:outline-none cursor-pointer"
                    />
                    {(historyStartDate || historyEndDate) && (
                      <button
                        type="button"
                        onClick={() => { setHistoryStartDate(''); setHistoryEndDate(''); setHistoryPage(1); }}
                        title="Clear Date Filter"
                        className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Refresh Button */}
                  <button
                    type="button"
                    onClick={() => fetchHistory(historyPage)}
                    disabled={historyLoading}
                    title="Refresh History"
                    className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={16} className={historyLoading ? 'animate-spin text-[#225091]' : ''} />
                  </button>
                </div>
              </div>

              {/* Direct Lookup Box inside History */}
              <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/50 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-[#225091] shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Direct KYC Report Lookup</h4>
                    <p className="text-[11px] text-gray-500">
                      Enter any Reference ID to query official report record: <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[#225091]">GET /v1/society/kyc-verification/report/:refid</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={lookupRefId}
                    onChange={(e) => setLookupRefId(e.target.value)}
                    placeholder="Enter Reference ID e.g. KYC_17233..."
                    className="px-3.5 py-2 text-xs font-mono border border-blue-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#225091] w-full sm:w-64"
                  />
                  <button
                    type="button"
                    onClick={() => handleLookupReport()}
                    disabled={lookupLoading || !lookupRefId.trim()}
                    className="px-4 py-2 rounded-lg bg-[#225091] text-white text-xs font-semibold hover:bg-[#193e73] transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {lookupLoading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                    <span>Fetch Report</span>
                  </button>
                </div>
              </div>

              {/* History Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-100 mt-2">
                <table className="w-full border-collapse text-center text-sm whitespace-nowrap">
                  <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
                    <tr >
                      <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Reference ID</th>
                      <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Document Type</th>
                      <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Applicant / ID</th>
                      <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Created By</th>
                      <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Status</th>
                      <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Verified / Created Date</th>
                      <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {historyLoading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400">
                          <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#225091]" />
                          <span>Loading verification history...</span>
                        </td>
                      </tr>
                    ) : visibleHistoryList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                            <History size={24} />
                          </div>
                          <p className="text-sm font-semibold text-gray-700">No verification records found</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {historySearch || historyDocFilter !== 'ALL' || historyStatusFilter !== 'ALL' || historyStartDate || historyEndDate
                              ? 'Try adjusting your search terms or date filters.'
                              : 'Initiate a new KYC verification above to see its record history here.'}
                          </p>
                          {(activeTab === 'history' && totalVerifications === 0) && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('aadhaar')}
                              className="mt-3 px-4 py-2 rounded-lg bg-[#225091] text-white text-xs font-semibold hover:bg-[#193e73] transition-colors cursor-pointer"
                            >
                              Start Aadhaar Verification
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      visibleHistoryList.map((item, idx) => {
                        const ref = item.refid || 'N/A';
                        const doc = (item.documentType || (item.personalDetails?.aadhaarNumber ? 'AADHAAR' : 'PAN')).toUpperCase();
                        const name = item.personalDetails?.fullName || item.personalDetails?.name || item.name || 'N/A';
                        const maskedId = item.idNumber || item.personalDetails?.aadhaarNumber || item.personalDetails?.panNumber || '—';
                        const status = (item.status || (item.personalDetails ? 'VERIFIED' : 'INITIATED')).toUpperCase();
                        const creatorName = item.createdBy?.fullName || item.createdBy?.email || (item.requestById?.fullName ? `For: ${item.requestById.fullName}` : 'Self / Direct');
                        const dateVal = item.verifiedAt || item.createdAt || item.updatedAt;
                        const dateFormatted = dateVal ? new Date(dateVal).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : 'Recent';

                        const isVerified = status === 'VERIFIED' || status === 'SUCCESS';
                        const isFailed = status === 'FAILED' || status === 'REJECTED';
                        const isExpired = status === 'EXPIRED';

                        return (
                          <tr key={item._id || item.refid || idx} className="hover:bg-gray-50/70 transition-colors">
                            {/* Ref ID */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-gray-800">{ref}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyRef(ref)}
                                  title="Copy Ref ID"
                                  className="text-gray-400 hover:text-[#225091] transition-colors p-1 rounded hover:bg-gray-100 cursor-pointer"
                                >
                                  <Copy size={12} />
                                </button>
                              </div>
                            </td>

                            {/* Document Type */}
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                doc === 'AADHAAR' 
                                  ? 'bg-cyan-50 text-cyan-800 border border-cyan-200' 
                                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                              }`}>
                                {doc === 'AADHAAR' ? <CreditCard size={11} /> : <FileText size={11} />}
                                {doc}
                              </span>
                            </td>

                            {/* Applicant / ID */}
                            <td className="py-3 px-4">
                              <div>
                                <span className="font-semibold text-gray-900 block">{name}</span>
                                <span className="text-[11px] font-mono text-gray-400">{maskedId}</span>
                              </div>
                            </td>

                            {/* Created By */}
                            <td className="py-3 px-4">
                              <span className="text-gray-700 font-medium text-[11px] flex items-center gap-1">
                                <User size={12} className="text-gray-400 shrink-0" />
                                <span className="truncate max-w-[130px]" title={creatorName}>{creatorName}</span>
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isVerified
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isFailed
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : isExpired
                                  ? 'bg-gray-100 text-gray-600 border border-gray-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {isVerified ? <CheckCircle size={11} /> : isFailed ? <XCircle size={11} /> : <Clock size={11} />}
                                {status}
                              </span>
                              {isFailed && item.lastError && (
                                <p className="text-[10px] text-rose-600 font-medium mt-0.5 max-w-[170px] truncate" title={item.lastError}>
                                  {item.lastError}
                                </p>
                              )}
                            </td>

                            {/* Date */}
                            <td className="py-3 px-4 text-gray-500 text-[11px]">
                              {dateFormatted}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleLookupReport(ref)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#225091] text-white text-xs font-semibold hover:bg-[#193e73] transition-colors cursor-pointer"
                                  title="View Full KYC Report"
                                >
                                  <Eye size={12} />
                                  <span>View Report</span>
                                </button>
                                {isVerified && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      setCurrentRefId(ref);
                                      try {
                                        setLoading(true);
                                        const blob = await kycService.downloadKycPdf(ref, doc);
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.setAttribute('download', `kyc_${doc.toLowerCase()}_${ref}.pdf`);
                                        document.body.appendChild(link);
                                        link.click();
                                        link.remove();
                                        window.URL.revokeObjectURL(url);
                                        toast.success(`${doc} PDF downloaded successfully.`);
                                      } catch (err) {
                                        toast.error('Failed to download PDF.');
                                      } finally {
                                        setLoading(false);
                                      }
                                    }}
                                    className="p-1 text-gray-500 hover:text-[#225091] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                    title="Download PDF"
                                  >
                                    <Download size={15} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Server-Side Pagination */}
              {historyPagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 pt-4 mt-2 gap-3">
                  <span className="text-xs text-gray-500">
                    Showing {(historyPagination.page - 1) * historyPagination.limit + 1} to {Math.min(historyPagination.page * historyPagination.limit, historyPagination.total)} of {historyPagination.total} records
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={historyPagination.page <= 1 || historyLoading}
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-700 rounded-lg">
                      Page {historyPagination.page} of {historyPagination.totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={historyPagination.page >= historyPagination.totalPages || historyLoading}
                      onClick={() => setHistoryPage((p) => Math.min(historyPagination.totalPages, p + 1))}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ================= RESULT / REPORT VIEW ================= */
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
          {/* Result Header */}
          <PageHeader
            title="KYC Verification Report"
            breadcrumbs={[
              { label: "Dashboard", to: "/dashboard" },
              { label: "Verification" },
              { label: "KYC Verification", to: "/kyc" },
              { label: currentRefId || "Report" }
            ]}
            showBack={false}
            onBack={() => { setStep('form'); setReportData(null); setFullReportRecord(null); setCurrentRefId(null); }}
          />

          {/* Success Banner */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <CheckCircle2 size={28} strokeWidth={2.5} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-emerald-950">Identity Verification Successful</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {fullReportRecord?.status || 'VERIFIED'}
                  </span>
                </div>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Authenticated and validated directly from official DigiLocker UIDAI / ITD repositories.
                </p>
              </div>
            </div>

            {currentRefId && (
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-emerald-200/60 shrink-0">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Session Reference ID</span>
                  <span className="text-xs font-mono font-bold text-gray-800">{currentRefId}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyRef(currentRefId)}
                  title="Copy Reference ID"
                  className="p-1.5 text-gray-400 hover:text-[#225091] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Copy size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Report Details Container */}
          {reportData && (
            <div className="space-y-6">
              {/* Top Identity & Status Summary */}
              <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#e6f4f5] to-blue-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={20} className="text-[#225091]" />
                    <h3 className="text-base font-bold text-[#225091]">Verified Applicant Details</h3>
                  </div>

                  {/* Document Badges */}
                  <div className="flex items-center gap-2">
                    {reportData.availableDocuments && reportData.availableDocuments.length > 0 ? (
                      reportData.availableDocuments.map((doc, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={12} /> {doc} Verified
                        </span>
                      ))
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 size={12} /> {fullReportRecord?.documentType || activeTab.toUpperCase()} Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Full Name */}
                    <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100/80">
                      <span className="text-xs text-gray-400 font-medium block mb-1">Full Name</span>
                      <span className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <User size={16} className="text-[#225091] shrink-0" />
                        {reportData.fullName || reportData.name || 'N/A'}
                      </span>
                    </div>

                    {/* Father's Name */}
                    <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100/80">
                      <span className="text-xs text-gray-400 font-medium block mb-1">Father's / Guardian Name</span>
                      <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Users size={16} className="text-[#225091] shrink-0" />
                        {reportData.fatherName || 'N/A'}
                      </span>
                    </div>

                    {/* Date of Birth */}
                    <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100/80">
                      <span className="text-xs text-gray-400 font-medium block mb-1">Date of Birth</span>
                      <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Calendar size={16} className="text-[#225091] shrink-0" />
                        {reportData.dob || 'N/A'}
                      </span>
                    </div>

                    {/* Gender */}
                    <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100/80">
                      <span className="text-xs text-gray-400 font-medium block mb-1">Gender</span>
                      <span className="text-sm font-bold text-gray-800 capitalize flex items-center gap-2">
                        <User size={16} className="text-[#225091] shrink-0" />
                        {reportData.gender || 'N/A'}
                      </span>
                    </div>

                    {/* Aadhaar Number */}
                    <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400 font-medium">Aadhaar Number</span>
                        {(reportData.aadhaarVerified || reportData.aadhaarStatus === 'VERIFIED') && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {reportData.aadhaarStatus || 'VERIFIED'}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold font-mono text-gray-800 flex items-center gap-2">
                        <CreditCard size={16} className="text-[#225091] shrink-0" />
                        {reportData.aadhaarNumber || (fullReportRecord?.documentType === 'AADHAAR' ? fullReportRecord?.idNumber : 'N/A')}
                      </span>
                    </div>

                    {/* PAN Number */}
                    <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400 font-medium">PAN Number</span>
                        {(reportData.panVerified || reportData.panStatus === 'VERIFIED') && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {reportData.panStatus || 'VERIFIED'}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold font-mono text-gray-800 flex items-center gap-2">
                        <FileText size={16} className="text-[#225091] shrink-0" />
                        {reportData.panNumber || (fullReportRecord?.documentType === 'PAN' ? fullReportRecord?.idNumber : 'N/A')}
                      </span>
                    </div>

                    {/* Address Full Width */}
                    {reportData.address && (
                      <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100/80 md:col-span-2 lg:col-span-3">
                        <span className="text-xs text-gray-400 font-medium block mb-1">Permanent Registered Address</span>
                        <div className="flex items-start gap-2.5 mt-1">
                          <MapPin size={18} className="text-[#225091] shrink-0 mt-0.5" />
                          <span className="text-sm font-medium text-gray-800 leading-relaxed">
                            {typeof reportData.address === 'string'
                              ? reportData.address
                              : `${reportData.address.line1 || ''} ${reportData.address.line2 || ''}, ${reportData.address.city || ''} ${reportData.address.state || ''} - ${reportData.address.pincode || ''}`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Verified Document Cards & Download Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Aadhaar Verification Status Card */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  reportData.aadhaarVerified || reportData.aadhaarNumber || fullReportRecord?.documentType === 'AADHAAR'
                    ? 'bg-white border-emerald-200 shadow-xs'
                    : 'bg-gray-50/50 border-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        reportData.aadhaarVerified || reportData.aadhaarNumber || fullReportRecord?.documentType === 'AADHAAR'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Aadhaar Card Record</h4>
                        <span className="text-xs font-mono text-gray-500">
                          {reportData.aadhaarNumber || (fullReportRecord?.documentType === 'AADHAAR' ? fullReportRecord?.idNumber : 'Not provided in this session')}
                        </span>
                      </div>
                    </div>

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      reportData.aadhaarVerified || reportData.aadhaarStatus === 'VERIFIED' || fullReportRecord?.documentType === 'AADHAAR'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {reportData.aadhaarStatus || (reportData.aadhaarVerified || fullReportRecord?.documentType === 'AADHAAR' ? 'VERIFIED' : 'UNAVAILABLE')}
                    </span>
                  </div>

                  {(reportData.aadhaarVerified || reportData.aadhaarNumber || fullReportRecord?.documentType === 'AADHAAR') && (
                    <button
                      type="button"
                      onClick={() => handleDownload('AADHAAR')}
                      disabled={loading}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Download Aadhaar KYC PDF</span>
                    </button>
                  )}
                </div>

                {/* PAN Verification Status Card */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  reportData.panVerified || reportData.panNumber || fullReportRecord?.documentType === 'PAN'
                    ? 'bg-white border-blue-200 shadow-xs'
                    : 'bg-gray-50/50 border-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        reportData.panVerified || reportData.panNumber || fullReportRecord?.documentType === 'PAN'
                          ? 'bg-blue-100 text-[#225091]'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">PAN Card Record</h4>
                        <span className="text-xs font-mono text-gray-500">
                          {reportData.panNumber || (fullReportRecord?.documentType === 'PAN' ? fullReportRecord?.idNumber : 'Not provided in this session')}
                        </span>
                      </div>
                    </div>

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      reportData.panVerified || reportData.panStatus === 'VERIFIED' || fullReportRecord?.documentType === 'PAN'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {reportData.panStatus || (reportData.panVerified || fullReportRecord?.documentType === 'PAN' ? 'VERIFIED' : 'UNAVAILABLE')}
                    </span>
                  </div>

                  {(reportData.panVerified || reportData.panNumber || fullReportRecord?.documentType === 'PAN') && (
                    <button
                      type="button"
                      onClick={() => handleDownload('PAN')}
                      disabled={loading}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#225091] font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Download PAN KYC PDF</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setStep('form'); handleReset(); }}
                    className="px-6 py-2.5 rounded-xl text-gray-700 font-semibold border border-gray-200 hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                  >
                    Verify Another Document
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep('form'); setActiveTab('history'); fetchHistory(); }}
                    className="px-5 py-2.5 rounded-xl text-[#225091] bg-blue-50 hover:bg-blue-100 font-semibold transition-colors text-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <History size={16} />
                    <span>View All History</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(activeTab.toUpperCase())}
                  disabled={loading}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#225091] text-white font-bold hover:bg-[#163a6c] transition-all shadow-sm text-sm cursor-pointer"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  <span>Download Full KYC Report PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KycVerification;
