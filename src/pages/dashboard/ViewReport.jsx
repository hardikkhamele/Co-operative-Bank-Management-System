import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Phone, 
  Mail, 
  MapPin, 
  Target, 
  ChevronDown, 
  Loader2, 
  Calendar,
  Layers,
  Award,
  TrendingUp,
  RefreshCw,
  Plus,
  ArrowUpRight,
  Clock,
  Sparkles,
  BarChart3
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { kpaReportService } from '../../api/kpaReportService';
import { ALL_KPA_PRODUCTS } from '../../utils/kpaConstants';
import useBranchStore from '../../store/branchStore';
import { Skeleton, SkeletonAvatar } from '../../components/common/Skeleton';

const AVAILABLE_YEARS = [2026, 2025, 2024, 2027];

const ViewReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Filter States
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedProduct, setSelectedProduct] = useState('Loan Disbursement');
  const [selectedTimeframe, setSelectedTimeframe] = useState('yearly'); // 'yearly' | 'monthly' | 'weekly' | 'daily'
  const globalBranchId = useBranchStore(state => state.globalBranchId);

  // Data States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpaData, setKpaData] = useState(null);

  // Fetch Detailed KPA Targets vs Achievements
  // GET /api/v1/society/employees/hr/:id/kpa-reports/detail?year=&product=
  const fetchKpaDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const params = {
        year: selectedYear,
      };
      if (selectedProduct) {
        params.product = selectedProduct;
      }
      if (globalBranchId) {
        params.branchId = globalBranchId;
      }

      const response = await kpaReportService.getDetail(id, params);

      if (response && (response.success || response.data)) {
        setKpaData(response.data);
      } else {
        setKpaData(null);
      }
    } catch (err) {
      console.error('Failed to fetch KPA detail:', err);
      setError('Could not load KPA targets detail.');
    } finally {
      setLoading(false);
    }
  }, [id, selectedYear, selectedProduct, globalBranchId]);

  useEffect(() => {
    fetchKpaDetail();
  }, [fetchKpaDetail]);

  // Employee details from response or fallbacks
  const employee = kpaData?.employee || {
    fullName: 'Employee',
    designation: 'Staff',
    phoneNumber: '—',
    email: '—',
    branchName: 'Main Branch',
  };

  // Helper formatter for currencies / counts
  const formatCurrency = (amount, formatted) => {
    if (formatted) return formatted;
    if (amount !== undefined && amount !== null && amount !== '') {
      const num = Number(amount);
      if (!isNaN(num)) return `₹${num.toLocaleString('en-IN')}`;
    }
    return '₹0';
  };

  // Milestone Targets
  const yearly = kpaData?.yearly || { goal: 0, achieved: 0, percentage: 0 };
  const monthly = kpaData?.monthly || { goal: 0, achieved: 0, percentage: 0 };
  const weekly = kpaData?.weekly || { goal: 0, achieved: 0, percentage: 0 };
  const daily = kpaData?.daily || { goal: 0, achieved: 0, percentage: 0 };

  // Current timeframe target data for analytics chart
  const currentTimeframeData = (() => {
    switch (selectedTimeframe) {
      case 'monthly':
        return { title: 'Monthly Milestone', data: monthly };
      case 'weekly':
        return { title: 'Weekly Milestone', data: weekly };
      case 'daily':
        return { title: 'Daily Milestone', data: daily };
      case 'yearly':
      default:
        return { title: 'Yearly Goal', data: yearly };
    }
  })();

  const currentGoal = currentTimeframeData.data?.goal || 0;
  const currentAchieved = currentTimeframeData.data?.achieved || 0;
  const currentPercentage = currentTimeframeData.data?.percentage ?? 
    (currentGoal > 0 ? Math.round((currentAchieved / currentGoal) * 100) : 0);
  const currentPending = Math.max(0, currentGoal - currentAchieved);

  // Milestone cards array
  const milestoneCards = [
    {
      id: 'yearly',
      title: 'Fiscal Yearly Target',
      subtitle: `FY ${selectedYear} - ${selectedYear + 1}`,
      data: yearly,
      color: 'emerald',
      bgLight: 'bg-emerald-50/70',
      borderLight: 'border-emerald-100',
      textAccent: 'text-emerald-700',
      barColor: 'bg-emerald-600',
      badgeBg: 'bg-emerald-100/80 text-emerald-800',
    },
    {
      id: 'monthly',
      title: 'Monthly Milestone',
      subtitle: 'Derived (Yearly / 12)',
      data: monthly,
      color: 'blue',
      bgLight: 'bg-blue-50/70',
      borderLight: 'border-blue-100',
      textAccent: 'text-blue-700',
      barColor: 'bg-[#225091]',
      badgeBg: 'bg-blue-100/80 text-blue-800',
    },
    {
      id: 'weekly',
      title: 'Weekly Milestone',
      subtitle: 'Derived (Monthly / 4)',
      data: weekly,
      color: 'indigo',
      bgLight: 'bg-indigo-50/70',
      borderLight: 'border-indigo-100',
      textAccent: 'text-indigo-700',
      barColor: 'bg-indigo-600',
      badgeBg: 'bg-indigo-100/80 text-indigo-800',
    },
    {
      id: 'daily',
      title: 'Daily Milestone',
      subtitle: 'Derived (Weekly / 5)',
      data: daily,
      color: 'amber',
      bgLight: 'bg-amber-50/70',
      borderLight: 'border-amber-100',
      textAccent: 'text-amber-800',
      barColor: 'bg-amber-600',
      badgeBg: 'bg-amber-100/80 text-amber-900',
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-14 font-sans">
      
      {/* Header with Breadcrumbs */}
      <PageHeader
        title="Employee KPA Performance Analytics"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'HR Management' },
          { label: 'KPA Report', to: '/kpa-report' },
          { label: 'Performance Breakdown' }
        ]}
        showBack={true}
        backUrl="/kpa-report"
      >
        <button 
          onClick={() => navigate(`/kpa-report/view/${id}/add-kra`)}
          className="flex items-center gap-2 bg-[#225091] hover:bg-[#193e73] text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          <span>Configure / Update Targets</span>
        </button>
      </PageHeader>

      {/* Employee Profile Header Card */}
      {loading && !kpaData ? (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <SkeletonAvatar size="w-16 h-16" rounded="rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-44 rounded-md" />
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shadow-2xs shrink-0 bg-blue-50/90 flex items-center justify-center text-[#225091] font-bold text-2xl">
              {employee.fullName ? employee.fullName.charAt(0).toUpperCase() : 'E'}
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-[19px] font-bold text-gray-900">{employee.fullName || 'Employee'}</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex px-2.5 py-0.5 bg-blue-50 text-[#225091] border border-blue-200/60 rounded-full text-xs font-semibold">
                  {employee.designation || 'Staff'}
                </span>
                {employee.employeeCode && (
                  <span className="text-xs text-gray-400 font-mono">({employee.employeeCode})</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex flex-col gap-2 text-xs text-gray-600 font-medium">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#225091]" /> {employee.phoneNumber || '—'}
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#225091]" /> {employee.email || '—'}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#225091]" /> {employee.branchName || 'Main Branch'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product & Fiscal Year Filter Bar */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Product Selection Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1 shrink-0">Product:</span>
          {ALL_KPA_PRODUCTS.slice(0, 6).map(p => {
            const isSelected = selectedProduct === p.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => setSelectedProduct(p.name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#225091] text-white shadow-2xs'
                    : 'bg-slate-100/70 hover:bg-slate-100 text-gray-700'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>

        {/* Year Selector & Refresh */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer shadow-2xs"
          >
            {AVAILABLE_YEARS.map(yr => (
              <option key={yr} value={yr}>FY {yr} - {yr + 1}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={fetchKpaDetail}
            disabled={loading}
            className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            title="Refresh KPA metrics"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#225091]' : ''} />
          </button>
        </div>
      </div>

      {/* 4 Milestone Cards Grid (Yearly, Monthly, Weekly, Daily) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {milestoneCards.map((m) => {
          const goalVal = m.data.goal || 0;
          const achievedVal = m.data.achieved || 0;
          const pct = m.data.percentage ?? (goalVal > 0 ? Math.round((achievedVal / goalVal) * 100) : 0);

          return (
            <div 
              key={m.id}
              className={`bg-white rounded-2xl p-5 border ${m.borderLight} shadow-xs flex flex-col justify-between gap-4 transition-all hover:shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">{m.title}</h4>
                  <p className="text-[11px] text-gray-400 font-medium">{m.subtitle}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${m.badgeBg}`}>
                  {pct}%
                </span>
              </div>

              {/* Numbers */}
              <div className="space-y-1">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-gray-500 font-medium">Achieved:</span>
                  <span className={`font-bold text-sm ${m.textAccent}`}>
                    {formatCurrency(achievedVal, m.data.formattedAchieved)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-gray-400">Target Goal:</span>
                  <span className="font-semibold text-gray-700">
                    {formatCurrency(goalVal, m.data.formattedGoal)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`${m.barColor} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
                  <span>Progress</span>
                  <span>{pct}% of Goal</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Target vs Achievement Metric Summary Banner */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#225091] flex items-center justify-center shrink-0">
            <Award size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">
              Active Focus: {selectedProduct} ({kpaData?.year || selectedYear})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Live achievement numbers are automatically updated in real-time by transactions (Receipts, Cash Submissions, Leads).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 divide-x divide-gray-100 w-full md:w-auto justify-between md:justify-end">
          <div className="text-center px-3">
            <div className="text-[11px] font-bold text-gray-400 uppercase">Annual Goal</div>
            <div className="text-base font-bold text-gray-900 mt-0.5">
              {formatCurrency(yearly.goal, yearly.formattedGoal)}
            </div>
          </div>
          <div className="text-center px-4">
            <div className="text-[11px] font-bold text-gray-400 uppercase">Achieved</div>
            <div className="text-base font-bold text-emerald-600 mt-0.5">
              {formatCurrency(yearly.achieved, yearly.formattedAchieved)}
            </div>
          </div>
          <div className="text-center pl-4">
            <div className="text-[11px] font-bold text-gray-400 uppercase">Pending Gap</div>
            <div className="text-base font-bold text-rose-600 mt-0.5">
              {formatCurrency(Math.max(0, (yearly.goal || 0) - (yearly.achieved || 0)))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ViewReport;
