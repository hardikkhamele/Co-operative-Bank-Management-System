import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, X, ChevronDown } from 'lucide-react';

const LoanDetails = () => {
  const { id, loanId } = useParams();
  
  const [loanStatus, setLoanStatus] = useState(() => {
    if (loanId === '2') return 'Active';
    if (loanId === '3') return 'Completed';
    if (loanId === '4') return 'Rejected';
    return 'New';
  });
  
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState([]);

  const toggleMonth = (month) => {
    setSelectedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month)
        : [...prev, month]
    );
  };
  
  return (
    <div className="space-y-6 max-w-[1200px] pb-10">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold text-[#1b7ef7] mb-2">Loan History</h1>
        <div className="flex items-center text-sm font-medium text-gray-600">
          <Link to="/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span>Lead Management</span>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <Link to="/customers" className="hover:text-gray-900 transition-colors">Customers</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <Link to={`/customers/${id || '1'}/loans`} className="hover:text-gray-900 transition-colors">Loan History</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="text-[#5a5ce5]">Loan Details</span>
        </div>
      </div>

      <div className="text-sm font-medium text-gray-700">
        Application Number: <span className="text-[#5a5ce5]">APPL15655946</span>
      </div>

      {/* Customer Profile Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shrink-0">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&h=150" alt="Amit Dutta" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Amit Dutta</h2>
            <div className="text-gray-500 font-medium">9876543210</div>
          </div>
        </div>
        <div className={`px-6 py-2 text-sm font-medium rounded-md border ${
          loanStatus === 'Active' ? 'bg-blue-50 text-[#5a5ce5] border-blue-200' :
          loanStatus === 'Completed' ? 'bg-green-50 text-[#00c950] border-green-300' :
          loanStatus === 'Rejected' ? 'bg-red-50 text-[#ff4c4c] border-red-300' :
          'bg-gray-200 text-gray-700 border-gray-300'
        }`}>
          {loanStatus}
        </div>
      </div>

      {/* Personal Information */}
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-[#f4f3fb] border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
        </div>
        <div className="p-6 space-y-4 bg-white">
          <div className="flex text-[15px] text-gray-800">
            <span className="w-40 font-semibold text-gray-600">Date Of Birth:</span>
            <span className="font-bold text-gray-800">10-7-1993</span>
          </div>
          <div className="flex text-[15px] text-gray-800">
            <span className="w-40 font-semibold text-gray-600">Gender:</span>
            <span className="font-bold text-gray-800">Male</span>
          </div>
          <div className="flex text-[15px] text-gray-800">
            <span className="w-40 font-semibold text-gray-600">PAN Number:</span>
            <span className="font-bold text-gray-800">ABCDE1234F</span>
          </div>
          <div className="flex text-[15px] text-gray-800">
            <span className="w-40 font-semibold text-gray-600">Aadhaar Number:</span>
            <span className="font-bold text-gray-800">1234 5678 9876</span>
          </div>
          <div className="flex text-[15px] text-gray-800">
            <span className="w-40 font-semibold text-gray-600">Address:</span>
            <span className="font-bold text-gray-800">3517 W. Gray St. Utica, India 57867</span>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-[#f4f3fb] border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Documents</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
          <div className="rounded-lg overflow-hidden flex items-center justify-center">
            {/* PAN Card placeholder */}
            <div className="w-full h-full bg-blue-100 flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-center p-2 bg-blue-50 border-b border-blue-200">
                    <div className="text-[10px] font-bold text-blue-900">INCOME TAX DEPARTMENT</div>
                    <div className="text-[10px] font-bold text-blue-900">GOVT. OF INDIA</div>
                </div>
                <div className="p-4 flex-1">
                    <div className="w-16 h-4 bg-blue-200 mb-2 rounded"></div>
                    <div className="w-24 h-4 bg-blue-200 mb-4 rounded"></div>
                    <div className="w-20 h-4 bg-blue-200 mb-1 rounded"></div>
                    <div className="w-32 h-4 bg-blue-200 rounded"></div>
                </div>
                <div className="absolute bottom-2 right-4 w-16 h-20 bg-white border border-gray-300 shadow-sm flex items-end justify-center rounded-sm">
                   <div className="w-12 h-12 bg-gray-200 rounded-t-full"></div>
                </div>
                <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay"></div>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden flex items-center justify-center">
            {/* Aadhaar Card placeholder */}
             <div className="w-full h-full flex flex-col relative bg-white border border-teal-400 rounded-lg">
                <div className="flex justify-between items-center p-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 px-4">
                        <div className="h-1.5 w-full bg-orange-500 mb-1"></div>
                        <div className="h-1.5 w-full bg-green-500"></div>
                    </div>
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center border border-yellow-300">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                    </div>
                </div>
                <div className="flex p-4 gap-4">
                    <div className="w-20 h-24 bg-gray-300 rounded-md overflow-hidden flex items-end justify-center border border-gray-400">
                        <div className="w-16 h-16 bg-gray-500 rounded-t-full"></div>
                    </div>
                    <div className="flex-1 space-y-3 pt-2">
                         <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                         <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                         <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
                         <div className="mt-4 font-bold tracking-widest text-gray-800 text-lg">
                             XXXX XXXX XXXX
                         </div>
                    </div>
                    <div className="w-20 h-20 bg-gray-100 border border-gray-300 p-1 self-end">
                        <div className="w-full h-full border border-gray-800 border-dashed opacity-100"></div>
                    </div>
                </div>
                <div className="h-1 w-full bg-red-500 mt-auto"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Information */}
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-[#f4f3fb] border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Loan Information</h3>
        </div>
        <div className="p-6 space-y-4 bg-white">
          <div className="flex text-[15px] text-gray-800">
            <span className="w-48 font-semibold text-gray-600">
              {loanStatus === 'New' || loanStatus === 'Rejected' ? 'Applied On:' : 'Disbursed On:'}
            </span>
            <span className="font-bold text-gray-800">10 Jan 2026</span>
          </div>
          <div className="flex text-[15px] text-gray-800">
            <span className="w-48 font-semibold text-gray-600">Loan Applied For:</span>
            <span className="font-bold text-gray-800">Smart Phone</span>
          </div>
          <div className="flex text-[15px] text-gray-800">
            <span className="w-48 font-semibold text-gray-600">Phone Details:</span>
            <span className="font-bold text-gray-800">iPhone 17 - 256GB - Black</span>
          </div>
          <div className="flex text-[15px] text-gray-800">
            <span className="w-48 font-semibold text-gray-600">Guarantor Name:</span>
            <span className="font-bold text-gray-800">Rohan Sharma</span>
          </div>
          <div className="flex text-[15px] text-gray-800">
            <span className="w-48 font-semibold text-gray-600">Guarantor Phone:</span>
            <span className="font-bold text-gray-800">+91 98765 43210</span>
          </div>
          
          {(loanStatus === 'New' || loanStatus === 'Rejected') && (
            <div className="flex text-[15px] text-gray-800">
              <span className="w-48 font-semibold text-gray-600">Status:</span>
              <span className={`font-medium ${loanStatus === 'Rejected' ? 'text-[#ff4c4c]' : 'text-gray-800 font-bold'}`}>
                {loanStatus}
              </span>
            </div>
          )}

          {(loanStatus === 'Active' || loanStatus === 'Completed') && (
            <div className="mt-6 max-w-sm">
              <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
                <h4 className="font-bold text-[15px] text-gray-900">Amount Info</h4>
                
                <div className="space-y-1.5 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Price:</span>
                    <span className="text-gray-900 font-medium">₹80,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">EMI Card Charges:</span>
                    <span className="text-gray-900 font-medium">+₹500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan Processing Fees:</span>
                    <span className="text-gray-900 font-medium">+₹200</span>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div className="space-y-1.5 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-bold">Total Amount:</span>
                    <span className="text-gray-900 font-bold">₹80,700</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Down Payment:</span>
                    <span className="text-[#ff4c4c] font-medium">-₹30,700</span>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div className="space-y-1.5 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-bold">Total Loan Amount:</span>
                    <span className="text-gray-900 font-bold">₹50,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan Interest (1%):</span>
                    <span className="text-gray-900 font-medium">+₹500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loan Insurance:</span>
                    <span className="text-gray-900 font-medium">+₹1000</span>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between text-[13px] mb-4">
                  <span className="text-gray-800 font-bold">Total Loan Amount:</span>
                  <span className="text-gray-900 font-bold">₹51,500</span>
                </div>

                <h4 className="font-bold text-[15px] text-gray-900 mt-4">EMI Info</h4>
                
                <div className="space-y-1.5 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Loan Amount:</span>
                    <span className="text-gray-900 font-medium">₹51,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">EMI Tenure:</span>
                    <span className="text-gray-900 font-medium">6 Months</span>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-800 font-bold">EMI Amount:</span>
                  <span className="text-gray-900 font-bold">₹8,583/Month</span>
                </div>
              </div>

              <div className="flex text-[15px] text-gray-800 mt-4">
                <span className="w-16 font-semibold text-gray-600">Status:</span>
                <span className={`font-medium ${loanStatus === 'Completed' ? 'text-[#00c950]' : 'text-[#5a5ce5]'}`}>
                  {loanStatus}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EMI Information (Only for Active) */}
      {loanStatus === 'Active' && (
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <div className="px-6 py-4 bg-[#f4f3fb] border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">EMI Information</h3>
          </div>
          <div className="p-6 space-y-4 bg-white">
            <div className="flex text-[15px] text-gray-800">
              <span className="w-32 font-semibold text-gray-600">EMI Tenure:</span>
              <span className="font-bold text-gray-800">6 Months (₹8,583/Month)</span>
            </div>
            
            <div className="space-y-3 pt-2 w-full max-w-sm">
              <div className="flex justify-between text-[15px] font-medium">
                <span className="text-gray-600 w-24">March:</span>
                <span className="text-gray-800 flex-1">₹8,583</span>
                <span className="text-[#00c950]">Paid</span>
              </div>
              <div className="flex justify-between text-[15px] font-medium">
                <span className="text-gray-600 w-24">April:</span>
                <span className="text-gray-800 flex-1">₹8,583</span>
                <span className="text-[#00c950]">Paid</span>
              </div>
              <div className="flex justify-between text-[15px] font-medium">
                <span className="text-gray-600 w-24">May:</span>
                <span className="text-gray-800 flex-1">₹8,583</span>
                <span className="text-[#00c950]">Paid</span>
              </div>
              <div className="flex justify-between text-[15px] font-medium">
                <span className="text-gray-600 w-24">June:</span>
                <span className="text-gray-800 flex-1">₹8,583</span>
                <span className="text-orange-500">Due</span>
              </div>
              <div className="flex justify-between text-[15px] font-medium">
                <span className="text-gray-600 w-24">July:</span>
                <span className="text-gray-800 flex-1">₹8,583</span>
                <span className="text-gray-500">Upcoming</span>
              </div>
              <div className="flex justify-between text-[15px] font-medium">
                <span className="text-gray-600 w-24">August:</span>
                <span className="text-gray-800 flex-1">₹8,583</span>
                <span className="text-gray-500">Upcoming</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buttons */}
      {(loanStatus === 'New' || loanStatus === 'Active') && (
        <div className="flex justify-end">
          {loanStatus === 'New' ? (
            <Link 
              to="/leads/setup-loan"
              className="inline-block bg-[#1cabb1] hover:bg-[#159a9f] text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-sm"
            >
              Setup Loan
            </Link>
          ) : (
            <button 
              onClick={() => setIsCollectModalOpen(true)}
              className="bg-[#1cabb1] hover:bg-[#159a9f] text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-sm"
            >
              Collect EMI
            </button>
          )}
        </div>
      )}

      {/* Loan Setup Modal */}
      {isSetupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-6 bg-[#f4f3fb]">
              <h2 className="text-xl font-bold text-[#1b2559]">Loan Setup</h2>
              <button onClick={() => setIsSetupModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <div className="px-6 pb-6 overflow-y-auto flex-1 space-y-6 bg-[#f4f3fb] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
              {/* Product Card */}
              <div className="border border-[#1cabb1] rounded-xl bg-white p-3 flex gap-4 shadow-sm items-center">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#1cabb1] bg-gray-50 flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=100&q=80" alt="iPhone 17" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-[15px]">iphone 17</h3>
                  <div className="text-sm text-gray-500">Black</div>
                  <div className="text-sm text-gray-500">256 GB ROM, 1 year warranty</div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Product Price</label>
                  <input type="text" defaultValue="₹80,000" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] text-gray-700 shadow-sm" />
                </div>
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">EMI Tenure (In Month)</label>
                  <input type="text" placeholder="Enter month" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] text-gray-700 shadow-sm" />
                </div>
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-1.5">Interest (%)</label>
                  <input type="text" placeholder="Enter interest" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] bg-white text-[15px] text-gray-700 shadow-sm" />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="w-5 h-5 rounded border border-[#1cabb1] bg-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-transparent border-b-2 border-r-2 border-[#1cabb1] transform rotate-45 mb-1"></div>
                  </div>
                  <span className="text-[15px] font-medium text-gray-800">Add EMI Card</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="w-5 h-5 rounded border border-[#1cabb1] bg-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-transparent border-b-2 border-r-2 border-[#1cabb1] transform rotate-45 mb-1"></div>
                  </div>
                  <span className="text-[15px] font-medium text-gray-800">Add Insurance</span>
                </label>
              </div>

              {/* Info Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-bold text-[16px] text-gray-900 mb-4">Amount Info</h3>
                
                <div className="space-y-2 text-[14px]">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Product Price:</span>
                    <span className="text-gray-900 font-medium">₹80,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">EMI Card Charges:</span>
                    <span className="text-gray-900 font-medium">+₹500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Loan Processing Fees:</span>
                    <span className="text-gray-900 font-medium">+₹200</span>
                  </div>
                </div>

                <hr className="my-3 border-gray-200" />

                <div className="space-y-2 text-[14px]">
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-bold">Total Amount:</span>
                    <span className="text-gray-900 font-bold">₹80,700</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Down Payment:</span>
                    <span className="text-[#ff4c4c] font-medium">-₹30,700</span>
                  </div>
                </div>

                <hr className="my-3 border-gray-200" />

                <div className="space-y-2 text-[14px]">
                  <div className="flex justify-between">
                    <span className="text-gray-800 font-bold">Total Loan Amount:</span>
                    <span className="text-gray-900 font-bold">₹50,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Loan Interest (1%):</span>
                    <span className="text-gray-900 font-medium">+₹500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Loan Insurance:</span>
                    <span className="text-gray-900 font-medium">+₹1000</span>
                  </div>
                </div>

                <hr className="my-3 border-gray-200" />

                <div className="flex justify-between text-[14px] mb-6">
                  <span className="text-gray-800 font-bold">Total Loan Amount:</span>
                  <span className="text-gray-900 font-bold">₹51,500</span>
                </div>

                <h3 className="font-bold text-[16px] text-gray-900 mb-4">EMI Info</h3>
                
                <div className="space-y-2 text-[14px]">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Total Loan Amount:</span>
                    <span className="text-gray-900 font-medium">₹51,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">EMI Tenure:</span>
                    <span className="text-gray-900 font-medium">6 Months</span>
                  </div>
                </div>

                <hr className="my-3 border-gray-200" />

                <div className="flex justify-between text-[14px]">
                  <span className="text-gray-800 font-bold">EMI Amount:</span>
                  <span className="text-gray-900 font-bold">₹8,583/Month</span>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 bg-[#f4f3fb] flex justify-end gap-4 rounded-b-2xl">
              <button 
                onClick={() => setIsSetupModalOpen(false)}
                className="py-2.5 px-8 rounded-full border-2 border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-[15px]"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsSetupModalOpen(false)}
                className="py-2.5 px-8 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#159a9f] transition-colors focus:outline-none text-[15px] shadow-sm"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collect EMI Modal */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-2xl w-full max-w-[450px] shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 pb-4">
              <h2 className="text-xl font-bold text-[#1b2559]">Collect EMI</h2>
              <button onClick={() => setIsCollectModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <div className="px-6 pb-6 relative">
              <label className="block text-[15px] font-semibold text-gray-900 mb-2">Select Month</label>
              
              <div 
                className="relative bg-white border border-gray-200 rounded-xl px-4 py-3 flex justify-between items-center cursor-pointer mb-6"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="text-gray-600 text-[15px]">June</span>
                <ChevronDown size={20} className="text-gray-500" />
              </div>

              {isDropdownOpen ? (
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 space-y-4 mb-6">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleMonth('June')}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedMonths.includes('June') ? 'border-[#1cabb1] bg-[#1cabb1]' : 'border-gray-400 bg-white'}`}>
                        {selectedMonths.includes('June') && <div className="w-2.5 h-2.5 bg-transparent border-b-2 border-r-2 border-white transform rotate-45 mb-0.5"></div>}
                      </div>
                      <span className="text-gray-600 text-[15px]">June:</span>
                    </div>
                    <div className="flex items-center gap-12">
                      <span className="text-gray-900 font-medium">₹8,583</span>
                      <span className="text-orange-500 text-[15px] w-20 text-right">Due</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleMonth('July')}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedMonths.includes('July') ? 'border-[#1cabb1] bg-[#1cabb1]' : 'border-gray-400 bg-white'}`}>
                        {selectedMonths.includes('July') && <div className="w-2.5 h-2.5 bg-transparent border-b-2 border-r-2 border-white transform rotate-45 mb-0.5"></div>}
                      </div>
                      <span className="text-gray-600 text-[15px]">July:</span>
                    </div>
                    <div className="flex items-center gap-12">
                      <span className="text-gray-900 font-medium">₹8,583</span>
                      <span className="text-gray-500 text-[15px] w-20 text-right">Upcoming</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleMonth('August')}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedMonths.includes('August') ? 'border-[#1cabb1] bg-[#1cabb1]' : 'border-gray-400 bg-white'}`}>
                        {selectedMonths.includes('August') && <div className="w-2.5 h-2.5 bg-transparent border-b-2 border-r-2 border-white transform rotate-45 mb-0.5"></div>}
                      </div>
                      <span className="text-gray-600 text-[15px]">August:</span>
                    </div>
                    <div className="flex items-center gap-12">
                      <span className="text-gray-900 font-medium">₹8,583</span>
                      <span className="text-gray-500 text-[15px] w-20 text-right">Upcoming</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-500 font-medium text-[15px]">EMI Amount:</span>
                    <div className="text-right">
                      <div className="text-gray-900 font-medium text-[15px] mb-1">₹8,583</div>
                      <div className="text-orange-400 text-[12px]">Due Date: 01/07/2026</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            {!isDropdownOpen && (
              <div className="p-6 pt-0 flex justify-end gap-4 rounded-b-2xl">
                <button 
                  onClick={() => setIsCollectModalOpen(false)}
                  className="py-2.5 px-8 rounded-full border-2 border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors focus:outline-none text-[15px]"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setIsCollectModalOpen(false)}
                  className="py-2.5 px-8 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#159a9f] transition-colors focus:outline-none text-[15px] shadow-sm"
                >
                  Collect ₹8,583
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanDetails;
