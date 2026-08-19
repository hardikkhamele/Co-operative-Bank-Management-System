import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Download, CheckCircle2, User, Calendar, Users, MapPin, CreditCard, FileText } from 'lucide-react';
import { kycService } from '../../api/kycService';
import { toast } from 'react-toastify';

const KycVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [step, setStep] = useState('form'); // 'form' or 'result'
  const [activeTab, setActiveTab] = useState('aadhaar'); // 'aadhaar' or 'pan'
  
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    panNumber: '',
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConsentChecked) return;

    const idNumber = activeTab === 'aadhaar' ? formData.aadhaarNumber : formData.panNumber;
    
    // Basic validation
    if (activeTab === 'aadhaar' && !/^\d{12}$/.test(idNumber)) {
      toast.error('Aadhaar number must be exactly 12 digits');
      return;
    }
    if (activeTab === 'pan' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(idNumber)) {
      toast.error('Invalid PAN number format');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        documentType: activeTab.toUpperCase(),
        idNumber: idNumber.toUpperCase(),
        consent: isConsentChecked,
        redirectUrl: `${window.location.origin}/dashboard/kyc/callback`,
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
      toast.error(error.response?.data?.message || 'Failed to initiate KYC. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      aadhaarNumber: '',
      panNumber: '',
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h1 className="text-xl font-bold text-[#1D4ED8] mb-2">KYC Verification</h1>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Link to="/dashboard" className="hover:text-[#1D4ED8] transition-colors">Dashboard</Link>
              <span>&gt;</span>
              <span>Verification</span>
              <span>&gt;</span>
              <span className="text-[#1D4ED8] font-medium">KYC Verification</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { setActiveTab('aadhaar'); handleReset(); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'aadhaar'
                  ? 'bg-[#f0f2ff] text-gray-800'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <CreditCard size={18} />
              Aadhaar Verification
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('pan'); handleReset(); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'pan'
                  ? 'bg-[#f0f2ff] text-gray-800'
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
              <h3 className="text-lg font-bold text-[#1D4ED8]">
                {activeTab === 'aadhaar' ? 'Aadhaar Verification' : 'PAN Verification'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="max-w-md space-y-2 mb-8">
                <label className="text-sm font-semibold text-gray-700 block">
                  {activeTab === 'aadhaar' ? 'Aadhaar Number' : 'PAN Number'}
                </label>
                <input
                  type="text"
                  name={activeTab === 'aadhaar' ? 'aadhaarNumber' : 'panNumber'}
                  value={activeTab === 'aadhaar' ? formData.aadhaarNumber : formData.panNumber}
                  onChange={handleInputChange}
                  placeholder={activeTab === 'aadhaar' ? 'Enter 12 digit aadhaar number' : 'Enter 10 char PAN number'}
                  className={`w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all bg-gray-50/50 ${activeTab === 'pan' ? 'uppercase' : ''}`}
                  required
                />
              </div>

              <div className="mb-10 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={isConsentChecked}
                  onChange={(e) => setIsConsentChecked(e.target.checked)}
                  className="w-4 h-4 text-[#1D4ED8] border-gray-300 rounded focus:ring-[#1D4ED8] cursor-pointer"
                  required
                />
                <label htmlFor="consent" className="text-sm font-medium text-gray-600 cursor-pointer select-none">
                  I consent to verify my identity using DigiLocker.
                </label>
              </div>

              <div className="flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="px-8 py-2.5 rounded-full text-[#1D4ED8] font-semibold border border-[#1D4ED8] hover:bg-[#1D4ED8]/5 transition-colors disabled:opacity-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={!isConsentChecked || loading}
                  className="px-8 py-2.5 rounded-full bg-[#1D4ED8] text-white font-semibold hover:bg-[#159a9f] transition-all shadow-md shadow-[#1D4ED8]/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 flex items-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  Verify with DigiLocker
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 w-full">
          {/* Result Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h1 className="text-xl font-bold text-[#1D4ED8] mb-2">KYC Report</h1>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Link to="/dashboard" className="hover:text-[#1D4ED8] transition-colors">Dashboard</Link>
              <span>&gt;</span>
              <span>Verification</span>
              <span>&gt;</span>
              <span className="text-gray-500 hover:text-[#1D4ED8] cursor-pointer transition-colors" onClick={() => { setStep('form'); setReportData(null); setCurrentRefId(null); }}>KYC Verification</span>
              <span>&gt;</span>
              <span className="text-[#1D4ED8] font-medium">KYC Report</span>
            </div>
          </div>

          {/* Result Content */}
          <div className="bg-[#f8f9fa] rounded-xl border border-gray-100 p-8 flex flex-col gap-8 relative overflow-hidden">
             
            {/* User Profile Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 overflow-hidden border-2 border-indigo-50 shadow-sm relative flex-shrink-0">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(reportData?.fullName || 'User')}&background=6366f1&color=fff&size=128`}
                    alt={reportData?.fullName || "User Avatar"} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{reportData?.fullName || 'N/A'}</h2>
                  <p className="text-sm text-gray-500">
                    {activeTab === 'aadhaar' ? reportData?.aadhaarNumber : reportData?.panNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-[#22c55e] text-white rounded-full text-sm font-semibold shadow-sm shadow-[#22c55e]/20 self-start sm:self-auto">
                <CheckCircle2 size={16} />
                {activeTab === 'aadhaar' ? 'Aadhaar Verified' : 'PAN Verified'}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="mt-1 text-[#1D4ED8]">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Gender</p>
                  <p className="text-sm font-semibold text-gray-800 capitalize">{reportData?.gender?.toLowerCase() || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="mt-1 text-[#1D4ED8]">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Date Of Birth</p>
                  <p className="text-sm font-semibold text-gray-800">{reportData?.dob || 'N/A'}</p>
                </div>
              </div>

              {reportData?.fatherName && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="mt-1 text-[#1D4ED8]">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-1">Father Name</p>
                    <p className="text-sm font-semibold text-gray-800">{reportData?.fatherName || 'N/A'}</p>
                  </div>
                </div>
              )}

              {reportData?.address && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="mt-1 text-[#1D4ED8]">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-1">Address</p>
                    <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                      {reportData?.address || 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center mt-4">
              <button 
                onClick={handleDownload}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-2.5 rounded-full bg-[#1D4ED8] text-white font-bold hover:bg-[#159a9f] transition-all shadow-md shadow-[#1D4ED8]/30 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:transform-none"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Download size={18} />
                )}
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycVerification;
