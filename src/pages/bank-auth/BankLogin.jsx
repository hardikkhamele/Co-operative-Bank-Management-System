import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';
import useAuthStore from '../../store/authStore';
import loginIllustration from '../../assets/images/login.png';
import { authService } from '../../api/authService';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { validateEmail, validatePassword } from '../../utils/validation';
import { toast } from 'react-toastify';

const BankLogin = () => {
  const [formData, setFormData] = useState({ 
    email: 'stark@bank.com', 
    password: 'Password@123' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.isValid) {
      setError(emailCheck.error);
      toast.error(emailCheck.error);
      return;
    }

    const passwordCheck = validatePassword(formData.password, { minLength: 6 });
    if (!passwordCheck.isValid) {
      setError(passwordCheck.error);
      toast.error(passwordCheck.error);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login({
        email: formData.email.trim(),
        password: formData.password
      });
      
      if (response && (response.success || response.data)) {
        const loginPayload = {
          ...(response.data || {}),
          ...response,
          role: response.role || response.data?.role || response.user?.role || response.data?.user?.role || null,
          user: response.data?.user || response.user || null,
          tokens: response.data?.tokens || response.tokens || null,
          permissions: response.permissions || response.data?.permissions || response.user?.permissions || response.data?.user?.permissions || []
        };
        login(loginPayload); // pass full payload to Zustand
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.data?.details && err.response.data.details.length > 0) {
        setError(`Validation Error: ${err.response.data.details.map(d => d.message).join(', ')}`);
      } else {
        setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
      }
      console.error('Login Error:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout illustration={<img src={loginIllustration} alt="Bank Login Illustration" className="w-full max-w-md object-contain drop-shadow-2xl" />}>
      <div className="flex flex-col items-center text-center mb-8">

        <h2 className="text-[32px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#0f4b86] to-[#1D4ED8] mb-2 tracking-tight">Welcome Back</h2>
        <h3 className="text-[16px] font-semibold text-gray-800 mb-2 uppercase tracking-widest opacity-80">Login</h3>
        <p className="text-[14px] font-medium text-gray-500 max-w-[260px] mx-auto leading-relaxed">Sign in with your registered email and password.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-center gap-3">
          <AlertCircle className="text-red-500 w-5 h-5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="relative group">
          <label className="block text-[13px] font-bold text-gray-700 mb-2 tracking-wide uppercase opacity-90 transition-all group-focus-within:text-[#1D4ED8]">Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-5 py-4 rounded-[14px] border border-gray-200/80 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1D4ED8]/15 focus:border-[#1D4ED8] transition-all duration-300 text-[15px] text-gray-800 placeholder-gray-400 font-medium shadow-sm hover:border-gray-300"
            placeholder="Enter email"
          />
        </div>

        <div className="relative group">
          <label className="block text-[13px] font-bold text-gray-700 mb-2 tracking-wide uppercase opacity-90 transition-all group-focus-within:text-[#1D4ED8]">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-5 pr-12 py-4 rounded-[14px] border border-gray-200/80 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1D4ED8]/15 focus:border-[#1D4ED8] transition-all duration-300 text-[15px] text-gray-800 placeholder-gray-400 font-medium shadow-sm hover:border-gray-300"
              placeholder="Enter Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-[#1D4ED8] transition-colors focus:outline-none"
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-2 mb-8">
          <Link to="/bank/forgot-password" className="text-[13px] text-[#1D4ED8] hover:text-[#148b90] font-bold transition-colors">
            Forget Password ?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 px-6 bg-gradient-to-r from-[#0f4b86] to-[#1D4ED8] text-white text-[16px] font-bold tracking-wide rounded-[14px] transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(28,171,177,0.4)] focus:outline-none focus:ring-4 focus:ring-[#1D4ED8]/30 flex justify-center items-center transform ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-[0_12px_25px_-6px_rgba(28,171,177,0.5)] active:translate-y-0'}`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Logging in...</span>
            </div>
          ) : (
            'Login'
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default BankLogin;
