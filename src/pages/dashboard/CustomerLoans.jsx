import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import WalletIllustration from '../../assets/wallet-illustration.png';

const tabs = ['All Loans', 'New Application', 'Active Loans', 'Completed Loans', 'Rejected Applications'];

const mockLoans = [];

const getStatusBadge = (status) => {
  switch (status) {
    case 'New':
      return <span className="px-5 py-1.5 rounded-md bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold">New</span>;
    case 'Active':
      return <span className="px-5 py-1.5 rounded-md bg-transparent border border-blue-400 text-blue-500 text-xs font-semibold">Active</span>;
    case 'Completed':
      return <span className="px-5 py-1.5 rounded-md bg-transparent border border-green-400 text-green-500 text-xs font-semibold">Completed</span>;
    case 'Rejected':
      return <span className="px-5 py-1.5 rounded-md bg-red-50 border border-red-300 text-[#ff4c4c] text-xs font-semibold">Rejected</span>;
    default:
      return null;
  }
};

const CustomerLoans = () => {
  const [activeTab, setActiveTab] = useState('All Loans');

  return (
    <div className="max-w-[1400px] w-full pb-10">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-[#225091] mb-2">Customers</h2>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span>Lead Management</span>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <Link to="/customers" className="hover:text-gray-800 transition-colors">Customers</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="text-[#225091]">Loans</span>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-[#e9fae7] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center overflow-hidden relative shadow-sm border border-[#d6efd4] mb-8">
        
        <div className="z-10 flex flex-col gap-10">
          {/* Top Stat */}
          <div>
            <div className="text-[15px] font-semibold text-gray-600 mb-1">Total Outstanding</div>
            <div className="text-[32px] md:text-[40px] font-bold text-[#225091] leading-tight tracking-tight mb-2">
              ₹51,500
            </div>
            <div className="text-[13px] font-bold text-[#225091]">
              2 Active Loans
            </div>
          </div>

          {/* Bottom Stat */}
          <div>
            <div className="text-[15px] font-semibold text-gray-600 mb-1">Total Loan Amount</div>
            <div className="text-[28px] md:text-[32px] font-bold text-gray-900 leading-tight tracking-tight">
              ₹1,03,000
            </div>
          </div>
        </div>

        {/* Illustration */}
        <div className="mt-8 md:mt-0 relative z-10 w-full max-w-[280px] md:max-w-[320px] self-end md:self-auto">
          <img 
            src={WalletIllustration} 
            alt="Wallet with Cash and Coins" 
            className="w-full h-auto object-contain drop-shadow-xl"
          />
        </div>
        
        {/* Decorative background shape */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-white/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
      </div>

      {/* Tabs */}
      <div className="bg-[#f5f6f8] rounded-xl p-1.5 inline-flex gap-1 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab 
                ? 'bg-[#225091] text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-200/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loan Cards List */}
      <div className="space-y-4 mb-8">
        {mockLoans.map((loan) => (
          <div key={loan.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            {/* Top Row: Product Info & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                  <img src={loan.image} alt={loan.product} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base mb-1.5">{loan.product}</h3>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>Application ID: <span className="text-gray-600 font-medium">{loan.appId}</span></div>
                    <div>Disbursed on: <span className="text-gray-600 font-medium">{loan.disbursedOn}</span></div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3 self-end md:self-start">
                {getStatusBadge(loan.status)}
                <Link to={`/customers/1/loans/${loan.id}`} className="text-[#225091] font-semibold text-[15px] hover:text-[#159a9f] transition-colors">
                  View Details
                </Link>
              </div>
            </div>

            {/* Middle Row & Bottom Row (Only for Active / Completed) */}
            {(loan.status === 'Active' || loan.status === 'Completed') && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                {/* Financial Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-center md:text-left">
                  <div>
                    <div className="text-sm text-gray-500 font-medium mb-2">Loan Amount</div>
                    <div className="text-[17px] font-bold text-gray-900">{loan.loanAmount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-medium mb-2">Outstanding</div>
                    <div className="text-[17px] font-bold text-gray-900">{loan.outstanding}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-medium mb-2">EMI Amount</div>
                    <div className="text-[17px] font-bold text-gray-900">{loan.emiAmount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-medium mb-2">Next EMI Due Date</div>
                    <div className="text-[17px] font-bold text-gray-900">{loan.nextEmiDate}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="text-sm font-bold text-gray-800 mb-2">Loan Progress</div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-semibold text-gray-500">{loan.progressPercent}% Completed</span>
                    <span className="text-xs font-medium text-gray-500">{loan.progressText}</span>
                  </div>
                  <div className="w-full bg-[#f4f3fb] rounded-full h-1.5">
                    <div 
                      className="bg-[#225091] h-1.5 rounded-full" 
                      style={{ width: `${loan.progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-800 font-medium">
        <div className="mb-4 sm:mb-0">
          Showing 1 to 4 of 30 Entries
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#225091] text-[#225091] hover:bg-teal-50 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#225091] text-white font-medium shadow-sm">
            1
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#225091] text-[#225091] font-medium hover:bg-teal-50 transition-colors">
            2
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#225091] text-[#225091] font-medium hover:bg-teal-50 transition-colors">
            3
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#225091] text-[#225091] hover:bg-teal-50 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default CustomerLoans;
