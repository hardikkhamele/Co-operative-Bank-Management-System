import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Settings, Lock, Camera, Edit, Building2, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  validatePhone, 
  validateEmail, 
  validatePassword, 
  sanitizeDigits 
} from '../../utils/validation';

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Chen Sophia',
    phone: '9876543210',
    email: 'staff@company.com'
  });
  const [editForm, setEditForm] = useState({
    name: 'Chen Sophia',
    phone: '9876543210',
    email: 'staff@company.com'
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleOpenEdit = () => {
    setEditForm({ ...profileData });
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    if (!editForm.name.trim()) {
      toast.error('Name is required.');
      return;
    }
    const phoneErr = validatePhone(editForm.phone).error;
    if (phoneErr) {
      toast.error(phoneErr);
      return;
    }
    const emailErr = validateEmail(editForm.email).error;
    if (emailErr) {
      toast.error(emailErr);
      return;
    }

    setProfileData({ ...editForm });
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!passwords.currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }
    const passErr = validatePassword(passwords.newPassword).error;
    if (passErr) {
      toast.error(passErr);
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New Password and Confirm Password do not match.');
      return;
    }

    toast.success('Password updated successfully!');
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

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
            <h2 className="text-2xl md:text-3xl font-bold mb-1">{profileData.name}</h2>
            <p className="text-white/90 text-sm mb-1">{profileData.email}</p>
            <p className="text-white/90 text-sm">{profileData.phone}</p>
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
                onClick={handleOpenEdit}
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

            <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="md:col-span-2 md:max-w-md">
                <label className="block text-sm font-bold text-gray-800 mb-2">Current Password *</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="md:col-span-2 md:max-w-md">
                <label className="block text-sm font-bold text-gray-800 mb-2">New Password * (Min 6 characters)</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="md:col-span-2 md:max-w-md">
                <label className="block text-sm font-bold text-gray-800 mb-2">Confirm Password *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/20 focus:border-[#1cabb1] transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-start pt-4 border-t border-gray-100">
                <button 
                  type="submit"
                  className="bg-[#1cabb1] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-teal-600 transition-colors shadow-sm"
                >
                  Update Password
                </button>
              </div>
            </form>
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
                <label className="block text-sm font-bold text-gray-800 mb-2">Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/50 focus:border-[#1cabb1] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Phone * (10 Digits)</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: sanitizeDigits(e.target.value, 10) })}
                  className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/50 focus:border-[#1cabb1] transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Email *</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1cabb1]/50 focus:border-[#1cabb1] transition-colors"
                  required
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
                onClick={handleSaveProfile}
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

