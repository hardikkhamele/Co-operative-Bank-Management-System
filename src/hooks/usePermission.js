import { useMemo, useCallback } from 'react';
import useAuthStore from '../store/authStore';
import { isReceiptManager, canApproveReceipts as checkCanApproveReceipts } from '../utils/roleUtils';

/**
 * Custom hook to check user permissions and roles
 */
export const usePermission = () => {
  const permissions = useAuthStore((state) => state.permissions) || [];
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  // Check if user is a Bank Receipt Manager
  const isReceiptMgr = useMemo(() => {
    return isReceiptManager(role, user);
  }, [role, user]);

  // Check if user can approve/reject receipts
  const canApprove = useMemo(() => {
    return checkCanApproveReceipts(role, user, permissions);
  }, [role, user, permissions]);

  // Check if user is Super Admin, Bank Owner, Branch Manager or Admin with full access
  const isSuperAdmin = useMemo(() => {
    const rawRole =
      role?.code ||
      role?.name ||
      role ||
      user?.role?.code ||
      user?.role?.name ||
      user?.role ||
      '';
    const roleCode = (typeof rawRole === 'string' ? rawRole : '').toUpperCase().replace(/\s+/g, '_');
    const userRole = (typeof user?.role === 'string' ? user.role : '').toUpperCase();
    return (
      roleCode === 'SUPER_ADMIN' ||
      roleCode === 'ADMIN' ||
      roleCode.includes('BANK_OWNER') ||
      roleCode.includes('OWNER') ||
      roleCode.includes('BRANCH_MANAGER') ||
      roleCode.includes('MANAGER') ||
      userRole.includes('SUPER_ADMIN') ||
      userRole.includes('ADMIN') ||
      userRole.includes('OWNER') ||
      userRole.includes('MANAGER') ||
      permissions.includes('*') ||
      permissions.includes('all')
    );
  }, [role, user, permissions]);

  // Set of normalized permissions for fast lookup
  const permissionSet = useMemo(() => {
    return new Set(
      Array.isArray(permissions)
        ? permissions.map((p) => (typeof p === 'string' ? p.toLowerCase() : p?.key?.toLowerCase() || ''))
        : []
    );
  }, [permissions]);

  /**
   * Checks if user has a specific permission
   * @param {string} permissionKey - e.g. 'receipt.view'
   * @returns {boolean}
   */
  const hasPermission = useCallback(
    (permissionKey) => {
      if (!permissionKey) return true; // If no permission required, allow access
      if (isSuperAdmin) return true;

      const normalizedKey = permissionKey.toLowerCase();

      // Bank Receipt Manager has full access to all receipt actions
      if (isReceiptMgr && (normalizedKey.startsWith('receipt.') || normalizedKey.includes('receipt'))) {
        return true;
      }

      if (permissionSet.has(normalizedKey)) return true;

      // Check for wildcard match like 'receipt.*'
      const [moduleName] = normalizedKey.split('.');
      if (permissionSet.has(`${moduleName}.*`)) return true;

      return false;
    },
    [isSuperAdmin, isReceiptMgr, permissionSet]
  );

  /**
   * Checks if user has ANY of the specified permissions
   * @param {string[]} permissionKeys - e.g. ['receipt.view', 'cash_payment.view']
   * @returns {boolean}
   */
  const hasAnyPermission = useCallback(
    (permissionKeys = []) => {
      if (!permissionKeys || permissionKeys.length === 0) return true;
      if (isSuperAdmin) return true;
      return permissionKeys.some((key) => hasPermission(key));
    },
    [isSuperAdmin, hasPermission]
  );

  /**
   * Checks if user has ALL of the specified permissions
   * @param {string[]} permissionKeys
   * @returns {boolean}
   */
  const hasAllPermissions = useCallback(
    (permissionKeys = []) => {
      if (!permissionKeys || permissionKeys.length === 0) return true;
      if (isSuperAdmin) return true;
      return permissionKeys.every((key) => hasPermission(key));
    },
    [isSuperAdmin, hasPermission]
  );

  return {
    permissions,
    role,
    user,
    isSuperAdmin,
    isReceiptManager: isReceiptMgr,
    canApproveReceipts: canApprove,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};

export default usePermission;
