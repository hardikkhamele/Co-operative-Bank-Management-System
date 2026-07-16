import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText, Download } from 'lucide-react';

const ViewField = ({ label, value }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-500 mb-1">{label}</label>
    <div className="text-[15px] font-medium text-gray-800">{value || '—'}</div>
  </div>
);

const DocumentViewField = ({ label, filename }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-semibold text-gray-500">{label}</label>
    {filename ? (
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50 group hover:bg-white hover:border-[#1cabb1]/30 hover:shadow-sm transition-all">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-[#1cabb1]/10 text-[#1cabb1] rounded-lg shrink-0">
            <FileText size={20} />
          </div>
          <span className="text-[15px] font-medium text-gray-700 truncate">{filename}</span>
        </div>
        <button className="text-[#1cabb1] hover:bg-[#1cabb1]/10 p-2 rounded-lg transition-colors tooltip-trigger" title="Download">
          <Download size={18} />
        </button>
      </div>
    ) : (
      <div className="flex items-center justify-center p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400 text-sm">
        No document uploaded
      </div>
    )}
  </div>
);

const ViewMerchant = () => {
  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold text-[#4285F4] mb-2">View Merchant</h1>
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="hover:text-gray-700">Partner Management</span>
            <ChevronRight size={14} className="mx-2" />
            <Link to="/merchant" className="hover:text-gray-700">Merchant</Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-[#5a5ce5]">View</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* General Info */}
        <div className="mb-12">
          <h2 className="text-[20px] font-bold text-[#1b2559] mb-6 pb-2 border-b border-gray-100">General Information</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-8">
            <ViewField label="Shop Name" value="Tech Haven" />
            <ViewField label="Shop Owner Name" value="Tony Stark" />
            <ViewField label="Email" value="tony@techhaven.com" />
            <ViewField label="Phone Number" value="9876543210" />
            <ViewField label="Owner Aadhar Number" value="1234 5678 9012" />
            <ViewField label="Owner PAN Number" value="ABCDE1234F" />
            <ViewField label="GSTIN Number" value="27ABCDE1234F1Z5" />
            <ViewField label="Password" value="••••••••" />
          </div>
        </div>

        {/* Documents */}
        <div>
          <h2 className="text-[20px] font-bold text-[#1b2559] mb-6 pb-2 border-b border-gray-100">Uploaded Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DocumentViewField label="Owner Aadhar" filename="aadhar_card.jpg" />
            <DocumentViewField label="Owner PAN" filename="pan_card.jpg" />
            <DocumentViewField label="Shop Registration Certificate" filename="shop_reg.pdf" />
            <DocumentViewField label="GST Certificate" filename="gst_cert.pdf" />
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-gray-100">
          <Link to="/merchant" className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm text-[15px] inline-flex">
            Back to List
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewMerchant;
