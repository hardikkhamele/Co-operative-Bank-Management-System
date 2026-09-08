import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, FileSpreadsheet, ArrowRight, Download, Search, 
  Filter, ShieldCheck, CheckCircle2, TrendingUp, Building2, 
  Users, CreditCard, ArrowDownRight, ArrowUpRight, ArrowRightLeft, 
  Banknote, ClipboardList, Store, Calendar, FileText, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
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
    <div className="flex flex-col gap-6 w-full pb-14">
      {/* Header */}
      <PageHeader
        title="Reports & Analytics"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Reports & Analytics' }
        ]}
      />

      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Reports</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">12 Reports</div>
            <span className="text-[11px] text-emerald-600 font-medium">Ready for generation</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#225091] flex items-center justify-center border border-blue-100">
            <BarChart3 size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Report Categories</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">4 Modules</div>
            <span className="text-[11px] text-gray-500">Finance, Loans, HR & Credits</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Filter size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Export Formats</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">CSV & PDF</div>
            <span className="text-[11px] text-[#225091] font-medium">Streamed downloads</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <FileSpreadsheet size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Access Controls</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">Branch Isolated</div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 size={13} /> Strict RBAC Applied
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#225091] text-white shadow-xs'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/60'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by report name, code, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reports Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredReports.map((report) => {
          const colors = getCategoryColor(report.category);
          const IconComponent = report.icon || BarChart3;
          const isExportingCSV = exportingReportId === `${report.id}-csv`;
          const isExportingPDF = exportingReportId === `${report.id}-pdf`;

          return (
            <div
              key={report.id}
              onClick={() => navigate(`/reports/${report.id}`)}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#225091]/30 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              {/* Card Top */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${colors.iconBg} flex items-center justify-center shrink-0 border border-gray-100`}>
                      <IconComponent size={22} />
                    </div>
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
                        {report.category}
                      </span>
                      <span className="block text-[11px] font-mono text-gray-400 font-semibold mt-0.5">
                        {report.code}
                      </span>
                    </div>
                  </div>
                </div>

                <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-[#225091] transition-colors leading-snug">
                  {report.title}
                </h3>
                
                <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                  {report.description}
                </p>

                {/* Supported Filter Tags */}
                {report.supportedFilters && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-4 pt-3 border-t border-gray-50">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Filters:</span>
                    {report.supportedFilters.slice(0, 4).map((f) => (
                      <span key={f} className="text-[10px] px-2 py-0.5 rounded bg-gray-50 text-gray-600 font-medium border border-gray-100">
                        {f === 'dateFrom' || f === 'dateTo' ? 'Date Range' : f === 'branchId' ? 'Branch' : f}
                      </span>
                    ))}
                    {report.supportedFilters.length > 4 && (
                      <span className="text-[10px] text-gray-400 font-semibold">
                        +{report.supportedFilters.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Bottom Actions */}
              <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-gray-100">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#225091] group-hover:translate-x-1 transition-transform">
                  Generate Report <ArrowRight size={14} />
                </span>

                {canExport && (
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={isExportingCSV}
                      onClick={(e) => handleQuickExport(e, report.id, 'csv')}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-[11px] font-bold text-gray-700 hover:text-[#225091] transition-colors flex items-center gap-1"
                      title="Quick export CSV"
                    >
                      {isExportingCSV ? (
                        <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-[#225091] rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <Download size={12} /> CSV
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isExportingPDF}
                      onClick={(e) => handleQuickExport(e, report.id, 'pdf')}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-[11px] font-bold text-gray-700 hover:text-rose-600 transition-colors flex items-center gap-1"
                      title="Quick export PDF"
                    >
                      {isExportingPDF ? (
                        <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-rose-600 rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <Download size={12} /> PDF
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

      {filteredReports.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
            <Search size={24} />
          </div>
          <h4 className="text-base font-bold text-gray-800">No reports matched your search</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            Try adjusting your search query or switch back to "All Reports" to see all available ledgers.
          </p>
          <button
            onClick={() => { setSelectedCategory('All Reports'); setSearchQuery(''); }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#225091] text-white text-xs font-semibold hover:bg-[#183f72] transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportsHub;
