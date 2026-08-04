import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';
import useAuthStore from '../../store/authStore';
import loginIllustration from '../../assets/images/login.png';
import { authService } from '../../api/authService';
import { AlertCircle, Eye, EyeOff, UserCog, User, Landmark } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ 
    role: '', 
    email: '', 
    password: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
<<<<<<< HEAD
  const [roles, setRoles] = useState([]);
=======
  const defaultRoles = [
    { code: 'BANK_OWNER', name: 'Bank Owner' },
    { code: 'BRANCH_MANAGER', name: 'Branch Manager' },
    { code: 'EMPLOYEE', name: 'Employee' }
  ];
  const [roles, setRoles] = useState(defaultRoles);
>>>>>>> origin/main

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await authService.getRoles();
        if (response.success && response.data) {
          // Use allRoles if available, otherwise combine system and custom roles
          const availableRoles = response.data.allRoles || [...(response.data.systemRoles || []), ...(response.data.customRoles || [])];
<<<<<<< HEAD
          setRoles(availableRoles);
        }
      } catch (err) {
        console.error("Failed to fetch roles:", err);
        // Fallback roles if the backend times out or is spinning up
        setRoles([
          { code: 'BANK_OWNER', name: 'Bank Owner' },
          { code: 'BRANCH_MANAGER', name: 'Branch Manager' },
          { code: 'CA', name: 'Chartered Accountant' }
        ]);
=======
          if (availableRoles.length > 0) {
            setRoles(availableRoles);
          }
        }
      } catch (err) {
        console.error("Failed to fetch roles, using default roles:", err);
>>>>>>> origin/main
      }
    };
    fetchRoles();
  }, []);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role) {
       setError("Please select a role");
       return;
    }
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      if (response.success && response.data) {
        login(response.data); // pass full payload to Zustand
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
    <AuthLayout illustration={<img src={loginIllustration} alt="Login Illustration" className="w-full max-w-md object-contain drop-shadow-2xl" />}>
      <div className="flex flex-col items-center text-center mb-8">
        <div className="bg-white p-3 rounded-xl shadow-sm mb-6 flex flex-col items-center justify-center w-20 h-20">
          <Landmark size={32} className="text-gray-900 mb-1" />
          <span className="text-[10px] font-bold text-gray-900 tracking-wider">BANK</span>
        </div>
        <h2 className="text-[28px] font-bold text-gray-900 mb-2">Welcome Back</h2>
        <h3 className="text-[18px] font-bold text-gray-800 mb-4">Login</h3>
        <p className="text-[14px] font-semibold text-gray-500">Sign in with your registered email and password.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-center gap-3">
          <AlertCircle className="text-red-500 w-5 h-5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selection */}
        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-2">Role</label>
          <div className="relative">
            <select
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5a5ce5] focus:border-transparent transition-all bg-white appearance-none text-gray-700 text-sm"
            >
              <option value="" disabled>Select</option>
              {roles.map(role => (
                <option key={role.code} value={role.code}>{role.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5a5ce5] focus:border-transparent transition-all bg-white text-sm placeholder-gray-500"
            placeholder="Enter email"
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-gray-700 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5a5ce5] focus:border-transparent transition-all bg-white text-sm placeholder-gray-500"
              placeholder="Enter Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-2 mb-6">
          <Link to="/forgot-password" className="text-[13px] text-[#00bcd4] hover:text-[#00a0b5] font-medium">
            Forget Password ?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 px-4 bg-[#295995] text-white text-[15px] font-medium rounded-full transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#295995] flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#1f4577]'}`}
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Login'
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
