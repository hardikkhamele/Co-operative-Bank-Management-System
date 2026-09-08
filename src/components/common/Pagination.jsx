import React from 'react';

/**
 * Reusable Global Pagination Component
 * 
 * Layout:
 * [Showing X-Y of Z / optional rows-selector]  ------  [<<] [<] (1)(2)(3) [>][>>]
 * Right-aligned circle page numbers with 3 visible numbers and clear navigation buttons.
 */
const Pagination = ({
  page = 1,
  currentPage,
  totalPages = 1,
  totalRecords,
  total,
  limit = 10,
  pageSize,
  onPageChange,
  setPage,
  onLimitChange,
  setLimit,
  pageSizeOptions = [10, 25, 50, 100],
  showingText,
  disabled = false,
  className = '',
}) => {
  const activePage = Number(currentPage ?? page ?? 1);
  const totalPgs = Math.max(Number(totalPages || 1), 1);
  const activeLimit = Number(pageSize ?? limit ?? 10);
  const recordsTotal = totalRecords ?? total;

  const handlePageChange = (newPage) => {
    if (disabled) return;
    if (newPage < 1 || newPage > totalPgs) return;
    if (onPageChange) onPageChange(newPage);
    else if (setPage) setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    if (disabled) return;
    if (onLimitChange) onLimitChange(newLimit);
    else if (setLimit) setLimit(newLimit);
    handlePageChange(1);
  };

  // Compute showing text
  let renderedShowingText = showingText;
  if (!renderedShowingText && typeof recordsTotal === 'number') {
    const start = recordsTotal > 0 ? (activePage - 1) * activeLimit + 1 : 0;
    const end = Math.min(activePage * activeLimit, recordsTotal);
    renderedShowingText = `Showing ${start}–${end} of ${recordsTotal}`;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/50 gap-3 ${className}`}>
      {renderedShowingText && (
        <p className="text-xs text-gray-400 font-medium mr-auto">
          {renderedShowingText}
        </p>
      )}

      {(onLimitChange || setLimit) && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 mr-1">Rows:</span>
          <select
            value={activeLimit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            disabled={disabled}
            className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 focus:ring-[#225091] focus:border-[#225091] cursor-pointer bg-white"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
        {/* First Page << */}
        <button
          type="button"
          disabled={activePage <= 1 || disabled}
          onClick={() => handlePageChange(1)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer text-gray-700"
          title="First Page"
        >
          «
        </button>

        {/* Previous Page < */}
        <button
          type="button"
          disabled={activePage <= 1 || disabled}
          onClick={() => handlePageChange(Math.max(1, activePage - 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer text-gray-700"
          title="Previous Page"
        >
          ‹
        </button>

        {/* Page Number Circles — always show 3 */}
        {(() => {
          const maxVisible = 3;
          let start = Math.max(1, activePage - Math.floor(maxVisible / 2));
          let end = start + maxVisible - 1;
          if (end > totalPgs) {
            end = totalPgs;
            start = Math.max(1, end - maxVisible + 1);
          }
          const pages = [];
          for (let i = start; i <= end; i++) pages.push(i);
          while (pages.length < maxVisible) pages.push(pages[pages.length - 1] + 1);

          return pages.map((p) => {
            const isCurrent = activePage === p;
            const isOutOfRange = p > totalPgs;

            return (
              <button
                key={p}
                type="button"
                disabled={isOutOfRange || disabled}
                onClick={() => {
                  if (!isOutOfRange) handlePageChange(p);
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#225091] text-white shadow-md'
                    : isOutOfRange
                      ? 'border border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            );
          });
        })()}

        {/* Next Page > */}
        <button
          type="button"
          disabled={activePage >= totalPgs || disabled}
          onClick={() => handlePageChange(activePage + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer text-gray-700"
          title="Next Page"
        >
          ›
        </button>

        {/* Last Page >> */}
        <button
          type="button"
          disabled={activePage >= totalPgs || disabled}
          onClick={() => handlePageChange(totalPgs)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer text-gray-700"
          title="Last Page"
        >
          »
        </button>
      </div>
    </div>
  );
};

export default Pagination;
