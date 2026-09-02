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

const PROFILE_LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 50,
  PHONE_DIGITS: 10,
  EMAIL_MAX: 100,
  PASSWORD_MIN: 6,
  PASSWORD_MAX: 50,
  AVATAR_MAX_SIZE_MB: 5
};

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

  // Form validation states
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [avatarError, setAvatarError] = useState('');

  // Password change state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordTouched, setPasswordTouched] = useState({});

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

  // Validation Helper for Edit Profile Form
  const validateProfileField = (fieldName, value) => {
    switch (fieldName) {
      case 'name': {
        const val = String(value || '').trim();
        if (!val) return 'Full Name is required.';
        if (val.length < PROFILE_LIMITS.NAME_MIN) return `Full Name must be at least ${PROFILE_LIMITS.NAME_MIN} characters.`;
        if (val.length > PROFILE_LIMITS.NAME_MAX) return `Full Name cannot exceed ${PROFILE_LIMITS.NAME_MAX} characters.`;
        if (!/^[a-zA-Z\s.'-]+$/.test(val)) return 'Full Name should only contain letters, spaces, hyphens, and dots.';
        return null;
      }
      case 'phone': {
        const digits = String(value || '').replace(/\D/g, '');
        if (!digits) return 'Phone number is required.';
        if (digits.length !== PROFILE_LIMITS.PHONE_DIGITS) return `Phone number must be exactly ${PROFILE_LIMITS.PHONE_DIGITS} digits.`;
        if (!/^[6-9]\d{9}$/.test(digits)) return 'Phone number must start with 6, 7, 8, or 9.';
        return null;
      }
      case 'email': {
        const val = String(value || '').trim();
        if (!val) return 'Email address is required.';
        if (val.length > PROFILE_LIMITS.EMAIL_MAX) return `Email cannot exceed ${PROFILE_LIMITS.EMAIL_MAX} characters.`;
        const emailErr = validateEmail(val).error;
        if (emailErr) return emailErr;
        return null;
      }
      default:
        return null;
    }
  };

  // Validation Helper for Password Change Form
  const validatePasswordField = (fieldName, value, allValues = passwords) => {
    switch (fieldName) {
      case 'currentPassword': {
        if (!value) return 'Current password is required.';
        if (value.length > PROFILE_LIMITS.PASSWORD_MAX) return `Password cannot exceed ${PROFILE_LIMITS.PASSWORD_MAX} characters.`;
        return null;
      }
      case 'newPassword': {
        if (!value) return 'New password is required.';
        if (value.length < PROFILE_LIMITS.PASSWORD_MIN) return `New password must be at least ${PROFILE_LIMITS.PASSWORD_MIN} characters.`;
        if (value.length > PROFILE_LIMITS.PASSWORD_MAX) return `New password cannot exceed ${PROFILE_LIMITS.PASSWORD_MAX} characters.`;
        return null;
      }
      case 'confirmPassword': {
        if (!value) return 'Please confirm your new password.';
        if (value !== allValues.newPassword) return 'New Password and Confirm Password do not match.';
        return null;
      }
      default:
        return null;
    }
  };

  const handleOpenEdit = () => {
    setEditForm({
      name: (profileData.fullName || profileData.name || '').slice(0, PROFILE_LIMITS.NAME_MAX),
      email: (profileData.email || '').slice(0, PROFILE_LIMITS.EMAIL_MAX),
      phone: sanitizeDigits(profileData.phoneNumber || profileData.phone || '', PROFILE_LIMITS.PHONE_DIGITS),
      avatar: null,
      avatarPreview: profileData.avatar || profileData.profileImage || ''
    });
    setFormErrors({});
    setFormTouched({});
    setAvatarError('');
    setIsEditing(true);
  };

  const handleEditFieldChange = (field, value) => {
    let sanitizedVal = value;
    if (field === 'phone') {
      sanitizedVal = sanitizeDigits(value, PROFILE_LIMITS.PHONE_DIGITS);
    } else if (field === 'name') {
      sanitizedVal = value.slice(0, PROFILE_LIMITS.NAME_MAX);
    } else if (field === 'email') {
      sanitizedVal = value.slice(0, PROFILE_LIMITS.EMAIL_MAX);
    }

    setEditForm(prev => ({
      ...prev,
      [field]: sanitizedVal
    }));

    if (formTouched[field]) {
      const err = validateProfileField(field, sanitizedVal);
      setFormErrors(prev => ({
        ...prev,
        [field]: err
      }));
    }
  };

  const handleEditFieldBlur = (field) => {
    setFormTouched(prev => ({ ...prev, [field]: true }));
    const err = validateProfileField(field, editForm[field]);
    setFormErrors(prev => ({
      ...prev,
      [field]: err
    }));
  };

  // Direct avatar file change from header/card camera button
  const handleDirectAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > PROFILE_LIMITS.AVATAR_MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image size must be less than ${PROFILE_LIMITS.AVATAR_MAX_SIZE_MB}MB.`);
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
      setAvatarError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      toast.error('Please select a valid image file.');
      return;
    }

    if (file.size > PROFILE_LIMITS.AVATAR_MAX_SIZE_MB * 1024 * 1024) {
      setAvatarError(`Image size must be less than ${PROFILE_LIMITS.AVATAR_MAX_SIZE_MB}MB.`);
      toast.error(`Image size must be less than ${PROFILE_LIMITS.AVATAR_MAX_SIZE_MB}MB.`);
      return;
    }

    setAvatarError('');
    setEditForm({
      ...editForm,
      avatar: file,
      avatarPreview: URL.createObjectURL(file)
    });
  };

  // Save changes from Edit Profile Modal
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const nameErr = validateProfileField('name', editForm.name);
    const phoneErr = validateProfileField('phone', editForm.phone);
    const emailErr = validateProfileField('email', editForm.email);

    const errors = {};
    if (nameErr) errors.name = nameErr;
    if (phoneErr) errors.phone = phoneErr;
    if (emailErr) errors.email = emailErr;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setFormTouched({ name: true, phone: true, email: true });
      toast.error(nameErr || phoneErr || emailErr || 'Please resolve form validation errors.');
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
        const newFullName = updatedUser.fullName || updatedUser.name || editForm.name.trim();
        const newEmail = updatedUser.email || editForm.email.trim().toLowerCase();
        const newPhone = updatedUser.phoneNumber || updatedUser.phone || editForm.phone.trim();
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

  // Handle password input changes
  const handlePasswordFieldChange = (field, value) => {
    const limitedVal = value.slice(0, PROFILE_LIMITS.PASSWORD_MAX);
    const updatedPasswords = { ...passwords, [field]: limitedVal };
    setPasswords(updatedPasswords);

    if (passwordTouched[field]) {
      const err = validatePasswordField(field, limitedVal, updatedPasswords);
      setPasswordErrors(prev => ({
        ...prev,
        [field]: err
      }));
    }
  };

  const handlePasswordFieldBlur = (field) => {
    setPasswordTouched(prev => ({ ...prev, [field]: true }));
    const err = validatePasswordField(field, passwords[field], passwords);
    setPasswordErrors(prev => ({
      ...prev,
      [field]: err
    }));
  };

  // Change Password
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    const currErr = validatePasswordField('currentPassword', passwords.currentPassword, passwords);
    const newErr = validatePasswordField('newPassword', passwords.newPassword, passwords);
    const confErr = validatePasswordField('confirmPassword', passwords.confirmPassword, passwords);

    const errors = {};
    if (currErr) errors.currentPassword = currErr;
    if (newErr) errors.newPassword = newErr;
    if (confErr) errors.confirmPassword = confErr;

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      setPasswordTouched({ currentPassword: true, newPassword: true, confirmPassword: true });
      toast.error(currErr || newErr || confErr || 'Please resolve password validation errors.');
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
        setPasswordErrors({});
        setPasswordTouched({});
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
        <div className="flex items-center gap-6 relative z-10 min-w-0 max-w-full">
          <div className="relative group shrink-0">
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
          <div className="min-w-0 flex-1">
            <h2 
              className="text-2xl md:text-3xl font-bold mb-1 tracking-tight truncate max-w-md md:max-w-xl" 
              title={displayName}
            >
              {displayName}
            </h2>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-white/90 text-sm min-w-0">
              <span 
                className="flex items-center gap-1.5 truncate max-w-[260px] cursor-default" 
                title={`Email: ${profileData.email || '—'}`}
              >
                <Mail size={14} className="text-white/80 shrink-0" />
                <span className="truncate">{profileData.email || '—'}</span>
              </span>
              <span 
                className="flex items-center gap-1.5 truncate max-w-[200px] cursor-default" 
                title={`Phone: ${profileData.phoneNumber || profileData.phone || '—'}`}
              >
                <Phone size={14} className="text-white/80 shrink-0" />
                <span className="truncate font-mono">{profileData.phoneNumber || profileData.phone || '—'}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 relative z-10 shrink-0">
          <div 
            className="bg-white/20 border border-white/40 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm backdrop-blur-sm max-w-[240px]"
            title={`Role: ${profileData.roleName}`}
          >
            <Building2 size={16} className="text-white shrink-0" />
            <span className="text-sm font-bold text-white uppercase tracking-wider truncate">{profileData.roleName}</span>
          </div>
          {profileData.status && (
            <div 
              className="bg-emerald-500/30 border border-emerald-300/50 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-emerald-100 backdrop-blur-sm shrink-0"
              title={`Status: ${profileData.status}`}
            >
              <CheckCircle2 size={13} className="shrink-0" /> {profileData.status}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
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
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
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
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#225091] hover:text-[#17969b] transition-colors cursor-pointer"
                >
                  <Edit size={15} /> Edit Details
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <User size={14} className="text-[#225091] shrink-0" /> Full Name
                  </div>
                  <div 
                    className="text-base font-bold text-gray-800 truncate cursor-default" 
                    title={displayName}
                  >
                    {displayName}
                  </div>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <Phone size={14} className="text-[#225091] shrink-0" /> Phone Number
                  </div>
                  <div 
                    className="text-base font-bold text-gray-800 font-mono truncate cursor-default" 
                    title={profileData.phoneNumber || profileData.phone || '—'}
                  >
                    {profileData.phoneNumber || profileData.phone || '—'}
                  </div>
                </div>

                <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <Mail size={14} className="text-[#225091] shrink-0" /> Email Address
                  </div>
                  <div 
                    className="text-base font-bold text-gray-800 truncate cursor-default" 
                    title={profileData.email || '—'}
                  >
                    {profileData.email || '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Bank / Tenant Context Section */}
            {profileData.bank && (
              <div className="pt-4 border-t border-gray-100">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Building size={20} className="text-[#225091] shrink-0" />
                    Associated Bank Information
                  </h3>
                  <p className="text-gray-500 text-sm">Tenant bank organization details linked to this account</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-[#f8fafc] rounded-xl border border-slate-200/80 overflow-hidden">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Bank Name</div>
                    <div 
                      className="text-base font-bold text-[#225091] truncate cursor-default" 
                      title={profileData.bank.name || 'Advita Co-operative Bank'}
                    >
                      {profileData.bank.name || 'Advita Co-operative Bank'}
                    </div>
                    {profileData.bank.code && (
                      <span 
                        className="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-50 text-[#225091] font-mono font-semibold rounded truncate max-w-full"
                        title={`Code: ${profileData.bank.code}`}
                      >
                        CODE: {profileData.bank.code}
                      </span>
                    )}
                  </div>

                  <div className="p-4 bg-[#f8fafc] rounded-xl border border-slate-200/80 overflow-hidden">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Bank Contact</div>
                    <div 
                      className="text-sm font-medium text-gray-800 truncate cursor-default" 
                      title={profileData.bank.email || profileData.email || '—'}
                    >
                      {profileData.bank.email || profileData.email || '—'}
                    </div>
                    <div 
                      className="text-xs text-gray-500 mt-0.5 font-mono truncate cursor-default" 
                      title={profileData.bank.phoneNumber || profileData.phone || '—'}
                    >
                      {profileData.bank.phoneNumber || profileData.phone || '—'}
                    </div>
                  </div>

                  <div className="p-4 bg-[#f8fafc] rounded-xl border border-slate-200/80 flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Organization Status</div>
                      <span 
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full truncate max-w-full"
                        title={`Status: ${profileData.bank.status || 'ACTIVE'}`}
                      >
                        <CheckCircle2 size={12} className="shrink-0" /> {profileData.bank.status || 'ACTIVE'}
                      </span>
                    </div>
                    {profileData.createdAt && (
                      <div 
                        className="text-[11px] text-gray-400 mt-2 flex items-center gap-1 truncate"
                        title={`Member since ${new Date(profileData.createdAt).toLocaleDateString()}`}
                      >
                        <Calendar size={11} className="shrink-0" /> Member since {new Date(profileData.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Account Metadata Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <div 
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg overflow-hidden" 
                title={`Role: ${profileData.roleName}`}
              >
                <ShieldCheck size={16} className="text-[#225091] shrink-0" />
                <div className="truncate min-w-0">
                  <span className="font-semibold text-gray-700">Role:</span> <span className="truncate">{profileData.roleName}</span>
                </div>
              </div>
              <div 
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg overflow-hidden"
                title={`Last Login: ${profileData.lastLoginAt ? new Date(profileData.lastLoginAt).toLocaleString() : 'Active session'}`}
              >
                <Clock size={16} className="text-[#225091] shrink-0" />
                <div className="truncate min-w-0">
                  <span className="font-semibold text-gray-700">Last Login:</span> <span className="truncate">{profileData.lastLoginAt ? new Date(profileData.lastLoginAt).toLocaleString() : 'Active session'}</span>
                </div>
              </div>
              <div 
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg overflow-hidden"
                title="Context: Society Panel"
              >
                <Building2 size={16} className="text-[#225091] shrink-0" />
                <div className="truncate min-w-0">
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-800">
                    Current Password <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-mono text-gray-400">
                    {passwords.currentPassword.length}/{PROFILE_LIMITS.PASSWORD_MAX}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    maxLength={PROFILE_LIMITS.PASSWORD_MAX}
                    value={passwords.currentPassword}
                    onChange={(e) => handlePasswordFieldChange('currentPassword', e.target.value)}
                    onBlur={() => handlePasswordFieldBlur('currentPassword')}
                    placeholder="Enter current password"
                    className={`w-full bg-white border rounded-xl px-4 py-2.5 pr-11 text-sm transition-all focus:outline-none ${
                      passwordTouched.currentPassword && passwordErrors.currentPassword
                        ? 'border-rose-300 bg-rose-50/20 text-gray-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : 'border-gray-300 text-gray-800 focus:border-[#225091] focus:ring-2 focus:ring-[#225091]/20'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordTouched.currentPassword && passwordErrors.currentPassword && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{passwordErrors.currentPassword}</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-800">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-xs font-mono font-semibold ${
                    passwords.newPassword.length >= PROFILE_LIMITS.PASSWORD_MIN
                      ? 'text-emerald-600'
                      : passwords.newPassword.length > 0
                        ? 'text-amber-500'
                        : 'text-gray-400'
                  }`}>
                    {passwords.newPassword.length}/{PROFILE_LIMITS.PASSWORD_MAX} (Min {PROFILE_LIMITS.PASSWORD_MIN})
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    maxLength={PROFILE_LIMITS.PASSWORD_MAX}
                    value={passwords.newPassword}
                    onChange={(e) => handlePasswordFieldChange('newPassword', e.target.value)}
                    onBlur={() => handlePasswordFieldBlur('newPassword')}
                    placeholder="Enter new password (min 6 characters)"
                    className={`w-full bg-white border rounded-xl px-4 py-2.5 pr-11 text-sm transition-all focus:outline-none ${
                      passwordTouched.newPassword && passwordErrors.newPassword
                        ? 'border-rose-300 bg-rose-50/20 text-gray-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : passwordTouched.newPassword && !passwordErrors.newPassword
                          ? 'border-emerald-300 text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                          : 'border-gray-300 text-gray-800 focus:border-[#225091] focus:ring-2 focus:ring-[#225091]/20'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordTouched.newPassword && passwordErrors.newPassword && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{passwordErrors.newPassword}</span>
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1.5">Must be at least 6 characters long (max 50 characters).</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-800">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-mono text-gray-400">
                    {passwords.confirmPassword.length}/{PROFILE_LIMITS.PASSWORD_MAX}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    maxLength={PROFILE_LIMITS.PASSWORD_MAX}
                    value={passwords.confirmPassword}
                    onChange={(e) => handlePasswordFieldChange('confirmPassword', e.target.value)}
                    onBlur={() => handlePasswordFieldBlur('confirmPassword')}
                    placeholder="Confirm new password"
                    className={`w-full bg-white border rounded-xl px-4 py-2.5 pr-11 text-sm transition-all focus:outline-none ${
                      passwordTouched.confirmPassword && passwordErrors.confirmPassword
                        ? 'border-rose-300 bg-rose-50/20 text-gray-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : passwordTouched.confirmPassword && !passwordErrors.confirmPassword
                          ? 'border-emerald-300 text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                          : 'border-gray-300 text-gray-800 focus:border-[#225091] focus:ring-2 focus:ring-[#225091]/20'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordTouched.confirmPassword && passwordErrors.confirmPassword && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{passwordErrors.confirmPassword}</span>
                  </p>
                )}
              </div>

              <div className="pt-3">
                <button 
                  type="submit"
                  disabled={savingPassword}
                  className="flex items-center justify-center gap-2 bg-[#225091] text-white px-7 py-2.5 rounded-lg text-sm font-bold hover:bg-[#17969b] transition-all shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Edit Profile</h3>
                <p className="text-xs text-gray-500">Update personal information and photo with field limits</p>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              {/* Modal Avatar Selection */}
              <div className="flex flex-col gap-2 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <input 
                    type="file" 
                    ref={modalFileInputRef} 
                    onChange={handleModalAvatarSelect} 
                    accept="image/png,image/jpeg,image/jpg,image/webp" 
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
                      className="flex items-center gap-1.5 text-xs font-bold text-[#225091] bg-[#225091]/10 px-3 py-1.5 rounded-md hover:bg-[#225091]/20 transition-colors cursor-pointer"
                    >
                      <UploadCloud size={14} /> Upload New Photo
                    </button>
                    <p className="text-[11px] text-gray-400 mt-1">JPG, PNG or WEBP (Max {PROFILE_LIMITS.AVATAR_MAX_SIZE_MB}MB)</p>
                  </div>
                </div>
                {avatarError && (
                  <p className="text-xs text-rose-500 flex items-center gap-1 font-medium">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{avatarError}</span>
                  </p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[11px] font-mono font-semibold ${
                    editForm.name.length >= PROFILE_LIMITS.NAME_MAX
                      ? 'text-rose-500 font-bold'
                      : editForm.name.length >= PROFILE_LIMITS.NAME_MIN
                        ? 'text-emerald-600'
                        : 'text-gray-400'
                  }`}>
                    {editForm.name.length}/{PROFILE_LIMITS.NAME_MAX}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={PROFILE_LIMITS.NAME_MAX}
                    value={editForm.name}
                    onChange={(e) => handleEditFieldChange('name', e.target.value)}
                    onBlur={() => handleEditFieldBlur('name')}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none ${
                      formTouched.name && formErrors.name
                        ? 'border-rose-300 bg-rose-50/20 text-gray-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : formTouched.name && !formErrors.name
                          ? 'border-emerald-300 text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                          : 'border-gray-300 text-gray-800 focus:border-[#225091] focus:ring-2 focus:ring-[#225091]/20'
                    }`}
                    required
                  />
                </div>
                {formTouched.name && formErrors.name ? (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{formErrors.name}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-400 mt-1">Allowed: 2 to 50 characters (letters, spaces, dots, hyphens).</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[11px] font-mono font-semibold ${
                    editForm.phone.length === PROFILE_LIMITS.PHONE_DIGITS
                      ? 'text-emerald-600 font-bold'
                      : editForm.phone.length > 0
                        ? 'text-amber-600'
                        : 'text-gray-400'
                  }`}>
                    {editForm.phone.length}/{PROFILE_LIMITS.PHONE_DIGITS} digits
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={PROFILE_LIMITS.PHONE_DIGITS}
                    value={editForm.phone}
                    onChange={(e) => handleEditFieldChange('phone', e.target.value)}
                    onBlur={() => handleEditFieldBlur('phone')}
                    placeholder="e.g. 9876543210"
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none font-mono ${
                      formTouched.phone && formErrors.phone
                        ? 'border-rose-300 bg-rose-50/20 text-gray-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : formTouched.phone && !formErrors.phone
                          ? 'border-emerald-300 text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                          : 'border-gray-300 text-gray-800 focus:border-[#225091] focus:ring-2 focus:ring-[#225091]/20'
                    }`}
                    required
                  />
                </div>
                {formTouched.phone && formErrors.phone ? (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{formErrors.phone}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-400 mt-1">10-digit mobile number starting with 6, 7, 8, or 9.</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[11px] font-mono font-semibold ${
                    editForm.email.length >= PROFILE_LIMITS.EMAIL_MAX
                      ? 'text-rose-500 font-bold'
                      : 'text-gray-400'
                  }`}>
                    {editForm.email.length}/{PROFILE_LIMITS.EMAIL_MAX}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    maxLength={PROFILE_LIMITS.EMAIL_MAX}
                    value={editForm.email}
                    onChange={(e) => handleEditFieldChange('email', e.target.value)}
                    onBlur={() => handleEditFieldBlur('email')}
                    placeholder="e.g. staff@advitabank.com"
                    className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none ${
                      formTouched.email && formErrors.email
                        ? 'border-rose-300 bg-rose-50/20 text-gray-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : formTouched.email && !formErrors.email
                          ? 'border-emerald-300 text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                          : 'border-gray-300 text-gray-800 focus:border-[#225091] focus:ring-2 focus:ring-[#225091]/20'
                    }`}
                    required
                  />
                </div>
                {formTouched.email && formErrors.email ? (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{formErrors.email}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-400 mt-1">Standard valid email format up to 100 characters.</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={savingProfile}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 bg-[#225091] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#17969b] transition-all shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
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
