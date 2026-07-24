import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';
import useAuthStore from '../../store/authStore';
import loginIllustration from '../../assets/images/login.png';

const Login = () => {
  const [formData, setFormData] = useState({ 
    role: '', 
    email: '', 
    password: '' 
  });
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.role) {
       alert("Please select a role");
       return;
    }
    // Simulate login
    login({ email: formData.email, role: formData.role }, 'dummy-token-123');
    // Navigate to dashboard or home
    navigate('/dashboard');
  };

  return (
    <AuthLayout illustration={<img src={loginIllustration} alt="Login Illustration" className="w-full max-w-md object-contain drop-shadow-2xl" />}>
      <div className="flex flex-col items-center mb-6">
        <svg viewBox="0 0 200 180" className="w-16 h-16 mb-2">
          <polygon points="30,100 80,100 110,160 60,160" fill="#ef3b3a" />
          <polygon points="100,10 180,160 130,160 90,80" fill="#1b58a6" />
        </svg>
        <div className="flex flex-col text-center text-[#1b58a6] mb-4">
            <span className="font-extrabold text-[15px] leading-tight tracking-wide">ADVITA CREDIT</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Welcome Back</h2>
        <h3 className="text-md font-semibold text-gray-700 mb-1">Login</h3>
        <p className="text-xs text-gray-500">Sign in with your registered email and password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Select</label>
          <div className="relative">
            <select
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1b58a6] focus:border-transparent transition-all bg-white appearance-none text-sm text-gray-700"
            >
              <option value="" disabled>Select...</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Sub Admin</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1b58a6] focus:border-transparent transition-all bg-white"
            placeholder="Enter email"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1b58a6] focus:border-transparent transition-all bg-white"
            placeholder="Enter Password"
          />
        </div>

        <div className="flex justify-end mt-1 mb-5">
          <Link to="/forgot-password" className="text-xs text-[#00bcd4] hover:text-[#00a0b5] font-semibold">
            Forget Password ?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-[#1b58a6] hover:bg-[#154685] text-white font-medium rounded-full transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1b58a6] text-sm"
        >
          Login
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
