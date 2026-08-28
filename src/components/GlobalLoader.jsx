import React from 'react';
import { Landmark } from 'lucide-react';
import useLoadingStore from '../store/loadingStore';

const GlobalLoader = () => {
  const { isLoading } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/30 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative flex flex-col items-center bg-white/95 px-8 py-7 rounded-3xl shadow-2xl border border-white/60 backdrop-blur-xl max-w-xs text-center transform scale-100 transition-all duration-300">
        {/* Orbital Glowing Spinner Ring */}
        <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
          {/* Subtle Outer Pulse Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-100/60 animate-ping opacity-30"></div>
          
          {/* Inner Static Glow Ring */}
          <div className="absolute inset-1 rounded-full border-[3px] border-slate-100"></div>
          
          {/* Orbiting Brand Spinner */}
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#225091] border-r-teal-500 animate-spin"></div>
          
          {/* Center Bank Icon Badge */}
          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#225091] flex items-center justify-center shadow-xs">
            <Landmark size={18} className="text-[#225091]" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-gray-900 tracking-wide">Advita Co-Op Bank</h4>
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#225091] font-semibold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#225091] animate-ping"></span>
            <span>Processing Request...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoader;
