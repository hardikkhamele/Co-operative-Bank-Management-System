import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BadgeCheck, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../../components/layouts/AuthLayout';
import resetIllustration from '../../assets/images/reset-password.png';
import { validatePassword, validateConfirmPassword } from '../../utils/validation';
import { authService } from '../../api/authService';
import { useEffect } from 'react';

const ResetPassword = () => {
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { email, resetToken } = location.state || {};

  useEffect(() => {
    if (!email || !resetToken) {
      navigate('/forgot-password');
    }
  }, [email, resetToken, navigate]);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const passCheck = validatePassword(passwords.newPassword, { minLength: 6, fieldName: 'New password' });
    if (!passCheck.isValid) {
      setError(passCheck.error);
      toast.error(passCheck.error);
      return;
    }

    const matchCheck = validateConfirmPassword(passwords.newPassword, passwords.confirmPassword);
    if (!matchCheck.isValid) {
      setError(matchCheck.error);
      toast.error(matchCheck.error);
      return;
    }

    const resetData = async () => {
      setLoading(true);
      try {
        await authService.resetPassword({ 
          email, 
          resetToken, 
          password: passwords.newPassword, 
          confirmPassword: passwords.confirmPassword 
        });
        setShowModal(true);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to reset password');
        setError(err.response?.data?.message || 'Failed to reset password');
      } finally {
        setLoading(false);
      }
    };

    resetData();
  };

  return (
    <>
      <AuthLayout illustration={<img src={resetIllustration} alt="Reset Password Illustration" className="w-full max-w-md object-contain drop-shadow-2xl" />}>
        <div className="flex flex-col items-center mb-6 text-center">
          <svg viewBox="0 0 200 180" className="w-16 h-16 mb-2">
            <polygon points="30,100 80,100 110,160 60,160" fill="#ef3b3a" />
            <polygon points="100,10 180,160 130,160 90,80" fill="#1D4ED8" />
          </svg>
          <div className="flex flex-col text-center text-[#1D4ED8] mb-4">
              <span className="font-extrabold text-[15px] leading-tight tracking-wide">ADVITA CREDIT</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Reset Password ?</h2>
          <p className="text-xs text-gray-500">Please enter new password (minimum 6 characters)</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                required
                value={passwords.newPassword}
                onChange={handleChange}
                className="w-full pl-4 pr-10 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all bg-white"
                placeholder="Minimum 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showNewPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                value={passwords.confirmPassword}
                onChange={handleChange}
                className="w-full pl-4 pr-10 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all bg-white"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-4 bg-[#1D4ED8] hover:bg-[#154685] disabled:bg-gray-400 text-white font-medium rounded-full transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1D4ED8] text-sm"
          >
            {loading ? 'Setting...' : 'Set Password'}
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

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center transform scale-100 transition-transform animate-in fade-in zoom-in duration-300">
            <div className="mb-6 mt-2 text-[#00bcd4]">
              <BadgeCheck className="w-24 h-24" strokeWidth={1.5} />
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-3 leading-tight">
              Password Changed<br />Successfully!
            </h2>
            
            <p className="text-xs text-gray-500 mb-6 px-2 leading-relaxed">
              Your password has been successfully updated. You can now use your new credentials to log in to your account.
            </p>

            <Link
              to="/login"
              className="w-full inline-block py-3 px-4 bg-[#1D4ED8] hover:bg-[#154685] text-white font-medium text-sm rounded-full transition-colors shadow-lg hover:shadow-xl focus:outline-none"
            >
              Login Now
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default ResetPassword;
