import React, { useState, useEffect } from 'react';
import { X, Landmark, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { merchantService } from '../../api/merchantService';

const LinkMerchantBankModal = ({ isOpen, onClose, merchant, onSuccess }) => {
  const [societyAccountNumber, setSocietyAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranchName, setBankBranchName] = useState('');
  const [pincode, setPincode] = useState('');
  const [accountType, setAccountType] = useState('CURRENT');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (merchant) {
      const sa = merchant.societyAccount || {};
      const bd = merchant.bankDetails || {};
      const owner = merchant.ownerName || merchant.shopOwnerName || '';
      const branch = merchant.branchName || merchant.branch?.name || '';
      const pin = merchant.pincode || merchant.pinCode || merchant.residentialPincode || merchant.address?.pincode || sa.pincode || bd.pincode || '';

      setSocietyAccountNumber(sa.societyAccountNumber || bd.accountNumber || '');
      setAccountHolderName(sa.accountHolderName || bd.accountHolderName || owner || '');
      setIfscCode(sa.ifscCode || bd.ifscCode || '');
      setBankName(sa.bankName || bd.bankName || 'Co-operative Bank');
      setBankBranchName(sa.bankBranchName || bd.bankBranchName || bd.branchName || branch || '');
      setPincode(pin ? String(pin).slice(0, 6) : '');
      setAccountType(bd.accountType || 'CURRENT');
      setErrorMsg('');
      setFieldErrors({});
      setTouched({});
    }
  }, [merchant, isOpen]);

  if (!isOpen || !merchant) return null;

  const targetId = merchant._id || merchant.id || merchant.merchantId;
  const shopName = merchant.shopName || merchant.businessName || 'Merchant Partner';
  const merchantCode = merchant.merchantCode || merchant.code || '—';
  const ownerName = merchant.ownerName || merchant.shopOwnerName || '';
  const branchName = merchant.branchName || merchant.branch?.name || 'Assigned Branch';

  const validateField = (name, value) => {
    const val = String(value || '').trim();
    switch (name) {
      case 'societyAccountNumber':
        if (!val) return 'Society / Bank account number is required.';
        if (val.length < 6 || val.length > 25) return 'Account number must be between 6 and 25 characters.';
        if (!/^[A-Za-z0-9\-\/]+$/.test(val)) return 'Account number can only contain letters, numbers, hyphens, and slashes.';
        return '';
      case 'accountHolderName':
        if (!val) return 'Account holder name is required.';
        if (val.length < 2) return 'Account holder name must be at least 2 characters.';
        if (!/^[A-Za-z\s.'-]+$/.test(val)) return 'Account holder name should only contain letters and spaces.';
        return '';
      case 'ifscCode':
        if (!val) return 'IFSC code is required.';
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(val)) return 'Invalid IFSC code format (e.g. PUNB0123400, SBIN0001234).';
        return '';
      case 'bankName':
        if (!val) return 'Bank name is required.';
        if (val.length < 2) return 'Bank name must be at least 2 characters.';
        return '';
      case 'bankBranchName':
        if (!val) return 'Branch name is required.';
        if (val.length < 2) return 'Branch name must be at least 2 characters.';
        return '';
      case 'pincode':
        if (val && !/^\d{6}$/.test(val)) return 'Pincode must be exactly 6 digits.';
        return '';
      default:
        return '';
    }
  };

  const validateAll = () => {
    const errors = {
      societyAccountNumber: validateField('societyAccountNumber', societyAccountNumber),
      accountHolderName: validateField('accountHolderName', accountHolderName),
      ifscCode: validateField('ifscCode', ifscCode),
      bankName: validateField('bankName', bankName),
      bankBranchName: validateField('bankBranchName', bankBranchName),
      pincode: validateField('pincode', pincode),
    };

    const activeErrors = Object.entries(errors).reduce((acc, [k, v]) => {
      if (v) acc[k] = v;
      return acc;
    }, {});

    setFieldErrors(activeErrors);
    return activeErrors;
  };

  const handleBlur = (name, value) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (name, rawValue, setter, sanitizer = null) => {
    const value = sanitizer ? sanitizer(rawValue) : rawValue;
    setter(value);
    if (touched[name]) {
      const error = validateField(name, value);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
    if (errorMsg) {
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Mark all fields touched
    setTouched({
      societyAccountNumber: true,
      accountHolderName: true,
      ifscCode: true,
      bankName: true,
      bankBranchName: true,
      pincode: true,
    });

    const activeErrors = validateAll();
    const errorKeys = Object.keys(activeErrors);
    if (errorKeys.length > 0) {
      setErrorMsg(activeErrors[errorKeys[0]]);
      return;
    }

    // Exact payload according to Pigmy / Society Bank Account Linkage API spec:
    // { pigmyCustomerId, societyAccountNumber, ifscCode, accountHolderName, bankBranchName, pincode }
    const payload = {
      pigmyCustomerId: targetId,
      societyAccountNumber: societyAccountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      accountHolderName: accountHolderName.trim(),
      bankBranchName: bankBranchName.trim() || branchName,
      pincode: pincode.trim() || undefined,
      // Compatibility aliases
      accountNumber: societyAccountNumber.trim(),
      bankName: bankName.trim() || 'Co-operative Bank',
      branchName: bankBranchName.trim() || branchName,
      accountType: accountType || 'CURRENT',
      merchantId: targetId
    };

    setSubmitting(true);
    try {
      const res = await merchantService.linkSocietyAccount(targetId, payload);
      toast.success(res?.message || 'Society Bank Account linked successfully! You may now proceed with approval.');
      if (onSuccess) {
        const returnedData = res?.data || {};
        const merged = {
          ...payload,
          ...(returnedData.societyAccount || {}),
          hasSavingsAccount: returnedData.hasSavingsAccount,
          existingSavingsAccountNumber: returnedData.existingSavingsAccountNumber,
          pincode: pincode.trim() || undefined
        };
        onSuccess(targetId, merged);
      }
      onClose();
    } catch (err) {
      console.error('Failed to link society bank account:', err);
      let msg = err.response?.data?.message || err.message || 'Failed to link bank account.';
      if (err.response?.status === 409) {
        msg = 'Conflict (409): This bank account number is already in use by another merchant or customer in the society database. Please verify the account number.';
        setFieldErrors(prev => ({ ...prev, societyAccountNumber: 'Account number is already in use.' }));
      }
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldClass = (name, extra = '') => {
    const isInvalid = touched[name] && fieldErrors[name];
    return `w-full px-3.5 py-2 rounded-xl border text-xs font-medium outline-none transition-all ${
      isInvalid
        ? 'border-rose-400 bg-rose-50/20 text-gray-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
        : 'border-gray-200 focus:border-[#225091] focus:ring-2 focus:ring-[#225091]/15 text-gray-800'
    } ${extra}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#225091] to-[#1a3d6d] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Landmark size={20} className="text-blue-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Link Society Bank Account</h3>
              <p className="text-xs text-blue-100">Co-operative Bank Settlement Account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {/* Merchant Profile Badge */}
          <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="text-xs font-bold text-gray-900 block truncate" title={shopName}>{shopName}</span>
              <span className="text-[11px] text-gray-600 block">{ownerName ? `Owner: ${ownerName}` : `Code: ${merchantCode}`}</span>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-blue-100 text-[#225091] font-bold shrink-0">
              {branchName}
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Account Number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Society / Bank Account Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 912010045678901"
              value={societyAccountNumber}
              onChange={(e) => handleChange('societyAccountNumber', e.target.value, setSocietyAccountNumber, val => val.replace(/\s/g, '').toUpperCase())}
              onBlur={() => handleBlur('societyAccountNumber', societyAccountNumber)}
              className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-sm font-bold outline-none transition-all ${
                touched.societyAccountNumber && fieldErrors.societyAccountNumber
                  ? 'border-rose-400 bg-rose-50/20 text-rose-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-gray-200 text-[#225091] focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]'
              }`}
            />
            {touched.societyAccountNumber && fieldErrors.societyAccountNumber ? (
              <span className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle size={12} className="shrink-0" />
                {fieldErrors.societyAccountNumber}
              </span>
            ) : (
              <span className="text-[11px] text-gray-400 mt-1 block">
                Unique co-operative society settlement account for payouts and store sales settlement.
              </span>
            )}
          </div>

          {/* Account Holder Name & Account Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Account Holder Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder={ownerName || "Account Holder Name"}
                value={accountHolderName}
                onChange={(e) => handleChange('accountHolderName', e.target.value, setAccountHolderName)}
                onBlur={() => handleBlur('accountHolderName', accountHolderName)}
                className={getFieldClass('accountHolderName')}
              />
              {touched.accountHolderName && fieldErrors.accountHolderName && (
                <span className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle size={12} className="shrink-0" />
                  {fieldErrors.accountHolderName}
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Account Type
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium outline-none focus:border-[#225091] bg-white cursor-pointer"
              >
                <option value="CURRENT">CURRENT (Default)</option>
                <option value="SAVINGS">SAVINGS</option>
                <option value="CC">CASH CREDIT (CC)</option>
                <option value="OD">OVERDRAFT (OD)</option>
              </select>
            </div>
          </div>

          {/* IFSC Code & Bank Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                IFSC Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. PUNB0123400"
                maxLength={11}
                value={ifscCode}
                onChange={(e) => handleChange('ifscCode', e.target.value, setIfscCode, val => val.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 11))}
                onBlur={() => handleBlur('ifscCode', ifscCode)}
                className={getFieldClass('ifscCode', 'font-mono uppercase')}
              />
              {touched.ifscCode && fieldErrors.ifscCode && (
                <span className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle size={12} className="shrink-0" />
                  {fieldErrors.ifscCode}
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Bank Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Pune Co-operative Bank"
                value={bankName}
                onChange={(e) => handleChange('bankName', e.target.value, setBankName)}
                onBlur={() => handleBlur('bankName', bankName)}
                className={getFieldClass('bankName')}
              />
              {touched.bankName && fieldErrors.bankName && (
                <span className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle size={12} className="shrink-0" />
                  {fieldErrors.bankName}
                </span>
              )}
            </div>
          </div>

          {/* Branch / Bank Branch Name & Pincode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Branch Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder={branchName || "e.g. Pune Main Branch"}
                value={bankBranchName}
                onChange={(e) => handleChange('bankBranchName', e.target.value, setBankBranchName)}
                onBlur={() => handleBlur('bankBranchName', bankBranchName)}
                className={getFieldClass('bankBranchName')}
              />
              {touched.bankBranchName && fieldErrors.bankBranchName && (
                <span className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle size={12} className="shrink-0" />
                  {fieldErrors.bankBranchName}
                </span>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Pincode
              </label>
              <input
                type="text"
                placeholder="e.g. 411001"
                maxLength={6}
                value={pincode}
                onChange={(e) => handleChange('pincode', e.target.value, setPincode, val => val.replace(/\D/g, '').slice(0, 6))}
                onBlur={() => handleBlur('pincode', pincode)}
                className={getFieldClass('pincode', 'font-mono')}
              />
              {touched.pincode && fieldErrors.pincode && (
                <span className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle size={12} className="shrink-0" />
                  {fieldErrors.pincode}
                </span>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#225091] hover:bg-[#1a3d6d] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Linking...
                </>
              ) : (
                <>
                  <ShieldCheck size={14} /> Link Account Details
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LinkMerchantBankModal;
