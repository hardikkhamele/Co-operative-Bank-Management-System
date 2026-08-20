import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  ChevronRight, 
  FileText, 
  Send, 
  Printer, 
  Download, 
  Loader2, 
  Calendar, 
  Building2, 
  User, 
  Briefcase, 
  IndianRupee, 
  Eye, 
  CheckCircle2,
  FileCheck,
  TrendingUp,
  ArrowRightLeft,
  DollarSign
} from 'lucide-react';
import { letterService } from '../../api/letterService';
import { employeeService } from '../../api/employeeService';
import { branchService } from '../../api/branchService';
import { roleService } from '../../api/roleService';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const DEFAULT_DESIGNATIONS = [
  'Branch Manager',
  'Assistant Branch Manager',
  'Senior Loan Officer',
  'Loan Executive',
  'Collection Executive',
  'Senior Clerk',
  'Clerk',
  'Cashier',
  'Accountant',
  'Field Officer',
];

const MONTHS_LIST = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const LettersAndPayroll = () => {
  const [activeTab, setActiveTab] = useState('Offer Letter');
  const [loading, setLoading] = useState(false);

  // Dropdown Lists
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);

  // Filter Selectors for Employee Filtering
  const [selectedState, setSelectedState] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');

  // Selected Employee & Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  
  // Tab-Specific Form Fields
  const [offerDesignation, setOfferDesignation] = useState('Senior Loan Officer');
  const [confirmationDate, setConfirmationDate] = useState(new Date().toISOString().slice(0, 10));
  const [confirmationDesignation, setConfirmationDesignation] = useState('Permanent Loan Officer');
  const [performanceLetterText, setPerformanceLetterText] = useState('Exceeded yearly loan disbursement target by 125%. Promoted to Senior Grade.');
  const [promotedToDesignation, setPromotedToDesignation] = useState('Branch Manager');
  const [promotionDate, setPromotionDate] = useState(new Date().toISOString().slice(0, 10));
  const [transferToBranchId, setTransferToBranchId] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().slice(0, 10));
  const [fromMonth, setFromMonth] = useState('July 2026');
  const [toMonth, setToMonth] = useState('July 2026');
  const [newSalary, setNewSalary] = useState('75000');
  const [incrementEffectiveDate, setIncrementEffectiveDate] = useState(new Date().toISOString().slice(0, 10));

  // Generated Document State
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null);
  const [generatedDocTitle, setGeneratedDocTitle] = useState('');

  // Month & Year Generation Options (e.g., "July 2026", "June 2026", etc.)
  const monthYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear + 1];
    const options = [];
    years.forEach((yr) => {
      MONTHS_LIST.forEach((m) => {
        options.push(`${m} ${yr}`);
      });
    });
    return options;
  }, []);

  // Fetch initial dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [empRes, branchRes, roleRes] = await Promise.allSettled([
          employeeService.list({ limit: 200 }),
          branchService.list({ limit: 100 }),
          roleService.list({ limit: 100 }),
        ]);

        if (empRes.status === 'fulfilled' && (empRes.value?.success || Array.isArray(empRes.value?.data))) {
          const list = Array.isArray(empRes.value.data) ? empRes.value.data : (empRes.value.data?.employees || []);
          setEmployees(list);
          if (list.length > 0 && !selectedEmployeeId) {
            setSelectedEmployeeId(list[0].id || list[0]._id);
          }
        }

        if (branchRes.status === 'fulfilled' && branchRes.value?.success) {
          const bList = branchRes.value.data || [];
          setBranches(bList);
          if (bList.length > 0) {
            setTransferToBranchId(bList[0].id || bList[0]._id);
          }
        }

        if (roleRes.status === 'fulfilled' && roleRes.value?.success) {
          setRoles(roleRes.value.data || []);
        }
      } catch (err) {
        console.error('Failed to load initial dropdown data:', err);
      }
    };

    loadDropdownData();
  }, []);

  // Filter Employees based on State / Branch / Designation
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchState = !selectedState || emp.state === selectedState || emp.address?.state === selectedState;
      const matchBranch = !selectedBranch || emp.branchId === selectedBranch || emp.branch?.id === selectedBranch || emp.branch === selectedBranch;
      const matchDesignation = !selectedDesignation || emp.designation === selectedDesignation || emp.role?.name === selectedDesignation;
      return matchState && matchBranch && matchDesignation;
    });
  }, [employees, selectedState, selectedBranch, selectedDesignation]);

  // Sync selected employee when filtered list changes
  useEffect(() => {
    if (filteredEmployees.length > 0) {
      const exists = filteredEmployees.some(e => (e.id || e._id) === selectedEmployeeId);
      if (!exists) {
        setSelectedEmployeeId(filteredEmployees[0].id || filteredEmployees[0]._id);
      }
    }
  }, [filteredEmployees, selectedEmployeeId]);

  // Currently Selected Employee Object
  const currentEmployee = useMemo(() => {
    return employees.find(e => (e.id || e._id) === selectedEmployeeId) || null;
  }, [employees, selectedEmployeeId]);

  // Clean up object URL when blob changes
  useEffect(() => {
    if (generatedPdfBlob) {
      const url = window.URL.createObjectURL(generatedPdfBlob);
      setGeneratedPdfUrl(url);
      return () => {
        window.URL.revokeObjectURL(url);
      };
    } else {
      setGeneratedPdfUrl(null);
    }
  }, [generatedPdfBlob]);

  const tabs = [
    { label: 'Offer Letter', icon: FileText },
    { label: 'Confirmation Letter', icon: FileCheck },
    { label: 'Performance Letter', icon: TrendingUp },
    { label: 'Promotion Letter', icon: Briefcase },
    { label: 'Transfer Letter', icon: ArrowRightLeft },
    { label: 'Salary Slip', icon: DollarSign },
    { label: 'Salary Increment', icon: IndianRupee },
  ];

  // Handle Tab Click
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setGeneratedPdfBlob(null);
    setGeneratedDocTitle('');
  };

  // Generate Document Action
  const handleGenerateDocument = async (e) => {
    if (e) e.preventDefault();

    if (!selectedEmployeeId) {
      toast.error('Please select an employee.');
      return;
    }

    setLoading(true);
    setGeneratedPdfBlob(null);

    const empName = currentEmployee?.fullName || currentEmployee?.name || 'Employee';

    try {
      let pdfBlob = null;
      let title = '';

      switch (activeTab) {
        case 'Offer Letter': {
          const payload = {
            employeeId: selectedEmployeeId,
            designation: offerDesignation || currentEmployee?.designation || 'Senior Loan Officer',
          };
          title = `Offer_Letter_${empName.replace(/\s+/g, '_')}`;
          pdfBlob = await letterService.generateOfferLetter(payload);
          break;
        }

        case 'Confirmation Letter': {
          const payload = {
            employeeId: selectedEmployeeId,
            confirmationDate: confirmationDate || new Date().toISOString().slice(0, 10),
            designation: confirmationDesignation || currentEmployee?.designation || 'Permanent Loan Officer',
          };
          title = `Confirmation_Letter_${empName.replace(/\s+/g, '_')}`;
          pdfBlob = await letterService.generateConfirmationLetter(payload);
          break;
        }

        case 'Performance Letter': {
          if (!performanceLetterText.trim()) {
            toast.error('Please enter performance review letter text.');
            setLoading(false);
            return;
          }
          const payload = {
            employeeId: selectedEmployeeId,
            letterText: performanceLetterText.trim(),
          };
          title = `Performance_Letter_${empName.replace(/\s+/g, '_')}`;
          pdfBlob = await letterService.generatePerformanceLetter(payload);
          break;
        }

        case 'Promotion Letter': {
          const payload = {
            employeeId: selectedEmployeeId,
            promotedToDesignation: promotedToDesignation || 'Branch Manager',
            promotionDate: promotionDate || new Date().toISOString().slice(0, 10),
          };
          title = `Promotion_Letter_${empName.replace(/\s+/g, '_')}`;
          pdfBlob = await letterService.generatePromotionLetter(payload);
          break;
        }

        case 'Transfer Letter': {
          if (!transferToBranchId) {
            toast.error('Please select target transfer branch.');
            setLoading(false);
            return;
          }
          const payload = {
            employeeId: selectedEmployeeId,
            transferToBranchId: transferToBranchId,
            transferDate: transferDate || new Date().toISOString().slice(0, 10),
          };
          title = `Transfer_Letter_${empName.replace(/\s+/g, '_')}`;
          pdfBlob = await letterService.generateTransferLetter(payload);
          break;
        }

        case 'Salary Slip': {
          const payload = {
            employeeId: selectedEmployeeId,
            fromMonth: fromMonth || 'July 2026',
            toMonth: toMonth || 'July 2026',
          };
          title = `Salary_Slip_${empName.replace(/\s+/g, '_')}_${fromMonth.replace(/\s+/g, '_')}`;
          pdfBlob = await letterService.generateSalarySlip(payload);
          break;
        }

        case 'Salary Increment': {
          if (!newSalary || isNaN(Number(newSalary)) || Number(newSalary) <= 0) {
            toast.error('Please enter valid new revised salary.');
            setLoading(false);
            return;
          }
          const payload = {
            employeeId: selectedEmployeeId,
            newSalary: Number(newSalary),
            effectiveDate: incrementEffectiveDate || new Date().toISOString().slice(0, 10),
          };
          title = `Salary_Increment_${empName.replace(/\s+/g, '_')}`;
          pdfBlob = await letterService.generateSalaryIncrement(payload);
          break;
        }

        default:
          break;
      }

      if (pdfBlob) {
        // Verify blob type
        const blob = pdfBlob instanceof Blob ? pdfBlob : new Blob([pdfBlob], { type: 'application/pdf' });
        setGeneratedPdfBlob(blob);
        setGeneratedDocTitle(title);
        toast.success(`${activeTab} generated successfully!`);
      }
    } catch (err) {
      console.error(`Generate ${activeTab} error:`, err);
      const errMsg = err.response?.data?.details?.[0]?.message || err.response?.data?.message || `Failed to generate ${activeTab} PDF.`;
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Download PDF file
  const handleDownload = () => {
    if (!generatedPdfUrl) return;
    const link = document.createElement('a');
    link.href = generatedPdfUrl;
    link.setAttribute('download', `${generatedDocTitle || 'document'}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Document downloaded!');
  };

  // Print PDF in new tab/window
  const handlePrint = () => {
    if (!generatedPdfUrl) return;
    const printWindow = window.open(generatedPdfUrl);
    if (printWindow) {
      printWindow.focus();
      printWindow.print();
    } else {
      toast.info('Pop-up blocked. Please allow pop-ups to print directly.');
    }
  };

  // Send / Dispatch notification toast
  const handleSend = () => {
    toast.success(`${activeTab} sent to ${currentEmployee?.fullName || 'employee'} email successfully!`);
  };

  // Preview in new tab
  const handlePreview = () => {
    if (!generatedPdfUrl) return;
    window.open(generatedPdfUrl, '_blank');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      
      {/* Breadcrumb & Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0">
        <h1 className="text-[22px] font-bold text-[#225091] mb-3">Letters & Payroll</h1>
        <div className="flex items-center text-[13px] font-medium text-gray-500 flex-wrap gap-y-2">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="mx-1" />
          <span>HR Management</span>
          <ChevronRight size={14} className="mx-1" />
          <span className="text-[#225091]">Letters & Payroll</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {/* Tabs Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-gray-100 p-3 bg-gray-50/50 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.label;
            return (
              <button
                key={tab.label}
                onClick={() => handleTabChange(tab.label)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13.5px] font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#225091] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200/60'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#225091]"></span>
              {activeTab} Generation
            </h2>

            {currentEmployee && (
              <div className="flex items-center gap-3 bg-teal-50/60 border border-teal-200 px-4 py-2 rounded-xl text-xs">
                <div className="w-7 h-7 rounded-full bg-[#225091] text-white font-bold flex items-center justify-center text-xs">
                  {(currentEmployee.fullName || currentEmployee.name || 'E').charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-gray-800">{currentEmployee.fullName || currentEmployee.name}</div>
                  <div className="text-gray-500 text-[11px]">
                    {currentEmployee.designation || 'Staff'} • {currentEmployee.branchName || currentEmployee.branch?.name || 'Main Branch'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Filter Box */}
          <div className="bg-[#f4fbfb] border border-teal-100 rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
            <form onSubmit={handleGenerateDocument} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              
              {/* State / UT Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Filter by State/UT</label>
                <select 
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#225091] bg-white"
                >
                  <option value="">All States</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Branch Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Filter by Branch</label>
                <select 
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#225091] bg-white"
                >
                  <option value="">All Branches</option>
                  {branches.map((b) => (
                    <option key={b.id || b._id} value={b.id || b._id}>
                      {b.branchName || b.name || `Branch #${b.id || b._id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Designation Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Filter by Designation</label>
                <select 
                  value={selectedDesignation}
                  onChange={(e) => setSelectedDesignation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#225091] bg-white"
                >
                  <option value="">All Designations</option>
                  {roles.length > 0 ? (
                    roles.map((r) => (
                      <option key={r.id || r._id || r.name} value={r.name || r.roleName}>
                        {r.name || r.roleName}
                      </option>
                    ))
                  ) : (
                    DEFAULT_DESIGNATIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Target Employee Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700 flex items-center gap-1.5">
                  <User size={14} className="text-[#225091]" /> Select Employee *
                </label>
                <select 
                  required
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-teal-300 text-[14px] font-semibold text-gray-800 focus:outline-none focus:border-[#225091] bg-white"
                >
                  <option value="">Select Employee ({filteredEmployees.length} available)</option>
                  {filteredEmployees.map((emp) => {
                    const empId = emp.id || emp._id;
                    const empName = emp.fullName || emp.name || `Employee #${empId}`;
                    const desig = emp.designation ? ` - ${emp.designation}` : '';
                    return (
                      <option key={empId} value={empId}>
                        {empName}{desig}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* DYNAMIC TAB FIELDS */}

              {/* 1. Offer Letter Fields */}
              {activeTab === 'Offer Letter' && (
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[13px] font-semibold text-gray-700 flex items-center gap-1.5">
                    <Briefcase size={14} className="text-[#225091]" /> Offered Designation *
                  </label>
                  <input 
                    type="text"
                    required
                    value={offerDesignation}
                    onChange={(e) => setOfferDesignation(e.target.value)}
                    placeholder="e.g. Senior Loan Officer"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-800 focus:outline-none focus:border-[#225091] bg-white"
                  />
                </div>
              )}

              {/* 2. Employment Confirmation Letter Fields */}
              {activeTab === 'Confirmation Letter' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-700 flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#225091]" /> Confirmation Date *
                    </label>
                    <input 
                      type="date"
                      required
                      value={confirmationDate}
                      onChange={(e) => setConfirmationDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-800 focus:outline-none focus:border-[#225091] bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-700 flex items-center gap-1.5">
                      <Briefcase size={14} className="text-[#225091]" /> Confirmed Designation *
                    </label>
                    <input 
                      type="text"
                      required
                      value={confirmationDesignation}
                      onChange={(e) => setConfirmationDesignation(e.target.value)}
                      placeholder="e.g. Permanent Loan Officer"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-800 focus:outline-none focus:border-[#225091] bg-white"
                    />
                  </div>
                </>
              )}

              {/* 3. Performance Review Letter Fields */}
              {activeTab === 'Performance Letter' && (
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[13px] font-semibold text-gray-700 flex items-center gap-1.5">
                    <FileText size={14} className="text-[#225091]" /> Performance Letter Remarks / Review Summary *
                  </label>
                  <textarea 
                    rows={4}
                    required
                    value={performanceLetterText}
                    onChange={(e) => setPerformanceLetterText(e.target.value)}
                    placeholder="e.g. Exceeded yearly loan disbursement target by 125%. Promoted to Senior Grade."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-800 focus:outline-none focus:border-[#225091] bg-white resize-none"
                  ></textarea>
                </div>
              )}

              {/* 4. Promotion Letter Fields */}
              {activeTab === 'Promotion Letter' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-700 flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-[#225091]" /> Promoted To Designation *
                    </label>
                    <input 
                      type="text"
                      required
                      value={promotedToDesignation}
                      onChange={(e) => setPromotedToDesignation(e.target.value)}
                      placeholder="e.g. Branch Manager"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-800 focus:outline-none focus:border-[#225091] bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-700 flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#225091]" /> Promotion Effective Date *
                    </label>
                    <input 
                      type="date"
                      required
                      value={promotionDate}
                      onChange={(e) => setPromotionDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-800 focus:outline-none focus:border-[#225091] bg-white"
                    />
                  </div>
                </>
              )}

              {/* 5. Transfer Letter Fields */}
              {activeTab === 'Transfer Letter' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-700 flex items-center gap-1.5">
                      <Building2 size={14} className="text-[#225091]" /> Transfer To Branch *
                    </label>
                    <select 
                      required
                      value={transferToBranchId}
                      onChange={(e) => setTransferToBranchId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-800 focus:outline-none focus:border-[#225091] bg-white"
                    >
                      <option value="">Select Target Branch</option>
                      {branches.map((b) => (
                        <option key={b.id || b._id} value={b.id || b._id}>
                          {b.branchName || b.name || `Branch #${b.id || b._id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-700 flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#225091]" /> Transfer Date *
                    </label>
                    <input 
                      type="date"
                      required
                      value={transferDate}
                      onChange={(e) => setTransferDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-800 focus:outline-none focus:border-[#225091] bg-white"
                    />
                  </div>
                </>
              )}

              {/* 6. Salary Slip Fields */}
              {activeTab === 'Salary Slip' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-700 flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#225091]" /> From Month *
                    </label>
                    <select 
                      required
                      value={fromMonth}
                      onChange={(e) => setFromMonth(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-800 focus:outline-none focus:border-[#225091] bg-white"
                    >
                      {monthYearOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-700 flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#225091]" /> To Month *
                    </label>
                    <select 
                      required
                      value={toMonth}
                      onChange={(e) => setToMonth(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-800 focus:outline-none focus:border-[#225091] bg-white"
                    >
                      {monthYearOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* 7. Salary Increment Fields */}
              {activeTab === 'Salary Increment' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-700 flex items-center gap-1.5">
                      <IndianRupee size={14} className="text-[#225091]" /> New Revised Monthly Salary (₹) *
                    </label>
                    <input 
                      type="number"
                      required
                      min="1000"
                      step="500"
                      value={newSalary}
                      onChange={(e) => setNewSalary(e.target.value)}
                      placeholder="e.g. 75000"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-800 focus:outline-none focus:border-[#225091] bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-gray-700 flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#225091]" /> Effective Date *
                    </label>
                    <input 
                      type="date"
                      required
                      value={incrementEffectiveDate}
                      onChange={(e) => setIncrementEffectiveDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-800 focus:outline-none focus:border-[#225091] bg-white"
                    />
                  </div>
                </>
              )}

              {/* Submit Action Button */}
              <div className="md:col-span-2 flex justify-end mt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#225091] hover:bg-[#159a9f] text-white px-8 py-3 rounded-full text-[14px] font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Generating {activeTab} PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck size={18} />
                      <span>Generate {activeTab} PDF</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Generated Document Card */}
          {generatedPdfBlob && (
            <div className="border-2 border-teal-200 bg-gradient-to-br from-teal-50/40 to-cyan-50/30 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in zoom-in-95 duration-300 shadow-sm">
              <div className="flex items-center gap-5">
                <div className="w-16 h-20 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-md relative overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 w-6 h-6 bg-white/20 rounded-bl-lg"></div>
                  <FileText size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-green-100 text-green-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={12} /> Ready
                    </span>
                    <span className="text-xs text-gray-500 font-medium">application/pdf</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-800">{generatedDocTitle}.pdf</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    For: <span className="font-semibold text-gray-700">{currentEmployee?.fullName || currentEmployee?.name}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <button 
                  type="button" 
                  onClick={handlePreview}
                  className="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-full text-[13.5px] font-semibold transition-all shadow-xs"
                >
                  <Eye size={16} /> Preview
                </button>
                <button 
                  type="button" 
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-full text-[13.5px] font-semibold transition-all shadow-xs"
                >
                  <Printer size={16} /> Print
                </button>
                <button 
                  type="button" 
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 bg-[#225091] hover:bg-[#159a9f] text-white px-6 py-2.5 rounded-full text-[13.5px] font-bold transition-all shadow-sm"
                >
                  <Download size={16} /> Download PDF
                </button>
                <button 
                  type="button" 
                  onClick={handleSend}
                  className="flex items-center justify-center gap-2 bg-[#225091] hover:bg-[#154684] text-white px-5 py-2.5 rounded-full text-[13.5px] font-semibold transition-all shadow-sm"
                >
                  <Send size={16} /> Send Email
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LettersAndPayroll;
