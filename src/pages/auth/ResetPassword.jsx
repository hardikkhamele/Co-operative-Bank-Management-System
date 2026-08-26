import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BadgeCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import AuthLayout from '../../components/layouts/AuthLayout';
import resetIllustration from '../../assets/images/reset-password.png';
import { validatePassword, validateConfirmPassword } from '../../utils/validation';
import { authService } from '../../api/authService';

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
      <AuthLayout 
        welcomeHeading={"WELCOME TO\nADVITA CO-OPERATIVE & BRANCH"}
        illustration={<img src={resetIllustration} alt="Reset Password Illustration" className="w-full h-auto object-contain drop-shadow-xl" />}
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
            <span className="text-[#1B4E8C]">RESET </span>
            <span className="text-[#EF3B3A]">PASSWORD</span>
          </h2>
          <p className="text-[13px] text-gray-500 font-medium mt-1.5 leading-normal">
            Please enter your new password (minimum 6 characters)
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
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                required
                value={passwords.newPassword}
                onChange={handleChange}
                className="w-full pl-4 pr-12 py-3.5 rounded-[14px] bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 transition-all text-[14px] text-gray-800 placeholder-gray-400 font-medium outline-none"
                placeholder="Minimum 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-[#1B4E8C] transition-colors focus:outline-none"
              >
                {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                value={passwords.confirmPassword}
                onChange={handleChange}
                className="w-full pl-4 pr-12 py-3.5 rounded-[14px] bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 transition-all text-[14px] text-gray-800 placeholder-gray-400 font-medium outline-none"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-[#1B4E8C] transition-colors focus:outline-none"
              >
                {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-[#1B4E8C] hover:bg-[#153e70] active:scale-[0.99] disabled:opacity-70 text-white font-bold rounded-[14px] shadow-lg shadow-[#1B4E8C]/25 hover:shadow-xl transition-all flex justify-center items-center text-[15px] tracking-wide cursor-pointer"
          >
            {loading ? 'Updating Password...' : 'Set Password'}
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

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 transition-opacity">
          <div className="bg-white rounded-[28px] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center transform scale-100 transition-transform animate-in fade-in zoom-in duration-300">
            <div className="mb-3.5 text-[#1B4E8C]">
              <BadgeCheck className="w-16 h-16 text-[#1B4E8C]" strokeWidth={1.5} />
            </div>
            
            <h2 className="text-[20px] font-black text-gray-900 mb-1.5 leading-tight uppercase">
              Password Changed<br />Successfully!
            </h2>
            
            <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">
              Your password has been successfully updated. You can now use your new credentials to log in.
            </p>

            <Link
              to="/login"
              className="w-full py-3.5 bg-[#1B4E8C] hover:bg-[#153e70] text-white font-bold text-[15px] rounded-[14px] transition-colors shadow-md shadow-[#1B4E8C]/20 text-center"
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
