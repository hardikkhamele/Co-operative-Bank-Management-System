import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Download } from 'lucide-react';

const ViewLead = () => {
  const location = useLocation();
  // Using the data passed from the Leads page or fallback
  const leadData = location.state || {
    name: 'Amit Dutta',
    phone: '9876543210',
    appId: 'LN1234567890',
    dob: '10-7-1993',
    gender: 'Male',
    pan: 'ABCDE1234F',
    aadhaar: '1234 5678 9876',
    address: '3517 W. Gray St. Utica, India 57867',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    status: 'Active', // Dynamic status
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return <div className="px-6 py-1.5 rounded bg-gray-50 border border-gray-200 text-gray-500 font-semibold text-[13px]">New</div>;
      case 'Active':
        return <div className="px-6 py-1.5 rounded bg-indigo-50 border border-indigo-200 text-[#5a5ce5] font-semibold text-[13px]">Active</div>;
      case 'Completed':
        return <div className="px-6 py-1.5 rounded bg-white border border-green-400 text-[#00c950] font-semibold text-[13px]">Completed</div>;
      case 'Rejected':
        return <div className="px-6 py-1.5 rounded bg-white border border-red-400 text-[#ff4c4c] font-semibold text-[13px]">Rejected</div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      
      {/* Breadcrumb Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0 relative">
        <h1 className="text-[22px] font-bold text-[#1b58a6] mb-3">Lead Details</h1>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1.5 text-gray-400" />
          <span className="hover:text-gray-800 transition-colors">CRM Management</span>
          <ChevronRight size={16} className="mx-1.5 text-gray-400" />
          <Link to="/leads" className="hover:text-gray-800 transition-colors">Leads</Link>
          <ChevronRight size={16} className="mx-1.5 text-gray-400" />
          <span className="text-[#1b58a6]">Lead Details</span>
        </div>
      </div>

      {/* App Number & Action Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 min-h-[44px]">
        <div className="text-[15px] font-medium text-gray-700">
          Application Number: <span className="text-[#1b58a6] ml-1">{leadData.appId}</span>
        </div>
        
        {(leadData.status === 'Active' || leadData.status === 'Completed') && (
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 bg-[#1cabb1] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-semibold transition-colors text-[13px] shadow-sm">
              <Download size={16} />
              Loan Agreement
            </button>
            <button className="flex items-center gap-2 bg-[#1cabb1] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-semibold transition-colors text-[13px] shadow-sm">
              <Download size={16} />
              Account Form
            </button>
            <button className="flex items-center gap-2 bg-[#1cabb1] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-semibold transition-colors text-[13px] shadow-sm">
              <Download size={16} />
              Membership Form
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center">
        <div className="flex items-center gap-5">
          {leadData.avatar ? (
            <img 
              src={leadData.avatar} 
              alt={leadData.name} 
              className="w-16 h-16 rounded-full object-cover shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#f4f2ff] flex items-center justify-center text-xl font-bold text-[#5a5ce5]">
              {leadData.initials || leadData.name?.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-800">{leadData.name}</h2>
            <p className="text-gray-500 font-medium mt-1 text-[15px]">{leadData.phone}</p>
          </div>
        </div>
        {getStatusBadge(leadData.status)}
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#f4f3fb] px-6 py-4 border-b border-gray-100">
          <h2 className="text-[17px] font-bold text-gray-800">Personal Information</h2>
        </div>
        <div className="p-6 flex flex-col gap-4 text-[14px]">
          <div className="flex">
            <span className="text-gray-500 w-40 font-medium">Date Of Birth:</span>
            <span className="text-gray-800 font-semibold">{leadData.dob || '10-7-1993'}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-40 font-medium">Gender:</span>
            <span className="text-gray-800 font-semibold">{leadData.gender || 'Male'}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-40 font-medium">PAN Number:</span>
            <span className="text-gray-800 font-semibold">{leadData.pan || 'ABCDE1234F'}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-40 font-medium">Aadhaar Number:</span>
            <span className="text-gray-800 font-semibold">{leadData.aadhaar || '1234 5678 9876'}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-40 font-medium">Address:</span>
            <span className="text-gray-800 font-semibold">{leadData.address || '3517 W. Gray St. Utica, India 57867'}</span>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="bg-[#f4f3fb] px-6 py-4 border-b border-gray-100">
          <h2 className="text-[17px] font-bold text-gray-800">Documents</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 h-56 flex items-center justify-center">
            {/* Visual representation of PAN Card */}
            <div className="w-full h-full bg-gradient-to-r from-blue-100 to-blue-200 flex flex-col p-4 relative border-t-8 border-t-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[11px] font-bold text-red-700">आयकर विभाग</h3>
                  <h3 className="text-[9px] font-bold text-blue-900">INCOME TAX DEPARTMENT</h3>
                </div>
                <div className="text-right">
                  <h3 className="text-[11px] font-bold text-red-700">भारत सरकार</h3>
                  <h3 className="text-[9px] font-bold text-blue-900">GOVT. OF INDIA</h3>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-[10px] font-bold text-gray-800">YOUR NAME HERE</p>
                <p className="text-[10px] font-bold text-gray-800 mt-3">YOUR FATHER NAME HERE</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 h-56 flex items-center justify-center">
            {/* Visual representation of Aadhaar Card */}
            <div className="w-full h-full bg-white flex flex-col relative p-4 border border-green-500/20 rounded m-2">
              <div className="flex justify-center border-b-2 border-orange-500/50 pb-1 mb-3">
                 <h3 className="text-[11px] font-bold text-green-700">Government of India</h3>
              </div>
              <div className="flex gap-4 mt-2">
                 <div className="w-16 h-20 bg-gray-200 flex flex-col items-center justify-end pb-2">
                    <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
                 </div>
                 <div className="flex-1 space-y-2.5 mt-1">
                    <div className="h-2 w-24 bg-gray-300 rounded"></div>
                    <div className="h-2 w-32 bg-gray-300 rounded"></div>
                    <div className="h-2 w-20 bg-gray-300 rounded"></div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active/Completed Lead Specific Information (Loan & EMI) */}
      {(leadData.status === 'Active' || leadData.status === 'Completed') && (
        <>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-[#f4f3fb] px-6 py-4 border-b border-gray-100">
            <h2 className="text-[17px] font-bold text-gray-800">Loan Information</h2>
          </div>
          <div className="bg-[#f8f9fb] p-6 text-[14px]">
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex">
                <span className="text-gray-500 w-36 font-medium">Disbursed On:</span>
                <span className="text-gray-800 font-semibold">10 Jan 2026</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-36 font-medium">Loan Applied For:</span>
                <span className="text-gray-800 font-semibold">Smart Phone</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-36 font-medium">Phone Details:</span>
                <span className="text-gray-800 font-semibold">iPhone 17 - 256GB - Black</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-[360px] mb-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 text-[14px]">Amount Info</h3>
              
              <div className="space-y-2 mb-3 border-b border-gray-100 pb-3 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Product Price:</span>
                  <span className="text-gray-700 font-medium">₹80,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">EMI Card Charges:</span>
                  <span className="text-gray-700 font-medium">+₹500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Loan Processing Fees:</span>
                  <span className="text-gray-700 font-medium">+₹200</span>
                </div>
              </div>

              <div className="space-y-2 mb-3 border-b border-gray-100 pb-3 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold">Total Amount:</span>
                  <span className="text-gray-800 font-bold">₹80,700</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Down Payment:</span>
                  <span className="text-[#ff4c4c] font-medium">-₹30,700</span>
                </div>
              </div>

              <div className="space-y-2 mb-3 border-b border-gray-100 pb-3 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold">Total Loan Amount:</span>
                  <span className="text-gray-800 font-bold">₹50,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Loan Interest (1%):</span>
                  <span className="text-gray-700 font-medium">+₹500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Loan Insurance:</span>
                  <span className="text-gray-700 font-medium">+₹1000</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6 text-[13px]">
                <span className="text-gray-500 font-bold">Total Loan Amount:</span>
                <span className="text-gray-800 font-bold">₹51,500</span>
              </div>

              <h3 className="font-bold text-gray-800 mb-4 text-[14px]">EMI Info</h3>
              
              <div className="space-y-2 mb-4 border-b border-gray-100 pb-3 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Total Loan Amount:</span>
                  <span className="text-gray-700 font-medium">₹51,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">EMI Tenure:</span>
                  <span className="text-gray-700 font-medium">6 Months</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[13px]">
                <span className="text-gray-500 font-medium">EMI Amount:</span>
                <span className="text-gray-800 font-bold">₹8,583/Month</span>
              </div>
            </div>

            <div className="flex items-center text-[15px]">
              <span className="text-gray-800 font-medium mr-2">Status:</span>
              <span className={`font-semibold ${leadData.status === 'Active' ? 'text-[#5a5ce5]' : 'text-green-500'}`}>
                {leadData.status}
              </span>
            </div>
          </div>
        </div>

        {/* EMI Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-[#f4f3fb] px-6 py-4 border-b border-gray-100">
            <h2 className="text-[17px] font-bold text-gray-800">EMI Information</h2>
          </div>
          <div className="bg-[#f8f9fb] p-6 text-[14px]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center pb-2">
                <span className="text-gray-500 w-32 font-medium">EMI Tenure:</span>
                <span className="text-gray-800 font-semibold">6 Months (₹8,583/Month)</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex">
                  <span className="text-gray-500 w-32 font-medium">March:</span>
                  <span className="text-gray-800 font-semibold">₹8,583</span>
                </div>
                <span className="text-green-500 font-medium">Paid</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex">
                  <span className="text-gray-500 w-32 font-medium">April:</span>
                  <span className="text-gray-800 font-semibold">₹8,583</span>
                </div>
                <span className="text-green-500 font-medium">Paid</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex">
                  <span className="text-gray-500 w-32 font-medium">May:</span>
                  <span className="text-gray-800 font-semibold">₹8,583</span>
                </div>
                <span className="text-green-500 font-medium">Paid</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex">
                  <span className="text-gray-500 w-32 font-medium">June:</span>
                  <span className="text-gray-800 font-semibold">₹8,583</span>
                </div>
                {leadData.status === 'Completed' ? (
                  <span className="text-green-500 font-medium">Paid</span>
                ) : (
                  <span className="text-orange-400 font-medium">Due</span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex">
                  <span className="text-gray-500 w-32 font-medium">July:</span>
                  <span className="text-gray-800 font-semibold">₹8,583</span>
                </div>
                {leadData.status === 'Completed' ? (
                  <span className="text-green-500 font-medium">Paid</span>
                ) : (
                  <span className="text-gray-500 font-medium">Upcoming</span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex">
                  <span className="text-gray-500 w-32 font-medium">August:</span>
                  <span className="text-gray-800 font-semibold">₹8,583</span>
                </div>
                {leadData.status === 'Completed' ? (
                  <span className="text-green-500 font-medium">Paid</span>
                ) : (
                  <span className="text-gray-500 font-medium">Upcoming</span>
                )}
              </div>
            </div>

            {leadData.status !== 'Completed' && (
              <div className="flex justify-end mt-8">
                <button className="bg-[#1cabb1] hover:bg-[#159a9f] text-white px-6 py-2.5 rounded-full font-semibold transition-colors text-[14px] shadow-sm">
                  Collect EMI
                </button>
              </div>
            )}
          </div>
        </div>
      </>
      )}
      {/* New Lead Specific Information (Loan Info Only) */}
      {leadData.status === 'New' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-[#f4f3fb] px-6 py-4 border-b border-gray-100">
            <h2 className="text-[17px] font-bold text-gray-800">Loan Information</h2>
          </div>
          <div className="bg-[#f8f9fb] p-6 text-[14px]">
            <div className="flex flex-col gap-3">
              <div className="flex">
                <span className="text-gray-500 w-36 font-medium">Applied On:</span>
                <span className="text-gray-800 font-semibold">10 Jan 2026</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-36 font-medium">Loan Applied For:</span>
                <span className="text-gray-800 font-semibold">Smart Phone</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-36 font-medium">Phone Details:</span>
                <span className="text-gray-800 font-semibold">iPhone 17 - 256GB - Black</span>
              </div>
              <div className="flex items-center text-[15px] mt-1">
                <span className="text-gray-800 font-medium mr-2">Status:</span>
                <span className="text-gray-800 font-semibold">New</span>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Link to="/leads/setup-loan" className="inline-block bg-[#1cabb1] hover:bg-[#159a9f] text-white px-8 py-2.5 rounded-full font-semibold transition-colors shadow-sm text-sm">
                Setup Loan
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Rejected Lead Specific Information (Loan Info Only) */}
      {leadData.status === 'Rejected' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-[#f4f3fb] px-6 py-4 border-b border-gray-100">
            <h2 className="text-[17px] font-bold text-gray-800">Loan Information</h2>
          </div>
          <div className="bg-[#f8f9fb] p-6 text-[14px]">
            <div className="flex flex-col gap-3">
              <div className="flex">
                <span className="text-gray-500 w-36 font-medium">Applied On:</span>
                <span className="text-gray-800 font-semibold">10 Jan 2026</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-36 font-medium">Loan Applied For:</span>
                <span className="text-gray-800 font-semibold">Smart Phone</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-36 font-medium">Phone Details:</span>
                <span className="text-gray-800 font-semibold">iPhone 17 - 256GB - Black</span>
              </div>
              <div className="flex items-center text-[15px] mt-1">
                <span className="text-gray-800 font-medium mr-2">Status:</span>
                <span className="text-[#ff4c4c] font-semibold">Rejected</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ViewLead;
