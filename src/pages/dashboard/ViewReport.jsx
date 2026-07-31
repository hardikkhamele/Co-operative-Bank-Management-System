import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Phone, Mail, MapPin, Target, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Jan', target: 28, achievement: 18 },
  { name: 'Feb', target: 20, achievement: 30 },
  { name: 'Mar', target: 23, achievement: 28 },
  { name: 'Apr', target: 35, achievement: 55 },
  { name: 'May', target: 32, achievement: 22 },
  { name: 'Jun', target: 85, achievement: 20 },
  { name: 'Jul', target: 110, achievement: 45 },
  { name: 'Aug', target: 60, achievement: 30 },
  { name: 'Sep', target: 45, achievement: 80 },
  { name: 'Oct', target: 70, achievement: 85 },
  { name: 'Nov', target: 75, achievement: 110 },
  { name: 'Dec', target: 80, achievement: 125 },
];
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

      {/* Progress Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-[20px] font-bold text-gray-800">Progress</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-200 text-[14px] text-gray-700 font-medium focus:outline-none focus:border-[#1cabb1] bg-white">
                <option>Loan Disbursement</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            <div className="relative">
              <select className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-200 text-[14px] text-gray-700 font-medium focus:outline-none focus:border-[#1cabb1] bg-white">
                <option>Yearly</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="p-8 flex flex-col gap-8">
          
          {/* Yearly Target Inner */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                  <Target size={24} className="text-white" />
                </div>
                <div>
                  <div className="text-[14px] font-medium text-gray-800">Yearly Target</div>
                  <div className="text-[14px] font-bold text-gray-800 mt-1">₹14,40,000 <span className="text-gray-500 font-medium">/ ₹24,00,000</span></div>
                </div>
              </div>
              <div className="text-[14px] font-bold text-green-500">60%</div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 mt-1">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>

          {/* Charts and Summary Row */}
          <div className="flex flex-col lg:flex-row gap-6 mt-2">
            
            {/* Target Overview Chart */}
            <div className="flex-1 border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-6 mb-6">
                <h3 className="text-[15px] font-bold text-gray-800">Target Overview</h3>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#1cabb1]"></div>
                    <span className="text-[13px] text-gray-600 font-medium">Target</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    <span className="text-[13px] text-gray-600 font-medium">Achievement</span>
                  </div>
                </div>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => value === 0 ? '₹0' : `₹${value}K`}
                      ticks={[0, 10, 20, 30, 50, 100, 200]}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`₹${value}K`, '']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="achievement" 
                      stroke="#6b7280" 
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                      activeDot={{ r: 6 }}
                      name="Achievement"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#1cabb1" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                      name="Target"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Target Summary */}
            <div className="w-full lg:w-[320px] border border-gray-200 rounded-xl p-6 flex flex-col justify-center">
              <h3 className="text-[15px] font-bold text-gray-800 mb-6">Target Summary</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-gray-600 font-medium">Target</span>
                  <span className="text-[14px] font-bold text-gray-800">₹24,00,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-gray-600 font-medium">Achieved</span>
                  <span className="text-[14px] font-bold text-gray-800">₹14,40,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-gray-600 font-medium">Pending</span>
                  <span className="text-[14px] font-bold text-gray-800">₹9,60,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-gray-600 font-medium">Days Left</span>
                  <span className="text-[14px] font-bold text-gray-800">150 Days</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default ViewReport;
