import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  Settings, 
  Lock, 
  Camera, 
  Edit, 
  Building2, 
  X, 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  User, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Building, 
  CheckCircle2, 
  Loader2,
  UploadCloud,
  AlertCircle
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { toast } from 'react-toastify';
import { Skeleton, SkeletonText, SkeletonAvatar } from '../../components/common/Skeleton';
import { 
  validatePhone, 
  validateEmail, 
  validatePassword, 
  sanitizeDigits 
} from '../../utils/validation';
import profileService from '../../api/profileService';
import useAuthStore from '../../store/authStore';

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fileInputRef = useRef(null);
  const modalFileInputRef = useRef(null);

  const authUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  // Profile data state
  const [profileData, setProfileData] = useState({
    id: '',
    fullName: '',
    name: '',
    email: '',
    phoneNumber: '',
    phone: '',
    avatar: '',
    profileImage: '',
    role: '',
    roleName: 'Bank Staff',
    userType: 'SOCIETY_USER',
    status: 'ACTIVE',
    lastLoginAt: null,
    createdAt: null,
    bank: null,
    branch: null
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: null,
    avatarPreview: ''
  });

  // Password change state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch Profile on Mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await profileService.getProfile();
      if (res && res.success && res.data) {
        const user = res.data.user || {};
        const profile = res.data.profile || {};
        
        const mergedData = {
          id: user.id || user._id || '',
          fullName: user.fullName || profile.fullName || user.name || profile.name || 'User',
          name: user.name || profile.name || user.fullName || profile.fullName || 'User',
          email: user.email || profile.email || '',
          phoneNumber: user.phoneNumber || profile.phoneNumber || user.phone || profile.phone || '',
          phone: user.phone || profile.phone || user.phoneNumber || profile.phoneNumber || '',
          avatar: user.avatar || profile.avatar || user.profileImage || profile.profileImage || '',
          profileImage: user.profileImage || profile.profileImage || user.avatar || profile.avatar || '',
          role: user.role || profile.role || '',
          roleName: user.roleName || profile.roleName || (user.role ? user.role.replace(/_/g, ' ') : 'Bank Staff'),
          userType: user.userType || 'SOCIETY_USER',
          status: user.status || 'ACTIVE',
          lastLoginAt: user.lastLoginAt || null,
          createdAt: user.createdAt || null,
          bank: profile.bank || null,
          branch: profile.branch || null
        };

        setProfileData(mergedData);
        // Sync global auth store
        if (updateUser) {
          updateUser({
            ...user,
            fullName: mergedData.fullName,
            name: mergedData.name,
            email: mergedData.email,
            phoneNumber: mergedData.phoneNumber,
            avatar: mergedData.avatar
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      const errMsg = err.response?.data?.message || 'Failed to load profile from server.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = () => {
    setEditForm({
      name: profileData.fullName || profileData.name || '',
      email: profileData.email || '',
      phone: profileData.phoneNumber || profileData.phone || '',
      avatar: null,
      avatarPreview: profileData.avatar || profileData.profileImage || ''
    });
    setIsEditing(true);
  };

  // Direct avatar file change from header/card camera button
  const handleDirectAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('fullName', profileData.fullName || profileData.name);

    try {
      setUploadingAvatar(true);
      const res = await profileService.updateProfile(formData);
      if (res && res.success) {
        const updatedUser = res.data?.user || {};
        const newAvatar = updatedUser.avatar || updatedUser.profileImage || URL.createObjectURL(file);
        
        setProfileData((prev) => ({
          ...prev,
          avatar: newAvatar,
          profileImage: newAvatar
        }));

        if (updateUser) {
          updateUser({ avatar: newAvatar, profileImage: newAvatar });
        }
        toast.success(res.message || 'Profile avatar updated successfully!');
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      const msg = err.response?.data?.message || 'Failed to update avatar. Please try again.';
      toast.error(msg);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Modal avatar selection
  const handleModalAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    setEditForm({
      ...editForm,
      avatar: file,
      avatarPreview: URL.createObjectURL(file)
    });
  };

  // Save changes from Edit Profile Modal
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!editForm.name.trim()) {
      toast.error('Full Name is required.');
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

    try {
      setSavingProfile(true);

      let payload;
      if (editForm.avatar instanceof File) {
        payload = new FormData();
        payload.append('fullName', editForm.name.trim());
        payload.append('name', editForm.name.trim());
        payload.append('phoneNumber', editForm.phone.trim());
        payload.append('phone', editForm.phone.trim());
        payload.append('email', editForm.email.trim().toLowerCase());
        payload.append('avatar', editForm.avatar);
      } else {
        payload = {
          fullName: editForm.name.trim(),
          name: editForm.name.trim(),
          phoneNumber: editForm.phone.trim(),
          phone: editForm.phone.trim(),
          email: editForm.email.trim().toLowerCase()
        };
      }

      const res = await profileService.updateProfile(payload);

      if (res && res.success) {
        const updatedUser = res.data?.user || {};
        const newFullName = updatedUser.fullName || updatedUser.name || editForm.name;
        const newEmail = updatedUser.email || editForm.email;
        const newPhone = updatedUser.phoneNumber || updatedUser.phone || editForm.phone;
        const newAvatar = updatedUser.avatar || updatedUser.profileImage || editForm.avatarPreview || profileData.avatar;

        setProfileData((prev) => ({
          ...prev,
          fullName: newFullName,
          name: newFullName,
          email: newEmail,
          phoneNumber: newPhone,
          phone: newPhone,
          avatar: newAvatar,
          profileImage: newAvatar
        }));

        if (updateUser) {
          updateUser({
            fullName: newFullName,
            name: newFullName,
            email: newEmail,
            phoneNumber: newPhone,
            phone: newPhone,
            avatar: newAvatar
          });
        }

        toast.success(res.message || 'Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Save profile error:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.details || 'Failed to update profile.';
      toast.error(errMsg);
    } finally {
      setSavingProfile(false);
    }
  };

  // Change Password
  const handlePasswordChange = async (e) => {
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

    try {
      setSavingPassword(true);
      const res = await profileService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword
      });

      if (res && res.success) {
        toast.success(res.message || 'Your password has been changed successfully.');
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      console.error('Password change error:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.details || 'Failed to change password.';
      toast.error(errMsg);
    } finally {
      setSavingPassword(false);
    }
  };

  const displayName = profileData.fullName || profileData.name || 'User Profile';
  const displayAvatar = profileData.avatar || profileData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1D4ED8&color=fff`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-12">
      {/* Hidden File Input for Avatar Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleDirectAvatarUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Header Breadcrumb Card */}
      <PageHeader
        title="My Profile"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "My Profile" }
        ]}
      >
        <button
          onClick={handleOpenEdit}
          className="flex items-center gap-2 bg-[#225091] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#17969b] transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Edit size={16} />
          <span>Edit Profile</span>
        </button>
      </PageHeader>

      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-[#4a34b8] via-[#2f75b8] to-[#225091] rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between text-white shadow-md relative overflow-hidden gap-6">
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative group">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shrink-0 bg-white/20 border-2 border-white shadow-lg flex items-center justify-center">
              {uploadingAvatar ? (
                <Loader2 size={32} className="animate-spin text-white" />
              ) : (
                <img 
                  src={displayAvatar} 
                  alt={displayName} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1D4ED8&color=fff`;
                  }}
                />
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              title="Change Profile Photo"
              className="absolute bottom-0 right-0 bg-white text-[#225091] p-1.5 rounded-full shadow-lg hover:bg-gray-100 transition-all border border-gray-200 cursor-pointer group-hover:scale-110 active:scale-95"
            >
              <Camera size={14} />
            </button>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1 tracking-tight">{displayName}</h2>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-white/90 text-sm">
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="text-white/80" /> {profileData.email || '—'}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={14} className="text-white/80" /> {profileData.phoneNumber || profileData.phone || '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 relative z-10">
          <div className="bg-white/20 border border-white/40 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm backdrop-blur-sm">
            <Building2 size={16} className="text-white" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">{profileData.roleName}</span>
          </div>
          {profileData.status && (
            <div className="bg-emerald-500/30 border border-emerald-300/50 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-emerald-100 backdrop-blur-sm">
              <CheckCircle2 size={13} /> {profileData.status}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'general'
              ? 'bg-[#225091] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Settings size={18} />
          Personal Info & Bank
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'security'
              ? 'bg-[#225091] text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Lock size={18} />
          Security & Password
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        {loading ? (
          <div className="space-y-8" role="status" aria-busy="true">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48 rounded-md" />
                <Skeleton className="h-3.5 w-64 rounded-md" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-slate-50/50 space-y-2">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-4.5 w-40 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'general' ? (
          <div className="space-y-8">
            {/* Personal Details Section */}
            <div>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
                  <p className="text-gray-500 text-sm">Account identity and contact details</p>
                </div>
                <button 
                  onClick={handleOpenEdit}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#225091] hover:text-[#17969b] transition-colors"
                >
                  <Edit size={15} /> Edit Details
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <User size={14} className="text-[#225091]" /> Full Name
                  </div>
                  <div className="text-base font-bold text-gray-800">{displayName}</div>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <Phone size={14} className="text-[#225091]" /> Phone Number
                  </div>
                  <div className="text-base font-bold text-gray-800">{profileData.phoneNumber || profileData.phone || '—'}</div>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <Mail size={14} className="text-[#225091]" /> Email Address
                  </div>
                  <div className="text-base font-bold text-gray-800 break-all">{profileData.email || '—'}</div>
                </div>
              </div>
            </div>

            {/* Bank / Tenant Context Section */}
            {profileData.bank && (
              <div className="pt-4 border-t border-gray-100">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Building size={20} className="text-[#225091]" />
                    Associated Bank Information
                  </h3>
                  <p className="text-gray-500 text-sm">Tenant bank organization details linked to this account</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-[#f8fafc] rounded-xl border border-slate-200/80">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Bank Name</div>
                    <div className="text-base font-bold text-[#225091]">{profileData.bank.name || 'Advita Co-operative Bank'}</div>
                    {profileData.bank.code && (
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-50 text-[#225091] font-mono font-semibold rounded">
                        CODE: {profileData.bank.code}
                      </span>
                    )}
                  </div>

                  <div className="p-4 bg-[#f8fafc] rounded-xl border border-slate-200/80">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Bank Contact</div>
                    <div className="text-sm font-medium text-gray-800">{profileData.bank.email || profileData.email}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{profileData.bank.phoneNumber || profileData.phone}</div>
                  </div>

                  <div className="p-4 bg-[#f8fafc] rounded-xl border border-slate-200/80 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Organization Status</div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={12} /> {profileData.bank.status || 'ACTIVE'}
                      </span>
                    </div>
                    {profileData.createdAt && (
                      <div className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                        <Calendar size={11} /> Member since {new Date(profileData.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Account Metadata Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <ShieldCheck size={16} className="text-[#225091]" />
                <div>
                  <span className="font-semibold text-gray-700">Role:</span> {profileData.roleName}
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Clock size={16} className="text-[#225091]" />
                <div>
                  <span className="font-semibold text-gray-700">Last Login:</span> {profileData.lastLoginAt ? new Date(profileData.lastLoginAt).toLocaleString() : 'Active session'}
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Building2 size={16} className="text-[#225091]" />
                <div>
                  <span className="font-semibold text-gray-700">Context:</span> Society Panel
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Change Password</h3>
              <p className="text-gray-500 text-sm">Ensure your account stays protected by using a strong password</p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-6 max-w-lg">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-2.5 pr-11 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-2.5 pr-11 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Must be at least 6 characters long.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-2.5 pr-11 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-3">
                <button 
                  type="submit"
                  disabled={savingPassword}
                  className="flex items-center justify-center gap-2 bg-[#225091] text-white px-7 py-2.5 rounded-lg text-sm font-bold hover:bg-[#17969b] transition-all shadow-md active:scale-95 disabled:opacity-60"
                >
                  {savingPassword ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Edit Profile</h3>
                <p className="text-xs text-gray-500">Update personal information and photo</p>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              {/* Modal Avatar Selection */}
              <div className="flex items-center gap-4 pb-2 border-b border-gray-100">
                <input 
                  type="file" 
                  ref={modalFileInputRef} 
                  onChange={handleModalAvatarSelect} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-[#225091] shrink-0">
                  <img 
                    src={editForm.avatarPreview || displayAvatar} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#225091] bg-[#225091]/10 px-3 py-1.5 rounded-md hover:bg-[#225091]/20 transition-colors"
                  >
                    <UploadCloud size={14} /> Upload New Photo
                  </button>
                  <p className="text-[11px] text-gray-400 mt-1">JPG, PNG or WEBP up to 5MB</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. Chen Sophia"
                  className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#225091]/30 focus:border-[#225091] transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  Phone Number <span className="text-red-500">*</span> (10 Digits)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: sanitizeDigits(e.target.value, 10) })}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#225091]/30 focus:border-[#225091] transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="e.g. staff@company.com"
                  className="w-full bg-white border border-gray-300 text-gray-800 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#225091]/30 focus:border-[#225091] transition-all text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={savingProfile}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 bg-[#225091] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#17969b] transition-all shadow-md active:scale-95 disabled:opacity-60"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
