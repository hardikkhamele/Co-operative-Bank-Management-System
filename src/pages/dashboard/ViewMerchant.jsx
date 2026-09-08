import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Store, User, Phone, Mail, Building2, FileText, CreditCard, 
  ShieldCheck, Calendar, Copy, CheckCheck, ExternalLink, 
  Eye, X, FileCheck, MapPin, Hash, RefreshCw,
  CheckCircle2, XCircle, Clock, AlertCircle, Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/authStore';
import usePermission from '../../hooks/usePermission';
import { canApproveMerchantOnboarding, isBankOwner } from '../../utils/roleUtils';
import PageHeader from '../../components/common/PageHeader';
import { SkeletonDetailView } from '../../components/common/Skeleton';
import { merchantService } from '../../api/merchantService';

// Reusable Info Card that prevents data collision / overriding
const InfoFieldCard = ({ icon: Icon, label, value, copyable = false, isMonospace = false, subtitle = null }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!value || value === '—') return;
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    toast.success(`${label} copied!`, { autoClose: 1500 });
    setTimeout(() => setCopied(false), 2000);
  };

  const hasValue = Boolean(value && value !== '—');

  return (
    <div className="bg-[#fcfdfe] hover:bg-white rounded-2xl p-4 md:p-4.5 flex items-start gap-3.5 border border-gray-100 hover:border-gray-200/80 shadow-2xs hover:shadow-xs transition-all min-w-0 overflow-hidden group">
      {Icon && (
        <div className="text-[#225091] shrink-0 bg-blue-50/80 p-2.5 rounded-xl border border-blue-100/60 mt-0.5 group-hover:scale-105 transition-transform">
          <Icon size={18} strokeWidth={2} />
        </div>
      )}
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider truncate">
            {label}
          </span>
          {copyable && hasValue && (
            <button
              type="button"
              onClick={handleCopy}
              className="text-gray-400 hover:text-[#225091] p-1 rounded-md hover:bg-blue-50/80 transition-colors shrink-0"
              title={`Copy ${label}`}
            >
              {copied ? <CheckCheck size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
          )}
        </div>
        <div 
          className={`text-[14px] font-semibold text-gray-900 break-all leading-snug select-text ${
            isMonospace ? 'font-mono tracking-wide text-[13px] text-gray-800' : ''
          } ${!hasValue ? 'text-gray-400 font-normal italic' : ''}`}
          title={hasValue ? String(value) : undefined}
        >
          {hasValue ? value : 'Not Provided'}
        </div>
        {subtitle && (
          <span className="text-[11px] text-gray-400 mt-0.5 truncate">{subtitle}</span>
        )}
      </div>
    </div>
  );
};

// Reusable Document Card with Preview and Download support
const DocumentCard = ({ label, icon: Icon, documentData, onPreview }) => {
  const fileUrl = typeof documentData === 'string' ? documentData : (documentData?.url || documentData?.fileUrl);
  const fileName = documentData?.filename || documentData?.name || (typeof documentData === 'string' ? documentData.split('/').pop() : null) || 'Document';
  const hasDocument = Boolean(fileUrl);

  const isImage = fileUrl && fileUrl.match(/\.(jpeg|jpg|png|webp|gif|svg)$/i);
  const isPdf = fileUrl && fileUrl.match(/\.pdf$/i);

  return (
    <div className="flex flex-col h-full bg-[#fcfdfe] hover:bg-white rounded-2xl p-4 border border-gray-100 hover:border-gray-200 shadow-2xs hover:shadow-xs transition-all min-w-0">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-2 rounded-xl shrink-0 ${hasDocument ? 'bg-blue-50 text-[#225091] border border-blue-100/60' : 'bg-gray-100 text-gray-400'}`}>
            {Icon ? <Icon size={17} /> : <FileText size={17} />}
          </div>
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider truncate" title={label}>
            {label}
          </span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
          hasDocument 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
            : 'bg-gray-50 text-gray-400 border-gray-200/60'
        }`}>
          {hasDocument ? (isPdf ? 'PDF' : isImage ? 'IMAGE' : 'UPLOADED') : 'MISSING'}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between pt-1">
        {hasDocument ? (
          <>
            <div className="mb-3.5 bg-gray-50/70 p-2.5 rounded-xl border border-gray-100 min-w-0">
              <span className="text-xs font-medium text-gray-700 block truncate" title={fileName}>
                {fileName}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-gray-100/80">
              <button
                type="button"
                onClick={() => onPreview({ url: fileUrl, title: label, fileName })}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 text-[#225091] font-semibold text-xs transition-colors cursor-pointer"
              >
                <Eye size={14} />
                <span>Preview</span>
              </button>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-[#225091] hover:bg-gray-50 transition-colors"
                title="Open in new tab / Download"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-gray-200/70 rounded-xl bg-gray-50/40 text-gray-400 text-center flex-1">
            <span className="text-xs font-medium">No document uploaded</span>
            <span className="text-[10px] text-gray-400 mt-0.5">Optional KYC proof</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ViewMerchant = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [merchant, setMerchant] = useState(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);

  // Permissions & Roles Access Control: Bank Owner, Society Admin, Branch Manager
  const authRole = useAuthStore((state) => state.role);
  const authUser = useAuthStore((state) => state.user);
  const authPermissions = useAuthStore((state) => state.permissions);
  const { canApproveMerchant: hookCanApprove } = usePermission();

  const canApproveMerchant = useMemo(() => {
    return (
      canApproveMerchantOnboarding(authRole, authUser, authPermissions || []) ||
      isBankOwner(authRole, authUser) ||
      hookCanApprove
    );
  }, [authRole, authUser, authPermissions, hookCanApprove]);

  const fetchMerchant = useCallback(async () => {
    if (!id) return;
    try {
      const response = await merchantService.getById(id);
      if (response && (response.success || response.data)) {
        setMerchant(response.data || response);
      } else {
        toast.error("Failed to load merchant details.");
      }
    } catch (error) {
      console.error("Fetch merchant details failed", error);
      toast.error("Error loading merchant details.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMerchant();
  }, [fetchMerchant]);

  const handleRestoreMerchant = async () => {
    const merchantId = merchant?.id || merchant?._id || merchant?.merchantId || id;
    setActionLoading(true);
    try {
      const res = await merchantService.restore(merchantId);
      toast.success(res?.message || "Merchant account restored successfully.");
      setIsRestoreModalOpen(false);
      fetchMerchant();
    } catch (error) {
      console.error("Restore failed:", error);
      toast.error(error.response?.data?.message || "Failed to restore merchant.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveMerchant = async () => {
    const merchantId = merchant?.id || merchant?._id || merchant?.merchantId || id;
    setActionLoading(true);
    try {
      const res = await merchantService.approve(merchantId);
      toast.success(res?.message || "Merchant has been approved successfully. Merchant can now login.");
      setIsApproveModalOpen(false);
      fetchMerchant();
    } catch (error) {
      console.error("Approve failed:", error);
      toast.error(error.response?.data?.message || "Failed to approve merchant onboarding.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectMerchant = async () => {
    if (!rejectionReason.trim()) {
      setRejectReasonError("Please provide a reason for rejecting this merchant onboarding.");
      return;
    }
    const merchantId = merchant?.id || merchant?._id || merchant?.merchantId || id;
    setActionLoading(true);
    try {
      const res = await merchantService.reject(merchantId, rejectionReason.trim());
      toast.success(res?.message || "Merchant onboarding has been rejected.");
      setIsRejectModalOpen(false);
      setRejectionReason('');
      setRejectReasonError('');
      fetchMerchant();
    } catch (error) {
      console.error("Reject failed:", error);
      toast.error(error.response?.data?.message || "Failed to reject merchant onboarding.");
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full pb-10">
        <PageHeader
          title="View Merchant"
          breadcrumbs={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Partner Management' },
            { label: 'Merchants', to: '/merchant' },
            { label: 'View Merchant' }
          ]}
          showBack={true}
          backUrl="/merchant"
        />
        <SkeletonDetailView />
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="p-10 text-center text-gray-500 flex flex-col items-center bg-white rounded-2xl border border-gray-100 my-6">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
          <Store size={24} />
        </div>
        <p className="mb-4 text-sm font-semibold text-gray-700">Merchant details could not be found.</p>
        <Link to="/merchant" className="px-5 py-2.5 bg-[#225091] text-white rounded-xl text-xs font-bold hover:bg-[#183f72] shadow-sm transition-colors">
          Back to Merchants
        </Link>
      </div>
    );
  }

  const merchantId = merchant.id || merchant._id || merchant.merchantId;
  const isDeleted = Boolean(
    merchant.isDeleted === true ||
    merchant.deleted === true ||
    merchant.deletedAt ||
    (typeof merchant.status === 'string' && (merchant.status.toUpperCase() === 'DELETED' || merchant.status.toUpperCase() === 'DEACTIVATED'))
  );
  const statusStr = (merchant.status || (isDeleted ? 'DELETED' : 'ACTIVE')).toUpperCase();
  const approvalStatusUpper = (
    merchant.approvalStatus || 
    (merchant.rejectionReason ? 'REJECTED' : (merchant.isApproved === true ? 'APPROVED' : 'PENDING'))
  ).toUpperCase();

  const formattedDate = merchant.createdAt 
    ? new Date(merchant.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      {/* Page Header */}
      <PageHeader
        title="View Merchant"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Partner Management' },
          { label: 'Merchants', to: '/merchant' },
          { label: merchant.shopName || 'Merchant Details' }
        ]}
        showBack={true}
        backUrl="/merchant"
      />

      {/* Main Merchant Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
        {/* Profile Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#225091] to-[#3068b5] text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0 border border-blue-400/20">
              <Store size={30} />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 break-words leading-tight" title={merchant.shopName}>
                  {merchant.shopName || 'Unnamed Merchant'}
                </h1>
                
                {/* Approval Badge */}
                {approvalStatusUpper === 'APPROVED' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={13} /> Approved
                  </span>
                ) : approvalStatusUpper === 'REJECTED' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <XCircle size={13} /> Rejected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <Clock size={13} /> Pending Approval
                  </span>
                )}

                {/* Account Status Badge */}
                {isDeleted ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    Deleted
                  </span>
                ) : statusStr === 'ACTIVE' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Account
                  </span>
                ) : statusStr === 'BLOCKED' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Blocked
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                    Inactive
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 mt-1.5 flex-wrap text-xs text-gray-500">
                <span>Owner: <strong className="text-gray-800 font-semibold">{merchant.ownerName || merchant.shopOwnerName || '—'}</strong></span>
                {merchant.branchName || merchant.branch?.name ? (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>Branch: <strong className="text-gray-800 font-semibold">{merchant.branchName || merchant.branch?.name}</strong></span>
                  </>
                ) : null}
                {formattedDate && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>Registered: <strong className="text-gray-700 font-medium">{formattedDate}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Link 
              to="/merchant" 
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors shadow-2xs text-xs"
            >
              Back to List
            </Link>

            {/* Quick Approve / Reject in Header for Managers/Owners */}
            {canApproveMerchant && !isDeleted && (
              <>
                {approvalStatusUpper !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => setIsApproveModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 size={15} /> {approvalStatusUpper === 'REJECTED' ? 'Re-Approve' : 'Approve Onboarding'}
                  </button>
                )}
                {approvalStatusUpper !== 'REJECTED' && (
                  <button
                    type="button"
                    onClick={() => {
                      setRejectionReason('');
                      setRejectReasonError('');
                      setIsRejectModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle size={15} /> Reject
                  </button>
                )}
              </>
            )}

            {!isDeleted ? (
              <Link 
                to={`/merchant/${merchantId}/edit`} 
                className="px-4 py-2.5 rounded-xl bg-[#225091] hover:bg-[#183f72] text-white font-semibold transition-colors shadow-xs text-xs flex items-center gap-2"
              >
                Edit Merchant
              </Link>
            ) : (
              <button 
                onClick={() => setIsRestoreModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-xs text-xs cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                Restore Account
              </button>
            )}
          </div>
        </div>

        {/* Prominent Onboarding Approval Status Alert Banner */}
        {approvalStatusUpper === 'PENDING' ? (
          <div className="rounded-2xl p-4 md:p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border border-amber-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-700 border border-amber-300/40 shrink-0">
                <Clock size={22} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-amber-900">Onboarding Pending Approval</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300/60 uppercase">
                    Under Review
                  </span>
                </div>
                <p className="text-xs text-amber-800/90 mt-0.5 max-w-2xl leading-relaxed">
                  This merchant lead was submitted by the Loan Executive. Please review the business documents, KYC proofs, and GST credentials below before deciding on onboarding.
                </p>
              </div>
            </div>

            {canApproveMerchant && !isDeleted && (
              <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setIsApproveModalOpen(true)}
                  className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={15} /> Approve Onboarding
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejectionReason('');
                    setRejectReasonError('');
                    setIsRejectModalOpen(true);
                  }}
                  className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <XCircle size={15} /> Reject
                </button>
              </div>
            )}
          </div>
        ) : approvalStatusUpper === 'REJECTED' ? (
          <div className="rounded-2xl p-4 md:p-5 bg-rose-50/80 border border-rose-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 border border-rose-200 shrink-0">
                <XCircle size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-rose-900">Merchant Onboarding Rejected</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300/60 uppercase">
                    Rejected
                  </span>
                </div>
                <p className="text-xs text-rose-800 mt-1 max-w-2xl leading-relaxed">
                  <strong>Rejection Reason:</strong> {merchant.rejectionReason || 'Incomplete documentation or business verification failure.'}
                </p>
                {merchant.rejectedAt && (
                  <p className="text-[11px] text-rose-700/80 mt-1">
                    Rejected on: {new Date(merchant.rejectedAt).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            </div>

            {canApproveMerchant && !isDeleted && (
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <CheckCircle2 size={15} /> Re-Approve
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-2xl p-3.5 px-4 bg-emerald-50/70 border border-emerald-200/80 shadow-2xs flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-900">Approved Merchant Partner</span>
                <span className="text-[11px] text-emerald-700 ml-2">
                  Account login enabled & verified
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {merchant.approvedAt && (
                <span className="text-[11px] text-emerald-800 font-medium">
                  Approved on: {new Date(merchant.approvedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              )}
              {canApproveMerchant && !isDeleted && (
                <button
                  type="button"
                  onClick={() => {
                    setRejectionReason('');
                    setRejectReasonError('');
                    setIsRejectModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                  title="Reject / Revoke Onboarding"
                >
                  <XCircle size={14} /> Reject
                </button>
              )}
            </div>
          </div>
        )}

        {/* Section 1: Business & Contact Information */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-4 bg-[#225091] rounded-full"></div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Business & Contact Information</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <InfoFieldCard 
              icon={Store} 
              label="Shop Name" 
              value={merchant.shopName} 
            />
            <InfoFieldCard 
              icon={User} 
              label="Shop Owner Name" 
              value={merchant.ownerName || merchant.shopOwnerName} 
            />
            <InfoFieldCard 
              icon={Mail} 
              label="Email Address" 
              value={merchant.email} 
              copyable={true}
            />
            <InfoFieldCard 
              icon={Phone} 
              label="Phone Number" 
              value={merchant.phoneNumber || merchant.phone} 
              copyable={true}
            />
            <InfoFieldCard 
              icon={Building2} 
              label="Associated Branch" 
              value={merchant.branchName || merchant.branch?.name || (merchant.branchId ? `Branch ID: ${merchant.branchId}` : '—')} 
            />
            <InfoFieldCard 
              icon={ShieldCheck} 
              label="Account Status" 
              value={statusStr} 
            />
            <InfoFieldCard 
              icon={Calendar} 
              label="Registration Date" 
              value={formattedDate || '—'} 
            />
            <InfoFieldCard 
              icon={Hash} 
              label="Merchant ID" 
              value={merchantId ? String(merchantId) : '—'} 
              isMonospace={true}
              copyable={true}
            />
          </div>
        </div>

        {/* Section 2: Legal & Tax Verification (KYC) */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-4 bg-[#225091] rounded-full"></div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Tax & Identity Details (KYC)</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoFieldCard 
              icon={FileText} 
              label="GSTIN Number" 
              value={merchant.gstinNumber || merchant.gstin} 
              isMonospace={true}
              copyable={true}
            />
            <InfoFieldCard 
              icon={CreditCard} 
              label="Owner PAN Number" 
              value={merchant.panNumber || merchant.ownerPanNumber} 
              isMonospace={true}
              copyable={true}
            />
            <InfoFieldCard 
              icon={ShieldCheck} 
              label="Owner Aadhaar Number" 
              value={merchant.aadhaarNumber || merchant.ownerAadharNumber} 
              isMonospace={true}
              copyable={true}
            />
          </div>
        </div>

        {/* Section 3: Location / Address (if available) */}
        {(merchant.address || merchant.city || merchant.state || merchant.pincode) && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-4 bg-[#225091] rounded-full"></div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Store Location & Address</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoFieldCard 
                icon={MapPin} 
                label="Address" 
                value={merchant.address || merchant.streetAddress} 
              />
              <InfoFieldCard 
                icon={MapPin} 
                label="City" 
                value={merchant.city} 
              />
              <InfoFieldCard 
                icon={MapPin} 
                label="State" 
                value={merchant.state} 
              />
              <InfoFieldCard 
                icon={MapPin} 
                label="Pincode" 
                value={merchant.pincode} 
                isMonospace={true}
                copyable={true}
              />
            </div>
          </div>
        )}

        {/* Section 4: Uploaded KYC Documents */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-4 bg-[#225091] rounded-full"></div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Uploaded Documents</h2>
            </div>
            <span className="text-xs text-gray-400 font-medium">Click Preview to inspect file</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DocumentCard 
              label="Owner Aadhaar" 
              icon={ShieldCheck}
              documentData={merchant.documents?.ownerAadhaar || merchant.ownerAadhaar} 
              onPreview={setPreviewDocument}
            />
            <DocumentCard 
              label="Owner PAN" 
              icon={CreditCard}
              documentData={merchant.documents?.ownerPan || merchant.ownerPan} 
              onPreview={setPreviewDocument}
            />
            <DocumentCard 
              label="Shop Registration Certificate" 
              icon={Store}
              documentData={merchant.documents?.shopRegistrationCertificate || merchant.shopRegistrationCertificate} 
              onPreview={setPreviewDocument}
            />
            <DocumentCard 
              label="GST Certificate" 
              icon={FileText}
              documentData={merchant.documents?.gstCertificate || merchant.gstCertificate} 
              onPreview={setPreviewDocument}
            />
          </div>
        </div>
      </div>

      {/* In-Page Document Preview Lightbox Modal */}
      {previewDocument && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewDocument(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
              <div className="min-w-0 flex-1 pr-4">
                <h3 className="text-sm font-bold text-gray-900 truncate">{previewDocument.title}</h3>
                <p className="text-xs text-gray-500 truncate">{previewDocument.fileName}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewDocument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="p-2 text-gray-600 hover:text-[#225091] hover:bg-white rounded-xl border border-gray-200 transition-colors"
                  title="Open in new window"
                >
                  <ExternalLink size={16} />
                </a>
                <button 
                  onClick={() => setPreviewDocument(null)}
                  className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Close preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-900/5 min-h-[350px]">
              {previewDocument.url.match(/\.(jpeg|jpg|png|webp|gif|svg)$/i) ? (
                <img 
                  src={previewDocument.url} 
                  alt={previewDocument.title} 
                  className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-sm"
                />
              ) : (
                <iframe 
                  src={previewDocument.url} 
                  className="w-full h-[75vh] bg-white rounded-lg border border-gray-200" 
                  title={previewDocument.title} 
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <FileCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Restore Merchant Account</h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Restore <span className="font-bold text-gray-900">{merchant.shopName || 'this merchant'}</span>? This will re-activate their merchant partner credentials and mark their status as <span className="text-emerald-600 font-bold">ACTIVE</span>.
            </p>
            <div className="flex gap-3">
              <button 
                disabled={actionLoading}
                onClick={() => setIsRestoreModalOpen(false)} 
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                disabled={actionLoading}
                onClick={handleRestoreMerchant} 
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {actionLoading ? <Loader2 size={15} className="animate-spin" /> : null}
                {actionLoading ? 'Restoring...' : 'Confirm Restore'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Approve Merchant Onboarding</h3>
            <p className="text-xs text-gray-600 mb-5 leading-relaxed">
              Are you sure you want to approve onboarding for <strong className="text-gray-900 font-bold">{merchant.shopName || 'this merchant'}</strong>?
            </p>
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3.5 mb-6 text-left text-xs text-emerald-900 space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 size={14} className="shrink-0" />
                This action will:
              </p>
              <ul className="list-disc list-inside text-[11px] text-emerald-700 space-y-0.5 ml-1">
                <li>Update approval status to <strong>APPROVED</strong></li>
                <li>Set account profile status to <strong>ACTIVE</strong></li>
                <li>Enable linked user account so the merchant can log in</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button 
                disabled={actionLoading}
                onClick={() => setIsApproveModalOpen(false)} 
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                disabled={actionLoading}
                onClick={handleApproveMerchant} 
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {actionLoading ? <Loader2 size={15} className="animate-spin" /> : null}
                {actionLoading ? 'Approving...' : 'Confirm & Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <XCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Reject Merchant Onboarding</h3>
                <p className="text-xs text-gray-500 truncate max-w-[280px]">
                  {merchant.shopName || 'Merchant Partner'}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Rejecting this onboarding lead will mark the profile as <strong>INACTIVE</strong> and record the rejection reason.
            </p>

            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Rejection Reason <span className="text-rose-500">*</span></span>
                <span className="text-[11px] text-gray-400 font-normal">{rejectionReason.length} chars</span>
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (rejectReasonError) setRejectReasonError('');
                }}
                placeholder="e.g. Incomplete GST and business proof verification."
                className={`w-full p-3 rounded-xl border text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${
                  rejectReasonError 
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20' 
                    : 'border-gray-200 focus:ring-[#225091]/20 focus:border-[#225091] bg-gray-50/50 focus:bg-white'
                }`}
              />
              {rejectReasonError && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {rejectReasonError}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                disabled={actionLoading}
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectionReason('');
                  setRejectReasonError('');
                }} 
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                disabled={actionLoading}
                onClick={handleRejectMerchant} 
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {actionLoading ? <Loader2 size={15} className="animate-spin" /> : null}
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewMerchant;
