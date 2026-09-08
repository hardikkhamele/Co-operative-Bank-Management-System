/**
 * KPA (Key Performance Area) Constants, Role Configuration Matrix & Goal Derivation Utilities
 */

export const ALL_KPA_PRODUCTS = [
  { name: 'Credit Receipts', key: 'creditReceipts', defaultType: 'AMOUNT' },
  { name: 'Debit Receipts', key: 'debitReceipts', defaultType: 'AMOUNT' },
  { name: 'Cash Submissions', key: 'cashSubmissions', defaultType: 'AMOUNT' },
  { name: 'Loans Disbursed', key: 'loansDisbursed', defaultType: 'AMOUNT' },
  { name: 'Leads Generated', key: 'leadsGenerated', defaultType: 'COUNT' },
  { name: 'Manual Entries', key: 'manualEntries', defaultType: 'AMOUNT' }
];

export const KPA_ROLE_MATRIX = {
  LOAN_EXECUTIVE: [
    { product: 'Loans Disbursed', targetType: 'AMOUNT', defaultTarget: 0 },
    { product: 'Leads Generated', targetType: 'COUNT', defaultTarget: 0 }
  ],
  COLLECTION_EXECUTIVE: [
    { product: 'Credit Receipts', targetType: 'AMOUNT', defaultTarget: 0 },
    { product: 'Cash Submissions', targetType: 'AMOUNT', defaultTarget: 0 }
  ],
  BRANCH_MANAGER: [
    { product: 'Credit Receipts', targetType: 'AMOUNT', defaultTarget: 0 },
    { product: 'Debit Receipts', targetType: 'AMOUNT', defaultTarget: 0 },
    { product: 'Loans Disbursed', targetType: 'AMOUNT', defaultTarget: 0 },
    { product: 'Cash Submissions', targetType: 'AMOUNT', defaultTarget: 0 },
    { product: 'Leads Generated', targetType: 'COUNT', defaultTarget: 0 }
  ],
  MANAGER: [
    { product: 'Credit Receipts', targetType: 'AMOUNT', defaultTarget: 0 },
    { product: 'Debit Receipts', targetType: 'AMOUNT', defaultTarget: 0 },
    { product: 'Loans Disbursed', targetType: 'AMOUNT', defaultTarget: 0 },
    { product: 'Cash Submissions', targetType: 'AMOUNT', defaultTarget: 0 },
    { product: 'Leads Generated', targetType: 'COUNT', defaultTarget: 0 }
  ],
  RECEIPT_MANAGEMENT_EXECUTIVE: [
    { product: 'Credit Receipts', targetType: 'AMOUNT', defaultTarget: 0 },
    { product: 'Debit Receipts', targetType: 'AMOUNT', defaultTarget: 0 }
  ],
  ACCOUNTANT: [
    { product: 'Credit Receipts', targetType: 'AMOUNT', defaultTarget: 0 },
    { product: 'Debit Receipts', targetType: 'AMOUNT', defaultTarget: 0 },
    { product: 'Manual Entries', targetType: 'AMOUNT', defaultTarget: 0 }
  ],
  SUPPORT_EXECUTIVE: [
    { product: 'Leads Generated', targetType: 'COUNT', defaultTarget: 0 }
  ],
  HR_EXECUTIVE: [
    { product: 'Manual Entries', targetType: 'AMOUNT', defaultTarget: 0 }
  ],
  HR: [
    { product: 'Manual Entries', targetType: 'AMOUNT', defaultTarget: 0 }
  ]
};

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
