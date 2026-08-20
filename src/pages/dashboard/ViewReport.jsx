import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Phone, 
  Mail, 
  MapPin, 
  Target, 
  ChevronDown, 
  Loader2, 
  ArrowLeft,
  Calendar,
  Layers,
  Award,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { kpaReportService } from '../../api/kpaReportService';
import useBranchStore from '../../store/branchStore';

const AVAILABLE_YEARS = [2026, 2025, 2024, 2027];
const AVAILABLE_MONTHS = [
  { label: 'All Months', value: '' },
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
];

const AVAILABLE_PRODUCTS = [
  'Loan Disbursement',
  'Fixed Deposit',
  'Recurring Deposit',
  'Savings Account',
  'Current Account',
  'Insurance Policy',
];

const ViewReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Filter States
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('Loan Disbursement');
  const [selectedTimeframe, setSelectedTimeframe] = useState('yearly'); // 'yearly' | 'monthly' | 'weekly' | 'daily'
  const globalBranchId = useBranchStore(state => state.globalBranchId);

  // Data States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpaData, setKpaData] = useState(null);

  // Fetch Detailed KPA Targets vs Achievements
  // GET /api/v1/society/employees/hr/:id/kpa-reports/detail?month=&year=
  const fetchKpaDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const params = {
        year: selectedYear,
      };
      if (selectedMonth) {
        params.month = selectedMonth;
      }
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
  };

  useEffect(() => {
    fetchKpaDetail();
  }, [id, selectedYear, selectedMonth, selectedProduct, globalBranchId]);

  // Employee details from response or fallbacks
  const employee = kpaData?.employee || {
    fullName: 'Employee',
    designation: 'Staff',
    phoneNumber: '—',
    email: '—',
    branchName: 'Main Branch',
  };

  // Helper formatter for currencies
  const formatCurrency = (amount, formatted) => {
    if (formatted) return formatted;
    if (amount !== undefined && amount !== null && amount !== '') {
      const num = Number(amount);
      if (!isNaN(num)) return `₹${num.toLocaleString('en-IN')}`;
    }
    return '₹0';
  };

  // Targets
  const yearly = kpaData?.yearly || { goal: 0, achieved: 0, percentage: 0 };
  const monthly = kpaData?.monthly || { goal: 0, achieved: 0, percentage: 0 };
  const weekly = kpaData?.weekly || { goal: 0, achieved: 0, percentage: 0 };
  const daily = kpaData?.daily || { goal: 0, achieved: 0, percentage: 0 };

  // Current timeframe target data
  const currentTimeframeData = (() => {
    switch (selectedTimeframe) {
      case 'monthly':
        return { title: 'Monthly Target', data: monthly };
      case 'weekly':
        return { title: 'Weekly Target', data: weekly };
      case 'daily':
        return { title: 'Daily Target', data: daily };
      case 'yearly':
      default:
        return { title: 'Yearly Target', data: yearly };
    }
  })();

  const currentGoal = currentTimeframeData.data?.goal || 0;
  const currentAchieved = currentTimeframeData.data?.achieved || 0;
  const currentPercentage = currentTimeframeData.data?.percentage ?? 
    (currentGoal > 0 ? Math.round((currentAchieved / currentGoal) * 100) : 0);
  const currentPending = Math.max(0, currentGoal - currentAchieved);

  // Generate dynamic chart data based on target and achievement
  const chartData = [
    { name: 'Jan', target: Math.round(currentGoal / 12000), achievement: Math.round(currentAchieved * 0.08 / 1000) },
    { name: 'Feb', target: Math.round(currentGoal / 12000), achievement: Math.round(currentAchieved * 0.07 / 1000) },
    { name: 'Mar', target: Math.round(currentGoal / 12000), achievement: Math.round(currentAchieved * 0.09 / 1000) },
    { name: 'Apr', target: Math.round(currentGoal / 12000), achievement: Math.round(currentAchieved * 0.08 / 1000) },
    { name: 'May', target: Math.round(currentGoal / 12000), achievement: Math.round(currentAchieved * 0.09 / 1000) },
    { name: 'Jun', target: Math.round(currentGoal / 12000), achievement: Math.round(currentAchieved * 0.10 / 1000) },
    { name: 'Jul', target: Math.round(currentGoal / 12000), achievement: Math.round(currentAchieved * 0.08 / 1000) },
    { name: 'Aug', target: Math.round(currentGoal / 12000), achievement: Math.round(currentAchieved * 0.09 / 1000) },
    { name: 'Sep', target: Math.round(currentGoal / 12000), achievement: Math.round(currentAchieved * 0.08 / 1000) },
    { name: 'Oct', target: Math.round(currentGoal / 12000), achievement: Math.round(currentAchieved * 0.09 / 1000) },
    { name: 'Nov', target: Math.round(currentGoal / 12000), achievement: Math.round(currentAchieved * 0.07 / 1000) },
    { name: 'Dec', target: Math.round(currentGoal / 12000), achievement: Math.round(currentAchieved * 0.08 / 1000) },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      
      {/* Breadcrumb */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[#225091] mb-3">View Report</h1>
          <div className="flex items-center text-[13px] font-medium text-gray-500 flex-wrap gap-y-2">
            <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
            <ChevronRight size={14} className="mx-1" />
            <span>HR Management</span>
            <ChevronRight size={14} className="mx-1" />
            <Link to="/kpa-report" className="hover:text-gray-800 transition-colors">KPA Report</Link>
            <ChevronRight size={14} className="mx-1" />
            <span className="text-[#225091]">View Report</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/kpa-report')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors self-start sm:self-center"
        >
          <ArrowLeft size={16} /> Back to KPA Report
        </button>
      </div>

      {/* Employee Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm shrink-0 bg-purple-50 flex items-center justify-center text-purple-700 font-bold text-xl">
            {employee.fullName ? employee.fullName.charAt(0) : 'E'}
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-bold text-gray-800">{employee.fullName || employee.employeeName || 'Employee'}</h2>
            <span className="inline-flex px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[12px] font-bold w-max">
              {employee.designation || 'Staff'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
              <Phone size={16} className="text-[#225091]" /> {employee.phoneNumber || employee.phone || '—'}
            </div>
            <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
              <Mail size={16} className="text-[#225091]" /> {employee.email || '—'}
            </div>
            <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
              <MapPin size={16} className="text-[#225091]" /> {employee.branchName || employee.branch || '—'}
            </div>
          </div>
          <button 
            onClick={() => navigate(`/kpa-report/view/${id}/add-kra`)}
            className="bg-[#225091] hover:bg-[#159a9f] text-white px-6 py-2.5 rounded-full text-[14px] font-semibold transition-colors shadow-sm self-start sm:self-center"
          >
            Add New KRA
          </button>
        </div>
      </div>

      {/* Target Overview Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Award className="text-[#225091]" size={20} />
            <h2 className="text-[17px] font-bold text-gray-800">Target Overview</h2>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Year Selector */}
            <div className="relative">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="appearance-none pl-4 pr-9 py-2 rounded-lg border border-gray-200 text-[13px] text-gray-700 font-semibold focus:outline-none focus:border-[#225091] bg-white"
              >
                {AVAILABLE_YEARS.map(yr => (
                  <option key={yr} value={yr}>FY {yr}-{String(yr + 1).slice(2)}</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>

            {/* Month Selector */}
            <div className="relative">
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2 rounded-lg border border-gray-200 text-[13px] text-gray-700 font-semibold focus:outline-none focus:border-[#225091] bg-white"
              >
                {AVAILABLE_MONTHS.map(m => (
                  <option key={m.label} value={m.value}>{m.label}</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>

            {/* Product Selector */}
            <div className="relative">
              <select 
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2 rounded-lg border border-gray-200 text-[13px] text-gray-700 font-semibold focus:outline-none focus:border-[#225091] bg-white"
              >
                {AVAILABLE_PRODUCTS.map(prod => (
                  <option key={prod} value={prod}>{prod}</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>

            <button
              onClick={fetchKpaDetail}
              disabled={loading}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              title="Refresh Targets"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin text-[#225091]' : ''} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
            <Loader2 className="animate-spin text-[#225091]" size={32} />
            <span className="text-sm font-medium">Loading target details...</span>
          </div>
        ) : (
          <div className="p-8 flex flex-col gap-8">
            
            {/* Yearly Target */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-sm border-2 border-green-500"></div>
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-gray-800">Yearly Target</div>
                    <div className="text-[13px] font-medium text-gray-500">
                      {formatCurrency(yearly.achieved, yearly.formattedAchieved)} / {formatCurrency(yearly.goal, yearly.formattedGoal)}
                    </div>
                  </div>
                </div>
                <div className="text-[14px] font-bold text-green-500">{yearly.percentage ?? 0}%</div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(0, yearly.percentage || 0))}%` }}
                ></div>
              </div>
            </div>

            {/* Monthly Target */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-sm border-2 border-blue-500"></div>
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-gray-800">Monthly Target</div>
                    <div className="text-[13px] font-medium text-gray-500">
                      {formatCurrency(monthly.achieved, monthly.formattedAchieved)} / {formatCurrency(monthly.goal, monthly.formattedGoal)}
                    </div>
                  </div>
                </div>
                <div className="text-[14px] font-bold text-blue-500">{monthly.percentage ?? 0}%</div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(0, monthly.percentage || 0))}%` }}
                ></div>
              </div>
            </div>

            {/* Weekly Target */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-sm border-2 border-purple-500"></div>
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-gray-800">Weekly Target</div>
                    <div className="text-[13px] font-medium text-gray-500">
                      {formatCurrency(weekly.achieved, weekly.formattedAchieved)} / {formatCurrency(weekly.goal, weekly.formattedGoal)}
                    </div>
                  </div>
                </div>
                <div className="text-[14px] font-bold text-purple-500">{weekly.percentage ?? 0}%</div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(0, weekly.percentage || 0))}%` }}
                ></div>
              </div>
            </div>

            {/* Daily Target */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-sm border-2 border-orange-500"></div>
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-gray-800">Daily Target</div>
                    <div className="text-[13px] font-medium text-gray-500">
                      {formatCurrency(daily.achieved, daily.formattedAchieved)} / {formatCurrency(daily.goal, daily.formattedGoal)}
                    </div>
                  </div>
                </div>
                <div className="text-[14px] font-bold text-orange-500">{daily.percentage ?? 0}%</div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(0, daily.percentage || 0))}%` }}
                ></div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-[#225091]" size={20} />
            <h2 className="text-[18px] font-bold text-gray-800">Progress Breakdown ({selectedProduct})</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select 
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-200 text-[14px] text-gray-700 font-medium focus:outline-none focus:border-[#225091] bg-white capitalize"
              >
                <option value="yearly">Yearly Breakdown</option>
                <option value="monthly">Monthly Target</option>
                <option value="weekly">Weekly Target</option>
                <option value="daily">Daily Target</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="p-8 flex flex-col gap-8">
          
          {/* Active Timeframe Highlight */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
                  <Target size={24} className="text-white" />
                </div>
                <div>
                  <div className="text-[14px] font-medium text-gray-800">{currentTimeframeData.title}</div>
                  <div className="text-[14px] font-bold text-gray-800 mt-1">
                    {formatCurrency(currentAchieved, currentTimeframeData.data?.formattedAchieved)}{' '}
                    <span className="text-gray-500 font-medium">
                      / {formatCurrency(currentGoal, currentTimeframeData.data?.formattedGoal)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-[16px] font-bold text-teal-600">{currentPercentage}%</div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 mt-1">
              <div 
                className="bg-teal-500 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(0, currentPercentage))}%` }}
              ></div>
            </div>
          </div>

          {/* Charts and Summary Row */}
          <div className="flex flex-col lg:flex-row gap-6 mt-2">
            
            {/* Target Overview Chart */}
            <div className="flex-1 border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between gap-6 mb-6 flex-wrap">
                <div className="flex items-center gap-4">
                  <h3 className="text-[15px] font-bold text-gray-800">Monthly Performance Trend</h3>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#225091]"></div>
                      <span className="text-[13px] text-gray-600 font-medium">Target</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-500"></div>
                      <span className="text-[13px] text-gray-600 font-medium">Achievement</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => value === 0 ? '₹0' : `₹${value}K`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`₹${value}K`, '']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="achievement" 
                      stroke="#6b7280" 
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                      activeDot={{ r: 6 }}
                      name="Achievement"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#225091" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                      name="Target"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Target Summary */}
            <div className="w-full lg:w-[320px] border border-gray-200 rounded-xl p-6 flex flex-col justify-center bg-gray-50/40">
              <h3 className="text-[15px] font-bold text-gray-800 mb-6">Target Summary ({selectedTimeframe})</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-[14px] text-gray-600 font-medium">Target</span>
                  <span className="text-[14px] font-bold text-gray-800">{formatCurrency(currentGoal, currentTimeframeData.data?.formattedGoal)}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-[14px] text-gray-600 font-medium">Achieved</span>
                  <span className="text-[14px] font-bold text-teal-600">{formatCurrency(currentAchieved, currentTimeframeData.data?.formattedAchieved)}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-[14px] text-gray-600 font-medium">Pending</span>
                  <span className="text-[14px] font-bold text-orange-600">₹{currentPending.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-gray-600 font-medium">Achievement Rate</span>
                  <span className="text-[14px] font-bold text-[#225091]">{currentPercentage}%</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default ViewReport;
