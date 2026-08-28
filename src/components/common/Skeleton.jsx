import React from 'react';

/**
 * Base Skeleton block with smooth pulsating animation and premium slate/gray styling.
 */
export const Skeleton = ({ className = '', style = {} }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 rounded-md ${className}`}
      style={style}
    />
  );
};

/**
 * Text Skeleton for simulated typography paragraphs and headings.
 */
export const SkeletonText = ({ lines = 2, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
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
 * Stat Cards Skeleton grid for dashboard & module overviews.
 */
export const SkeletonStatCards = ({ count = 4, className = '' }) => {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
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
 * Table Skeleton matching enterprise data tables with simulated headers, rows, badges, and action buttons.
 */
export const SkeletonTable = ({ rows = 5, cols = 6, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden ${className}`}>
      {/* Table Header Placeholder */}
      <div className="bg-gray-50/80 px-6 py-3.5 border-b border-gray-100 flex items-center justify-between">
        {Array.from({ length: cols }).map((_, idx) => (
          <Skeleton
            key={idx}
            className={`h-4 ${
              idx === 0 ? 'w-24' : idx === 1 ? 'w-32' : 'w-20'
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
            <div className="w-28 shrink-0">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-2.5 w-14 mt-1.5 rounded" />
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
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            {/* Col 5: Date / Metric */}
            <div className="w-24 hidden md:block shrink-0">
              <Skeleton className="h-3.5 w-18 rounded" />
            </div>

            {/* Col 6: Actions */}
            <div className="flex items-center gap-2 w-28 justify-end shrink-0">
              <Skeleton className="h-7 w-12 rounded-lg" />
              <Skeleton className="h-7 w-12 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Profile & Employee Details Card Skeleton.
 */
export const SkeletonEmployeeProfile = ({ className = '' }) => {
  return (
    <div className={`bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5 ${className}`}>
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
 * Chart Skeleton for bar, line, and pie chart simulation.
 */
export const SkeletonChart = ({ type = 'line', height = 'h-[280px]', className = '' }) => {
  return (
    <div className={`w-full ${height} flex flex-col justify-end p-4 bg-slate-50/50 rounded-xl space-y-4 ${className}`}>
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
 * Top KPI Cards Skeleton for Dashboard (6 cards).
 */
export const SkeletonDashboardKpi = ({ count = 6, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
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
 * Form Skeleton for create/edit pages with input fields, select boxes, upload zones, and action buttons.
 */
export const SkeletonForm = ({ sections = 2, className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
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

/**
 * Detail View Skeleton for view pages (View Merchant, View Employee, etc.).
 */
export const SkeletonDetailView = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Card Skeleton */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-3.5 w-72 rounded-md" />
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
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-20 rounded text-gray-400" />
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

export default {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonStatCards,
  SkeletonTable,
  SkeletonEmployeeProfile,
  SkeletonChart,
  SkeletonDashboardKpi,
  SkeletonForm,
  SkeletonDetailView,
};
