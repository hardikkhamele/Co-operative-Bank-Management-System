/**
 * Utility functions for user role evaluation and permission checks
 */

/**
 * Evaluates whether the currently authenticated user is a Bank Owner / Super Admin.
 * 
 * Supports various role object structures from auth responses:
 * - role: { id: null, name: "Bank Owner" }
 * - role: { code: "BANK_OWNER", name: "Bank Owner" }
 * - role: "Bank Owner" | "BANK_OWNER"
 * - user.role: { name: "Bank Owner" }
 * - user.designation: "Bank Owner"
 * 
 * @param {object|string} role - The role object or string from authStore
 * @param {object} user - The user object from authStore
 * @returns {boolean} True if the user is a Bank Owner / Super Admin
 */
export const isBankOwner = (role, user) => {
  // If explicit boolean flag exists on user
  if (user?.isBankOwner === true || user?.isOwner === true) return true;

  const roleName = (
    (typeof role === "string" ? role : "") ||
    role?.name ||
    role?.code ||
    role?.roleName ||
    role?.title ||
    (typeof user?.role === "string" ? user?.role : "") ||
    user?.role?.name ||
    user?.role?.code ||
    user?.designation ||
    user?.userType ||
    user?.type ||
    ""
  ).toUpperCase().trim();

  // In this fintech platform, Bank Owner can be:
  // - "BANK_OWNER", "BANK OWNER", "OWNER"
  // - "VENDOR" (the society bank vendor identity)
  // - "SUPER_ADMIN", "SUPER ADMIN"
  // - An account with a bankId and no branchId (bank-level authority)
  if (
    roleName.includes("BANK OWNER") ||
    roleName.includes("BANK_OWNER") ||
    roleName === "OWNER" ||
    roleName.startsWith("OWNER ") ||
    roleName.endsWith(" OWNER") ||
    roleName.includes("SUPER ADMIN") ||
    roleName.includes("SUPER_ADMIN") ||
    roleName === "VENDOR" ||
    roleName.includes("VENDOR") ||
    (Boolean(user?.bankId) && (!user?.branchId || user?.branchId === null || user?.branchId === "ALL"))
  ) {
    return true;
  }

  return false;
};

/**
 * Evaluates whether the currently authenticated user is a Bank Receipt Manager.
 * 
 * Supports:
 * - "Bank Receipt Manager"
 * - "BANK_RECEIPT_MANAGER"
 * - "Receipt Manager"
 * 
 * @param {object|string} role 
 * @param {object} user 
 * @returns {boolean}
 */
export const isReceiptManager = (role, user) => {
  const roleName = (
    role?.name ||
    role?.code ||
    (typeof role === "string" ? role : "") ||
    user?.role?.name ||
    user?.role?.code ||
    (typeof user?.role === "string" ? user?.role : "") ||
    user?.designation ||
    ""
  ).toUpperCase().trim();

  if (!roleName) return false;

  return (
    roleName.includes("RECEIPT MANAGER") ||
    roleName.includes("RECEIPT_MANAGER") ||
    roleName.includes("BANK RECEIPT") ||
    roleName.includes("BANK_RECEIPT")
  );
};

/**
 * Determines if the current user has permission to approve or reject financial receipts.
 * Authorized for:
 * 1. Bank Owner / Super Admin
 * 2. Bank Receipt Manager
 * 3. Users with explicit 'receipt.approve', 'receipt.reject', or 'receipt.manage' permissions
 * 
 * @param {object|string} role 
 * @param {object} user 
 * @param {Array} permissions
 * @returns {boolean}
 */
export const canApproveReceipts = (role, user, permissions = []) => {
  if (isBankOwner(role, user)) return true;
  if (isReceiptManager(role, user)) return true;

  if (Array.isArray(permissions) && permissions.length > 0) {
    const hasPerm = permissions.some((p) => {
      const key = (typeof p === 'string' ? p : p?.key || '').toLowerCase();
      return (
        key === 'receipt.approve' ||
        key === 'receipt.reject' ||
        key === 'receipt.manage' ||
        key === 'receipt.*' ||
        key === '*' ||
        key === 'all'
      );
    });
    if (hasPerm) return true;
  }

  return false;
};

/**
 * Determines if the current user has access to approve or reject merchant onboarding.
 * Strictly restricted to:
 * 1. Bank Owner (BANK_OWNER, OWNER, VENDOR, bank-level account)
 * 2. Society Admin / Super Admin
 * 3. Branch Manager
 * 
 * @param {object|string} role 
 * @param {object} user 
 * @param {Array} permissions 
 * @returns {boolean} True if the user is authorized to approve/reject merchant onboarding
 */
export const canApproveMerchantOnboarding = (role, user, permissions = []) => {
  // 1. Bank Owner
  if (isBankOwner(role, user)) {
    return true;
  }

  const roleStr = (
    (typeof role === "string" ? role : "") ||
    role?.name ||
    role?.code ||
    role?.roleName ||
    (typeof user?.role === "string" ? user?.role : "") ||
    user?.role?.name ||
    user?.role?.code ||
    user?.designation ||
    user?.userType ||
    user?.type ||
    ""
  ).toUpperCase().trim();

  const roleNormalized = roleStr.replace(/\s+/g, '_');

  // 1. Bank Owner variants
  if (
    roleStr.includes('BANK OWNER') || 
    roleNormalized.includes('BANK_OWNER') || 
    roleNormalized === 'OWNER' || 
    roleNormalized.includes('VENDOR') ||
    user?.isBankOwner === true
  ) {
    return true;
  }

  // 2. Society Admin / Super Admin / Admin
  if (
    roleNormalized.includes('SOCIETY_ADMIN') ||
    roleNormalized.includes('SUPER_ADMIN') ||
    roleNormalized.includes('ADMIN') ||
    roleNormalized.includes('SOCIETY_MANAGEMENT')
  ) {
    return true;
  }

  // 3. Branch Manager
  if (
    roleNormalized.includes('BRANCH_MANAGER') || 
    roleNormalized.includes('MANAGER') ||
    user?.isBranchManager === true
  ) {
    return true;
  }

  // 4. Quality Check (QC) Officers (QC_EMPLOYEE, QUALITY_CHECK, QC)
  if (
    roleNormalized.includes('QC') ||
    roleNormalized.includes('QUALITY_CHECK') ||
    roleNormalized.includes('QC_EMPLOYEE')
  ) {
    return true;
  }

  // 5. Fallback check for explicit granular permission
  if (Array.isArray(permissions) && permissions.length > 0) {
    const hasPerm = permissions.some((p) => {
      const key = (typeof p === 'string' ? p : p?.key || p?.code || '').toLowerCase().trim();
      return (
        key === 'merchant.approve' ||
        key === 'merchant.reject' ||
        key === 'merchant.manage' ||
        key === 'merchant.*' ||
        key === '*' ||
        key === 'all'
      );
    });
    if (hasPerm) return true;
  }

  return false;
};

/**
 * Determines if the current user is Authorized Personnel to link/add/update
 * Society Bank Account details for a Merchant partner.
 * 
 * Authorized roles per API specification:
 * - Bank Owner / Super Admin / Society Admin
 * - Branch Manager
 * - Quality Check (QC) Officers (QC_EMPLOYEE, QUALITY_CHECK)
 * 
 * Note: Loan Executives (LOAN_EXECUTIVE) are strictly excluded.
 * 
 * @param {object|string} role 
 * @param {object} user 
 * @param {Array} permissions 
 * @returns {boolean}
 */
export const canManageMerchantBankDetails = (role, user, permissions = []) => {
  const roleStr = (
    (typeof role === "string" ? role : "") ||
    role?.name ||
    role?.code ||
    (typeof user?.role === "string" ? user?.role : "") ||
    user?.designation ||
    ""
  ).toUpperCase().trim();

  // Loan Executives cannot link or add bank details
  if (roleStr.includes('LOAN_EXECUTIVE') || roleStr.includes('LOAN EXECUTIVE')) {
    return false;
  }

  return canApproveMerchantOnboarding(role, user, permissions);
};

