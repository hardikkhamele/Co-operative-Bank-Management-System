import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, MapPin, IdCard, UserPlus, List, ClipboardList, Store, Box, ArrowDownRight, ArrowUpRight, ArrowRightLeft, RefreshCcw, UserCheck, UserCog, Tag, ChevronDown, Bell, User, LogOut, CreditCard, Headphones, FileText, BarChart2, TrendingUp, CalendarDays, Banknote, Smartphone, MessageCircle, Fingerprint } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useLoadingStore from '../../store/loadingStore';
import useBranchStore from '../../store/branchStore';
import GlobalLoader from '../GlobalLoader';

const SidebarGroup = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-1">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`px-6 py-3.5 flex items-center justify-between cursor-pointer transition-all duration-200 border-l-4 ${
          isOpen ? 'border-[#1cabb1] bg-[#1cabb1]/10' : 'border-transparent hover:bg-gray-100/50'
        }`}
      >
        <h3 className={`text-[14.5px] font-semibold transition-colors duration-200 m-0 select-none ${
          isOpen ? 'text-[#1cabb1]' : 'text-gray-700'
        }`}>
          {title}
        </h3>
        <ChevronDown size={16} className={`transition-transform duration-300 ease-out ${
          isOpen ? 'rotate-180 text-[#1cabb1]' : 'text-gray-400'
        }`} />
      </div>
      
      <div 
        className={`grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] bg-transparent ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-1 py-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const resetLoader = useLoadingStore((state) => state.resetLoader);

  const userName = user?.fullName || user?.name || 'Bank Admin';
  const userAvatar = user?.avatar || user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1cabb1&color=fff`;

  // Automatically clear any stuck loader on route change
  useEffect(() => {
    resetLoader();
  }, [location.pathname, resetLoader]);

  const { globalBranchId, setGlobalBranchId, branchOptions, fetchBranches } = useBranchStore();

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-6 py-3.5 text-[14.5px] font-semibold border-l-4 transition-colors ${
      isActive
        ? 'border-[#1cabb1] text-[#1cabb1] bg-[#1cabb1]/10'
        : 'border-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900'
    }`;

  const subNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-6 py-2.5 text-[14px] font-medium border-l-4 transition-colors ${
      isActive
        ? 'border-[#1cabb1] text-[#1cabb1] bg-[#1cabb1]/10'
        : 'border-transparent text-gray-500 hover:bg-[#1cabb1]/5 hover:text-[#1cabb1]'
    }`;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[#f4f5fa] border-r border-gray-200 flex flex-col shadow-sm z-10 print:hidden">
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
        <div className="flex-1 overflow-y-auto py-4 px-0 space-y-4">
          <div className="mb-2">
            <NavLink
              to="/dashboard"
              className={navLinkClass}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
          </div>

          <SidebarGroup title="Branch Management">
            <NavLink to="/branch" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <MapPin size={18} /> Branch
            </NavLink>
          </SidebarGroup>

          <SidebarGroup title="Partner Management">
            <NavLink to="/merchant" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <Store size={18} /> Merchant
            </NavLink>
          </SidebarGroup>

          <SidebarGroup title="HR Management">
            <NavLink to="/employees" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <UserCheck size={18} /> Employee
            </NavLink>
            <NavLink to="/letters-payroll" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <FileText size={18} /> Letters & Payroll
            </NavLink>
            <NavLink to="/daily-work-report" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <BarChart2 size={18} /> Daily Work Report
            </NavLink>
            <NavLink to="/kpa-report" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <TrendingUp size={18} /> KPA Report
            </NavLink>
            <NavLink to="/important-dates" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 border ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <CalendarDays size={18} /> Important Dates
            </NavLink>
          </SidebarGroup>

          <SidebarGroup title="CRM Management">
            <NavLink to="/leads" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <UserPlus size={18} /> Leads
            </NavLink>
            <NavLink to="/inventory" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <List size={18} /> Inventory
            </NavLink>
          </SidebarGroup>

          <SidebarGroup title="Verification">
            <NavLink to="/cibil" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <ClipboardList size={18} /> CIBIL Score & Report
            </NavLink>
            <NavLink to="/kyc" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <IdCard size={18} /> KYC Verification
            </NavLink>
          </SidebarGroup>

          <SidebarGroup title="Receipt Management">
            <NavLink to="/credit" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <ArrowDownRight size={18} /> Credit Receipt
            </NavLink>
            <NavLink to="/debit" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <ArrowUpRight size={18} /> Debit Receipt
            </NavLink>
            <NavLink to="/transfer" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <ArrowRightLeft size={18} /> Transfer Receipt
            </NavLink>
            <NavLink to="/contra" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <RefreshCcw size={18} /> Contra Receipt
            </NavLink>
          </SidebarGroup>

          <SidebarGroup title="Cash Payment">
            <NavLink to="/cash-payment" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <Banknote size={18} /> Cash Payment
            </NavLink>
          </SidebarGroup>

          <SidebarGroup title="EMI Cards & Verification Credits">
            <NavLink to="/cards-credit" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <CreditCard size={18} /> Cards & Credit
            </NavLink>
          </SidebarGroup>

          <SidebarGroup title="UPI Smart">
            <NavLink to="/upi-autopay" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <Smartphone size={18} /> UPI Autopay
            </NavLink>
          </SidebarGroup>

          <SidebarGroup title="WhatsApp Marketing">
            <NavLink to="/whatsapp-banking" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <MessageCircle size={18} /> WhatsApp Banking
            </NavLink>
          </SidebarGroup>

          <SidebarGroup title="Biomatrix Integration">
            <NavLink to="/biomatrix-integration" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <Fingerprint size={18} /> Biomatrix Integration
            </NavLink>
          </SidebarGroup>

          <SidebarGroup title="Roles & Permissions">
            <NavLink to="/roles-permissions" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <UserCog size={18} /> Roles & Permissions
            </NavLink>
          </SidebarGroup>

          <SidebarGroup title="Settings">
            <NavLink to="/settings/help" className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 text-[15px] font-medium transition-colors border-l-4 ${isActive ? "border-transparent bg-transparent text-[#1cabb1]" : "border-transparent text-[#4b5563] hover:text-gray-900 hover:bg-gray-100/50"}`}>
              <Headphones size={18} /> Help & Support
            </NavLink>
          </SidebarGroup>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 bg-[#1cabb1] text-white flex items-center justify-between px-8 shadow-sm shrink-0 print:hidden">
          <div className="flex items-center gap-8">
            <div>
              <div className="text-xs text-white/80 font-medium">Welcome</div>
              <div className="text-lg font-semibold tracking-wide">{userName}</div>
            </div>
            
            {/* Global Branch Filter */}
            <div className="hidden sm:block relative w-64">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <MapPin size={16} className="text-white/80" />
              </div>
              <select
                value={globalBranchId}
                onChange={(e) => setGlobalBranchId(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all appearance-none text-[13px] font-medium shadow-sm cursor-pointer hover:bg-white/30"
              >
                <option value="" className="text-gray-800">All Branches</option>
                {branchOptions.map((br) => (
                  <option key={br.id} value={br.id} className="text-gray-800">
                    {br.name || br.branchName}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex items-center gap-5 relative">
            <Link to="/notifications" className="relative p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors block">
              <Bell size={18} className="text-white" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#32c965] rounded-full border border-[#1cabb1] flex items-center justify-center text-[8px] font-bold"></span>
            </Link>
            
            <div className="relative">
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 bg-white/90 text-gray-800 py-1.5 px-2 pr-3 rounded-full cursor-pointer hover:bg-white transition-colors shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex items-center justify-center">
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-medium">{userName.split(' ')[0]}</span>
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
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 relative">
          <GlobalLoader />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

