import React, { useState, useEffect, createContext, useContext, Children, isValidElement, Fragment, useCallback } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, MapPin, IdCard, UserPlus, List, ClipboardList, Store, Box, ArrowDownRight, ArrowUpRight, ArrowRightLeft, RefreshCcw, UserCheck, UserCog, Tag, ChevronDown, Bell, User, LogOut, CreditCard, MoreHorizontal, Headphones, FileText, BarChart2, BarChart3, TrendingUp, CalendarDays, CalendarCheck, Banknote, Smartphone, MessageCircle, Fingerprint, ArrowLeft, ArrowRight, Menu, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useLoadingStore from '../../store/loadingStore';
import useBranchStore from '../../store/branchStore';
import usePermission from '../../hooks/usePermission';
import GlobalLoader from '../GlobalLoader';

const flattenChildren = (children) => {
  const result = [];
  Children.forEach(children, (child) => {
    if (!child) return;
    if (isValidElement(child) && child.type === Fragment) {
      result.push(...flattenChildren(child.props.children));
    } else {
      result.push(child);
    }
  });
  return result;
};

const SidebarAccordionContext = createContext({
  openGroup: null,
  toggleGroup: () => {},
  setOpenGroup: () => {},
});

const SidebarGroup = ({ title, children, icon: Icon }) => {
  const location = useLocation();
  const { openGroup, toggleGroup, setOpenGroup } = useContext(SidebarAccordionContext);
  // Filter out any false/null/undefined children and unpack any Fragment
  const validChildren = flattenChildren(children).filter(Boolean);

  // Check if current route matches any child NavLink
  const hasActiveChild = validChildren.some(child => {
    if (!isValidElement(child)) return false;
    const to = child.props?.to;
    if (!to) return false;
    return location.pathname === to || location.pathname.startsWith(to + '/');
  });

  // Automatically open when route changes to a child within this group
  useEffect(() => {
    if (hasActiveChild) {
      setOpenGroup(title);
    }
  }, [location.pathname, hasActiveChild, title, setOpenGroup]);

  // If no children permitted/visible, do not render this sidebar group at all
  if (validChildren.length === 0) {
    return null;
  }

  const isOpen = openGroup === title;
  const groupId = `submenu-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div className="mb-1">
      <div 
        onClick={() => toggleGroup(title)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleGroup(title);
          }
        }}
        aria-expanded={isOpen}
        aria-controls={groupId}
        className={`px-4.5 py-3 flex items-center justify-between cursor-pointer transition-all duration-200 border-l-4 select-none relative group ${
          hasActiveChild
            ? isOpen 
              ? 'border-brand-primary bg-brand-light' 
              : 'border-brand-primary bg-brand-primary/10'
            : isOpen 
              ? 'border-gray-200 bg-gray-50/70' 
              : 'border-transparent hover:bg-brand-surface'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          {hasActiveChild && !isOpen && (
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse shrink-0" title="Active module" />
          )}
          {Icon && (
            <Icon 
              size={20} 
              className={`shrink-0 ${hasActiveChild ? 'text-brand-primary' : isOpen ? 'text-text-heading' : 'text-text-muted'}`} 
            />
          )}
          <h3 
            title={title}
            className={`text-[14px] transition-all duration-200 m-0 select-none truncate ${
            hasActiveChild 
              ? 'font-bold text-brand-primary' 
              : isOpen 
                ? 'font-semibold text-text-heading' 
                : 'font-semibold text-text-body'
          }`}>
            {title}
          </h3>
        </div>
        <ChevronDown 
          size={16} 
          className={`shrink-0 ml-auto transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            hasActiveChild 
              ? 'text-brand-primary' 
              : 'text-text-muted'
          } ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      <div 
        id={groupId}
        className={`sidebar-accordion-grid ${isOpen ? 'open' : ''}`}
      >
        <div className="sidebar-accordion-content">
          <div className="sidebar-accordion-inner py-1 space-y-0.5 bg-brand-surface/50 border-y border-border-divider/20">
            {validChildren}
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
  const { hasPermission, hasAnyPermission, isReceiptManager, getDefaultRoute } = usePermission();
  
  // If user visits / or /dashboard but does not have dashboard.view permission, redirect to their primary permitted route
  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/dashboard') {
      if (!hasPermission('dashboard.view')) {
        const target = getDefaultRoute();
        if (target && target !== '/dashboard' && target !== location.pathname) {
          navigate(target, { replace: true });
        }
      }
    }
  }, [location.pathname, hasPermission, getDefaultRoute, navigate]);

  // Hidden / Show More Routes
  const hiddenRoutes = [
    '/upi-autopay',
    '/whatsapp-banking',
    '/biomatrix',
    '/roles-permissions',
    '/help-support',
  ];
  
  const [showMore, setShowMore] = useState(() => {
    return hiddenRoutes.some(route => location.pathname.startsWith(route));
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('advita_desktop_sidebar_open');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem('advita_desktop_sidebar_open', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (hiddenRoutes.some(route => location.pathname.startsWith(route))) {
      setShowMore(true);
    }
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const resetLoader = useLoadingStore((state) => state.resetLoader);

  const userName = user?.fullName || user?.name || 'Bank Admin';
  const roleName = role?.name || user?.role || 'Admin';
  const userAvatar = user?.avatar || user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1B58A6&color=fff`;

  // Automatically clear any stuck loader on route change
  useEffect(() => {
    resetLoader();
  }, [location.pathname, resetLoader]);

  const { globalBranchId, setGlobalBranchId, branchOptions, fetchBranches } = useBranchStore();

  useEffect(() => {
    fetchBranches(true);
  }, [fetchBranches]);

  const handleLogout = () => {
    useBranchStore.getState().resetBranchStore();
    if (logout) logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-4.5 py-3 text-[14px] font-semibold border-l-4 transition-colors ${
      isActive
        ? 'border-brand-primary text-brand-primary bg-brand-light'
        : 'border-transparent text-text-body hover:bg-brand-surface hover:text-text-heading'
    }`;

  const subNavLinkClass = (propsOrTo, explicitTo) => {
    let isActive = false;
    let targetTo = explicitTo;

    if (typeof propsOrTo === 'string') {
      targetTo = propsOrTo;
    } else if (propsOrTo && typeof propsOrTo === 'object') {
      isActive = propsOrTo.isActive;
    }

    const isNestedActive = targetTo
      ? location.pathname === targetTo || location.pathname.startsWith(targetTo + '/')
      : false;

    return `flex items-center gap-2.5 px-4.5 py-2.5 text-[13.5px] font-medium border-l-4 transition-all duration-200 ${
      isActive || isNestedActive
        ? 'border-brand-primary text-brand-primary bg-brand-light font-semibold'
        : 'border-transparent text-text-muted hover:bg-brand-surface hover:text-brand-primary hover:pl-5'
    }`;
  };

  // Check if any "Show More" section has visible items
  const hasShowMoreItems = 
    hasAnyPermission(['upi_autopay.view', 'upi.view']) ||
    hasAnyPermission(['whatsapp_banking.view', 'whatsapp.view']) ||
    hasPermission('biomatrix.view') ||
    hasAnyPermission(['role.view', 'roles_permissions.view', 'role.create']) ||
    hasAnyPermission(['help_support.view', 'settings.view']);

  const [openGroup, setOpenGroup] = useState(null);

  const toggleGroup = useCallback((title) => {
    setOpenGroup((prev) => (prev === title ? null : title));
  }, []);

  return (
    <div className="flex h-screen bg-bg-page overflow-hidden">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop Collapsible & Mobile Slide Drawer) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-brand-sidebar border-r border-border-divider flex flex-col shadow-2xl lg:shadow-sm lg:static lg:z-30 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden print:hidden shrink-0 min-h-0 ${
          isMobileMenuOpen ? 'w-[260px] translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isDesktopSidebarOpen
            ? 'lg:w-[260px] lg:opacity-100 lg:visible'
            : 'lg:w-0 lg:opacity-0 lg:invisible lg:border-none lg:p-0 lg:overflow-hidden'
        }`}
      >
        <div className="w-[260px] h-full flex flex-col shrink-0 min-h-0">
          {/* Logo Area */}
        <div className="h-[76px] flex items-center justify-between px-4 border-b border-border-divider shrink-0 overflow-hidden">
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
              <span className="font-extrabold text-[17px] leading-tight tracking-wide whitespace-nowrap">ADVITA CREDIT</span>
              <span className="font-bold text-[10px] leading-tight tracking-wide whitespace-nowrap">INFO PRIVATE LIMITED</span>
            </div>
          </div>
          {/* Mobile-Only Close Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <SidebarAccordionContext.Provider value={{ openGroup, toggleGroup, setOpenGroup }}>
          <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-0 space-y-1">
            {hasPermission('dashboard.view') && (
              <div className="mb-2">
                <NavLink 
                  to="/dashboard"
                  className={navLinkClass}
                >
                  <LayoutDashboard size={20} className="shrink-0" />
                  <span className="whitespace-nowrap">Dashboard</span>
                </NavLink>
              </div>
            )}

          {/* Branch Management */}
          <SidebarGroup title="Branch Management" icon={MapPin}>
            {hasPermission('branch.view') && (
              <NavLink to="/branch" className={subNavLinkClass}>
                <MapPin size={20} className="shrink-0" />
                <span>Branch</span>
              </NavLink>
            )}
          </SidebarGroup>

          {/* Partner Management */}
          <SidebarGroup title="Partner Management" icon={Store}>
            {hasPermission('merchant.view') && (
              <NavLink to="/merchant" className={subNavLinkClass}>
                <Store size={20} className="shrink-0" />
                <span>Merchant</span>
              </NavLink>
            )}
          </SidebarGroup>

          {/* HR Management */}
          <SidebarGroup title="HR Management" icon={UserCheck}>
            {hasPermission('employee.view') && (
              <NavLink to="/employees" className={subNavLinkClass}>
                <UserCheck size={20} className="shrink-0" />
                <span>Employee</span>
              </NavLink>
            )}
            {hasAnyPermission(['attendance.view', 'attendance_report.view', 'employee.view']) && (
              <NavLink to="/attendance-report" className={subNavLinkClass}>
                <CalendarCheck size={20} className="shrink-0" />
                <span>Attendance Report</span>
              </NavLink>
            )}
            {hasAnyPermission(['letters_payroll.view', 'payroll.view', 'employee.view']) && (
              <NavLink to="/letters-payroll" className={subNavLinkClass}>
                <FileText size={20} className="shrink-0" />
                <span>Letters & Payroll</span>
              </NavLink>
            )}
            {hasAnyPermission(['daily_work_report.view', 'work_report.view', 'employee.view']) && (
              <NavLink to="/daily-work-report" className={subNavLinkClass}>
                <BarChart2 size={20} className="shrink-0" />
                <span>Daily Work Report</span>
              </NavLink>
            )}
            {hasAnyPermission(['kpa_report.view', 'employee.view']) && (
              <NavLink to="/kpa-report" className={subNavLinkClass}>
                <TrendingUp size={20} className="shrink-0" />
                <span>KPA Report</span>
              </NavLink>
            )}
            {hasAnyPermission(['important_dates.view', 'employee.view']) && (
              <NavLink to="/important-dates" className={subNavLinkClass}>
                <CalendarDays size={20} className="shrink-0" />
                <span>Important Dates</span>
              </NavLink>
            )}
          </SidebarGroup>

          {/* CRM Management */}
          <SidebarGroup title="CRM Management" icon={UserPlus}>
            {hasPermission('lead.view') && (
              <NavLink to="/leads" className={subNavLinkClass}>
                <UserPlus size={20} className="shrink-0" />
                <span>Leads</span>
              </NavLink>
            )}
            {hasAnyPermission(['customer.view', 'lead.view', 'merchant.view']) && (
              <NavLink to="/society-customers" className={subNavLinkClass}>
                <UserCheck size={20} className="shrink-0" />
                <span>Society Customers</span>
              </NavLink>
            )}
            {hasPermission('inventory.view') && (
              <NavLink to="/inventory" className={subNavLinkClass}>
                <List size={20} className="shrink-0" />
                <span>Inventory</span>
              </NavLink>
            )}
          </SidebarGroup>

          {/* Verification */}
          <SidebarGroup title="Verification" icon={ClipboardList}>
            {hasAnyPermission(['cards_credit.view', 'cibil.view', 'cibil_score.view', 'credit_score.view', 'verification.view']) && (
              <NavLink to="/cibil" className={(props) => subNavLinkClass(props, '/cibil')}>
                <ClipboardList size={18} /> CIBIL Score & Report
              </NavLink>
            )}
            {hasAnyPermission(['kyc.view', 'verification.view']) && (
              <NavLink to="/kyc" className={(props) => subNavLinkClass(props, '/kyc')}>
                <IdCard size={18} /> KYC Verification
              </NavLink>
            )}
          </SidebarGroup>

          {/* Receipt Management */}
          <SidebarGroup title="Receipt Management" icon={ArrowRightLeft}>
            {(hasPermission('receipt.view') || isReceiptManager) && (
              <>
                <NavLink to="/credit" className={(props) => subNavLinkClass(props, '/credit')}>
                  <ArrowDownRight size={18} /> Credit Receipt
                </NavLink>
                <NavLink to="/debit" className={(props) => subNavLinkClass(props, '/debit')}>
                  <ArrowUpRight size={18} /> Debit Receipt
                </NavLink>
                <NavLink to="/transfer" className={(props) => subNavLinkClass(props, '/transfer')}>
                  <ArrowRightLeft size={18} /> Transfer Receipt
                </NavLink>
                <NavLink to="/contra" className={(props) => subNavLinkClass(props, '/contra')}>
                  <RefreshCcw size={18} /> Contra Receipt
                </NavLink>
              </>
            )}
          </SidebarGroup>

          {/* Payment */}
          <SidebarGroup title="Payment" icon={Banknote}>
            {hasPermission('cash_payment.view') && (
              <NavLink to="/cash-payment" className={subNavLinkClass}>
                <Banknote size={20} className="shrink-0" />
                <span>Cash Payment</span>
              </NavLink>
            )}
          </SidebarGroup>

          {/* Cards & Credit */}
          <SidebarGroup title="Cards & Credit" icon={CreditCard}>
            {hasAnyPermission(['cards_credit.view', 'card_credit.view', 'emi_card.view', 'card.view']) && (
              <NavLink to="/cards-credit" className={subNavLinkClass}>
                <CreditCard size={20} className="shrink-0" />
                <span>Cards & Credit</span>
              </NavLink>
            )}
          </SidebarGroup>

          {/* Reports & Analytics */}
          <SidebarGroup title="Reports & Analytics" icon={BarChart3}>
            {hasAnyPermission(['report.view', 'report.export']) && (
              <NavLink to="/reports" className={(props) => subNavLinkClass(props, '/reports')}>
                <BarChart3 size={18} /> Reports & Analytics
              </NavLink>
            )}
          </SidebarGroup>

          {/* Geo Tagging */}
          <SidebarGroup title="Geo Tagging" icon={MapPin}>
            {hasAnyPermission(['geotagging.view', 'geo_tagging.view', 'geo.view', 'tracking.view']) && (
              <NavLink to="/geo-tagging" className={subNavLinkClass}>
                <MapPin size={20} className="shrink-0" />
                <span>Geo Tagging</span>
              </NavLink>
            )}
          </SidebarGroup>

          <div className={`sidebar-accordion-grid ${showMore ? 'open' : ''}`}>
            <div className="sidebar-accordion-content">
              <div className="sidebar-accordion-inner space-y-1">
                <SidebarGroup title="UPI Smart" icon={Smartphone}>
                  {hasAnyPermission(['upi_autopay.view', 'upi.view']) && (
                    <NavLink to="/upi-autopay" className={subNavLinkClass}>
                      <Smartphone size={20} className="shrink-0" />
                      <span>UPI Autopay</span>
                    </NavLink>
                  )}
                </SidebarGroup>

                <SidebarGroup title="WhatsApp Marketing" icon={MessageCircle}>
                  {hasAnyPermission(['whatsapp_banking.view', 'whatsapp.view']) && (
                    <NavLink to="/whatsapp-banking" className={subNavLinkClass}>
                      <MessageCircle size={20} className="shrink-0" />
                      <span>WhatsApp Banking</span>
                    </NavLink>
                  )}
                </SidebarGroup>

                <SidebarGroup title="Biomatrix Integration" icon={Fingerprint}>
                  {hasPermission('biomatrix.view') && (
                    <NavLink to="/biomatrix-integration" className={subNavLinkClass}>
                      <Fingerprint size={20} className="shrink-0" />
                      <span>Biomatrix Integration</span>
                    </NavLink>
                  )}
                </SidebarGroup>

                <SidebarGroup title="Roles & Permissions" icon={UserCog}>
                  {hasAnyPermission(['role.view', 'roles_permissions.view', 'role.create']) && (
                    <NavLink to="/roles-permissions" className={subNavLinkClass}>
                      <UserCog size={20} className="shrink-0" />
                      <span>Roles & Permissions</span>
                    </NavLink>
                  )}
                </SidebarGroup>

                <SidebarGroup title="Settings" icon={MoreHorizontal}>
                  {hasAnyPermission(['help_support.view', 'settings.view']) && (
                    <NavLink to="/settings/help" className={subNavLinkClass}>
                      <Headphones size={20} className="shrink-0" />
                      <span>Help & Support</span>
                    </NavLink>
                  )}
                </SidebarGroup>
              </div>
            </div>
          </div>
          
          {hasShowMoreItems && (
            <div className="mb-4 mt-2">
              <div 
                onClick={() => setShowMore(!showMore)}
                className={`px-6 py-3.5 flex items-center justify-between cursor-pointer transition-all duration-200 border-l-4 group ${
                  !showMore && hiddenRoutes.some(route => location.pathname.startsWith(route))
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-transparent hover:bg-brand-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  {!showMore && hiddenRoutes.some(route => location.pathname.startsWith(route)) ? (
                    <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                  ) : (
                    <MoreHorizontal size={18} className="text-text-muted group-hover:text-brand-primary transition-colors" />
                  )}
                  <h3 className={`text-[14.5px] m-0 select-none transition-colors ${
                    !showMore && hiddenRoutes.some(route => location.pathname.startsWith(route))
                      ? 'font-bold text-brand-primary'
                      : 'font-semibold text-text-body group-hover:text-brand-primary'
                  } ${!isDesktopSidebarOpen ? 'lg:hidden' : ''}`}>
                    {showMore ? 'Show Less' : 'Show More'}
                  </h3>
                </div>
                <div className={!isDesktopSidebarOpen ? 'lg:hidden' : ''}>
                  <ChevronDown size={16} className={`transition-transform duration-300 ease-out ${
                    showMore ? 'rotate-180 text-brand-primary' : !showMore && hiddenRoutes.some(route => location.pathname.startsWith(route)) ? 'text-brand-primary' : 'text-text-muted'
                  }`} />
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarAccordionContext.Provider>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Topbar */}
        <header className="h-[76px] bg-brand-header text-white flex items-center justify-between px-4 sm:px-8 shadow-sm shrink-0 print:hidden">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Sidebar Toggle Button (Desktop & Mobile) */}
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileMenuOpen(true);
                } else {
                  toggleDesktopSidebar();
                }
              }}
              aria-label={isDesktopSidebarOpen ? "Close navigation sidebar" : "Open navigation sidebar"}
              title={isDesktopSidebarOpen ? "Close sidebar" : "Open sidebar"}
              className={`w-10 h-10 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 border focus:outline-none focus:ring-2 focus:ring-white/30 active:scale-95 ${
                isDesktopSidebarOpen
                  ? "bg-white/10 hover:bg-white/20 border-white/15 text-white/90 hover:text-white shadow-2xs"
                  : "bg-white/25 hover:bg-white/35 border-white/30 text-white shadow-sm ring-2 ring-white/15"
              }`}
            >
              {isDesktopSidebarOpen ? (
                <PanelLeftClose size={20} className="hidden lg:block transition-transform duration-200" />
              ) : (
                <PanelLeftOpen size={20} className="hidden lg:block transition-transform duration-200" />
              )}
              <Menu size={22} className="lg:hidden" />
            </button>

            {/* Subtle Vertical Divider */}
            <div className="hidden sm:block h-6 w-px bg-white/20 shrink-0" />

            <div>
              <div className="text-[11px] sm:text-xs text-white/80 font-medium">Welcome</div>
              <div className="flex items-center gap-2">
                <div className="text-base sm:text-lg font-semibold tracking-wide truncate max-w-[130px] sm:max-w-none">{userName}</div>
                {roleName && (
                  <span className="hidden sm:inline-block bg-white/15 text-white/90 border border-white/20 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium tracking-wide">
                    {roleName}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-5 relative">
            <Link to="/notifications" className="relative p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors block">
              <Bell size={18} className="text-white" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-semantic-danger rounded-full border border-brand-header flex items-center justify-center text-[8px] font-bold"></span>
            </Link>
            
            <div className="relative">
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 bg-white/90 text-text-heading py-1.5 px-2 pr-3 rounded-full cursor-pointer hover:bg-white transition-colors shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex items-center justify-center">
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-medium">{userName.split(' ')[0]}</span>
                <ChevronDown size={14} className={`text-text-muted transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-text-body hover:bg-bg-page hover:text-text-heading transition-colors flex items-center gap-2 font-medium"
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
        <main className="flex-1 overflow-y-auto bg-bg-page p-2 sm:p-3 relative">
          
          
          <GlobalLoader />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
