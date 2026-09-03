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
    roleName.includes("BANK OWNER") ||
    roleName.includes("BANK_OWNER") ||
    roleName === "OWNER" ||
    roleName.startsWith("OWNER ") ||
    roleName.endsWith(" OWNER") ||
    roleName.includes("SUPER ADMIN") ||
    roleName.includes("SUPER_ADMIN")
  );
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
