import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthLayout from '../../components/layouts/AuthLayout';
import forgotIllustration from '../../assets/images/forgot-password.png';
import { validateEmail } from '../../utils/validation';
import { authService } from '../../api/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const check = validateEmail(email);
    if (!check.isValid) {
      toast.error(check.error);
      return;
    }
    
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      toast.success(res.message || 'OTP sent successfully');
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      welcomeHeading={"WELCOME TO\nADVITA COOPERATIVE & BRANCH"}
      illustration={<img src={forgotIllustration} alt="Forgot Password Illustration" className="w-full h-auto object-contain drop-shadow-xl" />}
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
          <span className="text-[#1B4E8C]">FORGOT </span>
          <span className="text-[#EF3B3A]">PASSWORD</span>
        </h2>
        <p className="text-[13px] text-gray-500 font-medium mt-1.5 leading-normal">
          Enter your registered email address to receive OTP.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-[13px] font-bold text-gray-700 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 rounded-[14px] bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 transition-all text-[14px] text-gray-800 placeholder-gray-400 font-medium outline-none"
            placeholder="Enter your registered email"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 bg-[#1B4E8C] hover:bg-[#153e70] active:scale-[0.99] disabled:opacity-70 text-white font-bold rounded-[14px] shadow-lg shadow-[#1B4E8C]/25 hover:shadow-xl transition-all flex justify-center items-center text-[15px] tracking-wide cursor-pointer"
        >
          {loading ? 'Sending OTP...' : 'Get OTP'}
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

export default ForgotPassword;
