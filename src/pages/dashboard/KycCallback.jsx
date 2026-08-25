import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { kycService } from '../../api/kycService';
import { toast } from 'react-toastify';

const KycCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // 'SUCCESS' | 'FAILED'
  const [verifiedData, setVerifiedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const completeVerification = async () => {
      // Look for refid in URL search params or sessionStorage
      const queryRefId = searchParams.get('refid') || searchParams.get('ref_id') || searchParams.get('referenceId');
      const sessionRefId = sessionStorage.getItem('kyc_refid');
      const refid = queryRefId || sessionRefId;

      if (!refid) {
        setStatus('FAILED');
        setErrorMessage('KYC session reference ID was not found. Please initiate verification again.');
        setLoading(false);
        return;
      }

      try {
        const response = await kycService.completeKyc({ refid });
        if (response.success && (response.data?.status === 'VERIFIED' || response.data?.status === 'SUCCESS' || response.data?.personalDetails)) {
          setStatus('SUCCESS');
          setVerifiedData({
            refid: response.data.refid || refid,
            name: response.data.personalDetails?.fullName || response.data.personalDetails?.name || response.data.name || 'Verified Applicant',
            documentType: response.data.personalDetails?.documentType || response.data.documentType || 'DigiLocker KYC',
            status: response.data.status || 'VERIFIED',
          });
          toast.success('KYC verified successfully!');
        } else {
          setStatus('FAILED');
          setErrorMessage(response.message || 'KYC verification could not be completed or was rejected.');
          toast.error('KYC verification failed or is pending.');
        }
      } catch (error) {
        console.error('KYC complete error:', error);
        setStatus('FAILED');
        setErrorMessage(error.response?.data?.message || 'Failed to complete KYC verification. Please try again.');
        toast.error(error.response?.data?.message || 'Failed to complete KYC verification.');
      } finally {
        setLoading(false);
        sessionStorage.removeItem('kyc_refid'); // Clean up session
      }
    };

    completeVerification();
  }, [searchParams]);

  const handleOkClick = () => {
    if (verifiedData?.refid) {
      navigate('/kyc', { state: { refid: verifiedData.refid } });
    } else {
      navigate('/kyc');
    }
  };

  const handleRetryClick = () => {
    navigate('/kyc');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      {loading ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full text-center flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[#225091]/20 border-t-[#225091] rounded-full animate-spin mb-5"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Completing DigiLocker Verification...</h2>
          <p className="text-sm text-gray-500">
            Please wait while we fetch and securely verify your documents from the DigiLocker gateway.
          </p>
        </div>
      ) : status === 'SUCCESS' ? (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 border-4 border-emerald-100 shadow-xs">
            <CheckCircle2 size={44} strokeWidth={2.5} />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
            <ShieldCheck size={14} /> DigiLocker Verified
          </span>

          <h2 className="text-2xl font-bold text-[#225091] font-heading mb-2">
            Verification Done!
          </h2>
          
          <p className="text-sm text-gray-600 mb-6">
            Your document has been verified successfully. Click OK below to view your full KYC details and download report.
          </p>

          {verifiedData && (
            <div className="bg-gray-50/80 rounded-xl p-4 mb-6 border border-gray-100 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Applicant Name:</span>
                <span className="text-gray-900 font-semibold">{verifiedData.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Reference ID:</span>
                <span className="text-gray-900 font-mono font-medium">{verifiedData.refid}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Status:</span>
                <span className="text-emerald-700 font-bold uppercase">{verifiedData.status}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleOkClick}
            className="w-full py-3.5 px-6 rounded-xl bg-[#225091] hover:bg-[#193e73] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>OK, View KYC Details</span>
            <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-5 border-4 border-rose-100 shadow-xs">
            <XCircle size={44} strokeWidth={2.5} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 font-heading mb-2">
            Verification Incomplete
          </h2>

          <p className="text-sm text-gray-600 mb-6">
            {errorMessage || 'DigiLocker verification could not be completed.'}
          </p>

          <button
            onClick={handleRetryClick}
            className="w-full py-3.5 px-6 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={16} />
            <span>Return to KYC Verification</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default KycCallback;
