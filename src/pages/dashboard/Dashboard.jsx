import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LabelList
} from 'recharts';
import { Users, Banknote, Landmark, CreditCard, Wallet, Loader2 } from 'lucide-react';
import { dashboardService } from '../../api/dashboardService';

const fallbackStatsData = {
  emiCard: { title: 'EMI Card', count: 4200, formattedCount: '4,200' },
  verificationCredit: { title: 'Verification Credit', count: 8400, formattedCount: '8,400' },
  totalLeads: { title: 'Total Leads', count: 3067498, formattedCount: '30,67,498', changeText: 'This Month +3.7%', isPositive: true },
  totalLoanDistributed: { title: 'Total Loan Distributed', amount: 1025098764, formattedAmount: '₹102,50,98,764', changeText: 'This Month -1.7%', isPositive: false },
  collectionPending: { title: 'Collection Pending', amount: 5098764, formattedAmount: '₹50,98,764', changeText: 'This Month -1.7%', isPositive: false },
  totalRevenue: { title: 'Total Revenue', amount: 1298764, formattedAmount: '₹12,98,764', changeText: 'This Month -1.7%', isPositive: false },
  totalBranch: { title: 'Total Branch', count: 510, formattedCount: '510', changeText: 'This Month -1.7%', isPositive: false },
  totalStaff: { title: 'Total Staff', count: 8764, formattedCount: '8,764', changeText: 'This Month -1.7%', isPositive: false }
};

const fallbackRevenueMonths = [
  { month: 'Jan', thisYear: 30000, lastYear: 20000, formattedThisYear: '₹30K', formattedLastYear: '₹20K' },
  { month: 'Feb', thisYear: 25000, lastYear: 28000, formattedThisYear: '₹25K', formattedLastYear: '₹28K' },
  { month: 'Mar', thisYear: 22000, lastYear: 29000, formattedThisYear: '₹22K', formattedLastYear: '₹29K' },
  { month: 'Apr', thisYear: 35000, lastYear: 40000, formattedThisYear: '₹35K', formattedLastYear: '₹40K' },
  { month: 'May', thisYear: 32000, lastYear: 48000, formattedThisYear: '₹32K', formattedLastYear: '₹48K' },
  { month: 'Jun', thisYear: 55000, lastYear: 30000, formattedThisYear: '₹55K', formattedLastYear: '₹30K' },
  { month: 'Jul', thisYear: 88000, lastYear: 32000, formattedThisYear: '₹88K', formattedLastYear: '₹32K' },
  { month: 'Aug', thisYear: 105000, lastYear: 35000, formattedThisYear: '₹105K', formattedLastYear: '₹35K' },
  { month: 'Sep', thisYear: 72000, lastYear: 25000, formattedThisYear: '₹72K', formattedLastYear: '₹25K' },
  { month: 'Oct', thisYear: 80000, lastYear: 85000, formattedThisYear: '₹80K', formattedLastYear: '₹85K' },
  { month: 'Nov', thisYear: 42000, lastYear: 90000, formattedThisYear: '₹42K', formattedLastYear: '₹90K' },
  { month: 'Dec', thisYear: 60000, lastYear: 115000, formattedThisYear: '₹60K', formattedLastYear: '₹115K' },
];

const fallbackLoanCategories = [
  { category: 'Mobiles on EMI', amount: 200000, formattedAmount: '₹200K', count: 150 },
  { category: 'Electronics on EMI', amount: 53000, formattedAmount: '53K', count: 42 },
  { category: 'Two Wheeler Loan', amount: 80000, formattedAmount: '₹80K', count: 28 },
  { category: 'Used Car Loan', amount: 160000, formattedAmount: '₹160K', count: 14 },
  { category: 'New Car Loan', amount: 120000, formattedAmount: '₹120K', count: 8 },
];

const fallbackServices = [
  { service: 'Loan Service', serviceKey: 'LOAN', percentage: 100, amount: 1025098764, formattedAmount: '₹102,50,98,764', color: '#f48b29', status: 'ACTIVE' },
];

const actionsData = [
  { time: '6:35 AM', action: 'New lead application submitted.' },
  { time: '6:33 AM', action: 'EMI Card payment received.' },
  { time: '6:32 AM', action: 'Customer loan verification approved.' },
  { time: '6:31 AM', action: 'Daily cash reconciliation updated.' },
  { time: '6:30 AM', action: 'New branch staff account created.' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="font-semibold text-gray-800 mb-1">{label || payload[0].payload.name || payload[0].payload.rawCategory}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || '#1cabb1' }} className="text-sm font-medium">
            {entry.name}: {typeof entry.value === 'number' ? `₹${entry.value.toLocaleString()}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  // 1. Stats State
  const [stats, setStats] = useState(fallbackStatsData);
  const [loadingStats, setLoadingStats] = useState(false);

  // 2. Revenue Chart State
  const [revenueData, setRevenueData] = useState(fallbackRevenueMonths);
  const [revenueLegends, setRevenueLegends] = useState({ thisYear: 'This year', lastYear: 'Last year' });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  // 3. Loan Distributed Chart State
  const [loanCategories, setLoanCategories] = useState(fallbackLoanCategories);
  const [loanTimeFilter, setLoanTimeFilter] = useState('Today');
  const [loadingLoanChart, setLoadingLoanChart] = useState(false);

  // 4. Services Sales Contribution State
  const [servicesData, setServicesData] = useState(fallbackServices);
  const [servicesTimeFilter, setServicesTimeFilter] = useState('Today');
  const [loadingServices, setLoadingServices] = useState(false);

  // 1. Fetch Stats Cards (API 1)
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await dashboardService.getStats();
      if (res && res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Dashboard stats fallback:', err.message);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // 2. Fetch Revenue Comparison (API 2)
  const fetchRevenue = useCallback(async () => {
    try {
      setLoadingRevenue(true);
      const res = await dashboardService.getRevenueChart({ year: selectedYear });
      if (res && res.success && res.data) {
        if (Array.isArray(res.data.months) && res.data.months.length > 0) {
          setRevenueData(res.data.months);
        }
        if (res.data.legends) {
          setRevenueLegends(res.data.legends);
        }
      }
    } catch (err) {
      console.warn('Revenue chart fallback:', err.message);
    } finally {
      setLoadingRevenue(false);
    }
  }, [selectedYear]);

  // 3. Fetch Loan Distributed (API 3)
  const fetchLoanDistributed = useCallback(async () => {
    try {
      setLoadingLoanChart(true);
      const res = await dashboardService.getLoanDistributedChart({ timeFilter: loanTimeFilter });
      if (res && res.success && res.data) {
        if (Array.isArray(res.data.categories) && res.data.categories.length > 0) {
          setLoanCategories(res.data.categories);
        }
      }
    } catch (err) {
      console.warn('Loan chart fallback:', err.message);
    } finally {
      setLoadingLoanChart(false);
    }
  }, [loanTimeFilter]);

  // 4. Fetch Services Contribution (API 4)
  const fetchServicesStats = useCallback(async () => {
    try {
      setLoadingServices(true);
      const res = await dashboardService.getServicesStats({ timeFilter: servicesTimeFilter });
      if (res && res.success && res.data) {
        if (Array.isArray(res.data.services) && res.data.services.length > 0) {
          setServicesData(res.data.services);
        }
      }
    } catch (err) {
      console.warn('Services stats fallback:', err.message);
    } finally {
      setLoadingServices(false);
    }
  }, [servicesTimeFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  useEffect(() => {
    fetchLoanDistributed();
  }, [fetchLoanDistributed]);

  useEffect(() => {
    fetchServicesStats();
  }, [fetchServicesStats]);

  // Transform Loan Categories for Bar Chart
  const formattedLoanData = loanCategories.map((c, index) => {
    const lines = c.category.split(' ');
    let displayName = c.category;
    if (lines.length > 2) {
      displayName = `${lines.slice(0, 2).join(' ')}\n${lines.slice(2).join(' ')}`;
    } else if (lines.length === 2) {
      displayName = `${lines[0]}\n${lines[1]}`;
    }
    return {
      name: displayName,
      rawCategory: c.category,
      value: c.amount,
      formattedAmount: c.formattedAmount,
      count: c.count,
      fill: index === 1 ? '#1cabb1' : '#4b5563'
    };
  });

  // Transform Services Data for Pie Chart
  const formattedPieData = servicesData.map((s, idx) => {
    const palette = ['#f48b29', '#3bc454', '#c424ed', '#ffcc00', '#107eff', '#00ced1', '#6154ff', '#ff3c3c'];
    return {
      name: s.service,
      value: s.percentage,
      amount: s.amount,
      formattedAmount: s.formattedAmount,
      color: s.color || palette[idx % palette.length]
    };
  });

  // Construct 6 KPI Cards array from stats API response
  const kpiCards = [
    {
      title: stats.totalLeads?.title || 'Total Leads',
      value: stats.totalLeads?.formattedCount || (stats.totalLeads?.count != null ? stats.totalLeads.count.toLocaleString('en-IN') : '30,67,498'),
      change: stats.totalLeads?.changeText || `${stats.totalLeads?.percentageChange != null ? (stats.totalLeads.percentageChange > 0 ? '+' : '') + stats.totalLeads.percentageChange + '%' : '+3.7 %'}`,
      color: 'bg-[#00c5d5]',
      icon: <Users size={20} />,
      path: '/leads'
    },
    {
      title: stats.totalLoanDistributed?.title || 'Total Loan Distributed',
      value: stats.totalLoanDistributed?.formattedAmount || (stats.totalLoanDistributed?.amount != null ? `₹${stats.totalLoanDistributed.amount.toLocaleString('en-IN')}` : '₹102,50,98,764'),
      change: stats.totalLoanDistributed?.changeText || `${stats.totalLoanDistributed?.percentageChange != null ? (stats.totalLoanDistributed.percentageChange > 0 ? '+' : '') + stats.totalLoanDistributed.percentageChange + '%' : '-1.7 %'}`,
      color: 'bg-[#b68962]',
      icon: <Banknote size={20} />,
      path: '/customers'
    },
    {
      title: stats.collectionPending?.title || 'Collection Pending',
      value: stats.collectionPending?.formattedAmount || (stats.collectionPending?.amount != null ? `₹${stats.collectionPending.amount.toLocaleString('en-IN')}` : '₹50,98,764'),
      change: stats.collectionPending?.changeText || `${stats.collectionPending?.percentageChange != null ? (stats.collectionPending.percentageChange > 0 ? '+' : '') + stats.collectionPending.percentageChange + '%' : '-1.7 %'}`,
      color: 'bg-[#f48b29]',
      icon: <CreditCard size={20} />,
      path: '/credit'
    },
    {
      title: stats.totalRevenue?.title || 'Total Revenue',
      value: stats.totalRevenue?.formattedAmount || (stats.totalRevenue?.amount != null ? `₹${stats.totalRevenue.amount.toLocaleString('en-IN')}` : '₹12,98,764'),
      change: stats.totalRevenue?.changeText || `${stats.totalRevenue?.percentageChange != null ? (stats.totalRevenue.percentageChange > 0 ? '+' : '') + stats.totalRevenue.percentageChange + '%' : '-1.7 %'}`,
      color: 'bg-[#3bc454]',
      icon: <Wallet size={20} />,
      path: '/credit'
    },
    {
      title: stats.totalBranch?.title || 'Total Branch',
      value: stats.totalBranch?.formattedCount || (stats.totalBranch?.count != null ? stats.totalBranch.count.toLocaleString('en-IN') : '510'),
      change: stats.totalBranch?.changeText || `${stats.totalBranch?.percentageChange != null ? (stats.totalBranch.percentageChange > 0 ? '+' : '') + stats.totalBranch.percentageChange + '%' : '-1.7 %'}`,
      color: 'bg-[#6154ff]',
      icon: <Landmark size={20} />,
      path: '/branch'
    },
    {
      title: stats.totalStaff?.title || 'Total Staff',
      value: stats.totalStaff?.formattedCount || (stats.totalStaff?.count != null ? stats.totalStaff.count.toLocaleString('en-IN') : '8,764'),
      change: stats.totalStaff?.changeText || `${stats.totalStaff?.percentageChange != null ? (stats.totalStaff.percentageChange > 0 ? '+' : '') + stats.totalStaff.percentageChange + '%' : '-1.7 %'}`,
      color: 'bg-[#d926e9]',
      icon: <Users size={20} />,
      path: '/employees'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Section - EMI Card & Verification Credit (API 1) */}
      <div className="flex justify-end mb-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden">
          <div className="px-6 py-4 border-r border-gray-100 text-center min-w-[130px]">
            <div className="text-[13px] text-gray-500 font-medium mb-1">
              {stats.emiCard?.title || 'EMI Card'}
            </div>
            <div className="text-xl font-bold text-gray-800">
              {stats.emiCard?.formattedCount || (stats.emiCard?.count != null ? stats.emiCard.count.toLocaleString('en-IN') : '4,200')}
            </div>
          </div>
          <div className="px-6 py-4 text-center min-w-[150px]">
            <div className="text-[13px] text-gray-500 font-medium mb-1">
              {stats.verificationCredit?.title || 'Verification Credit'}
            </div>
            <div className="text-xl font-bold text-gray-800">
              {stats.verificationCredit?.formattedCount || (stats.verificationCredit?.count != null ? stats.verificationCredit.count.toLocaleString('en-IN') : '8,400')}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid (API 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((stat, idx) => (
          <Link 
            key={idx} 
            to={stat.path} 
            className={`${stat.color} rounded-xl p-5 text-white shadow-sm flex flex-col justify-between h-[130px] hover:-translate-y-1 hover:shadow-md transition-all duration-200 block cursor-pointer`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[15px] font-medium">{stat.title}</span>
              <div className="opacity-90">{stat.icon}</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1 tracking-tight">{stat.value}</div>
              <div className="text-sm font-medium">
                {stat.change.includes('This Month') ? stat.change : `This Month ${stat.change}`}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart (API 2) */}
        <div className="bg-[#fafafa] p-6 rounded-2xl shadow-sm border border-gray-100 xl:col-span-2 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-[17px] font-bold text-gray-800">Total Revenue Chart <span className="text-gray-300 font-light mx-2">|</span></h3>
              <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1cabb1]"></span>
                  {revenueLegends.thisYear || 'This year'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span>
                  {revenueLegends.lastYear || 'Last year'}
                </div>
              </div>
            </div>
            {loadingRevenue && <Loader2 size={16} className="animate-spin text-[#1cabb1]" />}
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 13}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 13}} 
                  tickFormatter={(val) => val === 0 ? '₹0' : `₹${Math.round(val/1000)}K`} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  name={revenueLegends.thisYear || 'This year'} 
                  dataKey="thisYear" 
                  stroke="#1cabb1" 
                  strokeWidth={2.5} 
                  dot={false} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  name={revenueLegends.lastYear || 'Last year'} 
                  dataKey="lastYear" 
                  stroke="#64748b" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 4" 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loan Distributed Chart (API 3) */}
        <div className="bg-[#fafafa] p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] font-bold text-gray-800">Loan Distributed</h3>
              {loadingLoanChart && <Loader2 size={14} className="animate-spin text-[#1cabb1]" />}
            </div>
            <select 
              value={loanTimeFilter} 
              onChange={(e) => setLoanTimeFilter(e.target.value)}
              className="bg-[#f3f4f6] border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg focus:ring-[#1cabb1] focus:border-[#1cabb1] block px-3 py-1.5 outline-none cursor-pointer"
            >
              <option value="Today">Today</option>
              <option value="Weekly">This Week</option>
              <option value="Monthly">This Month</option>
              <option value="Yearly">This Year</option>
            </select>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedLoanData} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={(props) => {
                    const { x, y, payload } = props;
                    const lines = payload.value.split('\n');
                    return (
                      <g transform={`translate(${x},${y})`}>
                        {lines.map((line, index) => (
                          <text key={index} x={0} y={index * 12 + 10} textAnchor="middle" fill="#64748b" fontSize={10}>
                            {line}
                          </text>
                        ))}
                      </g>
                    );
                  }}
                  dy={10} 
                  width={60} 
                  interval={0}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  tickFormatter={(val) => val === 0 ? '0' : `₹${Math.round(val/1000)}k`} 
                />
                <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  name="Loan Amount"
                  radius={[10, 10, 10, 10]} 
                  barSize={16}
                  fill="#4b5563" 
                >
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    content={(props) => {
                      const { x, y, width, value, index } = props;
                      if (index === 1) {
                        return (
                          <g>
                            <rect x={x + width/2 - 16} y={y - 24} width={32} height={18} fill="#1cabb1" rx={9} ry={9} />
                            <text x={x + width / 2} y={y - 11} fill="white" textAnchor="middle" fontSize={10} fontWeight="bold">
                              {Math.round(value/1000)}k
                            </text>
                          </g>
                        );
                      }
                      return null;
                    }} 
                  />
                  {formattedLoanData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sales Contribution Pie Chart (API 4) */}
        <div className="bg-[#fafafa] p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] font-bold text-gray-800">Sales contribution of Services</h3>
              {loadingServices && <Loader2 size={14} className="animate-spin text-[#1cabb1]" />}
            </div>
            <select 
              value={servicesTimeFilter}
              onChange={(e) => setServicesTimeFilter(e.target.value)}
              className="bg-[#f3f4f6] border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg focus:ring-[#1cabb1] focus:border-[#1cabb1] block px-3 py-1.5 outline-none cursor-pointer"
            >
              <option value="Today">Today</option>
              <option value="Weekly">This Week</option>
              <option value="Monthly">This Month</option>
              <option value="Yearly">This Year</option>
            </select>
          </div>
          
          <div className="flex-1 flex items-center justify-center pt-2">
            <div className="h-[250px] w-full flex items-center">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    innerRadius={0}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.65;
                      const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                      const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                      return percent > 0.05 ? (
                        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      ) : null;
                    }}
                  >
                    {formattedPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-[40%] flex flex-col justify-center gap-2.5 pl-4">
                {formattedPieData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-[13px] font-medium text-gray-700">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></span>
                    <span className="truncate">{entry.name} ({entry.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Last 5 Actions Table */}
        <div className="bg-[#fafafa] p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-[17px] font-bold text-gray-800 mb-6">Last 5 Actions</h3>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-3 px-3 font-semibold text-gray-800 text-[15px] border-b border-gray-200 w-1/3">Time</th>
                  <th className="py-3 px-3 font-semibold text-gray-800 text-[15px] border-b border-gray-200 w-2/3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {actionsData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors border-b last:border-b-0 border-gray-100">
                    <td className="py-4 px-3 text-sm text-gray-700 whitespace-nowrap font-medium">{item.time}</td>
                    <td className="py-4 px-3 text-sm text-gray-700">{item.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
