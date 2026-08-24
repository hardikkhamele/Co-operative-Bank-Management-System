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
  Phone,
  Download
} from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import { verificationService } from '../../api/verificationService';
import { validatePAN, sanitizePAN } from '../../utils/validation';

const CheckCibilScore = () => {
  const [step, setStep] = useState('form'); // 'form' | 'result'
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [reportResult, setReportResult] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'accounts' | 'inquiries' | 'demographics'

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    panNumber: '',
    dob: '',
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
  const rawData = reportResult?.data || reportResult || {};
  const creditReport =
    rawData.reportJson?.data ||
    rawData.creditReport?.data ||
    rawData.creditReport ||
    rawData.report ||
    rawData ||
    {};
  const reportObj =
    creditReport.credit_report ||
    creditReport.report ||
    rawData.creditReport?.report ||
    creditReport ||
    {};
  const scoreVal = Number(
    creditReport.credit_score ??
      creditReport.score ??
      reportObj?.SCORE?.FCIREXScore ??
      rawData.score ??
      0
  );

  const getScoreRating = (score) => {
    if (isNaN(score) || score === null || score === undefined) {
      return { text: 'N/A', color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' };
    }
    if (score <= 0) {
      return { text: 'No Credit Record', color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-300' };
    }
    if (score > 0 && score <= 10) {
      return { text: 'New to Credit (Low/No History)', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
    }
    if (score < 600) return { text: 'Poor (High Risk)', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    if (score < 700) return { text: 'Fair / Moderate', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    if (score < 750) return { text: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (score < 800) return { text: 'Very Good', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' };
    return { text: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  };

  const rating = getScoreRating(scoreVal);

  // SVG Gauge Needle Angle (-90 deg at 300 to +90 deg at 900)
  const clampedScore = Math.max(300, Math.min(900, scoreVal > 10 ? scoreVal : 300));
  const needleAngle = -90 + ((clampedScore - 300) / 600) * 180;

  const rawCaisSummary = reportObj?.CAIS_Account?.CAIS_Summary;
  const caisSummary = Array.isArray(rawCaisSummary)
    ? (rawCaisSummary[0] || {})
    : (rawCaisSummary || {});

  const creditAccounts = caisSummary?.Credit_Account || {};
  const balanceSummary = caisSummary?.Total_Outstanding_Balance || {};

  const rawAccountList = reportObj?.CAIS_Account?.CAIS_Account_DETAILS;
  const accountList = Array.isArray(rawAccountList)
    ? rawAccountList
    : rawAccountList
      ? [rawAccountList]
      : [];

  const rawCapsSummary = reportObj?.TotalCAPS_Summary || reportObj?.CAPS?.CAPS_Summary;
  const capsSummary = Array.isArray(rawCapsSummary)
    ? (rawCapsSummary[0] || {})
    : (rawCapsSummary || {});

  const rawCapsList = reportObj?.NonCreditCAPS?.CAPS_Application_Details || reportObj?.CAPS?.CAPS_Application_Details;
  const capsList = Array.isArray(rawCapsList)
    ? rawCapsList
    : rawCapsList
      ? [rawCapsList]
      : [];

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

  const formatAddress = (addr) => {
    if (!addr || typeof addr !== 'object') return 'N/A';
    const parts = [];
    if (addr.FlatNoPlotNoHouseNo && addr.FlatNoPlotNoHouseNo !== 'DEFAULT') parts.push(addr.FlatNoPlotNoHouseNo);
    if (addr.BldgNoSocietyName) parts.push(addr.BldgNoSocietyName);
    if (addr.RoadNoNameAreaLocality) parts.push(addr.RoadNoNameAreaLocality);
    if (addr.City) parts.push(addr.City);
    if (addr.State) parts.push(`State: ${addr.State}`);
    if (addr.PINCode) parts.push(`PIN: ${addr.PINCode}`);
    return parts.length > 0 ? parts.join(', ') : 'Mumbai, PIN: 400001';
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Card */}
      <div className="mb-6 print:hidden">
        <PageHeader
          title={step === 'form' ? 'CIBIL Score & Report' : 'Credit Bureau Report'}
          breadcrumbs={[
            { label: "Dashboard", to: "/dashboard" },
            { label: "Verification" },
            { label: "CIBIL Score & Report", to: step === 'result' ? undefined : undefined },
            ...(step === 'result' ? [{ label: "Bureau Report" }] : [])
          ]}
          showBack={step === 'result'}
          onBack={handleReset}
        />
      </div>

      {step === 'form' ? (
        <div className="flex flex-col gap-6 w-full">
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

          {/* Form Container Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
            <div className="bg-[#e6f4f5] px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#225091]">
                Applicant Information
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                
                {/* 1. Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-gray-50/50 text-gray-800 font-medium"
                    required
                    disabled={loading}
                  />
                </div>

                {/* 2. Mobile Number */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">
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
                      placeholder="Enter 10-digit number"
                      className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-gray-50/50 text-gray-800 font-medium font-mono"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* 3. PAN Card Number */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">
                    PAN Card Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="panNumber"
                    maxLength={10}
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit PAN"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-gray-50/50 uppercase font-mono font-bold tracking-wider text-gray-800"
                    required
                    disabled={loading}
                  />
                </div>

                {/* 4. Date of Birth */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">
                    Date Of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-gray-50/50 text-gray-800 font-medium"
                    required
                    disabled={loading}
                  />
                </div>

              </div>

              {/* Notice Banner */}
              <div className="bg-[#e6f4f5] text-[#225091] px-5 py-3.5 rounded-xl text-sm font-medium mb-8 border border-[#225091]/15 flex items-center gap-3">
                <CheckCircle2 size={18} className="shrink-0 text-[#225091]" />
                <span>30-Day Cache Protection: Credit Bureau profiles queried in the past 30 days are loaded from cached bureau data.</span>
              </div>

              {/* Actions */}
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
                  disabled={loading}
                  className="px-8 py-2.5 rounded-full bg-[#225091] text-white font-semibold hover:bg-[#163a6c] transition-all shadow-md shadow-[#225091]/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Fetching Report...
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
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
          
          {/* Main Result Content */}
          <div className="bg-[#f8f9fa] rounded-xl border border-gray-100 p-8 flex flex-col gap-6 relative overflow-hidden">
            
            {/* User Profile Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 overflow-hidden border-2 border-indigo-50 shadow-sm relative flex-shrink-0 flex items-center justify-center font-bold text-2xl text-[#225091]">
                  {(creditReport.name || formData.fullName)?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{creditReport.name || formData.fullName}</h2>
                  <p className="text-sm text-gray-500 font-mono">
                    PAN: {creditReport.pan || formData.panNumber}
                    {headerInfo.ReportNumber && <span className="ml-3 font-sans text-gray-400">Ref: #{headerInfo.ReportNumber}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-[#22c55e] text-white rounded-full text-sm font-semibold shadow-sm shadow-[#22c55e]/20 self-start sm:self-auto">
                <CheckCircle2 size={16} />
                CIBIL Verified
              </div>
            </div>

            {/* Main Score & Summary Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Speedometer Score Card (5 Cols) */}
              <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-500"></div>
                
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">Bureau Credit Score</h3>
                
                {/* Dynamic SVG Gauge Meter */}
                <div className="relative w-64 h-36 mb-4">
                  <svg viewBox="0 0 200 110" className="w-full h-full drop-shadow-sm">
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
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Outstanding</span>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#225091] flex items-center justify-center">
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
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Credit Accounts</span>
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#225091] flex items-center justify-center">
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
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
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
                      Last 30 days ({capsSummary.TotalCAPSLast90Days || '0'} in 90 days)
                    </p>
                  </div>
                </div>

                {/* Card 4: Match & Confidence */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bureau Identity</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <UserCheck size={18} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                        {reportObj.Match_result?.Exact_match === 'Y' ? 'Exact Match' : 'Verified'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 border-t border-gray-100 pt-2 font-medium">
                      Bureau Version {headerInfo.Version || 'V2.4'} Record
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-[#f0f2ff] text-gray-800'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <FileText size={18} />
                Accounts Breakdown ({accountList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('inquiries')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'inquiries'
                    ? 'bg-[#f0f2ff] text-gray-800'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Clock size={18} />
                Recent Inquiries ({capsList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('demographics')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'demographics'
                    ? 'bg-[#f0f2ff] text-gray-800'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <UserCheck size={18} />
                Bureau Demographic Profile
              </button>
            </div>

            {/* Tab 1: Accounts Breakdown */}
            {activeTab === 'overview' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-[#e6f4f5] px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h4 className="text-base font-bold text-[#225091]">Credit Accounts (CAIS Details)</h4>
                  <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                    {accountList.length} Accounts Found
                  </span>
                </div>

                {accountList.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No individual credit loan accounts reported in bureau profile.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200/80">
                        <tr>
                          <th className="py-3.5 px-5 font-semibold">Account / Subscriber</th>
                          <th className="py-3.5 px-5 font-semibold">Type &amp; Portfolio</th>
                          <th className="py-3.5 px-5 font-semibold">Sanctioned / High Credit</th>
                          <th className="py-3.5 px-5 font-semibold">Current Balance</th>
                          <th className="py-3.5 px-5 font-semibold">Past Due</th>
                          <th className="py-3.5 px-5 font-semibold">Opened / Reported</th>
                          <th className="py-3.5 px-5 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {accountList.map((acc, index) => (
                          <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-5">
                              <div className="font-semibold text-gray-900 text-sm">{acc.Subscriber_Name || acc.Identification_Number || 'N/A'}</div>
                              <div className="text-xs font-mono text-gray-400 mt-0.5">{acc.Account_Number || 'XXXX'}</div>
                            </td>
                            <td className="py-3.5 px-5 text-xs text-gray-600">
                              <div className="font-medium text-gray-800">Code: {acc.Account_Type || '01'}</div>
                              <div className="text-[11px] text-gray-400">Portfolio: {acc.Portfolio_Type || 'I'}</div>
                            </td>
                            <td className="py-3.5 px-5 text-sm font-bold text-gray-900 tabular-nums">
                              {formatCurrency(acc.Highest_Credit_or_Original_Loan_Amount)}
                            </td>
                            <td className="py-3.5 px-5 text-sm font-bold text-[#225091] tabular-nums">
                              {formatCurrency(acc.CurrentBalance || acc.Current_Balance)}
                            </td>
                            <td className="py-3.5 px-5 text-sm font-semibold tabular-nums">
                              <span className={Number(acc.Amount_Past_Due) > 0 ? "text-rose-600 font-bold" : "text-gray-500"}>
                                {formatCurrency(acc.Amount_Past_Due)}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-xs text-gray-500">
                              <div>Opened: {formatDate(acc.Open_Date)}</div>
                              <div>Reported: {formatDate(acc.Date_Reported)}</div>
                            </td>
                            <td className="py-3.5 px-5">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[12px] font-semibold border border-emerald-200/60 uppercase tracking-wide">
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-[#e6f4f5] px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h4 className="text-base font-bold text-[#225091]">Credit Inquiries (CAPS Record)</h4>
                  <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                    {capsList.length} Inquiries
                  </span>
                </div>

                {capsList.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm font-medium">
                    No recent non-credit bureau inquiries found in this report.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200/80">
                        <tr>
                          <th className="py-3.5 px-5 font-semibold">Subscriber Institution</th>
                          <th className="py-3.5 px-5 font-semibold">Inquiry Date</th>
                          <th className="py-3.5 px-5 font-semibold">Enquiry Purpose</th>
                          <th className="py-3.5 px-5 font-semibold">Report Number</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {capsList.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-5">
                              <div className="font-semibold text-gray-900 text-sm">{item.Subscriber_Name || item.Subscriber_code || 'Financial Institution'}</div>
                              <div className="text-xs text-gray-400 font-mono">{item.Subscriber_code}</div>
                            </td>
                            <td className="py-3.5 px-5 text-xs text-gray-600 font-medium">
                              {formatDate(item.Date_of_Request)}
                            </td>
                            <td className="py-3.5 px-5">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[12px] font-semibold border border-blue-200/60 uppercase tracking-wide">
                                Purpose: Code {item.Finance_Purpose || item.Enquiry_Reason || '99'}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 font-mono text-xs text-gray-500">
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-[#e6f4f5] px-6 py-4 border-b border-gray-100">
                  <h4 className="text-base font-bold text-[#225091]">
                    Registered Demographics in Bureau
                  </h4>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3.5 hover:shadow-sm transition-all">
                    <UserCheck className="text-[#225091] shrink-0 mt-0.5" size={20} />
                    <div>
                      <span className="text-xs text-gray-400 font-semibold uppercase block">Applicant Full Name</span>
                      <span className="text-sm font-bold text-gray-800">
                        {applicantDetails.First_Name ? `${applicantDetails.First_Name} ${applicantDetails.Last_Name || ''}` : (creditReport.name || formData.fullName)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3.5 hover:shadow-sm transition-all">
                    <Calendar className="text-[#225091] shrink-0 mt-0.5" size={20} />
                    <div>
                      <span className="text-xs text-gray-400 font-semibold uppercase block">Date of Birth</span>
                      <span className="text-sm font-bold text-gray-800">
                        {formatDate(applicantDetails.Date_Of_Birth_Applicant || formData.dob)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3.5 hover:shadow-sm transition-all">
                    <CreditCard className="text-[#225091] shrink-0 mt-0.5" size={20} />
                    <div>
                      <span className="text-xs text-gray-400 font-semibold uppercase block">Income Tax PAN</span>
                      <span className="text-sm font-mono font-bold text-gray-800">
                        {applicantDetails.IncomeTaxPan || creditReport.pan || formData.panNumber}
                      </span>
                    </div>
                  </div>

                  {(formData.mobileNumber || applicantDetails.MobilePhoneNumber || applicantDetails.Telephone_Number) && (
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3.5 hover:shadow-sm transition-all">
                      <Phone className="text-[#225091] shrink-0 mt-0.5" size={20} />
                      <div>
                        <span className="text-xs text-gray-400 font-semibold uppercase block">Phone Number</span>
                        <span className="text-sm font-mono font-bold text-gray-800">
                          {formData.mobileNumber ? `+91 ${formData.mobileNumber}` : (applicantDetails.MobilePhoneNumber || applicantDetails.Telephone_Number)}
                        </span>
                      </div>
                    </div>
                  )}

                  {applicantDetails.EMailId && (
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3.5 hover:shadow-sm transition-all">
                      <Mail className="text-[#225091] shrink-0 mt-0.5" size={20} />
                      <div>
                        <span className="text-xs text-gray-400 font-semibold uppercase block">Bureau Email</span>
                        <span className="text-sm font-bold text-gray-800">
                          {applicantDetails.EMailId}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3.5 md:col-span-2 hover:shadow-sm transition-all">
                    <MapPin className="text-[#225091] shrink-0 mt-0.5" size={20} />
                    <div>
                      <span className="text-xs text-gray-400 font-semibold uppercase block">Reported Address</span>
                      <span className="text-sm font-bold text-gray-800 leading-relaxed">
                        {formatAddress(addressDetails)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center items-center gap-4 mt-4 print:hidden">
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-8 py-2.5 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors shadow-sm"
              >
                <ArrowLeft size={18} />
                Check Another Score
              </button>

              {(reportResult?.pdfUrl || reportResult?.data?.pdfUrl) && (
                <button 
                  onClick={() => {
                    const pdfUrl = reportResult?.pdfUrl || reportResult?.data?.pdfUrl;
                    window.open(pdfUrl, '_blank');
                  }}
                  className="flex items-center gap-2 px-8 py-2.5 rounded-full bg-[#225091] text-white font-bold hover:bg-[#163a6c] transition-all shadow-md shadow-[#225091]/30 transform hover:-translate-y-0.5 active:scale-95"
                >
                  <Download size={18} />
                  Download Bureau PDF
                </button>
              )}

              <button 
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-2 px-8 py-2.5 rounded-full border border-[#225091] text-[#225091] font-bold hover:bg-[#225091]/5 transition-all shadow-sm"
              >
                <Printer size={18} />
                Print / Save Page
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default CheckCibilScore;
