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
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-2 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${className}`}>
      {/* Left: Back Button, Title & Breadcrumbs */}
      <div className="flex items-start gap-3">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className="mt-1 p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer shrink-0"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-[20px] font-bold text-[#225091] mb-1.5 leading-tight">
            {title}
          </h1>
  
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
      </div>

      {/* Right: Actions */}
      <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
