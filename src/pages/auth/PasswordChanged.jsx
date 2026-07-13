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
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Password Changed Successfully!
        </h2>
        
        <p className="text-sm text-gray-600 mb-8 max-w-sm">
          Your password has been successfully updated. You can now use your new credentials to log in to your account.
        </p>

        <div className="w-full h-px bg-gray-200 mb-8"></div>

        <Link
          to="/login"
          className="w-full inline-block py-3 px-4 bg-[#5a5ce5] hover:bg-[#484ab9] text-white font-medium rounded-full transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5a5ce5]"
        >
          Login Now
        </Link>
      </div>
    </AuthLayout>
  );
};

export default PasswordChanged;
