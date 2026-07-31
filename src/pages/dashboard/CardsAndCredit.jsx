import React, { useState } from 'react';
import { ChevronRight, CreditCard, X, ChevronDown, ArrowDownRight, ArrowUpRight, ChevronLeft, RefreshCcw, Layers, PlusSquare, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const mockEmiHistory = [
  { id: 1, text: '100 EMI card transferred to <Branch Name> from <Branch Name>', date: '20/07/2026', type: 'transferred' },
  { id: 2, text: '100 EMI card distributed to <Branch Name>', date: '20/07/2026', type: 'distributed' },
  { id: 3, text: '100 EMI card transferred to <Branch Name> from <Branch Name>', date: '20/07/2026', type: 'transferred' },
  { id: 4, text: '100 EMI card distributed to <Branch Name>', date: '20/07/2026', type: 'distributed' },
  { id: 5, text: '100 EMI card transferred to <Branch Name> from <Branch Name>', date: '20/07/2026', type: 'transferred' },
  { id: 6, text: '1000 EMI card purchased', date: '20/07/2026', type: 'purchased' },
];

const mockVerificationHistory = [
  { id: 1, text: '100 Verification credit transferred to <Branch Name> from <Branch Name>', date: '20/07/2026', type: 'transferred' },
  { id: 2, text: '50 Verification credit distributed to <Branch Name>', date: '20/07/2026', type: 'distributed' },
  { id: 3, text: '50 Verification credit distributed to <Branch Name>', date: '20/07/2026', type: 'distributed' },
  { id: 4, text: '100 Verification credit transferred to <Branch Name> from <Branch Name>', date: '20/07/2026', type: 'transferred' },
  { id: 5, text: '50 Verification credit distributed to <Branch Name>', date: '20/07/2026', type: 'distributed' },
  { id: 6, text: '1000 Verification credit purchased', date: '20/07/2026', type: 'purchased' },
];

const HistoryIcon = ({ type }) => {
  if (type === 'transferred') {
    return (
      <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-50 text-[#1b84ff] flex items-center justify-center relative">
        <CreditCard size={22} strokeWidth={1.5} />
        <div className="absolute -bottom-1 -right-1 bg-blue-50 rounded-full p-0.5">
          <RefreshCcw size={12} strokeWidth={3} />
        </div>
      </div>
    );
  } else if (type === 'distributed') {
    return (
      <div className="w-10 h-10 shrink-0 rounded-lg bg-orange-50 text-[#ff8f00] flex items-center justify-center relative">
        <CreditCard size={22} strokeWidth={1.5} />
        <div className="absolute -bottom-1 -right-1 bg-orange-50 rounded-full p-0.5">
          <ArrowUpRight size={14} strokeWidth={3} />
        </div>
      </div>
    );
  } else if (type === 'purchased') {
    return (
      <div className="w-10 h-10 shrink-0 rounded-lg bg-green-50 text-[#32c965] flex items-center justify-center relative">
        <CreditCard size={22} strokeWidth={1.5} />
        <div className="absolute -bottom-1 -right-1 bg-green-50 rounded-full p-0.5">
          <Plus size={14} strokeWidth={3} />
        </div>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 shrink-0 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center">
      <CreditCard size={22} strokeWidth={1.5} />
    </div>
  );
};

const CardsAndCredit = () => {
  const navigate = useNavigate();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
  const [distributeType, setDistributeType] = useState('add');
  const [transferSelection, setTransferSelection] = useState('both');
  
  const [purchaseEmi, setPurchaseEmi] = useState(true);
  const [purchaseVerification, setPurchaseVerification] = useState(true);
  
  const [emiQty, setEmiQty] = useState(150);
  const [verificationQty, setVerificationQty] = useState(250);

  const emiPrice = 1000;
  const verificationPrice = 22000;
  
  // Calculate total amounts based on active checkboxes (mocking the UI's static numbers for demo)
  const totalAmount = (purchaseEmi ? emiPrice : 0) + (purchaseVerification ? verificationPrice : 0);
  const cgst = 4700;
  const sgst = 4700;
  const totalPayable = totalAmount + cgst + sgst;

  const handlePay = () => {
    setIsPurchaseModalOpen(false);
    navigate('/cards-credit/payment');
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-semibold text-[#1b2559] mb-2">EMI Cards & Verification Credits</h1>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-[#1b2559] transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1" />
          <span>EMI Cards & Verification Credits</span>
          <ChevronRight size={16} className="mx-1" />
          <span className="text-[#1b2559]">Cards & Credit</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col relative">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[16px] font-semibold text-gray-700">EMI Card</span>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
          </div>
          <span className="text-3xl font-bold text-[#1b2559] mb-2">4,200</span>
          <div className="flex items-center text-sm text-gray-500">
            <span>This Month Usage</span>
            <span className="ml-2 text-red-500 font-medium flex items-center">
              -1.7%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col relative">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[16px] font-semibold text-gray-700">Verification Credit</span>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
          </div>
          <span className="text-3xl font-bold text-[#1b2559] mb-2">8,400</span>
          <div className="flex items-center text-sm text-gray-500">
            <span>This Month Usage</span>
            <span className="ml-2 text-red-500 font-medium flex items-center">
              -1.7%
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button 
          onClick={() => setIsDistributeModalOpen(true)}
          className="px-6 py-2.5 rounded-full border-[1.5px] border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors text-[14px] bg-white shadow-sm"
        >
          Distribute Card & Credit
        </button>
        <button 
          onClick={() => setIsPurchaseModalOpen(true)}
          className="px-6 py-2.5 rounded-full bg-[#1cabb1] hover:bg-[#159a9f] text-white font-semibold transition-colors text-[14px] shadow-sm"
        >
          Purchase Card & Credit
        </button>
      </div>

      {/* History Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EMI Card History */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#1b2559] mb-6">EMI Card History</h3>
          <div className="space-y-6">
            {mockEmiHistory.map((item) => (
              <div key={item.id} className="flex gap-4">
                <HistoryIcon type={item.type} />
                <div className="flex flex-col justify-center">
                  <p className="text-[14px] text-[#1b2559] font-medium leading-tight mb-1">{item.text}</p>
                  <span className="text-[12px] text-gray-400 font-medium">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
            <span className="text-[14px] font-semibold text-[#1b2559]">Showing 1 to 6 of 18 Entries</span>
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1cabb1] bg-[#1cabb1] text-white font-bold shadow-sm">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Verification Credit History */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#1b2559] mb-6">Verification Credit History</h3>
          <div className="space-y-6">
            {mockVerificationHistory.map((item) => (
              <div key={item.id} className="flex gap-4">
                <HistoryIcon type={item.type} />
                <div className="flex flex-col justify-center">
                  <p className="text-[14px] text-[#1b2559] font-medium leading-tight mb-1">{item.text}</p>
                  <span className="text-[12px] text-gray-400 font-medium">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
            <span className="text-[14px] font-semibold text-[#1b2559]">Showing 1 to 6 of 18 Entries</span>
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1cabb1] bg-[#1cabb1] text-white font-bold shadow-sm">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Purchase Modal */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 pb-4">
              <h2 className="text-xl font-bold text-[#1b2559]">Purchase</h2>
              <button onClick={() => setIsPurchaseModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 pt-0 space-y-6">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={purchaseEmi}
                    onChange={(e) => setPurchaseEmi(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#1cabb1] focus:ring-[#1cabb1]"
                  />
                  <span className="text-sm font-semibold text-gray-700">Purchase EMI Card</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={purchaseVerification}
                    onChange={(e) => setPurchaseVerification(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#1cabb1] focus:ring-[#1cabb1]"
                  />
                  <span className="text-sm font-semibold text-gray-700">Purchase Verification Credit</span>
                </label>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">EMI Card (Rs 10/-)</label>
                  <input 
                    type="number" 
                    value={emiQty}
                    onChange={(e) => setEmiQty(e.target.value)}
                    disabled={!purchaseEmi}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-sm" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Verification Credit (Rs 20/-)</label>
                  <input 
                    type="number" 
                    value={verificationQty}
                    onChange={(e) => setVerificationQty(e.target.value)}
                    disabled={!purchaseVerification}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-sm" 
                  />
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-2">
                <h3 className="font-bold text-[#1b2559] mb-3">Price</h3>
                
                {purchaseEmi && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">EMI Card ({emiQty} Qty.)</span>
                    <span className="font-medium text-gray-700">₹{emiPrice.toLocaleString()}</span>
                  </div>
                )}
                {purchaseVerification && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Verification Credit ({verificationQty} Qty.)</span>
                    <span className="font-medium text-gray-700">₹{verificationPrice.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-gray-500 font-medium">Total Amount</span>
                  <span className="font-semibold text-gray-800">₹{totalAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">CGST</span>
                  <span className="font-medium text-gray-700">+ ₹{cgst.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
                  <span className="text-gray-500">SGST</span>
                  <span className="font-medium text-gray-700">+ ₹{sgst.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between pt-1">
                  <span className="font-bold text-gray-800 text-sm">Total Payable Amount</span>
                  <span className="font-bold text-[#1b2559] text-lg">₹{totalPayable.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setIsPurchaseModalOpen(false)} 
                  className="px-6 py-2.5 rounded-full border-[1.5px] border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors text-[14px] bg-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePay} 
                  className="px-6 py-2.5 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-[14px]"
                >
                  Pay ₹{totalPayable.toLocaleString()}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Distribute Modal */}
      {isDistributeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-xl w-full max-w-[550px] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 pb-4">
              <h2 className="text-xl font-bold text-[#1b2559]">Card & Credit Settings</h2>
              <button onClick={() => setIsDistributeModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 pt-0 space-y-6">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="radio" 
                      name="distribute_type"
                      checked={distributeType === 'add'}
                      onChange={() => setDistributeType('add')}
                      className="w-5 h-5 rounded-full border-2 border-gray-400 appearance-none checked:border-[#1cabb1] transition-colors"
                    />
                    {distributeType === 'add' && <div className="absolute w-2.5 h-2.5 bg-[#1cabb1] rounded-full"></div>}
                  </div>
                  <span className="text-[15px] font-medium text-gray-700">Add Card & Credit</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="radio" 
                      name="distribute_type"
                      checked={distributeType === 'transfer'}
                      onChange={() => setDistributeType('transfer')}
                      className="w-5 h-5 rounded-full border-2 border-gray-400 appearance-none checked:border-[#1cabb1] transition-colors"
                    />
                    {distributeType === 'transfer' && <div className="absolute w-2.5 h-2.5 bg-[#1cabb1] rounded-full"></div>}
                  </div>
                  <span className="text-[15px] font-medium text-gray-700">Transfer Card & Credit</span>
                </label>
              </div>

              {distributeType === 'add' ? (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">State/UT</label>
                      <div className="relative">
                        <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-gray-600 appearance-none">
                          <option>Maharashtra</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Branch</label>
                      <div className="relative">
                        <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-gray-600 appearance-none">
                          <option>Mumbai</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1 py-1">
                    <div className="text-[13px] text-[#1b58a6] font-medium">Available EMI Card: 123</div>
                    <div className="text-[13px] text-[#1b58a6] font-medium">Available Verification Credit: 123</div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">EMI Card</label>
                      <input 
                        type="number" 
                        placeholder="Enter quantity"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px]" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Verification Credit</label>
                      <input 
                        type="number" 
                        placeholder="Enter quantity"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px]" 
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[14px] font-semibold text-[#1b2559] mb-2">From</h4>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Branch</label>
                        <div className="relative">
                          <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-gray-600 appearance-none">
                            <option>Mumbai</option>
                          </select>
                          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="text-[14px] font-semibold text-[#1b2559] mb-2">To</h4>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-[13px] font-medium text-[#1b2559] mb-1.5">Branch</label>
                        <div className="relative">
                          <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px] text-gray-600 appearance-none">
                            <option>Mumbai</option>
                          </select>
                          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h4 className="text-[14px] font-semibold text-[#1b2559] mb-3">Transfer Type</h4>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="radio" 
                            name="transfer_selection"
                            checked={transferSelection === 'emi'}
                            onChange={() => setTransferSelection('emi')}
                            className="w-4 h-4 rounded-full border-2 border-gray-400 appearance-none checked:border-[#1cabb1] transition-colors"
                          />
                          {transferSelection === 'emi' && <div className="absolute w-2 h-2 bg-[#1cabb1] rounded-full"></div>}
                        </div>
                        <span className="text-[14px] font-medium text-gray-700">EMI Card</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="radio" 
                            name="transfer_selection"
                            checked={transferSelection === 'verification'}
                            onChange={() => setTransferSelection('verification')}
                            className="w-4 h-4 rounded-full border-2 border-gray-400 appearance-none checked:border-[#1cabb1] transition-colors"
                          />
                          {transferSelection === 'verification' && <div className="absolute w-2 h-2 bg-[#1cabb1] rounded-full"></div>}
                        </div>
                        <span className="text-[14px] font-medium text-gray-700">Verification Credit</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="radio" 
                            name="transfer_selection"
                            checked={transferSelection === 'both'}
                            onChange={() => setTransferSelection('both')}
                            className="w-4 h-4 rounded-full border-2 border-gray-400 appearance-none checked:border-[#1cabb1] transition-colors"
                          />
                          {transferSelection === 'both' && <div className="absolute w-2 h-2 bg-[#1cabb1] rounded-full"></div>}
                        </div>
                        <span className="text-[14px] font-medium text-gray-700">Both</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    {(transferSelection === 'emi' || transferSelection === 'both') && (
                      <div className="flex-1">
                        <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">EMI Card</label>
                        <input 
                          type="number" 
                          placeholder="Enter quantity"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px]" 
                        />
                      </div>
                    )}
                    {(transferSelection === 'verification' || transferSelection === 'both') && (
                      <div className="flex-1">
                        <label className="block text-[14px] font-semibold text-[#1b2559] mb-1.5">Verification Credit</label>
                        <input 
                          type="number" 
                          placeholder="Enter quantity"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white text-[15px]" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setIsDistributeModalOpen(false)} 
                  className="px-6 py-2.5 rounded-full border-[1.5px] border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors text-[14px] bg-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setIsDistributeModalOpen(false)} 
                  className="px-8 py-2.5 rounded-full bg-[#1cabb1] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-[14px]"
                >
                  {distributeType === 'add' ? 'Add' : 'Transfer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CardsAndCredit;
