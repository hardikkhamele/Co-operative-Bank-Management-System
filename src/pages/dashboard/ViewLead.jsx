import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Mail, Phone, MapPin, Briefcase, Calendar, Fingerprint, FileText } from 'lucide-react';

const ViewLead = () => {
  const location = useLocation();
  const leadData = location.state || {
    name: 'Amit Dutta',
    initials: 'AD',
    phone: '9876543210',
    address: 'Pimpri Chinchwad, Pune, 411061',
    status: 'New',
    appId: 'LN1234567890'
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return <span className="px-4 py-1.5 rounded-full bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold">New</span>;
      case 'Active':
        return <span className="px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#5a5ce5] text-xs font-semibold">Active</span>;
      case 'Completed':
        return <span className="px-4 py-1.5 rounded-full bg-transparent border border-green-400 text-[#00c950] text-xs font-semibold">Completed</span>;
      case 'Rejected':
        return <span className="px-4 py-1.5 rounded-full bg-red-50 border border-red-300 text-[#ff4c4c] text-xs font-semibold">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-[#4285F4] mb-2">Lead Details</h1>
            <div className="flex items-center text-sm text-gray-500">
              <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
              <ChevronRight size={14} className="mx-2" />
              <span className="hover:text-gray-700">Lead Management</span>
              <ChevronRight size={14} className="mx-2" />
              <Link to="/leads" className="hover:text-gray-700">Leads</Link>
              <ChevronRight size={14} className="mx-2" />
              <span className="text-[#5a5ce5]">View Details</span>
            </div>
          </div>
          <Link
            to="/leads/edit"
            state={leadData}
            className="bg-[#1cabb1] hover:bg-[#159a9f] text-white px-6 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
          >
            Edit Lead
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Overview */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
            {leadData.avatar ? (
              <img src={leadData.avatar} alt={leadData.name} className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 mb-4 shadow-sm" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#f4f2ff] flex items-center justify-center text-2xl font-bold text-[#5a5ce5] border-4 border-white shadow-sm mb-4">
                {leadData.initials || leadData.name?.substring(0, 2).toUpperCase()}
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-800 mb-1">{leadData.name}</h2>
            <p className="text-sm text-gray-500 mb-4">Application ID: {leadData.appId}</p>
            {getStatusBadge(leadData.status)}
            
            <div className="w-full h-px bg-gray-100 my-6"></div>
            
            <div className="w-full flex flex-col gap-4 text-left">
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={18} className="text-[#1cabb1]" />
                <span className="text-sm font-medium">{leadData.phone}</span>
              </div>
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin size={18} className="text-[#1cabb1] mt-0.5" />
                <span className="text-sm font-medium flex-1">{leadData.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* General Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center gap-2">
              <Briefcase size={18} className="text-[#5a5ce5]" />
              <h3 className="font-bold text-gray-800">General Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">Full Name</p>
                <p className="text-[15px] font-semibold text-gray-800">{leadData.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">Gender</p>
                <p className="text-[15px] font-semibold text-gray-800">Male</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">Date of Birth</p>
                <p className="text-[15px] font-semibold text-gray-800">01/01/1996</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">Mobile Number</p>
                <p className="text-[15px] font-semibold text-gray-800">{leadData.phone}</p>
              </div>
            </div>
          </div>

          {/* Identity Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center gap-2">
              <Fingerprint size={18} className="text-[#5a5ce5]" />
              <h3 className="font-bold text-gray-800">Identity Documents</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">PAN Number</p>
                <p className="text-[15px] font-semibold text-gray-800">ABCDE1234F</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">Aadhaar Number</p>
                <p className="text-[15px] font-semibold text-gray-800">1234 5678 9012</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">PAN Card</p>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                  <FileText size={20} className="text-[#1cabb1]" />
                  <span className="text-sm font-medium text-gray-700">pan_card.jpg</span>
                  <a href="#" className="text-xs font-semibold text-[#5a5ce5] ml-auto hover:underline">View</a>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">Aadhaar Card</p>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                  <FileText size={20} className="text-[#1cabb1]" />
                  <span className="text-sm font-medium text-gray-700">aadhaar_card.jpg</span>
                  <a href="#" className="text-xs font-semibold text-[#5a5ce5] ml-auto hover:underline">View</a>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4 bg-gray-50/50 flex items-center gap-2">
              <MapPin size={18} className="text-[#5a5ce5]" />
              <h3 className="font-bold text-gray-800">Address Details</h3>
            </div>
            <div className="p-6">
              <p className="text-xs font-medium text-gray-400 mb-1">PIN Code / Area</p>
              <p className="text-[15px] font-semibold text-gray-800">{leadData.address}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewLead;
