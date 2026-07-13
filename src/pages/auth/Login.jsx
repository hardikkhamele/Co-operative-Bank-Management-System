import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';
import useAuthStore from '../../store/authStore';
import loginIllustration from '../../assets/images/login.png';

const Login = () => {
  const [formData, setFormData] = useState({ 
    role: 'superadmin', 
    email: 'eleanor.pena@company.com', 
    password: 'password123' 
  });
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login
    login({ email: formData.email, role: formData.role }, 'dummy-token-123');
    // Navigate to dashboard or home
    navigate('/dashboard');
  };

  return (
    <AuthLayout illustration={<img src={loginIllustration} alt="Login Illustration" className="w-full max-w-md object-contain drop-shadow-2xl" />}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Super Admin Portal</h2>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Login</h3>
        <p className="text-sm text-gray-500">Sign in with your registered email and password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
          <div className="relative">
            <select
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5a5ce5] focus:border-transparent transition-all bg-white appearance-none"
            >
              <option value="" disabled>Select</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Admin</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5a5ce5] focus:border-transparent transition-all bg-white"
            placeholder="Enter email"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5a5ce5] focus:border-transparent transition-all bg-white"
            placeholder="Enter Password"
          />
        </div>

        <div className="flex justify-end mt-2 mb-6">
          <Link to="/forgot-password" className="text-sm text-[#00bcd4] hover:text-[#00a0b5] font-semibold">
            Forget Password ?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-[#5a5ce5] hover:bg-[#484ab9] text-white font-medium rounded-full transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5a5ce5]"
        >
          Login
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
