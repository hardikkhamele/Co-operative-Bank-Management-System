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
  Sparkles, 
  Building2, 
  Calendar, 
  IndianRupee, 
  User, 
  History, 
  FileCheck, 
  RefreshCw, 
  Plus,
  Layers,
  FileSpreadsheet
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
    badgeColor: 'bg-blue-50 text-[#225091] border-blue-200/60'
  },
  { 
    id: 'Confirmation Letter', 
    name: 'Confirmation Letter', 
    code: 'CL',
    icon: ShieldCheck,
    description: 'Probation completion & confirmation',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
  },
  { 
    id: 'Salary Slip', 
    name: 'Salary Slip', 
    code: 'SS',
    icon: Receipt,
    description: 'Monthly payroll & earnings statement',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200/60'
  },
  { 
    id: 'Salary Increment', 
    name: 'Salary Increment', 
    code: 'SI',
    icon: TrendingUp,
    description: 'Compensation & CTC appraisal letter',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/60'
  },
  { 
    id: 'Promotion Letter', 
    name: 'Promotion Letter', 
    code: 'PL',
    icon: Briefcase,
    description: 'Designation & role upgrade',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200/60'
  },
  { 
    id: 'Transfer Letter', 
    name: 'Transfer Letter', 
    code: 'TL',
    icon: ArrowRightLeft,
    description: 'Branch relocation & movement',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
  },
  { 
    id: 'Performance Letter', 
    name: 'Performance Appraisal', 
    code: 'PA',
    icon: Sparkles,
    description: 'Annual performance evaluation',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200/60'
  },
  { 
    id: 'Termination Letter', 
    name: 'Termination Letter', 
    code: 'TM',
    icon: Trash2,
    description: 'Relieving & exit documentation',
    badgeColor: 'bg-red-50 text-red-700 border-red-200/60'
  }
];

const INITIAL_HISTORY = [
  {
    id: 'HIST-001',
    letterType: 'Offer Letter',
    employeeName: 'Aman Sharma',
    referenceNumber: 'ADV/HR/OL/2026/0142',
    designation: 'Senior Loan Officer',
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    detailsSummary: 'Designation: Senior Loan Officer | CTC: ₹4,50,000/yr'
  },
  {
    id: 'HIST-002',
    letterType: 'Salary Slip',
    employeeName: 'Lala Patil',
    referenceNumber: 'ADV/PAY/SS/2026/0589',
    designation: 'Branch Manager',
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    detailsSummary: 'Month: July 2026 | Net Payable: ₹58,200'
  },
  {
    id: 'HIST-003',
    letterType: 'Confirmation Letter',
    employeeName: 'Priya Deshmukh',
    referenceNumber: 'ADV/HR/CL/2026/0091',
    designation: 'Cashier / Teller',
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    detailsSummary: 'Confirmation: 01 Aug 2026 | Notice: 60 Days'
  },
  {
    id: 'HIST-004',
    letterType: 'Salary Increment',
    employeeName: 'Rahul Verma',
    referenceNumber: 'ADV/HR/SI/2026/0034',
    designation: 'Field Recovery Officer',
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    detailsSummary: 'Increment: 15% | Revised CTC: ₹3,80,000/yr'
  }
];

const LettersAndPayroll = () => {
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' | 'history'
  const [selectedLetterType, setSelectedLetterType] = useState('Offer Letter');
  const [loading, setLoading] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  
  // Selected Employee Context
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [currentEmployee, setCurrentEmployee] = useState(null);

  // Result state
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState('');
  const [generatedDocTitle, setGeneratedDocTitle] = useState('');
  const [generatedRefNo, setGeneratedRefNo] = useState('');

  // History State
  const [historyList, setHistoryList] = useState(() => {
    try {
      const saved = localStorage.getItem('advita_letters_history');
      return saved ? JSON.parse(saved) : INITIAL_HISTORY;
    } catch {
      return INITIAL_HISTORY;
    }
  });
  const [historySearch, setHistorySearch] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('ALL');
  const [historyPage, setHistoryPage] = useState(1);
  const historyLimit = 10;

  // Form Fields - Offer Letter
  const [offerDesignation, setOfferDesignation] = useState('');
  const [offerJoiningDate, setOfferJoiningDate] = useState('');
  const [offerAnnualSalary, setOfferAnnualSalary] = useState('');

  // Form Fields - Confirmation Letter
  const [probationStartDate, setProbationStartDate] = useState('');
  const [probationEndDate, setProbationEndDate] = useState('');
  const [confirmationDate, setConfirmationDate] = useState('');
  const [confirmationNoticePeriod, setConfirmationNoticePeriod] = useState('60');

  // Form Fields - Performance Appraisal
  const [perfReviewPeriod, setPerfReviewPeriod] = useState('FY 2025–26');
  const [perfOverallRating, setPerfOverallRating] = useState('4.5 / 5.0 (Exceeds Expectations)');
  const [perfManagerComments, setPerfManagerComments] = useState('');

  // Form Fields - Salary Increment
  const [incCurrentSalary, setIncCurrentSalary] = useState('');
  const [incNewSalary, setIncNewSalary] = useState('');
  const [incEffectiveDate, setIncEffectiveDate] = useState('');
  const [incPercentage, setIncPercentage] = useState('10');

  // Form Fields - Promotion Letter
  const [promoCurrentDesignation, setPromoCurrentDesignation] = useState('');
  const [promoNewDesignation, setPromoNewDesignation] = useState('');
  const [promoEffectiveDate, setPromoEffectiveDate] = useState('');
  const [promoRevisedSalary, setPromoRevisedSalary] = useState('');

  // Form Fields - Transfer Letter
  const [transferCurrentBranch, setTransferCurrentBranch] = useState('');
  const [transferNewBranch, setTransferNewBranch] = useState('');
  const [transferEffectiveDate, setTransferEffectiveDate] = useState('');
  const [transferRelocationSupport, setTransferRelocationSupport] = useState('Standard Bank Relocation Allowance as per Society Norms');

  // Form Fields - Salary Slip
  const [salaryMonth, setSalaryMonth] = useState('August');
  const [salaryYear, setSalaryYear] = useState('2026');
  const [salaryBasic, setSalaryBasic] = useState('25000');
  const [salaryHra, setSalaryHra] = useState('10000');
  const [salaryConveyance, setSalaryConveyance] = useState('3000');
  const [salarySpecialAllowance, setSalarySpecialAllowance] = useState('5000');
  const [salaryPfDeduction, setSalaryPfDeduction] = useState('1800');
  const [salaryPtDeduction, setSalaryPtDeduction] = useState('200');
  const [salaryTdsDeduction, setSalaryTdsDeduction] = useState('0');
  const [salaryPresentDays, setSalaryPresentDays] = useState('30');
  const [salaryLopDays, setSalaryLopDays] = useState('0');
  const [salaryAccountNumber, setSalaryAccountNumber] = useState('');

  // Form Fields - Termination Letter
  const [termDate, setTermDate] = useState('');
  const [termNoticePeriodDays, setTermNoticePeriodDays] = useState('30');
  const [termReason, setTermReason] = useState('Resignation / Career Progression');
  const [termHandoverTo, setTermHandoverTo] = useState('Branch Operations Lead');

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('advita_letters_history', JSON.stringify(historyList));
    } catch (e) {
      console.error('Failed to persist history', e);
    }
  }, [historyList]);

  // Clean blob url on unmount
  useEffect(() => {
    return () => {
      if (generatedPdfUrl) URL.revokeObjectURL(generatedPdfUrl);
    };
  }, [generatedPdfUrl]);

  // Fetch initial employees & branches
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setFetchingEmployees(true);
        const [empRes, branchRes] = await Promise.allSettled([
          employeeService.list({ limit: 150 }),
          branchService.list({ limit: 100 })
        ]);

        if (empRes.status === 'fulfilled' && empRes.value && empRes.value.success) {
          const empList = Array.isArray(empRes.value.data)
            ? empRes.value.data
            : empRes.value.data?.items || empRes.value.data?.employees || [];
          setEmployees(empList);
          if (empList.length > 0) {
            setSelectedEmployeeId(empList[0].id || empList[0]._id);
          }
        }

        if (branchRes.status === 'fulfilled' && branchRes.value && branchRes.value.success) {
          const bList = Array.isArray(branchRes.value.data)
            ? branchRes.value.data
            : branchRes.value.data?.items || branchRes.value.data?.branches || [];
          setBranches(bList);
        }
      } catch (err) {
        console.error('Failed to load employee/branch data:', err);
      } finally {
        setFetchingEmployees(false);
      }
    };
    loadInitialData();
  }, []);

  // Update current employee details when selection changes
  useEffect(() => {
    if (!selectedEmployeeId || employees.length === 0) {
      setCurrentEmployee(null);
      return;
    }
    const emp = employees.find(e => (e.id || e._id) === selectedEmployeeId);
    if (emp) {
      setCurrentEmployee(emp);
      
      // Auto fill form fields
      setOfferDesignation(emp.designation || 'Staff Associate');
      setPromoCurrentDesignation(emp.designation || 'Staff Associate');
      setTransferCurrentBranch(emp.branchName || emp.branch?.name || 'Main Branch');
      if (emp.salary) {
        setOfferAnnualSalary(String(emp.salary));
        setIncCurrentSalary(String(emp.salary));
        const estimatedNew = Math.round(Number(emp.salary) * 1.10);
        setIncNewSalary(String(estimatedNew));
        setPromoRevisedSalary(String(estimatedNew));
      }
      if (emp.joiningDate) {
        try {
          const jd = new Date(emp.joiningDate).toISOString().split('T')[0];
          setOfferJoiningDate(jd);
          setProbationStartDate(jd);
        } catch {
          // ignore
        }
      }
    }
  }, [selectedEmployeeId, employees]);

  // Calculate gross, deductions & net salary for slip
  const salaryCalculations = useMemo(() => {
    const basic = parseFloat(salaryBasic) || 0;
    const hra = parseFloat(salaryHra) || 0;
    const conv = parseFloat(salaryConveyance) || 0;
    const special = parseFloat(salarySpecialAllowance) || 0;
    const gross = basic + hra + conv + special;

    const pf = parseFloat(salaryPfDeduction) || 0;
    const pt = parseFloat(salaryPtDeduction) || 0;
    const tds = parseFloat(salaryTdsDeduction) || 0;
    const deductions = pf + pt + tds;

    const net = Math.max(0, gross - deductions);
    return { gross, deductions, net };
  }, [
    salaryBasic, salaryHra, salaryConveyance, salarySpecialAllowance,
    salaryPfDeduction, salaryPtDeduction, salaryTdsDeduction
  ]);

  // Handle Generate Letter
  const handleGenerateDocument = async (e) => {
    if (e) e.preventDefault();

    if (!selectedEmployeeId) {
      toast.warning('Please select an employee first.');
      return;
    }

    try {
      setLoading(true);
      setGeneratedPdfBlob(null);

      let payload = {
        letterType: selectedLetterType,
        employeeId: selectedEmployeeId,
      };

      const empName = currentEmployee?.fullName || currentEmployee?.name || 'Employee';
      const refCode = `ADV/${selectedLetterType.slice(0, 2).toUpperCase()}/${Date.now().toString().slice(-4)}`;
      let summaryText = '';

      switch (selectedLetterType) {
        case 'Offer Letter':
          payload = {
            ...payload,
            designation: offerDesignation,
            joiningDate: offerJoiningDate,
            annualSalary: Number(offerAnnualSalary) || 0
          };
          summaryText = `Designation: ${offerDesignation} | CTC: ₹${Number(offerAnnualSalary).toLocaleString()}/yr`;
          break;

        case 'Confirmation Letter':
          payload = {
            ...payload,
            probationStartDate,
            probationEndDate,
            confirmationDate,
            noticePeriodDays: Number(confirmationNoticePeriod) || 60
          };
          summaryText = `Confirmation: ${confirmationDate} | Notice: ${confirmationNoticePeriod} Days`;
          break;

        case 'Performance Letter':
          payload = {
            ...payload,
            reviewPeriod: perfReviewPeriod,
            overallRating: perfOverallRating,
            managerComments: perfManagerComments
          };
          summaryText = `Period: ${perfReviewPeriod} | Rating: ${perfOverallRating}`;
          break;

        case 'Salary Increment':
          payload = {
            ...payload,
            currentSalary: Number(incCurrentSalary) || 0,
            newSalary: Number(incNewSalary) || 0,
            effectiveDate: incEffectiveDate,
            incrementPercentage: Number(incPercentage) || 0
          };
          summaryText = `Increment: ${incPercentage}% | Revised CTC: ₹${Number(incNewSalary).toLocaleString()}/yr`;
          break;

        case 'Promotion Letter':
          payload = {
            ...payload,
            currentDesignation: promoCurrentDesignation,
            newDesignation: promoNewDesignation,
            effectiveDate: promoEffectiveDate,
            revisedSalary: Number(promoRevisedSalary) || 0
          };
          summaryText = `Promoted: ${promoNewDesignation} | Revised CTC: ₹${Number(promoRevisedSalary).toLocaleString()}/yr`;
          break;

        case 'Transfer Letter':
          payload = {
            ...payload,
            currentBranch: transferCurrentBranch,
            newBranch: transferNewBranch,
            effectiveDate: transferEffectiveDate,
            relocationSupport: transferRelocationSupport
          };
          summaryText = `Transferred: ${transferNewBranch} | Effective: ${transferEffectiveDate}`;
          break;

        case 'Salary Slip':
          payload = {
            ...payload,
            month: salaryMonth,
            year: Number(salaryYear),
            basicSalary: Number(salaryBasic),
            hra: Number(salaryHra),
            conveyance: Number(salaryConveyance),
            specialAllowance: Number(salarySpecialAllowance),
            pfDeduction: Number(salaryPfDeduction),
            ptDeduction: Number(salaryPtDeduction),
            tdsDeduction: Number(salaryTdsDeduction),
            presentDays: Number(salaryPresentDays),
            lopDays: Number(salaryLopDays),
            accountNumber: salaryAccountNumber
          };
          summaryText = `Month: ${salaryMonth} ${salaryYear} | Net: ₹${salaryCalculations.net.toLocaleString()}`;
          break;

        case 'Termination Letter':
          payload = {
            ...payload,
            terminationDate: termDate,
            noticePeriodDays: Number(termNoticePeriodDays),
            reason: termReason,
            handoverTo: termHandoverTo
          };
          summaryText = `Exit Date: ${termDate} | Handover: ${termHandoverTo}`;
          break;

        default:
          break;
      }

      const response = await letterService.generate(payload);
      let pdfBlob;
      if (response instanceof Blob) {
        pdfBlob = response;
      } else if (response.data instanceof Blob) {
        pdfBlob = response.data;
      } else {
        pdfBlob = new Blob([response.data || response], { type: 'application/pdf' });
      }

      setGeneratedPdfBlob(pdfBlob);
      const url = URL.createObjectURL(pdfBlob);
      setGeneratedPdfUrl(url);

      const docTitle = `${selectedLetterType.replace(/\s+/g, '_')}_${empName.replace(/\s+/g, '_')}`;
      setGeneratedDocTitle(docTitle);
      setGeneratedRefNo(refCode);

      const newHistoryItem = {
        id: `HIST-${Date.now().toString().slice(-4)}`,
        letterType: selectedLetterType,
        employeeName: empName,
        referenceNumber: refCode,
        designation: currentEmployee?.designation || 'Staff',
        generatedAt: new Date().toISOString(),
        detailsSummary: summaryText
      };
      setHistoryList(prev => [newHistoryItem, ...prev]);

      toast.success(`${selectedLetterType} generated successfully!`);
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
    <div className="w-full flex flex-col gap-5 font-sans antialiased pb-16">
      
      {/* 1. Header Card - Exact Match with Employees.jsx */}
      <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#225091] m-0">
            Letters & Payroll
          </h1>
          <div className="flex items-center text-sm font-medium text-gray-500 mt-1">
            <Link to="/dashboard" className="hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <ChevronRight size={15} className="mx-1 text-gray-400" />
            <span className="text-gray-600">HR Management</span>
            <ChevronRight size={15} className="mx-1 text-gray-400" />
            <span className="text-[#225091] font-semibold">Letters & Payroll</span>
          </div>
        </div>

        {/* Tab Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('generate')}
            className={`px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm flex items-center gap-2 text-sm shrink-0 cursor-pointer ${
              activeTab === 'generate'
                ? 'bg-[#225091] text-white hover:bg-[#1b427b]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileCheck size={16} />
            <span>Generate Document</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm flex items-center gap-2 text-sm shrink-0 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#225091] text-white hover:bg-[#1b427b]'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <History size={16} />
            <span>History ({historyList.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Top Stats Overview (Matching Employees.jsx 4 KPI Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4.5 border border-gray-100 shadow-xs flex flex-col items-center justify-center transition-all hover:shadow-md">
          <div className="flex items-center gap-2 text-[#225091] mb-1">
            <Layers size={18} />
            <span className="text-[26px] font-bold leading-none font-heading">8</span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
            DOCUMENT TEMPLATES
          </span>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-gray-100 shadow-xs flex flex-col items-center justify-center transition-all hover:shadow-md">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <User size={18} />
            <span className="text-[26px] font-bold leading-none font-heading">{employees.length}</span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
            STAFF AVAILABLE
          </span>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-gray-100 shadow-xs flex flex-col items-center justify-center transition-all hover:shadow-md">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <Receipt size={18} />
            <span className="text-[26px] font-bold leading-none font-heading">
              {historyList.filter(h => h.letterType === 'Salary Slip').length}
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
            SALARY SLIPS ISSUED
          </span>
        </div>

        <div className="bg-white rounded-xl p-4.5 border border-gray-100 shadow-xs flex flex-col items-center justify-center transition-all hover:shadow-md">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <FileSpreadsheet size={18} />
            <span className="text-[26px] font-bold leading-none font-heading">{historyList.length}</span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
            TOTAL GENERATED
          </span>
        </div>
      </div>

      {/* TAB 1: GENERATE DOCUMENT */}
      {activeTab === 'generate' && (
        <div className="space-y-5">
          
          {/* Step 1: Letter Type Selection Grid */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100">
            <div className="mb-3.5">
              <h2 className="text-base font-bold text-gray-900 m-0">
                Step 1: Choose Document Type
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Select the official document template you wish to generate
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                    className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-[#225091] ring-2 ring-[#225091]/15 bg-blue-50/20 shadow-xs'
                        : 'border-gray-100 hover:border-gray-200 bg-white hover:bg-slate-50/70'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#225091]"></div>
                    )}
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 bg-white shadow-2xs border border-gray-100 text-[#225091]">
                      <IconComponent size={16} />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 mb-0.5">
                      {type.name}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium line-clamp-2">
                      {type.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2 & 3: Configuration Form & Employee Context */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Left 2 Cols: Document Details Form */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-gray-100 p-5 flex flex-col justify-between">
              <form onSubmit={handleGenerateDocument} className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-0.5">
                    Step 2: Configure {selectedLetterType}
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mb-3">
                    Fill in the required details to generate the official document.
                  </p>
                </div>

                {/* Employee Selector Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Select Target Employee <span className="text-red-500">*</span>
                  </label>
                  <select 
                    required
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium cursor-pointer"
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
                <div className="pt-3 border-t border-gray-100">
                  
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
                          placeholder="e.g. Senior Loan Officer"
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Joining Date *</label>
                        <input 
                          type="date"
                          required
                          value={offerJoiningDate}
                          onChange={(e) => setOfferJoiningDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Annual CTC / Salary (₹) *</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                          <input 
                            type="number"
                            required
                            min="1000"
                            value={offerAnnualSalary}
                            onChange={(e) => setOfferAnnualSalary(e.target.value)}
                            placeholder="e.g. 450000"
                            className="w-full pl-8 pr-4 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-semibold"
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
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Probation End Date *</label>
                        <input 
                          type="date"
                          required
                          value={probationEndDate}
                          onChange={(e) => setProbationEndDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Confirmation Date *</label>
                        <input 
                          type="date"
                          required
                          value={confirmationDate}
                          onChange={(e) => setConfirmationDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
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
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
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
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
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
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
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
                          className="w-full px-3.5 py-2 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* 4. Salary Increment */}
                  {selectedLetterType === 'Salary Increment' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Current CTC (₹) *</label>
                        <input 
                          type="number"
                          required
                          value={incCurrentSalary}
                          onChange={(e) => setIncCurrentSalary(e.target.value)}
                          placeholder="e.g. 350000"
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Revised New CTC (₹) *</label>
                        <input 
                          type="number"
                          required
                          value={incNewSalary}
                          onChange={(e) => setIncNewSalary(e.target.value)}
                          placeholder="e.g. 400000"
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Increment Percentage (%)</label>
                        <input 
                          type="number"
                          value={incPercentage}
                          onChange={(e) => setIncPercentage(e.target.value)}
                          placeholder="e.g. 15"
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Effective Date *</label>
                        <input 
                          type="date"
                          required
                          value={incEffectiveDate}
                          onChange={(e) => setIncEffectiveDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                    </div>
                  )}

                  {/* 5. Promotion Letter */}
                  {selectedLetterType === 'Promotion Letter' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Current Role *</label>
                        <input 
                          type="text"
                          required
                          value={promoCurrentDesignation}
                          onChange={(e) => setPromoCurrentDesignation(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Promoted To (New Role) *</label>
                        <input 
                          type="text"
                          required
                          value={promoNewDesignation}
                          onChange={(e) => setPromoNewDesignation(e.target.value)}
                          placeholder="e.g. Branch Manager"
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Revised CTC (₹) *</label>
                        <input 
                          type="number"
                          required
                          value={promoRevisedSalary}
                          onChange={(e) => setPromoRevisedSalary(e.target.value)}
                          placeholder="e.g. 550000"
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Effective Date *</label>
                        <input 
                          type="date"
                          required
                          value={promoEffectiveDate}
                          onChange={(e) => setPromoEffectiveDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                    </div>
                  )}

                  {/* 6. Transfer Letter */}
                  {selectedLetterType === 'Transfer Letter' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Current Branch *</label>
                        <input 
                          type="text"
                          required
                          value={transferCurrentBranch}
                          onChange={(e) => setTransferCurrentBranch(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Transferred Branch *</label>
                        <select
                          required
                          value={transferNewBranch}
                          onChange={(e) => setTransferNewBranch(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium cursor-pointer"
                        >
                          <option value="">-- Choose Branch --</option>
                          {branches.map(b => (
                            <option key={b._id || b.id} value={b.name}>
                              {b.name} ({b.city || 'Branch'})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Effective Transfer Date *</label>
                        <input 
                          type="date"
                          required
                          value={transferEffectiveDate}
                          onChange={(e) => setTransferEffectiveDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Relocation Support</label>
                        <input 
                          type="text"
                          value={transferRelocationSupport}
                          onChange={(e) => setTransferRelocationSupport(e.target.value)}
                          placeholder="Standard Allowance"
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                    </div>
                  )}

                  {/* 7. Salary Slip */}
                  {selectedLetterType === 'Salary Slip' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Salary Month *</label>
                        <select
                          value={salaryMonth}
                          onChange={(e) => setSalaryMonth(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        >
                          {MONTHS_LIST.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Year *</label>
                        <input 
                          type="number"
                          value={salaryYear}
                          onChange={(e) => setSalaryYear(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Basic Salary (₹) *</label>
                        <input 
                          type="number"
                          value={salaryBasic}
                          onChange={(e) => setSalaryBasic(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">HRA (₹)</label>
                        <input 
                          type="number"
                          value={salaryHra}
                          onChange={(e) => setSalaryHra(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Conveyance (₹)</label>
                        <input 
                          type="number"
                          value={salaryConveyance}
                          onChange={(e) => setSalaryConveyance(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Special Allowance (₹)</label>
                        <input 
                          type="number"
                          value={salarySpecialAllowance}
                          onChange={(e) => setSalarySpecialAllowance(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">PF Deduction (₹)</label>
                        <input 
                          type="number"
                          value={salaryPfDeduction}
                          onChange={(e) => setSalaryPfDeduction(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">PT Deduction (₹)</label>
                        <input 
                          type="number"
                          value={salaryPtDeduction}
                          onChange={(e) => setSalaryPtDeduction(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Present Days (0-31)</label>
                        <input 
                          type="number"
                          value={salaryPresentDays}
                          onChange={(e) => setSalaryPresentDays(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
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
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Notice Period (Days) *</label>
                        <input 
                          type="number"
                          required
                          value={termNoticePeriodDays}
                          onChange={(e) => setTermNoticePeriodDays(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Reason for Termination *</label>
                        <input 
                          type="text"
                          required
                          value={termReason}
                          onChange={(e) => setTermReason(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-medium"
                        />
                      </div>
                    </div>
                  )}

                </div>

                {/* Submit Action */}
                <div className="pt-3 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={loading || !selectedEmployeeId}
                    className="bg-[#225091] hover:bg-[#1b427b] disabled:opacity-50 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-sm flex items-center justify-center gap-2 text-sm cursor-pointer shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Generating Official PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck size={16} />
                        <span>Generate {selectedLetterType}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

            {/* Right 1 Col: Selected Employee Overview & PDF Status */}
            <div className="space-y-4">
              
              {/* Employee Summary Card - Matching Employees.jsx Avatar and Badges */}
              <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Employee Summary
                </h3>

                {currentEmployee ? (
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-3 pb-3.5 border-b border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#225091] font-bold text-base shadow-2xs shrink-0">
                        {(currentEmployee.fullName || currentEmployee.name || 'E').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 truncate m-0">
                          {currentEmployee.fullName || currentEmployee.name}
                        </h4>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#225091] border border-blue-200/60 mt-0.5">
                          {currentEmployee.designation || 'Staff Member'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center gap-1.5 text-gray-400 font-medium">
                          <Building2 size={13} /> Branch
                        </span>
                        <span className="font-semibold text-gray-800 text-right">
                          {currentEmployee.branchName || currentEmployee.branch?.name || 'Main Branch'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center gap-1.5 text-gray-400 font-medium">
                          <Calendar size={13} /> Joining Date
                        </span>
                        <span className="font-semibold text-gray-800">
                          {currentEmployee.joiningDate ? new Date(currentEmployee.joiningDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center gap-1.5 text-gray-400 font-medium">
                          <IndianRupee size={13} /> Current CTC
                        </span>
                        <span className="font-bold text-gray-900 font-heading">
                          {currentEmployee.salary ? `₹${Number(currentEmployee.salary).toLocaleString()}/yr` : '—'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-gray-600">
                        <span className="flex items-center gap-1.5 text-gray-400 font-medium">
                          <User size={13} /> Employee Code
                        </span>
                        <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md text-[11px]">
                          {currentEmployee.employeeCode || currentEmployee.code || (currentEmployee.id || currentEmployee._id)?.slice(-6).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400 text-xs flex flex-col items-center">
                    <User size={28} className="mb-2 text-gray-300" />
                    <span>Select an employee above to preview details.</span>
                  </div>
                )}
              </div>

              {/* Live PDF Ready Result Card */}
              {generatedPdfBlob && (
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4.5 shadow-xs space-y-3.5 animate-in fade-in zoom-in duration-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-500 text-white rounded-lg shadow-2xs shrink-0">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 block">
                        DOCUMENT READY
                      </span>
                      <h4 className="text-xs font-bold text-gray-900 truncate m-0">
                        {generatedDocTitle}.pdf
                      </h4>
                      <p className="text-[11px] font-mono text-gray-500 mt-0.5">
                        Ref: {generatedRefNo}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-100">
                    <button 
                      type="button" 
                      onClick={handlePreview}
                      className="py-1.5 px-2 rounded-lg bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Preview</span>
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={handlePrint}
                      className="py-1.5 px-2 rounded-lg bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Printer size={13} />
                      <span>Print</span>
                    </button>

                    <button 
                      type="button" 
                      onClick={handleDownload}
                      className="py-1.5 px-2 rounded-lg bg-[#225091] hover:bg-[#1b427b] text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Download size={13} />
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
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden flex flex-col">
          
          {/* History Search & Filter Bar - Exact Match with Employees.jsx */}
          <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3.5">
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
                className="w-full pl-10 pr-4 py-2 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <select
                value={historyTypeFilter}
                onChange={(e) => {
                  setHistoryTypeFilter(e.target.value);
                  setHistoryPage(1);
                }}
                className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:border-[#225091] shadow-2xs cursor-pointer"
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
                className="p-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg text-gray-600 shadow-2xs transition-colors cursor-pointer"
                title="Reset Filters"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Table View - Exact Match with Employees.jsx */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200/80">
                <tr>
                  <th className="py-3.5 px-5 text-center w-16 font-semibold">Sr.No.</th>
                  <th className="py-3.5 px-5 font-semibold">Ref Number</th>
                  <th className="py-3.5 px-5 font-semibold">Employee</th>
                  <th className="py-3.5 px-5 font-semibold">Document Type</th>
                  <th className="py-3.5 px-5 font-semibold">Details Summary</th>
                  <th className="py-3.5 px-5 font-semibold">Generated On</th>
                  <th className="py-3.5 px-5 text-center w-28 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {paginatedHistory.length > 0 ? (
                  paginatedHistory.map((item, index) => {
                    const sr = (historyPage - 1) * historyLimit + index + 1;
                    const letterTypeConfig = LETTER_TYPES.find(l => l.id === item.letterType);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5 text-center text-gray-500 font-medium">
                          {sr}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="font-mono text-[11px] font-bold text-[#225091] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                            {item.referenceNumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#225091] flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100">
                              {(item.employeeName || 'E').slice(0, 1)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{item.employeeName}</div>
                              <span className="text-xs text-gray-500">
                                {item.designation || 'Staff'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${letterTypeConfig?.badgeColor || 'bg-gray-100 text-gray-700'}`}>
                            {item.letterType}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-xs text-gray-600 max-w-xs truncate font-medium">
                          {item.detailsSummary}
                        </td>
                        <td className="py-3.5 px-5 text-xs text-gray-500 font-medium">
                          {new Date(item.generatedAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteHistory(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all shadow-2xs cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500 text-sm font-medium">
                      <FileText size={32} className="mx-auto mb-2 text-gray-300 stroke-1" />
                      <p className="text-sm font-semibold text-gray-700">No document history found</p>
                      <p className="text-xs text-gray-400 mt-0.5">Generated documents will appear here for record-keeping.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination - Exact Match with Employees.jsx */}
          {totalHistoryPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-white">
              <div>
                Showing page {historyPage} of {totalHistoryPages} ({filteredHistory.length} total entries)
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={historyPage <= 1}
                  onClick={() => setHistoryPage(p => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-[#225091] hover:bg-[#225091] hover:text-white disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <span className="font-semibold text-gray-800 px-2 text-xs">
                  {historyPage} / {totalHistoryPages}
                </span>
                <button
                  type="button"
                  disabled={historyPage >= totalHistoryPages}
                  onClick={() => setHistoryPage(p => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-[#225091] hover:bg-[#225091] hover:text-white disabled:opacity-40 transition-colors"
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
