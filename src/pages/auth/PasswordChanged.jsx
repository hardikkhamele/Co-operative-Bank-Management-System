import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import AuthLayout from '../../components/layouts/AuthLayout';

const PasswordChanged = () => {
  return (
    <AuthLayout welcomeHeading={"WELCOME TO\nADVITA CO-OPERATIVE & BRANCH"}>
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

        <div className="mb-3.5 mt-1 text-[#1B4E8C]">
          <BadgeCheck className="w-16 h-16 text-[#1B4E8C]" strokeWidth={1.5} />
        </div>
        
        <h2 className="text-[22px] sm:text-[24px] font-black tracking-wide uppercase leading-tight">
          <span className="text-[#1B4E8C]">PASSWORD </span>
          <span className="text-[#EF3B3A]">CHANGED</span>
        </h2>
        
        <p className="text-[13px] text-gray-500 font-medium mt-1.5 max-w-sm px-2 leading-relaxed">
          Your password has been successfully updated. You can now use your new credentials to log in.
        </p>
      </div>

      <Link
        to="/login"
        className="w-full inline-block py-3.5 bg-[#1B4E8C] hover:bg-[#153e70] text-white font-bold text-[15px] text-center rounded-[14px] transition-all shadow-lg shadow-[#1B4E8C]/25"
      >
        Login Now
      </Link>
    </AuthLayout>
  );
};

export default PasswordChanged;
