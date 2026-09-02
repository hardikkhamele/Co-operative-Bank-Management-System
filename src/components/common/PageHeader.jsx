import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';

/**
 * Standardized PageHeader component for Advita Cooperative Bank Panel.
 * Provides consistent typography, breadcrumbs navigation, and optional back / action buttons.
 *
 * @param {Object} props
 * @param {string} props.title - Main page title (e.g. "Create Employee", "Daily Work Report")
 * @param {Array<{label: string, to?: string}>} [props.breadcrumbs] - Array of breadcrumb items
 * @param {boolean} [props.showBack] - Whether to show the standard back button
 * @param {string} [props.backUrl] - Optional specific route to navigate back to (defaults to history back)
 * @param {Function} [props.onBack] - Optional custom click handler for back button
 * @param {React.ReactNode} [props.children] - Additional action buttons/elements placed on the right
 * @param {string} [props.className] - Additional wrapper CSS classes
 */
export const PageHeader = ({
  title,
  breadcrumbs = [],
  showBack = false,
  backUrl,
  onBack,
  children,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${className}`}>
      {/* Left: Title with inline back button & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-3 mb-1.5">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              title="Go back"
              className="group w-8 h-8 rounded-full border border-gray-200/90 bg-white hover:border-[#225091]/40 hover:bg-[#225091]/5 text-gray-600 hover:text-[#225091] active:scale-95 transition-all duration-200 shadow-2xs flex items-center justify-center shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#225091]/20"
            >
              <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-0.5 text-gray-600 group-hover:text-[#225091]" />
            </button>
          )}
          <h1 className="text-[22px] font-bold text-[#225091] leading-tight">
            {title}
          </h1>
        </div>

        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center text-[13px] font-medium text-gray-500 flex-wrap gap-y-1">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.label || index}>
                  {crumb.to && !isLast ? (
                    <Link
                      to={crumb.to}
                      className="hover:text-gray-800 transition-colors cursor-pointer"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "text-[#225091]" : "hover:text-gray-800"}>
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && <ChevronRight size={14} className="mx-1 text-gray-400 shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      {children && (
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
