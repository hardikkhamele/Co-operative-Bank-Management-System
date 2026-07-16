import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';
import useAuthStore from '../../store/authStore';
import loginIllustration from '../../assets/images/login.png';
import { UserCog, User } from 'lucide-react';

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selection */}
        <div className="flex justify-center gap-6 mb-6">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'superadmin' })}
            className={`flex flex-col items-center justify-center w-32 h-32 rounded-xl transition-all shadow-sm ${
              formData.role === 'superadmin'
                ? 'bg-[#5a5ce5] text-white border-transparent'
                : 'bg-white text-gray-800 border-2 border-green-100 hover:border-green-200'
            }`}
          >
            <div className={`p-3 rounded-full mb-2 ${formData.role === 'superadmin' ? 'bg-white/20' : 'bg-gray-100'}`}>
              <UserCog size={32} strokeWidth={1.5} />
            </div>
            <span className="font-semibold text-sm">Super Admin</span>
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'admin' })}
            className={`flex flex-col items-center justify-center w-32 h-32 rounded-xl transition-all shadow-sm ${
              formData.role === 'admin'
                ? 'bg-[#5a5ce5] text-white border-transparent'
                : 'bg-white text-gray-800 border-2 border-green-100 hover:border-green-200'
            }`}
          >
            <div className={`p-3 rounded-full mb-2 ${formData.role === 'admin' ? 'bg-white/20' : 'bg-gray-100'}`}>
              <User size={32} strokeWidth={1.5} />
            </div>
            <span className="font-semibold text-sm">Sub Admin</span>
          </button>
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
