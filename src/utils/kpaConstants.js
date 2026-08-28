/**
 * KPA (Key Performance Area) Constants, Role Configuration Matrix & Goal Derivation Utilities
 */

export const KPA_ROLE_MATRIX = {
  LOAN_EXECUTIVE: [
    { product: 'Loan Disbursement', targetType: 'AMOUNT', defaultTarget: 0 },
    { product: 'Lead Generation', targetType: 'COUNT', defaultTarget: 0 }
  ],
  COLLECTION_EXECUTIVE: [
    { product: 'Deposit Collection', targetType: 'AMOUNT', defaultTarget: 0 }
  ],
  BRANCH_MANAGER: [
    { product: 'Loan Disbursement', targetType: 'AMOUNT', defaultTarget: 0 },
    { product: 'Deposit Collection', targetType: 'AMOUNT', defaultTarget: 0 },
    { product: 'Lead Generation', targetType: 'COUNT', defaultTarget: 0 }
  ],
  MANAGER: [
    { product: 'Loan Disbursement', targetType: 'AMOUNT', defaultTarget: 0 },
    { product: 'Deposit Collection', targetType: 'AMOUNT', defaultTarget: 0 },
    { product: 'Lead Generation', targetType: 'COUNT', defaultTarget: 0 }
  ],
  RECEIPT_MANAGEMENT_EXECUTIVE: [
    { product: 'Deposit Collection', targetType: 'AMOUNT', defaultTarget: 0 }
  ],
  ACCOUNTANT: [
    { product: 'Share Capital', targetType: 'AMOUNT', defaultTarget: 0 }
  ],
  SUPPORT_EXECUTIVE: [
    { product: 'Lead Generation', targetType: 'COUNT', defaultTarget: 0 }
  ],
  HR_EXECUTIVE: [
    { product: 'Staff Onboarding', targetType: 'COUNT', defaultTarget: 0 }
  ],
  HR: [
    { product: 'Staff Onboarding', targetType: 'COUNT', defaultTarget: 0 }
  ]
};

export const ALL_KPA_PRODUCTS = [
  { name: 'Loan Disbursement', defaultType: 'AMOUNT' },
  { name: 'Deposit Collection', defaultType: 'AMOUNT' },
  { name: 'Lead Generation', defaultType: 'COUNT' },
  { name: 'Share Capital', defaultType: 'AMOUNT' },
  { name: 'Staff Onboarding', defaultType: 'COUNT' },
  { name: 'Cash Collection', defaultType: 'AMOUNT' },
  { name: 'Fixed Deposit', defaultType: 'AMOUNT' },
  { name: 'Recurring Deposit', defaultType: 'AMOUNT' },
  { name: 'Savings Account', defaultType: 'COUNT' },
  { name: 'Gold Loan', defaultType: 'AMOUNT' }
];

/**
 * Derives proportional KPA goals according to the official backend formula:
 * - Yearly: Y
 * - Monthly: Math.round(Y / 12)
 * - Weekly: Math.round(Monthly / 4)
 * - Daily: Math.round(Weekly / 5)
 */
export const deriveKpaGoals = (yearlyTarget = 0) => {
  const yearly = Math.max(0, Number(yearlyTarget) || 0);
  const monthly = Math.round(yearly / 12);
  const weekly = Math.round(monthly / 4);
  const daily = Math.round(weekly / 5);

  return {
    yearly,
    monthly,
    weekly,
    daily
  };
};

/**
 * Resolves default seeded targets for a given role or designation name
 */
export const getRecommendedProductsForRole = (roleOrDesignation = '') => {
  if (!roleOrDesignation) return KPA_ROLE_MATRIX.LOAN_EXECUTIVE;

  const normalized = roleOrDesignation
    .toString()
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_');

  if (KPA_ROLE_MATRIX[normalized]) {
    return KPA_ROLE_MATRIX[normalized];
  }

  if (normalized.includes('LOAN')) return KPA_ROLE_MATRIX.LOAN_EXECUTIVE;
  if (normalized.includes('COLLECT')) return KPA_ROLE_MATRIX.COLLECTION_EXECUTIVE;
  if (normalized.includes('MANAGER')) return KPA_ROLE_MATRIX.BRANCH_MANAGER;
  if (normalized.includes('RECEIPT')) return KPA_ROLE_MATRIX.RECEIPT_MANAGEMENT_EXECUTIVE;
  if (normalized.includes('ACCOUNT')) return KPA_ROLE_MATRIX.ACCOUNTANT;
  if (normalized.includes('SUPPORT')) return KPA_ROLE_MATRIX.SUPPORT_EXECUTIVE;
  if (normalized.includes('HR')) return KPA_ROLE_MATRIX.HR_EXECUTIVE;

  return [
    { product: 'Loan Disbursement', targetType: 'AMOUNT', defaultTarget: 0 },
    { product: 'Deposit Collection', targetType: 'AMOUNT', defaultTarget: 0 }
  ];
};

export default {
  KPA_ROLE_MATRIX,
  ALL_KPA_PRODUCTS,
  deriveKpaGoals,
  getRecommendedProductsForRole,
};
