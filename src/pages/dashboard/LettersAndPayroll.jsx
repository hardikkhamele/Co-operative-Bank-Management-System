import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  FileText, 
  Download, 
  Printer, 
  Eye, 
  Loader2,
  Search,
  Trash2,
  CheckCircle2,
  Award,
  ShieldCheck,
  TrendingUp,
  Briefcase,
  ArrowRightLeft,
  Receipt,
  UserMinus,
  Sparkles,
  Building2,
  Calendar,
  IndianRupee,
  User,
  History,
  FileCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { employeeService } from '../../api/employeeService';
import { branchService } from '../../api/branchService';
import { letterService } from '../../api/letterService';

const MONTHS_LIST = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const LETTER_TYPES = [
  { 
    id: 'Offer Letter', 
    name: 'Offer Letter', 
    code: 'OL',
    icon: Award,
    description: 'New employment offer & terms',
    color: 'from-blue-500/10 to-indigo-500/10 text-[#1B4E8C] border-blue-200'
  },
  { 
    id: 'Confirmation Letter', 
    name: 'Confirmation Letter', 
    code: 'CL',
    icon: ShieldCheck,
    description: 'Probation completion & confirmation',
    color: 'from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-200'
  },
  { 
    id: 'Salary Slip', 
    name: 'Salary Slip', 
    code: 'SS',
    icon: Receipt,
    description: 'Monthly payroll & earnings statement',
    color: 'from-purple-500/10 to-pink-500/10 text-purple-700 border-purple-200'
  },
  { 
    id: 'Salary Increment', 
    name: 'Salary Increment', 
    code: 'SI',
    icon: TrendingUp,
    description: 'Compensation & CTC appraisal letter',
    color: 'from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-200'
  },
  { 
    id: 'Promotion Letter', 
    name: 'Promotion Letter', 
    code: 'PL',
    icon: Briefcase,
    description: 'Designation & role upgrade',
    color: 'from-cyan-500/10 to-sky-500/10 text-cyan-700 border-cyan-200'
  },
  { 
    id: 'Transfer Letter', 
    name: 'Transfer Letter', 
    code: 'TL',
    icon: ArrowRightLeft,
    description: 'Branch relocation & movement',
    color: 'from-indigo-500/10 to-blue-500/10 text-indigo-700 border-indigo-200'
  },
  { 
    id: 'Performance Letter', 
    name: 'Performance Appraisal', 
    code: 'PA',
    icon: Sparkles,
    description: 'Annual performance evaluation',
    color: 'from-rose-500/10 to-pink-500/10 text-rose-700 border-rose-200'
  },
  { 
    id: 'Termination Letter', 
    name: 'Termination Letter', 
    code: 'TM',
    icon: UserMinus,
    description: 'Relieving & exit documentation',
    color: 'from-red-500/10 to-rose-500/10 text-red-700 border-red-200'
  },
];

const STORAGE_KEY = 'advita_hr_letters_history';

const INITIAL_SAMPLE_HISTORY = [
  {
    id: 'hist-1',
    referenceNumber: 'KHAMLA/HR/OL/2026/001',
    letterType: 'Offer Letter',
    employeeId: '65b9d3b2e59df13456789555',
    employeeName: 'Ayush Kumar',
    designation: 'Branch Operations Manager',
    detailsSummary: 'Designation: Branch Operations Manager • CTC: ₹6,00,000/yr',
    generatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'hist-2',
    referenceNumber: 'KHAMLA/HR/CL/2026/001',
    letterType: 'Confirmation Letter',
    employeeId: '65b9d3b2e59df13456789556',
    employeeName: 'Priya Sharma',
    designation: 'Senior Loan Officer',
    detailsSummary: 'Probation Confirmed • Notice: 60 Days',
    generatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'hist-3',
    referenceNumber: 'KHAMLA/HR/SS/2026/08/001',
    letterType: 'Salary Slip',
    employeeId: '65b9d3b2e59df13456789557',
    employeeName: 'Rohan Deshmukh',
    designation: 'Collection Executive',
    detailsSummary: 'Period: August 2026 • Working Days: 31',
    generatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  }
];

const LettersAndPayroll = () => {
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' | 'history'
  const [selectedLetterType, setSelectedLetterType] = useState('Offer Letter');
  const [loading, setLoading] = useState(false);

  // Dropdown Lists
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);

  // Selected Employee
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  
  // 1. Offer Letter Fields
  const [offerDesignation, setOfferDesignation] = useState('Branch Operations Manager');
  const [offerJoiningDate, setOfferJoiningDate] = useState(new Date().toISOString().slice(0, 10));
  const [offerAnnualSalary, setOfferAnnualSalary] = useState('600000');

  // 2. Confirmation Letter Fields
  const [probationStartDate, setProbationStartDate] = useState(new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10));
  const [probationEndDate, setProbationEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [confirmationDate, setConfirmationDate] = useState(new Date().toISOString().slice(0, 10));
  const [confirmationNoticePeriod, setConfirmationNoticePeriod] = useState('60');

  // 3. Performance Appraisal Letter Fields
  const [perfReviewPeriod, setPerfReviewPeriod] = useState('FY 2025–26');
  const [perfOverallRating, setPerfOverallRating] = useState('4.5 / 5.0 (Exceeds Expectations)');
  const [perfManagerComments, setPerfManagerComments] = useState('Demonstrated outstanding performance and adhered to all compliance guidelines.');
  const [perfAppraisalOutcome, setPerfAppraisalOutcome] = useState('Eligible for annual increment of 15% and promotion consideration.');

  // 4. Promotion Letter Fields
  const [promotedNewRole, setPromotedNewRole] = useState('Senior Branch Manager');
  const [promotionEffectiveDate, setPromotionEffectiveDate] = useState(new Date().toISOString().slice(0, 10));

  // 5. Transfer Letter Fields
  const [transferToBranchId, setTransferToBranchId] = useState('');
  const [transferEffectiveDate, setTransferEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [transferReportingDate, setTransferReportingDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));

  // 6. Salary Increment Letter Fields
  const [incrReviewPeriod, setIncrReviewPeriod] = useState('FY 2025–26');
  const [incrEffectiveDate, setIncrEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [incrPercentage, setIncrPercentage] = useState('15');
  const [incrCurrentCtc, setIncrCurrentCtc] = useState('600000');
  const [incrRevisedCtc, setIncrRevisedCtc] = useState('690000');

  // 7. Salary Slip Fields
  const [salaryDate, setSalaryDate] = useState(new Date().toISOString().slice(0, 10));
  const [salaryPayDate, setSalaryPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [salaryPayPeriod, setSalaryPayPeriod] = useState('August 2026');
  const [salaryWorkingDays, setSalaryWorkingDays] = useState('31');
  const [salaryPresentDays, setSalaryPresentDays] = useState('29');
  const [salaryLopDays, setSalaryLopDays] = useState('2');
  const [salaryAccountNumber, setSalaryAccountNumber] = useState('');

  // 8. Termination Letter Fields
  const [termDate, setTermDate] = useState(new Date().toISOString().slice(0, 10));
  const [termReason, setTermReason] = useState('Resignation / Personal Reasons');
  const [termNoticePeriodDays, setTermNoticePeriodDays] = useState('30');
  const [termHandoverTo, setTermHandoverTo] = useState('Mr. Amit Verma, Senior Branch Officer');

  // Generated Document State
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null);
  const [generatedDocTitle, setGeneratedDocTitle] = useState('');
  const [generatedRefNo, setGeneratedRefNo] = useState('');

  // History State
  const [historyList, setHistoryList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_SAMPLE_HISTORY;
  });

  // History Filters & Pagination
  const [historySearch, setHistorySearch] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('ALL');
  const [historyPage, setHistoryPage] = useState(1);
  const historyLimit = 10;

  // Month & Year Generation Options
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

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historyList));
    } catch (e) {
      console.warn('Failed to save history to localStorage:', e);
    }
  }, [historyList]);

  // Fetch initial dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [empRes, branchRes] = await Promise.allSettled([
          employeeService.list({ limit: 200 }),
          branchService.list({ limit: 100 }),
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
      } catch (err) {
        console.error('Failed to load initial dropdown data:', err);
      }
    };

    loadDropdownData();
  }, []);

  // Currently Selected Employee Object
  const currentEmployee = useMemo(() => {
    return employees.find(e => (e.id || e._id) === selectedEmployeeId) || null;
  }, [employees, selectedEmployeeId]);

  // Auto-fill sensible fields when selected employee changes
  useEffect(() => {
    if (currentEmployee) {
      if (currentEmployee.designation) {
        setOfferDesignation(currentEmployee.designation);
        setPromotedNewRole(`Senior ${currentEmployee.designation}`);
      }
      if (currentEmployee.joiningDate) {
        const jd = new Date(currentEmployee.joiningDate).toISOString().slice(0, 10);
        setOfferJoiningDate(jd);
        setProbationStartDate(jd);
      }
      if (currentEmployee.salary) {
        setIncrCurrentCtc(currentEmployee.salary.toString());
        setOfferAnnualSalary(currentEmployee.salary.toString());
      }
    }
  }, [currentEmployee]);

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

  // Helper to generate reference number
  const createReferenceNumber = (letterType, emp) => {
    const yr = new Date().getFullYear();
    const mo = String(new Date().getMonth() + 1).padStart(2, '0');
    const letterObj = LETTER_TYPES.find(l => l.id === letterType) || { code: 'DOC' };
    const rand = Math.floor(100 + Math.random() * 900);
    const branchPrefix = (emp?.branchName || emp?.branch?.name || 'KHAMLA').toUpperCase().slice(0, 6);
    
    if (letterType === 'Salary Slip') {
      return `${branchPrefix}/HR/${letterObj.code}/${yr}/${mo}/${rand}`;
    }
    return `${branchPrefix}/HR/${letterObj.code}/${yr}/${rand}`;
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
    const refNumber = createReferenceNumber(selectedLetterType, currentEmployee);
    let summaryText = '';

    try {
      let pdfBlob = null;
      let title = '';

      switch (selectedLetterType) {
        case 'Offer Letter': {
          const payload = {
            employeeId: selectedEmployeeId,
            candidateName: empName,
            designation: offerDesignation || currentEmployee?.designation || 'Staff',
            joiningDate: offerJoiningDate,
            annualSalary: Number(offerAnnualSalary) || 0,
          };
          title = `Offer_Letter_${empName.replace(/\s+/g, '_')}`;
          summaryText = `Designation: ${offerDesignation} • CTC: ₹${Number(offerAnnualSalary).toLocaleString()}/yr`;
          pdfBlob = await letterService.generateOfferLetter(payload);
          break;
        }

        case 'Confirmation Letter': {
          const payload = {
            employeeId: selectedEmployeeId,
            probationStartDate: probationStartDate,
            probationEndDate: probationEndDate,
            confirmationDate: confirmationDate,
            noticePeriodDays: Number(confirmationNoticePeriod) || 60,
          };
          title = `Confirmation_Letter_${empName.replace(/\s+/g, '_')}`;
          summaryText = `Confirmed: ${confirmationDate} • Notice: ${confirmationNoticePeriod} Days`;
          pdfBlob = await letterService.generateConfirmationLetter(payload);
          break;
        }

        case 'Performance Letter': {
          const payload = {
            employeeId: selectedEmployeeId,
            reviewPeriod: perfReviewPeriod,
            overallRating: perfOverallRating,
            managerComments: perfManagerComments,
            appraisalOutcome: perfAppraisalOutcome,
          };
          title = `Performance_Letter_${empName.replace(/\s+/g, '_')}`;
          summaryText = `Period: ${perfReviewPeriod} • Rating: ${perfOverallRating}`;
          pdfBlob = await letterService.generatePerformanceLetter(payload);
          break;
        }

        case 'Promotion Letter': {
          const payload = {
            employeeId: selectedEmployeeId,
            newRole: promotedNewRole,
            effectiveDate: promotionEffectiveDate,
          };
          title = `Promotion_Letter_${empName.replace(/\s+/g, '_')}`;
          summaryText = `Role: ${promotedNewRole} • Effective: ${promotionEffectiveDate}`;
          pdfBlob = await letterService.generatePromotionLetter(payload);
          break;
        }

        case 'Transfer Letter': {
          if (!transferToBranchId) {
            toast.error('Please select a target branch for transfer.');
            setLoading(false);
            return;
          }
          const targetBranch = branches.find(b => (b.id || b._id) === transferToBranchId);
          const targetBranchName = targetBranch?.branchName || targetBranch?.name || 'New Branch';

          const payload = {
            employeeId: selectedEmployeeId,
            transferToBranchId: transferToBranchId,
            effectiveDate: transferEffectiveDate,
            reportingDate: transferReportingDate,
          };
          title = `Transfer_Letter_${empName.replace(/\s+/g, '_')}`;
          summaryText = `To: ${targetBranchName} • Effective: ${transferEffectiveDate}`;
          pdfBlob = await letterService.generateTransferLetter(payload);
          break;
        }

        case 'Salary Increment': {
          const payload = {
            employeeId: selectedEmployeeId,
            reviewPeriod: incrReviewPeriod,
            effectiveDate: incrEffectiveDate,
            incrementPercentage: Number(incrPercentage) || 0,
            currentCtc: Number(incrCurrentCtc) || 0,
            revisedCtc: Number(incrRevisedCtc) || 0,
          };
          title = `Salary_Increment_${empName.replace(/\s+/g, '_')}`;
          summaryText = `Increment: ${incrPercentage}% • Revised CTC: ₹${Number(incrRevisedCtc).toLocaleString()}/yr`;
          pdfBlob = await letterService.generateSalaryIncrement(payload);
          break;
        }

        case 'Salary Slip': {
          const payload = {
            employeeId: selectedEmployeeId,
            salaryDate: salaryDate,
            payDate: salaryPayDate,
            payPeriod: salaryPayPeriod,
            workingDays: Number(salaryWorkingDays) || 30,
            presentDays: Number(salaryPresentDays) || 30,
            lopDays: Number(salaryLopDays) || 0,
            ...(salaryAccountNumber ? { accountNumber: salaryAccountNumber } : {}),
          };
          title = `Salary_Slip_${salaryPayPeriod.replace(/\s+/g, '_')}_${empName.replace(/\s+/g, '_')}`;
          summaryText = `Period: ${salaryPayPeriod} • Paid Days: ${salaryPresentDays}/${salaryWorkingDays}`;
          pdfBlob = await letterService.generateSalarySlip(payload);
          break;
        }

        case 'Termination Letter': {
          const payload = {
            employeeId: selectedEmployeeId,
            terminationDate: termDate,
            reason: termReason,
            noticePeriodDays: Number(termNoticePeriodDays) || 30,
            handoverTo: termHandoverTo,
          };
          title = `Termination_Letter_${empName.replace(/\s+/g, '_')}`;
          summaryText = `Date: ${termDate} • Reason: ${termReason}`;
          pdfBlob = await letterService.generateTerminationLetter(payload);
          break;
        }

        default:
          toast.error('Invalid letter type selected.');
          setLoading(false);
          return;
      }

      if (pdfBlob) {
        setGeneratedPdfBlob(pdfBlob);
        setGeneratedDocTitle(title);
        setGeneratedRefNo(refNumber);

        // Record into history
        const newHistoryItem = {
          id: `hist-${Date.now()}`,
          referenceNumber: refNumber,
          letterType: selectedLetterType,
          employeeId: selectedEmployeeId,
          employeeName: empName,
          designation: currentEmployee?.designation || offerDesignation || 'Staff',
          detailsSummary: summaryText,
          generatedAt: new Date().toISOString(),
        };

        setHistoryList(prev => [newHistoryItem, ...prev]);
        toast.success(`${selectedLetterType} generated successfully!`);
      } else {
        throw new Error('Received empty PDF document.');
      }
    } catch (err) {
      console.error('Failed to generate letter:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to generate PDF document.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Download PDF
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

  // Print PDF
  const handlePrint = () => {
    if (!generatedPdfUrl) return;
    const printWindow = window.open(generatedPdfUrl);
    if (printWindow) {
      printWindow.focus();
      printWindow.print();
    } else {
      toast.info('Pop-up blocked. Please allow pop-ups to print.');
    }
  };

  // Preview in new tab
  const handlePreview = () => {
    if (!generatedPdfUrl) return;
    window.open(generatedPdfUrl, '_blank');
  };

  // Delete an item from history
  const handleDeleteHistory = (id) => {
    setHistoryList(prev => prev.filter(item => item.id !== id));
    toast.success('Record deleted from history');
  };

  // Filtered History
  const filteredHistory = useMemo(() => {
    return historyList.filter(item => {
      const matchType = historyTypeFilter === 'ALL' || item.letterType === historyTypeFilter;
      const q = historySearch.toLowerCase().trim();
      const matchSearch = !q || 
        item.employeeName?.toLowerCase().includes(q) ||
        item.referenceNumber?.toLowerCase().includes(q) ||
        item.letterType?.toLowerCase().includes(q) ||
        item.detailsSummary?.toLowerCase().includes(q);

      return matchType && matchSearch;
    });
  }, [historyList, historyTypeFilter, historySearch]);

  // History Pagination
  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * historyLimit;
    return filteredHistory.slice(start, start + historyLimit);
  }, [filteredHistory, historyPage, historyLimit]);

  const totalHistoryPages = Math.ceil(filteredHistory.length / historyLimit) || 1;

  return (
    <div className="w-full flex flex-col gap-6 font-sans antialiased pb-12">
      
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 bg-[#1B4E8C]/10 text-[#1B4E8C] rounded-xl">
              <FileText size={22} strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-black text-[#1B4E8C] tracking-wide">
              Letters & Payroll Management
            </h1>
          </div>
          <div className="flex items-center text-xs font-semibold text-gray-500 pl-1">
            <Link to="/dashboard" className="hover:text-[#1B4E8C] transition-colors">Dashboard</Link>
            <ChevronRight size={13} className="mx-1 text-gray-400" />
            <span>HR Operations</span>
            <ChevronRight size={13} className="mx-1 text-gray-400" />
            <span className="text-[#1B4E8C] font-bold">Letters & Payroll</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#EEF4FA] p-1.5 rounded-2xl border border-gray-200/60 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('generate')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'generate'
                ? 'bg-[#1B4E8C] text-white shadow-md shadow-[#1B4E8C]/25'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileCheck size={16} />
            <span>Generate Document</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#1B4E8C] text-white shadow-md shadow-[#1B4E8C]/25'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <History size={16} />
            <span>History</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-white text-gray-700 shadow-xs'
            }`}>
              {historyList.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: GENERATE DOCUMENT */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          
          {/* Step 1: Letter Type Selection Grid */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  Step 1: Choose Document Type
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Select the official document template you wish to generate
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {LETTER_TYPES.map((type) => {
                const IconComponent = type.icon;
                const isSelected = selectedLetterType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setSelectedLetterType(type.id);
                      setGeneratedPdfBlob(null);
                      setGeneratedDocTitle('');
                      setGeneratedRefNo('');
                    }}
                    className={`flex flex-col text-left p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-[#1B4E8C] bg-gradient-to-br from-[#1B4E8C]/5 via-[#EEF4FA] to-white shadow-md shadow-[#1B4E8C]/10 scale-[1.02]'
                        : 'border-gray-100 bg-[#F9FBFE] hover:bg-[#EEF4FA] hover:border-gray-200'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[#1B4E8C] animate-pulse"></div>
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-white shadow-xs border ${type.color}`}>
                      <IconComponent size={20} strokeWidth={2} />
                    </div>
                    <span className="text-[13.5px] font-bold text-gray-800 leading-tight mb-1">
                      {type.name}
                    </span>
                    <span className="text-[11.5px] text-gray-500 leading-snug line-clamp-2">
                      {type.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2 & 3: Configuration Form & Employee Context */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Document Details Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
              <form onSubmit={handleGenerateDocument} className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-gray-800 mb-1">
                    Step 2: Configure {selectedLetterType}
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mb-5">
                    Fill in the required information for the generated official PDF.
                  </p>
                </div>

                {/* Employee Selector Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Select Target Employee <span className="text-red-500">*</span>
                  </label>
                  <select 
                    required
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm font-semibold text-gray-800 outline-none transition-all cursor-pointer"
                  >
                    <option value="">-- Choose Employee from Directory --</option>
                    {employees.map((emp) => {
                      const empId = emp.id || emp._id;
                      const empName = emp.fullName || emp.name || `Employee #${empId}`;
                      const desig = emp.designation ? ` • ${emp.designation}` : '';
                      const branch = emp.branchName || emp.branch?.name ? ` (${emp.branchName || emp.branch?.name})` : '';
                      return (
                        <option key={empId} value={empId}>
                          {empName}{desig}{branch}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Dynamic Configuration Fields */}
                <div className="pt-4 border-t border-gray-100">
                  
                  {/* 1. Offer Letter */}
                  {selectedLetterType === 'Offer Letter' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Designation *</label>
                        <input 
                          type="text"
                          required
                          value={offerDesignation}
                          onChange={(e) => setOfferDesignation(e.target.value)}
                          placeholder="e.g. Branch Operations Manager"
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Joining Date *</label>
                        <input 
                          type="date"
                          required
                          value={offerJoiningDate}
                          onChange={(e) => setOfferJoiningDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Annual CTC / Salary (₹) *</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                          <input 
                            type="number"
                            required
                            min="1000"
                            value={offerAnnualSalary}
                            onChange={(e) => setOfferAnnualSalary(e.target.value)}
                            placeholder="e.g. 600000"
                            className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-bold outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Confirmation Letter */}
                  {selectedLetterType === 'Confirmation Letter' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Probation Start Date *</label>
                        <input 
                          type="date"
                          required
                          value={probationStartDate}
                          onChange={(e) => setProbationStartDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Probation End Date *</label>
                        <input 
                          type="date"
                          required
                          value={probationEndDate}
                          onChange={(e) => setProbationEndDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Confirmation Date *</label>
                        <input 
                          type="date"
                          required
                          value={confirmationDate}
                          onChange={(e) => setConfirmationDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Notice Period (Days) *</label>
                        <input 
                          type="number"
                          required
                          min="0"
                          value={confirmationNoticePeriod}
                          onChange={(e) => setConfirmationNoticePeriod(e.target.value)}
                          placeholder="e.g. 60"
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. Performance Appraisal Letter */}
                  {selectedLetterType === 'Performance Letter' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Review Period *</label>
                        <input 
                          type="text"
                          required
                          value={perfReviewPeriod}
                          onChange={(e) => setPerfReviewPeriod(e.target.value)}
                          placeholder="e.g. FY 2025–26"
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Overall Rating *</label>
                        <input 
                          type="text"
                          required
                          value={perfOverallRating}
                          onChange={(e) => setPerfOverallRating(e.target.value)}
                          placeholder="e.g. 4.5 / 5.0 (Exceeds Expectations)"
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Manager Remarks *</label>
                        <textarea 
                          rows={2}
                          required
                          value={perfManagerComments}
                          onChange={(e) => setPerfManagerComments(e.target.value)}
                          placeholder="Enter evaluation remarks..."
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all resize-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Appraisal Outcome *</label>
                        <input 
                          type="text"
                          required
                          value={perfAppraisalOutcome}
                          onChange={(e) => setPerfAppraisalOutcome(e.target.value)}
                          placeholder="e.g. Eligible for annual increment of 15% and promotion."
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* 4. Promotion Letter */}
                  {selectedLetterType === 'Promotion Letter' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Promoted Role / Designation *</label>
                        <input 
                          type="text"
                          required
                          value={promotedNewRole}
                          onChange={(e) => setPromotedNewRole(e.target.value)}
                          placeholder="e.g. Senior Branch Manager"
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Effective Date *</label>
                        <input 
                          type="date"
                          required
                          value={promotionEffectiveDate}
                          onChange={(e) => setPromotionEffectiveDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* 5. Transfer Letter */}
                  {selectedLetterType === 'Transfer Letter' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Transfer To Branch *</label>
                        <select 
                          required
                          value={transferToBranchId}
                          onChange={(e) => setTransferToBranchId(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm font-semibold text-gray-800 outline-none transition-all cursor-pointer"
                        >
                          <option value="">-- Choose Target Branch --</option>
                          {branches.map((b) => (
                            <option key={b.id || b._id} value={b.id || b._id}>
                              {b.branchName || b.name || `Branch #${b.id || b._id}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Effective Date *</label>
                        <input 
                          type="date"
                          required
                          value={transferEffectiveDate}
                          onChange={(e) => setTransferEffectiveDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Reporting Date *</label>
                        <input 
                          type="date"
                          required
                          value={transferReportingDate}
                          onChange={(e) => setTransferReportingDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* 6. Salary Increment Letter */}
                  {selectedLetterType === 'Salary Increment' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Review Period *</label>
                        <input 
                          type="text"
                          required
                          value={incrReviewPeriod}
                          onChange={(e) => setIncrReviewPeriod(e.target.value)}
                          placeholder="e.g. FY 2025–26"
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Effective Date *</label>
                        <input 
                          type="date"
                          required
                          value={incrEffectiveDate}
                          onChange={(e) => setIncrEffectiveDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Increment (%) *</label>
                        <input 
                          type="number"
                          required
                          min="1"
                          max="100"
                          value={incrPercentage}
                          onChange={(e) => {
                            const pct = Number(e.target.value);
                            setIncrPercentage(e.target.value);
                            if (incrCurrentCtc && pct) {
                              const cur = Number(incrCurrentCtc);
                              setIncrRevisedCtc(Math.round(cur + (cur * pct) / 100).toString());
                            }
                          }}
                          placeholder="e.g. 15"
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Current CTC (₹) *</label>
                        <input 
                          type="number"
                          required
                          min="1000"
                          value={incrCurrentCtc}
                          onChange={(e) => {
                            const cur = Number(e.target.value);
                            setIncrCurrentCtc(e.target.value);
                            if (cur && incrPercentage) {
                              const pct = Number(incrPercentage);
                              setIncrRevisedCtc(Math.round(cur + (cur * pct) / 100).toString());
                            }
                          }}
                          placeholder="e.g. 600000"
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Revised Annual CTC (₹) *</label>
                        <input 
                          type="number"
                          required
                          min="1000"
                          value={incrRevisedCtc}
                          onChange={(e) => setIncrRevisedCtc(e.target.value)}
                          placeholder="e.g. 690000"
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-[#1B4E8C] font-black outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* 7. Salary Slip */}
                  {selectedLetterType === 'Salary Slip' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Salary Period (Month & Year) *</label>
                        <select 
                          required
                          value={salaryPayPeriod}
                          onChange={(e) => setSalaryPayPeriod(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm font-semibold text-gray-800 outline-none transition-all cursor-pointer"
                        >
                          {monthYearOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Pay Date *</label>
                        <input 
                          type="date"
                          required
                          value={salaryPayDate}
                          onChange={(e) => setSalaryPayDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Working Days *</label>
                        <input 
                          type="number"
                          required
                          min="1"
                          max="31"
                          value={salaryWorkingDays}
                          onChange={(e) => setSalaryWorkingDays(e.target.value)}
                          placeholder="e.g. 31"
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Present / Paid Days *</label>
                        <input 
                          type="number"
                          required
                          min="0"
                          max="31"
                          value={salaryPresentDays}
                          onChange={(e) => setSalaryPresentDays(e.target.value)}
                          placeholder="e.g. 29"
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">LOP (Loss of Pay) Days</label>
                        <input 
                          type="number"
                          min="0"
                          value={salaryLopDays}
                          onChange={(e) => setSalaryLopDays(e.target.value)}
                          placeholder="e.g. 2"
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Account Number (Optional)</label>
                        <input 
                          type="text"
                          value={salaryAccountNumber}
                          onChange={(e) => setSalaryAccountNumber(e.target.value)}
                          placeholder="e.g. 5010023487654321"
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* 8. Termination Letter */}
                  {selectedLetterType === 'Termination Letter' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Termination Date *</label>
                        <input 
                          type="date"
                          required
                          value={termDate}
                          onChange={(e) => setTermDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Notice Period (Days) *</label>
                        <input 
                          type="number"
                          required
                          min="0"
                          value={termNoticePeriodDays}
                          onChange={(e) => setTermNoticePeriodDays(e.target.value)}
                          placeholder="e.g. 30"
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Reason for Termination *</label>
                        <input 
                          type="text"
                          required
                          value={termReason}
                          onChange={(e) => setTermReason(e.target.value)}
                          placeholder="e.g. Resignation / Personal Reasons"
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Handover Responsibilities To *</label>
                        <input 
                          type="text"
                          required
                          value={termHandoverTo}
                          onChange={(e) => setTermHandoverTo(e.target.value)}
                          placeholder="e.g. Mr. Amit Verma, Senior Branch Officer"
                          className="w-full px-4 py-3 rounded-xl bg-[#EEF4FA] border border-transparent focus:border-[#1B4E8C] focus:bg-white focus:ring-4 focus:ring-[#1B4E8C]/10 text-sm text-gray-800 font-medium outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                </div>

                {/* Submit Action */}
                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={loading || !selectedEmployeeId}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#1B4E8C] hover:bg-[#153e70] active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-[#1B4E8C]/25 hover:shadow-xl transition-all flex items-center justify-center gap-2.5 text-sm tracking-wide cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Generating Official PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck size={18} />
                        <span>Generate {selectedLetterType}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

            {/* Right 1 Col: Selected Employee Overview & PDF Status */}
            <div className="space-y-6">
              
              {/* Employee Summary Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Employee Summary
                </h3>

                {currentEmployee ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100">
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#1B4E8C] to-[#3B82F6] flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
                        {(currentEmployee.fullName || currentEmployee.name || 'E').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base font-bold text-gray-900 truncate">
                          {currentEmployee.fullName || currentEmployee.name}
                        </h4>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#1B4E8C] border border-blue-200/60 mt-0.5">
                          {currentEmployee.designation || 'Staff Member'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center gap-1.5 text-gray-400 font-medium">
                          <Building2 size={14} /> Branch
                        </span>
                        <span className="font-bold text-gray-800 text-right">
                          {currentEmployee.branchName || currentEmployee.branch?.name || 'Main Branch'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center gap-1.5 text-gray-400 font-medium">
                          <Calendar size={14} /> Joining Date
                        </span>
                        <span className="font-bold text-gray-800">
                          {currentEmployee.joiningDate ? new Date(currentEmployee.joiningDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center gap-1.5 text-gray-400 font-medium">
                          <IndianRupee size={14} /> Current CTC
                        </span>
                        <span className="font-bold text-gray-800">
                          {currentEmployee.salary ? `₹${Number(currentEmployee.salary).toLocaleString()}/yr` : '—'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center gap-1.5 text-gray-400 font-medium">
                          <User size={14} /> Employee Code
                        </span>
                        <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                          {currentEmployee.employeeCode || currentEmployee.code || (currentEmployee.id || currentEmployee._id)?.slice(-6).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400 text-xs flex flex-col items-center">
                    <User size={32} strokeWidth={1.5} className="mb-2 text-gray-300" />
                    <span>Select an employee above to preview details.</span>
                  </div>
                )}
              </div>

              {/* Live PDF Ready Result Card */}
              {generatedPdfBlob && (
                <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border-2 border-emerald-300/80 rounded-2xl p-5 shadow-lg shadow-emerald-500/10 space-y-4 animate-in fade-in zoom-in duration-300">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-md shrink-0">
                      <CheckCircle2 size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-black tracking-wider uppercase text-emerald-700 block">
                        DOCUMENT READY
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 truncate">
                        {generatedDocTitle}.pdf
                      </h4>
                      <p className="text-[11.5px] font-mono text-gray-500 mt-0.5">
                        Ref: {generatedRefNo}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60">
                    <button 
                      type="button" 
                      onClick={handlePreview}
                      className="py-2.5 px-3 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Eye size={14} />
                      <span>Preview</span>
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={handlePrint}
                      className="py-2.5 px-3 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Printer size={14} />
                      <span>Print</span>
                    </button>

                    <button 
                      type="button" 
                      onClick={handleDownload}
                      className="py-2.5 px-3 rounded-xl bg-[#1B4E8C] hover:bg-[#153e70] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-[#1B4E8C]/20 cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* TAB 2: DOCUMENT HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          
          {/* History Search & Filter Bar */}
          <div className="p-5 border-b border-gray-100 bg-[#F9FBFE] flex flex-col sm:flex-row items-center justify-between gap-3.5">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                value={historySearch}
                onChange={(e) => {
                  setHistorySearch(e.target.value);
                  setHistoryPage(1);
                }}
                placeholder="Search employee name or ref no..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1B4E8C] focus:ring-4 focus:ring-[#1B4E8C]/10 shadow-xs transition-all"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <select
                value={historyTypeFilter}
                onChange={(e) => {
                  setHistoryTypeFilter(e.target.value);
                  setHistoryPage(1);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-[#1B4E8C] shadow-xs cursor-pointer"
              >
                <option value="ALL">All Document Types</option>
                {LETTER_TYPES.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setHistorySearch('');
                  setHistoryTypeFilter('ALL');
                }}
                className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-600 shadow-xs transition-colors cursor-pointer"
                title="Reset Filters"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {/* Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-[#F4F8FD] text-gray-600 text-[11px] uppercase tracking-wider font-bold border-b border-gray-200/80">
                <tr>
                  <th className="py-4 px-5 text-center w-16">Sr.No.</th>
                  <th className="py-4 px-5">Ref Number</th>
                  <th className="py-4 px-5">Employee</th>
                  <th className="py-4 px-5">Document Type</th>
                  <th className="py-4 px-5">Details Summary</th>
                  <th className="py-4 px-5">Generated On</th>
                  <th className="py-4 px-5 text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {paginatedHistory.length > 0 ? (
                  paginatedHistory.map((item, index) => {
                    const sr = (historyPage - 1) * historyLimit + index + 1;
                    const letterTypeConfig = LETTER_TYPES.find(l => l.id === item.letterType);

                    return (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-5 text-center text-gray-500 font-bold">
                          {sr}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-mono text-[11px] font-bold text-[#1B4E8C] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                            {item.referenceNumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-bold text-gray-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#1B4E8C]/10 text-[#1B4E8C] flex items-center justify-center font-bold text-xs shrink-0">
                              {(item.employeeName || 'E').slice(0, 1)}
                            </div>
                            <div>
                              <div>{item.employeeName}</div>
                              <span className="text-[10.5px] font-medium text-gray-400">
                                {item.designation || 'Staff'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${letterTypeConfig?.color || 'bg-gray-100 text-gray-700'}`}>
                            {item.letterType}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-gray-600 max-w-xs truncate font-medium">
                          {item.detailsSummary}
                        </td>
                        <td className="py-3.5 px-5 text-gray-500 font-medium">
                          {new Date(item.generatedAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDeleteHistory(item.id)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-gray-400">
                      <FileText size={36} className="mx-auto mb-2 text-gray-300 stroke-1" />
                      <p className="text-sm font-semibold text-gray-500">No document history found</p>
                      <p className="text-xs text-gray-400 mt-1">Generated documents will appear here for record-keeping.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalHistoryPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-[#F9FBFE]">
              <span>
                Showing {((historyPage - 1) * historyLimit) + 1} to {Math.min(historyPage * historyLimit, filteredHistory.length)} of {filteredHistory.length} records
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={historyPage <= 1}
                  onClick={() => setHistoryPage(p => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white font-bold hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <span className="font-bold text-gray-800 px-2">
                  {historyPage} / {totalHistoryPages}
                </span>
                <button
                  type="button"
                  disabled={historyPage >= totalHistoryPages}
                  onClick={() => setHistoryPage(p => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white font-bold hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default LettersAndPayroll;
