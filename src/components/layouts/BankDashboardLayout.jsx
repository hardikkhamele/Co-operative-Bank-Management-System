import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Building, FileText, Settings, Bell, ChevronDown, User, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const bankNavItems = [
  { name: 'Dashboard', path: '/bank/dashboard', icon: Home },
  { name: 'Customers', path: '/bank/customers', icon: Users },
  { name: 'Loans', path: '/bank/loans', icon: FileText },
  { name: 'Branches', path: '/bank/branches', icon: Building },
  { name: 'Notifications', path: '/bank/notifications', icon: Bell },
  { name: 'Settings', path: '/bank/settings', icon: Settings },
];

const BankDashboardLayout = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    if (logout) logout();
    navigate('/bank/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Reusing existing Topbar or creating a specialized one. Assuming Topbar is standard. 
          Actually, we should probably have a custom sidebar. For now, let's build the layout structure. */}
      
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 shadow-sm z-20">
        <div className="p-6 border-b border-gray-100 flex items-center justify-center">
            <h1 className="text-xl font-bold text-[#5a5ce5]">Co-Op Bank</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
            {bankNavItems.map((item) => (
                <NavLink 
                  key={item.name} 
                  to={item.path} 
                  className={({ isActive }) => `flex items-center gap-3 px-6 py-3 text-[15px] font-medium transition-colors border-l-4 ${isActive ? 'border-[#5a5ce5] bg-[#5a5ce5]/10 text-[#5a5ce5]' : 'border-transparent text-gray-700 hover:bg-gray-100/50 hover:text-gray-900'}`}
                >
                    <item.icon size={20} className="shrink-0" />
                    <span>{item.name}</span>
                </NavLink>
            ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
             <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                 <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-[#5a5ce5] font-bold">
                    A
                 </div>
                 <div className="flex-1 overflow-hidden">
                     <p className="text-sm font-bold text-gray-900 truncate">Admin User</p>
                     <p className="text-xs text-gray-500 truncate">admin@cooperativebank.com</p>
                 </div>
             </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 text-gray-800 flex items-center justify-between px-8 shadow-sm">
          <div>
            <div className="text-lg font-semibold tracking-wide text-gray-800">Bank Portal</div>
          </div>
          
          <div className="flex items-center gap-5 relative">
            <Link to="/bank/notifications" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors block text-gray-500">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white flex items-center justify-center text-[8px] font-bold text-white">2</span>
            </Link>
            
            <div className="relative">
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 bg-gray-50 text-gray-800 py-1.5 px-2 pr-3 rounded-full cursor-pointer hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[#5a5ce5] font-bold">
                  A
                </div>
                <span className="text-sm font-medium">Admin</span>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    to="/bank/profile"
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
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BankDashboardLayout;
