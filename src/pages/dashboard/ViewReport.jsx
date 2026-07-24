import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Phone, Mail, MapPin } from 'lucide-react';

const ViewReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      
      {/* Breadcrumb */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0">
        <h1 className="text-[22px] font-bold text-[#1b58a6] mb-3">View Report</h1>
        <div className="flex items-center text-[13px] font-medium text-gray-500 flex-wrap gap-y-2">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="mx-1" />
          <span>HR Management</span>
          <ChevronRight size={14} className="mx-1" />
          <Link to="/kpa-report" className="hover:text-gray-800 transition-colors">KPA Report</Link>
          <ChevronRight size={14} className="mx-1" />
          <span className="text-[#1b58a6]">View Report</span>
        </div>
      </div>

      {/* Employee Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm shrink-0">
            <img 
              src={`https://ui-avatars.com/api/?name=Clark+Kent&background=F3E8FF&color=9333EA&size=100`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-bold text-gray-800">Clark Kent</h2>
            <span className="inline-flex px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[12px] font-bold w-max">
              Branch Manager
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
              <Phone size={16} className="text-[#1cabb1]" /> 98765 43210
            </div>
            <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
              <Mail size={16} className="text-[#1cabb1]" /> example@gmail.com
            </div>
            <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
              <MapPin size={16} className="text-[#1cabb1]" /> Mumbai Branch
            </div>
          </div>
          <button 
            onClick={() => navigate(`/kpa-report/view/${id || 1}/add-kra`)}
            className="bg-[#1cabb1] hover:bg-[#159a9f] text-white px-6 py-2.5 rounded-full text-[14px] font-semibold transition-colors shadow-sm self-start sm:self-center"
          >
            Add New KRA
          </button>
        </div>
      </div>

      {/* Target Overview Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-[16px] font-bold text-gray-800">Target Overview</h2>
          <div className="flex items-center gap-3">
            <select className="px-4 py-2 rounded-lg border border-gray-200 text-[13px] text-gray-700 font-semibold focus:outline-none focus:border-[#1cabb1] bg-white">
              <option>FY 2026-27</option>
              <option>FY 2025-26</option>
            </select>
            <select className="px-4 py-2 rounded-lg border border-gray-200 text-[13px] text-gray-700 font-semibold focus:outline-none focus:border-[#1cabb1] bg-white">
              <option>Under Probation/Intern</option>
              <option>Permanent</option>
            </select>
          </div>
        </div>

        <div className="p-8 flex flex-col gap-8">
          
          {/* Yearly Target */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-sm border-2 border-green-500"></div>
                </div>
                <div>
                  <div className="text-[14px] font-bold text-gray-800">Yearly Target</div>
                  <div className="text-[13px] font-medium text-gray-500">₹18,40,000 / ₹23,00,000</div>
                </div>
              </div>
              <div className="text-[14px] font-bold text-green-500">80%</div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>

          {/* Monthly Target */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-sm border-2 border-blue-500"></div>
                </div>
                <div>
                  <div className="text-[14px] font-bold text-gray-800">Monthly Target</div>
                  <div className="text-[13px] font-medium text-gray-500">₹1,30,000 / ₹1,60,000</div>
                </div>
              </div>
              <div className="text-[14px] font-bold text-blue-500">81%</div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '81%' }}></div>
            </div>
          </div>

          {/* Weekly Target */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-sm border-2 border-purple-500"></div>
                </div>
                <div>
                  <div className="text-[14px] font-bold text-gray-800">Weekly Target</div>
                  <div className="text-[13px] font-medium text-gray-500">₹80,000 / ₹1,10,000</div>
                </div>
              </div>
              <div className="text-[14px] font-bold text-purple-500">72%</div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '72%' }}></div>
            </div>
          </div>

          {/* Daily Target */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-sm border-2 border-orange-500"></div>
                </div>
                <div>
                  <div className="text-[14px] font-bold text-gray-800">Daily Target</div>
                  <div className="text-[13px] font-medium text-gray-500">₹8,000 / ₹10,000</div>
                </div>
              </div>
              <div className="text-[14px] font-bold text-orange-500">80%</div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewReport;
