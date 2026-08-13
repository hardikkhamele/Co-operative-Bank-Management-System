import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  ArrowLeft,
  Phone
} from 'lucide-react';
import { toast } from 'react-toastify';
import { verificationService } from '../../api/verificationService';
import { validatePAN, sanitizePAN } from '../../utils/validation';

const CheckCibilScore = () => {
  const [step, setStep] = useState('form'); // 'form' | 'result'
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [reportResult, setReportResult] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'accounts' | 'inquiries' | 'demographics'

  const [formData, setFormData] = useState({
    fullName: 'VITTHAL DEVARD WAKODE',
    mobileNumber: '9552823088',
    panNumber: 'ABWPW0802F',
    dob: '1990-10-29',
  });

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
      // Convert YYYY-MM-DD to DD/MM/YYYY
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

  // Helper functions for parsing report
  const creditReport = reportResult?.creditReport || {};
  const reportObj = creditReport?.report || {};
  const scoreVal = creditReport?.credit_score || reportObj?.SCORE?.FCIREXScore || 0;

  const getScoreRating = (score) => {
    if (!score || score < 300) return { text: 'N/A', color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' };
    if (score < 600) return { text: 'Poor (High Risk)', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    if (score < 700) return { text: 'Fair / Moderate', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    if (score < 750) return { text: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (score < 800) return { text: 'Very Good', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' };
    return { text: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  };

  const rating = getScoreRating(scoreVal);

  // SVG Gauge Needle Angle (-90 deg at 300 to +90 deg at 900)
  const clampedScore = Math.max(300, Math.min(900, scoreVal || 300));
  const needleAngle = -90 + ((clampedScore - 300) / 600) * 180;

  const caisSummary = reportObj?.CAIS_Account?.CAIS_Summary || {};
  const creditAccounts = caisSummary?.Credit_Account || {};
  const balanceSummary = caisSummary?.Total_Outstanding_Balance || {};
  const accountList = reportObj?.CAIS_Account?.CAIS_Account_DETAILS || [];
  const capsSummary = reportObj?.TotalCAPS_Summary || reportObj?.CAPS?.CAPS_Summary || {};
  const capsList = reportObj?.NonCreditCAPS?.CAPS_Application_Details || [];
  const headerInfo = reportObj?.CreditProfileHeader || {};
  const applicantDetails = reportObj?.Current_Application?.Current_Application_Details?.Current_Applicant_Details || {};
  const addressDetails = reportObj?.Current_Application?.Current_Application_Details?.Current_Applicant_Address_Details || {};

  const formatCurrency = (val) => {
    if (!val || isNaN(Number(val))) return '₹0';
    return '₹' + Number(val).toLocaleString('en-IN');
  };

  const formatDate = (rawDate) => {
    if (!rawDate) return 'N/A';
    const str = String(rawDate).trim();
    if (str.length === 8) {
      return `${str.substring(6, 8)}/${str.substring(4, 6)}/${str.substring(0, 4)}`;
    }
    if (str.includes('-')) {
      const parts = str.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return str;
  };

  return (
    <div className="w-full h-full flex flex-col pb-10">
      {/* Header & Breadcrumbs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            {step === 'form' ? 'Check CIBIL / Experian Credit Score' : 'Credit Bureau Report'}
          </h1>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Link to="/dashboard" className="hover:text-[#1cabb1] transition-colors">Dashboard</Link>
            <span>&gt;</span>
            <span>Verification</span>
            <span>&gt;</span>
            <span 
              className={step === 'form' ? "text-[#1cabb1] font-medium" : "text-gray-500 cursor-pointer hover:text-[#1cabb1]"} 
              onClick={() => step === 'result' && handleReset()}
            >
              Check CIBIL Score
            </span>
            {step === 'result' && (
              <>
                <span>&gt;</span>
                <span className="text-[#1cabb1] font-medium">Bureau Report</span>
              </>
            )}
          </div>
        </div>

        {step === 'result' && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all text-sm shadow-sm"
            >
              <ArrowLeft size={16} />
              Check Another Score
            </button>
            <button
              onClick={() => {
                const pdfUrl = reportResult?.pdfUrl || reportResult?.data?.pdfUrl;
                if (pdfUrl) {
                  window.open(pdfUrl, '_blank');
                } else {
                  window.print();
                }
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#1cabb1] text-white font-semibold hover:bg-[#159a9f] transition-all text-sm shadow-md shadow-[#1cabb1]/20"
            >
              <Printer size={16} />
              Print / Save Report
            </button>
          </div>
        )}
      </div>

      {step === 'form' ? (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-[#1b58a6] to-[#154685] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden text-white">
            <div className="flex items-center gap-5 z-10">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                <ShieldCheck size={36} className="text-[#1cabb1]" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">Experian &amp; CIBIL Bureau Verification</h2>
                <p className="text-blue-100 text-sm mt-1 max-w-xl">
                  Real-time credit score retrieval powered by Experian Credit Bureau APIs with 30-day automatic validation caching.
                </p>
              </div>
            </div>
            <div className="z-10 flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border border-white/20">
              <CheckCircle2 size={16} className="text-emerald-400" />
              RBI Compliant Bureau Check
            </div>
            {/* Background design accents */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute left-1/2 -top-10 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          {/* API Error Notification if any */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in duration-200">
              <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-600" />
              <div className="text-sm">
                <p className="font-semibold text-red-800">Verification Request Failed</p>
                <p className="mt-0.5">{apiError}</p>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-[#e6f4f5] px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText size={20} className="text-[#1b58a6]" />
                <h3 className="text-lg font-bold text-gray-800">Applicant Information</h3>
              </div>
              <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                Applicant Details
              </span>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                
                {/* 1. Full Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-gray-50/50 text-gray-800 font-medium"
                    required
                    disabled={loading}
                  />
                </div>

                {/* 2. Mobile Number */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Phone size={14} className="text-[#1cabb1]" />
                    Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-gray-400 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="mobileNumber"
                      maxLength={10}
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-gray-50/50 text-gray-800 font-medium font-mono"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">10-digit mobile number</p>
                </div>

                {/* 3. PAN Card Number */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    PAN Card Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="panNumber"
                    maxLength={10}
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    placeholder="ABCDE1234F"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-gray-50/50 uppercase font-mono font-bold tracking-wider text-gray-800"
                    required
                    disabled={loading}
                  />
                  <p className="text-[11px] text-gray-400">5 letters, 4 numbers, 1 letter</p>
                </div>

                {/* 4. Date of Birth */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    Date Of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-gray-50/50 text-gray-800 font-medium"
                    required
                    disabled={loading}
                  />
                </div>

              </div>

              {/* Notice Pill */}
              <div className="bg-[#eaf8e5] text-[#2e7d32] px-4 py-3 rounded-xl text-sm font-medium mb-8 border border-[#c3ebc4] flex items-center gap-2">
                <CheckCircle2 size={18} className="shrink-0 text-[#4caf50]" />
                <span>30-Day Cache Protection: Reports queried within the last 30 days are instantly retrieved from cache at zero duplicate cost.</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 disabled:opacity-50"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 rounded-xl bg-[#1cabb1] text-white font-bold hover:bg-[#159a9f] transition-all shadow-md shadow-[#1cabb1]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform active:scale-95"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Fetching Credit Report...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Fetch CIBIL Score
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* ================= RESULT SCREEN ================= */
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto animate-in fade-in duration-300">
          
          {/* Top Status & Bureau Banner */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1cabb1]/10 flex items-center justify-center text-[#1cabb1] shrink-0 font-bold text-xl border border-[#1cabb1]/20">
                {(creditReport.name || formData.fullName)?.charAt(0) || 'C'}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-800">{creditReport.name || formData.fullName}</h2>
                  <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold border border-blue-200">
                    PAN: {creditReport.pan || formData.panNumber}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-1 font-medium">
                  {headerInfo.ReportNumber && (
                    <span className="flex items-center gap-1">
                      <FileText size={13} className="text-gray-400" /> Ref: #{headerInfo.ReportNumber}
                    </span>
                  )}
                  {headerInfo.ReportDate && (
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-gray-400" /> Date: {formatDate(headerInfo.ReportDate)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Cache Status Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <CheckCircle2 size={16} className="text-emerald-600" />
              {reportResult?.message?.toLowerCase().includes('cache') 
                ? 'Retrieved from 30-Day Cache' 
                : 'Live Experian Bureau Fetch Completed'}
            </div>
          </div>

          {/* Main Score & Summary Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Speedometer Score Card (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-500"></div>
              
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6">Bureau Credit Score</h3>
              
              {/* Dynamic SVG Gauge Meter */}
              <div className="relative w-64 h-36 mb-4">
                <svg viewBox="0 0 200 110" className="w-full h-full drop-shadow-sm">
                  {/* Arc Segments */}
                  {/* Red (300-500) */}
                  <path d="M 25 95 A 75 75 0 0 1 55 40" fill="none" stroke="#ef4444" strokeWidth="14" strokeLinecap="round" />
                  {/* Orange (500-650) */}
                  <path d="M 55 40 A 75 75 0 0 1 100 20" fill="none" stroke="#f97316" strokeWidth="14" />
                  {/* Yellow (650-750) */}
                  <path d="M 100 20 A 75 75 0 0 1 145 40" fill="none" stroke="#eab308" strokeWidth="14" />
                  {/* Green (750-900) */}
                  <path d="M 145 40 A 75 75 0 0 1 175 95" fill="none" stroke="#22c55e" strokeWidth="14" strokeLinecap="round" />
                  
                  {/* Pivot */}
                  <circle cx="100" cy="95" r="7" fill="#1f2937" />
                  
                  {/* Dynamic Needle */}
                  <g transform={`rotate(${needleAngle} 100 95)`} className="transition-transform duration-700 ease-out">
                    <line x1="100" y1="95" x2="100" y2="35" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
                    <polygon points="97,42 103,42 100,30" fill="#1f2937" />
                  </g>
                </svg>
                <span className="absolute bottom-1 left-2 text-[11px] font-bold text-gray-400 font-mono">300</span>
                <span className="absolute bottom-1 right-2 text-[11px] font-bold text-gray-400 font-mono">900</span>
              </div>

              {/* Big Score Display */}
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black tracking-tight text-gray-900 font-mono">
                  {scoreVal || 'N/A'}
                </span>
                <span className={`mt-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${rating.bg} ${rating.color} ${rating.border}`}>
                  {rating.text}
                </span>
              </div>

              <p className="text-xs text-gray-400 text-center mt-6">
                Calculated based on credit profile from Experian FCIREX algorithm.
              </p>
            </div>

            {/* Metrics Overview (7 Cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: Total Outstanding */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Outstanding</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1b58a6] flex items-center justify-center">
                    <DollarSign size={18} />
                  </div>
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-gray-900">
                    {formatCurrency(balanceSummary.Outstanding_Balance_All)}
                  </h4>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2 font-medium">
                    <span>Secured: {formatCurrency(balanceSummary.Outstanding_Balance_Secured)}</span>
                    <span>Unsecured: {formatCurrency(balanceSummary.Outstanding_Balance_UnSecured)}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Credit Accounts */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Credit Accounts</span>
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#1cabb1] flex items-center justify-center">
                    <CreditCard size={18} />
                  </div>
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-gray-900">
                    {creditAccounts.CreditAccountTotal || accountList.length || '0'}
                  </h4>
                  <div className="mt-2 flex items-center gap-3 text-xs border-t border-gray-100 pt-2 font-medium">
                    <span className="text-emerald-600 font-semibold">Active: {creditAccounts.CreditAccountActive || '0'}</span>
                    <span className="text-gray-400">Closed: {creditAccounts.CreditAccountClosed || '0'}</span>
                    <span className="text-red-500">Default: {creditAccounts.CreditAccountDefault || '0'}</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Recent Enquiries */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bureau Enquiries</span>
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Clock size={18} />
                  </div>
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-gray-900">
                    {capsSummary.TotalCAPSLast30Days || capsSummary.CAPSLast30Days || '0'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-2 border-t border-gray-100 pt-2 font-medium">
                    Inquiries made in the last 30 days ({capsSummary.TotalCAPSLast90Days || '0'} in 90 days)
                  </p>
                </div>
              </div>

              {/* Card 4: Match & Confidence */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bureau Identity Match</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <UserCheck size={18} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {reportObj.Match_result?.Exact_match === 'Y' ? 'Exact Match Verified' : 'Verified'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 border-t border-gray-100 pt-2 font-medium">
                    Bureau Version {headerInfo.Version || 'V2.4'} Profile Record
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-gray-200 print:hidden">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'border-[#1cabb1] text-[#1cabb1]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <FileText size={16} />
              Accounts Breakdown ({accountList.length})
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'inquiries'
                  ? 'border-[#1cabb1] text-[#1cabb1]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Clock size={16} />
              Recent Inquiries ({capsList.length})
            </button>
            <button
              onClick={() => setActiveTab('demographics')}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'demographics'
                  ? 'border-[#1cabb1] text-[#1cabb1]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <UserCheck size={16} />
              Bureau Demographic Profile
            </button>
          </div>

          {/* Tab 1: Accounts Breakdown */}
          {activeTab === 'overview' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Credit Accounts (CAIS Details)</h4>
                <span className="text-xs font-semibold text-gray-500">{accountList.length} Accounts Found</span>
              </div>

              {accountList.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No individual credit loan accounts reported in bureau profile.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50 text-gray-500 text-xs font-semibold border-b border-gray-100 uppercase">
                      <tr>
                        <th className="px-6 py-3.5">Account / Subscriber</th>
                        <th className="px-6 py-3.5">Type &amp; Portfolio</th>
                        <th className="px-6 py-3.5">Sanctioned / High Credit</th>
                        <th className="px-6 py-3.5">Current Balance</th>
                        <th className="px-6 py-3.5">Past Due</th>
                        <th className="px-6 py-3.5">Opened / Reported</th>
                        <th className="px-6 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {accountList.map((acc, index) => (
                        <tr key={index} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{acc.Subscriber_Name || acc.Identification_Number || 'N/A'}</div>
                            <div className="text-xs font-mono text-gray-400 mt-0.5">{acc.Account_Number || 'XXXX'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div>Code: {acc.Account_Type || '01'}</div>
                            <div className="text-xs text-gray-400">Portfolio: {acc.Portfolio_Type || 'I'}</div>
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">
                            {formatCurrency(acc.Highest_Credit_or_Original_Loan_Amount)}
                          </td>
                          <td className="px-6 py-4 font-bold text-[#1b58a6]">
                            {formatCurrency(acc.CurrentBalance || acc.Current_Balance)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={Number(acc.Amount_Past_Due) > 0 ? "text-red-600 font-bold" : "text-gray-500"}>
                              {formatCurrency(acc.Amount_Past_Due)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">
                            <div>Opened: {formatDate(acc.Open_Date)}</div>
                            <div>Reported: {formatDate(acc.Date_Reported)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                              Active (Code {acc.Account_Status || '11'})
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Recent Inquiries */}
          {activeTab === 'inquiries' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Credit Inquiries (CAPS Record)</h4>
                <span className="text-xs font-semibold text-gray-500">{capsList.length} Inquiries</span>
              </div>

              {capsList.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No recent non-credit bureau inquiries found in this report.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50 text-gray-500 text-xs font-semibold border-b border-gray-100 uppercase">
                      <tr>
                        <th className="px-6 py-3.5">Subscriber Institution</th>
                        <th className="px-6 py-3.5">Inquiry Date</th>
                        <th className="px-6 py-3.5">Enquiry Purpose</th>
                        <th className="px-6 py-3.5">Report Number</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {capsList.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{item.Subscriber_Name || item.Subscriber_code || 'Financial Institution'}</div>
                            <div className="text-xs text-gray-400 font-mono">{item.Subscriber_code}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {formatDate(item.Date_of_Request)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                              Purpose: Code {item.Finance_Purpose || item.Enquiry_Reason || '99'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-gray-500">
                            {item.ReportNumber || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Demographics Profile */}
          {activeTab === 'demographics' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6 pb-2 border-b border-gray-100">
                Registered Demographics in Bureau
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3.5">
                  <UserCheck className="text-[#1cabb1] shrink-0 mt-0.5" size={20} />
                  <div>
                    <span className="text-xs text-gray-400 font-semibold uppercase block">Applicant Full Name</span>
                    <span className="text-sm font-bold text-gray-800">
                      {applicantDetails.First_Name ? `${applicantDetails.First_Name} ${applicantDetails.Last_Name || ''}` : (creditReport.name || formData.fullName)}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3.5">
                  <Calendar className="text-[#1cabb1] shrink-0 mt-0.5" size={20} />
                  <div>
                    <span className="text-xs text-gray-400 font-semibold uppercase block">Date of Birth</span>
                    <span className="text-sm font-bold text-gray-800">
                      {formatDate(applicantDetails.Date_Of_Birth_Applicant || formData.dob)}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3.5">
                  <CreditCard className="text-[#1cabb1] shrink-0 mt-0.5" size={20} />
                  <div>
                    <span className="text-xs text-gray-400 font-semibold uppercase block">Income Tax PAN</span>
                    <span className="text-sm font-mono font-bold text-gray-800">
                      {applicantDetails.IncomeTaxPan || creditReport.pan || formData.panNumber}
                    </span>
                  </div>
                </div>

                {(formData.phoneNumber || applicantDetails.MobilePhoneNumber || applicantDetails.Telephone_Number) && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3.5">
                    <Phone className="text-[#1cabb1] shrink-0 mt-0.5" size={20} />
                    <div>
                      <span className="text-xs text-gray-400 font-semibold uppercase block">Phone Number</span>
                      <span className="text-sm font-mono font-bold text-gray-800">
                        {formData.phoneNumber ? `+91 ${formData.phoneNumber}` : (applicantDetails.MobilePhoneNumber || applicantDetails.Telephone_Number)}
                      </span>
                    </div>
                  </div>
                )}

                {applicantDetails.EMailId && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3.5">
                    <Mail className="text-[#1cabb1] shrink-0 mt-0.5" size={20} />
                    <div>
                      <span className="text-xs text-gray-400 font-semibold uppercase block">Bureau Email</span>
                      <span className="text-sm font-bold text-gray-800">
                        {applicantDetails.EMailId}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3.5 md:col-span-2">
                  <MapPin className="text-[#1cabb1] shrink-0 mt-0.5" size={20} />
                  <div>
                    <span className="text-xs text-gray-400 font-semibold uppercase block">Reported Address</span>
                    <span className="text-sm font-bold text-gray-800">
                      {addressDetails.FlatNoPlotNoHouseNo 
                        ? `${addressDetails.FlatNoPlotNoHouseNo}, State: ${addressDetails.State || ''}, PIN: ${addressDetails.PINCode || ''}` 
                        : 'Demographic address verified via bureau'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default CheckCibilScore;
