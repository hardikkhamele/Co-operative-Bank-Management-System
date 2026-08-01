import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MapPin, IdCard, UserPlus, List, ClipboardList, Store, Box, ArrowDownRight, ArrowUpRight, ArrowRightLeft, RefreshCcw, UserCheck, UserCog, Tag, ChevronDown, Bell, User, LogOut, CreditCard, Headphones, FileText, BarChart2, TrendingUp, CalendarDays, Banknote } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const DashboardLayout = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[#f4f5fa] border-r border-gray-200 flex flex-col shadow-sm z-10">
        {/* Logo Area */}
        <div className="h-[76px] flex items-center px-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {/* Logo Icon Box */}
            <div className="bg-white rounded-lg shadow-sm flex flex-col items-center justify-center shrink-0 w-11 h-11 p-1">
              <svg viewBox="0 0 200 180" className="w-6 h-6">
                <polygon points="30,100 80,100 110,160 60,160" fill="#ef3b3a" />
                <polygon points="100,10 180,160 130,160 90,80" fill="#1b58a6" />
              </svg>
              <span className="text-[4px] font-bold text-[#1b58a6] mt-0.5 whitespace-nowrap">ADVITA CREDIT</span>
            </div>
            {/* Logo Text */}
            <div className="flex flex-col text-[#1b58a6]">
              <span className="font-extrabold text-[17px] leading-tight tracking-wide">ADVITA CREDIT</span>
              <span className="font-bold text-[10px] leading-tight tracking-wide">INFO PVRIVATE LIMITED</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-0 space-y-6">
          <div>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-[15px] font-medium transition-colors border-l-4 ${
                  isActive
                    ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
                }`
              }
            >
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-gray-800 mb-2 px-6">Branch Management</h3>
            <div className="space-y-1">
              <NavLink to="/branch" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
                <MapPin size={20} /> Branch
              </NavLink>
            </div>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-gray-800 mb-2 px-6">HR Management</h3>
            <div className="space-y-1">
              <NavLink to="/employees" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
                <UserCheck size={20} /> Employee
              </NavLink>
              <NavLink to="/letters-payroll" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
                <FileText size={20} /> Letters & Payroll
              </NavLink>
              <NavLink to="/daily-work-report" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
                <BarChart2 size={20} /> Daily Work Report
              </NavLink>
              <NavLink to="/kpa-report" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
                <TrendingUp size={20} /> KPA Report
              </NavLink>
              <NavLink to="/important-dates" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 border ${isActive ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
                <CalendarDays size={20} /> Important Dates
              </NavLink>
            </div>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-gray-800 mb-2 px-6">CRM Management</h3>
            <div className="space-y-1">
              <NavLink to="/leads" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
                <UserPlus size={20} /> Leads
              </NavLink>
              <NavLink to="/inventory" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
                <List size={20} /> Inventory
              </NavLink>
            </div>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-gray-800 mb-2 px-6">Verification</h3>
            <div className="space-y-1">
              <NavLink to="/cibil" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
                <ClipboardList size={20} /> CIBIL Score & Report
              </NavLink>
              <NavLink to="/kyc" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
                <IdCard size={20} /> KYC Verification
              </NavLink>
            </div>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-gray-800 mb-2 px-6">Receipt Management</h3>
            <div className="space-y-1">
              <NavLink to="/credit" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
                <ArrowDownRight size={20} /> Credit Receipt
              </NavLink>
              <NavLink to="/debit" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
                <ArrowUpRight size={20} /> Debit Receipt
              </NavLink>
              <NavLink to="/transfer" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
                <ArrowRightLeft size={20} /> Transfer Receipt
              </NavLink>
              <NavLink to="/contra" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
                <RefreshCcw size={20} /> Contra Receipt
              </NavLink>
            </div>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-gray-800 mb-2 px-6">Cash Payment</h3>
            <div className="space-y-1">
              <NavLink to="/cash-payment" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
                <Banknote size={20} /> Cash Payment
              </NavLink>
            </div>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-gray-800 mb-2 px-6">EMI Cards & Verification Credits</h3>
            <div className="space-y-1">
              <NavLink to="/cards-credit" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
                <CreditCard size={20} /> Cards & Credit
              </NavLink>
            </div>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-gray-800 mb-2 px-6">Attendance Report</h3>
            <div className="space-y-1">
              <NavLink to="/attendance" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
                <UserCheck size={20} /> Attendance Report
              </NavLink>
            </div>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-gray-800 mb-2 px-6">Roles & Permissions</h3>
            <div className="space-y-1">
              <NavLink to="/roles-permissions" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
                <UserCog size={20} /> Roles & Permissions
              </NavLink>
            </div>
          </div>


          <div>
            <h3 className="text-[15px] font-bold text-gray-800 mb-2 px-6">Settings</h3>
            <div className="space-y-1">
              <NavLink to="/settings/help" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-[#1cabb1] bg-[#1cabb1]/10 text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
                <Headphones size={20} /> Help & Support
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-[#1cabb1] text-white flex items-center justify-between px-8 shadow-sm">
          <div>
            <div className="text-xs text-white/80 font-medium">Welcome</div>
            <div className="text-lg font-semibold tracking-wide">Eleanor Pena</div>
          </div>
          
          <div className="flex items-center gap-5 relative">
            <Link to="/notifications" className="relative p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors block">
              <Bell size={20} className="text-white" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#32c965] rounded-full border border-[#1cabb1] flex items-center justify-center text-[8px] font-bold">2</span>
            </Link>
            
            <div className="relative">
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 bg-white/90 text-gray-800 py-1.5 px-2 pr-3 rounded-full cursor-pointer hover:bg-white transition-colors shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                  <img src="https://ui-avatars.com/api/?name=Eleanor+Pena&background=F3F4F6&color=374151" alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-medium">Eleanor</span>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-2 font-medium"
                  >
                    <User size={16} />
                    My Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2 font-medium border-t border-gray-100 mt-1 pt-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
