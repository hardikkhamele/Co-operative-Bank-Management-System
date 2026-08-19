import React from 'react';

const AuthLayout = ({ children, illustration }) => {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0f4b86] via-[#1D4ED8] to-[#60c5c9] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Premium Ambient Background Effects */}
      <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-[#00f2fe]/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse duration-10000"></div>
      <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] bg-[#1D4ED8]/20 rounded-full blur-[140px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-[#4facfe]/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-12 z-10 relative">
        {/* Left Side Illustration */}
        <div className="hidden md:flex flex-1 justify-center items-center perspective-1000">
          {illustration ? (
            <div className="transform hover:scale-105 hover:-rotate-1 transition-all duration-700 ease-out drop-shadow-2xl">
               {illustration}
            </div>
          ) : (
            <div className="w-80 h-80 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 shadow-2xl">
               <div className="text-white/80 text-xl font-medium tracking-wide">Welcome to Advita</div>
            </div>
          )}
        </div>
        
        {/* Right Side Form Card */}
        <div className="w-full max-w-[440px] bg-white/95 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] p-10 relative overflow-hidden transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)]">
          {/* Subtle card inset highlight */}
          <div className="absolute inset-0 border border-white/80 rounded-[2rem] pointer-events-none"></div>
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-[#1D4ED8]/10 to-transparent rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
