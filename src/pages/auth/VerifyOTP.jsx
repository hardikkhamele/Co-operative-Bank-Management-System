import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthLayout from '../../components/layouts/AuthLayout';
import otpIllustration from '../../assets/images/enter-otp.png';
import { sanitizeDigits } from '../../utils/validation';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const handleChange = (e, index) => {
    const cleanVal = sanitizeDigits(e.target.value, 1);
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Focus next input if value entered
    if (cleanVal && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = sanitizeDigits(e.clipboardData.getData('text'), 6);
    if (!pasteData) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length && i < 6; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);
    const focusIdx = Math.min(pasteData.length, 5);
    if (inputRefs.current[focusIdx]) {
      inputRefs.current[focusIdx].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      toast.error('Please enter complete 6-digit OTP.');
      return;
    }
    navigate('/reset-password');
  };

  return (
    <AuthLayout illustration={<img src={otpIllustration} alt="Verify OTP Illustration" className="w-full max-w-md object-contain drop-shadow-2xl" />}>
      <div className="flex flex-col items-center mb-6 text-center">
        <svg viewBox="0 0 200 180" className="w-16 h-16 mb-2">
          <polygon points="30,100 80,100 110,160 60,160" fill="#ef3b3a" />
          <polygon points="100,10 180,160 130,160 90,80" fill="#1b58a6" />
        </svg>
        <div className="flex flex-col text-center text-[#1b58a6] mb-4">
            <span className="font-extrabold text-[15px] leading-tight tracking-wide">ADVITA CREDIT</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Verify OTP</h2>
        <p className="text-xs text-gray-500">
          A 6 digit OTP has been sent to
          <br />
          <span className="text-[#1b58a6] font-medium flex items-center justify-center gap-1.5 mt-1">
            example@mail.com
            <button className="text-[#00bcd4] hover:text-[#00a0b5]">
              <Pencil size={12} />
            </button>
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
        <div className="flex justify-center gap-2 mb-2 w-full">
          {otp.map((data, index) => (
            <input
              className="w-10 h-10 md:w-12 md:h-12 border border-gray-200 rounded-lg text-center text-lg font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1b58a6] focus:border-transparent bg-white transition-all shadow-sm"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name={`otp-${index}`}
              maxLength="1"
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              value={data}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-2 mb-2">
          Didn't received the code?{' '}
          <button type="button" className="text-[#00bcd4] hover:text-[#00a0b5] font-semibold">
            Resend Code
          </button>
        </p>

        <button
          type="submit"
          className="w-full py-3 px-4 mt-2 bg-[#1b58a6] hover:bg-[#154685] text-white font-medium rounded-full transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1b58a6] text-sm"
        >
          Verify OTP
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
  );
};

export default VerifyOTP;
