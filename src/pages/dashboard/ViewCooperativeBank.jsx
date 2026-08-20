import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft,  ChevronRight, FileText, Download, Eye, X } from 'lucide-react';
import { useState } from 'react';

const ViewField = ({ label, value }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-500 mb-1">{label}</label>
    <div className="text-[15px] font-medium text-gray-800">{value || '—'}</div>
  </div>
);

const DocumentViewField = ({ label, filename, url, onViewClick }) => {
  const navigate = useNavigate();
  if (!filename && !url) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-500">{label}</label>
        <div className="flex items-center justify-center p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400 text-sm h-20">
          No document uploaded
        </div>
      </div>
    );
  }

  const fileUrl = url || 'https://images.unsplash.com/photo-1616628188506-4b82bc4e16d4?auto=format&fit=crop&w=300&q=80';
  const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) || filename?.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) || !filename?.match(/\.pdf$/i);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-500">{label}</label>
      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50 group hover:bg-white hover:border-[#225091]/30 hover:shadow-sm transition-all">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
            {isImage ? (
              <img src={fileUrl} alt={filename} className="w-full h-full object-cover cursor-pointer" onClick={() => onViewClick(fileUrl)} />
            ) : (
              <FileText size={24} className="text-gray-400" />
            )}
          </div>
          <span className="text-[14px] font-medium text-gray-700 truncate" title={filename || 'Document'}>
            {filename || 'Document'}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); onViewClick(fileUrl); }}
            className="text-gray-500 hover:text-[#225091] hover:bg-[#225091]/10 p-2 rounded-lg transition-colors tooltip-trigger" 
            title="View Fullscreen"
          >
            <Eye size={18} />
          </button>
          <button className="text-gray-500 hover:text-[#225091] hover:bg-[#225091]/10 p-2 rounded-lg transition-colors tooltip-trigger" title="Download">
            <Download size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ViewCooperativeBank = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
            type="button"
          >
            <ArrowLeft size={16} /> Back
          </button>
            <h1 className="text-xl font-bold text-[#225091] m-0">View Co-operative Bank</h1>
          </div>
          <div className="flex items-center text-sm text-gray-500 pl-[40px]">
            <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="hover:text-gray-700">Partner Management</span>
            <ChevronRight size={14} className="mx-2" />
            <Link to="/co-operative-bank" className="hover:text-gray-700">Co-operative Bank</Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-[#225091]">View</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* General Info */}
        <div className="mb-12">
          <h2 className="text-[20px] font-bold text-[#1b2559] mb-6 pb-2 border-b border-gray-100">General Information</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-8">
            <ViewField label="Bank Name" value="Mumbai District Central Co-op Bank" />
            <ViewField label="Authorized Person" value="John Doe" />
            <ViewField label="Email" value="contact@mdccb.com" />
            <ViewField label="Mail ID (Alternate/Contact)" value="support@mdccb.com" />
            <ViewField label="Phone Number" value="022-22610115" />
            <ViewField label="Mobile Number" value="9876543210" />
            <ViewField label="Password" value="••••••••" />
          </div>
        </div>

        {/* Bank Details */}
        <div className="mb-12">
          <h2 className="text-[20px] font-bold text-[#1b2559] mb-6 pb-2 border-b border-gray-100">Bank Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-8">
            <ViewField label="Bank Name" value="HDFC Bank" />
            <ViewField label="Account number" value="50100432890123" />
            <ViewField label="IFSC" value="HDFC0000123" />
            <ViewField label="Account Holder Name" value="Mumbai District Central Co-op Bank" />
          </div>
        </div>

        {/* Documents */}
        <div>
          <h2 className="text-[20px] font-bold text-[#1b2559] mb-6 pb-2 border-b border-gray-100">Uploaded Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <DocumentViewField label="Registration Certificate" filename="reg_cert_2023.pdf" onViewClick={setSelectedDocument} />
            <DocumentViewField label="Company PAN" filename="pan_card.jpg" onViewClick={setSelectedDocument} />
            <DocumentViewField label="Board Resolution" filename="board_res.pdf" onViewClick={setSelectedDocument} />
            <DocumentViewField label="GST / Declaration" filename="gst_doc.pdf" onViewClick={setSelectedDocument} />
            <DocumentViewField label="Director KYC (Aadhar, PAN etc.)" filename="dir_kyc_aadhar.pdf" onViewClick={setSelectedDocument} />
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-gray-100">
          <Link to="/co-operative-bank" className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm text-[15px] inline-flex">
            Back to List
          </Link>
        </div>
      </div>

      {selectedDocument && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedDocument(null)}>
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedDocument(null)}
              className="absolute -top-12 right-0 md:-right-12 text-white hover:text-red-400 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
            >
              <X size={24} />
            </button>
            {selectedDocument.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) || !selectedDocument.match(/\.pdf$/i) ? (
              <img src={selectedDocument} alt="Document View" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
            ) : (
              <iframe src={selectedDocument} className="w-full h-[85vh] bg-white rounded-lg shadow-2xl" title="Document View" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCooperativeBank;
