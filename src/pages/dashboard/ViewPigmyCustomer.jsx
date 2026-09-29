import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  User, Phone, Mail, MapPin, CreditCard, Landmark, FileText,
  ShieldCheck, Calendar, Copy, CheckCheck, ExternalLink, Eye,
  ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, Clock,
  AlertTriangle, Loader2, Plus, Check, X, Store, ArrowLeft,
  Sparkles, Layers, Shield, Printer
} from 'lucide-react';
import { toast } from 'react-toastify';
import pigmyService from '../../api/pigmyService';
import PageHeader from '../../components/common/PageHeader';
import { SkeletonDetailView } from '../../components/common/Skeleton';
import { AddSocietyAccountModal, ApproveCustomerModal, RejectCustomerModal } from './PigmyCustomers';

// Helper for Initials Avatar
const getInitials = (name) => {
  if (!name) return 'CU';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const ViewPigmyCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);

  // Modals
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const fetchCustomer = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await pigmyService.getById(id);
      setCustomer(res?.data || res);
    } catch (err) {
      console.error('Failed to load Pigmy customer details:', err);
      toast.error('Failed to load full Pigmy customer details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleCopy = (text, label) => {
    if (!text || text === '—' || text === 'N.A.') return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(label);
    toast.success(`${label} copied!`, { autoClose: 1500 });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAccountLinked = () => fetchCustomer();
  const handleApproved = () => fetchCustomer();
  const handleRejected = () => fetchCustomer();

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full pb-12">
        <PageHeader
          title="Pigmy Customer Details"
          breadcrumbs={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'CRM Management' },
            { label: 'Pigmy Customers', to: '/pigmy' },
            { label: 'Customer Details' }
          ]}
          showBack={true}
          backUrl="/pigmy"
        />
        <SkeletonDetailView />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-10 text-center text-slate-500 flex flex-col items-center bg-white rounded-2xl border border-slate-200/80 my-6 shadow-xs w-full">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <User size={24} />
        </div>
        <p className="mb-4 text-sm font-semibold text-slate-700">Pigmy Customer details could not be found.</p>
        <Link to="/pigmy" className="px-5 py-2.5 bg-[#225091] text-white rounded-xl text-xs font-bold hover:bg-[#183f72] shadow-xs transition-colors">
          Back to Pigmy Customers
        </Link>
      </div>
    );
  }

  // Fallback safely for nested objects
  const sa = customer.societyAccount || {};
  const ba = customer.bankAccountDetails || {};
  const mandate = customer.mandateDetails || {};
  const scheme = customer.scheme || {};
  const agreements = customer.agreements || {};
  const documents = customer.documents || {};
  const onboardedBy = customer.onboardedBy || {};

  const hasSocietyAccount = Boolean(customer.hasSavingsAccount || customer.existingSavingsAccountNumber || Object.keys(sa).length > 0);
  const displayName = customer.fullName || customer.ownerName || 'Customer Details';
  const displayCode = customer.pigmyCustomerCode || customer.code || 'N.A.';
  const isMerchant = customer.isMerchant === true || customer.customerType === 'MERCHANT';
  
  const isApproved = customer.approvalStatus === 'APPROVED';
  const isRejected = customer.approvalStatus === 'REJECTED';
  const isPending = customer.approvalStatus === 'PENDING_BRANCH_APPROVAL' || customer.approvalStatus === 'PENDING' || !customer.approvalStatus;
  const approvalLabel = isApproved ? 'Approved' : isRejected ? 'Rejected' : (customer.approvalStatus || 'Pending Branch Approval');

  // Value formatting function equivalent to N.A fallback logic
  const getValue = (val) => {
    if (val === null || val === undefined || val === '') return 'N.A.';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    return val;
  };

  const getMediaUrl = (urlStr) => {
    if (!urlStr || urlStr === 'null') return null;
    return urlStr;
  };

  // Safe compound render components
  const FieldRow = ({ label, value, isMono = false, copyObj = null }) => (
    <div className="p-4 sm:px-6 flex items-center justify-between gap-4 print:py-1 print:px-2.5 print:gap-2">
      <span className="text-sm font-medium text-slate-700 whitespace-nowrap print:text-[11px]">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold text-slate-900 ${isMono ? 'font-mono' : ''} text-right print:text-[11px]`}>{getValue(value)}</span>
        {(copyObj && getValue(value) !== 'N.A.') && (
          <button type="button" onClick={() => handleCopy(value, copyObj)} className="text-slate-400 hover:text-[#225091] print:hidden">
            {copiedField === copyObj ? <CheckCheck size={14} className="text-emerald-600" /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full pb-16 font-sans">
      {/* Safe compound render components */}
      {/* FieldRow with print-optimized tight spacing */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
          html, body, #root, #root > div, main, div, section, article, .overflow-hidden, .overflow-y-auto, .h-screen, .flex-1 {
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 11px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, aside, nav, .print\:hidden {
            display: none !important;
          }
          .shadow-xs, .shadow-2xs, .shadow-sm, .shadow-md, .shadow-lg {
            box-shadow: none !important;
          }
          .border {
            border-color: #cbd5e1 !important;
          }
          /* Allow organic, space-saving page flow without forced blank gaps */
          .break-inside-avoid {
            page-break-inside: auto !important;
            break-inside: auto !important;
          }
          .print-card-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Page Header (Hidden when printing) */}
      <div className="print:hidden">
        <PageHeader
          title="View Customer"
          breadcrumbs={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'CRM Management' },
            { label: 'Pigmy Customers', to: '/pigmy' },
            { label: displayName }
          ]}
          showBack={true}
          backUrl="/pigmy"
        />
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/70 shadow-xs space-y-7 w-full print:p-0 print:border-none print:shadow-none print:rounded-none print:space-y-2.5">
        
        {/* Printable Official Bank Header Banner (Visible ONLY on print/PDF) */}
        <div className="hidden print:block border-b border-[#225091] pb-2 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-[#225091] text-white rounded-lg flex items-center justify-center font-extrabold text-base">
                ASB
              </div>
              <div>
                <h1 className="text-base font-bold text-[#225091] tracking-tight leading-tight">ADVITA CO-OPERATIVE BANK</h1>
                <p className="text-[10px] text-slate-500 font-semibold">PIGMY CUSTOMER DOSSIER & DETAILED ACCOUNT REPORT</p>
              </div>
            </div>
            <div className="text-right text-[10px] text-slate-600">
              <p className="font-bold">Generated Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              <p>Branch: <span className="font-semibold text-slate-900">{customer?.branchName || customer?.bankName || 'Head Office'}</span></p>
              <p>Customer Code: <span className="font-mono font-bold text-slate-900">{displayCode}</span></p>
            </div>
          </div>
        </div>

        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0084ff] text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0 print:border print:border-slate-300">
              {getInitials(displayName)}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight uppercase leading-snug">
                {displayName}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap text-sm">
                <span className="text-slate-500 font-medium">Ref No. <strong className="text-slate-900 font-bold">{displayCode}</strong></span>
                
                <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                  isApproved ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                  isRejected ? 'bg-rose-100 text-rose-800 border-rose-200' :
                  'bg-amber-100/90 text-amber-800 border-amber-200'
                } border`}>
                  {approvalLabel}
                </span>

                <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold border border-slate-200 ${
                  isMerchant ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {getValue(customer.customerType)}
                </span>
                
                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {getValue(customer.productType)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0 print:hidden">
            <button type="button" onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-[#225091] hover:bg-[#193e73] text-white font-bold text-sm shadow-xs transition-all flex items-center gap-1.5 cursor-pointer">
              <Printer size={16} /> Print Report
            </button>
            {isPending && (
              <>
                <button type="button" onClick={() => setIsApproveOpen(true)} className="px-4 py-2 rounded-xl bg-[#00a86b] hover:bg-[#00905a] text-white font-bold text-sm shadow-xs transition-all flex items-center gap-1.5 cursor-pointer">
                  <Check size={16} strokeWidth={2.5} /> Approve
                </button>
                <button type="button" onClick={() => setIsRejectOpen(true)} className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer">
                  <X size={16} /> Reject
                </button>
              </>
            )}
            <button type="button" onClick={() => setIsAddAccountOpen(true)} className="px-4 py-2 rounded-xl bg-[#1b365d] hover:bg-[#12233f] text-white font-bold text-sm shadow-xs transition-all flex items-center gap-1.5 cursor-pointer">
              <Landmark size={15} /> Link Society A/C
            </button>
          </div>
        </div>

        {/* 1. IDENTITY & SYSTEM DATA */}
        <div className="break-inside-avoid">
          <h2 className="text-[15px] font-bold text-[#225091] mb-4 border-b border-slate-100 pb-2">
            Identity & System Records
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              <div><span className="text-xs font-medium text-slate-500 block mb-1">Customer Full Name</span><span className="text-sm font-bold text-slate-900 block">{getValue(customer.fullName || customer.ownerName)}</span></div>
              <div><span className="text-xs font-medium text-slate-500 block mb-1">Gender</span><span className="text-sm font-bold text-slate-900 block">{getValue(customer.gender)}</span></div>
              <div><span className="text-xs font-medium text-slate-500 block mb-1">Date of Birth</span><span className="text-sm font-bold text-slate-900 block">{getValue(customer.dob)}</span></div>
              <div><span className="text-xs font-medium text-slate-500 block mb-1">Customer Type</span><span className="text-sm font-bold text-slate-900 block">{getValue(customer.customerType)} (Merchant: {getValue(customer.isMerchant)})</span></div>
            </div>

            <div className="border-t border-slate-100 p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 bg-slate-50/50">
              <div>
                <span className="text-xs font-medium text-slate-500 block mb-1">PAN Number</span>
                <span className="text-sm font-bold text-slate-900 font-mono inline-flex items-center gap-2">
                  {getValue(customer.panNumber || customer.ownerPanNumber)}
                  {customer.panNumber && <Copy size={13} className="text-slate-400 cursor-pointer hover:text-blue-600" onClick={() => handleCopy(customer.panNumber, 'PAN')} />}
                </span>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-500 block mb-1">Aadhaar Number</span>
                <span className="text-sm font-bold text-slate-900 font-mono inline-flex items-center gap-2">
                  {getValue(customer.aadhaarNumber || customer.ownerAadharNumber || customer.ownerAadhaarNumber)}
                  {customer.aadhaarNumber && <Copy size={13} className="text-slate-400 cursor-pointer hover:text-blue-600" onClick={() => handleCopy(customer.aadhaarNumber, 'Aadhaar')} />}
                </span>
              </div>
              <div><span className="text-xs font-medium text-slate-500 block mb-1">Primary System ID</span><span className="text-xs font-bold text-slate-900 font-mono block">{getValue(customer.id || customer.pigmyCustomerId)}</span></div>
              <div><span className="text-xs font-medium text-slate-500 block mb-1">User Record ID</span><span className="text-xs font-bold text-slate-900 font-mono block">{getValue(customer.userId)}</span></div>
            </div>
          </div>
        </div>

        {/* 2. CONTACT & ADDRESS */}
        <div className="break-inside-avoid">
          <h2 className="text-[15px] font-bold text-[#225091] mb-4 border-b border-slate-100 pb-2">
            Contact & Residence Address
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100">
            <FieldRow label="Primary Phone Number" value={customer.primaryPhoneNumber || customer.phoneNumber} isMono copyObj="Primary Phone" />
            <FieldRow label="Secondary Phone Number" value={customer.secondaryPhoneNumber} isMono />
            <FieldRow label="Email Address" value={customer.email} copyObj="Email" />
            <FieldRow label="Residence Address" value={customer.residenceAddress || customer.address} />
          </div>
        </div>

        {/* 3. MERCHANT BUSINESS PROFILE (Conditional) */}
        {isMerchant && (
          <div className="break-inside-avoid">
            <h2 className="text-[15px] font-bold text-[#225091] mb-4 border-b border-slate-100 pb-2">
              Merchant Business Profile
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100">
              <div className="bg-[#225091] px-5 py-3 flex items-center">
                <span className="text-sm font-semibold text-white">Shop & Entity Details</span>
              </div>
              <FieldRow label="Shop / Business Name" value={customer.shopName} />
              <FieldRow label="Shop Full Address" value={customer.shopAddress} />
              <FieldRow label="Business Proof Type" value={customer.businessProofType} />
              <FieldRow label="Business Proof Number" value={customer.businessProofNumber} isMono copyObj="Business Proof" />
              <FieldRow label="GSTIN Number" value={customer.gstinNumber} isMono copyObj="GSTIN Number" />
            </div>
          </div>
        )}

        {/* 4. BANKING SETUP & MANDATE */}
        <div className="break-inside-avoid">
          <h2 className="text-[15px] font-bold text-[#225091] mb-4 border-b border-slate-100 pb-2">
            Banking Setup & E-Nach Mandate
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100 h-full">
              <div className="bg-[#225091] px-5 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Commercial Bank (Debit Hub)</span>
              </div>
              <FieldRow label="Account Holder" value={ba.accountHolderName} />
              <FieldRow label="Account Number" value={ba.accountNumber} isMono />
              <FieldRow label="IFSC Code" value={ba.ifscCode} isMono />
              <FieldRow label="Bank Name" value={ba.bankName} />
              <FieldRow label="Branch Name" value={ba.branchName} />
              <FieldRow label="Account Type" value={ba.accountType} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100 h-full">
              <div className="bg-[#225091] px-5 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Account Meta & Mandate</span>
              </div>
              <FieldRow label="Savings Account Required?" value={customer.hasSavingsAccount} />
              <FieldRow label="Savings Options Rule" value={customer.savingsAccountOption} />
              <FieldRow label="New A/c Requested" value={customer.newSavingsAccountRequested} />
              <FieldRow label="Mandate ID" value={mandate.mandateId} isMono />
              <FieldRow label="Mandate Status" value={mandate.mandateStatus} />
              <FieldRow label="Auto-Debit Freq & Amt" value={`${getValue(mandate.autoDebitFrequency)} - ₹${getValue(mandate.autoDebitAmount)}`} />
              <FieldRow label="Mandate Validity" value={`${getValue(mandate.mandateStartDate)} to ${getValue(mandate.mandateEndDate)}`} />
            </div>

          </div>
        </div>

        {/* 5. INTERNAL PIGMY ACCOUNT & SCHEME */}
        <div className="break-inside-avoid">
          <h2 className="text-[15px] font-bold text-[#225091] mb-4 border-b border-slate-100 pb-2">
            Society Pigmy Generated Account & Scheme Structure
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100 h-full">
              <div className="bg-[#225091] px-5 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Internal Core System Mapping</span>
              </div>
              <FieldRow label="Pigmy System Bank name" value={customer.bankName} />
              <FieldRow label="Pigmy System Bank ID" value={customer.bankId} isMono />
              <FieldRow label="Pigmy Branch Name" value={customer.branchName} />
              <FieldRow label="Pigmy Branch ID" value={customer.branchId} isMono />
              <FieldRow label="Pigmy Core A/c Number" value={customer.accountNumber} isMono />
              <FieldRow label="Settlement Society A/c" value={customer.existingSavingsAccountNumber || customer.societyAccount} isMono />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100 h-full">
              <div className="bg-[#225091] px-5 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Scheme Contract</span>
              </div>
              <FieldRow label="Scheme Name / Code" value={`${getValue(scheme.name || customer.schemeName)} / ${getValue(scheme.code || customer.schemeCode)}`} />
              <FieldRow label="Scheme System ID" value={scheme.id || customer.schemeId} isMono />
              <FieldRow label="Daily Deposit Rate" value={`₹${getValue(scheme.dailyDepositAmount || customer.dailyDepositAmount)}`} />
              <FieldRow label="Plan Tenure Duration" value={`${getValue(scheme.tenureMonths || customer.tenureMonths)} Months`} />
              <FieldRow label="Expected Interest Yield" value={`${getValue(scheme.interestRate || customer.interestRate)}% p.a.`} />
              <FieldRow label="Projected Maturity Amount" value={`₹${getValue(scheme.maturityAmount || customer.maturityAmount)}`} />
              <FieldRow label="Is Custom Amount Allowed?" value={scheme.isCustomAmount || customer.isCustomAmount} />
              <FieldRow label="Active Deposit Window" value={`${getValue(customer.startDate)} to ${getValue(customer.endDate)}`} />
            </div>

          </div>
        </div>

        {/* 6. OPERATIONS & ONBOARDING SYSTEM META */}
        <div className="break-inside-avoid">
          <h2 className="text-[15px] font-bold text-[#225091] mb-4 border-b border-slate-100 pb-2">
            Lifecycle Tracking, Staff & Operations Metadata
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100">
            <FieldRow label="Record Created At" value={customer.createdAt} />
            <FieldRow label="Record Updated At" value={customer.updatedAt} />
            <FieldRow label="Approval Operations Code" value={customer.approvalStatus} />
            <FieldRow label="Rejection Reason History" value={customer.rejectionReason} />
            <FieldRow label="State Operational Status" value={customer.status} />
            <FieldRow label="Approved Timestamp" value={customer.approvedAt} />
            <FieldRow label="Rejected Timestamp" value={customer.rejectedAt} />
            <FieldRow label="Onboarded By Name / Role" value={`${getValue(onboardedBy.name)} / ${getValue(onboardedBy.role)}`} />
            <FieldRow label="Onboarded By Phone" value={onboardedBy.phone} isMono />
            <FieldRow label="Onboarded By System ID / User ID" value={`${getValue(onboardedBy.id)} / ${getValue(onboardedBy.userId)}`} isMono />
          </div>
        </div>

        {/* 7. DOCUMENTS LOADER & CONTRACT AGREEMENTS */}
        <div className="break-inside-avoid">
          <h2 className="text-[15px] font-bold text-[#225091] mb-4 border-b border-slate-100 pb-2">
            Attached Media Files, Documents & Contract Status
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100">
            <FieldRow label="Expected PDF Counts (Ruleset)" value={agreements.requiredPdfCount} />
            <FieldRow label="Pigmy Agreement Terms PDF ID" value={agreements.pigmyAgreementDocId} isMono />
            <FieldRow label="Pigmy Agreement Status Flag" value={agreements.pigmyAgreementStatus} />
            <FieldRow label="Savings A/c Application ID" value={agreements.savingsAccountDocId} isMono />
            <FieldRow label="Savings A/c Status Flag" value={agreements.savingsAccountStatus} />
            <FieldRow label="App Authentication Timestamp" value={agreements.signedAt} />
            <FieldRow label="e-Sign Authenticity TXN ID" value={agreements.eSignTxnId} isMono />
            
            {/* Medias mapping with fallback validation logic */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
               {[
                 { label: 'Profile Base Photo', url: documents?.profilePhoto || customer.profilePhoto },
                 { label: 'Aadhaar ID Card Proof', url: documents?.ownerAadhaar || customer.aadhaarImage },
                 { label: 'PAN Identity Proof', url: documents?.ownerPan || customer.panImage },
                 { label: 'Merchant Business License', url: documents?.businessProof || customer.businessProofImage },
                 { label: 'Shop Physical Location Photo', url: documents?.shopPhoto || customer.shopPhoto },
                 { label: 'Pigmy Terms Doc URL', url: agreements?.pigmyAgreementPdfUrl },
                 { label: 'Savings Doc URL', url: agreements?.savingsAccountPdfUrl },
               ].map((doc, i) => (
                 <div key={i} className="flex flex-col gap-1.5 p-3 rounded-xl border border-slate-200 bg-white">
                   <span className="text-xs font-semibold text-slate-600 line-clamp-1">{doc.label}</span>
                   {getMediaUrl(doc.url) ? (
                     <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-1">
                       <ExternalLink size={12} /> External File URL
                     </a>
                   ) : (
                     <span className="text-xs font-bold text-slate-400 mt-1">N.A. (Null Payload)</span>
                   )}
                 </div>
               ))}
            </div>
          </div>
        </div>
        {/* Printable Signature & Stamp Authorization Footer (Visible ONLY on print/PDF) */}
        <div className="hidden print:grid grid-cols-3 gap-6 pt-4 mt-4 border-t border-slate-300 text-center text-xs print-card-avoid">
          <div>
            <div className="h-10 border-b border-dashed border-slate-400 mb-1"></div>
            <p className="font-bold text-slate-800">Customer Signature</p>
            <p className="text-[10px] text-slate-500">Verified & Acknowledged</p>
          </div>
          <div>
            <div className="h-10 border-b border-dashed border-slate-400 mb-1"></div>
            <p className="font-bold text-slate-800">Branch Officer / Manager</p>
            <p className="text-[10px] text-slate-500">Authorized Signatory</p>
          </div>
          <div>
            <div className="h-10 border-b border-dashed border-slate-400 mb-1 flex items-center justify-center">
              <span className="text-[10px] text-slate-400 font-serif uppercase tracking-widest">[ Bank Seal / Stamp ]</span>
            </div>
            <p className="font-bold text-slate-800">Bank Official Seal</p>
            <p className="text-[10px] text-slate-500">Advita Co-operative Bank</p>
          </div>
        </div>

      </div>

      {/* Modals */}
      <AddSocietyAccountModal isOpen={isAddAccountOpen} customer={customer} onClose={() => setIsAddAccountOpen(false)} onSuccess={handleAccountLinked} />
      <ApproveCustomerModal isOpen={isApproveOpen} customer={customer} onClose={() => setIsApproveOpen(false)} onSuccess={handleApproved} onOpenAddAccount={() => setIsAddAccountOpen(true)} />
      <RejectCustomerModal isOpen={isRejectOpen} customer={customer} onClose={() => setIsRejectOpen(false)} onSuccess={handleRejected} />
    </div>
  );
};

export default ViewPigmyCustomer;
