import useAuthStore from '../store/authStore';

export const getInventoryPermissions = (userRole) => {
  const role = (typeof userRole === 'string' ? userRole : '').toUpperCase().replace(/\s+/g, '_');
  
  const isAdminTier = ['BANK_OWNER', 'SOCIETY_ADMIN', 'INVENTORY_MANAGER'].includes(role);
  const isBranchManager = role === 'BRANCH_MANAGER';
  const isBranchOfficer = role === 'BRANCH_INVENTORY_OFFICER';
  const isStaffTier = !isAdminTier && !isBranchManager && !isBranchOfficer;

  return {
    canViewSocietyStats: isAdminTier,
    canViewBranchStats: isAdminTier || isBranchManager || isBranchOfficer,
    canManageCatalog: isAdminTier,
    canManageVendors: isAdminTier,
    canManageCentralWarehouse: isAdminTier,
    canApproveRequisitions: isAdminTier || isBranchManager,
    canApproveTransfers: isAdminTier || isBranchManager,
    canApproveAdjustments: isAdminTier || isBranchManager,
    canApproveDisposals: isAdminTier, // explicitly NOT Branch Manager per 7.7
    canAssignAssets: isAdminTier || isBranchManager,
    canManageTransfers: isAdminTier || isBranchManager || isBranchOfficer, // create/dispatch/receive
    canManageAdjustments: isAdminTier || isBranchManager || isBranchOfficer, // create/edit/cancel
    canFulfillRequisitions: isAdminTier || isBranchManager || isBranchOfficer, // fulfill/issue
    isStaffScoped: isStaffTier,
    roleLevel: isAdminTier ? 'ADMIN' : isBranchManager ? 'BRANCH_MANAGER' : isBranchOfficer ? 'BRANCH_OFFICER' : 'STAFF'
  };
};

export const useInventoryPermissions = () => {
  const authRole = useAuthStore((state) => state.role);
  const authUser = useAuthStore((state) => state.user);
  
  const rawRole = authRole?.code || authRole?.name || authRole || authUser?.role?.code || authUser?.role?.name || authUser?.role || 'BRANCH_MANAGER';
  
  return getInventoryPermissions(rawRole);
};
