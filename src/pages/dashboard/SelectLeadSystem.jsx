import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Store, IndianRupee, ChevronRight, Sparkles, ArrowUpRight, Coins } from 'lucide-react';

const SelectLeadSystem = () => {
  const navigate = useNavigate();

  const systems = [
    {
      id: 'customer',
      title: 'Customer',
      description: 'Manage customer loan application leads and manual approvals',
      path: '/leads/customer',
      icon: Users,
      gradient: 'from-[#1b58a6] to-[#2b72cf]',
      iconBg: 'bg-gradient-to-tr from-[#1b58a6] to-[#3b82f6]',
      badgeBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      glowColor: 'group-hover:shadow-[0_15px_35px_-5px_rgba(27,88,166,0.25)]',
      borderHover: 'hover:border-[#1b58a6]/40',
      badgeColor: 'text-white',
      accentGlow: 'bg-[#1b58a6]/10'
    },
    {
      id: 'merchant',
      title: 'Merchant',
      description: 'Merchant partner shop loan leads & next-day disbursal settlements',
      path: '/leads/merchant',
      icon: Store,
      gradient: 'from-[#7c3aed] to-[#a855f7]',
      iconBg: 'bg-gradient-to-tr from-[#7c3aed] to-[#9333ea]',
      badgeBg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      glowColor: 'group-hover:shadow-[0_15px_35px_-5px_rgba(124,58,237,0.25)]',
      borderHover: 'hover:border-[#7c3aed]/40',
      badgeColor: 'text-white',
      accentGlow: 'bg-[#7c3aed]/10'
    },
    {
      id: 'sip-pigmy',
      title: 'Smart SIP / Pigmy',
      description: 'Daily micro-savings, Pigmy collector deposits & Systematic Investment Plan management',
      path: '/pigmy',
      icon: Coins,
      gradient: 'from-[#0d9488] to-[#14b8a6]',
      iconBg: 'bg-gradient-to-tr from-[#0d9488] to-[#06b6d4]',
      badgeBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      glowColor: 'group-hover:shadow-[0_15px_35px_-5px_rgba(13,148,136,0.25)]',
      borderHover: 'hover:border-[#0d9488]/40',
      badgeColor: 'text-white',
      accentGlow: 'bg-[#0d9488]/10'
    }
  ];

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-8 px-4 relative overflow-hidden">
      {/* Subtle Ambient Background Lighting for Glassmorphism */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-1/2 right-10 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Main Selection Card Area */}
      <div className="w-full flex flex-col items-center justify-center">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/60 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles size={12} className="text-blue-500" /> Lead Systems
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#225091] tracking-tight mb-2">
            Select Lead System
          </h2>
          <p className="text-sm sm:text-base font-medium text-gray-500 max-w-md mx-auto">
            Choose a source to manage your leads
          </p>
        </div>

        {/* 4 Glassmorphism Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
          {systems.map((sys) => {
            const IconComponent = sys.icon;
            return (
              <button
                key={sys.id}
                onClick={() => navigate(sys.path)}
                className={`group relative bg-white/70 backdrop-blur-xl border border-white/80 ${sys.borderHover} rounded-3xl p-8 flex flex-col items-center text-center transition-all duration-400 transform hover:-translate-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${sys.glowColor} focus:outline-none cursor-pointer overflow-hidden`}
              >
                {/* Ambient Top Glow in Card */}
                <div className={`absolute -top-12 -right-12 w-28 h-28 ${sys.accentGlow} rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500`}></div>
                
                {/* Arrow hint top right */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 text-gray-400 group-hover:text-gray-700">
                  <ArrowUpRight size={18} />
                </div>

                {/* Icon Container with Floating Badge */}
                <div className="relative mb-6">
                  <div className={`w-18 h-18 rounded-2xl ${sys.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-400`}>
                    <IconComponent size={32} className="text-white" strokeWidth={2.2} />
                  </div>
                  {/* Floating Rupee Badge */}
                  <div className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full ${sys.badgeBg} ${sys.badgeColor} flex items-center justify-center shadow-md border-2 border-white text-[12px] font-bold`}>
                    <IndianRupee size={13} strokeWidth={2.6} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-[#1b2559] group-hover:text-[#1b58a6] transition-colors mb-2">
                  {sys.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-[13px] text-gray-500 font-medium leading-relaxed">
                  {sys.description}
                </p>

                {/* Bottom active pill */}
                <div className="mt-5 pt-4 border-t border-gray-100/80 w-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-[#1b58a6] group-hover:underline flex items-center gap-1">
                    Open Leads <ChevronRight size={13} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelectLeadSystem;
