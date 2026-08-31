import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, FileText, Download, Store, Building2, User, Phone, Mail, FileCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import { SkeletonDetailView } from '../../components/common/Skeleton';
import { merchantService } from '../../api/merchantService';

const ViewField = ({ label, value }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
    <div className="text-[14px] font-semibold text-gray-900">{value || '—'}</div>
  </div>
);

const DocumentViewField = ({ label, documentData }) => {
  const fileUrl = typeof documentData === 'string' ? documentData : (documentData?.url || documentData?.fileUrl);
  const fileName = documentData?.filename || documentData?.name || (typeof documentData === 'string' ? documentData.split('/').pop() : 'Document');

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      {fileUrl ? (
        <a 
          href={fileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3.5 border border-gray-200 rounded-xl bg-gray-50/70 group hover:bg-white hover:border-[#225091]/30 hover:shadow-xs transition-all"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-blue-50 text-[#225091] rounded-lg shrink-0 border border-blue-100">
              <FileText size={18} />
            </div>
            <span className="text-xs font-semibold text-gray-700 truncate max-w-[150px]">{fileName}</span>
          </div>
          <button className="text-[#225091] hover:bg-blue-50 p-1.5 rounded-lg transition-colors" title="Download/View">
            <Download size={16} />
          </button>
        </a>
      ) : (
        <div className="flex items-center justify-center p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-gray-400 text-xs font-medium">
          No document uploaded
        </div>
      )}
    </div>
  );
};

const ViewMerchant = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [merchant, setMerchant] = useState(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMerchant = async () => {
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
  };

  useEffect(() => {
    if (id) {
      fetchMerchant();
    }
  }, [id]);

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
        <p className="mb-4 text-sm font-semibold">Merchant not found.</p>
        <Link to="/merchant" className="px-5 py-2 bg-[#225091] text-white rounded-xl text-xs font-bold hover:bg-[#183f72]">
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

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Header Card */}
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
        {/* Profile Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#225091] border border-blue-100 flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
              <Store size={26} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">{merchant.shopName || 'Merchant Shop'}</h1>
                {isDeleted ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    Deleted
                  </span>
                ) : statusStr === 'ACTIVE' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                ) : statusStr === 'BLOCKED' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                    Blocked
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Owner: <span className="font-semibold text-gray-700">{merchant.ownerName || merchant.shopOwnerName || '—'}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/merchant" 
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors shadow-2xs text-xs"
            >
              Back to List
            </Link>
            {!isDeleted ? (
              <Link 
                to={`/merchant/${merchantId}/edit`} 
                className="px-4 py-2 rounded-xl bg-[#225091] text-white font-bold hover:bg-[#183f72] transition-colors shadow-2xs text-xs"
              >
                Edit Merchant
              </Link>
            ) : (
              <button 
                onClick={() => setIsRestoreModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-2xs text-xs cursor-pointer"
              >
                Restore Account
              </button>
            )}
          </div>
        </div>

        {/* General Info */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">General Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
            <ViewField label="Shop Name" value={merchant.shopName} />
            <ViewField label="Owner Name" value={merchant.ownerName || merchant.shopOwnerName} />
            <ViewField label="Email Address" value={merchant.email} />
            <ViewField label="Phone Number" value={merchant.phoneNumber || merchant.phone} />
            <ViewField label="Branch Name" value={merchant.branchName || merchant.branch?.name} />
            <ViewField label="GSTIN Number" value={merchant.gstinNumber || merchant.gstin} />
            <ViewField label="Owner PAN Number" value={merchant.panNumber || merchant.ownerPanNumber} />
            <ViewField label="Owner Aadhaar Number" value={merchant.aadhaarNumber || merchant.ownerAadharNumber} />
          </div>
        </div>

        {/* Uploaded Documents */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Uploaded Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DocumentViewField label="Owner Aadhaar" documentData={merchant.documents?.ownerAadhaar || merchant.ownerAadhaar} />
            <DocumentViewField label="Owner PAN" documentData={merchant.documents?.ownerPan || merchant.ownerPan} />
            <DocumentViewField label="Shop Registration" documentData={merchant.documents?.shopRegistrationCertificate || merchant.shopRegistrationCertificate} />
            <DocumentViewField label="GST Certificate" documentData={merchant.documents?.gstCertificate || merchant.gstCertificate} />
          </div>
        </div>
      </div>

      {/* Restore Confirmation Modal in ViewMerchant */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <FileCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Restore Merchant Account</h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Restore <span className="font-bold text-gray-900">{merchant.shopName || 'this merchant'}</span>? This will re-activate their login credentials and mark their status as <span className="text-emerald-600 font-bold">ACTIVE</span>.
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
                {actionLoading ? 'Restoring...' : 'Confirm Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewMerchant;
