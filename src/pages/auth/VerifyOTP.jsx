import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import AuthLayout from '../../components/layouts/AuthLayout';
import otpIllustration from '../../assets/images/enter-otp.png';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/reset-password');
  };

  return (
    <AuthLayout illustration={<img src={otpIllustration} alt="Verify OTP Illustration" className="w-full max-w-md object-contain drop-shadow-2xl" />}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Super Admin Portal</h2>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Verify OTP</h3>
        <p className="text-sm text-gray-500">
          A 6 digit OTP has been sent to
          <br />
          <span className="text-[#5a5ce5] font-medium flex items-center justify-center gap-2 mt-1">
            example@mail.com
            <button className="text-[#00bcd4] hover:text-[#00a0b5]">
              <Pencil size={14} />
            </button>
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
        <div className="flex justify-center gap-2 mb-2 w-full">
          {otp.map((data, index) => (
            <input
              className="w-10 h-10 md:w-12 md:h-12 border border-gray-200 rounded-lg text-center text-lg font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5a5ce5] focus:border-transparent bg-white transition-all shadow-sm"
              type="text"
              name="otp"
              maxLength="1"
              key={index}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>

        <p className="text-sm text-gray-500 mt-2 mb-4">
          Didn't received the code?{' '}
          <button type="button" className="text-[#00bcd4] hover:text-[#00a0b5] font-semibold">
            Resend Code
          </button>
        </p>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-[#5a5ce5] hover:bg-[#484ab9] text-white font-medium rounded-full transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5a5ce5]"
        >
          Verify OTP
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
  );
};

export default VerifyOTP;
