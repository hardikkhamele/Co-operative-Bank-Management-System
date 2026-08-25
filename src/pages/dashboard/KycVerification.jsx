import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Download, CheckCircle2, User, Calendar, Users, MapPin, CreditCard, FileText, AlertCircle, Loader2, ShieldCheck, Copy } from 'lucide-react';
import { kycService } from '../../api/kycService';
import { toast } from 'react-toastify';
import { validateAadhaar, validatePAN, sanitizeDigits, sanitizePAN } from '../../utils/validation';
import PageHeader from '../../components/common/PageHeader';

const KycVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [step, setStep] = useState('form'); // 'form' or 'result'
  const [activeTab, setActiveTab] = useState('aadhaar'); // 'aadhaar' or 'pan'
  
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
  const [currentRefId, setCurrentRefId] = useState(null);

  // Check if returning from callback with a refid
  useEffect(() => {
    if (location.state?.refid) {
      const fetchReport = async () => {
        setLoading(true);
        try {
          const response = await kycService.getKycReport(location.state.refid);
          if (response.success) {
            setReportData(response.data.personalDetails);
            setCurrentRefId(location.state.refid);
            setActiveTab(response.data.documentType.toLowerCase());
            setStep('result');
            // Clear state so it doesn't refetch on refresh
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'panNumber') {
      const clean = sanitizePAN(value);
      setFormData((prev) => ({ ...prev, panNumber: clean }));
      setTouched((prev) => ({ ...prev, pan: true }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Real-time validation results
  const aadhaarValidation = validateAadhaar(formData.aadhaarNumber, { required: false });
  const panValidation = validatePAN(formData.panNumber, { required: false });

  const isCurrentInputValid = activeTab === 'aadhaar'
    ? formData.aadhaarNumber.length === 12 && aadhaarValidation.isValid
    : formData.panNumber.length === 10 && panValidation.isValid;

  const currentError = activeTab === 'pan'
    ? (touched.pan && formData.panNumber && !panValidation.isValid ? panValidation.error : null)
    : null;

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
          setReportData(response.data.personalDetails);
          setCurrentRefId(response.data.refid);
          setStep('result');
        } else if (response.data.status === 'INITIATED') {
          sessionStorage.setItem('kyc_refid', response.data.refid);
          window.location.href = response.data.authorizationUrl;
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

  return (
    <div className="w-full h-full flex flex-col">
      {step === 'form' ? (
        <div className="flex flex-col gap-6 w-full">
          {/* Header Card */}
          <PageHeader
            title="KYC Verification"
            breadcrumbs={[
              { label: "Dashboard", to: "/dashboard" },
              { label: "Verification" },
              { label: "KYC Verification" }
            ]}
          />

          {/* Tabs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setActiveTab('aadhaar'); handleReset(); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'aadhaar'
                  ? 'bg-[#e6f4f5] text-[#225091] shadow-xs'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <CreditCard size={18} />
              Aadhaar Verification
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('pan'); handleReset(); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'pan'
                  ? 'bg-[#e6f4f5] text-[#225091] shadow-xs'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <FileText size={18} />
              PAN Verification
            </button>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden mt-2">
            <div className="bg-[#e6f4f5] px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#225091]">
                {activeTab === 'aadhaar' ? 'Aadhaar Verification' : 'PAN Verification'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="max-w-xl space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 block">
                    {activeTab === 'aadhaar' ? 'Aadhaar Number (4-4-4 Digits)' : 'PAN Number'}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <span className="text-xs text-gray-400 font-mono">
                    {activeTab === 'aadhaar' 
                      ? `${formData.aadhaarNumber.length}/12 digits` 
                      : `${formData.panNumber.length}/10 chars`}
                  </span>
                </div>

                {/* 4-4-4 Digit Aadhaar Input Layout */}
                {activeTab === 'aadhaar' ? (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <input
                      ref={part1Ref}
                      type="text"
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
                        touched.aadhaar && (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12 || !validateAadhaar(formData.aadhaarNumber))
                          ? 'border-red-400 bg-red-50/20'
                          : 'border-gray-200 bg-gray-50/40'
                      }`}
                    />
                    <span className="text-gray-400 font-bold">-</span>
                    <input
                      ref={part2Ref}
                      type="text"
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
                        touched.aadhaar && (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12 || !validateAadhaar(formData.aadhaarNumber))
                          ? 'border-red-400 bg-red-50/20'
                          : 'border-gray-200 bg-gray-50/40'
                      }`}
                    />
                    <span className="text-gray-400 font-bold">-</span>
                    <input
                      ref={part3Ref}
                      type="text"
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
                        touched.aadhaar && (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12 || !validateAadhaar(formData.aadhaarNumber))
                          ? 'border-red-400 bg-red-50/20'
                          : 'border-gray-200 bg-gray-50/40'
                      }`}
                    />
                  </div>
                ) : (
                  /* Standard PAN Input */
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={10}
                      value={formData.panNumber}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('pan')}
                      placeholder="e.g. ABCDE1234F"
                      className={`w-full text-base font-mono tracking-wider px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#225091] focus:border-transparent uppercase transition-all shadow-xs ${
                        touched.pan && (!formData.panNumber || !validatePAN(formData.panNumber))
                          ? 'border-red-400 bg-red-50/20'
                          : 'border-gray-200 bg-gray-50/40'
                      }`}
                    />
                  </div>
                )}

                {touched.aadhaar && activeTab === 'aadhaar' && (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12 || !validateAadhaar(formData.aadhaarNumber)) && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={14} /> Please enter a valid 12-digit Aadhaar number.
                  </p>
                )}

                {touched.pan && activeTab === 'pan' && (!formData.panNumber || !validatePAN(formData.panNumber)) && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={14} /> Please enter a valid 10-character PAN (e.g. ABCDE1234F).
                  </p>
                )}
              </div>

              {/* Consent Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-w-xl mb-8 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={isConsentChecked}
                  onChange={(e) => setIsConsentChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#225091] focus:ring-[#225091] cursor-pointer"
                />
                <label htmlFor="consent" className="text-xs text-gray-600 leading-relaxed cursor-pointer select-none">
                  I hereby give my explicit consent to fetch and verify my identity documents (Aadhaar/PAN) directly from the official DigiLocker repository for verification purposes.
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
                    (activeTab === 'aadhaar' ? (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12 || !validateAadhaar(formData.aadhaarNumber)) : (!formData.panNumber || !validatePAN(formData.panNumber)))
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
        </div>
      ) : (
        /* ================= RESULT / REPORT VIEW ================= */
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
          {/* Result Header Card */}
          <PageHeader
            title="KYC Verification Result"
            breadcrumbs={[
              { label: "Dashboard", to: "/dashboard" },
              { label: "Verification" },
              { label: "KYC Verification", to: "/kyc" },
              { label: "Result" }
            ]}
            showBack={true}
            onBack={() => { setStep('form'); setReportData(null); setCurrentRefId(null); }}
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
                    VERIFIED
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
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Reference ID</span>
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
                    {reportData.availableDocuments && reportData.availableDocuments.length > 0 && (
                      reportData.availableDocuments.map((doc, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={12} /> {doc} Verified
                        </span>
                      ))
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
                        {reportData.aadhaarVerified && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {reportData.aadhaarStatus || 'VERIFIED'}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold font-mono text-gray-800 flex items-center gap-2">
                        <CreditCard size={16} className="text-[#225091] shrink-0" />
                        {reportData.aadhaarNumber || (activeTab === 'aadhaar' ? formData.aadhaarNumber : 'N/A')}
                      </span>
                    </div>

                    {/* PAN Number */}
                    <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400 font-medium">PAN Number</span>
                        {reportData.panVerified && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {reportData.panStatus || 'VERIFIED'}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold font-mono text-gray-800 flex items-center gap-2">
                        <FileText size={16} className="text-[#225091] shrink-0" />
                        {reportData.panNumber || (activeTab === 'pan' ? formData.panNumber : 'N/A')}
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
                  reportData.aadhaarVerified || reportData.aadhaarNumber
                    ? 'bg-white border-emerald-200 shadow-xs'
                    : 'bg-gray-50/50 border-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        reportData.aadhaarVerified || reportData.aadhaarNumber
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Aadhaar Card Record</h4>
                        <span className="text-xs font-mono text-gray-500">
                          {reportData.aadhaarNumber || 'Not provided in this session'}
                        </span>
                      </div>
                    </div>

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      reportData.aadhaarVerified || reportData.aadhaarStatus === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {reportData.aadhaarStatus || (reportData.aadhaarVerified ? 'VERIFIED' : 'UNAVAILABLE')}
                    </span>
                  </div>

                  {(reportData.aadhaarVerified || reportData.aadhaarNumber) && (
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
                  reportData.panVerified || reportData.panNumber
                    ? 'bg-white border-blue-200 shadow-xs'
                    : 'bg-gray-50/50 border-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        reportData.panVerified || reportData.panNumber
                          ? 'bg-blue-100 text-[#225091]'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">PAN Card Record</h4>
                        <span className="text-xs font-mono text-gray-500">
                          {reportData.panNumber || 'Not provided in this session'}
                        </span>
                      </div>
                    </div>

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      reportData.panVerified || reportData.panStatus === 'VERIFIED'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {reportData.panStatus || (reportData.panVerified ? 'VERIFIED' : 'UNAVAILABLE')}
                    </span>
                  </div>

                  {(reportData.panVerified || reportData.panNumber) && (
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
                <button
                  type="button"
                  onClick={() => { setStep('form'); handleReset(); }}
                  className="px-6 py-2.5 rounded-xl text-gray-700 font-semibold border border-gray-200 hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                >
                  Verify Another Document
                </button>

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
