import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthLayout from '../../components/layouts/AuthLayout';
import otpIllustration from '../../assets/images/enter-otp.png';
import { sanitizeDigits } from '../../utils/validation';
import { authService } from '../../api/authService';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleChange = (e, index) => {
    const cleanVal = sanitizeDigits(e.target.value, 1);
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Focus next input if value entered
    if (cleanVal && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = sanitizeDigits(e.clipboardData.getData('text'), 6);
    if (!pasteData) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length && i < 6; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);
    const focusIdx = Math.min(pasteData.length, 5);
    if (inputRefs.current[focusIdx]) {
      inputRefs.current[focusIdx].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      toast.error('Please enter complete 6-digit OTP.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await authService.verifyOtp({ email, otp: fullOtp });
      toast.success(res.message || 'OTP verified successfully');
      navigate('/reset-password', { state: { email, resetToken: res.data.resetToken } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await authService.resendOtp(email);
      toast.success(res.message || 'OTP resent successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <AuthLayout 
      welcomeHeading={"WELCOME TO\nADVITA CO-OPERATIVE & BRANCH"}
      illustration={<img src={otpIllustration} alt="Verify OTP Illustration" className="w-full h-auto object-contain drop-shadow-xl" />}
    >
      {/* Top Logo Badge inside Card */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 p-2 flex flex-col items-center justify-center shrink-0 w-[54px] h-[54px] mb-3.5">
          <svg viewBox="0 0 200 180" className="w-7 h-7">
            <polygon points="30,100 80,100 110,160 60,160" fill="#ef3b3a" />
            <polygon points="100,10 180,160 130,160 90,80" fill="#1b58a6" />
          </svg>
          <span className="text-[4.5px] font-black text-[#1b58a6] tracking-tighter mt-0.5 whitespace-nowrap">
            ADVITA CREDIT
          </span>
        </div>

        <h2 className="text-[22px] sm:text-[24px] font-black tracking-wide uppercase leading-tight">
          <span className="text-[#1B4E8C]">VERIFY </span>
          <span className="text-[#EF3B3A]">OTP</span>
        </h2>
        <p className="text-[13px] text-gray-500 font-medium mt-1.5 leading-normal">
          A 6-digit OTP has been sent to
          <span className="text-[#1B4E8C] font-bold flex items-center justify-center gap-1.5 mt-0.5 text-[13.5px]">
            {email}
            <button 
              type="button"
              onClick={() => navigate('/forgot-password')} 
              className="text-[#EF3B3A] hover:opacity-80 p-0.5 transition-opacity"
              title="Edit email"
            >
              <Pencil size={13} />
            </button>
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
        <div className="flex justify-center gap-2 sm:gap-2.5 mb-1 w-full">
          {otp.map((data, index) => (
            <input
              className="w-11 h-13 sm:w-12 sm:h-13 rounded-[14px] text-center text-xl font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-[#1B4E8C]/10 focus:border-[#1B4E8C] bg-[#EEF4FA] focus:bg-white transition-all border border-transparent shadow-xs"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name={`otp-${index}`}
              maxLength="1"
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              value={data}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>

        <p className="text-[13px] text-gray-500 my-1 font-medium">
          Didn't receive the code?{' '}
          <button type="button" onClick={handleResend} className="text-[#1B4E8C] hover:text-[#EF3B3A] font-bold transition-colors">
            Resend Code
          </button>
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 bg-[#1B4E8C] hover:bg-[#153e70] active:scale-[0.99] disabled:opacity-70 text-white font-bold rounded-[14px] shadow-lg shadow-[#1B4E8C]/25 hover:shadow-xl transition-all flex justify-center items-center text-[15px] tracking-wide cursor-pointer"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-[13px] text-gray-500 font-medium">
          Remember Password ?{' '}
          <Link to="/login" className="text-[#1B4E8C] hover:text-[#EF3B3A] font-bold transition-colors">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default VerifyOTP;
