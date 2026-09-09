import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';
import useAuthStore from '../../store/authStore';
import loginIllustration from '../../assets/images/login.png';
import { authService } from '../../api/authService';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { validateEmail, validatePassword } from '../../utils/validation';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({ 
    email: 'bank@advita.com', 
    password: '' 
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
        // Ensure root-level 'role' and data-level 'role' are merged so { id: null, name: 'Bank Owner' } is never missed
        const loginPayload = {
          ...(response.data || {}),
          ...response,
          role: response.role || response.data?.role || response.user?.role || response.data?.user?.role || null,
          user: response.data?.user || response.user || null,
          tokens: response.data?.tokens || response.tokens || null,
          permissions: response.permissions || response.data?.permissions || response.user?.permissions || response.data?.user?.permissions || []
        };
        login(loginPayload);

        // Smart landing navigation based on user role and permissions
        const rawRole = (
          loginPayload.role?.name ||
          loginPayload.role?.code ||
          (typeof loginPayload.role === 'string' ? loginPayload.role : '') ||
          loginPayload.user?.role?.name ||
          ''
        ).toUpperCase();

        const isReceiptMgr = (
          rawRole.includes('RECEIPT MANAGER') ||
          rawRole.includes('RECEIPT_MANAGER') ||
          rawRole.includes('BANK RECEIPT')
        );

        const perms = loginPayload.permissions || [];
        const hasDashboardPerm = Array.isArray(perms) && perms.some(p => {
          const k = (typeof p === 'string' ? p : p?.key || '').toLowerCase();
          return k === 'dashboard.view' || k === 'all' || k === '*';
        });

        if (isReceiptMgr && !hasDashboardPerm) {
          navigate('/credit');
        } else {
          navigate('/dashboard');
        }
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
    <AuthLayout 
      welcomeHeading={"WELCOME TO\nADVITA CO-OPERATIVE & BRANCH"}
      illustration={<img src={loginIllustration} alt="Login Illustration" className="w-full h-auto object-contain drop-shadow-xl" />}
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
          <span className="text-[#1B4E8C]">CO-OPERATIVE </span>
          <span className="text-[#EF3B3A]">PORTAL</span>
        </h2>
        <p className="text-[13px] text-gray-500 font-medium mt-1.5 leading-normal">
          Sign in with your registered email and password.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-medium">
          <AlertCircle className="text-red-500 w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3.5 rounded-[14px] bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 transition-all text-[14px] text-gray-800 placeholder-gray-400 font-medium outline-none"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-4 pr-12 py-3.5 rounded-[14px] bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 transition-all text-[14px] text-gray-800 placeholder-gray-400 font-medium outline-none"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-[#1B4E8C] transition-colors focus:outline-none"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        <div className="text-right pt-0.5">
          <Link to="/forgot-password" className="text-[12.5px] font-bold text-[#1B4E8C] hover:text-[#EF3B3A] transition-colors">
            Forget Password ?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 bg-[#1B4E8C] hover:bg-[#153e70] active:scale-[0.99] disabled:opacity-70 text-white font-bold rounded-[14px] shadow-lg shadow-[#1B4E8C]/25 hover:shadow-xl transition-all flex justify-center items-center text-[15px] tracking-wide cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4.5 w-4.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

export default Login;
