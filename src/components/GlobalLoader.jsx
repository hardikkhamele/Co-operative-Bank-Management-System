import React from 'react';
import useLoadingStore from '../store/loadingStore';

const GlobalLoader = () => {
  const { isLoading } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 z-[50] flex items-center justify-center bg-white/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative flex flex-col items-center">
        {/* Premium glowing spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 opacity-70"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-400 animate-spin"></div>
        </div>
        
        {/* Animated Loading Text */}
        <div className="mt-4 text-blue-600 font-semibold tracking-widest text-xs animate-pulse">
          PROCESSING...
        </div>
      </div>
    </div>
  );
};

export default GlobalLoader;
