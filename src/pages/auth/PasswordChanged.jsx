import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import AuthLayout from '../../components/layouts/AuthLayout';

const PasswordChanged = () => {
  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-6 mt-4">
          <BadgeCheck className="w-24 h-24 text-[#00bcd4]" strokeWidth={1.5} />
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-3">
          Password Changed<br />Successfully!
        </h2>
        
        <p className="text-xs text-gray-500 mb-6 max-w-sm px-4">
          Your password has been successfully updated. You can now use your new credentials to log in to your account.
        </p>

        <Link
          to="/login"
          className="w-full inline-block py-3 px-4 bg-[#1D4ED8] hover:bg-[#154685] text-white font-medium text-sm rounded-full transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1D4ED8]"
        >
          Login Now
        </Link>
      </div>
    </AuthLayout>
  );
};

export default PasswordChanged;
