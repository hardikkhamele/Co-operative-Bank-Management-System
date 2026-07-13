import React from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, User, UserPlus, Map, MapPin, Bell, ChevronDown } from 'lucide-react';

const DashboardLayout = () => {

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-[#5a5ce5] font-bold text-xl">
            <div className="w-8 h-8 bg-[#5a5ce5] rounded flex items-center justify-center text-white text-lg">
              🏛
            </div>
            Company Name
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
          
          <div className="flex items-center gap-5">
            <Link to="/notifications" className="relative p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors block">
              <Bell size={20} className="text-white" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#32c965] rounded-full border border-[#1cabb1] flex items-center justify-center text-[8px] font-bold">2</span>
            </Link>
            <div className="flex items-center gap-2 bg-white/90 text-gray-800 py-1.5 px-2 pr-3 rounded-full cursor-pointer hover:bg-white transition-colors shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                <img src="https://ui-avatars.com/api/?name=Eleanor+Pena&background=F3F4F6&color=374151" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-medium">Eleanor</span>
              <ChevronDown size={14} className="text-gray-500" />
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
