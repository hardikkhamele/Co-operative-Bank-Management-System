import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Settings, Lock, Camera, Edit, Building2, X } from 'lucide-react';

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Chen Sophia',
    phone: '9876543210',
    email: 'staff@company.com'
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-10">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-[#1b58a6] mb-2">My Profile</h1>
        <div className="flex items-center text-sm font-medium">
          <Link to="/dashboard" className="text-gray-500 hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="text-[#1b58a6]">My Profile</span>
        </div>
      </div>

      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-[#4a34b8] via-[#2f75b8] to-[#1cabb1] rounded-xl p-6 md:p-8 flex items-center justify-between text-white shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shrink-0 bg-gray-200 border-2 border-white/20 shadow-md">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1">Chen Sophia</h2>
            <p className="text-white/90 text-sm mb-1">staff@company.com</p>
            <p className="text-white/90 text-sm">9876543210</p>
          </div>
        </div>
        <div className="bg-white/20 border border-white/40 px-4 py-1.5 rounded-full flex items-center gap-2 relative z-10 shadow-sm backdrop-blur-sm">
          <Building2 size={16} className="text-white" />
          <span className="text-sm font-bold text-white">Bank CEO</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'general'
              ? 'bg-[#f0f2ff] text-gray-800'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Settings size={18} />
          General
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'security'
              ? 'bg-[#f0f2ff] text-gray-800'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Lock size={18} />
          Security
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        {activeTab === 'general' ? (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Personal Information</h3>
            <p className="text-gray-500 text-sm mb-8">Update Your Personal Details</p>

            <div className="relative w-24 h-24 mb-8">
              <div className="w-full h-full rounded-full border-[3px] border-[#1cabb1] overflow-hidden bg-gray-100 p-0.5">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover rounded-full" />
              </div>
              <button className="absolute bottom-0 right-0 bg-[#1cabb1] text-white p-1.5 rounded-full shadow-md border-2 border-white hover:bg-teal-600 transition-colors">
                <Camera size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  readOnly
                  className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Phone</label>
                <input
                  type="text"
                  value={profileData.phone}
                  readOnly
                  className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  readOnly
                  className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100">
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-[#1cabb1] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-teal-600 transition-colors shadow-sm"
              >
                <Edit size={16} />
                Edit
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Change Password</h3>
            <p className="text-gray-500 text-sm mb-8">Ensure Your Account Stays Secure</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="md:col-span-2 md:max-w-md">
                <label className="block text-sm font-bold text-gray-800 mb-2">Current Password</label>
                <input
                  type="password"
                  placeholder="********"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] transition-colors"
                />
              </div>
              <div className="md:col-span-2 md:max-w-md">
                <label className="block text-sm font-bold text-gray-800 mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="********"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] transition-colors"
                />
              </div>
              <div className="md:col-span-2 md:max-w-md">
                <label className="block text-sm font-bold text-gray-800 mb-2">Confirm Password</label>
                <input
                  type="password"
                  placeholder="********"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#1cabb1] focus:border-[#1cabb1] transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100">
              <button className="bg-[#1cabb1] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-teal-600 transition-colors shadow-sm">
                Update Password
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Edit Profile</h3>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/50 focus:border-[#1cabb1] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Phone</label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/50 focus:border-[#1cabb1] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/50 focus:border-[#1cabb1] transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="bg-[#1cabb1] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;

