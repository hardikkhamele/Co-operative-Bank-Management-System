import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { kycService } from '../../api/kycService';
import { toast } from 'react-toastify';

const KycCallback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const completeVerification = async () => {
      const refid = sessionStorage.getItem('kyc_refid');
      if (!refid) {
        toast.error('KYC session reference not found. Please try again.');
        navigate('/dashboard/kyc');
        return;
      }

      try {
        const response = await kycService.completeKyc({ refid });
        if (response.success && response.data.status === 'VERIFIED') {
          toast.success('KYC verified successfully!');
          // Pass the verified refid via state to display report
          navigate('/dashboard/kyc', { state: { refid: response.data.refid } });
        } else {
          toast.error('KYC verification failed or is pending.');
          navigate('/dashboard/kyc');
        }
      } catch (error) {
        console.error('KYC complete error:', error);
        toast.error(error.response?.data?.message || 'Failed to complete KYC verification.');
        navigate('/dashboard/kyc');
      } finally {
        setLoading(false);
        sessionStorage.removeItem('kyc_refid'); // Clean up
      }
    };

    completeVerification();
  }, [navigate]);

  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1D4ED8] rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700">Completing Verification...</h2>
      <p className="text-gray-500 mt-2">Please wait while we securely process your document.</p>
    </div>
  );
};

export default KycCallback;
