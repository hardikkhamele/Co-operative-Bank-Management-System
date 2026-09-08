import { useMemo, useCallback } from 'react';
import useAuthStore from '../store/authStore';
import { 
  isReceiptManager, 
  isBankOwner, 
  canApproveReceipts as checkCanApproveReceipts,
  canApproveMerchantOnboarding
} from '../utils/roleUtils';

/**
 * Custom hook to check user permissions and roles
 */
export const usePermission = () => {
  const storePermissions = useAuthStore((state) => state.permissions);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);

  // Fallback to user.permissions or role.permissions if store permissions are empty
  const permissions = useMemo(() => {
    if (Array.isArray(storePermissions) && storePermissions.length > 0) {
      return storePermissions;
    }
    if (Array.isArray(user?.permissions) && user.permissions.length > 0) {
      return user.permissions;
    }
    if (Array.isArray(role?.permissions) && role.permissions.length > 0) {
      return role.permissions;
    }
    return [];
  }, [storePermissions, user, role]);

  // Check if user is a Bank Receipt Manager
  const isReceiptMgr = useMemo(() => {
    return isReceiptManager(role, user);
  }, [role, user]);

  // Check if user can approve/reject receipts
  const canApprove = useMemo(() => {
    return checkCanApproveReceipts(role, user, permissions);
  }, [role, user, permissions]);

  // Check if user can approve/reject merchant onboarding (Bank Owner, Society Admin, Branch Manager)
  const canApproveMerchant = useMemo(() => {
    return canApproveMerchantOnboarding(role, user, permissions);
  }, [role, user, permissions]);

  // Check if user is Super Admin, Bank Owner, or Full Admin with unrestricted system access
  const isSuperAdmin = useMemo(() => {
    // 1. Explicit wildcard permissions grant super admin access
    if (Array.isArray(permissions) && (permissions.includes('*') || permissions.includes('all'))) {
      return true;
    }

    // 2. Bank Owner / Super Admin via roleUtils
    if (isBankOwner(role, user)) {
      return true;
    }

    const rawRole =
      role?.code ||
      role?.name ||
      (typeof role === 'string' ? role : '') ||
      user?.role?.code ||
      user?.role?.name ||
      (typeof user?.role === 'string' ? user?.role : '') ||
      user?.designation ||
      '';
    const roleUpper = rawRole.toUpperCase().replace(/\s+/g, '_').trim();

    // Strictly match authorized administrative titles only
    return (
      roleUpper === 'SUPER_ADMIN' ||
      roleUpper === 'ADMIN' ||
      roleUpper === 'SYSTEM_ADMIN' ||
      roleUpper === 'BRANCH_MANAGER'
    );
  }, [role, user, permissions]);

  // Comprehensive set of normalized permissions for fast lookup
  const permissionSet = useMemo(() => {
    const set = new Set();
    if (!Array.isArray(permissions)) return set;

    permissions.forEach((p) => {
      if (!p) return;
      if (typeof p === 'string') {
        const lower = p.toLowerCase().trim();
        set.add(lower);
        set.add(lower.replace(/[:_]/g, '.'));
        set.add(lower.replace(/[:.]/g, '_'));
      } else if (typeof p === 'object') {
        ['key', 'name', 'code', 'permission', 'slug'].forEach((field) => {
          if (typeof p[field] === 'string') {
            const val = p[field].toLowerCase().trim();
            set.add(val);
            set.add(val.replace(/[:_]/g, '.'));
            set.add(val.replace(/[:.]/g, '_'));
          }
        });
        if (p.module && p.action) {
          const modAct = `${p.module}.${p.action}`.toLowerCase();
          set.add(modAct);
          set.add(modAct.replace(/[:.]/g, '_'));
        }
        if (p.module && Array.isArray(p.actions)) {
          p.actions.forEach((act) => {
            const modAct = `${p.module}.${act}`.toLowerCase();
            set.add(modAct);
            set.add(modAct.replace(/[:.]/g, '_'));
          });
        }
      }
    });

    return set;
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

      const key = permissionKey.toLowerCase().trim();
      const dotKey = key.replace(/[:_]/g, '.');
      const underscoreKey = key.replace(/[:.]/g, '_');

      // Bank Receipt Manager has full access to all receipt actions
      if (isReceiptMgr && (dotKey.startsWith('receipt.') || dotKey.includes('receipt'))) {
        return true;
      }

      if (permissionSet.has(key) || permissionSet.has(dotKey) || permissionSet.has(underscoreKey)) {
        return true;
      }

      // Check for wildcard match like 'receipt.*'
      const moduleName = dotKey.split('.')[0];
      if (
        permissionSet.has(`${moduleName}.*`) ||
        permissionSet.has(`${moduleName}:*`) ||
        permissionSet.has(`${moduleName}_*`)
      ) {
        return true;
      }

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

  /**
   * Resolves the primary landing route according to user role and permissions
   * @returns {string}
   */
  const getDefaultRoute = useCallback(() => {
    if (hasPermission('dashboard.view')) return '/dashboard';
    if (isReceiptMgr || hasPermission('receipt.view')) return '/credit';
    if (hasPermission('branch.view')) return '/branch';
    if (hasPermission('employee.view')) return '/employees';
    if (hasPermission('lead.view')) return '/leads';
    if (hasPermission('cibil.view') || hasPermission('kyc.view')) return '/kyc';
    if (hasPermission('cash_payment.view')) return '/cash-payment';
    if (hasPermission('cards_credit.view')) return '/cards-credit';
    if (hasPermission('geotagging.view') || hasPermission('geo_tagging.view')) return '/geo-tagging';
    return '/profile';
  }, [hasPermission, isReceiptMgr]);

  return {
    permissions,
    role,
    user,
    isSuperAdmin,
    isReceiptManager: isReceiptMgr,
    canApproveReceipts: canApprove,
    canApproveMerchant,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getDefaultRoute,
  };
};

export default usePermission;
