import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Calendar, Phone, Mail, MapPin, DollarSign, Wallet, ArrowDownCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockHistory = [
  { id: 1, srNo: 1, date: '15/07/2026', amount: '42,000', remarks: 'Lorem ipsum dolor sit amet consectetur. Sit eu facilisis sodales lorem.' },
  { id: 2, srNo: 2, date: '16/07/2026', amount: '42,000', remarks: 'Lorem ipsum dolor sit amet consectetur. Dolor viverra ut nunc risus.' },
  { id: 3, srNo: 3, date: '17/07/2026', amount: '42,000', remarks: 'Lorem ipsum dolor sit amet consectetur. Nibh amet aenean lectus lacus elit.' },
  { id: 4, srNo: 4, date: '18/07/2026', amount: '42,000', remarks: 'Lorem ipsum dolor sit amet consectetur. Congue nisl pulvinar maecenas consequat orci blandit amet tortor convallis.' },
  { id: 5, srNo: 5, date: '19/07/2026', amount: '42,000', remarks: 'Lorem ipsum dolor sit amet consectetur. Faucibus feugiat nec.' },
];

const ViewCashPayment = () => {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-semibold text-[#1b2559] mb-2">View Details</h1>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-[#1b2559] transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1" />
          <Link to="/cash-payment" className="hover:text-[#1b2559] transition-colors">Cash Payment</Link>
          <ChevronRight size={16} className="mx-1" />
          <Link to="/cash-payment" className="hover:text-[#1b2559] transition-colors">Cash Payment</Link>
          <ChevronRight size={16} className="mx-1" />
          <span className="text-[#1b2559]">View Details</span>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-4 border-gray-50">
          <img src="https://ui-avatars.com/api/?name=Clark+Kent&background=random" alt="Clark Kent" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-[#1b2559]">Clark Kent</h2>
          <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mt-1 mb-3 w-max">
            Collection Executive
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 font-medium">
            <div className="flex items-center gap-1.5">
              <Phone size={16} className="text-[#1cabb1]" />
              <span>9876543210</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail size={16} className="text-[#1cabb1]" />
              <span>example@mail.com</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={16} className="text-[#1cabb1]" />
              <span>Mumbai Branch</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#1b84ff] rounded-2xl p-6 text-white shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Wallet size={64} />
          </div>
          <span className="text-sm font-semibold opacity-90 z-10 mb-2">Total Cash Collected</span>
          <span className="text-3xl font-bold z-10">₹50,98,764</span>
        </div>
        
        <div className="bg-[#17c653] rounded-2xl p-6 text-white shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <ArrowDownCircle size={64} />
          </div>
          <span className="text-sm font-semibold opacity-90 z-10 mb-2">Total Cash Submitted</span>
          <span className="text-3xl font-bold z-10">₹30,98,764</span>
        </div>
        
        <div className="bg-[#ff8f00] rounded-2xl p-6 text-white shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <DollarSign size={64} />
          </div>
          <span className="text-sm font-semibold opacity-90 z-10 mb-2">Total Cash Pending</span>
          <span className="text-3xl font-bold z-10">₹20,00,000</span>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={() => setIsSubmitModalOpen(true)}
          className="bg-[#1b58a6] hover:bg-[#154685] text-white px-6 py-2.5 rounded-full font-semibold transition-colors text-sm shadow-sm"
        >
          Submit Cash
        </button>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-[#1b2559]">Cash Submit History</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-[#4b5563]" />
              </div>
              <input
                type="text"
                value="15/07/2026"
                readOnly
                className="block w-[135px] pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] text-sm text-[#4b5563] bg-white font-medium"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-[#4b5563]" />
              </div>
              <input
                type="text"
                value="19/07/2026"
                readOnly
                className="block w-[135px] pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] text-sm text-[#4b5563] bg-white font-medium"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f4f3fb] text-[#4b5563] font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Sr. No.</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount Summitted</th>
                <th className="px-6 py-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700">{item.srNo}</td>
                  <td className="px-6 py-4 text-gray-700">{item.date}</td>
                  <td className="px-6 py-4 text-gray-700">₹{item.amount}</td>
                  <td className="px-6 py-4 text-gray-700 whitespace-normal min-w-[350px]">{item.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[14px] font-semibold text-[#1b2559]">Showing 1 to 8 of 30 Entries</span>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1cabb1] bg-[#1cabb1] text-white font-bold shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 transition-colors">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 transition-colors">
              3
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Submit Cash Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 pb-2 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#1b2559]">Submit Cash</h2>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 pt-4 space-y-5">
              <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-2">Date</label>
                <div className="relative">
                  <input 
                    type="text" 
                    defaultValue="23/07/2026"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-gray-50 text-[15px] text-[#4b5563]" 
                    readOnly
                  />
                  <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-2">Amount</label>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="Enter Amount"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-[#4b5563] appearance-none" 
                    style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[14px] font-semibold text-gray-700 mb-2">Remarks</label>
                <textarea 
                  rows="4" 
                  placeholder="Enter remarks..." 
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-[#4b5563] resize-none"
                ></textarea>
              </div>
              
              <div className="flex justify-end items-center gap-3 mt-6 pt-4">
                <button 
                  onClick={() => setIsSubmitModalOpen(false)} 
                  className="px-6 py-2.5 rounded-full border-[1.5px] border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors text-[14px] bg-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setIsSubmitModalOpen(false)} 
                  className="px-6 py-2.5 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-[14px]"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ViewCashPayment;
