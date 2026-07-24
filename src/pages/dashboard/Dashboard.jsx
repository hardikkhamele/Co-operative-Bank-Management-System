import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LabelList
} from 'recharts';
import { Users, Banknote, Landmark, CreditCard, Wallet, Eye } from 'lucide-react';

const statsData = [
  { title: 'Total Leads', value: '30,67,498', change: '+3.7 %', color: 'bg-[#00c5d5]', icon: <Users size={20} /> },
  { title: 'Total Loan Distributed', value: '₹102,50,98,764', change: '-1.7 %', color: 'bg-[#b68962]', icon: <Banknote size={20} /> },
  { title: 'Collection Pending', value: '₹50,98,764', change: '-1.7 %', color: 'bg-[#f48b29]', icon: <CreditCard size={20} /> },
  { title: 'Total Revenue', value: '₹12,98,764', change: '-1.7 %', color: 'bg-[#3bc454]', icon: <Wallet size={20} /> },
  { title: 'Total Branch', value: '510', change: '-1.7 %', color: 'bg-[#6154ff]', icon: <Landmark size={20} /> },
  { title: 'Total Staff', value: '8,764', change: '-1.7 %', color: 'bg-[#d926e9]', icon: <Users size={20} /> },
];

const revenueData = [
  { name: 'Jan', thisYear: 28000, lastYear: 18000 },
  { name: 'Feb', thisYear: 20000, lastYear: 32000 },
  { name: 'Mar', thisYear: 22000, lastYear: 29000 },
  { name: 'Apr', thisYear: 31000, lastYear: 42000 },
  { name: 'May', thisYear: 30000, lastYear: 51000 },
  { name: 'Jun', thisYear: 45000, lastYear: 21000 },
  { name: 'Jul', thisYear: 85000, lastYear: 20000 },
  { name: 'Aug', thisYear: 110000, lastYear: 33000 },
  { name: 'Sep', thisYear: 60000, lastYear: 25000 },
  { name: 'Oct', thisYear: 70000, lastYear: 85000 },
  { name: 'Nov', thisYear: 40000, lastYear: 90000 },
  { name: 'Dec', thisYear: 65000, lastYear: 115000 },
];

const loanSalesData = [
  { name: 'Mobiles\non EMI', value: 200000 },
  { name: 'Electronics\non EMI', value: 53000, fill: '#1cabb1' },
  { name: 'Two Wheeler\nLoan', value: 80000 },
  { name: 'Used Car\nLoan', value: 160000 },
  { name: 'New\nCar\n...', value: 120000 },
];

const pieData = [
  { name: 'Loan', value: 8, color: '#f48b29' },
  { name: 'Service 2', value: 13, color: '#3bc454' },
  { name: 'Service 3', value: 12, color: '#c424ed' },
  { name: 'Service 4', value: 18, color: '#ffcc00' },
  { name: 'Service 5', value: 10, color: '#107eff' },
  { name: 'Service 6', value: 12, color: '#00ced1' },
  { name: 'Service 7', value: 7, color: '#6154ff' },
  { name: 'Service 8', value: 10, color: '#ff3c3c' },
  { name: 'Service 9', value: 10, color: '#a07753' },
];

const actionsData = [
  { time: '6:35 AM', action: 'Lorem ipsum dolor sit amet consectetur.' },
  { time: '6:33 AM', action: 'Lorem ipsum dolor sit amet consectetur.' },
  { time: '6:32 AM', action: 'Lorem ipsum dolor sit amet consectetur.' },
  { time: '6:31 AM', action: 'Lorem ipsum dolor sit amet consectetur.' },
  { time: '6:30 AM', action: 'Lorem ipsum dolor sit amet consectetur.' },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="font-semibold text-gray-800">{payload[0].payload.name}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Top Section - EMI Card / Verification Credit */}
      <div className="flex justify-end mb-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden">
          <div className="px-6 py-4 border-r border-gray-100 text-center">
            <div className="text-[13px] text-gray-500 font-medium mb-1">EMI Card</div>
            <div className="text-xl font-bold text-gray-800">4,200</div>
          </div>
          <div className="px-6 py-4 text-center">
            <div className="text-[13px] text-gray-500 font-medium mb-1">Verification Credit</div>
            <div className="text-xl font-bold text-gray-800">8,400</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsData.map((stat, idx) => (
          <div key={idx} className={`${stat.color} rounded-xl p-5 text-white shadow-sm flex flex-col justify-between h-[130px]`}>
            <div className="flex justify-between items-start">
              <span className="text-[15px] font-medium">{stat.title}</span>
              <div className="opacity-90">{stat.icon}</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm font-medium">
                This Month <span className="ml-1">{stat.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-[#fafafa] p-6 rounded-2xl shadow-sm border border-gray-100 xl:col-span-2">
          <div className="flex items-center gap-6 mb-6">
            <h3 className="text-[17px] font-bold text-gray-800">Total Revenue Chart <span className="text-gray-300 font-light mx-2">|</span></h3>
            <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#1cabb1]"></span>This year</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span>Last year</div>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} tickFormatter={(val) => val === 0 ? '₹0' : `₹${val/1000}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="thisYear" stroke="#1cabb1" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="lastYear" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loan Sales Chart */}
        <div className="bg-[#fafafa] p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[17px] font-bold text-gray-800">Loan Sales Chart</h3>
            <select className="bg-[#f3f4f6] border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#1cabb1] focus:border-[#1cabb1] block px-3 py-1.5 outline-none">
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loanSalesData} margin={{ top: 20, right: 0, left: -20, bottom: 20 }}>
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
                          <text key={index} x={0} y={index * 12 + 10} dy={0} textAnchor="middle" fill="#64748b" fontSize={10}>
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
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => val === 0 ? '0' : `₹${val/1000}k`} />
                <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  radius={[10, 10, 10, 10]} 
                  barSize={16}
                  fill="#4b5563" 
                >
                  <LabelList dataKey="value" position="top" content={(props) => {
                    const { x, y, width, value, index } = props;
                    if (index === 1) {
                      return (
                        <g>
                           <rect x={x + width/2 - 14} y={y - 24} width={28} height={18} fill="#1cabb1" rx={9} ry={9} />
                           <text x={x + width / 2} y={y - 11} fill="white" textAnchor="middle" fontSize={10} fontWeight="bold">
                             {Math.round(value/1000)}k
                           </text>
                        </g>
                      );
                    }
                    return null;
                  }} />
                  {loanSalesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || '#4b5563'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-[#fafafa] p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[17px] font-bold text-gray-800">Sales contribution of Services</h3>
            <select className="bg-[#f3f4f6] border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#1cabb1] focus:border-[#1cabb1] block px-3 py-1.5 outline-none">
              <option>Today</option>
              <option>This Week</option>
            </select>
          </div>
          <div className="flex-1 flex items-center justify-center pt-4">
            <div className="h-[250px] w-full flex">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={0}
                    dataKey="value"
                    stroke="none"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.65;
                      const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                      const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                      return percent > 0.05 ? (
                        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={500}>
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      ) : null;
                    }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-[40%] flex flex-col justify-center gap-2.5 pl-4">
                {pieData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-[13px] font-medium text-gray-700">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Table */}
        <div className="bg-[#fafafa] p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-[17px] font-bold text-gray-800 mb-6">Last 5 Actions</h3>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-3 px-2 font-semibold text-gray-800 text-[15px] border-b border-gray-200">Time</th>
                  <th className="py-3 px-2 font-semibold text-gray-800 text-[15px] border-b border-gray-200">Actions</th>
                  <th className="py-3 px-2 font-semibold text-gray-800 text-[15px] text-right border-b border-gray-200">View</th>
                </tr>
              </thead>
              <tbody>
                {actionsData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors border-b last:border-b-0 border-gray-100">
                    <td className="py-4 px-2 text-sm text-gray-700 whitespace-nowrap">{item.time}</td>
                    <td className="py-4 px-2 text-sm text-gray-700">{item.action}</td>
                    <td className="py-4 px-2 text-right">
                      <button className="text-[#1c3f94] hover:text-blue-900 border border-[#1c3f94] p-1 rounded-full transition-colors inline-flex">
                        <Eye size={16} />
                      </button>
                    </td>
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

