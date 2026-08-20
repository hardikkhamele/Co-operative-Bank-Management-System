import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LabelList
} from 'recharts';
import { Users, Banknote, Landmark, CreditCard, Wallet, Loader2, MapPin, ChevronDown } from 'lucide-react';
import { dashboardService } from '../../api/dashboardService';
import useBranchStore from '../../store/branchStore';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="font-semibold text-gray-800 mb-1">{label || payload[0].payload.name || payload[0].payload.rawCategory}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || '#225091' }} className="text-sm font-medium">
            {entry.name}: {typeof entry.value === 'number' ? `₹${entry.value.toLocaleString()}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { globalBranchId, setGlobalBranchId, branchOptions } = useBranchStore();

  // 1. Stats State
  const [stats, setStats] = useState({});
  const [loadingStats, setLoadingStats] = useState(false);

  // 2. Revenue Chart State
  const [revenueData, setRevenueData] = useState([]);
  const [revenueLegends, setRevenueLegends] = useState({ thisYear: 'This year', lastYear: 'Last year' });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  // 3. Loan Distributed Chart State
  const [loanCategories, setLoanCategories] = useState([]);
  const [loanTimeFilter, setLoanTimeFilter] = useState('Today');
  const [loadingLoanChart, setLoadingLoanChart] = useState(false);

  // 4. Services Sales Contribution State
  const [servicesData, setServicesData] = useState([]);
  const [servicesTimeFilter, setServicesTimeFilter] = useState('Today');
  const [loadingServices, setLoadingServices] = useState(false);

  // 5. Actions Data State
  const [actionsData, setActionsData] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // 1. Fetch Stats Cards (API 1)
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await dashboardService.getStats({ branchId: globalBranchId, timeFilter: 'Today' });
      if (res && res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Dashboard stats fallback:', err.message);
    } finally {
      setLoadingStats(false);
    }
  }, [globalBranchId]);

  // 2. Fetch Revenue Comparison (API 2)
  const fetchRevenue = useCallback(async () => {
    try {
      setLoadingRevenue(true);
      const res = await dashboardService.getRevenueChart({ year: selectedYear, branchId: globalBranchId });
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
  }, [selectedYear, globalBranchId]);

  // 3. Fetch Loan Distributed (API 3)
  const fetchLoanDistributed = useCallback(async () => {
    try {
      setLoadingLoanChart(true);
      const res = await dashboardService.getLoanDistributedChart({ timeFilter: loanTimeFilter, branchId: globalBranchId });
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
  }, [loanTimeFilter, globalBranchId]);

  // 4. Fetch Services Contribution (API 4)
  const fetchServicesStats = useCallback(async () => {
    try {
      setLoadingServices(true);
      const res = await dashboardService.getServicesStats({ timeFilter: servicesTimeFilter, branchId: globalBranchId });
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
  }, [servicesTimeFilter, globalBranchId]);

  // 5. Fetch Overview (API 5)
  const fetchOverview = useCallback(async () => {
    try {
      setLoadingOverview(true);
      const res = await dashboardService.getOverview({ branchId: globalBranchId });
      if (res && res.success && res.data) {
        if (Array.isArray(res.data.actions)) {
          setActionsData(res.data.actions);
        } else if (Array.isArray(res.data)) {
          setActionsData(res.data);
        }
      }
    } catch (err) {
      console.warn('Dashboard overview fallback:', err.message);
    } finally {
      setLoadingOverview(false);
    }
  }, [globalBranchId]);

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

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

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
      fill: '#225091'
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
      value: stats.totalLeads?.formattedCount || (stats.totalLeads?.count != null ? stats.totalLeads.count.toLocaleString('en-IN') : '0'),
      change: stats.totalLeads?.changeText || `${stats.totalLeads?.percentageChange != null ? (stats.totalLeads.percentageChange > 0 ? '+' : '') + stats.totalLeads.percentageChange + '%' : '0%'}`,
      icon: <Users size={20} />,
      path: '/leads'
    },
    {
      title: stats.totalLoanDistributed?.title || 'Total Loan Distributed',
      value: stats.totalLoanDistributed?.formattedAmount || (stats.totalLoanDistributed?.amount != null ? `₹${stats.totalLoanDistributed.amount.toLocaleString('en-IN')}` : '₹0'),
      change: stats.totalLoanDistributed?.changeText || `${stats.totalLoanDistributed?.percentageChange != null ? (stats.totalLoanDistributed.percentageChange > 0 ? '+' : '') + stats.totalLoanDistributed.percentageChange + '%' : '0%'}`,
      icon: <Banknote size={20} />,
      path: '/dashboard'
    },
    {
      title: stats.collectionPending?.title || 'Collection Pending',
      value: stats.collectionPending?.formattedAmount || (stats.collectionPending?.amount != null ? `₹${stats.collectionPending.amount.toLocaleString('en-IN')}` : '₹0'),
      change: stats.collectionPending?.changeText || `${stats.collectionPending?.percentageChange != null ? (stats.collectionPending.percentageChange > 0 ? '+' : '') + stats.collectionPending.percentageChange + '%' : '0%'}`,
      icon: <CreditCard size={20} />,
      path: '/debit'
    },
    {
      title: stats.totalRevenue?.title || 'Total Revenue',
      value: stats.totalRevenue?.formattedAmount || (stats.totalRevenue?.amount != null ? `₹${stats.totalRevenue.amount.toLocaleString('en-IN')}` : '₹0'),
      change: stats.totalRevenue?.changeText || `${stats.totalRevenue?.percentageChange != null ? (stats.totalRevenue.percentageChange > 0 ? '+' : '') + stats.totalRevenue.percentageChange + '%' : '0%'}`,
      icon: <Wallet size={20} />,
      path: '/credit'
    },
    {
      title: stats.totalBranch?.title || 'Total Branch',
      value: stats.totalBranch?.formattedCount || (stats.totalBranch?.count != null ? stats.totalBranch.count.toLocaleString('en-IN') : '0'),
      change: stats.totalBranch?.changeText || `${stats.totalBranch?.percentageChange != null ? (stats.totalBranch.percentageChange > 0 ? '+' : '') + stats.totalBranch.percentageChange + '%' : '0%'}`,
      icon: <Landmark size={20} />,
      path: '/branch'
    },
    {
      title: stats.totalStaff?.title || 'Total Staff',
      value: stats.totalStaff?.formattedCount || (stats.totalStaff?.count != null ? stats.totalStaff.count.toLocaleString('en-IN') : '0'),
      change: stats.totalStaff?.changeText || `${stats.totalStaff?.percentageChange != null ? (stats.totalStaff.percentageChange > 0 ? '+' : '') + stats.totalStaff.percentageChange + '%' : '0%'}`,
      icon: <Users size={20} />,
      path: '/employees'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Section - Title & Credits */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div className="flex flex-col gap-3">
          <div className="relative w-max min-w-[220px]">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
              <MapPin size={16} className="text-brand-primary" />
            </div>
            <select
              value={globalBranchId}
              onChange={(e) => setGlobalBranchId(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all appearance-none text-[14px] font-medium shadow-sm cursor-pointer hover:border-gray-300"
            >
              <option value="" className="text-gray-800">All Branches</option>
              {branchOptions.map((br) => (
                <option key={br.id} value={br.id} className="text-gray-800">
                  {br.name || br.branchName}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <h2 className="text-xl font-bold text-text-heading">Overview</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden">
          <div className="px-6 py-4 border-r border-gray-100 text-center min-w-[130px]">
            <div className="text-[13px] text-gray-500 font-medium mb-1">
              {stats.emiCard?.title || 'EMI Card'}
            </div>
            <div className="text-xl font-bold text-brand-primary-dark">
              {stats.emiCard?.formattedAvailable || (stats.emiCard?.available != null ? stats.emiCard.available.toLocaleString('en-IN') : '0')}
            </div>
          </div>
          <div className="px-6 py-4 text-center min-w-[150px]">
            <div className="text-[13px] text-gray-500 font-medium mb-1">
              {stats.verificationCredit?.title || 'Verification Credit'}
            </div>
            <div className="text-xl font-bold text-brand-primary-dark">
              {stats.verificationCredit?.formattedAvailable || (stats.verificationCredit?.available != null ? stats.verificationCredit.available.toLocaleString('en-IN') : '0')}
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
            className="bg-brand-bg-card border border-border-default rounded-xl p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)] flex flex-col justify-between h-[130px] hover:shadow-[0_4px_12px_rgba(16,24,40,0.08)] transition-all duration-300 block cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <span className="text-[14px] font-medium text-text-muted">{stat.title}</span>
              <div className="p-2 rounded-lg bg-brand-light text-brand-primary shadow-sm">
                {stat.icon}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1 tracking-tight text-text-heading">{stat.value}</div>
              <div className="text-[13px] font-medium flex items-center gap-1.5 mt-1 text-text-muted">
                <span className={`px-2 py-0.5 rounded-md font-semibold ${
                  stat.change.startsWith('+') ? 'bg-semantic-success-light text-semantic-success' :
                  stat.change.startsWith('-') ? 'bg-semantic-danger-light text-semantic-danger' :
                  'bg-brand-surface text-text-muted'
                }`}>{stat.change}</span>
                <span>{stat.change.includes('This Month') ? '' : ' This Month'}</span>
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
                  <span className="w-2.5 h-2.5 rounded-full bg-[#225091]"></span>
                  {revenueLegends.thisYear || 'This year'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A9BDD3]"></span>
                  {revenueLegends.lastYear || 'Last year'}
                </div>
              </div>
            </div>
            {loadingRevenue && <Loader2 size={16} className="animate-spin text-brand-primary" />}
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData.length ? revenueData : []} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
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
                {revenueData.length > 0 ? (
                  <>
                    <Line 
                      type="monotone" 
                      name={revenueLegends.thisYear || 'This year'} 
                      dataKey="thisYear" 
                      stroke="#225091" 
                      strokeWidth={2.5} 
                      dot={false} 
                      activeDot={{ r: 6 }} 
                    />
                    <Line 
                      type="monotone" 
                      name={revenueLegends.lastYear || 'Last year'} 
                      dataKey="lastYear" 
                      stroke="#A9BDD3" 
                      strokeWidth={1.5} 
                      strokeDasharray="4 4" 
                      dot={false} 
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No revenue data available</div>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loan Distributed Chart (API 3) */}
        <div className="bg-[#fafafa] p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] font-bold text-gray-800">Loan Distributed</h3>
              {loadingLoanChart && <Loader2 size={14} className="animate-spin text-brand-primary" />}
            </div>
            <select 
              value={loanTimeFilter} 
              onChange={(e) => setLoanTimeFilter(e.target.value)}
              className="bg-[#f3f4f6] border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg focus:ring-brand-primary focus:border-brand-primary block px-3 py-1.5 outline-none cursor-pointer"
            >
              <option value="Today">Today</option>
              <option value="Weekly">This Week</option>
              <option value="Monthly">This Month</option>
              <option value="Yearly">This Year</option>
            </select>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {formattedLoanData.length > 0 ? (
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
                    fill="#225091" 
                  >
                    <LabelList 
                      dataKey="value" 
                      position="top" 
                      content={(props) => {
                        const { x, y, width, value, index } = props;
                        if (index === 1) {
                          return (
                            <g>
                              <rect x={x + width/2 - 16} y={y - 24} width={32} height={18} fill="#225091" rx={9} ry={9} />
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
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <span className="text-gray-400 font-medium">No loan distribution data available</span>
                </div>
              )}
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
              {loadingServices && <Loader2 size={14} className="animate-spin text-brand-primary" />}
            </div>
            <select 
              value={servicesTimeFilter}
              onChange={(e) => setServicesTimeFilter(e.target.value)}
              className="bg-[#f3f4f6] border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg focus:ring-brand-primary focus:border-brand-primary block px-3 py-1.5 outline-none cursor-pointer"
            >
              <option value="Today">Today</option>
              <option value="Weekly">This Week</option>
              <option value="Monthly">This Month</option>
              <option value="Yearly">This Year</option>
            </select>
          </div>
          
          <div className="flex-1 flex items-center justify-center pt-2">
            <div className="h-[250px] w-full flex items-center">
              {formattedPieData.length > 0 ? (
                <>
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
                </>
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400 font-medium">
                  No services data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Last 5 Actions Table */}
        <div className="bg-[#fafafa] p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[17px] font-bold text-gray-800">Last 5 Actions</h3>
            {loadingOverview && <Loader2 size={14} className="animate-spin text-brand-primary" />}
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-3 px-3 font-bold text-[15px] border-b border-gray-200 w-1/3">Time</th>
                  <th className="py-3 px-3 font-bold text-[15px] border-b border-gray-200 w-2/3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {actionsData.length > 0 ? (
                  actionsData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors border-b last:border-b-0 border-gray-100">
                      <td className="py-4 px-3 text-sm text-gray-700 whitespace-nowrap font-medium">{item.time}</td>
                      <td className="py-4 px-3 text-sm text-gray-700">{item.action}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="py-8 text-center text-gray-400 font-medium text-sm">
                      No recent actions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
