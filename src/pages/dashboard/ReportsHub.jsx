import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, FileSpreadsheet, ArrowRight, Download, Search, 
  Filter, ShieldCheck, CheckCircle2, TrendingUp, Building2, 
  Users, CreditCard, ArrowDownRight, ArrowUpRight, ArrowRightLeft, 
  Banknote, ClipboardList, Store, Calendar, FileText, X,
  LayoutGrid, List
} from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';
import TableWrapper from '../../components/common/TableWrapper';
import { reportService } from '../../api/reportService';
import usePermission from '../../hooks/usePermission';

// Fallback comprehensive 12-report catalog based on official Society Reports API documentation
const DEFAULT_CATALOG = [
  {
    id: 'CREDIT_RECEIPTS',
    code: 'FIN-CR-01',
    title: 'Credit Receipts Ledger Report',
    category: 'Financial & Ledger',
    icon: ArrowDownRight,
    description: 'Credit Receipts (CR) ledger with GL Code, GL Head Name, status breakdown, and maker-checker audit.',
    supportedFilters: ['dateFrom', 'dateTo', 'branchId', 'status', 'glHead', 'search'],
    exportFormats: ['CSV', 'PDF']
  },
  {
    id: 'DEBIT_RECEIPTS',
    code: 'FIN-DR-02',
    title: 'Debit Receipts Ledger Report',
    category: 'Financial & Ledger',
    icon: ArrowUpRight,
    description: 'Debit Receipts (DR) outflow voucher report with beneficiary account details and expenditure approval audit.',
    supportedFilters: ['dateFrom', 'dateTo', 'branchId', 'status', 'glHead', 'search'],
    exportFormats: ['CSV', 'PDF']
  },
  {
    id: 'TRANSFER_CONTRA_RECEIPTS',
    code: 'FIN-TC-03',
    title: 'Transfer & Contra Ledger Report',
    category: 'Financial & Ledger',
    icon: ArrowRightLeft,
    description: 'Inter-branch fund transfers (TR) and bank contra vouchers (CT) ledger with source/target accounts.',
    supportedFilters: ['dateFrom', 'dateTo', 'branchId', 'status', 'search'],
    exportFormats: ['CSV', 'PDF']
  },
  {
    id: 'CASH_PAYMENTS',
    code: 'FIN-CP-04',
    title: 'Cash Payments & Counter Reconciliation',
    category: 'Financial & Ledger',
    icon: Banknote,
    description: 'Counter cash collections, field cash submissions, and opening/closing cash drawer balance reconciliation.',
    supportedFilters: ['dateFrom', 'dateTo', 'branchId', 'status', 'search'],
    exportFormats: ['CSV', 'PDF']
  },
  {
    id: 'BRANCH_FINANCIAL_SUMMARY',
    code: 'FIN-BS-05',
    title: 'Branch Financial Summary Report',
    category: 'Financial & Ledger',
    icon: Building2,
    description: 'Executive overview of total credits, total debits, net movement, and pending approvals per branch.',
    supportedFilters: ['dateFrom', 'dateTo', 'branchId'],
    exportFormats: ['CSV', 'PDF']
  },
  {
    id: 'LEADS_AND_LOANS',
    code: 'BUS-LN-06',
    title: 'Leads & Loan Disbursement Report',
    category: 'Loans & Business',
    icon: TrendingUp,
    description: 'Customer lead conversion tracking, loan requested amounts, verification stages, and total principal disbursed.',
    supportedFilters: ['dateFrom', 'dateTo', 'branchId', 'status', 'search'],
    exportFormats: ['CSV', 'PDF']
  },
  {
    id: 'CIBIL_ASSESSMENT_AUDIT',
    code: 'BUS-CB-07',
    title: 'CIBIL Assessment & Credit Risk Audit',
    category: 'Loans & Business',
    icon: ClipboardList,
    description: 'Audit log of customer CIBIL checks, average credit score, and risk classification (High/Medium/Low Risk).',
    supportedFilters: ['dateFrom', 'dateTo', 'branchId', 'status', 'search'],
    exportFormats: ['CSV', 'PDF']
  },
  {
    id: 'MERCHANT_SUMMARY',
    code: 'BUS-MC-12',
    title: 'Merchant Partners & Sales Summary',
    category: 'Loans & Business',
    icon: Store,
    description: 'Onboarded merchant partners, active/pending verification audit, and total sales transaction volume.',
    supportedFilters: ['dateFrom', 'dateTo', 'branchId', 'status', 'search'],
    exportFormats: ['CSV', 'PDF']
  },
  {
    id: 'ATTENDANCE_SUMMARY',
    code: 'OPS-AT-08',
    title: 'Staff Attendance & Shift Compliance',
    category: 'HR & Operations',
    icon: Calendar,
    description: 'Employee punch-in/out audit, late arrivals, present/absent days, working hours, and shift compliance.',
    supportedFilters: ['dateFrom', 'dateTo', 'branchId', 'status', 'search'],
    exportFormats: ['CSV', 'PDF']
  },
  {
    id: 'STAFF_DIRECTORY',
    code: 'OPS-EM-09',
    title: 'Society Staff Directory & KYC Audit',
    category: 'HR & Operations',
    icon: Users,
    description: 'Society staff roster, system role allocations, branch assignments, KYC status, and active employment audit.',
    supportedFilters: ['branchId', 'status', 'search'],
    exportFormats: ['CSV', 'PDF']
  },
  {
    id: 'DAILY_WORK_REPORT',
    code: 'OPS-DW-10',
    title: 'Daily Field Work & Collection Logs',
    category: 'HR & Operations',
    icon: FileText,
    description: 'Field collection and loan executive daily work logs, field visits made, customer contacts, and cash collected.',
    supportedFilters: ['dateFrom', 'dateTo', 'branchId', 'search'],
    exportFormats: ['CSV', 'PDF']
  },
  {
    id: 'CARDS_CREDIT_USAGE',
    code: 'FIN-CC-11',
    title: 'EMI Cards & Verification Credits Usage',
    category: 'Credits & Verification',
    icon: CreditCard,
    description: 'Verification credit purchases, branch allocations, consumption audit, and issued EMI card tracking.',
    supportedFilters: ['dateFrom', 'dateTo', 'branchId', 'search'],
    exportFormats: ['CSV', 'PDF']
  }
];

const CATEGORIES = [
  'All Reports',
  'Financial & Ledger',
  'Loans & Business',
  'HR & Operations',
  'Credits & Verification'
];

const getCategoryColor = (category) => {
  switch (category) {
    case 'Financial & Ledger':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-500/10 text-emerald-600',
      };
    case 'Loans & Business':
      return {
        bg: 'bg-blue-50',
        text: 'text-[#225091]',
        border: 'border-blue-200',
        iconBg: 'bg-blue-500/10 text-[#225091]',
      };
    case 'HR & Operations':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        iconBg: 'bg-purple-500/10 text-purple-600',
      };
    case 'Credits & Verification':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        iconBg: 'bg-amber-500/10 text-amber-600',
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        iconBg: 'bg-gray-500/10 text-gray-600',
      };
  }
};

const ReportsHub = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const canExport = hasPermission('report.export');

  const [catalog, setCatalog] = useState(DEFAULT_CATALOG);
  const [selectedCategory, setSelectedCategory] = useState('All Reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [exportingReportId, setExportingReportId] = useState(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await reportService.getCatalog();
        if (res && res.success && res.data?.catalog && Array.isArray(res.data.catalog) && res.data.catalog.length > 0) {
          // Merge API catalog with icons
          const merged = res.data.catalog.map(item => {
            const fallback = DEFAULT_CATALOG.find(d => d.id === item.id || d.code === item.code);
            return {
              ...item,
              icon: fallback?.icon || BarChart3,
              category: item.category || fallback?.category || 'Financial & Ledger',
              exportFormats: item.exportFormats || ['CSV', 'PDF']
            };
          });
          setCatalog(merged);
        }
      } catch {
        // Silently use the complete DEFAULT_CATALOG if catalog endpoint is not yet live
      }
    };
    fetchCatalog();
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = {
      'All Reports': catalog.length,
      'Financial & Ledger': 0,
      'Loans & Business': 0,
      'HR & Operations': 0,
      'Credits & Verification': 0
    };
    catalog.forEach(item => {
      if (counts[item.category] !== undefined) {
        counts[item.category] += 1;
      }
    });
    return counts;
  }, [catalog]);

  const filteredReports = useMemo(() => {
    return catalog.filter(report => {
      const matchCategory = selectedCategory === 'All Reports' || report.category === selectedCategory;
      const search = searchQuery.trim().toLowerCase();
      const matchSearch = !search || 
        report.title?.toLowerCase().includes(search) ||
        report.code?.toLowerCase().includes(search) ||
        report.description?.toLowerCase().includes(search) ||
        report.category?.toLowerCase().includes(search);
      
      return matchCategory && matchSearch;
    });
  }, [catalog, selectedCategory, searchQuery]);

  const handleQuickExport = async (e, reportType, format) => {
    e.stopPropagation();
    if (!canExport) {
      toast.error('You do not have permission to export reports.');
      return;
    }

    setExportingReportId(`${reportType}-${format}`);
    try {
      await reportService.exportReport(reportType, { format });
      toast.success(`${format.toUpperCase()} export downloaded successfully!`);
    } catch (err) {
      console.error('Quick export failed:', err);
      toast.error(err.response?.data?.message || 'Export failed. Please try again.');
    } finally {
      setExportingReportId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full pb-14 max-w-[1600px] mx-auto">
      {/* Header */}
      <PageHeader
        title="Reports & Analytics"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Reports & Analytics' }
        ]}
      />

      {/* Category Stats Cards (Interactive Dashboard Ribbon) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatsCard
          layout="centered"
          color="blue"
          label="All Reports"
          value={categoryCounts['All Reports']}
          sublabel="Total Catalog"
          isActive={selectedCategory === 'All Reports'}
          onClick={() => setSelectedCategory('All Reports')}
        />
        <StatsCard
          layout="centered"
          color="emerald"
          label="Financial & Ledger"
          value={categoryCounts['Financial & Ledger']}
          sublabel="Cash & Ledger"
          isActive={selectedCategory === 'Financial & Ledger'}
          onClick={() => setSelectedCategory('Financial & Ledger')}
        />
        <StatsCard
          layout="centered"
          color="indigo"
          label="Loans & Business"
          value={categoryCounts['Loans & Business']}
          sublabel="Leads & Merchant"
          isActive={selectedCategory === 'Loans & Business'}
          onClick={() => setSelectedCategory('Loans & Business')}
        />
        <StatsCard
          layout="centered"
          color="purple"
          label="HR & Operations"
          value={categoryCounts['HR & Operations']}
          sublabel="Attendance & Staff"
          isActive={selectedCategory === 'HR & Operations'}
          onClick={() => setSelectedCategory('HR & Operations')}
        />
        <StatsCard
          layout="centered"
          color="amber"
          label="Credits & Verification"
          value={categoryCounts['Credits & Verification']}
          sublabel="Cards & Credits"
          isActive={selectedCategory === 'Credits & Verification'}
          onClick={() => setSelectedCategory('Credits & Verification')}
        />
      </div>

      {/* Search & View Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search report name, code, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50/70 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#225091]/20 focus:border-[#225091] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs font-semibold text-gray-500 mr-1 hidden sm:inline">
            Showing {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
          </span>
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200/80">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#225091] shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#225091] shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredReports.map((report) => {
            const colors = getCategoryColor(report.category);
            const IconComponent = report.icon || BarChart3;
            const isExportingCSV = exportingReportId === `${report.id}-csv`;
            const isExportingPDF = exportingReportId === `${report.id}-pdf`;

            return (
              <div
                key={report.id}
                onClick={() => navigate(`/reports/${report.id}`)}
                className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#225091]/30 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group select-none"
              >
                <div>
                  {/* Top Category Badge & Code */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {report.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 font-bold tracking-tight">
                      {report.code}
                    </span>
                  </div>

                  {/* Title & Icon */}
                  <div className="flex items-start gap-3 mt-2">
                    <div className={`w-9 h-9 rounded-xl ${colors.iconBg} flex items-center justify-center shrink-0 border border-gray-100 shadow-2xs`}>
                      <IconComponent size={18} />
                    </div>
                    <div>
                      <h3 className="text-[14.5px] font-bold text-slate-800 group-hover:text-[#225091] transition-colors leading-snug">
                        {report.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between gap-2 mt-5 pt-3.5 border-t border-gray-100">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#225091] group-hover:translate-x-0.5 transition-transform">
                    View Ledger <ArrowRight size={13} />
                  </span>

                  {canExport && (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        disabled={isExportingCSV}
                        onClick={(e) => handleQuickExport(e, report.id, 'csv')}
                        className="px-2.5 py-1 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[11px] font-bold text-slate-700 hover:text-[#225091] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-2xs"
                        title="Quick export CSV"
                      >
                        {isExportingCSV ? (
                          <span className="w-3 h-3 border-2 border-gray-400 border-t-[#225091] rounded-full animate-spin"></span>
                        ) : (
                          <>
                            <Download size={11} /> CSV
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isExportingPDF}
                        onClick={(e) => handleQuickExport(e, report.id, 'pdf')}
                        className="px-2.5 py-1 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[11px] font-bold text-slate-700 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-2xs"
                        title="Quick export PDF"
                      >
                        {isExportingPDF ? (
                          <span className="w-3 h-3 border-2 border-gray-400 border-t-rose-600 rounded-full animate-spin"></span>
                        ) : (
                          <>
                            <Download size={11} /> PDF
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
          <TableWrapper minHeight="360px">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50/80 border-b border-gray-200/80 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap">
                <tr>
                  <th className="py-3.5 px-4 text-left">Code</th>
                  <th className="py-3.5 px-4 text-left">Report Title & Description</th>
                  <th className="py-3.5 px-4 text-left">Category</th>
                  <th className="py-3.5 px-4 text-center">Formats</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map((report) => {
                  const colors = getCategoryColor(report.category);
                  const isExportingCSV = exportingReportId === `${report.id}-csv`;
                  const isExportingPDF = exportingReportId === `${report.id}-pdf`;

                  return (
                    <tr
                      key={report.id}
                      onClick={() => navigate(`/reports/${report.id}`)}
                      className="hover:bg-blue-50/25 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 text-[13px] font-mono font-bold text-slate-700 whitespace-nowrap">
                        {report.code}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-[13px] font-bold text-slate-900 group-hover:text-[#225091] transition-colors whitespace-nowrap">
                          {report.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 max-w-md truncate">
                          {report.description}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
                          {report.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="text-[11px] font-semibold text-slate-500">CSV, PDF</span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => navigate(`/reports/${report.id}`)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#225091] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          View
                        </button>
                        {canExport && (
                          <>
                            <button
                              type="button"
                              disabled={isExportingCSV}
                              onClick={(e) => handleQuickExport(e, report.id, 'csv')}
                              className="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-[#225091] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Export CSV"
                            >
                              {isExportingCSV ? (
                                <span className="w-3 h-3 border-2 border-gray-400 border-t-[#225091] rounded-full animate-spin inline-block"></span>
                              ) : (
                                'CSV'
                              )}
                            </button>
                            <button
                              type="button"
                              disabled={isExportingPDF}
                              onClick={(e) => handleQuickExport(e, report.id, 'pdf')}
                              className="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Export PDF"
                            >
                              {isExportingPDF ? (
                                <span className="w-3 h-3 border-2 border-gray-400 border-t-rose-600 rounded-full animate-spin inline-block"></span>
                              ) : (
                                'PDF'
                              )}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrapper>
        </div>
      )}

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
            <Search size={22} />
          </div>
          <h4 className="text-sm font-bold text-gray-800">No reports matched your search</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            Try adjusting your search query or switch back to "All Reports" to see all available ledgers.
          </p>
          <button
            onClick={() => { setSelectedCategory('All Reports'); setSearchQuery(''); }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#225091] text-white text-xs font-semibold hover:bg-[#183f72] transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportsHub;
