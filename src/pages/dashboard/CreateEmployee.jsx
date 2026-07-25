import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Camera, Calendar, ChevronDown, Clock, ChevronLeft } from 'lucide-react';

const CreateEmployee = () => {
  const [employeeType, setEmployeeType] = useState('');
  const [activeTab, setActiveTab] = useState('Personal Details');
  const [dob, setDob] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [punchIn, setPunchIn] = useState('');
  const [punchOut, setPunchOut] = useState('');

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
        <h1 className="text-xl font-bold text-[#4285F4] mb-2">Create Employee</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="hover:text-gray-700">User Management</span>
          <ChevronRight size={14} className="mx-2" />
          <Link to="/employees" className="hover:text-gray-700">Employees</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#5a5ce5]">Create Employee</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-2">
        {['Personal Details', 'Job Details', 'Shift & WOFF', 'Attendance', 'WOFF & HOFF', 'KRA Settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === tab
                ? 'bg-[#e9e8fa] text-[#1b2559]'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Tab Content */}
        {activeTab === 'Personal Details' && (
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800 mb-6">General Info</h2>
          
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full border-[2.5px] border-[#1cabb1] overflow-hidden flex items-center justify-center p-1">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <button className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#1cabb1] text-white p-1.5 rounded-full border-2 border-white hover:bg-[#159a9f] transition-colors shadow-sm">
                <Camera size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Full Name</label>
              <input type="text" placeholder="Enter full name" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Gender</label>
              <div className="relative">
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-gray-500 shadow-sm">
                  <option value="" disabled selected>Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Date Of Birth</label>
              <div className="relative">
                <input 
                  type={dob ? "date" : "text"} 
                  placeholder="DD/MM/YYYY" 
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => (!e.target.value ? (e.target.type = "text") : null)}
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" 
                />
                {!dob && <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Phone</label>
              <input type="tel" placeholder="Enter phone Number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
              <input type="email" placeholder="Enter email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
              <input type="password" placeholder="Create password" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Address</label>
              <input type="text" placeholder="Enter address" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" />
            </div>
          </div>
        </div>
        )}

        {/* Employment Info - Shown in Job Details Tab */}
        {activeTab === 'Job Details' && (
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Employment Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Designation</label>
              <div className="relative">
                <select 
                  value={employeeType}
                  onChange={(e) => setEmployeeType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-gray-500 shadow-sm"
                >
                  <option value="" disabled selected>Select</option>
                  <option value="Branch Manager">Branch Manager</option>
                  <option value="Loan Executive">Loan Executive</option>
                  <option value="Credit Analyst">Credit Analyst</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">State/UT</label>
              <div className="relative">
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-gray-500 shadow-sm">
                  <option value="" disabled selected>Select</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Karnataka">Karnataka</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Branch</label>
              <div className="relative">
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-gray-500 shadow-sm">
                  <option value="" disabled selected>Select</option>
                  <option value="Mumbai Branch">Mumbai Branch</option>
                  <option value="Nagpur Branch">Nagpur Branch</option>
                  <option value="Delhi Branch">Delhi Branch</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Salary</label>
              <input type="number" placeholder="Rs." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Joining Date</label>
              <div className="relative">
                <input 
                  type={joiningDate ? "date" : "text"} 
                  placeholder="DD/MM/YYYY" 
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => (!e.target.value ? (e.target.type = "text") : null)}
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" 
                />
                {!joiningDate && <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Probation Period (Months)</label>
              <input type="number" defaultValue="6" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" />
            </div>
          </div>
        </div>
        )}

        {/* Shift & WOFF Tab */}
        {activeTab === 'Shift & WOFF' && (
          <div className="space-y-6 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shift Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Shift</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Punch In Time</label>
                    <div className="relative">
                      <input 
                        type={punchIn ? "time" : "text"} 
                        placeholder="HH:MM" 
                        onFocus={(e) => (e.target.type = "time")}
                        onBlur={(e) => (!e.target.value ? (e.target.type = "text") : null)}
                        value={punchIn}
                        onChange={(e) => setPunchIn(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" 
                      />
                      {!punchIn && <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Punch Out Time</label>
                    <div className="relative">
                      <input 
                        type={punchOut ? "time" : "text"} 
                        placeholder="HH:MM" 
                        onFocus={(e) => (e.target.type = "time")}
                        onBlur={(e) => (!e.target.value ? (e.target.type = "text") : null)}
                        value={punchOut}
                        onChange={(e) => setPunchOut(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" 
                      />
                      {!punchOut && <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Off Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Weekly Off</h3>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Weekly Off Day</label>
                  <div className="relative">
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-gray-500 shadow-sm">
                      <option value="" disabled selected>Select</option>
                      <option value="sunday">Sunday</option>
                      <option value="monday">Monday</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                    <span className="text-[15px] text-gray-700">Weekly Off Payable</span>
                  </label>
                  <label className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                    <span className="text-[15px] text-gray-700">Variable Weekly Off</span>
                  </label>
                  <label className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                    <span className="text-[15px] text-gray-700">Second Weekly Off</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Other Details Card */}
            <div className="border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Other Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Late Allowed (Mins)</label>
                  <input type="number" defaultValue="15" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm mb-4" />
                  <label className="flex items-center gap-3 cursor-pointer w-fit">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                    <span className="text-[15px] text-gray-700">As Per Shift</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Early Allowed (Mins)</label>
                  <input type="number" defaultValue="15" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm mb-4" />
                  <label className="flex items-center gap-3 cursor-pointer w-fit">
                    <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                    <span className="text-[15px] text-gray-700">As Per Shift</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Half Day (Mins)</label>
                  <input type="number" defaultValue="240" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm mb-4" />
                  <label className="flex items-center gap-3 cursor-pointer w-fit">
                    <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                    <span className="text-[15px] text-gray-700">As Per Shift</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Full Day (Mins)</label>
                  <input type="number" defaultValue="480" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm mb-4" />
                  <label className="flex items-center gap-3 cursor-pointer w-fit">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                    <span className="text-[15px] text-gray-700">As Per Shift</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'Attendance' && (
          <div className="space-y-6 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Punch Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Punch</h3>
                
                <div className="mb-6">
                  <label className="block text-[15px] font-semibold text-gray-800 mb-4">Punch Type</label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="punchType" className="w-5 h-5 accent-[#1cabb1] border-gray-300" />
                      <span className="text-[15px] text-gray-700">Single</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="punchType" defaultChecked className="w-5 h-5 accent-[#1cabb1] border-gray-300" />
                      <span className="text-[15px] text-gray-700">Double</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="punchType" className="w-5 h-5 accent-[#1cabb1] border-gray-300" />
                      <span className="text-[15px] text-gray-700">Multiple</span>
                    </label>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2">No Out-Punch Found — Action</label>
                  <div className="relative">
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-gray-500 shadow-sm">
                      <option value="" disabled selected>Select</option>
                      <option value="mark_half_day">Mark Half Day</option>
                      <option value="mark_absent">Mark Absent</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-2">Present On WO / Holiday — Action</label>
                  <div className="relative">
                    <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-gray-500 shadow-sm">
                      <option value="" disabled selected>Select</option>
                      <option value="pay_ot">Pay OT</option>
                      <option value="comp_off">Give Comp Off</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Late Cut Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Late Cut</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2">Allowed Days</label>
                    <input type="number" defaultValue="3" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2">Action</label>
                    <div className="relative">
                      <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-gray-500 shadow-sm">
                        <option value="" disabled selected>Select</option>
                        <option value="deduct_salary">Deduct Salary</option>
                        <option value="deduct_leave">Deduct Leave</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                    <span className="text-[15px] text-gray-700">Late Cut Allowed</span>
                  </label>
                  <label className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                    <span className="text-[15px] text-gray-700">Extra Late Cut Deduction</span>
                  </label>
                  <label className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                    <span className="text-[15px] text-gray-700">Additional Late Cut In Leave Balance</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lunch & Early Going Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Lunch & Early Going</h3>
                
                <div className="grid grid-cols-[1fr_auto] gap-4 items-center mb-4">
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2">Lunch Allowed Mins</label>
                    <input type="number" defaultValue="0" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer mt-8 mr-4">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                    <span className="text-[15px] text-gray-700">As Per Shift</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                    <span className="text-[15px] text-gray-700">Lunch Allowed</span>
                  </label>
                  <label className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                    <span className="text-[15px] text-gray-700">Early Going Allowed</span>
                  </label>
                </div>
              </div>

              {/* Overtime Card */}
              <div className="border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Overtime</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                    <span className="text-[15px] text-gray-700">Overtime Allowed</span>
                  </label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                      <span className="text-[15px] text-gray-700">Custom OT</span>
                    </label>
                    <label className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                      <span className="text-[15px] text-gray-700">Before OT</span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[15px] font-semibold text-gray-800 mb-2">OT Grace Period (Mins)</label>
                      <input type="number" defaultValue="5" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-[15px] font-semibold text-gray-800 mb-2">1 Day OT Hrs</label>
                      <input type="number" defaultValue="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                    <span className="text-[15px] text-gray-700">OT As Per Shift</span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                    <span className="text-[15px] text-gray-700">Consider OT As COFF</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* WOFF / HOFF Tab */}
        {activeTab === 'WOFF & HOFF' && (
          <div className="space-y-6 mb-4">
            {/* Sandwich Absence Rules — Weekly Off */}
            <div className="border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Sandwich Absence Rules — Weekly Off</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" defaultChecked className="w-5 h-5 mt-0.5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                  <div>
                    <div className="text-[15px] font-medium text-gray-700">Absent Before Weekly Off</div>
                    <div className="text-xs text-gray-500 mt-1">Mark Absent If Employee Absent The Day Before WO.</div>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" defaultChecked className="w-5 h-5 mt-0.5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                  <div>
                    <div className="text-[15px] font-medium text-gray-700">Absent After Weekly Off</div>
                    <div className="text-xs text-gray-500 mt-1">Mark Absent If Employee Absent The Day After WO.</div>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" className="w-5 h-5 mt-0.5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                  <div>
                    <div className="text-[15px] font-medium text-gray-700">Absent Before Or After Weekly Off</div>
                    <div className="text-xs text-gray-500 mt-1">Either Side Triggers WO Absent.</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                  <span className="text-[15px] font-medium text-gray-700">Add Working Hrs On Weekly Off Day</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                  <span className="text-[15px] font-medium text-gray-700">Late Deduction Not Applied On WO If Present</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                  <span className="text-[15px] font-medium text-gray-700">LWP</span>
                </label>
              </div>
            </div>

            {/* Sandwich Absence Rules — Holiday */}
            <div className="border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Sandwich Absence Rules — Holiday</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                  <span className="text-[15px] font-medium text-gray-700">Absent Before Holiday</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                  <span className="text-[15px] font-medium text-gray-700">Absent After Holiday</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                  <span className="text-[15px] font-medium text-gray-700">Absent Before & After Holiday</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                  <span className="text-[15px] font-medium text-gray-700">Add Working Hours On Holiday Day</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                  <span className="text-[15px] font-medium text-gray-700">Late Deduction Not Applied On Holiday If Present</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                  <span className="text-[15px] font-medium text-gray-700">LWP</span>
                </label>
              </div>
            </div>

            {/* Leave Between Holiday Or Weekly Off */}
            <div className="border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Leave Between Holiday Or Weekly Off</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                  <span className="text-[15px] font-medium text-gray-700">Consider "Weekly Off" In Leave Application</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                  <span className="text-[15px] font-medium text-gray-700">Consider "Holiday" In Leave Application</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                  <span className="text-[15px] font-medium text-gray-700">Absent — WO — Leave = WO Absent</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                  <span className="text-[15px] font-medium text-gray-700">Leave — WO — Absent = WO Absent</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                  <span className="text-[15px] font-medium text-gray-700">Absent — Holiday — Leave = Holiday Absent</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="checkbox" className="w-5 h-5 rounded-[4px] border-gray-300 accent-[#1cabb1] cursor-pointer" />
                  <span className="text-[15px] font-medium text-gray-700">Leave — Holiday — Absent = Holiday Absent</span>
                </label>
              </div>
            </div>

            {/* Leave Settings */}
            <div className="border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Leave Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-3">Leave In Cash</label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="leaveInCash" className="w-5 h-5 accent-[#1cabb1] border-gray-300" />
                      <span className="text-[15px] text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="leaveInCash" defaultChecked className="w-5 h-5 accent-[#1cabb1] border-gray-300" />
                      <span className="text-[15px] text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-gray-800 mb-3">Leave Carry Forward</label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="leaveCarryForward" defaultChecked className="w-5 h-5 accent-[#1cabb1] border-gray-300" />
                      <span className="text-[15px] text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="leaveCarryForward" className="w-5 h-5 accent-[#1cabb1] border-gray-300" />
                      <span className="text-[15px] text-gray-700">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KRA Settings Tab */}
        {activeTab === 'KRA Settings' && (
          <div className="space-y-6 mb-4">
            <div className="border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">KRA Settings (Yearly)</h3>
              
              <div className="space-y-6">
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2">Product</label>
                    <div className="relative">
                      <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-gray-500 shadow-sm">
                        <option value="" disabled>Select</option>
                        <option value="fixed_deposit" selected>Fixed Deposit</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2">Target</label>
                    <input type="text" defaultValue="₹24,00,000" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2">Product</label>
                    <div className="relative">
                      <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-gray-500 shadow-sm">
                        <option value="" disabled>Select</option>
                        <option value="loan_disbursement" selected>Loan Disbursement</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2">Target</label>
                    <input type="text" defaultValue="₹24,00,000" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2">Product</label>
                    <div className="relative">
                      <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white appearance-none text-gray-500 shadow-sm">
                        <option value="" disabled>Select</option>
                        <option value="savings_account" selected>Savings Account</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[15px] font-semibold text-gray-800 mb-2">Target</label>
                    <input type="text" defaultValue="1,200" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-all bg-white shadow-sm" />
                  </div>
                </div>

                {/* Add More Target Link */}
                <div className="flex justify-end pt-2">
                  <button className="text-[#1cabb1] hover:text-[#168f94] font-medium text-[15px] transition-colors">
                    + Add More Target
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end items-center gap-4 pt-6 mt-4 border-t border-gray-100">
          <div className="flex gap-4">
            <Link
              to="/employees"
              className="px-8 py-2.5 rounded-full border-2 border-[#1cabb1] text-[#1cabb1] bg-white hover:bg-teal-50 font-semibold transition-colors"
            >
              Cancel
            </Link>
            <Link
              to="/employees"
              className="px-8 py-2.5 rounded-full bg-[#1cabb1] hover:bg-[#168f94] text-white font-semibold transition-colors shadow-sm"
            >
              Create
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEmployee;
