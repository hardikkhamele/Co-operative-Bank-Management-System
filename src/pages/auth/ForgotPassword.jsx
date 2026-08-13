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
    <AuthLayout illustration={<img src={forgotIllustration} alt="Forgot Password Illustration" className="w-full max-w-md object-contain drop-shadow-2xl" />}>
      <div className="flex flex-col items-center mb-6 text-center">
        <svg viewBox="0 0 200 180" className="w-16 h-16 mb-2">
          <polygon points="30,100 80,100 110,160 60,160" fill="#ef3b3a" />
          <polygon points="100,10 180,160 130,160 90,80" fill="#1b58a6" />
        </svg>
        <div className="flex flex-col text-center text-[#1b58a6] mb-4">
            <span className="font-extrabold text-[15px] leading-tight tracking-wide">ADVITA CREDIT</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Forget Password ?</h2>
        <p className="text-xs text-gray-500">Enter your registered email address to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1b58a6] focus:border-transparent transition-all bg-white"
            placeholder="Enter email"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 mt-2 bg-[#1b58a6] hover:bg-[#154685] disabled:bg-gray-400 text-white font-medium rounded-full transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1b58a6] text-sm"
        >
          {loading ? 'Sending...' : 'Get OTP'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Remember Password ?{' '}
          <Link to="/login" className="text-[#00bcd4] hover:text-[#00a0b5] font-semibold">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
