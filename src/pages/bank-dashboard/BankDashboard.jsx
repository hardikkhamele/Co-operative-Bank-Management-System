import React from 'react';
import { Users, CreditCard, Building2, TrendingUp } from 'lucide-react';

const BankDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back to Co-operative Bank portal</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Customers" value="1,245" trend="+12%" icon={Users} color="bg-blue-500" />
        <StatCard title="Active Loans" value="842" trend="+5%" icon={CreditCard} color="bg-green-500" />
        <StatCard title="Total Branches" value="12" trend="0%" icon={Building2} color="bg-purple-500" />
        <StatCard title="Total Revenue" value="$2.4M" trend="+18%" icon={TrendingUp} color="bg-orange-500" />
      </div>

      {/* Placeholder for charts/tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96 flex flex-col">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Loan Distribution</h2>
              <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                  <span className="text-gray-400 font-medium">Chart Area</span>
              </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96 flex flex-col">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h2>
              <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                  <span className="text-gray-400 font-medium">Table Area</span>
              </div>
          </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-14 h-14 rounded-full ${color} text-white flex items-center justify-center shrink-0 shadow-sm`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <span className={`text-xs font-semibold ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
          {trend}
        </span>
      </div>
    </div>
  </div>
);

export default BankDashboard;
