import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft,  ChevronRight, FileText, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import { merchantService } from '../../api/merchantService';

const ViewField = ({ label, value }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-500 mb-1">{label}</label>
    <div className="text-[15px] font-medium text-gray-800">{value || '—'}</div>
  </div>
);

const DocumentViewField = ({ label, documentData }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-semibold text-gray-500">{label}</label>
    {documentData && documentData.url ? (
      <a 
        href={documentData.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50 group hover:bg-white hover:border-[#225091]/30 hover:shadow-sm transition-all"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-[#225091]/10 text-[#225091] rounded-lg shrink-0">
            <FileText size={20} />
          </div>
          <span className="text-[15px] font-medium text-gray-700 truncate">{documentData.filename || 'Document'}</span>
        </div>
        <button className="text-[#225091] hover:bg-[#225091]/10 p-2 rounded-lg transition-colors tooltip-trigger" title="Download/View">
          <Download size={18} />
        </button>
      </a>
    ) : (
      <div className="flex items-center justify-center p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400 text-sm">
        No document uploaded
      </div>
    )}
  </div>
);

const ViewMerchant = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [merchant, setMerchant] = useState(null);

  useEffect(() => {
    const fetchMerchant = async () => {
      try {
        const response = await merchantService.getMerchantDetails(id);
        if (response.success) {
          setMerchant(response.data);
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
    
    if (id) {
      fetchMerchant();
    }
  }, [id]);

  if (isLoading) {
    return <div className="p-10 text-center text-gray-500">Loading merchant details...</div>;
  }

  if (!merchant) {
    return (
      <div className="p-10 text-center text-gray-500 flex flex-col items-center">
        <p className="mb-4">Merchant not found.</p>
        <Link to="/merchant" className="text-[#225091] hover:underline">Back to Merchants</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Header Card */}
      <PageHeader
        title="View Merchant"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Partner Management' },
          { label: 'Merchant', to: '/merchant' },
          { label: 'View Merchant' }
        ]}
        showBack={true}
        backUrl="/merchant"
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* General Info */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
            <h2 className="text-[20px] font-bold text-[#1b2559]">General Information</h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
              merchant.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
              merchant.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
            }`}>
              {merchant.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-8">
            <ViewField label="Shop Name" value={merchant.shopName} />
            <ViewField label="Shop Owner Name" value={merchant.ownerName || merchant.shopOwnerName} />
            <ViewField label="Email" value={merchant.email} />
            <ViewField label="Phone Number" value={merchant.phoneNumber || merchant.phone} />
            <ViewField label="Owner Aadhar Number" value={merchant.aadhaarNumber || merchant.ownerAadharNumber} />
            <ViewField label="Owner PAN Number" value={merchant.panNumber || merchant.ownerPanNumber} />
            <ViewField label="GSTIN Number" value={merchant.gstinNumber || merchant.gstin} />
            <ViewField label="Merchant ID" value={merchant.merchantId || merchant.id} />
          </div>
        </div>

        {/* Documents */}
        <div>
          <h2 className="text-[20px] font-bold text-[#1b2559] mb-6 pb-2 border-b border-gray-100">Uploaded Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DocumentViewField label="Owner Aadhar" documentData={merchant.documents?.ownerAadhaar} />
            <DocumentViewField label="Owner PAN" documentData={merchant.documents?.ownerPan} />
            <DocumentViewField label="Shop Registration Certificate" documentData={merchant.documents?.shopRegistrationCertificate} />
            <DocumentViewField label="GST Certificate" documentData={merchant.documents?.gstCertificate} />
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-gray-100 flex gap-4">
          <Link to="/merchant" className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm text-[15px] inline-flex">
            Back to List
          </Link>
          <Link to={`/merchant/${merchant.id}/edit`} className="px-6 py-2.5 rounded-full bg-[#225091] text-white font-medium hover:bg-[#159499] transition-colors shadow-sm text-[15px] inline-flex">
            Edit Merchant
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewMerchant;
