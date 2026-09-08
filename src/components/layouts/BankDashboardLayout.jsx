import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Building, FileText, Settings, Bell, ChevronDown, User, LogOut, Menu, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useLoadingStore from '../../store/loadingStore';
import GlobalLoader from '../GlobalLoader';

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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('bank_desktop_sidebar_open');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('bank_desktop_sidebar_open', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const resetLoader = useLoadingStore((state) => state.resetLoader);

  useEffect(() => {
    resetLoader();
    setIsMobileOpen(false);
  }, [location.pathname, resetLoader]);

  const handleLogout = () => {
    if (logout) logout();
    navigate('/bank/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 shadow-2xl lg:shadow-sm lg:static lg:z-20 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
          isMobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isDesktopSidebarOpen
            ? 'lg:w-64 lg:opacity-100 lg:visible'
            : 'lg:w-0 lg:opacity-0 lg:invisible lg:border-none lg:p-0 lg:overflow-hidden'
        }`}
      >
        <div className="w-64 h-full flex flex-col shrink-0">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h1 className="text-xl font-bold text-[#225091] whitespace-nowrap">Co-Op Bank</h1>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close sidebar"
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 space-y-1">
            {bankNavItems.map((item) => (
              <NavLink 
                key={item.name} 
                to={item.path} 
                className={({ isActive }) => `flex items-center gap-3 px-6 py-3 text-[15px] font-medium transition-all duration-200 border-l-4 ${isActive ? 'border-[#225091] bg-[#225091]/10 text-[#225091]' : 'border-transparent text-gray-700 hover:bg-gray-100/50 hover:text-gray-900 hover:pl-7'}`}
              >
                <item.icon size={20} className="shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-[#225091] font-bold">
                A
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@cooperativebank.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 text-gray-800 flex items-center justify-between px-4 sm:px-8 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileOpen(true);
                } else {
                  toggleDesktopSidebar();
                }
              }}
              aria-label={isDesktopSidebarOpen ? "Close navigation sidebar" : "Open navigation sidebar"}
              title={isDesktopSidebarOpen ? "Close sidebar" : "Open sidebar"}
              className={`w-9 h-9 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 border focus:outline-none focus:ring-2 focus:ring-gray-300 active:scale-95 ${
                isDesktopSidebarOpen
                  ? "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700 shadow-2xs"
                  : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-[#225091] shadow-sm ring-2 ring-blue-50"
              }`}
            >
              {isDesktopSidebarOpen ? (
                <PanelLeftClose size={18} className="hidden lg:block transition-transform duration-200" />
              ) : (
                <PanelLeftOpen size={18} className="hidden lg:block transition-transform duration-200" />
              )}
              <Menu size={20} className="lg:hidden" />
            </button>
            <div className="hidden sm:block h-5 w-px bg-gray-200 shrink-0" />
            <div className="text-base sm:text-lg font-semibold tracking-wide text-gray-800">Bank Portal</div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-5 relative">
            <Link to="/bank/notifications" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors block text-gray-500">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white flex items-center justify-center text-[8px] font-bold text-white">2</span>
            </Link>
            
            <div className="relative">
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 bg-gray-50 text-gray-800 py-1.5 px-2 pr-3 rounded-full cursor-pointer hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[#225091] font-bold">
                  A
                </div>
                <span className="text-xs sm:text-sm font-medium hidden xs:inline">Admin</span>
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
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative">
          <GlobalLoader />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BankDashboardLayout;
