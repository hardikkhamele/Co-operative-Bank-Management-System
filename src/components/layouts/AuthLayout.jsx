import React from 'react';

const AuthLayout = ({ children, illustration }) => {
  return (
    <div className="min-h-screen bg-[#1cabb1] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Left Side Illustration */}
        <div className="hidden md:flex flex-1 justify-center items-center">
          {illustration ? (
             illustration
          ) : (
            <div className="w-80 h-80 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
               {/* Placeholder for Isometric illustrations from screenshots */}
               <div className="text-white/80 text-xl font-medium">Illustration Space</div>
            </div>
          )}
        </div>
        
        {/* Right Side Form Card */}
        <div className="w-full max-w-md bg-[#faf9fe] rounded-3xl shadow-2xl p-10 relative overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
