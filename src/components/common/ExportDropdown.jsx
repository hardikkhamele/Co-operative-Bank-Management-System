import React, { useState, useRef, useEffect } from 'react';
import { Upload, ChevronDown, Table, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/exportUtils';


/**
 * Standardized 3-Option Export Dropdown Component
 * Features:
 * - Export to CSV (Table icon, gray)
 * - Export to Excel (FileSpreadsheet icon, emerald-600)
 * - Export to Word (FileText icon, blue-600)
 *
 * Supports custom callbacks (onExportCSV, onExportExcel, onExportWord)
 * or automatic client extraction via tableRef or data + columns.
 */
export default function ExportDropdown({
  title = 'Report',
  filename = 'export',
  tableRef,
  data,
  columns,
  className = '',
  buttonText = 'Export',
  disabled = false,
  onExportCSV,
  onExportExcel,
  onExportWord,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(null);
  const dropdownRef = useRef(null);

  // Auto-close on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleExport = async (format) => {
    setIsOpen(false);
    setExporting(format);

    try {
      if (format === 'csv') {
        if (typeof onExportCSV === 'function') {
          await onExportCSV();
        } else {
          exportToCSV({ title, filename, data, columns, tableElement: tableRef?.current });
          toast.success('CSV exported successfully');
        }
      } else if (format === 'excel') {
        if (typeof onExportExcel === 'function') {
          await onExportExcel();
        } else {
          exportToExcel({ title, filename, data, columns, tableElement: tableRef?.current });
          toast.success('Excel exported successfully');
        }
      } else if (format === 'pdf') {
        if (typeof onExportPDF === 'function') {
          await onExportPDF();
        } else {
          exportToPDF({ title, filename, data, columns, tableElement: tableRef?.current });
          toast.success('PDF print window opened successfully');
        }
      }
    } catch (err) {
      console.error('Export error:', err);
      toast.error(err.message || `Failed to export ${format.toUpperCase()}`);
    } finally {
      setTimeout(() => setExporting(null), 300);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || Boolean(exporting)}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold transition-all text-xs border bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {exporting ? (
          <Loader2 size={15} className="animate-spin text-slate-500" />
        ) : (
          <Upload size={15} className="text-slate-600 stroke-[2.2]" />
        )}
        <span className="text-slate-800 font-medium text-[13px]">{exporting ? `Exporting...` : buttonText}</span>
        <ChevronDown
          size={14}
          className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu matching exact screenshot */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={() => handleExport('csv')}
            className="w-full px-4 py-2 text-left text-xs text-slate-800 hover:bg-slate-50 flex items-center gap-3 font-semibold cursor-pointer transition-colors"
          >
            <Table size={16} className="text-emerald-600 shrink-0 stroke-[2]" />
            <span>Export to CSV</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport('excel')}
            className="w-full px-4 py-2 text-left text-xs text-slate-800 hover:bg-slate-50 flex items-center gap-3 font-semibold cursor-pointer transition-colors"
          >
            <FileSpreadsheet size={16} className="text-emerald-600 shrink-0 stroke-[2]" />
            <span>Export to Excel</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            className="w-full px-4 py-2 text-left text-xs text-slate-800 hover:bg-slate-50 flex items-center gap-3 font-semibold cursor-pointer transition-colors"
          >
            <FileText size={16} className="text-rose-600 shrink-0 stroke-[2]" />
            <span>Export to PDF</span>
          </button>
        </div>
      )}
    </div>
  );


}
