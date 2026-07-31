import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentSuccessful = () => {
  return (
    <div className="flex-1 h-[80vh] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center max-w-lg w-full text-center">
        <div className="w-24 h-24 bg-[#32c965] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100">
          <Check size={48} className="text-white" strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-bold text-[#1b2559] mb-3">
          Payment successfully<br />Completed !
        </h2>
        <p className="text-gray-500 mb-8 font-medium">
          Your payment was successfully completed.
        </p>
        <Link 
          to="/cards-credit"
          className="px-8 py-3 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm"
        >
          Go Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccessful;
