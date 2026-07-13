import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, 
  BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { Users, Briefcase, Eye } from 'lucide-react';

const statsData = [
  { title: 'Total Customer', value: '30,67,498', change: '+3.7 %', color: 'bg-[#b68962]', icon: <Users size={18} /> },
  { title: 'Total Revenue', value: '₹50,98,764', change: '-1.7 %', color: 'bg-[#c623ec]', icon: <Briefcase size={18} /> },
  { title: 'Total Regional Manager', value: '8', change: '-1.7 %', color: 'bg-[#a855f7]', icon: <Briefcase size={18} /> },
  { title: 'Total Branch Manager', value: '800', change: '-1.7 %', color: 'bg-[#1b7ef7]', icon: <Briefcase size={18} /> },
  { title: 'Total Collection Manager', value: '1600', change: '+3.7 %', color: 'bg-[#32c965]', icon: <Briefcase size={18} /> },
  { title: 'Total Employees', value: '16,000', change: '-1.7 %', color: 'bg-[#f77b1b]', icon: <Briefcase size={18} /> },
  
  { title: 'Tele-caller', value: '800', change: '-1.7 %', color: 'bg-[#1b7ef7]', icon: <Users size={18} /> },
  { title: 'Sales Executive', value: '8', change: '-1.7 %', color: 'bg-[#a855f7]', icon: <Users size={18} /> },
  { title: 'Field Verification Officer', value: '16,000', change: '-1.7 %', color: 'bg-[#f77b1b]', icon: <Users size={18} /> },
  { title: 'Credit Analyst', value: '1600', change: '+3.7 %', color: 'bg-[#32c965]', icon: <Users size={18} /> },
  
  { title: 'Operations Executive', value: '16,000', change: '-1.7 %', color: 'bg-[#f77b1b]', icon: <Users size={18} /> },
  { title: 'Disbursal Officer', value: '1600', change: '+3.7 %', color: 'bg-[#32c965]', icon: <Users size={18} /> },
  { title: 'Collection Agent', value: '800', change: '-1.7 %', color: 'bg-[#1b7ef7]', icon: <Users size={18} /> },
  { title: 'Collection Manager', value: '8', change: '-1.7 %', color: 'bg-[#a855f7]', icon: <Users size={18} /> },
  
  { title: 'Customer Support Exe.', value: '1600', change: '+3.7 %', color: 'bg-[#32c965]', icon: <Users size={18} /> },
  { title: 'Audit / Compliance User', value: '16,000', change: '-1.7 %', color: 'bg-[#f77b1b]', icon: <Users size={18} /> },
  { title: 'Collection Manager', value: '8', change: '-1.7 %', color: 'bg-[#a855f7]', icon: <Users size={18} /> },
  { title: 'Collection Agent', value: '800', change: '-1.7 %', color: 'bg-[#1b7ef7]', icon: <Users size={18} /> },
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
  { name: 'Mobiles on EMI', value: 200000 },
  { name: 'Electronics on EMI', value: 53000, fill: '#1cabb1' }, // Highlighted
  { name: 'Two Wheeler Loan', value: 80000 },
  { name: 'Used Car Loan', value: 160000 },
  { name: 'New Car', value: 120000 },
];

const pieData = [
  { name: 'Service 1', value: 8, color: '#FF9F40' },
  { name: 'Service 2', value: 13, color: '#32c965' },
  { name: 'Service 3', value: 12, color: '#c623ec' },
  { name: 'Service 4', value: 18, color: '#FFCE56' },
  { name: 'Service 5', value: 10, color: '#1b7ef7' },
  { name: 'Service 6', value: 12, color: '#00bcd4' },
  { name: 'Service 7', value: 7, color: '#7c5aff' },
  { name: 'Service 8', value: 10, color: '#ff3d67' },
  { name: 'Service 9', value: 10, color: '#A07753' },
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
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statsData.map((stat, idx) => (
          <div key={idx} className={`${stat.color} rounded-2xl p-5 text-white shadow-sm relative overflow-hidden group`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium opacity-90">{stat.title}</span>
              <div className="opacity-80">{stat.icon}</div>
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-xs font-medium opacity-90">
              This Month <span className="ml-1">{stat.change}</span>
            </div>
            {/* Decorative background circle */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white opacity-10 rounded-full group-hover:scale-110 transition-transform"></div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 xl:col-span-2">
          <div className="flex items-center gap-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800">Total Revenue Chart</h3>
            <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1cabb1]"></span>This year</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span>Last year</div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `${val/1000}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="thisYear" stroke="#1cabb1" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="lastYear" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loan Sales Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Loan Sales Chart</h3>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#1cabb1] focus:border-[#1cabb1] block px-3 py-1.5 outline-none">
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loanSalesData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} width={60} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  radius={[10, 10, 10, 10]} 
                  barSize={20}
                  fill="#475569" 
                >
                  {loanSalesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || '#475569'} />
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Sales contribution of Services</h3>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#1cabb1] focus:border-[#1cabb1] block px-3 py-1.5 outline-none">
              <option>Today</option>
              <option>This Week</option>
            </select>
          </div>
          <div className="flex-1 flex items-center">
            <div className="h-[280px] w-full flex">
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
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
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
              <div className="w-[40%] flex flex-col justify-center gap-3 pl-4">
                {pieData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Last 5 Actions</h3>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-50/50">
                  <th className="py-4 px-4 font-semibold text-gray-700 text-sm rounded-tl-xl rounded-bl-xl">Time</th>
                  <th className="py-4 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                  <th className="py-4 px-4 font-semibold text-gray-700 text-sm text-right rounded-tr-xl rounded-br-xl">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {actionsData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 text-sm text-gray-600 font-medium whitespace-nowrap">{item.time}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{item.action}</td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-[#5a5ce5] hover:text-[#4a4ec4] hover:bg-[#5a5ce5]/10 p-2 rounded-full transition-colors inline-flex">
                        <Eye size={18} />
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
