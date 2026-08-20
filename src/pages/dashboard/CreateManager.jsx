import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft,  ChevronRight, Camera, Calendar, ChevronDown, Clock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  validateEmail, 
  validatePhone, 
  validatePassword, 
  sanitizeDigits, 
  preventInvalidNumberKeys 
} from '../../utils/validation';

const CreateManager = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [managerType, setManagerType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dob: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    salary: '',
    region: '',
    branch: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.fullName.trim()) {
      setActiveTab('personal');
      toast.error("Please enter manager's full name");
      return;
    }
    const emailErr = validateEmail(formData.email).error;
    if (emailErr) {
      setActiveTab('personal');
      toast.error(emailErr);
      return;
    }
    const phoneErr = validatePhone(formData.phone).error;
    if (phoneErr) {
      setActiveTab('personal');
      toast.error(phoneErr);
      return;
    }
    const passErr = validatePassword(formData.password, { minLength: 6 }).error;
    if (passErr) {
      setActiveTab('personal');
      toast.error(passErr);
      return;
    }

    toast.success("Manager created successfully!");
    navigate('/managers');
  };

  const tabs = [
    { id: 'personal', label: 'Personal Details' },
    { id: 'job', label: 'Job Details' },
    { id: 'shift', label: 'Shift & WOFF' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'woff', label: 'WOFF & HOFF' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
        <div className="flex items-center gap-3 mb-2">
            <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
            type="button"
          >
            <ArrowLeft size={16} /> Back
          </button>
            <h1 className="text-xl font-bold text-[#225091] m-0">Create Manager</h1>
          </div>
        <div className="flex items-center text-sm text-gray-500 pl-[40px]">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="hover:text-gray-700">User Management</span>
          <ChevronRight size={14} className="mx-2" />
          <Link to="/managers" className="hover:text-gray-700">Managers</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#225091]">Create Manager</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-10 bg-gray-50/50 p-1.5 rounded-xl w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-[#eef0ff] text-[#1b2559]' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'personal' && (
          <div>
            {/* General Info */}
            <div className="mb-10">
              <h2 className="text-[22px] font-bold text-[#1b2559] mb-8">General Info</h2>
              
              <div className="mb-8">
                <div className="relative inline-block group cursor-pointer">
                  <div className="w-24 h-24 rounded-full border-[3px] border-[#225091] overflow-hidden flex items-center justify-center p-0.5">
                    <img 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="absolute bottom-0 right-1 left-0 flex justify-center translate-y-1/4">
                    <div className="bg-[#225091] text-white p-1.5 rounded-full border-[2.5px] border-white shadow-sm">
                      <Camera size={14} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Full Name *</label>
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={e => handleChange('fullName', e.target.value)}
                    placeholder="Enter full name" 
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                  />
                </div>
                
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Gender</label>
                  <div className="relative">
                    <select 
                      value={formData.gender}
                      onChange={e => handleChange('gender', e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-500 shadow-sm text-[15px]"
                    >
                      <option value="" disabled>Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Date Of Birth</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={formData.dob}
                      onChange={e => handleChange('dob', e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Phone *</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => handleChange('phone', sanitizeDigits(e.target.value, 10))}
                    placeholder="10-digit Phone Number" 
                    maxLength={10}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                  />
                </div>
                
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Email *</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="Enter email" 
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                  />
                </div>
                
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Password *</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={formData.password}
                      onChange={e => handleChange('password', e.target.value)}
                      placeholder="Min 6 characters" 
                      className="w-full pl-4 pr-11 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Address</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={e => handleChange('address', e.target.value)}
                    placeholder="Enter address" 
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'job' && (
          <div>
            <h2 className="text-[22px] font-bold text-[#1b2559] mb-8">Employment Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Manager Type</label>
                <div className="relative">
                  <select 
                    value={managerType}
                    onChange={e => setManagerType(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-500 shadow-sm text-[15px]"
                  >
                    <option value="" disabled>Select</option>
                    <option value="regional">Regional Manager</option>
                    <option value="branch">Branch Manager</option>
                    <option value="collection">Collection Manager</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Region</label>
                <div className="relative">
                  <select 
                    value={formData.region}
                    onChange={e => handleChange('region', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-500 shadow-sm text-[15px]"
                  >
                    <option value="" disabled>Select</option>
                    <option value="north">North</option>
                    <option value="south">South</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Branch</label>
                <div className="relative">
                  <select 
                    value={formData.branch}
                    onChange={e => handleChange('branch', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-500 shadow-sm text-[15px]"
                  >
                    <option value="" disabled>Select</option>
                    <option value="b1">Branch 1</option>
                    <option value="b2">Branch 2</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Salary</label>
                <input 
                  type="number" 
                  min="0"
                  onKeyDown={preventInvalidNumberKeys}
                  value={formData.salary}
                  onChange={e => handleChange('salary', e.target.value)}
                  placeholder="Rs." 
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" 
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shift' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shift Card */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Shift</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Punch In Time</label>
                    <div className="relative">
                      <input type="text" placeholder="HH:MM" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" />
                      <Clock size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Punch Out Time</label>
                    <div className="relative">
                      <input type="text" placeholder="HH:MM" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" />
                      <Clock size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Off Card */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Weekly Off</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Weekly Off Day</label>
                    <div className="relative">
                      <select className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-500 shadow-sm text-[15px]">
                        <option value="" disabled selected>Select</option>
                        <option value="sunday">Sunday</option>
                        <option value="saturday">Saturday</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" defaultChecked className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-[15px] text-gray-700 font-medium">Weekly Off Payable</span>
                  </label>

                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-[15px] text-gray-700 font-medium">Variable Weekly Off</span>
                  </label>

                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-[15px] text-gray-700 font-medium">Second Weekly Off</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Other Details Card */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Other Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                {/* Late Allowed */}
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Late Allowed (Mins)</label>
                  <input type="text" defaultValue="15" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px] mb-4" />
                  <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" defaultChecked className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-[14px] text-gray-600 font-medium">As Per Shift</span>
                  </label>
                </div>

                {/* Early Allowed */}
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Early Allowed (Mins)</label>
                  <input type="text" defaultValue="15" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px] mb-4" />
                  <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-[14px] text-gray-600 font-medium">As Per Shift</span>
                  </label>
                </div>

                {/* Half Day */}
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Half Day (Mins)</label>
                  <input type="text" defaultValue="240" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px] mb-4" />
                  <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-[14px] text-gray-600 font-medium">As Per Shift</span>
                  </label>
                </div>

                {/* Full Day */}
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Full Day (Mins)</label>
                  <input type="text" defaultValue="480" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px] mb-4" />
                  <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" defaultChecked className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-[14px] text-gray-600 font-medium">As Per Shift</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Punch Card */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Punch</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Punch Type</label>
                    <div className="flex items-center gap-5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <input type="radio" name="punchType" value="single" className="peer w-5 h-5 rounded-full border-2 border-gray-400 appearance-none checked:border-[#225091] transition-colors cursor-pointer" />
                          <div className="absolute w-2.5 h-2.5 bg-[#225091] rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="text-[15px] text-gray-600">Single</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <input type="radio" name="punchType" value="double" defaultChecked className="peer w-5 h-5 rounded-full border-2 border-gray-400 appearance-none checked:border-[#225091] transition-colors cursor-pointer" />
                          <div className="absolute w-2.5 h-2.5 bg-[#225091] rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="text-[15px] text-gray-600">Double</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative flex items-center justify-center">
                          <input type="radio" name="punchType" value="multiple" className="peer w-5 h-5 rounded-full border-2 border-gray-400 appearance-none checked:border-[#225091] transition-colors cursor-pointer" />
                          <div className="absolute w-2.5 h-2.5 bg-[#225091] rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="text-[15px] text-gray-600">Multiple</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">No Out-Punch Found — Action</label>
                    <div className="relative">
                      <select className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-500 shadow-sm text-[15px]">
                        <option value="" disabled selected>Select</option>
                        <option value="mark_half_day">Mark Half Day</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Present On WO / Holiday — Action</label>
                    <div className="relative">
                      <select className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-500 shadow-sm text-[15px]">
                        <option value="" disabled selected>Select</option>
                        <option value="pay_extra">Pay Extra</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lunch & Early Going Card */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Lunch & Early Going</h2>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Lunch Allowed Mins</label>
                      <input type="text" defaultValue="0" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" />
                    </div>
                    <div className="pb-3.5">
                      <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" defaultChecked className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                          <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <span className="text-[14px] text-gray-600 font-medium">As Per Shift</span>
                      </label>
                    </div>
                  </div>

                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-[15px] text-gray-700 font-medium">Lunch Allowed</span>
                  </label>
                  
                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-[15px] text-gray-700 font-medium">Early Going Allowed</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Late Cut Card */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Late Cut</h2>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Allowed Days</label>
                      <input type="text" defaultValue="3" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" />
                    </div>
                    <div>
                      <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">Action</label>
                      <div className="relative">
                        <select className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white appearance-none text-gray-500 shadow-sm text-[15px]">
                          <option value="" disabled selected>Select</option>
                          <option value="deduct">Deduct</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  
                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-[15px] text-gray-700 font-medium">Late Cut Allowed</span>
                  </label>
                  
                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-[15px] text-gray-700 font-medium">Extra Late Cut Deduction</span>
                  </label>
                  
                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-[15px] text-gray-700 font-medium">Additional Late Cut In Leave Balance</span>
                  </label>
                </div>
              </div>

              {/* Overtime Card */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Overtime</h2>
                <div className="space-y-5">
                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-[15px] text-gray-700 font-medium">Overtime Allowed</span>
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                        <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="text-[15px] text-gray-700 font-medium">Custom OT</span>
                    </label>
                    <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="relative flex items-center justify-center">
                        <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                        <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="text-[15px] text-gray-700 font-medium">Before OT</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">OT Grace Period (Mins)</label>
                      <input type="text" defaultValue="5" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" />
                    </div>
                    <div>
                      <label className="block text-[15px] font-semibold text-gray-800 mb-2.5">1 Day OT Hrs</label>
                      <input type="text" defaultValue="4" className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white shadow-sm text-[15px]" />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-[15px] text-gray-700 font-medium">OT As Per Shift</span>
                  </label>
                  
                  <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-[15px] text-gray-700 font-medium">Consider OT As COFF</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'woff' && (
          <div className="space-y-6">
            {/* Sandwich Absence Rules — Weekly Off */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Sandwich Absence Rules — Weekly Off</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-start gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                    <input type="checkbox" defaultChecked className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] text-gray-700 font-medium leading-tight">Absent Before Weekly Off</span>
                    <span className="text-[12px] text-gray-500 mt-1.5">Mark Absent If Employee Absent The Day Before WO.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                    <input type="checkbox" defaultChecked className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] text-gray-700 font-medium leading-tight">Absent After Weekly Off</span>
                    <span className="text-[12px] text-gray-500 mt-1.5">Mark Absent If Employee Absent The Day After WO.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                    <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] text-gray-700 font-medium leading-tight">Absent Before Or After Weekly Off</span>
                    <span className="text-[12px] text-gray-500 mt-1.5">Either Side Triggers WO Absent.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-[15px] text-gray-700 font-medium">Add Working Hrs On Weekly Off Day</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-[15px] text-gray-700 font-medium">Late Deduction Not Applied On WO If Present</span>
                </label>
              </div>
            </div>

            {/* Sandwich Absence Rules — Holiday */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Sandwich Absence Rules — Holiday</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-[15px] text-gray-700 font-medium">Absent Before Holiday</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-[15px] text-gray-700 font-medium">Absent After Holiday</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-[15px] text-gray-700 font-medium">Absent Before & After Holiday</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-[15px] text-gray-700 font-medium">Add Working Hours On Holiday Day</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-[15px] text-gray-700 font-medium">Late Deduction Not Applied On Holiday If Present</span>
                </label>
              </div>
            </div>

            {/* Leave Between Holiday Or Weekly Off */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h2 className="text-[20px] font-bold text-[#1b2559] mb-6">Leave Between Holiday Or Weekly Off</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input type="checkbox" defaultChecked className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-[15px] text-gray-700 font-medium">Consider "Weekly Off" In Leave Application</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input type="checkbox" defaultChecked className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-[15px] text-gray-700 font-medium">Consider "Holiday" In Leave Application</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input type="checkbox" defaultChecked className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-[15px] text-gray-700 font-medium">Absent — WO — Leave = WO Absent</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-[15px] text-gray-700 font-medium">Leave — WO — Absent = WO Absent</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-[15px] text-gray-700 font-medium">Absent — Holiday — Leave = Holiday Absent</span>
                </label>

                <label className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-fit">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input type="checkbox" className="peer w-5 h-5 rounded-[4px] border-2 border-gray-300 appearance-none checked:bg-[#225091] checked:border-[#225091] transition-colors cursor-pointer" />
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none hidden peer-checked:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-[15px] text-gray-700 font-medium">Leave — Holiday — Absent = Holiday Absent</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end items-center gap-4 pt-2">
        <Link
          to="/managers"
          className="px-10 py-3 rounded-full border-[1.5px] border-[#225091] text-[#225091] bg-white hover:bg-teal-50 font-semibold transition-colors text-[15px]"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleSave}
          className="px-10 py-3 rounded-full bg-[#225091] hover:bg-[#168f94] text-white font-semibold transition-colors shadow-sm text-[15px]"
        >
          Create
        </button>
      </div>


    </div>
  );
};

export default CreateManager;
