import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileText, Sheet, FileSpreadsheet, Printer, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { exportToCSV, exportToExcel, exportToPDF, exportToPrint } from '../../utils/exportUtils';

/**
 * Universal Multi-Format Export Dropdown Component
 * Provides: PDF, Excel, CSV, Print
 *
 * @param {Object} props
 * @param {string} [props.title] - Report / Table Title (e.g. "Daily Work Report")
 * @param {string} [props.filename] - Base filename for downloaded file
 * @param {React.RefObject} [props.tableRef] - Ref to <table> element
 * @param {Array} [props.data] - Array of data objects (optional alternative to tableRef)
 * @param {Array} [props.columns] - Array of column definitions (optional alternative to tableRef)
 * @param {string} [props.className] - Additional wrapper classes
 * @param {string} [props.buttonText] - Text label (default "Export")
 */
export default function ExportDropdown({
  title = 'Report',
  filename = 'report',
  tableRef,
  data,
  columns,
  className = '',
  buttonText = 'Export'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(null);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format) => {
    setIsOpen(false);
    setExporting(format);

    try {
      const exportPayload = {
        title,
        filename,
        data,
        columns,
        tableElement: tableRef?.current
      };

      if (format === 'csv') {
        exportToCSV(exportPayload);
        toast.success('CSV downloaded successfully');
      } else if (format === 'excel') {
        exportToExcel(exportPayload);
        toast.success('Excel file downloaded successfully');
      } else if (format === 'pdf') {
        exportToPDF(exportPayload);
      } else if (format === 'print') {
        exportToPrint(exportPayload);
      }
    } catch (err) {
      console.error('Export error:', err);
      toast.error(err.message || 'Failed to export table data');
    } finally {
      setTimeout(() => setExporting(null), 500);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={Boolean(exporting)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-[#225091]/5 hover:border-[#225091]/40 text-gray-700 hover:text-[#225091] text-xs font-semibold shadow-2xs transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#225091]/20 active:scale-95 disabled:opacity-50"
        title="Export options: PDF, Excel, CSV, Print"
      >
        {exporting ? (
          <Loader2 size={15} className="animate-spin text-[#225091]" />
        ) : (
          <Download size={15} className="text-[#225091] shrink-0" />
        )}
        <span>{exporting ? `Exporting ${exporting.toUpperCase()}...` : buttonText}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#225091]' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-white shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Available Export Formats
          </div>

          <button
            type="button"
            onClick={() => handleExport('pdf')}
            className="w-full text-left px-3.5 py-2.5 text-xs text-gray-700 hover:bg-[#225091]/5 hover:text-[#225091] flex items-center gap-2.5 transition-colors cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-100">
              <FileText size={14} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 group-hover:text-[#225091]">PDF Document</span>
              <span className="text-[10px] text-gray-400">Formatted printable PDF</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleExport('excel')}
            className="w-full text-left px-3.5 py-2.5 text-xs text-gray-700 hover:bg-[#225091]/5 hover:text-[#225091] flex items-center gap-2.5 transition-colors cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100">
              <Sheet size={14} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 group-hover:text-[#225091]">Excel Spreadsheet</span>
              <span className="text-[10px] text-gray-400">.xls / .xlsx workbook</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleExport('csv')}
            className="w-full text-left px-3.5 py-2.5 text-xs text-gray-700 hover:bg-[#225091]/5 hover:text-[#225091] flex items-center gap-2.5 transition-colors cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#225091] flex items-center justify-center shrink-0 group-hover:bg-blue-100">
              <FileSpreadsheet size={14} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 group-hover:text-[#225091]">CSV File</span>
              <span className="text-[10px] text-gray-400">Comma-separated values</span>
            </div>
          </button>

          <div className="my-1 border-t border-gray-100" />

          <button
            type="button"
            onClick={() => handleExport('print')}
            className="w-full text-left px-3.5 py-2.5 text-xs text-gray-700 hover:bg-[#225091]/5 hover:text-[#225091] flex items-center gap-2.5 transition-colors cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-100">
              <Printer size={14} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 group-hover:text-[#225091]">Print Table</span>
              <span className="text-[10px] text-gray-400">Direct print layout</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
