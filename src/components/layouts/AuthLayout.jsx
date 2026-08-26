import React from 'react';

const AuthLayout = ({ children, illustration, welcomeHeading = "WELCOME TO\nADVITA CO-OPERATIVE & BRANCH" }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1b4e8c] via-[#174378] to-[#133866] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans antialiased select-none">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
        
        {/* Left Side: Branding & Illustration */}
        <div className="hidden lg:flex flex-1 flex-col items-start justify-center pl-4 max-w-xl">
          {/* Header Banner with Logo and Welcome Title */}
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white rounded-[16px] shadow-lg p-2.5 flex flex-col items-center justify-center shrink-0 w-[60px] h-[60px] border border-white/20">
              <svg viewBox="0 0 200 180" className="w-8 h-8">
                <polygon points="30,100 80,100 110,160 60,160" fill="#ef3b3a" />
                <polygon points="100,10 180,160 130,160 90,80" fill="#1b58a6" />
              </svg>
              <span className="text-[5px] font-black text-[#1b58a6] tracking-tighter mt-0.5 whitespace-nowrap">
                ADVITA CREDIT
              </span>
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-white text-2xl xl:text-[28px] font-black tracking-wider uppercase leading-tight whitespace-pre-line drop-shadow-md">
                {welcomeHeading}
              </h1>
              <div className="w-32 h-[3.5px] bg-[#ef3b3a] rounded-full mt-2.5 shadow-sm"></div>
            </div>
          </div>

          {/* Illustration Area with Ambient Lighting */}
          <div className="w-full flex justify-center items-center relative py-2">
            {/* Ambient soft glow backdrop */}
            <div className="absolute w-[380px] h-[380px] bg-white/[0.07] rounded-full blur-2xl pointer-events-none"></div>
            
            {illustration ? (
              <div className="w-full max-w-[440px] xl:max-w-[480px] transition-transform duration-300 hover:scale-[1.01] relative z-10">
                {illustration}
              </div>
            ) : (
              <div className="w-80 h-80 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-xs">
                <div className="text-white/80 text-lg font-medium">Illustration</div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Header Banner (Visible only on mobile/tablet) */}
        <div className="lg:hidden flex flex-col items-center text-center mb-4">
          <div className="flex items-center gap-3.5">
            <div className="bg-white rounded-[14px] shadow-md p-2 flex flex-col items-center justify-center shrink-0 w-12 h-12">
              <svg viewBox="0 0 200 180" className="w-7 h-7">
                <polygon points="30,100 80,100 110,160 60,160" fill="#ef3b3a" />
                <polygon points="100,10 180,160 130,160 90,80" fill="#1b58a6" />
              </svg>
              <span className="text-[4px] font-black text-[#1b58a6] tracking-tight mt-0.5">ADVITA</span>
            </div>
            <h1 className="text-white text-lg sm:text-xl font-black tracking-wider uppercase text-left leading-tight">
              ADVITA CO-OPERATIVE<br />& BRANCH
            </h1>
          </div>
          <div className="w-24 h-[3px] bg-[#ef3b3a] rounded-full mt-2.5"></div>
        </div>

        {/* Right Side: Floating Form Card */}
        <div className="w-full max-w-[460px] bg-white rounded-[32px] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35)] p-8 sm:p-10 relative border border-white/90">
          {children}
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
