import React from 'react';
import { Clock } from 'lucide-react';

const ComingSoon = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-[#1cabb1]/10 text-[#1cabb1] rounded-full flex items-center justify-center mb-6">
        <Clock size={40} />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-3">Coming Soon</h1>
      <p className="text-gray-500 max-w-md mx-auto text-lg">
        We are working hard to bring you this feature. It will be available in an upcoming update!
      </p>
    </div>
  );
};

export default ComingSoon;
