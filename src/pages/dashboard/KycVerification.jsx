import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Download, CheckCircle2, User, Calendar, Users, MapPin, CreditCard, FileText, AlertCircle, Loader2 } from 'lucide-react';
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
      const payload = {
        documentType: activeTab.toUpperCase(),
        idNumber: idNumber.toUpperCase(),
        consent: isConsentChecked,
        redirectUrl: import.meta.env.VITE_KYC_REDIRECT_URL || 'https://www.epochconverter.com/',
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

  const handleDownload = async () => {
    if (!currentRefId) return;
    try {
      setLoading(true);
      const blob = await kycService.downloadKycPdf(currentRefId, activeTab.toUpperCase());
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kyc_verification_${currentRefId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download PDF report.');
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
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'aadhaar'
                  ? 'bg-[#e6f4f5] text-[#225091] shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <CreditCard size={18} />
              Aadhaar Verification
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('pan'); handleReset(); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'pan'
                  ? 'bg-[#e6f4f5] text-[#225091] shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <FileText size={18} />
              PAN Verification
            </button>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
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
                      className={`w-28 sm:w-32 text-center text-base sm:text-lg font-mono font-bold tracking-widest px-3 py-2.5 rounded-xl border transition-all bg-gray-50/50 ${
                        currentError
                          ? 'border-red-400 focus:ring-2 focus:ring-red-100 focus:border-red-500 text-red-900'
                          : isCurrentInputValid
                          ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500'
                          : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]'
                      }`}
                      required
                    />
                    <span className="text-gray-400 font-bold text-base select-none">-</span>
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
                      className={`w-28 sm:w-32 text-center text-base sm:text-lg font-mono font-bold tracking-widest px-3 py-2.5 rounded-xl border transition-all bg-gray-50/50 ${
                        currentError
                          ? 'border-red-400 focus:ring-2 focus:ring-red-100 focus:border-red-500 text-red-900'
                          : isCurrentInputValid
                          ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500'
                          : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]'
                      }`}
                      required
                    />
                    <span className="text-gray-400 font-bold text-base select-none">-</span>
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
                      className={`w-28 sm:w-32 text-center text-base sm:text-lg font-mono font-bold tracking-widest px-3 py-2.5 rounded-xl border transition-all bg-gray-50/50 ${
                        currentError
                          ? 'border-red-400 focus:ring-2 focus:ring-red-100 focus:border-red-500 text-red-900'
                          : isCurrentInputValid
                          ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500'
                          : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]'
                      }`}
                      required
                    />
                    {isCurrentInputValid && (
                      <CheckCircle2 size={22} className="text-emerald-500 ml-2 shrink-0 animate-in fade-in" />
                    )}
                  </div>
                ) : (
                  /* 10-char PAN Input */
                  <div className="relative max-w-md">
                    <input
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('pan')}
                      maxLength={10}
                      placeholder="Enter 10-char PAN (e.g. ABCDE1234F)"
                      className={`w-full px-4 py-2.5 rounded-lg border transition-all bg-gray-50/50 text-sm font-medium uppercase font-mono ${
                        currentError
                          ? 'border-red-400 focus:ring-2 focus:ring-red-100 focus:border-red-500 text-red-900'
                          : isCurrentInputValid
                          ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500'
                          : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]'
                      }`}
                      required
                    />
                    {isCurrentInputValid && (
                      <CheckCircle2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
                    )}
                  </div>
                )}

                {/* Inline Real-time Error Message (PAN only) */}
                {activeTab === 'pan' && currentError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium pt-1 animate-in fade-in">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{currentError}</span>
                  </div>
                )}
                {activeTab === 'pan' && !currentError && !isCurrentInputValid && (
                  <p className="text-[11px] text-gray-400 font-medium">
                    Format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F).
                  </p>
                )}
              </div>

              <div className="mb-8 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={isConsentChecked}
                  onChange={(e) => setIsConsentChecked(e.target.checked)}
                  className="w-4 h-4 text-[#225091] border-gray-300 rounded focus:ring-[#225091] cursor-pointer"
                  required
                />
                <label htmlFor="consent" className="text-sm font-medium text-gray-600 cursor-pointer select-none">
                  I consent to verify my identity securely using DigiLocker.
                </label>
              </div>

              <div className="flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="px-8 py-2.5 rounded-full text-[#225091] font-semibold border border-[#225091] hover:bg-[#225091]/5 transition-colors disabled:opacity-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={!isConsentChecked || !isCurrentInputValid || loading}
                  className="px-8 py-2.5 rounded-full bg-[#225091] text-white font-bold hover:bg-[#163a6c] transition-all shadow-md shadow-[#225091]/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 flex items-center gap-2.5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
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
        <div className="flex flex-col gap-6 w-full">
          {/* Result Header Card */}
          <PageHeader
            title="KYC Report"
            breadcrumbs={[
              { label: "Dashboard", to: "/dashboard" },
              { label: "Verification" },
              { label: "KYC Verification", to: "/kyc-verification" },
              { label: "Result" }
            ]}
            showBack={true}
            onBack={() => { setStep('form'); setReportData(null); setCurrentRefId(null); }}
          />

          {/* Success Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-900">Identity Verification Successful</h3>
                <p className="text-xs text-emerald-700">Verified securely through DigiLocker UIDAI / ITD records.</p>
              </div>
            </div>
            {currentRefId && (
              <div className="text-right">
                <span className="text-[11px] text-gray-400 block">Reference ID</span>
                <span className="text-xs font-mono font-bold text-gray-700">{currentRefId}</span>
              </div>
            )}
          </div>

          {/* Report Details Card */}
          {reportData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#e6f4f5] px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-[#225091]">Personal Details</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
                  {activeTab.toUpperCase()} Verified
                </span>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 max-w-3xl">
                  <div className="flex items-start gap-3">
                    <User size={18} className="text-[#225091] mt-0.5" />
                    <div>
                      <span className="text-xs text-gray-400 block font-medium">Full Name</span>
                      <span className="text-sm font-bold text-gray-800">{reportData.name || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-[#225091] mt-0.5" />
                    <div>
                      <span className="text-xs text-gray-400 block font-medium">Date of Birth</span>
                      <span className="text-sm font-bold text-gray-800">{reportData.dob || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users size={18} className="text-[#225091] mt-0.5" />
                    <div>
                      <span className="text-xs text-gray-400 block font-medium">Gender</span>
                      <span className="text-sm font-bold text-gray-800 capitalize">{reportData.gender || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard size={18} className="text-[#225091] mt-0.5" />
                    <div>
                      <span className="text-xs text-gray-400 block font-medium">Document Number</span>
                      <span className="text-sm font-bold text-gray-800 font-mono">
                        {activeTab === 'aadhaar' ? formData.aadhaarNumber : formData.panNumber}
                      </span>
                    </div>
                  </div>

                  {reportData.address && (
                    <div className="flex items-start gap-3 md:col-span-2">
                      <MapPin size={18} className="text-[#225091] mt-0.5" />
                      <div>
                        <span className="text-xs text-gray-400 block font-medium">Address</span>
                        <span className="text-sm font-medium text-gray-700 leading-relaxed">
                          {typeof reportData.address === 'string'
                            ? reportData.address
                            : `${reportData.address.line1 || ''} ${reportData.address.line2 || ''}, ${reportData.address.city || ''} ${reportData.address.state || ''} - ${reportData.address.pincode || ''}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
                  <button
                    type="button"
                    onClick={() => { setStep('form'); handleReset(); }}
                    className="px-6 py-2.5 rounded-full text-gray-600 font-semibold border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                  >
                    Verify Another Document
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#225091] text-white font-bold hover:bg-[#163a6c] transition-all shadow-sm text-sm"
                  >
                    <Download size={16} />
                    Download PDF Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KycVerification;
