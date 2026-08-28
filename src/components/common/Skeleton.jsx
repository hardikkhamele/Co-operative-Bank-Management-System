import React from 'react';

/**
 * Base Skeleton block with smooth hardware-accelerated wave shimmer.
 */
export const Skeleton = ({ className = '', shimmer = true, style = {}, ...props }) => {
  return (
    <div
      aria-hidden="true"
      className={`${
        shimmer ? 'animate-shimmer' : 'animate-pulse bg-slate-200/80'
      } rounded-md ${className}`}
      style={style}
      {...props}
    />
  );
};

/**
 * Text Skeleton for simulated typography paragraphs and headings.
 */
export const SkeletonText = ({ lines = 2, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`} role="status" aria-busy="true">
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          className={`h-3.5 ${
            idx === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full'
          } rounded-md`}
        />
      ))}
    </div>
  );
};

/**
 * Avatar Skeleton for employee/user thumbnails.
 */
export const SkeletonAvatar = ({ size = 'w-10 h-10', rounded = 'rounded-xl', className = '' }) => {
  return <Skeleton className={`${size} ${rounded} ${className} shrink-0`} />;
};

/**
 * Badge / Pill Skeleton.
 */
export const SkeletonBadge = ({ size = 'w-16 h-6', rounded = 'rounded-full', className = '' }) => {
  return <Skeleton className={`${size} ${rounded} ${className} shrink-0`} />;
};

/**
 * Button Skeleton.
 */
export const SkeletonButton = ({ size = 'w-28 h-10', rounded = 'rounded-xl', className = '' }) => {
  return <Skeleton className={`${size} ${rounded} ${className} shrink-0`} />;
};

/**
 * Stat Cards Skeleton grid for dashboard & module overviews.
 */
export const SkeletonStatCards = ({ count = 4, className = '' }) => {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`} role="status" aria-busy="true">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-16 h-5 rounded-full" />
          </div>
          <div className="space-y-1.5 pt-1">
            <Skeleton className="w-20 h-7 rounded-lg" />
            <Skeleton className="w-28 h-3.5 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Top KPI Cards Skeleton for Dashboard (6 cards).
 */
export const SkeletonDashboardKpi = ({ count = 6, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`} role="status" aria-busy="true">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-gray-100 rounded-xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] flex flex-col justify-between h-[130px]"
        >
          <div className="flex justify-between items-start">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="w-9 h-9 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-7 w-28 rounded-lg" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-12 rounded-md" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Table Skeleton Row for inline table body embedding.
 */
export const SkeletonTableRow = ({ cols = 8, className = '' }) => {
  return (
    <tr className={`hover:bg-slate-50/50 transition-colors ${className}`}>
      {Array.from({ length: cols }).map((_, colIdx) => (
        <td key={colIdx} className="py-4 px-5">
          {colIdx === 0 ? (
            <Skeleton className="h-4 w-6 rounded" />
          ) : colIdx === 1 ? (
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-28 rounded" />
                <Skeleton className="h-2.5 w-16 rounded" />
              </div>
            </div>
          ) : colIdx === cols - 1 ? (
            <div className="flex items-center justify-center gap-2">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
          ) : colIdx === cols - 2 ? (
            <Skeleton className="h-6 w-20 rounded-full mx-auto" />
          ) : (
            <Skeleton className={`h-4 ${colIdx % 2 === 0 ? 'w-24' : 'w-16'} rounded`} />
          )}
        </td>
      ))}
    </tr>
  );
};

/**
 * Standalone Table Skeleton matching enterprise data tables.
 */
export const SkeletonTable = ({ rows = 6, cols = 6, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden ${className}`} role="status" aria-busy="true">
      {/* Table Header Placeholder */}
      <div className="bg-gray-50/80 px-6 py-3.5 border-b border-gray-100 flex items-center justify-between gap-4">
        {Array.from({ length: cols }).map((_, idx) => (
          <Skeleton
            key={idx}
            className={`h-4 ${
              idx === 0 ? 'w-16' : idx === 1 ? 'w-36' : idx === cols - 1 ? 'w-20' : 'w-24'
            } rounded`}
          />
        ))}
      </div>

      {/* Table Body Placeholder Rows */}
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="px-6 py-4 flex items-center justify-between gap-4"
          >
            {/* Col 1: Reference / ID */}
            <div className="w-20 shrink-0">
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-2.5 w-8 mt-1.5 rounded" />
            </div>

            {/* Col 2: Name / Avatar */}
            <div className="flex items-center gap-3 w-48 shrink-0">
              <SkeletonAvatar size="w-9 h-9" rounded="rounded-xl" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-24 rounded" />
                <Skeleton className="h-2.5 w-32 rounded" />
              </div>
            </div>

            {/* Col 3: Branch / Dept */}
            <div className="w-28 hidden sm:block shrink-0">
              <Skeleton className="h-3.5 w-20 rounded" />
              <Skeleton className="h-2.5 w-16 mt-1 rounded" />
            </div>

            {/* Col 4: Badge / Status */}
            <div className="w-24 shrink-0">
              <SkeletonBadge size="h-6 w-20" />
            </div>

            {/* Col 5: Date / Metric */}
            <div className="w-24 hidden md:block shrink-0">
              <Skeleton className="h-3.5 w-18 rounded" />
            </div>

            {/* Col 6: Actions */}
            <div className="flex items-center gap-2 w-24 justify-end shrink-0">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Chart Skeleton for bar, line, and pie chart simulation.
 */
export const SkeletonChart = ({ type = 'line', height = 'h-[280px]', className = '' }) => {
  return (
    <div className={`w-full ${height} flex flex-col justify-end p-4 bg-slate-50/50 rounded-xl space-y-4 ${className}`} role="status" aria-busy="true">
      {type === 'pie' ? (
        <div className="flex items-center justify-center gap-6 h-full">
          <Skeleton className="w-36 h-36 rounded-full shrink-0" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
        </div>
      ) : type === 'bar' ? (
        <div className="flex items-end justify-between gap-3 h-full pt-6">
          {[40, 75, 55, 90, 60, 80, 45].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <Skeleton className="w-full rounded-t-md" style={{ height: `${h}%` }} />
              <Skeleton className="w-8 h-3 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6 h-full flex flex-col justify-between pt-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
          <div className="flex-1 border-b border-dashed border-slate-200 relative flex items-center">
            <Skeleton className="w-full h-12 rounded-lg opacity-60" />
          </div>
          <div className="flex justify-between items-center pt-1">
            {['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'].map((m, i) => (
              <Skeleton key={i} className="h-3 w-8 rounded" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Dedicated Bank Voucher & Receipt Skeleton for ViewTransferReceipt, ViewDebitReceipt, ViewCreditReceipt, ViewContraReceipt, ViewCashPayment.
 */
export const SkeletonReceiptView = ({ title = 'Loading Receipt Details...', className = '' }) => {
  return (
    <div className={`w-full max-w-none space-y-6 ${className}`} role="status" aria-busy="true">
      {/* Top Header Card Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Main Voucher Container */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        {/* Voucher Header Bar */}
        <div className="p-6 sm:p-8 bg-slate-50/70 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-3.5 w-28 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-32 rounded-lg" />
          </div>
        </div>

        {/* Voucher Content Details */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Key Amount & Main Identifiers Card */}
          <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-100/70 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24 rounded text-blue-400" />
              <Skeleton className="h-9 w-44 rounded-xl" />
              <Skeleton className="h-3.5 w-64 rounded-md" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 w-full sm:w-auto">
              <div className="p-3.5 bg-white rounded-xl border border-gray-100 space-y-1.5">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-gray-100 space-y-1.5">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
            </div>
          </div>

          {/* 3-Column Financial Field Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-100 bg-slate-50/40 space-y-2">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-4.5 w-36 rounded-md" />
              </div>
            ))}
          </div>

          {/* Denominations or Item Table Breakdown */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden pt-1">
            <div className="bg-slate-100/70 px-6 py-3 border-b border-gray-200 flex justify-between">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
            <div className="p-6 divide-y divide-gray-100 space-y-3">
              {Array.from({ length: 3 }).map((_, r) => (
                <div key={r} className="flex items-center justify-between pt-2">
                  <Skeleton className="h-3.5 w-36 rounded" />
                  <Skeleton className="h-3.5 w-20 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Signatures & Authorizations Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-dashed border-gray-200">
            {['Customer / Depositor', 'Approved / Rejected By', 'Cashier / Received By'].map((label, idx) => (
              <div key={idx} className="space-y-3">
                <Skeleton className="h-0.5 w-full rounded" />
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                <Skeleton className="h-4 w-32 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-6 bg-slate-50 border-t border-gray-200 flex justify-end gap-3">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

/**
 * Profile & Employee Details Card Skeleton.
 */
export const SkeletonEmployeeProfile = ({ className = '' }) => {
  return (
    <div className={`bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5 ${className}`} role="status" aria-busy="true">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
        <Skeleton className="h-3 w-32 rounded" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SkeletonAvatar size="w-12 h-12" rounded="rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/70">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

/**
 * Detail View Skeleton for view pages (View Merchant, View Employee, View Lead, View Manager, etc.).
 */
export const SkeletonDetailView = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`} role="status" aria-busy="true">
      {/* Header Card Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-3.5 w-72 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sm:p-8 space-y-8">
        {/* Section 1: General Info */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <SkeletonAvatar size="w-12 h-12" rounded="rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
            </div>
            <SkeletonBadge size="h-6 w-20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-4 w-40 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Address / Extra Details */}
        <div className="space-y-4 pt-2">
          <Skeleton className="h-4 w-28 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-4 w-36 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Documents / Attachments */}
        <div className="space-y-3 pt-2">
          <Skeleton className="h-4 w-32 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-28 rounded" />
                    <Skeleton className="h-2.5 w-16 rounded" />
                  </div>
                </div>
                <Skeleton className="w-7 h-7 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Form Skeleton for create/edit pages with input fields, select boxes, upload zones, and action buttons.
 */
export const SkeletonForm = ({ sections = 2, className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`} role="status" aria-busy="true">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-3.5 w-64 rounded-md" />
        </div>
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>

      {/* Form Content Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sm:p-8 space-y-8">
        {Array.from({ length: sections }).map((_, sIdx) => (
          <div key={sIdx} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Skeleton className="w-5 h-5 rounded-md" />
              <Skeleton className="h-4 w-36 rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 4 }).map((_, fIdx) => (
                <div key={fIdx} className="space-y-1.5">
                  <Skeleton className="h-3.5 w-24 rounded" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Upload Zone Placeholders */}
        <div className="space-y-3 pt-2">
          <Skeleton className="h-4 w-32 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, uIdx) => (
              <div key={uIdx} className="space-y-1.5">
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-3 pt-6 border-t border-gray-100">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonBadge,
  SkeletonButton,
  SkeletonStatCards,
  SkeletonDashboardKpi,
  SkeletonTableRow,
  SkeletonTable,
  SkeletonChart,
  SkeletonReceiptView,
  SkeletonEmployeeProfile,
  SkeletonDetailView,
  SkeletonForm,
};
