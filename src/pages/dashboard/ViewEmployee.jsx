import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Calendar, Phone, Mail, Lock, Map, MapPin, Clock, Building2, CreditCard, Globe, Users, Banknote, ShieldAlert } from 'lucide-react';

const DetailCard = ({ icon: Icon, label, value }) => (
  <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-start gap-4">
    <div className="text-[#1cabb1] mt-1">
      <Icon size={20} strokeWidth={1.5} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
      <p className="text-[#1b2559] font-bold text-[15px]">{value}</p>
    </div>
  </div>
);

const ViewEmployee = () => {
  const location = useLocation();
  const employeeData = location.state || {
    name: 'Clark Kent',
    type: 'Loan Executive',
    initials: 'CK',
    hasImage: true,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80',
    phone: '9876543210',
    email: 'example@mail.com',
    password: 'Pass@12345',
    region: 'Eastern Region',
    branch: 'Mumbai Branch',
    salary: 'Rs. 1,00,000/-',
    dutyHours: '10:00 to 19:00',
    bankName: 'State Bank Of India',
    accountNumber: '53697842882',
    ifsc: 'SBIN0001234',
    registeredOn: 'January 1, 2026',
    gender: 'Female',
    dob: '28/07/1996'
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header section with Breadcrumbs and User Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 shrink-0 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-[#4285F4] mb-2">Employee</h1>
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="hover:text-gray-700">User Management</span>
            <ChevronRight size={14} className="mx-2" />
            <Link to="/employees" className="hover:text-gray-700">Employees</Link>
            <ChevronRight size={14} className="mx-2" />
            <span className="text-[#5a5ce5]">Employee</span>
          </div>
        </div>
        
        {/* Profile Banner */}
        <div className="p-6 flex items-center gap-5">
          <div className="w-[72px] h-[72px] rounded-full border-[3px] border-[#1cabb1] overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm">
            {employeeData.hasImage ? (
              <img src={employeeData.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#f4f2ff] text-[#5a5ce5] flex items-center justify-center text-2xl font-bold">
                {employeeData.initials || 'EM'}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-[#1b2559] mb-1.5">{employeeData.name}</h2>
            <span className="inline-block px-3 py-1 bg-[#5a5ce5] text-white text-[11px] font-medium rounded-full">
              {employeeData.type}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* General Info */}
        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">General Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard icon={Users} label="Gender" value={employeeData.gender || 'Female'} />
            <DetailCard icon={Calendar} label="Date Of Birth" value={employeeData.dob || '28/07/1996'} />
            <DetailCard icon={Phone} label="Phone" value={employeeData.phone || '9876543210'} />
            <DetailCard icon={Mail} label="Email" value={employeeData.email || 'example@mail.com'} />
            <DetailCard icon={Lock} label="Password" value={employeeData.password || 'Pass@12345'} />
          </div>
        </div>
        
        <hr className="border-gray-100 my-8" />

        {/* Employment Info */}
        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Employment Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard icon={Map} label="Region" value={employeeData.region || 'Eastern Region'} />
            <DetailCard icon={MapPin} label="Branch" value={employeeData.branch || 'Mumbai Branch'} />
            <DetailCard icon={Banknote} label="Salary" value={employeeData.salary || 'Rs. 1,00,000/-'} />
            <DetailCard icon={Clock} label="Duty Hours" value={employeeData.dutyHours || '10:00 to 19:00'} />
          </div>
        </div>


        <hr className="border-gray-100 my-8" />

        {/* Registration Info */}
        <div className="mb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard icon={Calendar} label="Registered On" value={employeeData.registeredOn || 'January 1, 2026'} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployee;
