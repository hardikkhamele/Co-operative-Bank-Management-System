import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, User, UserPlus, Map, MapPin, Bell, ChevronDown, IdCard, List, Tags, Package, Box, Landmark, Store, ClipboardList, Image, LogOut } from 'lucide-react';
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
        <div className="flex-1 overflow-y-auto py-4">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm font-medium border-l-4 transition-colors ${
                isActive
                  ? 'border-[#00bcd4] text-[#00bcd4] bg-teal-50/50'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <div className="px-6 py-3 mt-4">
            <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">Partner Management</h3>
            <div className="space-y-1">
              <NavLink to="/co-operative-bank" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-[#1cabb1] bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                <Landmark size={18} /> Co-operative Bank
              </NavLink>
              <NavLink to="/merchant" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-[#1cabb1] bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                <Store size={18} /> Merchant
              </NavLink>
            </div>
          </div>

          <div className="px-6 py-3">
            <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">Lead Management</h3>
            <div className="space-y-1">
              <NavLink to="/customers" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-[#1cabb1] bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                <Users size={18} /> Customers
              </NavLink>
              <NavLink to="/leads" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-[#1cabb1] bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                <UserPlus size={18} /> Leads
              </NavLink>
            </div>
          </div>

          <div className="px-6 py-3">
            <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">Region & Branch Management</h3>
            <div className="space-y-1">
              <NavLink to="/region" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-[#1cabb1] bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                <Map size={18} /> Region
              </NavLink>
              <NavLink to="/branch" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-[#1cabb1] bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                <MapPin size={18} /> Branch
              </NavLink>
            </div>
          </div>

          <div className="px-6 py-3">
            <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">User Management</h3>
            <div className="space-y-1">
              <NavLink to="/managers" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-[#1cabb1] bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                <UserCog size={18} /> Managers
              </NavLink>
              <NavLink to="/employees" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-[#1cabb1] bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                <Users size={18} /> Employees
              </NavLink>
            </div>
          </div>

          <div className="px-6 py-3">
            <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">Roles & Permissions</h3>
            <div className="space-y-1">
              <NavLink to="/roles-permissions" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-[#1cabb1] bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                <IdCard size={18} /> Roles & Permissions
              </NavLink>
            </div>
          </div>

          <div className="px-6 py-3">
            <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">Product Management</h3>
            <div className="space-y-1">
              <NavLink to="/product-categories" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-[#1cabb1] bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                <List size={18} /> Categories
              </NavLink>
              <NavLink to="/product-brands" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-[#1cabb1] bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                <Tags size={18} /> Brands
              </NavLink>

              <NavLink to="/products" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-[#1cabb1] bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                <Package size={18} /> Products
              </NavLink>
            </div>
          </div>

          <div className="px-6 py-3">
            <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">Attendance Report</h3>
            <div className="space-y-1">
              <NavLink to="/attendance" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-[#1cabb1] bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                <ClipboardList size={18} /> Attendance Report
              </NavLink>
            </div>
          </div>

          <div className="px-6 py-3">
            <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-2">App Management</h3>
            <div className="space-y-1">
              <NavLink to="/banners" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-[#1cabb1] bg-teal-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                <Image size={18} /> Banner Management
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
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2 font-medium"
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
