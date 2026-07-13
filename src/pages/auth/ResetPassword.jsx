import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import AuthLayout from '../../components/layouts/AuthLayout';
import resetIllustration from '../../assets/images/reset-password.png';

const ResetPassword = () => {
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPassword === passwords.confirmPassword) {
      setShowModal(true);
    } else {
      alert("Passwords don't match!");
    }
  };

  return (
    <>
      <AuthLayout illustration={<img src={resetIllustration} alt="Reset Password Illustration" className="w-full max-w-md object-contain drop-shadow-2xl" />}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Super Admin Portal</h2>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Reset Password ?</h3>
          <p className="text-sm text-gray-500">Please enter new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              name="newPassword"
              required
              value={passwords.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5a5ce5] focus:border-transparent transition-all bg-white"
              placeholder="*********"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={passwords.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5a5ce5] focus:border-transparent transition-all bg-white"
              placeholder="*********"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#5a5ce5] hover:bg-[#484ab9] text-white font-medium rounded-full transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5a5ce5] mt-6"
          >
            Set Password
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

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center transform scale-100 transition-transform animate-in fade-in zoom-in duration-300">
            <div className="mb-6 mt-2 text-[#00bcd4]">
              <BadgeCheck className="w-24 h-24" strokeWidth={1.5} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4 leading-tight">
              Password Changed<br />Successfully!
            </h2>
            
            <p className="text-sm text-gray-500 mb-8 px-2 leading-relaxed">
              Your password has been successfully updated. You can now use your new credentials to log in to your account.
            </p>

            <div className="w-full h-px bg-gray-100 mb-8"></div>

            <Link
              to="/login"
              className="w-full inline-block py-3.5 px-4 bg-[#4549b8] hover:bg-[#383a99] text-white font-medium rounded-full transition-colors shadow-lg hover:shadow-xl focus:outline-none"
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
