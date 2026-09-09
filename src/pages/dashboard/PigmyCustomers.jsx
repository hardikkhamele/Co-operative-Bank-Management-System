import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Coins,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  ArrowLeftCircle,
  X,
  Check,
  ExternalLink,
  ChevronRight,
  Loader2,
  Plus,
  Landmark,
  FileCheck,
  Phone,
  Mail,
  User,
  Store,
  CreditCard,
  ArrowDownRight,
  ArrowUpRight,
  Copy,
  CheckCheck,
  FileText,
  TrendingUp,
  Edit,
  Calendar,
  Calculator,
  UserPlus,
  Percent,
  Sparkles,
  Layers,
  Wallet,
  SlidersHorizontal,
  Filter
} from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/authStore';
import { isBankOwner } from '../../utils/roleUtils';
import pigmyService from '../../api/pigmyService';
import sipService from '../../api/sipService';
import branchService from '../../api/branchService';

import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';
import TableWrapper from '../../components/common/TableWrapper';
import Pagination from '../../components/common/Pagination';

// SIP Sub-Components (Modals & Utilities)
import {
  CreateSchemeModal,
  EditSchemeModal,
  SubscribeCustomerModal,
  CalculatorModal,
  SchemeDetailsModal,
  DEFAULT_ALLOWED_AMOUNTS,
  DEFAULT_DURATION_PLANS
} from './SipSchemes';

// =========================================================================
// 1. ADD / LINK SOCIETY ACCOUNT MODAL
// POST /api/v1/society/pigmy-customers/:id/society-account
// =========================================================================
const AddSocietyAccountModal = ({ isOpen, customer, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [societyAccountNumber, setSocietyAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankBranchName, setBankBranchName] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (customer) {
      const sa = customer.societyAccount || {};
      const cName = customer.fullName || customer.name || customer.ownerName || '';
      setSocietyAccountNumber(sa.societyAccountNumber || customer.existingSavingsAccountNumber || '');
      setIfscCode(sa.ifscCode || '');
      setAccountHolderName(sa.accountHolderName || cName);
      setBankBranchName(sa.bankBranchName || customer.branchName || '');
      setShowConfirm(false);
    }
  }, [customer, isOpen]);

  if (!isOpen || !customer) return null;

  const displayName = customer.fullName || customer.name || customer.ownerName || 'Customer';
  const displayCode = customer.pigmyCustomerCode || customer.pigmyCode || customer.code || customer.id || '';

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (!societyAccountNumber.trim()) {
      toast.error('Society Account Number is required.');
      return;
    }
    if (!ifscCode.trim()) {
      toast.error('IFSC Code is required.');
      return;
    }
    if (!/^[A-Z0-9]+$/.test(ifscCode.trim().toUpperCase())) {
      toast.error('IFSC Code should contain only letters and numbers.');
      return;
    }
    if (!accountHolderName.trim()) {
      toast.error('Account Holder Name is required.');
      return;
    }
    if (!bankBranchName.trim()) {
      toast.error('Bank / Branch Name is required.');
      return;
    }
    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    const payload = {
      societyAccountNumber: societyAccountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      accountHolderName: accountHolderName.trim() || displayName,
      bankBranchName: bankBranchName.trim() || customer.branchName,
      pigmyCustomerId: customer._id || customer.id || customer.pigmyCustomerId
    };

    setSubmitting(true);
    try {
      const targetId = customer._id || customer.id || customer.pigmyCustomerId;
      const res = await pigmyService.addSocietyAccount(targetId, payload);
      toast.success(res?.message || 'Society account linked successfully! You may now proceed with approval.');
      onSuccess(targetId, payload);
      onClose();
    } catch (err) {
      console.error('Failed to link society account:', err);
      toast.error(err.response?.data?.message || 'Failed to link society account. Please check account details.');
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-[#225091] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Landmark size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Link Society Bank Account</h3>
              <p className="text-xs text-blue-100">Credit Destination (Internal Cooperative Bank Account)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {showConfirm ? (
          <div className="p-6 space-y-4">
            <div className="p-4 text-center">
              <h4 className="text-gray-900 font-bold text-lg mb-2">Confirm Details</h4>
              <p className="text-gray-600 text-sm">Confirm details it can not be change later</p>
            </div>
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold text-xs hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-[#225091] hover:bg-[#1a3d70] text-white font-medium text-sm shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                <span>{submitting ? 'Linking...' : 'Confirm'}</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInitialSubmit} className="p-6 space-y-4">
            {/* Customer Identifier Card */}
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-gray-900 block">{displayName}</span>
                <span className="text-xs text-gray-500 mt-0.5 block">{displayCode}</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-teal-50 border border-teal-100 text-teal-700 font-medium">
                {customer.branchName || 'Assigned Branch'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Society Account Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. ACC-SB-998811 or 1234567890"
                value={societyAccountNumber}
                onChange={(e) => setSocietyAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] outline-none"
                required
              />
              <span className="text-xs text-gray-500 mt-1 block">
                Daily micro-deposits collected via auto-debit will accumulate into this Society Account.
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                IFSC Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. PUNB0123400"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm uppercase text-gray-900 focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Account Holder Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder={displayName}
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Bank / Branch Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder={customer.branchName || 'e.g. Pune Main Branch'}
                value={bankBranchName}
                onChange={(e) => setBankBranchName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] outline-none"
                required
              />
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#225091] hover:bg-[#1a3d70] text-white font-medium text-sm shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                Save & Link Account
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// =========================================================================
// 2. APPROVE MODAL (With Mandatory Society Account Guardrail)
// POST /api/v1/society/pigmy-customers/:id/approve
// =========================================================================
const ApproveCustomerModal = ({ isOpen, customer, onClose, onSuccess, onOpenAddAccount }) => {
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRemarks('All KYC documents verified. Customer society account linked.');
    }
  }, [isOpen]);

  if (!isOpen || !customer) return null;

  const societyAccount = customer.societyAccount || {};
  const hasSocietyAccount = Boolean(
    societyAccount.societyAccountNumber ||
    customer.existingSavingsAccountNumber ||
    customer.societyAccountNumber
  );

  const displayName = customer.fullName || customer.name || customer.ownerName || 'Customer';
  const displayCode = customer.pigmyCustomerCode || customer.pigmyCode || customer.code || '—';
  const dailyAmount = customer.scheme?.dailyDepositAmount || customer.dailyAmount || customer.mandateDetails?.autoDebitAmount || 0;
  const tenureMonths = customer.scheme?.tenureMonths || customer.tenureMonths || 6;

  const handleApprove = async () => {
    if (!hasSocietyAccount) {
      toast.error('Cannot approve Pigmy Customer: Customer society account number is missing. Please link account first.');
      return;
    }

    setSubmitting(true);
    try {
      const targetId = customer._id || customer.id || customer.pigmyCustomerId;
      const res = await pigmyService.approve(targetId, { remarks: remarks.trim() });
      toast.success(res?.message || 'Pigmy deposit customer approved and activated successfully!');
      onSuccess(targetId);
      onClose();
    } catch (err) {
      console.error('Approval failed:', err);
      const msg = err.response?.data?.message || 'Failed to approve Pigmy Customer.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Approve Pigmy Application</h3>
              <p className="text-xs text-emerald-100">Activate Daily Deposit Tenure & Mandate</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Customer Summary */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Customer</span>
              <span className="font-bold text-gray-900">{displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Pigmy Code</span>
              <span className="font-mono font-bold text-gray-800">{displayCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Daily Deposit Amount</span>
              <span className="font-extrabold text-teal-700">₹{Number(dailyAmount).toLocaleString('en-IN')} / day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Tenure</span>
              <span className="font-bold text-gray-800">{tenureMonths} Months</span>
            </div>
          </div>

          {/* Mandatory Society Account Check Alert */}
          {!hasSocietyAccount ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                <span>Pre-Approval Action Required</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed font-medium">
                Cannot approve this customer: Internal society account number is missing. As per society policy, a verified society account must be linked prior to approval.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddAccount(customer);
                }}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Link Society Account Now</span>
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block">Society Account Linked</span>
                  <span className="font-mono text-[11px] text-emerald-700">
                    {societyAccount.societyAccountNumber || customer.existingSavingsAccountNumber}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                READY
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Approval Remarks (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. KYC verified and society account linked by branch QC"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
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
              type="button"
              onClick={handleApprove}
              disabled={!hasSocietyAccount || submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <span>{submitting ? 'Approving...' : 'Confirm Approval'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 3. REJECT MODAL (POST /api/v1/society/pigmy-customers/:id/reject)
// =========================================================================
const RejectCustomerModal = ({ isOpen, customer, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !customer) return null;

  const displayName = customer.fullName || customer.name || customer.ownerName || 'Customer';
  const displayCode = customer.pigmyCustomerCode || customer.pigmyCode || customer.code || '—';

  const handleReject = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please specify a rejection reason.');
      return;
    }

    setSubmitting(true);
    try {
      const targetId = customer._id || customer.id || customer.pigmyCustomerId;
      const res = await pigmyService.reject(targetId, { reason: reason.trim() });
      toast.success(res?.message || 'Pigmy customer application rejected.');
      onSuccess(targetId, reason.trim());
      onClose();
    } catch (err) {
      console.error('Rejection failed:', err);
      toast.error(err.response?.data?.message || 'Failed to reject application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-5 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <XCircle size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Reject Application</h3>
              <p className="text-xs text-rose-100">Mandatory Reason Required</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleReject} className="p-6 space-y-4">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
            <span className="font-bold text-gray-800 block">{displayName}</span>
            <span className="font-mono text-gray-500">{displayCode}</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Provide detailed explanation for rejection (e.g. Mismatch in address proof)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              required
            />
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
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <span>{submitting ? 'Rejecting...' : 'Confirm Rejection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// 4. CUSTOMER DETAILS MODAL (GET /api/v1/society/pigmy-customers/:id)
// =========================================================================
const CustomerDetailsModal = ({ isOpen, customerId, onClose, onOpenApprove, onOpenAddAccount }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [copiedField, setCopiedField] = useState('');

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.info(`Copied ${fieldName} to clipboard!`);
    setTimeout(() => setCopiedField(''), 2000);
  };

  useEffect(() => {
    if (isOpen && customerId) {
      (async () => {
        setLoading(true);
        try {
          const res = await pigmyService.getById(customerId);
          setCustomer(res?.data || res);
        } catch (err) {
          console.error('Failed to load customer details:', err);
          toast.error('Failed to load full customer details.');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isOpen, customerId]);

  if (!isOpen) return null;

  const sa = customer?.societyAccount || {};
  const ba = customer?.bankAccountDetails || {};
  const mandate = customer?.mandateDetails || {};
  const scheme = customer?.scheme || {};
  const agreements = customer?.agreements || {};
  const documents = customer?.documents || {};
  const onboardedBy = customer?.onboardedBy || {};

  const hasSocietyAccount = Boolean(
    sa.societyAccountNumber || customer?.existingSavingsAccountNumber || customer?.societyAccountNumber
  );

  const displayName = customer?.fullName || customer?.name || customer?.ownerName || 'Customer Details';
  const displayCode = customer?.pigmyCustomerCode || customer?.pigmyCode || customer?.code || '—';
  const isMerchant = customer?.isMerchant || customer?.customerType === 'MERCHANT';
  const isApproved = customer?.approvalStatus === 'APPROVED';
  const isPending = customer?.approvalStatus === 'PENDING_BRANCH_APPROVAL' || customer?.approvalStatus === 'PENDING';
  const isRejected = customer?.approvalStatus === 'REJECTED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-[#225091] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white tracking-tight">{displayName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-white/80">{displayCode}</span>
                <span className="text-sm text-white/40">|</span>
                <span className={`text-sm font-semibold ${
                  isApproved ? 'text-emerald-400'
                  : isRejected ? 'text-rose-400'
                  : 'text-amber-400'
                }`}>{customer?.approvalStatus || 'PENDING'}</span>
                <span className="text-sm text-white/40">|</span>
                <span className="text-sm font-medium text-blue-200">
                  {isMerchant ? 'MERCHANT' : 'INDIVIDUAL'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-gray-100 bg-gray-50/50 text-xs font-semibold overflow-x-auto">
          {[
            { key: 'OVERVIEW', label: 'Overview & Profile', icon: null },
            { key: 'ACCOUNTS', label: 'Dual Banking Accounts', icon: Landmark },
            { key: 'MANDATE', label: 'Auto-Debit & Scheme', icon: CreditCard },
            { key: 'DOCUMENTS', label: 'Agreements & Docs', icon: FileCheck }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.key ? 'border-teal-600 text-teal-800 font-bold' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.icon && <tab.icon size={14} />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="py-14 text-center text-gray-400">
              <Loader2 size={30} className="animate-spin mx-auto text-teal-600 mb-2" />
              <span className="text-xs font-semibold">Loading full customer record...</span>
            </div>
          ) : !customer ? (
            <p className="text-center text-gray-500 py-10 text-xs">Customer details unavailable.</p>
          ) : (
            <div className="space-y-5">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'OVERVIEW' && (
                <>
                  {isRejected && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                      <XCircle size={18} className="text-rose-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-sm font-semibold text-rose-900 block">Application Rejected</span>
                        <p className="text-sm text-rose-700 mt-0.5"><strong>Reason:</strong> {customer.rejectionReason || 'QC criteria not met'}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block mb-3">Customer & Contact Details</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span className="text-sm text-gray-500 block mb-1">Primary Phone</span>
                        <span className="text-base font-medium text-gray-900 flex items-center gap-1.5 mt-0.5"><Phone size={13} className="text-teal-600" />{customer.primaryPhoneNumber || customer.phoneNumber || customer.phone || '—'}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span className="text-sm text-gray-500 block mb-1">Secondary Phone</span>
                        <span className="text-base font-medium text-gray-900 flex items-center gap-1.5 mt-0.5"><Phone size={13} className="text-gray-400" />{customer.secondaryPhoneNumber || '—'}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 truncate">
                        <span className="text-sm text-gray-500 block mb-1">Email Address</span>
                        <span className="text-base font-medium text-gray-900 flex items-center gap-1.5 mt-0.5 truncate"><Mail size={13} className="text-teal-600" /> {customer.email || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'PAN Number', value: customer.panNumber },
                      { label: 'Aadhaar Number', value: customer.aadhaarNumber ? `•••• •••• ${customer.aadhaarNumber.slice(-4)}` : '—' },
                      { label: 'Date of Birth', value: customer.dob },
                      { label: 'Gender', value: customer.gender }
                    ].map((item, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span className="text-sm text-gray-500 block mb-1">{item.label}</span>
                        <span className="text-base font-medium text-gray-900 block">{item.value || '—'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-sm text-gray-500 block mb-1">Residence Address</span>
                    <span className="text-base font-medium text-gray-900 block">{customer.residenceAddress || customer.address || '—'}</span>
                  </div>
                  {isMerchant && (
                    <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-4 space-y-2.5">
                      <div className="text-amber-900 font-semibold text-sm">Merchant Business Profile</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div><span className="text-xs text-amber-800/80 block">Shop Name</span><span className="text-base font-medium text-gray-900">{customer.shopName || '—'}</span></div>
                        <div><span className="text-xs text-amber-800/80 block">{customer.businessProofType ? `${customer.businessProofType} Number` : 'Business Proof'}</span><span className="text-base font-medium text-gray-900">{customer.gstinNumber || customer.businessProofNumber || '—'}</span></div>
                        <div className="sm:col-span-2"><span className="text-xs text-amber-800/80 block">Shop Address</span><span className="text-base font-medium text-gray-900">{customer.shopAddress || '—'}</span></div>
                      </div>
                    </div>
                  )}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div><span className="text-sm text-gray-500 block mb-1">Branch & Bank</span><span className="text-base font-medium text-gray-900">{customer.branchName || 'Pune Main'} ({customer.bankName || 'Cooperative Bank'})</span></div>
                    {onboardedBy.name && (<div><span className="text-sm text-gray-500 block mb-1">Onboarded By</span><span className="font-medium text-teal-800">{onboardedBy.name} ({onboardedBy.role || 'Executive'})</span></div>)}
                    <div><span className="text-sm text-gray-500 block mb-1">Created On</span><span className="font-medium text-gray-600">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-IN') : '—'}</span></div>
                  </div>
                </>
              )}

              {/* TAB 2: DUAL BANKING ACCOUNTS */}
              {activeTab === 'ACCOUNTS' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl text-xs text-blue-900 leading-relaxed">
                    <strong>Business Architecture Notice:</strong> Pigmy deposits operate on dual accounts:
                    <ul className="list-disc pl-5 mt-1 space-y-0.5">
                      <li><strong>Commercial Bank Account</strong>: External bank account from where daily installments are DEBITED via e-NACH mandate.</li>
                      <li><strong>Society Account</strong>: Internal cooperative bank account where collected deposits are CREDITED and accumulated.</li>
                    </ul>
                  </div>
                  {/* Commercial Bank Account */}
                  <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center"><ArrowUpRight size={16} /></div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 tracking-wide">Commercial Bank Account (Debit Source)</h4>
                          <span className="text-xs text-indigo-600">External Bank for Daily e-NACH Auto-Debit</span>
                        </div>
                      </div>
                      <span className="text-xs text-indigo-800 font-medium">DEBIT SOURCE</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-white p-3.5 rounded-xl border border-indigo-100">
                      <div><span className="text-sm text-gray-500 block mb-1">Bank Name</span><span className="text-base font-medium text-gray-900">{ba.bankName || '—'}</span></div>
                      <div>
                        <span className="text-sm text-gray-500 block mb-1">Account Number</span>
                        <div className="flex items-center gap-1.5 font-medium text-indigo-900">
                          <span>{ba.accountNumber || '—'}</span>
                          {ba.accountNumber && (
                            <button onClick={() => copyToClipboard(ba.accountNumber, 'Commercial Account')} className="text-gray-400 hover:text-indigo-600 cursor-pointer" title="Copy account number">
                              {copiedField === 'Commercial Account' ? <CheckCheck size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            </button>
                          )}
                        </div>
                      </div>
                      <div><span className="text-sm text-gray-500 block mb-1">IFSC Code</span><span className="text-base font-medium text-gray-900">{ba.ifscCode || '—'}</span></div>
                      <div><span className="text-sm text-gray-500 block mb-1">Branch Name</span><span className="text-base font-medium text-gray-900">{ba.branchName || '—'}</span></div>
                      <div><span className="text-sm text-gray-500 block mb-1">Account Type</span><span className="text-base font-medium text-gray-900">{ba.accountType || 'SAVINGS'}</span></div>
                      <div><span className="text-sm text-gray-500 block mb-1">Account Holder</span><span className="text-base font-medium text-gray-900">{ba.accountHolderName || displayName}</span></div>
                    </div>
                  </div>
                  {/* Society Account */}
                  <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><ArrowDownRight size={16} /></div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 tracking-wide">Society Account (Credit Destination)</h4>
                          <span className="text-xs text-emerald-700">Internal Cooperative Bank Account</span>
                        </div>
                      </div>
                      {hasSocietyAccount ? (
                        <span className="text-xs text-emerald-800 font-medium">LINKED</span>
                      ) : (
                        <span className="text-xs text-rose-800 font-medium">UNLINKED (REQUIRED)</span>
                      )}
                    </div>
                    {hasSocietyAccount ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-white p-3.5 rounded-xl border border-emerald-100">
                        <div>
                          <span className="text-sm text-gray-500 block mb-1">Society Account Number</span>
                          <div className="flex items-center gap-1.5 font-medium text-emerald-900">
                            <span>{sa.societyAccountNumber || customer.existingSavingsAccountNumber}</span>
                            <button onClick={() => copyToClipboard(sa.societyAccountNumber || customer.existingSavingsAccountNumber, 'Society Account')} className="text-gray-400 hover:text-emerald-700 cursor-pointer" title="Copy society account">
                              {copiedField === 'Society Account' ? <CheckCheck size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                        <div><span className="text-sm text-gray-500 block mb-1">Society Branch</span><span className="text-base font-medium text-gray-900">{sa.bankBranchName || customer.branchName || 'Pune Main'}</span></div>
                        <div><span className="text-sm text-gray-500 block mb-1">IFSC Code</span><span className="text-base font-medium text-gray-900">{sa.ifscCode || 'PUNB0123400'}</span></div>
                        <div><span className="text-sm text-gray-500 block mb-1">Account Holder</span><span className="text-base font-medium text-gray-900">{sa.accountHolderName || displayName}</span></div>
                      </div>
                    ) : (
                      <div className="bg-white p-4 rounded-xl border border-rose-200 text-center space-y-2">
                        <p className="text-sm text-rose-600 font-medium">No internal society account has been linked to this Pigmy customer record.</p>
                        {customer.savingsAccountOption && (
                           <p className="text-xs text-gray-500">
                             Customer preference: <strong>{customer.savingsAccountOption}</strong> 
                             {customer.newSavingsAccountRequested && ' (Requested New Account)'}
                           </p>
                        )}
                        <button type="button" onClick={() => { onClose(); onOpenAddAccount(customer); }} className="px-4 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium shadow-xs cursor-pointer inline-flex items-center gap-1.5 mt-2">
                          <Plus size={16} /> Link Society Account Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: AUTO-DEBIT MANDATE & SCHEME */}
              {activeTab === 'MANDATE' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block mb-3">Subscribed Pigmy Scheme</span>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-3 text-sm">
                       <div className="grid grid-cols-2 gap-3">
                         <div><span className="text-sm text-gray-500 block mb-1">Scheme Name</span><span className="text-base font-medium text-gray-900">{customer.schemeName || scheme.name || '—'}</span></div>
                         <div><span className="text-sm text-gray-500 block mb-1">Scheme Code</span><span className="text-base font-medium text-gray-900">{customer.schemeCode || scheme.code || '—'}</span></div>
                         <div><span className="text-sm text-gray-500 block mb-1">Deposit Frequency</span><span className="text-base font-medium text-gray-900">{customer.depositFrequency || mandate.autoDebitFrequency || 'DAILY'}</span></div>
                         <div><span className="text-sm text-gray-500 block mb-1">Custom Amount Allowed</span><span className="text-base font-medium text-gray-900">{customer.isCustomAmount || scheme.isCustomAmount ? 'Yes' : 'No'}</span></div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { label: 'Daily Deposit', value: `₹${Number(scheme.dailyDepositAmount || customer?.dailyAmount || mandate.autoDebitAmount || 0).toLocaleString('en-IN')}`, color: 'teal' },
                        { label: 'Tenure', value: `${scheme.tenureMonths || customer?.tenureMonths || 6} Months`, color: 'teal' },
                        { label: 'Interest Rate', value: `${scheme.interestRate || customer?.interestRate || 8}% p.a.`, color: 'teal' },
                        { label: 'Maturity Value', value: `₹${Number(scheme.maturityAmount || customer?.maturityAmount || 0).toLocaleString('en-IN')}`, color: 'emerald' }
                      ].map((item, i) => (
                        <div key={i} className={`p-3 bg-${item.color}-50/70 border border-${item.color}-100 rounded-xl text-center`}>
                          <span className={`text-xs text-${item.color}-800 font-medium block`}>{item.label}</span>
                          <span className={`text-base font-semibold text-${item.color}-900 block mt-0.5`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block mb-3">e-NACH Auto-Debit Mandate Status</span>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 text-sm">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                        <span className="text-gray-500 font-medium">Mandate ID</span>
                        <span className="text-base font-medium text-gray-900">{mandate.mandateId || 'MAND-PIG-' + displayCode}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                        <span className="text-gray-500 font-medium">Mandate Status</span>
                        <span className={`font-medium text-sm ${(mandate.mandateStatus || customer?.mandateStatus) === 'ACTIVE' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {mandate.mandateStatus || customer?.mandateStatus || (isApproved ? 'ACTIVE' : 'PENDING')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                        <span className="text-gray-500 font-medium">Debit Frequency</span>
                        <span className="text-base font-medium text-gray-900">{mandate.autoDebitFrequency || 'DAILY'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 text-sm">
                        <div><span className="text-sm text-gray-500 block mb-1">Tenure Start Date</span><span className="text-base font-medium text-gray-900">{customer?.startDate || mandate.mandateStartDate ? new Date(customer?.startDate || mandate.mandateStartDate).toLocaleDateString('en-IN') : 'Upon QC Approval'}</span></div>
                        <div><span className="text-sm text-gray-500 block mb-1">Tenure End Date</span><span className="text-base font-medium text-gray-900">{customer?.endDate || mandate.mandateEndDate ? new Date(customer?.endDate || mandate.mandateEndDate).toLocaleDateString('en-IN') : 'Calculated from approval'}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AGREEMENTS & DOCUMENTS */}
              {activeTab === 'DOCUMENTS' && (
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block mb-3">Legal Agreements</span>
                    <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0"><FileText size={20} /></div>
                        <div>
                          <span className="font-semibold text-emerald-950 block">Pigmy Deposit Agreement (PDF)</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-emerald-700 block">Doc ID: {agreements.pigmyAgreementDocId || 'DOC-PIG-' + displayCode}</span>
                            <span className="text-xs text-emerald-800 font-medium">| {agreements.pigmyAgreementStatus || 'PENDING'}</span>
                          </div>
                        </div>
                      </div>
                      {agreements.pigmyAgreementPdfUrl ? (
                        <a href={agreements.pigmyAgreementPdfUrl} target="_blank" rel="noreferrer" className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-xs inline-flex items-center gap-1.5 cursor-pointer">
                          <FileCheck size={16} /><span>Open PDF</span><ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500 font-medium">Generated upon approval</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block mb-3">KYC Documents & Photos</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { key: 'profilePhoto', label: 'Profile Photo' },
                        { key: 'ownerPan', label: 'PAN Card' },
                        { key: 'ownerAadhaar', label: 'Aadhaar Card' },
                        { key: 'shopPhoto', label: 'Shop Photo' },
                        { key: 'businessProof', label: 'Business Proof' }
                      ].filter(d => documents[d.key]).map(d => (
                        <a key={d.key} href={documents[d.key]} target="_blank" rel="noreferrer" className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-teal-50 hover:border-teal-300 transition-colors flex items-center justify-between">
                          <span className="font-medium text-gray-800">{d.label}</span>
                          <ExternalLink size={14} className="text-gray-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 cursor-pointer">Close</button>
            {customer && isPending && (
              <button onClick={() => { onClose(); onOpenApprove(customer); }} className="px-4.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5">
                <Check size={14} strokeWidth={2.5} /><span>Proceed to Approve</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// MAIN UNIFIED PIGMY / SMART SIP COMPONENT
// =========================================================================
const PigmyCustomers = () => {
  const navigate = useNavigate();
  const { role, user } = useAuthStore();
  const isOwner = isBankOwner(role, user);

  // ---- TOP-LEVEL TAB ----
  const [mainTab, setMainTab] = useState('customers'); // 'customers' | 'schemes' | 'portfolio'

  // ---- PIGMY CUSTOMER STATES ----
  const [customers, setCustomers] = useState([]);
  const [pigmyLoading, setPigmyLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [customerType, setCustomerType] = useState('ALL');
  const [approvalStatus, setApprovalStatus] = useState('ALL');
  const [selectedBranchId, setSelectedBranchId] = useState(user?.branchId || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState({ totalRecords: 0, totalPages: 1 });
  const [stats, setStats] = useState({ total: 0, individual: 0, merchant: 0, pending: 0, approved: 0, rejected: 0, totalDailyVolume: 0 });

  // ---- SIP SCHEME STATES ----
  const [schemes, setSchemes] = useState([]);
  const [schemesLoading, setSchemesLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [schemeSearch, setSchemeSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');
  const [togglingId, setTogglingId] = useState(null);

  // ---- PIGMY MODAL STATES ----
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [customerToAddAccount, setCustomerToAddAccount] = useState(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [customerToApprove, setCustomerToApprove] = useState(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [customerToReject, setCustomerToReject] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsCustomerId, setDetailsCustomerId] = useState(null);

  // ---- SIP MODAL STATES ----
  const [isCreateSchemeOpen, setIsCreateSchemeOpen] = useState(false);
  const [isEditSchemeOpen, setIsEditSchemeOpen] = useState(false);
  const [schemeToEdit, setSchemeToEdit] = useState(null);
  const [isSchemeDetailsOpen, setIsSchemeDetailsOpen] = useState(false);
  const [schemeToView, setSchemeToView] = useState(null);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [calcScheme, setCalcScheme] = useState(null);

  // ---- DEBOUNCED SEARCH ----
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ---- LOAD BRANCHES ----
  useEffect(() => {
    (async () => {
      try {
        const res = await branchService.list({ limit: 100 });
        const list = Array.isArray(res?.data) ? res.data : res?.data?.branches || res?.branches || [];
        setBranches(list);
      } catch (err) {
        console.warn('Could not load branches:', err);
      }
    })();
  }, []);

  // ---- FETCH PIGMY CUSTOMERS ----
  const fetchCustomers = useCallback(async () => {
    setPigmyLoading(true);
    try {
      const params = { page, limit };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (customerType && customerType !== 'ALL') params.customerType = customerType;
      if (approvalStatus && approvalStatus !== 'ALL') params.approvalStatus = approvalStatus;
      if (isOwner && selectedBranchId) params.branchId = selectedBranchId;
      if (startDate) params.fromDate = startDate;
      if (endDate) params.toDate = endDate;

      const res = await pigmyService.list(params);
      const items = Array.isArray(res?.data) ? res.data : res?.data?.items || res?.items || [];
      setCustomers(items);

      const totalRecs = res?.pagination?.total ?? res?.meta?.totalRecords ?? items.length;
      const totalPgs = res?.pagination?.totalPages ?? res?.meta?.totalPages ?? Math.ceil(totalRecs / limit) ?? 1;
      setMeta({ totalRecords: totalRecs, totalPages: totalPgs });

      const computeStats = (source) => {
        const dailyVol = items.reduce((acc, c) => acc + Number(c.scheme?.dailyDepositAmount || c.dailyAmount || c.mandateDetails?.autoDebitAmount || 0), 0);
        return {
          total: source?.total ?? items.length,
          individual: source?.individual ?? items.filter(c => !c.isMerchant && c.customerType !== 'MERCHANT').length,
          merchant: source?.merchant ?? items.filter(c => c.isMerchant || c.customerType === 'MERCHANT').length,
          pending: source?.pending ?? items.filter(c => (c.approvalStatus || 'PENDING').startsWith('PENDING')).length,
          approved: source?.approved ?? items.filter(c => c.approvalStatus === 'APPROVED').length,
          rejected: source?.rejected ?? items.filter(c => c.approvalStatus === 'REJECTED').length,
          totalDailyVolume: dailyVol
        };
      };
      setStats(computeStats(res?.stats));
    } catch (err) {
      console.error('Error fetching pigmy customers:', err);
      toast.error(err.response?.data?.message || 'Failed to load Pigmy customers from server.');
    } finally {
      setPigmyLoading(false);
    }
  }, [page, limit, debouncedSearch, customerType, approvalStatus, selectedBranchId, startDate, endDate, isOwner]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // ---- FETCH SIP SCHEMES ----
  const fetchSchemes = useCallback(async () => {
    setSchemesLoading(true);
    try {
      const res = await sipService.getSchemes();
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.schemes)) list = res.schemes;
      setSchemes(list);
    } catch (err) {
      console.error('Error fetching SIP schemes:', err);
      toast.error(err.response?.data?.message || 'Failed to load SIP schemes from server');
    } finally {
      setSchemesLoading(false);
    }
  }, []);

  useEffect(() => { fetchSchemes(); }, [fetchSchemes]);

  // ---- FETCH SUBSCRIPTIONS ----
  const fetchSubscriptions = useCallback(async () => {
    setSubsLoading(true);
    try {
      const res = await sipService.getMySips();
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      setSubscriptions(list);
    } catch (err) {
      console.warn('Could not load subscriptions:', err);
    } finally {
      setSubsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mainTab === 'portfolio') fetchSubscriptions();
  }, [mainTab, fetchSubscriptions]);

  // ---- PIGMY HANDLERS ----
  const handleAccountLinked = (id, payload) => {
    setCustomers(prev => prev.map(c => {
      if ((c._id || c.id || c.pigmyCustomerId) === id) {
        return { ...c, societyAccount: { societyAccountNumber: payload.societyAccountNumber, ifscCode: payload.ifscCode, accountHolderName: payload.accountHolderName, bankBranchName: payload.bankBranchName }, existingSavingsAccountNumber: payload.societyAccountNumber };
      }
      return c;
    }));
  };

  const handleApproved = (id) => {
    setCustomers(prev => prev.map(c => ((c._id || c.id || c.pigmyCustomerId) === id ? { ...c, approvalStatus: 'APPROVED', status: 'ACTIVE', mandateStatus: 'ACTIVE' } : c)));
    setStats(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1), approved: prev.approved + 1 }));
  };

  const handleRejected = (id, reason) => {
    setCustomers(prev => prev.map(c => ((c._id || c.id || c.pigmyCustomerId) === id ? { ...c, approvalStatus: 'REJECTED', status: 'INACTIVE', rejectionReason: reason } : c)));
    setStats(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1), rejected: prev.rejected + 1 }));
  };

  const handleApproveClick = (customer) => { setCustomerToApprove(customer); setIsApproveOpen(true); };
  const handleOpenAddAccount = (customer) => { setCustomerToAddAccount(customer); setIsAddAccountOpen(true); };
  const handleOpenReject = (customer) => { setCustomerToReject(customer); setIsRejectOpen(true); };
  const handleOpenDetails = (customer) => { setDetailsCustomerId(customer._id || customer.id || customer.pigmyCustomerId); setIsDetailsOpen(true); };

  // ---- SIP HANDLERS ----
  const handleToggleStatus = async (scheme) => {
    if (!isOwner) { toast.warning('Only Bank Owners can toggle scheme availability.'); return; }
    const id = scheme._id || scheme.id;
    const newStatus = scheme.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setTogglingId(id);
    try {
      const res = await sipService.updateSchemeStatus(id, newStatus);
      toast.success(res?.message || `Scheme marked as ${newStatus}`);
      setSchemes(prev => prev.map(s => ((s._id || s.id) === id ? { ...s, status: newStatus } : s)));
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error(err.response?.data?.message || 'Failed to update scheme status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenSchemeEdit = (scheme) => { setSchemeToEdit(scheme); setIsEditSchemeOpen(true); };
  const handleOpenSchemeDetails = (scheme) => { setSchemeToView(scheme); setIsSchemeDetailsOpen(true); };
  const handleOpenCalculator = (scheme = null) => { setCalcScheme(scheme || schemes[0] || null); setIsCalcOpen(true); };
  const handleOpenSubscribe = (scheme = null) => { setSchemeToView(scheme || schemes.find(s => s.status === 'ACTIVE') || schemes[0]); setIsSubscribeOpen(true); };

  // ---- COMPUTED ----
  const filteredSchemes = useMemo(() => {
    return schemes.filter(s => {
      const matchesSearch = !schemeSearch.trim() || (s.schemeName && s.schemeName.toLowerCase().includes(schemeSearch.toLowerCase())) || (s.schemeCode && s.schemeCode.toLowerCase().includes(schemeSearch.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' && s.status === 'ACTIVE') || (statusFilter === 'INACTIVE' && s.status !== 'ACTIVE');
      return matchesSearch && matchesStatus;
    });
  }, [schemes, schemeSearch, statusFilter]);

  const schemeStats = useMemo(() => {
    const total = schemes.length;
    const active = schemes.filter(s => s.status === 'ACTIVE').length;
    const inactive = total - active;
    let minRate = Infinity, maxRate = -Infinity;
    schemes.forEach(s => {
      if (Array.isArray(s.durationPlans)) s.durationPlans.forEach(p => {
        if (typeof p.interestRate === 'number') { if (p.interestRate < minRate) minRate = p.interestRate; if (p.interestRate > maxRate) maxRate = p.interestRate; }
      });
    });
    const rateDisplay = minRate !== Infinity && maxRate !== -Infinity ? (minRate === maxRate ? `${minRate}%` : `${minRate}% - ${maxRate}%`) : '6.5% - 8.5%';
    return { total, active, inactive, rateDisplay };
  }, [schemes]);

  // ---- ACTIVE REFRESH ----
  const handleRefresh = () => {
    if (mainTab === 'customers') fetchCustomers();
    else if (mainTab === 'schemes') fetchSchemes();
    else fetchSubscriptions();
  };

  const isLoading = mainTab === 'customers' ? pigmyLoading : mainTab === 'schemes' ? schemesLoading : subsLoading;

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-6">
        <PageHeader
          title="Pigmy Deposit Management"
          breadcrumbs={[
            { label: "Dashboard", to: "/dashboard" },
            { label: "CRM Management" },
            { label: "Leads", to: "/leads" },
            { label: "Customer" }
          ]}
          showBack={true}
          backUrl="/leads"
        >
          <button onClick={() => handleOpenCalculator()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm shadow-2xs hover:shadow-xs transition-all cursor-pointer">
            <Calculator size={16} className="text-[#225091]" /><span>SIP Calculator</span>
          </button>
          <button onClick={() => handleOpenSubscribe()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#225091] hover:bg-[#1b3f72] text-white font-semibold text-sm shadow-xs hover:shadow-md transition-all cursor-pointer" title="Onboard verified customer to a Daily SIP">
            <UserPlus size={16} /><span>Onboard Customer</span>
          </button>
          {isOwner && (
            <button onClick={() => setIsCreateSchemeOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1b58a6] to-[#225091] hover:from-[#174682] hover:to-[#1b3f72] text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all cursor-pointer">
              <Plus size={17} strokeWidth={2.5} /><span>Create Scheme</span>
            </button>
          )}
          <button onClick={handleRefresh} disabled={isLoading} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer" title="Refresh Data">
            <RefreshCw size={17} className={isLoading ? 'animate-spin text-[#225091]' : ''} />
          </button>
        </PageHeader>
      </div>

      {/* ==================== MODULE TABS ==================== */}
      <div className="flex items-center gap-1 border-b border-gray-200 bg-white rounded-t-2xl px-2 pt-1 mb-6">
        {[
          { key: 'customers', label: 'Customer Applications', icon: User, count: stats.total },
          { key: 'schemes', label: 'SIP Schemes Catalog', icon: Layers, count: schemes.length },
          { key: 'portfolio', label: 'Customer Portfolio', icon: Wallet, count: subscriptions.length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setMainTab(tab.key)}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              mainTab === tab.key ? 'border-[#225091] text-[#225091]' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label} ({tab.count})</span>
          </button>
        ))}
      </div>

      {/* ==================== TAB 1: CUSTOMERS ==================== */}
      {mainTab === 'customers' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
            <StatsCard
              layout="centered"
              label="Total Leads"
              value={stats.total}
              sublabel={`${stats.individual} Indiv. · ${stats.merchant} Merch.`}
              color="blue"
              loading={pigmyLoading && stats.total === 0}
            />
            <StatsCard
              layout="centered"
              label="Pending QC"
              value={stats.pending}
              sublabel="Awaiting approval"
              color="amber"
              loading={pigmyLoading && stats.total === 0}
            />
            <StatsCard
              layout="centered"
              label="Active Deposits"
              value={stats.approved}
              sublabel="Mandate active"
              color="emerald"
              loading={pigmyLoading && stats.total === 0}
            />
            <StatsCard
              layout="centered"
              label="Rejected"
              value={stats.rejected}
              sublabel="Failed QC checks"
              color="rose"
              loading={pigmyLoading && stats.total === 0}
            />
            <div className="bg-gradient-to-tr from-[#1b58a6] to-[#2563eb] rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center text-white">
              <span className="text-xl font-black leading-none mb-1">
                {pigmyLoading && stats.total === 0 ? <Loader2 size={18} className="animate-spin text-white/70" /> : `₹${Number(stats.totalDailyVolume || 0).toLocaleString('en-IN')}`}
              </span>
              <span className="text-[10px] font-bold text-blue-100 uppercase tracking-wider text-center">
                Daily Volume
              </span>
            </div>
          </div>

          {/* Harmonized Filter Toolbar Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 sm:p-4 shadow-2xs space-y-3.5 mb-6">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name, phone, Pigmy Code (e.g. PIG-508462)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all shadow-2xs"
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" title="Clear Search">
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Filter Controls Row */}
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                <div className="relative">
                  <select value={customerType} onChange={(e) => { setCustomerType(e.target.value); setPage(1); }} className="pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] bg-white text-xs font-semibold text-gray-700 shadow-2xs cursor-pointer appearance-none">
                    <option value="ALL">All Types</option>
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="MERCHANT">Merchant</option>
                  </select>
                  <Filter size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select value={approvalStatus} onChange={(e) => { setApprovalStatus(e.target.value); setPage(1); }} className="pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] bg-white text-xs font-semibold text-gray-700 shadow-2xs cursor-pointer appearance-none">
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                  <Filter size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {isOwner && (
                  <div className="relative">
                    <select value={selectedBranchId} onChange={(e) => { setSelectedBranchId(e.target.value); setPage(1); }} className="pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] bg-white text-xs font-semibold text-gray-700 shadow-2xs cursor-pointer appearance-none">
                      <option value="">All Branches</option>
                      {branches.map(b => (<option key={b._id || b.id} value={b._id || b.id}>{b.name || b.branchName}</option>))}
                    </select>
                    <Filter size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                )}

                <div className="relative flex items-center">
                  <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} title="From Date" className="pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] bg-white text-xs font-semibold text-gray-700 shadow-2xs cursor-pointer hover:bg-gray-50/50 transition-all" />
                  <Calendar size={13} className="absolute left-2.5 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative flex items-center">
                  <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} title="To Date" className="pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] bg-white text-xs font-semibold text-gray-700 shadow-2xs cursor-pointer hover:bg-gray-50/50 transition-all" />
                  <Calendar size={13} className="absolute left-2.5 text-gray-400 pointer-events-none" />
                </div>
                {(startDate || endDate) && (
                  <button type="button" onClick={() => { setStartDate(""); setEndDate(""); setPage(1); }} title="Clear Dates" className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 transition-colors cursor-pointer">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Customer Table */}
          <TableWrapper>
            <table className="w-full text-center text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-[#225091] border-b border-[#225091]">
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 w-12 text-center">Sr. No.</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Date & Time</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Customer Name</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Pigmy Code & Acc No</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Contact & Branch</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Daily Deposit & Scheme</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Society Account (Credit Link)</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Commercial Account (Debit Source)</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Approval Status</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
                <tbody className="divide-y divide-gray-100">
                  {pigmyLoading ? (
                    <tr><td colSpan={9} className="py-12 text-center text-gray-400 font-medium text-xs"><Loader2 size={24} className="animate-spin mx-auto text-emerald-600 mb-2" />Loading Pigmy customer records...</td></tr>
                  ) : customers.length === 0 ? (
                    <tr><td colSpan={9} className="py-12 text-center text-gray-400 font-medium text-xs">No Pigmy deposit customers found matching the selected filters.</td></tr>
                  ) : (
                    customers.map((c, index) => {
                      const cId = c._id || c.id || c.pigmyCustomerId;
                      const sa = c.societyAccount || {};
                      const ba = c.bankAccountDetails || {};
                      const scheme = c.scheme || {};
                      const hasAccount = Boolean(sa.societyAccountNumber || c.existingSavingsAccountNumber);
                      const isPending = (c.approvalStatus || 'PENDING').startsWith('PENDING');
                      const isApproved = c.approvalStatus === 'APPROVED';
                      const isRejected = c.approvalStatus === 'REJECTED';
                      const displayName = c.fullName || c.name || c.ownerName || 'Customer';
                      const displayCode = c.pigmyCustomerCode || c.pigmyCode || c.code || cId?.slice(-8);
                      const isMerchant = c.isMerchant || c.customerType === 'MERCHANT';
                      const dailyDeposit = scheme.dailyDepositAmount || c.dailyAmount || c.mandateDetails?.autoDebitAmount || 0;
                      const tenureMonths = scheme.tenureMonths || c.tenureMonths || 6;
                      const interestRate = scheme.interestRate || c.interestRate || 8;

                      return (
                        <tr key={cId} className="hover:bg-gray-50/60 transition-colors border-b border-gray-100">
                          <td className="py-3.5 px-3 text-center border-r border-gray-100 text-sm font-medium text-gray-600">
                            {(page - 1) * limit + index + 1}
                          </td>
                          <td className="py-3.5 px-3 border-r border-gray-100 text-center">
                            {c.createdAt ? (
                              <>
                                <span className="text-[12px] font-semibold text-gray-800 block">
                                  {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </span>
                                <span className="text-[11px] text-gray-500 block mt-0.5">
                                  {new Date(c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
                                </span>
                              </>
                            ) : <span className="text-gray-400 text-xs">—</span>}
                          </td>
                          <td className="py-3.5 px-3 border-r border-gray-100 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="font-semibold text-sm text-gray-900 block">{displayName}</span>
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${isMerchant ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-gray-100 text-gray-600'}`}>{isMerchant ? 'MERCHANT' : 'INDIVIDUAL'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 border-r border-gray-100">
                            <span className="text-sm font-medium text-gray-800 block">{displayCode}</span>
                            {c.accountNumber && <span className="text-sm text-gray-500 block mb-1">{c.accountNumber}</span>}
                          </td>
                          <td className="py-3.5 px-3 border-r border-gray-100">
                            <span className="text-sm font-medium text-gray-800 block">{c.primaryPhoneNumber || c.phoneNumber || c.phone || '—'}</span>
                            <span className="text-xs text-teal-700 font-medium block mt-0.5">{c.branchName || 'Assigned Branch'}</span>
                          </td>
                          <td className="py-3.5 px-3 border-r border-gray-100">
                            <span className="text-sm font-semibold text-teal-700 block">₹{Number(dailyDeposit).toLocaleString('en-IN')} / day</span>
                            <span className="text-sm text-gray-500 block mb-1">{tenureMonths} Mo @ {interestRate}% p.a.</span>
                          </td>
                          <td className="py-3.5 px-3 border-r border-gray-100">
                            {hasAccount ? (
                              <span className="text-sm font-medium text-gray-800 block">
                                {sa.societyAccountNumber || c.existingSavingsAccountNumber}
                              </span>
                            ) : (
                              <div className="inline-flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                                  <AlertTriangle size={12} className="text-rose-500" />Missing Link
                                </span>
                                <button type="button" onClick={() => handleOpenAddAccount(c)} className="text-xs font-medium text-teal-600 hover:text-teal-800 underline cursor-pointer">+ Link</button>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-3 border-r border-gray-100">
                            <span className="text-sm font-semibold text-gray-900 block">{ba.bankName || 'HDFC Bank'}</span>
                            <span className="text-sm text-gray-500 block mb-1">{ba.accountNumber ? `•••• ${ba.accountNumber.slice(-4)}` : 'e-NACH Linked'}</span>
                          </td>
                          <td className="py-3.5 px-3 border-r border-gray-100">
                            <span className={`text-sm font-semibold ${isApproved ? 'text-emerald-600' : isRejected ? 'text-rose-600' : 'text-amber-600'}`}>
                              {isApproved ? 'APPROVED' : isRejected ? 'REJECTED' : 'PENDING APPROVAL'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {isPending && (
                                  <>
                                    <button type="button" onClick={() => handleApproveClick(c)} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer" title="Approve application">
                                      <Check size={16} />
                                    </button>
                                    <button type="button" onClick={() => handleOpenReject(c)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer" title="Reject application">
                                      <X size={16} />
                                    </button>
                                  </>
                                )}
                                <button type="button" onClick={() => handleOpenAddAccount(c)} className="p-1.5 rounded-lg text-[#225091] hover:bg-[#EAF2FB] transition-colors cursor-pointer" title="Add / Link Society Account">
                                  <Landmark size={16} />
                                </button>
                                <button type="button" onClick={() => handleOpenDetails(c)} className="p-1.5 rounded-lg text-gray-500 hover:text-[#225091] hover:bg-[#EAF2FB] transition-colors cursor-pointer" title="Inspect Details">
                                  <Eye size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </TableWrapper>

            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={meta.totalPages}
              totalRecords={meta.totalRecords}
              limit={limit}
              onPageChange={setPage}
            />
        </>
      )}

      {/* ==================== TAB 2: SCHEMES ==================== */}
      {mainTab === 'schemes' && (
        <>
          {/* Scheme Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Active Schemes', value: schemeStats.active, sub: 'Live for Customer Onboarding', icon: TrendingUp, color: 'emerald' },
              { label: 'Total Products', value: schemeStats.total, sub: `${schemeStats.inactive} Inactive / Archived`, icon: Layers, color: 'blue' },
              { label: 'Interest Rate Range', value: schemeStats.rateDisplay, sub: 'Compounding Return p.a.', icon: Percent, color: 'teal' },
              { label: 'Deposit Frequency', value: 'DAILY', sub: 'Auto-debited from Savings A/c', icon: Calendar, color: 'amber' }
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.label}</p>
                  <h3 className={`text-2xl font-bold text-${card.color === 'blue' ? '[#225091]' : card.color + '-700'} mt-1`}>{card.value}</h3>
                  <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-${card.color}-50 border border-${card.color}-100 flex items-center justify-center text-${card.color}-600`}><card.icon size={24} /></div>
              </div>
            ))}
          </div>

          {/* Scheme Controls */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by name, code (e.g. DAILY_GOLD)..." value={schemeSearch} onChange={(e) => setSchemeSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all text-gray-800 placeholder-gray-400" />
              {schemeSearch && (<button onClick={() => setSchemeSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"><X size={15} /></button>)}
            </div>
            <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
              <div className="inline-flex p-1 bg-gray-100/80 rounded-xl border border-gray-200/60 text-xs font-semibold">
                {[{ key: 'ALL', label: `All (${schemes.length})` }, { key: 'ACTIVE', label: `Active (${schemeStats.active})` }, { key: 'INACTIVE', label: `Inactive (${schemeStats.inactive})` }].map(f => (
                  <button key={f.key} onClick={() => setStatusFilter(f.key)} className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${statusFilter === f.key ? (f.key === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : f.key === 'INACTIVE' ? 'bg-gray-700 text-white shadow-2xs font-bold' : 'bg-white text-gray-900 shadow-2xs font-bold') : 'text-gray-500 hover:text-gray-800'}`}>{f.label}</button>
                ))}
              </div>
              <div className="inline-flex p-1 bg-gray-100/80 rounded-xl border border-gray-200/60 text-gray-500">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-teal-700 shadow-2xs' : 'hover:text-gray-800'}`} title="Grid Cards View"><Sparkles size={16} /></button>
                <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white text-teal-700 shadow-2xs' : 'hover:text-gray-800'}`} title="Compact Table View"><Layers size={16} /></button>
              </div>
            </div>
          </div>

          {/* Scheme Display */}
          {schemesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs animate-pulse space-y-4">
                  <div className="flex justify-between items-center"><div className="w-24 h-6 bg-gray-200 rounded-md" /><div className="w-16 h-6 bg-gray-200 rounded-full" /></div>
                  <div className="w-3/4 h-5 bg-gray-200 rounded-md" /><div className="w-full h-12 bg-gray-100 rounded-xl" />
                  <div className="grid grid-cols-4 gap-2 pt-2">{[1, 2, 3, 4].map(i => (<div key={i} className="h-14 bg-gray-100 rounded-xl" />))}</div>
                </div>
              ))}
            </div>
          ) : filteredSchemes.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4"><TrendingUp size={30} /></div>
              <h3 className="text-lg font-bold text-gray-800">No SIP Schemes Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">{schemeSearch ? `No scheme matching "${schemeSearch}" in ${statusFilter.toLowerCase()} schemes.` : 'Get started by creating your first daily systematic investment plan scheme.'}</p>
              {isOwner && (<button onClick={() => setIsCreateSchemeOpen(true)} className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 shadow-sm transition-all cursor-pointer"><Plus size={15} /><span>Create First Scheme</span></button>)}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchemes.map(scheme => {
                const sId = scheme._id || scheme.id;
                const isActive = scheme.status === 'ACTIVE';
                const isToggling = togglingId === sId;
                const durationList = scheme.durationPlans?.length > 0 ? scheme.durationPlans : DEFAULT_DURATION_PLANS;
                const allowedList = scheme.allowedAmounts?.length > 0 ? scheme.allowedAmounts : DEFAULT_ALLOWED_AMOUNTS;

                return (
                  <div key={sId} className={`group bg-white rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-lg relative overflow-hidden ${isActive ? 'border-gray-200/90 hover:border-teal-500/40' : 'border-gray-200/60 bg-gray-50/40 opacity-80'}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 border border-gray-200">{scheme.schemeCode}</span>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />{scheme.status || 'ACTIVE'}
                          </span>
                          {isOwner && (
                            <button type="button" onClick={() => handleToggleStatus(scheme)} disabled={isToggling} title={isActive ? 'Deactivate scheme' : 'Activate scheme'} className={`p-1 rounded-lg border transition-colors cursor-pointer ${isActive ? 'border-emerald-200 text-emerald-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200' : 'border-gray-200 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'}`}>
                              {isToggling ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} strokeWidth={2.5} />}
                            </button>
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg font-extrabold text-[#1b2559] group-hover:text-teal-700 transition-colors leading-snug">{scheme.schemeName}</h3>
                      <p className="text-xs text-gray-500 font-medium line-clamp-2 mt-1.5 leading-relaxed">{scheme.description || 'Daily recurring investment scheme with compounding interest.'}</p>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2"><span>Duration Milestones & Returns</span><span className="text-teal-700">Daily SIP</span></div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {durationList.map(plan => (
                            <div key={plan.durationMonths} className="p-2 rounded-xl bg-gray-50 group-hover:bg-teal-50/40 border border-gray-200/60 group-hover:border-teal-100 text-center transition-colors">
                              <span className="text-[11px] font-medium text-gray-500 block">{plan.durationMonths} Mo</span>
                              <span className="text-xs font-extrabold text-teal-700 block mt-0.5">{plan.interestRate}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3.5">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Allowed Daily Amounts</span>
                        <div className="flex flex-wrap gap-1">
                          {allowedList.slice(0, 5).map(amt => (<span key={amt} className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-bold">₹{amt}</span>))}
                          {allowedList.length > 5 && <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500 text-[11px] font-bold">+{allowedList.length - 5} more</span>}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-gray-400 font-medium">Custom Range:</span>
                        <span className="font-bold text-gray-800 text-[11px]">{scheme.customAmountEnabled ? `₹${(scheme.customAmountMin || 3000).toLocaleString('en-IN')} - ₹${(scheme.customAmountMax || 50000).toLocaleString('en-IN')}` : 'Disabled'}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => handleOpenSchemeDetails(scheme)} className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition-colors cursor-pointer">Details</button>
                        <button type="button" onClick={() => handleOpenCalculator(scheme)} className="p-1.5 rounded-xl border border-gray-200 text-teal-600 hover:bg-teal-50 transition-colors cursor-pointer" title="Calculate returns"><Calculator size={15} /></button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isOwner && (
                          <button type="button" onClick={() => handleOpenSchemeEdit(scheme)} className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 text-indigo-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1" title="Customise scheme rates & limits"><Edit size={13} /><span>Customise</span></button>
                        )}
                        <button type="button" onClick={() => handleOpenSubscribe(scheme)} disabled={!isActive} className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-xs shadow-2xs hover:shadow-xs transition-all flex items-center gap-1 cursor-pointer" title={isActive ? 'Onboard customer to this scheme' : 'Scheme is inactive'}><UserPlus size={13} /><span>Subscribe</span></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <TableWrapper>
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
                    <tr>
                      <th className="py-3.5 px-3 border-r border-white/20 w-12 text-center">Sr. No.</th>
                      <th className="py-3.5 px-5 border-r border-white/20">Scheme Code</th>
                      <th className="py-3.5 px-5 border-r border-white/20">Scheme Name</th>
                      <th className="py-3.5 px-5 border-r border-white/20">Duration Milestones & Rates</th>
                      <th className="py-3.5 px-5 border-r border-white/20">Allowed Daily Tiers</th>
                      <th className="py-3.5 px-5 border-r border-white/20">Custom Limits</th>
                      <th className="py-3.5 px-5 border-r border-white/20">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSchemes.map((scheme, index) => {
                      const sId = scheme._id || scheme.id;
                      const isActive = scheme.status === 'ACTIVE';
                      const isToggling = togglingId === sId;
                      const durationList = scheme.durationPlans || DEFAULT_DURATION_PLANS;
                      const allowedList = scheme.allowedAmounts || DEFAULT_ALLOWED_AMOUNTS;

                      return (
                        <tr key={sId} className="hover:bg-gray-50/60 transition-colors border-b border-gray-100">
                          <td className="py-3.5 px-3 text-center border-r border-gray-100 text-xs font-medium text-gray-500">
                            {index + 1}
                          </td>
                          <td className="py-3.5 px-5 border-r border-gray-100 font-mono text-xs font-bold text-[#1b2559]">{scheme.schemeCode}</td>
                          <td className="py-3.5 px-5 border-r border-gray-100"><span className="font-bold text-gray-900 block">{scheme.schemeName}</span><span className="text-[11px] text-gray-400 block max-w-xs truncate">{scheme.description || 'Daily investment plan'}</span></td>
                          <td className="py-3.5 px-5 border-r border-gray-100"><div className="flex items-center gap-1.5">{durationList.map(p => (<span key={p.durationMonths} className="px-2 py-0.5 rounded-lg bg-teal-50 border border-teal-100 text-teal-800 text-xs font-bold">{p.durationMonths}M: {p.interestRate}%</span>))}</div></td>
                          <td className="py-3.5 px-5 border-r border-gray-100 text-xs text-gray-700 font-semibold">{allowedList.slice(0, 3).map(a => `₹${a}`).join(', ')}{allowedList.length > 3 && ` +${allowedList.length - 3}`}</td>
                          <td className="py-3.5 px-5 border-r border-gray-100 text-xs text-gray-600">{scheme.customAmountEnabled ? `₹${(scheme.customAmountMin || 3000).toLocaleString('en-IN')} - ₹${(scheme.customAmountMax || 50000).toLocaleString('en-IN')}` : 'Disabled'}</td>
                          <td className="py-3.5 px-5 border-r border-gray-100">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>{scheme.status || 'ACTIVE'}</span>
                              {isOwner && (<button type="button" onClick={() => handleToggleStatus(scheme)} disabled={isToggling} className="p-1 rounded-md border border-gray-200 text-gray-500 hover:text-emerald-600 cursor-pointer" title="Toggle status">{isToggling ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}</button>)}
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => handleOpenCalculator(scheme)} className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 cursor-pointer" title="Calculator"><Calculator size={15} /></button>
                              {isOwner && (<button onClick={() => handleOpenSchemeEdit(scheme)} className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 cursor-pointer" title="Customise"><Edit size={15} /></button>)}
                              <button onClick={() => handleOpenSubscribe(scheme)} disabled={!isActive} className="p-1.5 rounded-lg text-[#225091] hover:bg-[#EAF2FB] disabled:opacity-40 cursor-pointer" title="Subscribe"><UserPlus size={15} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
            </TableWrapper>
          )}
        </>
      )}

      {/* ==================== TAB 3: PORTFOLIO ==================== */}
      {mainTab === 'portfolio' && (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Active Customer Subscriptions</h3>
              <p className="text-xs text-gray-500">Live ledger of enrolled customer Daily SIP accounts</p>
            </div>
            <button onClick={fetchSubscriptions} disabled={subsLoading} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold hover:bg-gray-50 text-gray-700 cursor-pointer">
              <RefreshCw size={13} className={subsLoading ? 'animate-spin text-teal-600' : ''} /><span>Refresh Ledger</span>
            </button>
          </div>
          <TableWrapper>
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
                <tr>
                  <th className="py-3.5 px-3 border-r border-white/20 w-12 text-center">Sr. No.</th>
                  <th className="py-3.5 px-5 border-r border-white/20">Subscription ID</th>
                  <th className="py-3.5 px-5 border-r border-white/20">Scheme</th>
                  <th className="py-3.5 px-5 border-r border-white/20">Daily Contribution</th>
                  <th className="py-3.5 px-5 border-r border-white/20">Duration & Rate</th>
                  <th className="py-3.5 px-5 border-r border-white/20">Installments Progress</th>
                  <th className="py-3.5 px-5 border-r border-white/20">Total Invested</th>
                  <th className="py-3.5 px-5 border-r border-white/20">Est. Maturity Amount</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subsLoading ? (
                  <tr><td colSpan={9} className="py-12 text-center text-gray-400 font-medium text-xs"><Loader2 size={24} className="animate-spin mx-auto text-teal-600 mb-2" />Loading customer subscriptions...</td></tr>
                ) : subscriptions.length === 0 ? (
                  <tr><td colSpan={9} className="py-12 text-center text-gray-400 font-medium text-xs">No customer SIP subscriptions recorded yet. Use "Onboard Customer" to create one.</td></tr>
                ) : (
                  subscriptions.map((sub, index) => {
                    const subId = sub._id || sub.id;
                    const paid = sub.paidInstallments || 0;
                    const total = sub.totalInstallments || (sub.durationMonths === 6 ? 181 : 365);
                    const pct = Math.min(100, Math.round((paid / total) * 100));

                    return (
                      <tr key={subId} className="hover:bg-gray-50/60 transition-colors border-b border-gray-100">
                        <td className="py-3.5 px-3 text-center border-r border-gray-100 text-xs font-medium text-gray-500">
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-5 border-r border-gray-100 font-mono text-xs font-bold text-[#225091]">{subId ? `${subId.slice(-8)}` : '—'}</td>
                        <td className="py-3.5 px-5 border-r border-gray-100"><span className="font-bold text-gray-900 block">{sub.schemeName || sub.schemeId?.schemeName || 'Daily SIP'}</span><span className="font-mono text-[11px] text-gray-400 block">{sub.schemeCode || sub.schemeId?.schemeCode}</span></td>
                        <td className="py-3.5 px-5 border-r border-gray-100 font-extrabold text-teal-700">₹{sub.amount?.toLocaleString('en-IN')} / day</td>
                        <td className="py-3.5 px-5 border-r border-gray-100 text-xs text-gray-700"><span className="font-semibold">{sub.durationMonths} Months</span><span className="text-gray-400 block text-[11px]">Rate: {sub.interestRate}% p.a.</span></td>
                        <td className="py-3.5 px-5 border-r border-gray-100">
                          <div className="w-32">
                            <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1"><span>{paid} / {total}</span><span>{pct}%</span></div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden"><div className="bg-teal-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} /></div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 border-r border-gray-100 font-bold text-gray-900 text-xs">₹{(sub.totalInvested || 0).toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-5 border-r border-gray-100 font-black text-emerald-700 text-xs">₹{Number(sub.maturityAmount || 0).toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${sub.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : sub.status === 'MATURED' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                            {sub.status || 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </TableWrapper>
        </div>
      )}

      {/* ==================== ALL MODALS ==================== */}
      {/* Pigmy Modals */}
      <AddSocietyAccountModal isOpen={isAddAccountOpen} customer={customerToAddAccount} onClose={() => { setIsAddAccountOpen(false); setCustomerToAddAccount(null); }} onSuccess={handleAccountLinked} />
      <ApproveCustomerModal isOpen={isApproveOpen} customer={customerToApprove} onClose={() => { setIsApproveOpen(false); setCustomerToApprove(null); }} onSuccess={handleApproved} onOpenAddAccount={handleOpenAddAccount} />
      <RejectCustomerModal isOpen={isRejectOpen} customer={customerToReject} onClose={() => { setIsRejectOpen(false); setCustomerToReject(null); }} onSuccess={handleRejected} />
      <CustomerDetailsModal isOpen={isDetailsOpen} customerId={detailsCustomerId} onClose={() => { setIsDetailsOpen(false); setDetailsCustomerId(null); }} onOpenApprove={handleApproveClick} onOpenAddAccount={handleOpenAddAccount} />

      {/* SIP Modals */}
      <CreateSchemeModal isOpen={isCreateSchemeOpen} onClose={() => setIsCreateSchemeOpen(false)} onSuccess={fetchSchemes} />
      <EditSchemeModal isOpen={isEditSchemeOpen} scheme={schemeToEdit} onClose={() => { setIsEditSchemeOpen(false); setSchemeToEdit(null); }} onSuccess={fetchSchemes} />
      <SubscribeCustomerModal isOpen={isSubscribeOpen} schemes={schemes.filter(s => s.status === 'ACTIVE')} initialScheme={schemeToView} branches={branches} onClose={() => setIsSubscribeOpen(false)} onSuccess={() => { fetchSchemes(); fetchSubscriptions(); }} />
      <CalculatorModal isOpen={isCalcOpen} schemes={schemes.filter(s => s.status === 'ACTIVE')} initialScheme={calcScheme} onClose={() => setIsCalcOpen(false)} onSelectPlan={(plan) => { setSchemeToView(plan.scheme); setIsSubscribeOpen(true); }} />
      <SchemeDetailsModal isOpen={isSchemeDetailsOpen} scheme={schemeToView} onClose={() => { setIsSchemeDetailsOpen(false); setSchemeToView(null); }} onEdit={() => { setIsSchemeDetailsOpen(false); handleOpenSchemeEdit(schemeToView); }} isOwner={isOwner} />
    </div>
  );
};

export default PigmyCustomers;
