import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Download, RefreshCw, Filter, Search, 
  FileSpreadsheet, RotateCcw, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import ExportDropdown from '../../components/common/ExportDropdown';
import { reportService } from '../../api/reportService';
import useBranchStore from '../../store/branchStore';
import usePermission from '../../hooks/usePermission';

// Helper to format ISO date into user-friendly Indian format (DD Mon YYYY)
const formatDate = (isoString) => {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return String(isoString);
  }
};

// Helper to format currency
const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(val));
};

// Format key labels to Title Case (e.g. totalSocietyCredit -> Total Society Credit)
const formatKeyToLabel = (key) => {
  return key
    .replace(/^formatted/, '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const getStatusBadge = (status) => {
  if (!status) return <span className="text-gray-400">—</span>;
  const s = String(status).toUpperCase();

  switch (s) {
    case 'APPROVED':
    case 'ACTIVE':
    case 'PRESENT':
    case 'LOW RISK':
    case 'SUCCESS':
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {s}
        </span>
      );
    case 'PENDING':
    case 'NEW':
    case 'MEDIUM RISK':
    case 'IN PROGRESS':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          {s}
        </span>
      );
    case 'REJECTED':
    case 'BLOCKED':
    case 'ABSENT':
    case 'HIGH RISK':
    case 'FAILED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          {s}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
          {s}
        </span>
      );
  }
};

const ReportViewer = () => {
  const { reportType } = useParams();
  const { hasPermission } = usePermission();
  const canExport = hasPermission('report.export');

  // Branch Store
  const { globalBranchId, branchOptions, fetchBranches } = useBranchStore();

  // Date Defaults: 1st of current month to today
  const defaultDates = useMemo(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const formatDateInput = (d) => d.toISOString().split('T')[0];
    return {
      startDate: formatDateInput(firstDay),
      endDate: formatDateInput(now)
    };
  }, []);

  // Filter States
  const [startDate, setStartDate] = useState(defaultDates.startDate);
  const [endDate, setEndDate] = useState(defaultDates.endDate);
  const [selectedBranchId, setSelectedBranchId] = useState(globalBranchId || '');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Data States
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [exportLoading, setExportLoading] = useState(null); // 'csv' | 'pdf' | null
  const reportTableRef = useRef(null);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Sync with global branch if changed externally and none selected locally
  useEffect(() => {
    if (globalBranchId && !selectedBranchId) {
      setSelectedBranchId(globalBranchId);
    }
  }, [globalBranchId, selectedBranchId]);

  const loadReport = useCallback(async () => {
    if (!reportType) return;
    setIsLoading(true);

    try {
      const params = {
        startDate,
        endDate,
        dateFrom: startDate,
        dateTo: endDate,
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (selectedBranchId && selectedBranchId !== 'ALL') {
        params.branchId = selectedBranchId;
      }
      if (status && status !== 'ALL') {
        params.status = status;
      }
      if (search.trim()) {
        params.search = search.trim();
      }

      const res = await reportService.getReportData(reportType, params);
      if (res && (res.success || res.data)) {
        setReportData(res.data || res);
      } else {
        toast.error(res?.message || 'Failed to generate report.');
      }
    } catch (err) {
      console.error('Failed to load report data:', err);
      toast.error(err.response?.data?.message || 'Error generating report.');
    } finally {
      setIsLoading(false);
    }
  }, [reportType, startDate, endDate, selectedBranchId, status, search, page, limit]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleExport = async (format) => {
    if (!canExport) {
      toast.error('You do not have permission to export reports.');
      return;
    }

    setExportLoading(format);
    try {
      const params = {
        format,
        startDate,
        endDate,
        dateFrom: startDate,
        dateTo: endDate,
      };
      if (selectedBranchId && selectedBranchId !== 'ALL') {
        params.branchId = selectedBranchId;
      }
      if (status && status !== 'ALL') {
        params.status = status;
      }
      if (search.trim()) {
        params.search = search.trim();
      }

      await reportService.exportReport(reportType, params);
      toast.success(`${format.toUpperCase()} report exported successfully!`);
    } catch (err) {
      console.error('Export error:', err);
      toast.error(err.response?.data?.message || `Failed to export ${format.toUpperCase()} report.`);
    } finally {
      setExportLoading(null);
    }
  };

  const handleResetFilters = () => {
    setStartDate(defaultDates.startDate);
    setEndDate(defaultDates.endDate);
    setSelectedBranchId(globalBranchId || '');
    setStatus('');
    setSearch('');
    setPage(1);
  };

  // Safe destructure
  const meta = reportData?.meta || {};
  const items = Array.isArray(reportData?.items) ? reportData.items : [];
  const pagination = reportData?.pagination || {
    totalRecords: items.length,
    page: 1,
    limit: 10,
    totalPages: 1
  };

  const reportTitle = meta.reportTitle || reportType.replace(/_/g, ' ') + ' Report';
  const reportCode = meta.reportCode || '';

  // Generate dynamic KPI list from kpiSummary object
  const kpiCards = useMemo(() => {
    const summary = reportData?.kpiSummary;
    if (!summary || Object.keys(summary).length === 0) return [];

    const rawKeys = Object.keys(summary).filter(
      (k) => !k.startsWith('formatted') && typeof summary[k] !== 'object'
    );

    return rawKeys.map((key) => {
      const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
      const possibleFormattedKeys = [
        `formatted${capitalized}`,
        `formatted${key.replace(/society/i, '')}`,
        `formatted${capitalized.replace(/Society/, '')}`,
        `formatted${key.replace(/^total/, '')}`,
        `formatted${key.replace(/^net/, '')}`
      ];

      let formattedValue = null;
      for (const fk of possibleFormattedKeys) {
        if (summary[fk]) {
          formattedValue = summary[fk];
          break;
        }
      }

      const rawValue = summary[key];
      const isAmount =
        key.toLowerCase().includes('amount') ||
        key.toLowerCase().includes('balance') ||
        key.toLowerCase().includes('credit') ||
        key.toLowerCase().includes('debit') ||
        key.toLowerCase().includes('flow');

      let displayValue = formattedValue;
      if (!displayValue) {
        if (isAmount && typeof rawValue === 'number') {
          displayValue = formatCurrency(rawValue);
        } else if (typeof rawValue === 'number') {
          displayValue = rawValue.toLocaleString('en-IN');
        } else {
          displayValue = rawValue ?? '0';
        }
      }

      let valueColor = 'text-gray-900';
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('credit')) {
        valueColor = 'text-emerald-700';
      } else if (lowerKey.includes('debit') || lowerKey.includes('rejected')) {
        valueColor = 'text-rose-600';
      } else if (lowerKey.includes('net') || lowerKey.includes('balance')) {
        valueColor = 'text-[#225091]';
      }

      return {
        key,
        label: formatKeyToLabel(key),
        value: displayValue,
        valueColor
      };
    });
  }, [reportData?.kpiSummary]);

  // Render Table content dynamically based on Report Type
  const renderTableContent = () => {
    if (isLoading) {
      return (
        <tbody className="divide-y divide-gray-100 text-xs">
          {Array.from({ length: 5 }).map((_, rIdx) => (
            <tr key={rIdx} className="animate-pulse">
              <td className="py-4 px-4"><div className="h-3.5 w-6 bg-gray-200 rounded"></div></td>
              <td className="py-4 px-4"><div className="h-3.5 w-24 bg-gray-200 rounded"></div></td>
              <td className="py-4 px-4"><div className="h-3.5 w-32 bg-gray-200 rounded"></div></td>
              <td className="py-4 px-4"><div className="h-3.5 w-28 bg-gray-200 rounded"></div></td>
              <td className="py-4 px-4"><div className="h-3.5 w-24 bg-gray-200 rounded"></div></td>
              <td className="py-4 px-4"><div className="h-3.5 w-24 bg-gray-200 rounded"></div></td>
              <td className="py-4 px-4"><div className="h-3.5 w-24 bg-gray-200 rounded"></div></td>
              <td className="py-4 px-4"><div className="h-3.5 w-16 bg-gray-200 rounded"></div></td>
            </tr>
          ))}
        </tbody>
      );
    }

    if (items.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={10} className="py-14 text-center text-gray-500">
              <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                  <FileSpreadsheet size={24} />
                </div>
                <p className="text-sm font-bold text-gray-800">No report records found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Try adjusting the date range or clearing your search filters above.
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    // 1. BRANCH_FINANCIAL_SUMMARY (Exact mapping from API JSON)
    if (reportType === 'BRANCH_FINANCIAL_SUMMARY') {
      return (
        <tbody className="divide-y divide-gray-100 text-xs">
          {items.map((row, idx) => {
            const srNo = (pagination.page - 1) * pagination.limit + idx + 1;
            const netCashNum = Number(row.netCashFlow || 0);
            const isNetPositive = netCashNum >= 0;

            return (
              <tr key={row.branchId || idx} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 text-gray-500 font-medium">{row.srNo || srNo}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-[#225091] border border-blue-100 font-mono font-bold text-xs">
                    {row.code || '—'}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-bold text-gray-900 text-[13px]">{row.name || '—'}</td>
                <td className="py-3.5 px-4 text-gray-600">
                  {row.city || row.state ? `${row.city || ''}${row.city && row.state ? ', ' : ''}${row.state || ''}` : '—'}
                </td>
                <td className="py-3.5 px-4 font-semibold text-emerald-700 font-mono text-right">
                  {row.formattedCreditAmount || formatCurrency(row.creditAmount)}
                </td>
                <td className="py-3.5 px-4 font-semibold text-rose-600 font-mono text-right">
                  {row.formattedDebitAmount || formatCurrency(row.debitAmount)}
                </td>
                <td className={`py-3.5 px-4 font-bold font-mono text-right ${isNetPositive ? 'text-gray-900' : 'text-rose-600'}`}>
                  {row.formattedNetCashFlow || formatCurrency(row.netCashFlow)}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
                    {row.voucherCount ?? 0}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      );
    }

    // 2. CREDIT_RECEIPTS & DEBIT_RECEIPTS
    if (reportType === 'CREDIT_RECEIPTS' || reportType === 'DEBIT_RECEIPTS') {
      return (
        <tbody className="divide-y divide-gray-100 text-xs">
          {items.map((row, idx) => {
            const srNo = (pagination.page - 1) * pagination.limit + idx + 1;
            return (
              <tr key={row.id || idx} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 text-gray-500 font-medium">{row.srNo || srNo}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-gray-800">{row.receiptNo || row.id || '—'}</td>
                <td className="py-3.5 px-4 text-gray-600">{formatDate(row.date || row.createdAt)}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900">{row.name || row.customerName || '—'}</td>
                <td className="py-3.5 px-4 font-mono text-gray-600">{row.accountNumber || '—'}</td>
                <td className="py-3.5 px-4 text-gray-700">
                  <div className="font-semibold">{row.glHeadName || '—'}</div>
                  {row.glCode && <span className="text-[10px] text-gray-400 font-mono">{row.glCode}</span>}
                </td>
                <td className="py-3.5 px-4 text-gray-600">{row.branchName || row.branchCode || '—'}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900 font-mono text-right">
                  {row.formattedAmount || formatCurrency(row.amount)}
                </td>
                <td className="py-3.5 px-4 text-center">{getStatusBadge(row.status)}</td>
                <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                  {row.approvedBy ? `Approved: ${row.approvedBy}` : (row.createdBy ? `Created: ${row.createdBy}` : '—')}
                </td>
              </tr>
            );
          })}
        </tbody>
      );
    }

    // 3. TRANSFER_CONTRA_RECEIPTS
    if (reportType === 'TRANSFER_CONTRA_RECEIPTS') {
      return (
        <tbody className="divide-y divide-gray-100 text-xs">
          {items.map((row, idx) => {
            const srNo = (pagination.page - 1) * pagination.limit + idx + 1;
            return (
              <tr key={row.id || idx} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 text-gray-500 font-medium">{row.srNo || srNo}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-gray-800">{row.voucherNo || row.receiptNo || '—'}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#225091] border border-blue-100">
                    {row.voucherType || row.receiptType || 'TRANSFER'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-gray-600">{formatDate(row.date || row.createdAt)}</td>
                <td className="py-3.5 px-4 text-gray-700 font-mono">{row.fromAccount || row.sourceAccount || '—'}</td>
                <td className="py-3.5 px-4 text-gray-700 font-mono">{row.toAccount || row.destinationAccount || '—'}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900 font-mono text-right">
                  {row.formattedAmount || formatCurrency(row.amount)}
                </td>
                <td className="py-3.5 px-4 text-center">{getStatusBadge(row.status)}</td>
                <td className="py-3.5 px-4 text-gray-600">{row.branchName || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      );
    }

    // 4. CASH_PAYMENTS
    if (reportType === 'CASH_PAYMENTS') {
      return (
        <tbody className="divide-y divide-gray-100 text-xs">
          {items.map((row, idx) => {
            const srNo = (pagination.page - 1) * pagination.limit + idx + 1;
            return (
              <tr key={row.id || idx} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 text-gray-500 font-medium">{row.srNo || srNo}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-gray-800">{row.receiptNo || row.voucherNo || '—'}</td>
                <td className="py-3.5 px-4 text-gray-600">{formatDate(row.date || row.createdAt)}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900">{row.collectorName || row.name || '—'}</td>
                <td className="py-3.5 px-4 text-gray-600">{row.drawerName || row.mode || 'Counter Cash'}</td>
                <td className="py-3.5 px-4 text-gray-600">{row.branchName || '—'}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900 font-mono text-right">
                  {row.formattedAmount || formatCurrency(row.amount)}
                </td>
                <td className="py-3.5 px-4 text-center">{getStatusBadge(row.status)}</td>
              </tr>
            );
          })}
        </tbody>
      );
    }

    // 5. ATTENDANCE_SUMMARY
    if (reportType === 'ATTENDANCE_SUMMARY') {
      return (
        <tbody className="divide-y divide-gray-100 text-xs">
          {items.map((row, idx) => {
            const srNo = (pagination.page - 1) * pagination.limit + idx + 1;
            return (
              <tr key={row.id || idx} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 text-gray-500 font-medium">{row.srNo || srNo}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-gray-800">{row.employeeCode || '—'}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900">{row.employeeName || row.name || '—'}</td>
                <td className="py-3.5 px-4 text-gray-600">{row.branchName || '—'}</td>
                <td className="py-3.5 px-4 text-gray-600">{formatDate(row.date)}</td>
                <td className="py-3.5 px-4 text-gray-700 font-mono">{row.punchIn || row.inTime || '—'}</td>
                <td className="py-3.5 px-4 text-gray-700 font-mono">{row.punchOut || row.outTime || '—'}</td>
                <td className="py-3.5 px-4 font-semibold text-gray-800">{row.workingHours || row.totalHours || '—'}</td>
                <td className="py-3.5 px-4 text-center">{getStatusBadge(row.status || (row.isPresent ? 'PRESENT' : 'ABSENT'))}</td>
              </tr>
            );
          })}
        </tbody>
      );
    }

    // 6. DAILY_WORK_REPORT (Exact mapping from API JSON)
    if (reportType === 'DAILY_WORK_REPORT') {
      return (
        <tbody className="divide-y divide-gray-100 text-xs">
          {items.map((row, idx) => {
            const srNo = (pagination.page - 1) * pagination.limit + idx + 1;
            return (
              <tr key={row.id || idx} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 text-gray-500 font-medium">{row.srNo || srNo}</td>
                <td className="py-3.5 px-4 text-gray-600">{formatDate(row.date)}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900 text-[13px]">{row.executiveName || row.name || '—'}</td>
                <td className="py-3.5 px-4 text-gray-600 font-medium">{row.branchName || '—'}</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#225091] border border-blue-100">
                    {row.visitsCount ?? row.totalFieldVisits ?? 0} Visits
                  </span>
                </td>
                <td className="py-3.5 px-4 text-gray-600">{row.createdBy || '—'}</td>
                <td className="py-3.5 px-4 text-gray-600 max-w-[280px] truncate" title={row.remarks || ''}>
                  {row.remarks || '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      );
    }

    // 7. STAFF_DIRECTORY
    if (reportType === 'STAFF_DIRECTORY') {
      return (
        <tbody className="divide-y divide-gray-100 text-xs">
          {items.map((row, idx) => {
            const srNo = (pagination.page - 1) * pagination.limit + idx + 1;
            return (
              <tr key={row.id || idx} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 text-gray-500 font-medium">{row.srNo || srNo}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-gray-800">{row.employeeCode || row.code || '—'}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900">{row.fullName || row.name || '—'}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-[#225091] border border-blue-100 font-semibold text-[11px]">
                    {row.role || row.designation || 'EMPLOYEE'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-gray-600">{row.branchName || '—'}</td>
                <td className="py-3.5 px-4 text-gray-600 font-mono">{row.phoneNumber || row.phone || '—'}</td>
                <td className="py-3.5 px-4 text-gray-600">{row.email || '—'}</td>
                <td className="py-3.5 px-4 text-center">{getStatusBadge(row.kycStatus || 'VERIFIED')}</td>
                <td className="py-3.5 px-4 text-center">{getStatusBadge(row.status || 'ACTIVE')}</td>
              </tr>
            );
          })}
        </tbody>
      );
    }

    // 8. LEADS_AND_LOANS
    if (reportType === 'LEADS_AND_LOANS') {
      return (
        <tbody className="divide-y divide-gray-100 text-xs">
          {items.map((row, idx) => {
            const srNo = (pagination.page - 1) * pagination.limit + idx + 1;
            return (
              <tr key={row.id || idx} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 text-gray-500 font-medium">{row.srNo || srNo}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-gray-800">{row.leadNo || row.applicationNo || row.id || '—'}</td>
                <td className="py-3.5 px-4 text-gray-600">{formatDate(row.date || row.createdAt)}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900">{row.customerName || row.name || '—'}</td>
                <td className="py-3.5 px-4 font-mono text-gray-600">{row.phoneNumber || row.phone || '—'}</td>
                <td className="py-3.5 px-4 text-gray-700">{row.productName || row.product || '—'}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900 font-mono text-right">
                  {row.formattedRequestedAmount || formatCurrency(row.requestedAmount || row.amount)}
                </td>
                <td className="py-3.5 px-4 font-bold text-emerald-700 font-mono text-right">
                  {row.formattedDisbursedAmount || formatCurrency(row.disbursedAmount || row.principalDisbursed)}
                </td>
                <td className="py-3.5 px-4 text-center">{getStatusBadge(row.status || row.stage)}</td>
                <td className="py-3.5 px-4 text-gray-600">{row.branchName || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      );
    }

    // 9. CIBIL_ASSESSMENT_AUDIT
    if (reportType === 'CIBIL_ASSESSMENT_AUDIT') {
      return (
        <tbody className="divide-y divide-gray-100 text-xs">
          {items.map((row, idx) => {
            const srNo = (pagination.page - 1) * pagination.limit + idx + 1;
            return (
              <tr key={row.id || idx} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 text-gray-500 font-medium">{row.srNo || srNo}</td>
                <td className="py-3.5 px-4 text-gray-600">{formatDate(row.date || row.createdAt)}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900">{row.customerName || row.name || '—'}</td>
                <td className="py-3.5 px-4 font-mono text-gray-600">{row.panNumber || row.aadhaarNumber || '—'}</td>
                <td className="py-3.5 px-4 text-center font-bold text-base text-[#225091] font-mono">
                  {row.creditScore || row.cibilScore || row.score || '—'}
                </td>
                <td className="py-3.5 px-4 text-center">
                  {getStatusBadge(row.riskCategory || row.riskClassification || row.riskLevel || 'LOW RISK')}
                </td>
                <td className="py-3.5 px-4 text-gray-600">{row.checkedBy || '—'}</td>
                <td className="py-3.5 px-4 text-gray-600">{row.branchName || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      );
    }

    // 10. MERCHANT_SUMMARY
    if (reportType === 'MERCHANT_SUMMARY') {
      return (
        <tbody className="divide-y divide-gray-100 text-xs">
          {items.map((row, idx) => {
            const srNo = (pagination.page - 1) * pagination.limit + idx + 1;
            return (
              <tr key={row.id || idx} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 text-gray-500 font-medium">{row.srNo || srNo}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-gray-800">{row.merchantCode || row.code || '—'}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900">{row.shopName || row.name || '—'}</td>
                <td className="py-3.5 px-4 text-gray-700">{row.ownerName || '—'}</td>
                <td className="py-3.5 px-4 font-mono text-gray-600">{row.phoneNumber || row.phone || '—'}</td>
                <td className="py-3.5 px-4 text-gray-600">{row.branchName || '—'}</td>
                <td className="py-3.5 px-4 font-bold text-gray-900 font-mono text-right">
                  {row.formattedSalesVolume || formatCurrency(row.salesVolume || row.totalSales)}
                </td>
                <td className="py-3.5 px-4 text-center">{getStatusBadge(row.status)}</td>
              </tr>
            );
          })}
        </tbody>
      );
    }

    // 11. CARDS_CREDIT_USAGE
    if (reportType === 'CARDS_CREDIT_USAGE') {
      return (
        <tbody className="divide-y divide-gray-100 text-xs">
          {items.map((row, idx) => {
            const srNo = (pagination.page - 1) * pagination.limit + idx + 1;
            return (
              <tr key={row.id || idx} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 text-gray-500 font-medium">{row.srNo || srNo}</td>
                <td className="py-3.5 px-4 text-gray-600">{formatDate(row.date || row.createdAt)}</td>
                <td className="py-3.5 px-4 text-gray-600">{row.branchName || '—'}</td>
                <td className="py-3.5 px-4 font-semibold text-gray-800">{row.cardType || row.type || 'EMI Card'}</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                  {row.allocatedCredits ?? row.allocated ?? 0}
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                  {row.usedCredits ?? row.consumed ?? 0}
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                  {row.remainingCredits ?? row.balance ?? 0}
                </td>
              </tr>
            );
          })}
        </tbody>
      );
    }

    // Default Fallback: Smart Dynamic Table for all other reports
    return (
      <tbody className="divide-y divide-gray-100 text-xs">
        {items.map((row, idx) => {
          const srNo = (pagination.page - 1) * pagination.limit + idx + 1;
          const refCode = row.receiptNo || row.voucherNo || row.code || row.leadNo || row.employeeCode || row.id || '—';
          const rowDate = row.date || row.createdAt || row.punchTime;
          const entityName = row.name || row.customerName || row.employeeName || row.merchantName || row.fullName || '—';
          const accountOrHead = row.glHeadName || row.glCode || row.accountNumber || row.department || row.role || '—';
          const branchName = row.branchName || row.branchCode || '—';
          const rowAmount = row.formattedAmount || (row.amount !== undefined ? formatCurrency(row.amount) : (row.principalAmount ? formatCurrency(row.principalAmount) : (row.score ?? '—')));
          const rowStatus = row.status || row.kycStatus || row.riskCategory || '';
          const auditInfo = row.approvedBy || row.createdBy || row.checker || '—';

          return (
            <tr key={row.id || row._id || idx} className="hover:bg-slate-50/70 transition-colors">
              <td className="py-3.5 px-4 text-gray-500 font-medium">{row.srNo || srNo}</td>
              <td className="py-3.5 px-4 font-mono font-bold text-gray-800">{refCode}</td>
              <td className="py-3.5 px-4 text-gray-600">{formatDate(rowDate)}</td>
              <td className="py-3.5 px-4 font-bold text-gray-900">{entityName}</td>
              <td className="py-3.5 px-4 text-gray-600 truncate max-w-[180px]" title={String(accountOrHead)}>
                {accountOrHead}
              </td>
              <td className="py-3.5 px-4 text-gray-600">{branchName}</td>
              <td className="py-3.5 px-4 font-bold text-gray-900 font-mono">{rowAmount}</td>
              <td className="py-3.5 px-4 text-center">{getStatusBadge(rowStatus)}</td>
              <td className="py-3.5 px-4 text-gray-500 text-[11px]">{auditInfo}</td>
            </tr>
          );
        })}
      </tbody>
    );
  };

  // Render Table Headers dynamically based on Report Type
  const renderTableHeaders = () => {
    if (reportType === 'BRANCH_FINANCIAL_SUMMARY') {
      return (
        <tr>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-14">Sr.No</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch Code</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch Name</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Location</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Total Credit</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Total Debit</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Net Cash Flow</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Vouchers</th>
        </tr>
      );
    }

    if (reportType === 'CREDIT_RECEIPTS' || reportType === 'DEBIT_RECEIPTS') {
      return (
        <tr>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-14">Sr.No</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Receipt No</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Date</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Name / Customer</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Account No</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">GL Head</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Amount</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Status</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Audit</th>
        </tr>
      );
    }

    if (reportType === 'TRANSFER_CONTRA_RECEIPTS') {
      return (
        <tr>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-14">Sr.No</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Voucher No</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Type</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Date</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">From Account</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">To Account</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Amount</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Status</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch</th>
        </tr>
      );
    }

    if (reportType === 'CASH_PAYMENTS') {
      return (
        <tr>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-14">Sr.No</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Payment No</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Date</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Collector / Staff</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Drawer / Mode</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Amount</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Status</th>
        </tr>
      );
    }

    if (reportType === 'ATTENDANCE_SUMMARY') {
      return (
        <tr>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-14">Sr.No</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Employee Code</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Employee Name</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Date</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Punch In</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Punch Out</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Work Hours</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Status</th>
        </tr>
      );
    }

    if (reportType === 'DAILY_WORK_REPORT') {
      return (
        <tr>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-14">Sr.No</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Date</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Executive Name</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Field Visits</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Created By</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Remarks / Activity</th>
        </tr>
      );
    }

    if (reportType === 'STAFF_DIRECTORY') {
      return (
        <tr>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-14">Sr.No</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Emp Code</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Full Name</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Role</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Phone</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Email</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">KYC Status</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Status</th>
        </tr>
      );
    }

    if (reportType === 'LEADS_AND_LOANS') {
      return (
        <tr>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-14">Sr.No</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Lead / App No</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Date</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Customer Name</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Phone</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Product</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Requested</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Disbursed</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Status</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch</th>
        </tr>
      );
    }

    if (reportType === 'CIBIL_ASSESSMENT_AUDIT') {
      return (
        <tr>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-14">Sr.No</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Date</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Customer Name</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">PAN / ID</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">CIBIL Score</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Risk Classification</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Checked By</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch</th>
        </tr>
      );
    }

    if (reportType === 'MERCHANT_SUMMARY') {
      return (
        <tr>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-14">Sr.No</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Merchant Code</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Shop Name</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Owner Name</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Phone</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Sales Volume</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Status</th>
        </tr>
      );
    }

    if (reportType === 'CARDS_CREDIT_USAGE') {
      return (
        <tr>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-14">Sr.No</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Date</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Card Type</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Allocated</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Consumed</th>
          <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Balance</th>
        </tr>
      );
    }

    return (
      <tr>
        <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-14">Sr.No</th>
        <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Reference / ID</th>
        <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Date</th>
        <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Name / Entity</th>
        <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Account / Head</th>
        <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch</th>
        <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Amount / Value</th>
        <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Status</th>
        <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Audit / Approver</th>
      </tr>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-16">
      {/* Header */}
      <PageHeader
        title={reportTitle}
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Reports & Analytics', to: '/reports' },
          { label: reportTitle }
        ]}
        showBack={true}
        backUrl="/reports"
      />

      {/* Report Title Banner & Export Buttons */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#225091] flex items-center justify-center border border-blue-100 shrink-0">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{reportTitle}</h1>
              {reportCode && (
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[#225091] border border-blue-100 font-mono text-xs font-bold">
                  {reportCode}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Date Range:{' '}
              <strong className="text-gray-800">
                {formatDate(meta.dateRange?.from || startDate)}
              </strong>{' '}
              to{' '}
              <strong className="text-gray-800">
                {formatDate(meta.dateRange?.to || endDate)}
              </strong>
              {meta.bankName && (
                <>
                  {' '}• Society:{' '}
                  <strong className="text-gray-700">{meta.bankName}</strong>
                </>
              )}
              {meta.generatedByName && (
                <>
                  {' '}• Generated by:{' '}
                  <strong className="text-gray-700">{meta.generatedByName}</strong>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={loadReport}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
            title="Refresh Report"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-[#225091]' : ''} />
          </button>

          {canExport && (
            <ExportDropdown
              buttonText="Export"
              tableRef={reportTableRef}
              filename={`Report-${reportType}`}
              title={reportTitle || `Report - ${reportType}`}
              onExportCSV={() => handleExport('csv')}
            />
          )}
        </div>
      </div>

      {/* Dynamic KPI Summary Cards */}
      {kpiCards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <div key={kpi.key} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs min-w-0">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block truncate">
                {kpi.label}
              </span>
              <div className={`text-xl font-bold mt-1.5 truncate font-mono ${kpi.valueColor}`} title={String(kpi.value)}>
                {kpi.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#225091]" />
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Report Filters</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] font-medium text-gray-800"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] font-medium text-gray-800"
              />
            </div>
          </div>

          {/* Branch Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Branch
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => { setSelectedBranchId(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] font-medium text-gray-800 cursor-pointer"
            >
              <option value="">All Branches</option>
              {branchOptions.map((b) => (
                <option key={b.id || b._id} value={b.id || b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] font-medium text-gray-800 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="APPROVED">APPROVED</option>
              <option value="PENDING">PENDING</option>
              <option value="REJECTED">REJECTED</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PRESENT">PRESENT</option>
              <option value="ABSENT">ABSENT</option>
            </select>
          </div>

          {/* Free Text Search */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Search
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search records..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] font-medium text-gray-800"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 flex-wrap gap-2 text-xs">
          <span className="text-gray-500 text-[11px]">
            Showing records between{' '}
            <strong>{formatDate(meta.dateRange?.from || startDate)}</strong> and{' '}
            <strong>{formatDate(meta.dateRange?.to || endDate)}</strong>
          </span>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[11px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw size={12} /> Reset Filters
          </button>
        </div>
      </div>

      {/* Main Report Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table ref={reportTableRef} className="w-full border-collapse min-w-[900px] text-center text-sm whitespace-nowrap">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              {renderTableHeaders()}
            </thead>
            {renderTableContent()}
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <Pagination
          page={page}
          totalPages={pagination.totalPages || 1}
          totalRecords={pagination.totalRecords || items.length}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default ReportViewer;
