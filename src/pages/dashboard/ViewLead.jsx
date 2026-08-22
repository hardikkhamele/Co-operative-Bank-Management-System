import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { 
  ChevronRight, Download, Loader2, ArrowRight, ExternalLink, 
  Eye, X, Landmark, FileText, CheckCircle2, AlertCircle, ArrowLeft
} from 'lucide-react';
import { toast } from 'react-toastify';
import { leadService } from '../../api/leadService';
import { productService } from '../../api/productService';

const ViewLead = () => {
  const location = useLocation();
  const { id } = useParams();
  const [lead, setLead] = useState(location.state?.lead || location.state || null);
  const [loading, setLoading] = useState(!location.state && !!id);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchLead = async () => {
        try {
          setLoading(true);
          const res = await leadService.getById(id);
          if (res && res.success && res.data) {
            setLead(res.data);
          }
        } catch (err) {
          console.error('Failed to load lead details:', err);
          if (err.response?.status === 403) {
            toast.error('Permission denied: Your role cannot view this lead details.');
          } else {
            toast.error(err.response?.data?.message || 'Failed to load lead details.');
          }
        } finally {
          setLoading(false);
        }
      };
      fetchLead();
    }
  }, [id]);

  // Extract structured sections from API response
  const personalInfo = lead?.personalInformation || {};
  const documents = lead?.documents || {};
  const bankInfo = lead?.bankInformation || lead?.bankDetails || lead?.repaymentBank || lead?.bank || null;
  const loanInfo = lead?.loanInformation || {};

  // Normalize customer & personal information
  const customerName = personalInfo.fullName || lead?.customerName || lead?.customer?.fullName || lead?.name || lead?.fullName || '—';
  const phoneNumber = personalInfo.phoneNumber || lead?.phoneNumber || lead?.customer?.phoneNumber || lead?.phone || '—';
  const applicationId = lead?.applicationNumber || lead?.applicationId || lead?.appId || (id ? `ADVT-${id.slice(-4).toUpperCase()}` : '—');
  const status = (lead?.status || 'NEW').toUpperCase();

  // Format Date of Birth (handles ISO string "2002-08-05T00:00:00.000Z")
  const formatDob = (rawDob) => {
    if (!rawDob) return '—';
    try {
      const d = new Date(rawDob);
      if (!isNaN(d.getTime())) {
        const day = String(d.getUTCDate()).padStart(2, '0');
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const year = d.getUTCFullYear();
        return `${day}-${month}-${year}`;
      }
    } catch (e) {}
    return rawDob;
  };

  const dob = formatDob(personalInfo.dob || lead?.dob || lead?.dateOfBirth);
  const gender = personalInfo.gender || lead?.gender || '—';
  const pan = personalInfo.panNumber || lead?.panNumber || lead?.pan || '—';
  const rawAadhaar = personalInfo.aadhaarNumber || lead?.aadhaarNumber || lead?.aadhaar || '—';
  const aadhaar = rawAadhaar !== '—' && rawAadhaar.length === 12 
    ? `${rawAadhaar.slice(0, 4)} ${rawAadhaar.slice(4, 8)} ${rawAadhaar.slice(8, 12)}` 
    : rawAadhaar;
  const address = personalInfo.address || lead?.address || '—';
  const avatar = lead?.profileImage || lead?.avatar || '';

  // Documents
  const panCardUrl = documents.panCardUrl || lead?.panCardUrl || '';
  const aadhaarCardUrl = documents.aadhaarCardUrl || lead?.aadhaarCardUrl || '';
  const digitalSignatureUrl = documents.digitalSignatureUrl || lead?.digitalSignatureUrl || '';

  // Product & Loan Details
  const productName = loanInfo.productName || lead?.productName || lead?.loanAppliedFor || 'iPhone 17';
  const variantName = loanInfo.variantName || lead?.productDetails || lead?.phoneDetails || 'Teal - 256 GB ROM';
  const productPrice = loanInfo.productPrice || lead?.productPrice || 0;
  const tenureMonths = loanInfo.tenureMonths || lead?.tenureMonths || 6;
  const emiAmount = loanInfo.emiAmount || lead?.emiAmount || 0;
  const totalAmount = loanInfo.totalAmount || lead?.totalAmount || productPrice;
  const totalPayableAmount = loanInfo.totalPayableAmount || lead?.totalPayableAmount || totalAmount;
  const outstandingAmount = loanInfo.outstandingAmount || lead?.outstandingAmount || totalPayableAmount;
  const emiSchedule = loanInfo.schedule || lead?.schedule || [];

  const appliedOn = lead?.appliedOn || (lead?.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '10 Jan 2026');
  const disbursedOn = lead?.disbursedOn ? new Date(lead.disbursedOn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '10 Jan 2026';

  const isNewLead = status === 'NEW' || status === 'PENDING_DOWN_PAYMENT';
  const isActiveOrCompleted = status === 'ACTIVE' || status === 'COMPLETED';
  const isRejected = status === 'REJECTED';

  const getStatusBadge = (s) => {
    switch (s) {
      case 'NEW':
        return <div className="px-6 py-1.5 rounded bg-gray-100 border border-gray-300 text-gray-700 font-semibold text-[13px]">New</div>;
      case 'PENDING_DOWN_PAYMENT':
        return <div className="px-6 py-1.5 rounded bg-amber-50 border border-amber-300 text-amber-600 font-semibold text-[13px]">Pending Down Payment</div>;
      case 'ACTIVE':
        return <div className="px-6 py-1.5 rounded bg-indigo-50 border border-indigo-200 text-[#225091] font-semibold text-[13px]">Active</div>;
      case 'COMPLETED':
        return <div className="px-6 py-1.5 rounded bg-green-50 border border-green-400 text-[#00c950] font-semibold text-[13px]">Completed</div>;
      case 'REJECTED':
        return <div className="px-6 py-1.5 rounded bg-red-50 border border-red-400 text-[#ff4c4c] font-semibold text-[13px]">Rejected</div>;
      default:
        return <div className="px-6 py-1.5 rounded bg-gray-100 border border-gray-200 text-gray-600 font-semibold text-[13px]">{s}</div>;
    }
  };

  const getInitials = (n) => {
    if (!n || n === '—') return 'LD';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 size={36} className="animate-spin text-[#225091] mb-3" />
        <p className="text-gray-500 font-medium">Loading lead details...</p>
      </div>
    );
  }

  const targetLoanId = id || lead?.id || '';

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      
      {/* Breadcrumb Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0 relative">
        <div className="flex items-center gap-3 mb-3">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
            type="button"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-[22px] font-bold text-[#225091] m-0">Lead Details</h1>
        </div>
        <div className="flex items-center text-sm font-medium text-gray-500 pl-[40px]">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1.5 text-gray-400" />
          <span className="hover:text-gray-800 transition-colors">CRM Management</span>
          <ChevronRight size={16} className="mx-1.5 text-gray-400" />
          <Link to="/leads" className="hover:text-gray-800 transition-colors">Leads</Link>
          <ChevronRight size={16} className="mx-1.5 text-gray-400" />
          <span className="text-[#225091]">Lead Details</span>
        </div>
      </div>

      {/* App Number & Action Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 min-h-[44px]">
        <div className="text-[15px] font-medium text-gray-700">
          Application Number: <span className="text-[#225091] ml-1 font-bold">{applicationId}</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Setup Loan button shown for NEW or PENDING_DOWN_PAYMENT */}
          {isNewLead && (
            <Link 
              to={targetLoanId ? `/leads/setup-loan/${targetLoanId}` : `/leads/setup-loan`} 
              state={{ 
                lead: { 
                  id: targetLoanId, 
                  customerName, 
                  phoneNumber, 
                  applicationId, 
                  status, 
                  productPrice,
                  productName,
                  variantName,
                  personalInformation: personalInfo,
                  documents,
                  bankInformation: bankInfo,
                  loanInformation: loanInfo
                } 
              }}
              className="bg-[#225091] hover:bg-[#159a9f] text-white px-6 py-2.5 rounded-full font-bold transition-all text-[13px] shadow-sm flex items-center gap-2"
            >
              <span>Setup Loan</span>
              <ArrowRight size={16} />
            </Link>
          )}

          {/* Action buttons for ACTIVE or COMPLETED */}
          {isActiveOrCompleted && (
            <>
              <button className="flex items-center gap-2 bg-[#225091] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-semibold transition-colors text-[13px] shadow-sm">
                <Download size={16} />
                Loan Agreement
              </button>
              <button className="flex items-center gap-2 bg-[#225091] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-semibold transition-colors text-[13px] shadow-sm">
                <Download size={16} />
                Account Form
              </button>
              <button className="flex items-center gap-2 bg-[#225091] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-semibold transition-colors text-[13px] shadow-sm">
                <Download size={16} />
                Membership Form
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between items-center">
        <div className="flex items-center gap-5">
          {avatar ? (
            <img 
              src={avatar} 
              alt={customerName} 
              className="w-16 h-16 rounded-full object-cover shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#f4f2ff] flex items-center justify-center text-xl font-bold text-[#225091]">
              {getInitials(customerName)}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-[#225091]">{customerName}</h2>
            <p className="text-gray-500 font-medium mt-1 text-[15px]">{phoneNumber}</p>
          </div>
        </div>
        {getStatusBadge(status)}
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#f4f3fb] px-6 py-4 border-b border-gray-100">
          <h2 className="text-[17px] font-bold text-[#225091]">Personal Information</h2>
        </div>
        <div className="p-6 flex flex-col gap-4 text-[14px]">
          <div className="flex">
            <span className="text-gray-500 w-40 font-medium">Date Of Birth:</span>
            <span className="text-gray-800 font-semibold">{dob}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-40 font-medium">Gender:</span>
            <span className="text-gray-800 font-semibold capitalize">{gender}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-40 font-medium">PAN Number:</span>
            <span className="text-gray-800 font-semibold uppercase">{pan}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-40 font-medium">Aadhaar Number:</span>
            <span className="text-gray-800 font-semibold">{aadhaar}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-40 font-medium">Address:</span>
            <span className="text-gray-800 font-semibold">{address}</span>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#f4f3fb] px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-[17px] font-bold text-[#225091]">Documents</h2>
          <span className="text-xs text-gray-400 font-medium">Customer KYC Documents</span>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* PAN Card Preview */}
          <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 min-h-[220px] flex flex-col">
            <div className="p-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center text-xs font-semibold text-gray-700">
              <span>PAN Card Document</span>
              {panCardUrl && (
                <button 
                  onClick={() => setPreviewImage({ url: panCardUrl, title: 'PAN Card' })}
                  className="flex items-center gap-1 text-[#225091] hover:underline"
                >
                  <Eye size={14} /> Full View
                </button>
              )}
            </div>
            
            <div className="flex-1 p-3 flex items-center justify-center">
              {panCardUrl ? (
                <div 
                  onClick={() => setPreviewImage({ url: panCardUrl, title: 'PAN Card' })}
                  className="w-full h-48 rounded-lg overflow-hidden cursor-pointer relative group bg-white border border-gray-200 flex items-center justify-center p-2"
                >
                  <img 
                    src={panCardUrl} 
                    alt="PAN Card" 
                    className="w-full h-full object-contain transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-xs gap-1">
                    <Eye size={16} /> Click to expand
                  </div>
                </div>
              ) : (
                /* Visual PAN Card Mockup */
                <div className="w-full h-48 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex flex-col p-4 relative border-t-8 border-t-white shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-[11px] font-bold text-red-700">आयकर विभाग</h3>
                      <h3 className="text-[9px] font-bold text-blue-900">INCOME TAX DEPARTMENT</h3>
                    </div>
                    <div className="text-right">
                      <h3 className="text-[11px] font-bold text-red-700">भारत सरकार</h3>
                      <h3 className="text-[9px] font-bold text-blue-900">GOVT. OF INDIA</h3>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <p className="text-[11px] font-bold text-gray-800 uppercase">{customerName !== '—' ? customerName : 'NAME'}</p>
                    <p className="text-[11px] font-bold text-gray-800 uppercase mt-2 tracking-wider">{pan !== '—' ? pan : 'PAN NUMBER'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Aadhaar Card Preview */}
          <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 min-h-[220px] flex flex-col">
            <div className="p-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center text-xs font-semibold text-gray-700">
              <span>Aadhaar Card Document</span>
              {aadhaarCardUrl && (
                <button 
                  onClick={() => setPreviewImage({ url: aadhaarCardUrl, title: 'Aadhaar Card' })}
                  className="flex items-center gap-1 text-[#225091] hover:underline"
                >
                  <Eye size={14} /> Full View
                </button>
              )}
            </div>

            <div className="flex-1 p-3 flex items-center justify-center">
              {aadhaarCardUrl ? (
                <div 
                  onClick={() => setPreviewImage({ url: aadhaarCardUrl, title: 'Aadhaar Card' })}
                  className="w-full h-48 rounded-lg overflow-hidden cursor-pointer relative group bg-white border border-gray-200 flex items-center justify-center p-2"
                >
                  <img 
                    src={aadhaarCardUrl} 
                    alt="Aadhaar Card" 
                    className="w-full h-full object-contain transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-xs gap-1">
                    <Eye size={16} /> Click to expand
                  </div>
                </div>
              ) : (
                /* Visual Aadhaar Mockup */
                <div className="w-full h-48 bg-white flex flex-col relative p-4 border border-green-500/20 rounded-lg shadow-xs">
                  <div className="flex justify-center border-b-2 border-orange-500/50 pb-1 mb-3">
                    <h3 className="text-[11px] font-bold text-green-700">Government of India</h3>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <div className="w-16 h-20 bg-gray-200 flex flex-col items-center justify-end pb-2 rounded">
                      <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 space-y-2.5 mt-1">
                      <div className="h-2.5 w-28 bg-gray-300 rounded"></div>
                      <div className="h-2.5 w-36 bg-gray-300 rounded"></div>
                      <div className="h-2.5 w-24 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                  <div className="mt-auto text-center font-bold text-xs tracking-widest text-gray-700">
                    {aadhaar !== '—' ? aadhaar : 'XXXX XXXX XXXX'}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Digital Signature Preview if available */}
        {digitalSignatureUrl && (
          <div className="px-6 pb-6">
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="text-[#225091]" size={24} />
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Digital Signature</h4>
                  <p className="text-xs text-gray-500">Customer signature on file</p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewImage({ url: digitalSignatureUrl, title: 'Digital Signature' })}
                className="px-4 py-1.5 rounded-full border border-[#225091] text-[#225091] hover:bg-teal-50 text-xs font-semibold"
              >
                View Signature
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bank Information (if available) */}
      {bankInfo && (bankInfo.bankName || bankInfo.accountNumber || bankInfo.ifsc || bankInfo.ifscCode) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#f4f3fb] px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Landmark size={18} className="text-[#225091]" />
            <h2 className="text-[17px] font-bold text-[#225091]">Bank Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-[14px]">
            <div className="flex">
              <span className="text-gray-500 w-40 font-medium">Bank Name:</span>
              <span className="text-gray-800 font-semibold">{bankInfo.bankName || bankInfo.bank_name || '—'}</span>
            </div>
            <div className="flex">
              <span className="text-gray-500 w-40 font-medium">Account Number:</span>
              <span className="text-gray-800 font-semibold">{bankInfo.accountNumber || bankInfo.account_number || bankInfo.accNumber || '—'}</span>
            </div>
            <div className="flex">
              <span className="text-gray-500 w-40 font-medium">IFSC Code:</span>
              <span className="text-gray-800 font-semibold uppercase">{bankInfo.ifsc || bankInfo.ifscCode || bankInfo.ifsc_code || '—'}</span>
            </div>
            <div className="flex">
              <span className="text-gray-500 w-40 font-medium">Account Holder:</span>
              <span className="text-gray-800 font-semibold">{bankInfo.accountHolder || bankInfo.accountHolderName || bankInfo.holderName || customerName}</span>
            </div>
          </div>
        </div>
      )}

      {/* Active/Completed Lead Specific Information (Loan & EMI) */}
      {isActiveOrCompleted && (
        <>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#f4f3fb] px-6 py-4 border-b border-gray-100">
            <h2 className="text-[17px] font-bold text-[#225091]">Loan Information</h2>
          </div>
          <div className="bg-[#f8f9fb] p-6 text-[14px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
              <div className="w-32 h-32 rounded-xl overflow-hidden border border-gray-200 bg-[#f8f9fb] flex items-center justify-center p-2 shrink-0 shadow-2xs">
                {(() => {
                  const resolvedImg = productService.extractProductOrVariantImage(lead) || productService.extractProductOrVariantImage(loanInfo);
                  return resolvedImg ? (
                    <img 
                      src={resolvedImg}
                      alt={productName}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-2">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#225091] mb-1">
                        <Landmark size={20} />
                      </div>
                      <span className="text-[11px] font-semibold text-gray-500">No Image</span>
                    </div>
                  );
                })()}
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="flex">
                  <span className="text-gray-500 w-36 font-medium">Disbursed On:</span>
                  <span className="text-gray-800 font-semibold">{disbursedOn}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-36 font-medium">Loan Applied For:</span>
                  <span className="text-gray-800 font-bold text-[15px] text-[#225091]">{productName}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-36 font-medium">Variant Details:</span>
                  <span className="text-gray-800 font-semibold">{variantName}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-[380px] mb-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 text-[14px]">Amount Info</h3>
              
              <div className="space-y-2 mb-3 border-b border-gray-100 pb-3 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Product Price:</span>
                  <span className="text-gray-700 font-medium">₹{Number(productPrice).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">EMI Card Charges:</span>
                  <span className="text-gray-700 font-medium">+₹500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Loan Processing Fees:</span>
                  <span className="text-gray-700 font-medium">+₹200</span>
                </div>
              </div>

              <div className="space-y-2 mb-3 border-b border-gray-100 pb-3 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold">Total Amount:</span>
                  <span className="text-gray-800 font-bold">₹{Number(totalAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Outstanding Amount:</span>
                  <span className="text-[#ff4c4c] font-medium">₹{Number(outstandingAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-2 mb-3 border-b border-gray-100 pb-3 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold">Total Payable Amount:</span>
                  <span className="text-gray-800 font-bold">₹{Number(totalPayableAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">EMI Tenure:</span>
                  <span className="text-gray-700 font-medium">{tenureMonths} Months</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[13px]">
                <span className="text-gray-500 font-medium">Monthly EMI:</span>
                <span className="text-gray-800 font-bold">₹{Number(emiAmount || Math.round(totalPayableAmount / (tenureMonths || 1))).toLocaleString('en-IN')}/Month</span>
              </div>
            </div>

            <div className="flex items-center text-[15px]">
              <span className="text-gray-800 font-medium mr-2">Status:</span>
              <span className={`font-semibold ${status === 'ACTIVE' ? 'text-[#225091]' : 'text-green-500'}`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* EMI Schedule Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#f4f3fb] px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-[17px] font-bold text-[#225091]">EMI Schedule</h2>
            <span className="text-xs font-semibold text-gray-600">{tenureMonths} Months Plan</span>
          </div>
          <div className="bg-[#f8f9fb] p-6 text-[14px]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center pb-2">
                <span className="text-gray-500 w-32 font-medium">EMI Tenure:</span>
                <span className="text-gray-800 font-semibold">{tenureMonths} Months (₹{Number(emiAmount || Math.round(totalPayableAmount / (tenureMonths || 1))).toLocaleString('en-IN')}/Month)</span>
              </div>
              
              {emiSchedule.length > 0 ? (
                emiSchedule.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-2.5">
                    <div className="flex">
                      <span className="text-gray-500 w-32 font-medium">{item.month || `Month ${idx + 1}`}:</span>
                      <span className="text-gray-800 font-semibold">₹{Number(item.emiAmount || emiAmount).toLocaleString('en-IN')}</span>
                    </div>
                    <span className={`font-semibold text-xs px-2.5 py-0.5 rounded ${
                      item.status === 'PAID' ? 'bg-green-50 text-green-600' :
                      item.status === 'DUE' ? 'bg-amber-50 text-amber-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {item.status || 'UPCOMING'}
                    </span>
                  </div>
                ))
              ) : (
                /* Default Schedule Breakdown */
                ['March', 'April', 'May', 'June', 'July', 'August'].slice(0, tenureMonths).map((month, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-2.5">
                    <div className="flex">
                      <span className="text-gray-500 w-32 font-medium">{month}:</span>
                      <span className="text-gray-800 font-semibold">₹{Number(emiAmount || Math.round(totalPayableAmount / (tenureMonths || 1))).toLocaleString('en-IN')}</span>
                    </div>
                    {status === 'COMPLETED' || idx < 3 ? (
                      <span className="text-green-500 font-medium text-xs bg-green-50 px-2 py-0.5 rounded">Paid</span>
                    ) : idx === 3 ? (
                      <span className="text-orange-400 font-medium text-xs bg-orange-50 px-2 py-0.5 rounded">Due</span>
                    ) : (
                      <span className="text-gray-400 font-medium text-xs bg-gray-100 px-2 py-0.5 rounded">Upcoming</span>
                    )}
                  </div>
                ))
              )}
            </div>

            {status !== 'COMPLETED' && (
              <div className="flex justify-end mt-8">
                <button className="bg-[#225091] hover:bg-[#159a9f] text-white px-6 py-2.5 rounded-full font-semibold transition-colors text-[14px] shadow-sm">
                  Collect EMI
                </button>
              </div>
            )}
          </div>
        </div>
      </>
      )}

      {/* New / Pending Down Payment Lead Specific Information (Loan Info with Setup Loan Button) */}
      {isNewLead && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#f4f3fb] px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-[17px] font-bold text-[#225091]">Loan Information</h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-[#225091]">
              {status === 'PENDING_DOWN_PAYMENT' ? 'Pending Down Payment' : 'New Application'}
            </span>
          </div>
          <div className="bg-[#f8f9fb] p-6 text-[14px]">
            <div className="flex flex-col gap-3">
              <div className="flex">
                <span className="text-gray-500 w-36 font-medium">Applied On:</span>
                <span className="text-gray-800 font-semibold">{appliedOn}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-36 font-medium">Loan Applied For:</span>
                <span className="text-gray-800 font-semibold">{productName}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-36 font-medium">Variant Details:</span>
                <span className="text-gray-800 font-semibold">{variantName}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-36 font-medium">Product Price:</span>
                <span className="text-gray-800 font-bold">₹{Number(productPrice).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center text-[15px] mt-1">
                <span className="text-gray-800 font-medium mr-2">Status:</span>
                <span className="text-gray-800 font-semibold">
                  {status === 'PENDING_DOWN_PAYMENT' ? 'Pending Down Payment' : 'New'}
                </span>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <Link 
                to={targetLoanId ? `/leads/setup-loan/${targetLoanId}` : `/leads/setup-loan`} 
                state={{ 
                  lead: { 
                    id: targetLoanId, 
                    customerName, 
                    phoneNumber, 
                    applicationId, 
                    status, 
                    productPrice,
                    productName,
                    variantName,
                    personalInformation: personalInfo,
                    documents,
                    bankInformation: bankInfo,
                    loanInformation: loanInfo
                  } 
                }}
                className="inline-flex items-center gap-2 bg-[#225091] hover:bg-[#159a9f] text-white px-8 py-3 rounded-full font-bold transition-all shadow-md text-sm"
              >
                <span>Setup Loan</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Rejected Lead Specific Information (Loan Info Only) */}
      {isRejected && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#f4f3fb] px-6 py-4 border-b border-gray-100">
            <h2 className="text-[17px] font-bold text-[#225091]">Loan Information</h2>
          </div>
          <div className="bg-[#f8f9fb] p-6 text-[14px]">
            <div className="flex flex-col gap-3">
              <div className="flex">
                <span className="text-gray-500 w-36 font-medium">Applied On:</span>
                <span className="text-gray-800 font-semibold">{appliedOn}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-36 font-medium">Loan Applied For:</span>
                <span className="text-gray-800 font-semibold">{productName}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-36 font-medium">Variant Details:</span>
                <span className="text-gray-800 font-semibold">{variantName}</span>
              </div>
              <div className="flex items-center text-[15px] mt-1">
                <span className="text-gray-800 font-medium mr-2">Status:</span>
                <span className="text-[#ff4c4c] font-semibold">Rejected</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox / Full Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative">
            <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">{previewImage.title}</h3>
              <div className="flex items-center gap-2">
                <a 
                  href={previewImage.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-[#225091] hover:underline flex items-center gap-1 font-semibold"
                >
                  <ExternalLink size={14} /> Open in new tab
                </a>
                <button 
                  onClick={() => setPreviewImage(null)}
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-200"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-6 flex-1 flex items-center justify-center bg-gray-900 overflow-auto max-h-[75vh]">
              <img 
                src={previewImage.url} 
                alt={previewImage.title} 
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ViewLead;
