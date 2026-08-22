import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import usePermission from '../../hooks/usePermission';
import { ShieldAlert } from 'lucide-react';

const PermissionRoute = ({ permission, anyOf, allOf, redirectTo = "/dashboard", showForbidden = false }) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

  let isAllowed = true;

  if (permission) {
    isAllowed = hasPermission(permission);
  } else if (anyOf && anyOf.length > 0) {
    isAllowed = hasAnyPermission(anyOf);
  } else if (allOf && allOf.length > 0) {
    isAllowed = hasAllPermissions(allOf);
  }

  if (!isAllowed) {
    if (showForbidden) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-sm text-gray-500 max-w-md mb-6">
            You do not have permission to view this module. Please contact your administrator if you require access.
          </p>
          <a
            href={redirectTo}
            className="px-5 py-2.5 bg-[#225091] text-white rounded-xl text-sm font-semibold hover:bg-[#1b3f73] transition-colors shadow-sm"
          >
            Return to Dashboard
          </a>
        </div>
      );
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default PermissionRoute;
