import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';
import forgotIllustration from '../../assets/images/forgot-password.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    navigate('/verify-otp');
  };

  return (
    <AuthLayout illustration={<img src={forgotIllustration} alt="Forgot Password Illustration" className="w-full max-w-md object-contain drop-shadow-2xl" />}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Super Admin Portal</h2>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Forget Password ?</h3>
        <p className="text-sm text-gray-500">Enter your registered email address to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5a5ce5] focus:border-transparent transition-all bg-white"
            placeholder="Enter email"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-[#5a5ce5] hover:bg-[#484ab9] text-white font-medium rounded-full transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5a5ce5]"
        >
          Get OTP
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
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
