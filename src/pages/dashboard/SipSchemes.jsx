import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  IndianRupee,
  Calculator,
  UserPlus,
  Percent,
  X,
  Check,
  ArrowUpRight,
  SlidersHorizontal,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/authStore';
import { isBankOwner } from '../../utils/roleUtils';
import sipService from '../../api/sipService';

// Standard fallback allowed amounts & duration plans as specified in API docs
const DEFAULT_ALLOWED_AMOUNTS = [100, 300, 500, 1000, 1500, 2100];
const DEFAULT_DURATION_PLANS = [
  { durationMonths: 1, interestRate: 6.5 },
  { durationMonths: 3, interestRate: 7.0 },
  { durationMonths: 6, interestRate: 7.5 },
  { durationMonths: 12, interestRate: 8.5 }
];

// Calculate compounding maturity returns
const calculateSipMaturity = (dailyAmount, durationMonths, interestRate) => {
  const days = durationMonths === 1 ? 30 : durationMonths === 3 ? 90 : durationMonths === 6 ? 181 : 365;
  const totalPrincipal = Number(dailyAmount || 0) * days;
  // Recurring deposit daily compounding approximate interest: P * n(n+1)/(2*365) * (r/100)
  const approxInterest = Math.round((Number(dailyAmount || 0) * days * (days + 1)) / (2 * 365) * ((interestRate || 7.5) / 100));
  const maturityAmount = totalPrincipal + approxInterest;
  return { days, totalPrincipal, approxInterest, maturityAmount };
};

// ==========================================
// 1. CREATE SCHEME MODAL (POST /api/v1/sip/schemes)
// ==========================================
const CreateSchemeModal = ({ isOpen, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [schemeCode, setSchemeCode] = useState('');
  const [schemeName, setSchemeName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  
  // Duration Plans (1, 3, 6, 12 months)
  const [durationPlans, setDurationPlans] = useState([
    { durationMonths: 1, interestRate: 6.5 },
    { durationMonths: 3, interestRate: 7.0 },
    { durationMonths: 6, interestRate: 7.5 },
    { durationMonths: 12, interestRate: 8.5 }
  ]);

  // Allowed Amounts
  const [allowedAmounts, setAllowedAmounts] = useState([...DEFAULT_ALLOWED_AMOUNTS]);
  const [newTierAmount, setNewTierAmount] = useState('');

  // Custom Amount Boundaries
  const [customAmountEnabled, setCustomAmountEnabled] = useState(true);
  const [customAmountMin, setCustomAmountMin] = useState(3000);
  const [customAmountMax, setCustomAmountMax] = useState(50000);

  if (!isOpen) return null;

  const handleRateChange = (durationMonths, rate) => {
    setDurationPlans(prev =>
      prev.map(p => (p.durationMonths === durationMonths ? { ...p, interestRate: Number(rate) || 0 } : p))
    );
  };

  const handleAddTier = () => {
    const val = parseInt(newTierAmount, 10);
    if (!val || val < 50) {
      toast.error('Daily amount must be at least â‚¹50');
      return;
    }
    if (allowedAmounts.includes(val)) {
      toast.info('Amount is already in allowed list');
      return;
    }
    setAllowedAmounts(prev => [...prev, val].sort((a, b) => a - b));
    setNewTierAmount('');
  };

  const handleRemoveTier = (amt) => {
    if (allowedAmounts.length <= 1) {
      toast.error('Scheme must have at least one allowed daily contribution amount');
      return;
    }
    setAllowedAmounts(prev => prev.filter(a => a !== amt));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!schemeCode.trim()) {
      toast.error('Scheme Code is required (e.g. DAILY_GOLD_SIP)');
      return;
    }
    if (!schemeName.trim()) {
      toast.error('Scheme Name is required (2 to 100 characters)');
      return;
    }
    if (allowedAmounts.length === 0) {
      toast.error('Please configure at least one allowed contribution amount');
      return;
    }
    if (customAmountEnabled) {
      if (!customAmountMin || customAmountMin < 3000) {
        toast.error('Custom Amount Minimum must be at least â‚¹3,000 as per policy');
        return;
      }
      if (!customAmountMax || customAmountMax <= customAmountMin) {
        toast.error('Custom Amount Maximum must be greater than Minimum amount');
        return;
      }
    }

    const payload = {
      schemeCode: schemeCode.trim().toUpperCase().replace(/\s+/g, '_'),
      schemeName: schemeName.trim(),
      description: description.trim() || 'Daily compounding systematic investment scheme.',
      frequency: 'DAILY',
      durationPlans,
      allowedAmounts,
      customAmountEnabled,
      customAmountMin: customAmountEnabled ? Number(customAmountMin) : undefined,
      customAmountMax: customAmountEnabled ? Number(customAmountMax) : undefined,
      status
    };

    setSubmitting(true);
    try {
      const res = await sipService.createScheme(payload);
      toast.success(res?.message || 'SIP Scheme created successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create scheme:', err);
      toast.error(err.response?.data?.message || 'Failed to create scheme. Please check your parameters.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-3xl w-full overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#1b58a6] to-[#225091] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Percent size={20} className="text-teal-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Create Daily SIP Scheme</h3>
              <p className="text-xs text-blue-100">Bank Owner Scheme Configuration (POST /api/v1/sip/schemes)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto custom-scrollbar">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Scheme Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. DAILY_GOLD_SIP"
                value={schemeCode}
                onChange={(e) => setSchemeCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono text-sm focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] outline-none"
                required
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Unique uppercase identifier</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Scheme Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Daily Gold Investment Scheme"
                value={schemeName}
                onChange={(e) => setSchemeName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] outline-none"
                required
              />
              <span className="text-[11px] text-gray-400 mt-1 block">2 to 100 characters display title</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Scheme Description & Compounding Terms
            </label>
            <textarea
              rows={2}
              placeholder="Daily recurring investment scheme offering competitive compounding interest rates."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Contribution Frequency
              </label>
              <input
                type="text"
                value="DAILY (Fixed)"
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-sm text-gray-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] outline-none"
              >
                <option value="ACTIVE">ACTIVE (Available for Customer Onboarding)</option>
                <option value="INACTIVE">INACTIVE (Hidden / Paused)</option>
              </select>
            </div>
          </div>

          {/* Duration Plans & Interest Rates */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Duration Milestones & Interest Rates (%)
              </label>
              <span className="text-[11px] text-teal-600 font-bold">Annualized Compounding Returns</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {durationPlans.map((plan) => (
                <div key={plan.durationMonths} className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80">
                  <span className="text-xs font-bold text-gray-600 block mb-1">
                    {plan.durationMonths} Month{plan.durationMonths > 1 ? 's' : ''}
                  </span>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="30"
                      value={plan.interestRate}
                      onChange={(e) => handleRateChange(plan.durationMonths, e.target.value)}
                      className="w-full pr-7 pl-3 py-1.5 rounded-xl border border-gray-300 bg-white font-extrabold text-sm text-teal-700 outline-none focus:ring-2 focus:ring-teal-500/20"
                      required
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Allowed Amounts */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Allowed Daily Contribution Amounts (â‚¹)
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-200/80 min-h-[52px] items-center">
              {allowedAmounts.map((amt) => (
                <span
                  key={amt}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-gray-200 text-gray-800 text-xs font-bold shadow-2xs"
                >
                  <IndianRupee size={12} className="text-teal-600" />
                  {amt.toLocaleString('en-IN')}
                  <button
                    type="button"
                    onClick={() => handleRemoveTier(amt)}
                    className="hover:text-rose-600 text-gray-400 cursor-pointer ml-1"
                    title="Remove tier"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <div className="relative w-40">
                <input
                  type="number"
                  placeholder="New Tier (â‚¹)"
                  value={newTierAmount}
                  onChange={(e) => setNewTierAmount(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTier}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                + Add Tier
              </button>
            </div>
          </div>

          {/* Custom Amount Boundaries */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 block">Allow Custom Daily Contribution</span>
                <span className="text-[11px] text-gray-400">Let customers specify custom daily amounts within limits</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={customAmountEnabled}
                  onChange={(e) => setCustomAmountEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {customAmountEnabled && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-teal-50/40 border border-teal-100 rounded-2xl animate-in fade-in duration-200">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Custom Min Amount (â‚¹)</label>
                  <input
                    type="number"
                    min="3000"
                    value={customAmountMin}
                    onChange={(e) => setCustomAmountMin(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-teal-200 bg-white text-xs font-bold text-teal-900"
                  />
                  <span className="text-[10px] text-teal-700 mt-0.5 block">Minimum â‚¹3,000 as per policy</span>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Custom Max Amount (â‚¹)</label>
                  <input
                    type="number"
                    min={customAmountMin + 1}
                    value={customAmountMax}
                    onChange={(e) => setCustomAmountMax(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-teal-200 bg-white text-xs font-bold text-teal-900"
                  />
                  <span className="text-[10px] text-teal-700 mt-0.5 block">Upper boundary (e.g. â‚¹50,000)</span>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1b58a6] to-[#225091] text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <span>{submitting ? 'Creating Scheme...' : 'Create Scheme Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. CUSTOMISE / EDIT SCHEME MODAL (PUT /api/v1/sip/schemes/:id)
// ==========================================
const EditSchemeModal = ({ isOpen, scheme, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [schemeName, setSchemeName] = useState('');
  const [description, setDescription] = useState('');
  const [durationPlans, setDurationPlans] = useState([...DEFAULT_DURATION_PLANS]);
  const [allowedAmounts, setAllowedAmounts] = useState([...DEFAULT_ALLOWED_AMOUNTS]);
  const [newTierAmount, setNewTierAmount] = useState('');
  const [customAmountEnabled, setCustomAmountEnabled] = useState(true);
  const [customAmountMin, setCustomAmountMin] = useState(3000);
  const [customAmountMax, setCustomAmountMax] = useState(50000);

  useEffect(() => {
    if (scheme) {
      setSchemeName(scheme.schemeName || '');
      setDescription(scheme.description || '');
      setDurationPlans(scheme.durationPlans && scheme.durationPlans.length > 0 ? scheme.durationPlans : DEFAULT_DURATION_PLANS);
      setAllowedAmounts(scheme.allowedAmounts && scheme.allowedAmounts.length > 0 ? scheme.allowedAmounts : DEFAULT_ALLOWED_AMOUNTS);
      setCustomAmountEnabled(scheme.customAmountEnabled !== false);
      setCustomAmountMin(scheme.customAmountMin || 3000);
      setCustomAmountMax(scheme.customAmountMax || 50000);
    }
  }, [scheme]);

  if (!isOpen || !scheme) return null;

  const handleRateChange = (durationMonths, rate) => {
    setDurationPlans(prev =>
      prev.map(p => (p.durationMonths === durationMonths ? { ...p, interestRate: Number(rate) || 0 } : p))
    );
  };

  const handleAddTier = () => {
    const val = parseInt(newTierAmount, 10);
    if (!val || val < 50) {
      toast.error('Daily amount must be at least â‚¹50');
      return;
    }
    if (allowedAmounts.includes(val)) {
      toast.info('Amount is already in allowed list');
      return;
    }
    setAllowedAmounts(prev => [...prev, val].sort((a, b) => a - b));
    setNewTierAmount('');
  };

  const handleRemoveTier = (amt) => {
    if (allowedAmounts.length <= 1) {
      toast.error('Scheme must have at least one allowed daily contribution amount');
      return;
    }
    setAllowedAmounts(prev => prev.filter(a => a !== amt));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!schemeName.trim()) {
      toast.error('Scheme Name is required');
      return;
    }
    if (allowedAmounts.length === 0) {
      toast.error('Please configure at least one allowed contribution amount');
      return;
    }
    if (customAmountEnabled) {
      if (!customAmountMin || customAmountMin < 3000) {
        toast.error('Custom Amount Minimum must be at least â‚¹3,000 as per policy');
        return;
      }
      if (!customAmountMax || customAmountMax <= customAmountMin) {
        toast.error('Custom Amount Maximum must be greater than Minimum amount');
        return;
      }
    }

    const payload = {
      schemeName: schemeName.trim(),
      description: description.trim(),
      durationPlans,
      allowedAmounts,
      customAmountEnabled,
      customAmountMin: customAmountEnabled ? Number(customAmountMin) : undefined,
      customAmountMax: customAmountEnabled ? Number(customAmountMax) : undefined
    };

    setSubmitting(true);
    try {
      const schemeId = scheme._id || scheme.id;
      const res = await sipService.updateScheme(schemeId, payload);
      toast.success(res?.message || 'SIP Scheme updated successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update scheme:', err);
      toast.error(err.response?.data?.message || 'Failed to update scheme');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-3xl w-full overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-700 to-[#1b58a6] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <SlidersHorizontal size={20} className="text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-white/20 font-bold">
                  {scheme.schemeCode}
                </span>
                <span className="text-xs text-teal-200 font-semibold">(PUT /api/v1/sip/schemes/:id)</span>
              </div>
              <h3 className="text-lg font-bold tracking-tight mt-0.5">Customise Scheme Parameters</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Scheme Display Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={schemeName}
              onChange={(e) => setSchemeName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Scheme Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
            />
          </div>

          {/* Duration Milestones & Rates */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Adjust Compounding Interest Rates (%)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {durationPlans.map((plan) => (
                <div key={plan.durationMonths} className="p-3 bg-indigo-50/40 rounded-2xl border border-indigo-100">
                  <span className="text-xs font-bold text-indigo-900 block mb-1">
                    {plan.durationMonths} Month{plan.durationMonths > 1 ? 's' : ''}
                  </span>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="30"
                      value={plan.interestRate}
                      onChange={(e) => handleRateChange(plan.durationMonths, e.target.value)}
                      className="w-full pr-7 pl-3 py-1.5 rounded-xl border border-indigo-200 bg-white font-extrabold text-sm text-indigo-900 outline-none"
                      required
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Allowed Amounts */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Allowed Daily Contribution Amounts (â‚¹)
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-200 min-h-[52px] items-center">
              {allowedAmounts.map((amt) => (
                <span
                  key={amt}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-indigo-200 text-indigo-700 text-xs font-bold shadow-2xs"
                >
                  <IndianRupee size={12} />
                  {amt.toLocaleString('en-IN')}
                  <button
                    type="button"
                    onClick={() => handleRemoveTier(amt)}
                    className="hover:text-rose-600 text-gray-400 cursor-pointer ml-1"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <div className="relative w-40">
                <input
                  type="number"
                  placeholder="New Tier (â‚¹)"
                  value={newTierAmount}
                  onChange={(e) => setNewTierAmount(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTier}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                + Add Tier
              </button>
            </div>
          </div>

          {/* Custom Amount Boundaries */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 block">Custom Daily Range</span>
                <span className="text-[11px] text-gray-400">Permit custom daily amounts within limits</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={customAmountEnabled}
                  onChange={(e) => setCustomAmountEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {customAmountEnabled && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl">
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Custom Min (â‚¹)</label>
                  <input
                    type="number"
                    min="3000"
                    value={customAmountMin}
                    onChange={(e) => setCustomAmountMin(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">Custom Max (â‚¹)</label>
                  <input
                    type="number"
                    min={customAmountMin + 1}
                    value={customAmountMax}
                    onChange={(e) => setCustomAmountMax(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-xs font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. SUBSCRIBE CUSTOMER MODAL (POST /api/v1/sip/bank)
// ==========================================
const SubscribeCustomerModal = ({ isOpen, schemes = [], initialScheme, branches = [], onClose, onSuccess }) => {
  const { user, role } = useAuthStore();
  const owner = isBankOwner(role, user);

  const [submitting, setSubmitting] = useState(false);
  const [createdSubscription, setCreatedSubscription] = useState(null);

  const [schemeId, setSchemeId] = useState(initialScheme?._id || initialScheme?.id || schemes[0]?._id || schemes[0]?.id || '');
  const [branchId, setBranchId] = useState(user?.branchId || branches[0]?._id || branches[0]?.id || '');
  const [customerId, setCustomerId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [durationMonths, setDurationMonths] = useState(6);
  const [amount, setAmount] = useState(500);

  // Active selected scheme
  const selectedScheme = useMemo(() => {
    return schemes.find(s => (s._id || s.id) === schemeId) || initialScheme || schemes[0];
  }, [schemes, schemeId, initialScheme]);

  useEffect(() => {
    if (initialScheme) {
      setSchemeId(initialScheme._id || initialScheme.id);
    }
  }, [initialScheme]);

  const activeDurationPlans = selectedScheme?.durationPlans || DEFAULT_DURATION_PLANS;
  const currentPlan = activeDurationPlans.find(p => p.durationMonths === Number(durationMonths)) || activeDurationPlans[0];
  const interestRate = currentPlan?.interestRate || 7.5;

  const preview = useMemo(() => {
    return calculateSipMaturity(amount, durationMonths, interestRate);
  }, [amount, durationMonths, interestRate]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!schemeId) {
      toast.error('Please select an active SIP scheme');
      return;
    }
    if (!customerId.trim() || customerId.trim().length < 10) {
      toast.error('Please enter a valid Customer ID (e.g. 24-char ObjectId)');
      return;
    }
    if (!accountId.trim() || accountId.trim().length < 10) {
      toast.error('Please enter a valid Customer Bank Account ID');
      return;
    }
    if (owner && !branchId) {
      toast.error('Please select the originating branch');
      return;
    }
    if (!amount || amount < 100) {
      toast.error('Contribution amount must be at least â‚¹100');
      return;
    }

    const payload = {
      customerId: customerId.trim(),
      accountId: accountId.trim(),
      schemeId,
      branchId: branchId || undefined,
      frequency: 'DAILY',
      durationMonths: Number(durationMonths),
      amount: Number(amount)
    };

    setSubmitting(true);
    try {
      const res = await sipService.createBankSip(payload);
      const data = res?.data || res;
      setCreatedSubscription(data);
      toast.success(res?.message || 'SIP created for customer successfully!');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to create customer SIP:', err);
      toast.error(err.response?.data?.message || 'Failed to subscribe customer. Verify customer KYC and account status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setCreatedSubscription(null);
    setCustomerId('');
    setAccountId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-2xl w-full overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-700 to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <UserPlus size={20} className="text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Onboard Customer to Daily SIP</h3>
              <p className="text-xs text-teal-100">Bank Staff Operations API (POST /api/v1/sip/bank)</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* If successfully created, show confirmation card */}
        {createdSubscription ? (
          <div className="p-6 space-y-6 animate-in fade-in duration-200">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={36} />
              </div>
              <h4 className="text-xl font-black text-gray-900">SIP Subscription Created!</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Customer has been enrolled in the daily recurring debit schedule with compounding returns.
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-5 border border-teal-200/80 space-y-3">
              <div className="flex items-center justify-between border-b border-teal-200/60 pb-2.5 text-xs">
                <span className="text-gray-500 font-medium">Subscription ID</span>
                <span className="font-mono font-bold text-gray-900">{createdSubscription._id || createdSubscription.id}</span>
              </div>
              <div className="flex items-center justify-between border-b border-teal-200/60 pb-2.5 text-xs">
                <span className="text-gray-500 font-medium">Scheme</span>
                <span className="font-bold text-teal-900">{createdSubscription.schemeName || selectedScheme?.schemeName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-teal-200/60 pb-2.5 text-xs">
                <span className="text-gray-500 font-medium">Daily Contribution</span>
                <span className="font-extrabold text-teal-700">â‚¹{createdSubscription.amount?.toLocaleString('en-IN')} / day</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Total Installments</span>
                  <span className="font-bold text-gray-800">{createdSubscription.totalInstallments || preview.days} Days</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Compounding Rate</span>
                  <span className="font-bold text-emerald-700">{createdSubscription.interestRate || interestRate}% p.a.</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Maturity Date</span>
                  <span className="font-bold text-gray-800">
                    {createdSubscription.maturityDate ? new Date(createdSubscription.maturityDate).toLocaleDateString('en-IN') : 'â€”'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Projected Maturity Value</span>
                  <span className="font-black text-emerald-700 text-sm">
                    â‚¹{Number(createdSubscription.maturityAmount || preview.maturityAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(85vh-120px)] overflow-y-auto custom-scrollbar">
            {/* Scheme Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Target SIP Scheme <span className="text-rose-500">*</span>
              </label>
              <select
                value={schemeId}
                onChange={(e) => setSchemeId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
                required
              >
                {schemes.map((s) => (
                  <option key={s._id || s.id} value={s._id || s.id}>
                    {s.schemeName} ({s.schemeCode}) â€” {s.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer & Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Customer ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 65f1234567890abcdef12345"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
                  required
                />
                <span className="text-[11px] text-gray-400 mt-1 block">Verified Customer Hex ID</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Bank Account ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 66a9876543210fedcba54321"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
                  required
                />
                <span className="text-[11px] text-gray-400 mt-1 block">Source Account for Daily Auto-Debit</span>
              </div>
            </div>

            {/* Branch Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Branch Context {owner && <span className="text-rose-500">*</span>}
              </label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none"
              >
                <option value="">Auto-resolve from User Branch</option>
                {branches.map((b) => (
                  <option key={b._id || b.id} value={b._id || b.id}>
                    {b.name || b.branchName} ({b.city || 'Branch'})
                  </option>
                ))}
              </select>
            </div>

            {/* Duration and Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tenure Duration <span className="text-rose-500">*</span>
                </label>
                <select
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 outline-none"
                  required
                >
                  {activeDurationPlans.map((p) => (
                    <option key={p.durationMonths} value={p.durationMonths}>
                      {p.durationMonths} Months ({p.interestRate}% p.a.)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Daily Contribution (â‚¹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-bold text-sm text-teal-800 outline-none"
                  required
                />
              </div>
            </div>

            {/* Allowed amounts quick-picks */}
            {selectedScheme?.allowedAmounts && (
              <div>
                <span className="text-xs font-semibold text-gray-500 block mb-1.5">Quick Select Daily Tiers:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedScheme.allowedAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        Number(amount) === amt
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      â‚¹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Calculated Return Summary Box */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-teal-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <Percent size={14} className="text-teal-600" />
                  Estimated Maturity Return Summary
                </span>
                <span className="font-extrabold text-emerald-700">â‚¹{preview.maturityAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-teal-200/60">
                <div>
                  <span className="text-[11px] text-gray-500 block">Total Days</span>
                  <span className="text-sm font-extrabold text-gray-800 mt-0.5">{preview.days} Days</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 block">Principal</span>
                  <span className="text-sm font-extrabold text-gray-800 mt-0.5">â‚¹{preview.totalPrincipal.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 block">Compounding Gain</span>
                  <span className="text-sm font-extrabold text-emerald-600 mt-0.5">+â‚¹{preview.approxInterest.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                <span>{submitting ? 'Subscribing...' : 'Subscribe Customer to SIP'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 4. SIP GROWTH CALCULATOR MODAL
// ==========================================
const CalculatorModal = ({ isOpen, schemes = [], initialScheme, onClose, onSelectPlan }) => {
  const [selectedSchemeId, setSelectedSchemeId] = useState(
    initialScheme?._id || initialScheme?.id || schemes[0]?._id || schemes[0]?.id || ''
  );

  const activeScheme = useMemo(() => {
    return schemes.find(s => (s._id || s.id) === selectedSchemeId) || initialScheme || schemes[0];
  }, [schemes, selectedSchemeId, initialScheme]);

  const [dailyAmount, setDailyAmount] = useState(500);
  const [durationMonths, setDurationMonths] = useState(6);

  const durationPlans = activeScheme?.durationPlans || DEFAULT_DURATION_PLANS;
  const currentPlan = durationPlans.find(p => p.durationMonths === durationMonths) || durationPlans[0];
  const interestRate = currentPlan?.interestRate || 7.5;

  const preview = useMemo(() => {
    return calculateSipMaturity(dailyAmount, durationMonths, interestRate);
  }, [dailyAmount, durationMonths, interestRate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-xl w-full overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-5 bg-gradient-to-r from-teal-600 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Calculator size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Daily SIP Growth Calculator</h3>
              <p className="text-xs text-teal-100">Simulate customer compounding returns</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {schemes.length > 1 && (
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Active Scheme</label>
              <select
                value={selectedSchemeId}
                onChange={(e) => setSelectedSchemeId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold"
              >
                {schemes.map((s) => (
                  <option key={s._id || s.id} value={s._id || s.id}>
                    {s.schemeName} ({s.schemeCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Daily Contribution slider & quick buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">Daily Contribution</label>
              <span className="text-lg font-extrabold text-teal-700">â‚¹{dailyAmount.toLocaleString('en-IN')} / day</span>
            </div>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={dailyAmount}
              onChange={(e) => setDailyAmount(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[100, 300, 500, 1000, 1500, 2100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDailyAmount(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    dailyAmount === amt ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  â‚¹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Period */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700">Duration Period</label>
            <div className="grid grid-cols-4 gap-2">
              {durationPlans.map((plan) => (
                <button
                  key={plan.durationMonths}
                  type="button"
                  onClick={() => setDurationMonths(plan.durationMonths)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    durationMonths === plan.durationMonths
                      ? 'border-teal-600 bg-teal-50/80 text-teal-900 shadow-2xs font-bold'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="block text-xs">{plan.durationMonths} Months</span>
                  <span className="block text-xs font-extrabold text-teal-700 mt-0.5">{plan.interestRate}%</span>
                </button>
              ))}
            </div>
          </div>

          {/* Projected Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs text-gray-400">Projected Maturity Amount</span>
              <span className="text-2xl font-black text-emerald-400 tracking-tight">
                â‚¹{preview.maturityAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block">Total Principal Deposited</span>
                <span className="font-bold text-base mt-0.5 block text-gray-200">
                  â‚¹{preview.totalPrincipal.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-gray-500">{preview.days} daily installments</span>
              </div>
              <div>
                <span className="text-gray-400 block">Compounding Interest Earned</span>
                <span className="font-bold text-base mt-0.5 block text-teal-300">
                  +â‚¹{preview.approxInterest.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-gray-500">at {interestRate}% per annum</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs cursor-pointer"
            >
              Close
            </button>
            {onSelectPlan && (
              <button
                onClick={() => {
                  onSelectPlan({ scheme: activeScheme, amount: dailyAmount, durationMonths });
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Onboard with this Plan</span>
                <ArrowUpRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. SCHEME DETAILS MODAL (GET /api/v1/sip/schemes/:id)
// ==========================================
const SchemeDetailsModal = ({ isOpen, scheme, onClose, onEdit, isOwner }) => {
  if (!isOpen || !scheme) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-xl w-full overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-5 bg-gradient-to-r from-gray-800 to-gray-900 text-white flex items-center justify-between">
          <div>
            <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-white/20 font-bold">
              {scheme.schemeCode}
            </span>
            <h3 className="text-lg font-bold mt-1">{scheme.schemeName}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Description</span>
            <p className="text-sm text-gray-700 leading-relaxed">
              {scheme.description || 'Daily compounding investment scheme.'}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Duration Milestones</span>
            <div className="grid grid-cols-4 gap-2">
              {(scheme.durationPlans || DEFAULT_DURATION_PLANS).map((p, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-100 text-center">
                  <span className="text-xs font-medium text-gray-600 block">{p.durationMonths} Mo</span>
                  <span className="text-sm font-extrabold text-teal-800 block mt-0.5">{p.interestRate}%</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Allowed Daily Tiers</span>
            <div className="flex flex-wrap gap-2">
              {(scheme.allowedAmounts || DEFAULT_ALLOWED_AMOUNTS).map((amt, idx) => (
                <span key={idx} className="px-3 py-1 rounded-xl bg-gray-100 text-gray-800 text-xs font-bold">
                  â‚¹{amt.toLocaleString('en-IN')}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Custom Amount Boundaries</span>
            <span className="font-bold text-gray-900">
              {scheme.customAmountEnabled
                ? `â‚¹${(scheme.customAmountMin || 3000).toLocaleString('en-IN')} - â‚¹${(scheme.customAmountMax || 50000).toLocaleString('en-IN')}`
                : 'Disabled'}
            </span>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs cursor-pointer"
            >
              Close
            </button>
            {isOwner && (
              <button
                onClick={onEdit}
                className="px-4 py-2 rounded-xl bg-[#225091] text-white font-bold text-xs cursor-pointer"
              >
                Customise Scheme
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// NAMED EXPORTS FOR UNIFIED PIGMY MODULE
// ==========================================
export {
  CreateSchemeModal,
  EditSchemeModal,
  SubscribeCustomerModal,
  CalculatorModal,
  SchemeDetailsModal,
  calculateSipMaturity,
  DEFAULT_ALLOWED_AMOUNTS,
  DEFAULT_DURATION_PLANS
};

