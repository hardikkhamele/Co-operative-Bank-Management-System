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
 * Determines if the current user has permission to approve or reject financial receipts.
 * Strictly restricted to Bank Owner / Super Admin.
 * 
 * @param {object|string} role 
 * @param {object} user 
 * @returns {boolean}
 */
export const canApproveReceipts = (role, user) => {
  return isBankOwner(role, user);
};
