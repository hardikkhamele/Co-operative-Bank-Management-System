import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  Printer, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Clock, 
  UserCheck, 
  MapPin, 
  Mail, 
  Calendar,
  Phone,
  Download,
  Search,
  X,
  RotateCcw,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  History,
  Sparkles,
  AlertTriangle,
  Loader2,
  CheckCircle,
  HelpCircle,
  Building,
  User,
  SlidersHorizontal,
  Info,
  BadgeCheck,
  TrendingUp,
  Wallet,
  Shield,
  Layers,
  FileCheck,
  Lock
} from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import TableWrapper from '../../components/common/TableWrapper';
import { verificationService } from '../../api/verificationService';
import { validatePAN, sanitizePAN } from '../../utils/validation';
import { Skeleton } from '../../components/common/Skeleton';

const CheckCibilScore = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const historyTableRef = useRef(null);

  // Read initial values from URL search params
  const tabParam = (searchParams.get('tab') || searchParams.get('view') || '').toLowerCase();
  const initialMainView = (tabParam === 'history' || tabParam === 'report-history' || tabParam === 'records')
    ? 'history'
    : 'check';
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || '';
  const initialStartDate = searchParams.get('startDate') || '';
  const initialEndDate = searchParams.get('endDate') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialReportId = searchParams.get('reportId') || searchParams.get('id') || null;

  // Main View: 'check' (Initiate / Live Result) or 'history' (Historical List)
  const [mainView, setMainView] = useState(initialMainView);

  // Check Form & Live Result State
  const [step, setStep] = useState('form'); // 'form' | 'result'
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [reportResult, setReportResult] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'accounts' | 'inquiries' | 'bureau'

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    panNumber: '',
    dob: '',
  });

  // History State
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [page, setPage] = useState(isNaN(initialPage) || initialPage < 1 ? 1 : initialPage);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: isNaN(initialPage) || initialPage < 1 ? 1 : initialPage,
    limit: 10,
    totalPages: 1
  });

  // Detail Modal State
  const [selectedReportId, setSelectedReportId] = useState(initialReportId);
  const [detailModalOpen, setDetailModalOpen] = useState(Boolean(initialReportId));
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailReport, setDetailReport] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');

  // Helper to update URL search parameters cleanly
  const updateUrl = (updates, replace = true) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === undefined || val === '') {
          next.delete(key);
        } else {
          next.set(key, String(val));
        }
      });
      return next;
    }, { replace });
  };

  // Restore saved form or result from session storage
  useEffect(() => {
    const savedStep = sessionStorage.getItem('cibil_step');
    const savedReport = sessionStorage.getItem('cibil_reportData');
    const savedForm = sessionStorage.getItem('cibil_formData');

    if (savedStep === 'result' && savedReport && savedForm) {
      try {
        setReportResult(JSON.parse(savedReport));
        setFormData(JSON.parse(savedForm));
        setStep('result');
      } catch (e) {
        console.error("Failed to parse saved CIBIL data", e);
      }
    }
  }, []);

  // Header Back Button Handler: Handles all states cleanly
  const handleHeaderBack = () => {
    if (detailModalOpen) {
      handleCloseDetail();
    } else if (mainView === 'check' && step === 'result') {
      handleReset();
    } else if (mainView === 'history') {
      handleTabChange('check');
    } else {
      navigate('/dashboard');
    }
  };

  // Debounce search in history
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch History List
  const fetchHistory = async (pageNo = page) => {
    setHistoryLoading(true);
    try {
      const params = {
        page: pageNo,
        limit
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (statusFilter) params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await verificationService.getHistory(params);
      if (response && (response.success || response.statusCode === 200)) {
        const payload = response.data || response;
        const items = payload.items || payload.data || (Array.isArray(payload) ? payload : []);
        setHistoryList(Array.isArray(items) ? items : []);
        
        const pag = payload.pagination || payload.meta || {
          total: Array.isArray(items) ? items.length : 0,
          page: pageNo,
          limit,
          totalPages: Math.ceil((Array.isArray(items) ? items.length : 0) / limit) || 1
        };
        setPagination(pag);
      } else {
        setHistoryList([]);
      }
    } catch (err) {
      console.error("Failed to fetch CIBIL report history", err);
      if (err.response?.status === 403) {
        toast.error("Permission denied: You do not have permission to view CIBIL history.");
      }
      setHistoryList([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle tab change and sync to URL
  const handleTabChange = (view) => {
    setMainView(view);
    if (view === 'history') {
      updateUrl({
        tab: 'history',
        view: null,
        page: page > 1 ? page : null,
        search: debouncedSearch.trim() || null,
        status: statusFilter || null,
        startDate: startDate || null,
        endDate: endDate || null
      });
      fetchHistory(page);
    } else {
      updateUrl({
        tab: 'check',
        view: null,
        page: null,
        search: null,
        status: null,
        startDate: null,
        endDate: null,
        reportId: null,
        id: null
      });
    }
  };

  // Sync state from URL when browser Back/Forward navigation occurs
  useEffect(() => {
    const currentTab = (searchParams.get('tab') || searchParams.get('view') || '').toLowerCase();
    const isHistory = currentTab === 'history' || currentTab === 'report-history' || currentTab === 'records';
    const targetView = isHistory ? 'history' : 'check';
    if (mainView !== targetView) {
      setMainView(targetView);
    }

    const reportIdParam = searchParams.get('reportId') || searchParams.get('id');
    if (reportIdParam && reportIdParam !== selectedReportId) {
      handleOpenDetail(reportIdParam, false);
    } else if (!reportIdParam && detailModalOpen) {
      setDetailModalOpen(false);
      setSelectedReportId(null);
    }
  }, [searchParams]);

  // Trigger fetch and sync URL when on history view or filters change
  useEffect(() => {
    if (mainView === 'history') {
      updateUrl({
        tab: 'history',
        page: page > 1 ? page : null,
        search: debouncedSearch.trim() || null,
        status: statusFilter || null,
        startDate: startDate || null,
        endDate: endDate || null
      });
      fetchHistory(page);
    }
  }, [mainView, page, debouncedSearch, statusFilter, startDate, endDate]);

  // Load detail report by ID
  const handleOpenDetail = async (id, shouldUpdateUrl = true) => {
    setSelectedReportId(id);
    setDetailModalOpen(true);
    setDetailLoading(true);
    setDetailTab('overview');
    if (shouldUpdateUrl) {
      updateUrl({ reportId: id });
    }
    try {
      const response = await verificationService.getReportById(id);
      if (response && (response.success || response.statusCode === 200)) {
        setDetailReport(response.data || response);
      } else {
        toast.error(response?.message || "Failed to load report details.");
      }
    } catch (err) {
      console.error("Failed to fetch report by ID", err);
      toast.error(err.response?.data?.message || "Failed to fetch report details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedReportId(null);
    updateUrl({ reportId: null, id: null });
  };

  // Open initial report if specified in URL on mount
  useEffect(() => {
    if (initialReportId) {
      handleOpenDetail(initialReportId, false);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'panNumber') {
      setFormData((prev) => ({ ...prev, [name]: sanitizePAN(value) }));
    } else if (name === 'mobileNumber') {
      const cleanPhone = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: cleanPhone }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (apiError) setApiError(null);
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Please enter the full name');
      return false;
    }
    if (formData.mobileNumber && formData.mobileNumber.length > 0 && formData.mobileNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return false;
    }
    const panErr = validatePAN(formData.panNumber).error;
    if (panErr) {
      toast.error(panErr);
      return false;
    }
    if (!formData.dob) {
      toast.error('Please select date of birth');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError(null);

    try {
      const formattedDob = formData.dob ? formData.dob.split('-').reverse().join('/') : '';
      
      const response = await verificationService.checkCibilScore({
        fullName: formData.fullName.trim(),
        dob: formattedDob,
        pan: formData.panNumber.trim().toUpperCase(),
        mobileNumber: formData.mobileNumber.trim(),
      });

      if (response && (response.success || response.statusCode === 200)) {
        const resultData = response.data || response;
        setReportResult(resultData);
        setStep('result');
        
        sessionStorage.setItem('cibil_reportData', JSON.stringify(resultData));
        sessionStorage.setItem('cibil_formData', JSON.stringify(formData));
        sessionStorage.setItem('cibil_step', 'result');

        toast.success(response.message || 'Credit report retrieved successfully!');
      } else {
        throw new Error(response.message || 'Failed to retrieve credit score');
      }
    } catch (err) {
      console.error('CIBIL Score Error:', err);
      const statusCode = err.response?.status || err.response?.data?.statusCode;
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.details ||
        err.message ||
        'Failed to fetch credit report. Please try again.';

      if (statusCode === 422 || err.response?.data?.errorCode === 'BUREAU_DATA_UNAVAILABLE') {
        const msg = err.response?.data?.message || err.response?.data?.details || 'Credit Bureau data is unavailable for these customer details. No previous credit history was found.';
        setApiError(msg);
        toast.info(msg);
      } else if (statusCode === 403) {
        const msg = err.response?.data?.message || 'Access denied: You do not have permission to initiate credit checks.';
        setApiError(msg);
        toast.error(msg);
      } else if (statusCode === 400) {
        setApiError(`Validation Error: ${errorMsg}`);
        toast.error(errorMsg);
      } else {
        setApiError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      mobileNumber: '',
      panNumber: '',
      dob: '',
    });
    setApiError(null);
    setReportResult(null);
    setStep('form');
    
    sessionStorage.removeItem('cibil_reportData');
    sessionStorage.removeItem('cibil_formData');
    sessionStorage.removeItem('cibil_step');
  };

  const handleResetHistoryFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    updateUrl({
      tab: 'history',
      search: null,
      status: null,
      startDate: null,
      endDate: null,
      page: null,
    });
  };

  // Safe and comprehensive parser for Bureau Response into structured visual data
  const parseScoreData = (dataObj) => {
    const defaultApplicant = {
      fullName: '—',
      pan: '—',
      mobileNumber: '—',
      dob: '—',
      gender: '—',
      address: '—',
      requestId: '—',
      status: 'completed',
      createdAt: null,
      requestedBy: null
    };

    const defaultBureauMeta = {
      bureauProvider: 'Experian Credit Information Bureau of India / CIBIL',
      scoreModel: 'Experian / CIBIL Risk Score v2.0',
      controlNumber: '—',
      reportTimestamp: '—',
      delinquencyCount: 0,
      securedAccounts: 0,
      unsecuredAccounts: 0,
      totalCreditCards: 0,
      totalLoans: 0
    };

    if (!dataObj) {
      return { 
        score: 0, 
        rating: getScoreRating(0), 
        scoreName: 'Experian / CIBIL Risk Score v2.0',
        accounts: [], 
        inquiries: [], 
        summary: {}, 
        totalBalance: 0,
        pdfUrl: null,
        applicant: {
          ...defaultApplicant,
          fullName: formData?.fullName || '—',
          pan: formData?.panNumber || '—',
          mobileNumber: formData?.mobileNumber || '—',
          dob: formData?.dob || '—',
        }, 
        demographics: {
          gender: '—',
          email: '—',
          address: '—'
        }, 
        bureauMeta: defaultBureauMeta 
      };
    }
    
    const rawData = dataObj.data || dataObj || {};
    
    // Safely parse reportJson if it's a string
    let reportJson = rawData.reportJson;
    if (typeof reportJson === 'string') {
      try {
        reportJson = JSON.parse(reportJson);
      } catch (e) {
        console.warn('Could not parse reportJson string', e);
      }
    }

    const innerData = reportJson?.data || reportJson || rawData.creditReport?.data || rawData.creditReport || rawData;
    const bureauReport = innerData?.credit_report || innerData?.report || innerData || {};

    // Determine Score
    let score = 0;
    if (rawData.bureauScore !== undefined && rawData.bureauScore !== null) {
      score = Number(rawData.bureauScore);
    } else if (innerData.bureauScore !== undefined && innerData.bureauScore !== null) {
      score = Number(innerData.bureauScore);
    } else if (reportJson?.bureauScore !== undefined && reportJson?.bureauScore !== null) {
      score = Number(reportJson.bureauScore);
    } else if (innerData.credit_score !== undefined && innerData.credit_score !== null) {
      score = Number(innerData.credit_score);
    } else if (innerData.score !== undefined && innerData.score !== null) {
      score = Number(innerData.score);
    } else if (bureauReport?.SCORE?.FCIREXScore !== undefined && bureauReport?.SCORE?.FCIREXScore !== null) {
      score = Number(bureauReport.SCORE.FCIREXScore);
    } else if (rawData.score !== undefined && rawData.score !== null) {
      score = Number(rawData.score);
    }

    const rating = getScoreRating(score);

    // Helper to dynamically find an array of objects that have specific keys
    const findArrayByKeys = (obj, keys) => {
      let found = null;
      const search = (node) => {
        if (!node || typeof node !== 'object' || found) return;
        if (Array.isArray(node) && node.length > 0 && typeof node[0] === 'object') {
          if (keys.some(k => node[0][k] !== undefined)) {
            found = node;
            return;
          }
        }
        Object.values(node).forEach(search);
      };
      search(obj);
      return found || [];
    };

    // Accounts
    let accountList = 
      bureauReport?.ACCOUNT?.CAIS_Account_DETAILS ||
      innerData?.ACCOUNT?.CAIS_Account_DETAILS ||
      bureauReport?.accounts ||
      innerData?.accounts ||
      rawData?.accounts ||
      [];
    
    if (!Array.isArray(accountList) || accountList.length === 0) {
       const dyn = findArrayByKeys(innerData, ['Account_Type', 'accountType', 'Current_Balance', 'balance', 'Subscriber_Name', 'institution', 'Date_Reported']);
       if (dyn.length > 0) accountList = dyn;
    }
    const safeAccounts = Array.isArray(accountList) ? accountList : (accountList ? [accountList] : []);

    // Inquiries
    let inquiryList = 
      bureauReport?.CAPS?.CAPS_Application_Details ||
      innerData?.CAPS?.CAPS_Application_Details ||
      bureauReport?.inquiries ||
      innerData?.inquiries ||
      rawData?.inquiries ||
      [];

    if (!Array.isArray(inquiryList) || inquiryList.length === 0) {
       const dyn = findArrayByKeys(innerData, ['Enquiry_Purpose', 'purpose', 'Enquiry_Amount', 'amount', 'Enquiry_Date', 'dateOfEnquiry']);
       if (dyn.length > 0) inquiryList = dyn;
    }
    const safeInquiries = Array.isArray(inquiryList) ? inquiryList : (inquiryList ? [inquiryList] : []);

    // Summary
    const summary = bureauReport?.ACCOUNT_SUMMARY || innerData?.ACCOUNT_SUMMARY || bureauReport?.summary || innerData?.summary || {};

    // Demographics / Address
    const demo = bureauReport?.DEMOGRAPHICS || innerData?.DEMOGRAPHICS || {};
    const currentAppDetails = bureauReport?.Current_Application?.Current_Application_Details || {};
    const appAddress = currentAppDetails?.Current_Applicant_Address_Details || {};
    const appDetails = currentAppDetails?.Current_Applicant_Details || {};

    const address = demo?.Flat_No_Plot_No_House_No || demo?.Address_Line_1 || bureauReport?.ADDRESS_DETAILS?.Address_Line_1 || appAddress?.FlatNoPlotNoHouseNo || '—';
    const city = demo?.City || bureauReport?.ADDRESS_DETAILS?.City || appAddress?.City || '—';
    const state = demo?.State || bureauReport?.ADDRESS_DETAILS?.State || appAddress?.State || '—';
    const pincode = demo?.PIN_Code || bureauReport?.ADDRESS_DETAILS?.PIN_Code || appAddress?.PINCode || '—';

    // Applicant Details
    const applicant = {
      fullName: rawData.fullName || innerData.fullName || innerData.name || formData?.fullName || '—',
      pan: rawData.pan || innerData.pan || innerData.pan || appDetails?.IncomeTaxPan || formData?.panNumber || '—',
      mobileNumber: rawData.mobileNumber || innerData.mobileNumber || innerData.mobile || appDetails?.Telephone_Number_Applicant_1st || formData?.mobileNumber || '—',
      dob: rawData.dob || innerData.dob || appDetails?.Date_Of_Birth_Applicant || formData?.dob || '—',
      gender: demo?.Gender || appDetails?.Gender_Code || '—',
      address: address !== '—' && address !== 'DEFAULT' ? `${address}, ${city}, ${state} - ${pincode}` : `${city !== '—' ? city + ', ' : ''}${state !== '—' ? state + ' - ' : ''}${pincode}`,
      requestId: rawData.requestId || innerData.requestId || rawData._id || '—',
      status: rawData.status || innerData.status || 'completed',
      createdAt: rawData.createdAt || innerData.createdAt,
      requestedBy: rawData.requestedBy || innerData.requestedBy
    };

    // Calculate total balance across accounts
    const totalBalance = safeAccounts.reduce((acc, curr) => {
      const val = Number(curr?.Current_Balance || curr?.balance || curr?.currentBalance || 0);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);

    // Credit Card and Loan breakdown
    const creditCards = safeAccounts.filter(a => (a?.Account_Type || a?.accountType || '').toLowerCase().includes('credit card'));
    const loans = safeAccounts.filter(a => !(a?.Account_Type || a?.accountType || '').toLowerCase().includes('credit card'));

    // Bureau Control Info
    const bureauHeader = bureauReport?.HEADER || innerData?.HEADER || bureauReport?.CreditProfileHeader || {};
    const bureauMeta = {
      bureauProvider: 'Experian Credit Information Bureau of India / CIBIL',
      scoreModel: rawData.scoreName || innerData.scoreName || reportJson?.scoreName || (bureauHeader?.Version ? `Risk Score ${bureauHeader.Version}` : 'Experian / CIBIL Risk Score v2.0'),
      controlNumber: bureauHeader?.Bureau_Control_Number || bureauHeader?.ReportNumber || applicant.requestId,
      reportTimestamp: rawData.createdAt ? new Date(rawData.createdAt).toLocaleString('en-GB') : (bureauHeader?.ReportDate ? String(bureauHeader.ReportDate) : new Date().toLocaleString('en-GB')),
      delinquencyCount: summary?.Delinquency_Accounts || summary?.delinquentAccounts || 0,
      securedAccounts: summary?.Secured_Accounts || 0,
      unsecuredAccounts: summary?.Unsecured_Accounts || 0,
      totalCreditCards: creditCards.length,
      totalLoans: loans.length
    };

    return {
      score,
      rating,
      scoreName: bureauMeta.scoreModel,
      accounts: safeAccounts,
      inquiries: safeInquiries,
      summary,
      totalBalance,
      pdfUrl: rawData.pdfUrl || innerData.pdfUrl || reportJson?.pdfUrl || null,
      applicant,
      demographics: {
        gender: demo?.Gender || '—',
        email: demo?.E_Mail_ID || '—',
        address: address !== '—' ? `${address}, ${city}, ${state} ${pincode !== '—' ? `(${pincode})` : ''}` : '—'
      },
      bureauMeta
    };
  };

  function getScoreRating(score) {
    if (isNaN(score) || score === null || score === undefined || score === 0) {
      return { text: 'No Credit Record / 0', color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-300' };
    }
    if (score > 0 && score <= 10) {
      return { text: 'New to Credit (Low/No History)', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
    }
    if (score < 600) return { text: 'Poor (High Risk)', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    if (score < 700) return { text: 'Fair / Moderate', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    if (score < 750) return { text: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (score < 800) return { text: 'Very Good', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' };
    return { text: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  }

  const liveParsed = parseScoreData(reportResult);
  const detailParsed = parseScoreData(detailReport);

  const getStatusBadge = (statusStr) => {
    const s = (statusStr || 'completed').toLowerCase();
    if (s === 'completed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
          Completed
        </span>
      );
    }
    if (s === 'processing') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
          Processing
        </span>
      );
    }
    if (s === 'failed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
        {statusStr || 'Pending'}
      </span>
    );
  };

  const hasActiveHistoryFilters = Boolean(debouncedSearch.trim()) || Boolean(statusFilter) || Boolean(startDate) || Boolean(endDate);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Unified Page Header with Standard Back Button (Detail View Only) */}
      <PageHeader
        title="CIBIL & Credit Score Verification"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Verification' },
          { label: 'CIBIL Score & Report' },
        ]}
        showBack={false}
        onBack={handleHeaderBack}
      />

      {/* Top View Selector Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange('check')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-2xs ${
              mainView === 'check'
                ? 'bg-[#225091] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <ShieldCheck size={16} />
            <span>Check Credit Score</span>
          </button>
          <button
            onClick={() => handleTabChange('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-2xs ${
              mainView === 'history'
                ? 'bg-[#225091] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <History size={16} />
            <span>Report History & Records</span>
          </button>
        </div>

        {mainView === 'check' && step === 'result' && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#225091] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw size={14} />
            <span>Check Another Score</span>
          </button>
        )}
      </div>

      {/* VIEW 1: Check Credit Score (Form or Live Result) */}
      {mainView === 'check' && (
        <>
          {step === 'form' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Card */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex items-center gap-3 pb-5 border-b border-gray-100 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#225091] flex items-center justify-center font-bold shadow-2xs border border-blue-100 shrink-0">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Initiate Bureau Credit Score Check</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Retrieve official Experian / CIBIL risk score, accounts summary, and comprehensive PDF report.
                    </p>
                  </div>
                </div>

                {apiError && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                    <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={18} />
                    <div>
                      <h4 className="text-xs font-bold text-rose-900">Verification Notice</h4>
                      <p className="text-xs text-rose-700 mt-0.5">{apiError}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Applicant Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all font-semibold"
                          required
                        />
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Mobile Number (10 Digits) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          name="mobileNumber"
                          value={formData.mobileNumber}
                          onChange={handleInputChange}
                          maxLength={10}
                          placeholder="e.g. 9876543210"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all font-semibold font-mono"
                          required
                        />
                      </div>
                    </div>

                    {/* PAN Card */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        PAN Card Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          name="panNumber"
                          value={formData.panNumber}
                          onChange={handleInputChange}
                          maxLength={10}
                          placeholder="ABCDE1234F"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all font-bold uppercase tracking-wider font-mono"
                          required
                        />
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Date of Birth <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all font-semibold"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                    <p className="text-[11px] text-gray-500">
                      🔒 Data is encrypted and securely checked with RBI authorized Credit Bureaus.
                    </p>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-[#225091] hover:bg-[#183f72] text-white rounded-xl font-bold text-xs transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                      <span>{loading ? 'Querying Bureau...' : 'Fetch Credit Score'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Guidelines Card */}
              <div className="bg-gradient-to-br from-[#225091]/5 via-white to-blue-50/40 rounded-2xl border border-[#225091]/15 p-6 space-y-4">
                <div className="flex items-center gap-2 text-[#225091]">
                  <Sparkles size={18} />
                  <h3 className="text-sm font-bold">Credit Score Bands</h3>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200/60 font-semibold">
                    <span>750 - 900</span>
                    <span className="font-bold">Excellent (Lowest Risk)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-teal-50 text-teal-800 rounded-xl border border-teal-200/60 font-semibold">
                    <span>700 - 749</span>
                    <span className="font-bold">Very Good</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200/60 font-semibold">
                    <span>600 - 699</span>
                    <span className="font-bold">Fair / Moderate</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-rose-50 text-rose-800 rounded-xl border border-rose-200/60 font-semibold">
                    <span>300 - 599</span>
                    <span className="font-bold">Poor (High Risk)</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-gray-500 leading-relaxed">
                  Tip: Check the <strong>Report History</strong> tab at any time to review previously checked CIBIL records or re-download PDF reports.
                </div>
              </div>
            </div>
          ) : (
            /* Live Score Report Result View - Human Readable Structured UI */
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Main Score Hero Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-6">
                    {/* Score Circle Gauge */}
                    <div className={`w-28 h-28 rounded-2xl ${liveParsed.rating.bg} ${liveParsed.rating.border} border-2 flex flex-col items-center justify-center shadow-xs shrink-0`}>
                      <span className={`text-4xl font-black ${liveParsed.rating.color} tracking-tight`}>
                        {liveParsed.score > 0 ? liveParsed.score : 'N/A'}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">CIBIL Score</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black text-gray-900">{liveParsed.applicant.fullName}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${liveParsed.rating.bg} ${liveParsed.rating.color} border ${liveParsed.rating.border}`}>
                          {liveParsed.rating.text}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Bureau Assessment: <span className="font-semibold text-gray-700">{liveParsed.scoreName}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-600">
                        <span className="bg-gray-100 px-2.5 py-1 rounded-lg font-mono font-bold text-gray-800 border border-gray-200">
                          PAN: {liveParsed.applicant.pan}
                        </span>
                        <span className="bg-gray-100 px-2.5 py-1 rounded-lg font-mono font-bold text-gray-800 border border-gray-200">
                          Mobile: {liveParsed.applicant.mobileNumber}
                        </span>
                        {liveParsed.applicant.dob && (
                          <span className="bg-gray-100 px-2.5 py-1 rounded-lg font-bold text-gray-800 border border-gray-200">
                            DOB: {liveParsed.applicant.dob}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {liveParsed.pdfUrl && (
                      <a
                        href={liveParsed.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                      >
                        <Download size={15} />
                        <span>Download Official PDF</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* 4 Summary Stat Tiles */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                  <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between text-gray-500 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Total Accounts</span>
                      <CreditCard size={16} className="text-[#225091]" />
                    </div>
                    <h4 className="text-2xl font-black text-gray-900">
                      {liveParsed.accounts.length || liveParsed.summary?.Total_Accounts || 0}
                    </h4>
                  </div>

                  <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100/80">
                    <div className="flex items-center justify-between text-emerald-700 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Active Accounts</span>
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    </div>
                    <h4 className="text-2xl font-black text-emerald-700">
                      {liveParsed.summary?.Active_Accounts || liveParsed.accounts.filter(a => !a.Date_Closed).length || 0}
                    </h4>
                  </div>

                  <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-100/80">
                    <div className="flex items-center justify-between text-[#225091] mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Total Balance</span>
                      <Wallet size={16} className="text-[#225091]" />
                    </div>
                    <h4 className="text-xl font-black text-[#225091]">
                      ₹{liveParsed.totalBalance.toLocaleString('en-IN')}
                    </h4>
                  </div>

                  <div className="p-4 bg-purple-50/40 rounded-2xl border border-purple-100/80">
                    <div className="flex items-center justify-between text-purple-700 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Credit Inquiries</span>
                      <Search size={16} className="text-purple-600" />
                    </div>
                    <h4 className="text-2xl font-black text-purple-700">
                      {liveParsed.inquiries.length || 0}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Multi-Section Content Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100 bg-gray-50/50 px-6 pt-3 gap-2 overflow-x-auto">
                  {[
                    { id: 'overview', label: 'Overview & Profile' },
                    { id: 'accounts', label: `Loan & Credit Accounts (${liveParsed.accounts.length})` },
                    { id: 'inquiries', label: `Credit Enquiries (${liveParsed.inquiries.length})` },
                    { id: 'bureau', label: 'Bureau Details' }
                  ].map((tabItem) => (
                    <button
                      key={tabItem.id}
                      onClick={() => setActiveTab(tabItem.id)}
                      className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 cursor-pointer ${
                        activeTab === tabItem.id
                          ? 'border-[#225091] text-[#225091] bg-white shadow-xs'
                          : 'border-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {tabItem.label}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {/* TAB 1: Overview & Profile */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Applicant Profile Information Box */}
                      <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <User size={15} className="text-[#225091]" />
                          <span>Applicant Profile & Identity</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
                          <div>
                            <span className="text-gray-400 block text-[11px] mb-0.5">Full Name</span>
                            <span className="font-bold text-gray-900 text-sm">{liveParsed.applicant.fullName}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[11px] mb-0.5">PAN Card</span>
                            <span className="font-bold text-gray-900 font-mono text-sm">{liveParsed.applicant.pan}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[11px] mb-0.5">Mobile Number</span>
                            <span className="font-bold text-gray-900 font-mono text-sm">{liveParsed.applicant.mobileNumber}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[11px] mb-0.5">Date of Birth</span>
                            <span className="font-bold text-gray-900 text-sm">{liveParsed.applicant.dob}</span>
                          </div>
                          {liveParsed.demographics.gender !== '—' && (
                            <div>
                              <span className="text-gray-400 block text-[11px] mb-0.5">Gender</span>
                              <span className="font-bold text-gray-800">{liveParsed.demographics.gender}</span>
                            </div>
                          )}
                          {liveParsed.demographics.email !== '—' && (
                            <div>
                              <span className="text-gray-400 block text-[11px] mb-0.5">Email</span>
                              <span className="font-bold text-gray-800">{liveParsed.demographics.email}</span>
                            </div>
                          )}
                          {liveParsed.demographics.address !== '—' && (
                            <div className="sm:col-span-2">
                              <span className="text-gray-400 block text-[11px] mb-0.5">Address</span>
                              <span className="font-medium text-gray-800">{liveParsed.demographics.address}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bureau Rating Guidelines */}
                      <div className="p-5 rounded-2xl bg-blue-50/30 border border-blue-100">
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Score Assessment Summary</h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          The applicant holds a score of <strong className="text-gray-900">{liveParsed.score}</strong> categorized as <strong className={liveParsed.rating.color}>{liveParsed.rating.text}</strong>. 
                          A score above 750 represents strong credit health and very low default probability.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Accounts Table */}
                  {activeTab === 'accounts' && (
                    <div className="space-y-4">
                      {liveParsed.accounts.length > 0 ? (
                        <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-2xs">
                          <table className="w-full text-xs border-collapse text-center text-sm whitespace-nowrap">
                            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
                              <tr>
                                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Institution / Bank</th>
                                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Account / Loan Type</th>
                                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Account Number</th>
                                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Current Balance</th>
                                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium">
                              {liveParsed.accounts.map((acc, aIdx) => (
                                <tr key={aIdx} className="hover:bg-gray-50/60 transition-colors">
                                  <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                                    <Building size={14} className="text-[#225091] shrink-0" />
                                    <span>{acc.Subscriber_Name || acc.institution || 'Financial Institution'}</span>
                                  </td>
                                  <td className="p-3.5 text-gray-700">{acc.Account_Type || acc.accountType || 'Credit Account'}</td>
                                  <td className="p-3.5 font-mono text-gray-800">{acc.Account_Number || acc.accountNumber || '—'}</td>
                                  <td className="p-3.5 font-bold text-gray-900">₹{Number(acc.Current_Balance || acc.balance || 0).toLocaleString('en-IN')}</td>
                                  <td className="p-3.5">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                      acc.Date_Closed ? 'bg-gray-100 text-gray-600 border border-gray-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    }`}>
                                      {acc.Date_Closed ? 'Closed' : 'Active'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-gray-100">
                          <Info size={32} className="text-gray-300 mx-auto mb-2" />
                          <p className="text-sm font-bold text-gray-800">No active credit accounts returned</p>
                          <p className="text-xs text-gray-400 mt-1">Applicant has no reported loan or credit card lines on file.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: Enquiries Table */}
                  {activeTab === 'inquiries' && (
                    <div className="space-y-4">
                      {liveParsed.inquiries.length > 0 ? (
                        <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-2xs">
                          <table className="w-full text-xs border-collapse text-center text-sm whitespace-nowrap">
                            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
                              <tr>
                                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Inquiring Member</th>
                                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Purpose of Loan / Credit</th>
                                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Amount</th>
                                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Enquiry Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium">
                              {liveParsed.inquiries.map((inq, iIdx) => (
                                <tr key={iIdx} className="hover:bg-gray-50/60 transition-colors">
                                  <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                                    <Building size={14} className="text-purple-600 shrink-0" />
                                    <span>{inq.Subscriber_Name || inq.institution || 'Member Institution'}</span>
                                  </td>
                                  <td className="p-3.5 text-gray-700">{inq.Enquiry_Purpose || inq.purpose || 'General Enquiry'}</td>
                                  <td className="p-3.5 font-bold text-gray-900">₹{Number(inq.Enquiry_Amount || inq.amount || 0).toLocaleString('en-IN')}</td>
                                  <td className="p-3.5 text-gray-500 font-medium">{inq.Date_Of_Request || inq.date || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-gray-100">
                          <Info size={32} className="text-gray-300 mx-auto mb-2" />
                          <p className="text-sm font-bold text-gray-800">No credit enquiries on record</p>
                          <p className="text-xs text-gray-400 mt-1">No financial institutions have made recent hard credit checks.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: Bureau Details (Structured Human-Readable Bureau Assessment) */}
                  {activeTab === 'bureau' && (
                    <div className="space-y-6">
                      {/* Bureau Provider & Protocol Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-3">
                          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <Shield size={16} className="text-[#225091]" />
                            <span>Credit Information Provider</span>
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-gray-200/50">
                              <span className="text-gray-500">Bureau Authority</span>
                              <span className="font-bold text-gray-900">{liveParsed.bureauMeta.bureauProvider}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-200/50">
                              <span className="text-gray-500">Score Model</span>
                              <span className="font-bold text-gray-900">{liveParsed.bureauMeta.scoreModel}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-200/50">
                              <span className="text-gray-500">Bureau Control Number</span>
                              <span className="font-mono font-bold text-[#225091]">{liveParsed.bureauMeta.controlNumber}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-gray-500">Report Issue Timestamp</span>
                              <span className="font-semibold text-gray-800">{liveParsed.bureauMeta.reportTimestamp}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-3">
                          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <Layers size={16} className="text-purple-600" />
                            <span>Credit Portfolio & Exposure Split</span>
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-gray-200/50">
                              <span className="text-gray-500">Secured Loan Accounts</span>
                              <span className="font-bold text-emerald-700">{liveParsed.bureauMeta.securedAccounts}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-200/50">
                              <span className="text-gray-500">Unsecured Loan Accounts</span>
                              <span className="font-bold text-gray-900">{liveParsed.bureauMeta.unsecuredAccounts}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-200/50">
                              <span className="text-gray-500">Credit Card Facilities</span>
                              <span className="font-bold text-[#225091]">{liveParsed.bureauMeta.totalCreditCards}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-gray-500">Past-Due / Delinquent Records</span>
                              <span className={`font-bold ${liveParsed.bureauMeta.delinquencyCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {liveParsed.bureauMeta.delinquencyCount === 0 ? '0 (None Recorded)' : liveParsed.bureauMeta.delinquencyCount}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Official Verification Security Badge */}
                      <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/60 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                            <FileCheck size={20} />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-emerald-900">Official Credit Report Seal</h5>
                            <p className="text-[11px] text-emerald-700 mt-0.5">
                              Certified and generated in real-time under RBI-authorized Credit Information Company protocols.
                            </p>
                          </div>
                        </div>
                        {liveParsed.pdfUrl && (
                          <a
                            href={liveParsed.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors shadow-2xs"
                          >
                            Open PDF
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* VIEW 2: Report History & Records */}
      {mainView === 'history' && (
        <div className="space-y-4">
          {/* History Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-3.5">
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />
                <input
                  type="text"
                  placeholder="Search by PAN, Full Name, Mobile, or Request ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 bg-gray-50 hover:bg-gray-50/80 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all shadow-2xs font-medium"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X size={15} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {hasActiveHistoryFilters && (
                  <button
                    onClick={handleResetHistoryFilters}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-600 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 rounded-xl border border-gray-200 transition-colors cursor-pointer shadow-2xs"
                  >
                    <RotateCcw size={14} />
                    <span>Reset</span>
                  </button>
                )}

                <button
                  onClick={() => fetchHistory(page)}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                >
                  <RefreshCw size={14} className={historyLoading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Bottom Filter Controls: Status + Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2.5 border-t border-gray-100">
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-semibold text-gray-700 shadow-2xs cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Start Date"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-semibold text-gray-700 shadow-2xs cursor-pointer"
                />
              </div>

              <div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  placeholder="End Date"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-semibold text-gray-700 shadow-2xs cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* History Data Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <TableWrapper minHeight="360px">
              <table ref={historyTableRef} className="w-full border-collapse min-w-[900px] text-center text-sm whitespace-nowrap">
                <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
                  <tr>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-16">Sr.No.</th>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Applicant Name</th>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">PAN Card</th>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Mobile</th>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Status</th>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Requested By</th>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Checked On</th>
                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[13px]">
                  {historyLoading ? (
                    Array.from({ length: 5 }).map((_, rIdx) => (
                      <tr key={rIdx} className="animate-pulse">
                        <td className="py-3.5 px-4 text-center"><Skeleton className="h-4 w-6 mx-auto rounded" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-32 rounded" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-24 rounded" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-3.5 w-24 rounded" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-3.5 w-28 rounded" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-3.5 w-20 rounded" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-6 w-16 rounded-lg mx-auto" /></td>
                      </tr>
                    ))
                  ) : historyList && historyList.length > 0 ? (
                    historyList.map((item, idx) => {
                      const srNo = (pagination.page - 1) * (pagination.limit || 10) + idx + 1;
                      const reportId = item._id || item.requestId || item.id;
                      const formattedDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : '—';

                      return (
                        <tr key={reportId || idx} className="hover:bg-blue-50/25 transition-colors group">
                          <td className="py-3.5 px-4 text-center font-bold text-gray-500 text-xs whitespace-nowrap">{srNo}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="text-xs font-semibold text-gray-900 block">{item.fullName || '—'}</span>
                            {item.requestId && <span className="text-[10px] text-gray-400 font-mono">REQ: {item.requestId.slice(0, 12)}...</span>}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-xs text-gray-800 uppercase whitespace-nowrap">{item.pan || '—'}</td>
                          <td className="py-3.5 px-4 font-mono text-xs text-gray-600 whitespace-nowrap">{item.mobileNumber || item.mobile || '—'}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                          <td className="py-3.5 px-4 text-xs text-gray-700 font-medium whitespace-nowrap">
                            {item.requestedBy?.fullName || item.requestedBy?.email || 'System'}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">{formattedDate}</td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenDetail(reportId)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#225091] bg-blue-50 hover:bg-blue-100 border border-[#225091]/15 transition-all shadow-2xs cursor-pointer"
                                title="View Credit Report"
                              >
                                <Eye size={13} /> View
                              </button>

                              {item.pdfUrl && (
                                <a
                                  href={item.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-all shadow-2xs"
                                  title="Download PDF"
                                >
                                  <Download size={13} /> PDF
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                            <Search size={20} className="text-gray-300" />
                          </div>
                          <p className="text-sm font-semibold text-gray-800">No CIBIL reports found</p>
                          <p className="text-xs text-gray-400 mt-0.5">Try adjusting your filters or initiate a new score check</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TableWrapper>

            {/* Pagination */}
            {!historyLoading && historyList && historyList.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto bg-gray-50/40">
                <div className="text-xs text-gray-500 font-medium">
                  Showing page <span className="font-semibold text-gray-800">{pagination.page}</span> of{' '}
                  <span className="font-semibold text-gray-800">{pagination.totalPages || 1}</span> (
                  <span className="font-semibold text-gray-800">{pagination.total || historyList.length}</span> total records)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={pagination.page <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#225091] hover:bg-[#225091] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-3 py-1 bg-[#225091] text-white text-xs font-bold rounded-full shadow-2xs">
                    {pagination.page}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages || 1, p + 1))}
                    disabled={pagination.page >= (pagination.totalPages || 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#225091] hover:bg-[#225091] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Report Modal - Structured Human-Readable UI */}
      {detailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#225091] flex items-center justify-center font-bold border border-blue-100 shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {detailParsed?.applicant?.fullName || 'Credit Bureau Report'}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    PAN: {detailParsed?.applicant?.pan || '—'} | Mobile: {detailParsed?.applicant?.mobileNumber || '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {detailParsed?.pdfUrl && (
                  <a
                    href={detailParsed.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors shadow-2xs"
                  >
                    <Download size={14} />
                    <span>Download PDF</span>
                  </a>
                )}
                <button
                  onClick={handleCloseDetail}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {detailLoading ? (
                <div className="space-y-4 py-12">
                  <div className="flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-[#225091]" />
                  </div>
                  <p className="text-center text-xs text-gray-500 font-semibold">Loading bureau report details...</p>
                </div>
              ) : (
                <>
                  {/* Score & Risk Rating Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-2xl ${detailParsed?.rating?.bg || 'bg-gray-100'} border ${detailParsed?.rating?.border || 'border-gray-300'} flex items-center gap-4`}>
                      <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 flex flex-col items-center justify-center shrink-0">
                        <span className={`text-xl font-black ${detailParsed?.rating?.color || 'text-gray-700'}`}>
                          {detailParsed?.score > 0 ? detailParsed.score : 'N/A'}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400">SCORE</span>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-500 uppercase">Bureau Score</p>
                        <h4 className={`text-sm font-bold ${detailParsed?.rating?.color || 'text-gray-800'}`}>{detailParsed?.rating?.text || 'No Score'}</h4>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <p className="text-[11px] font-bold text-gray-500 uppercase">Verification Status</p>
                      <div className="mt-1.5">{getStatusBadge(detailReport?.status || detailParsed?.applicant?.status)}</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <p className="text-[11px] font-bold text-gray-500 uppercase">Requested By</p>
                      <h4 className="text-xs font-bold text-gray-900 mt-1">
                        {detailReport?.requestedBy?.fullName || detailReport?.requestedBy?.email || 'System'}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {detailReport?.createdAt ? new Date(detailReport.createdAt).toLocaleString('en-GB') : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Applicant Details Profile Box */}
                  <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Applicant Information</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[11px] mb-0.5">Full Name</span>
                        <span className="font-bold text-gray-900">{detailParsed?.applicant?.fullName || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px] mb-0.5">PAN Card</span>
                        <span className="font-bold text-gray-900 font-mono">{detailParsed?.applicant?.pan || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px] mb-0.5">Mobile</span>
                        <span className="font-bold text-gray-900 font-mono">{detailParsed?.applicant?.mobileNumber || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px] mb-0.5">Date of Birth</span>
                        <span className="font-bold text-gray-900">{detailParsed?.applicant?.dob || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Accounts Table in Modal */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Report Accounts ({detailParsed?.accounts?.length || 0})
                    </h4>
                    {(detailParsed?.accounts?.length || 0) > 0 ? (
                      <div className="border border-gray-100 rounded-2xl overflow-hidden">
                        <table className="w-full text-xs border-collapse text-center text-sm whitespace-nowrap">
                          <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
                            <tr>
                              <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Institution</th>
                              <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Type</th>
                              <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Balance</th>
                              <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {detailParsed.accounts.map((acc, aIdx) => (
                              <tr key={aIdx} className="hover:bg-gray-50/40">
                                <td className="p-3 font-semibold text-gray-900">{acc?.Subscriber_Name || acc?.institution || '—'}</td>
                                <td className="p-3 text-gray-700">{acc?.Account_Type || acc?.accountType || '—'}</td>
                                <td className="p-3 font-bold text-gray-900">₹{Number(acc?.Current_Balance || acc?.balance || 0).toLocaleString('en-IN')}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${acc?.Date_Closed ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-700'}`}>
                                    {acc?.Date_Closed ? 'Closed' : 'Active'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500">
                        No credit account lines reported for this record.
                      </div>
                    )}
                  </div>

                  {/* Inquiries Table in Modal */}
                  {(detailParsed?.inquiries?.length || 0) > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                        Enquiries on Record ({detailParsed.inquiries.length})
                      </h4>
                      <div className="border border-gray-100 rounded-2xl overflow-hidden">
                        <table className="w-full text-xs border-collapse text-center text-sm whitespace-nowrap">
                          <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
                            <tr>
                              <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Member</th>
                              <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Purpose</th>
                              <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Amount</th>
                              <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {detailParsed.inquiries.map((inq, iIdx) => (
                              <tr key={iIdx} className="hover:bg-gray-50/40">
                                <td className="p-3 font-semibold text-gray-900">{inq?.Subscriber_Name || inq?.institution || '—'}</td>
                                <td className="p-3 text-gray-700">{inq?.Enquiry_Purpose || inq?.purpose || '—'}</td>
                                <td className="p-3 font-bold text-gray-900">₹{Number(inq?.Enquiry_Amount || inq?.amount || 0).toLocaleString('en-IN')}</td>
                                <td className="p-3 text-gray-500">{inq?.Date_Of_Request || inq?.date || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Bureau Metadata in Modal */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Bureau Protocol</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[11px]">Provider</span>
                        <span className="font-semibold text-gray-800">{detailParsed?.bureauMeta?.bureauProvider || 'Experian / CIBIL'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Score Model</span>
                        <span className="font-semibold text-gray-800">{detailParsed?.bureauMeta?.scoreModel || 'Experian / CIBIL Risk Score v2.0'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Reference ID</span>
                        <span className="font-mono font-bold text-[#225091]">{detailParsed?.bureauMeta?.controlNumber || '—'}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/70 flex justify-end">
              <button
                onClick={handleCloseDetail}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckCibilScore;
