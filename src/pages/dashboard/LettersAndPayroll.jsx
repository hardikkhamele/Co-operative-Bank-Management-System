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
  CheckCircle2
} from 'lucide-react';
import { employeeService } from '../../api/employeeService';
import { branchService } from '../../api/branchService';
import { letterService } from '../../api/letterService';

const MONTHS_LIST = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const LETTER_TYPES = [
  { id: 'Offer Letter', name: 'Offer Letter', code: 'OL' },
  { id: 'Confirmation Letter', name: 'Confirmation Letter', code: 'CL' },
  { id: 'Performance Letter', name: 'Performance Appraisal Letter', code: 'PA' },
  { id: 'Promotion Letter', name: 'Promotion Letter', code: 'PL' },
  { id: 'Transfer Letter', name: 'Transfer Letter', code: 'TL' },
  { id: 'Salary Increment', name: 'Salary Increment Letter', code: 'SI' },
  { id: 'Salary Slip', name: 'Salary Slip', code: 'SS' },
  { id: 'Termination Letter', name: 'Termination Letter', code: 'TM' },
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
    <div className="flex flex-col gap-5 w-full max-w-5xl mx-auto pb-12">
      
      {/* Header Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">Letters & Payroll</h1>
          <div className="flex items-center text-xs text-gray-500">
            <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
            <ChevronRight size={12} className="mx-1 text-gray-400" />
            <span>HR Management</span>
            <ChevronRight size={12} className="mx-1 text-gray-400" />
            <span className="text-[#225091] font-medium">Letters & Payroll</span>
          </div>
        </div>

        {/* Simple Tabs */}
        <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-1.5 rounded-md transition-colors ${
              activeTab === 'generate'
                ? 'bg-white text-[#225091] shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Generate Document
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-md transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-[#225091] shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            History ({historyList.length})
          </button>
        </div>
      </div>

      {/* TAB 1: GENERATE DOCUMENT FORM */}
      {activeTab === 'generate' && (
        <div className="space-y-5">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <form onSubmit={handleGenerateDocument} className="space-y-5">
              
              {/* Row 1: Letter Type & Employee Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Select Document / Letter Type *
                  </label>
                  <select
                    value={selectedLetterType}
                    onChange={(e) => {
                      setSelectedLetterType(e.target.value);
                      setGeneratedPdfBlob(null);
                      setGeneratedDocTitle('');
                      setGeneratedRefNo('');
                    }}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 bg-white focus:outline-none focus:border-[#225091]"
                  >
                    {LETTER_TYPES.map((lt) => (
                      <option key={lt.id} value={lt.id}>
                        {lt.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Select Employee *
                  </label>
                  <select 
                    required
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 bg-white focus:outline-none focus:border-[#225091]"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => {
                      const empId = emp.id || emp._id;
                      const empName = emp.fullName || emp.name || `Employee #${empId}`;
                      const desig = emp.designation ? ` (${emp.designation})` : '';
                      return (
                        <option key={empId} value={empId}>
                          {empName}{desig}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Row 2: Dynamic Letter Specific Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-gray-100">
                
                {/* 1. Offer Letter */}
                {selectedLetterType === 'Offer Letter' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Designation *</label>
                      <input 
                        type="text"
                        required
                        value={offerDesignation}
                        onChange={(e) => setOfferDesignation(e.target.value)}
                        placeholder="e.g. Branch Operations Manager"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Joining Date *</label>
                      <input 
                        type="date"
                        required
                        value={offerJoiningDate}
                        onChange={(e) => setOfferJoiningDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Annual CTC / Salary (₹) *</label>
                      <input 
                        type="number"
                        required
                        min="1000"
                        value={offerAnnualSalary}
                        onChange={(e) => setOfferAnnualSalary(e.target.value)}
                        placeholder="e.g. 600000"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                  </>
                )}

                {/* 2. Confirmation Letter */}
                {selectedLetterType === 'Confirmation Letter' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Probation Start Date *</label>
                      <input 
                        type="date"
                        required
                        value={probationStartDate}
                        onChange={(e) => setProbationStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Probation End Date *</label>
                      <input 
                        type="date"
                        required
                        value={probationEndDate}
                        onChange={(e) => setProbationEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirmation Date *</label>
                      <input 
                        type="date"
                        required
                        value={confirmationDate}
                        onChange={(e) => setConfirmationDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Notice Period (Days) *</label>
                      <input 
                        type="number"
                        required
                        min="0"
                        value={confirmationNoticePeriod}
                        onChange={(e) => setConfirmationNoticePeriod(e.target.value)}
                        placeholder="e.g. 60"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                  </>
                )}

                {/* 3. Performance Appraisal Letter */}
                {selectedLetterType === 'Performance Letter' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Review Period *</label>
                      <input 
                        type="text"
                        required
                        value={perfReviewPeriod}
                        onChange={(e) => setPerfReviewPeriod(e.target.value)}
                        placeholder="e.g. FY 2025–26"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Overall Rating *</label>
                      <input 
                        type="text"
                        required
                        value={perfOverallRating}
                        onChange={(e) => setPerfOverallRating(e.target.value)}
                        placeholder="e.g. 4.5 / 5.0 (Exceeds Expectations)"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Manager Comments *</label>
                      <textarea 
                        rows={3}
                        required
                        value={perfManagerComments}
                        onChange={(e) => setPerfManagerComments(e.target.value)}
                        placeholder="Enter evaluation remarks..."
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091] resize-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Appraisal Outcome *</label>
                      <input 
                        type="text"
                        required
                        value={perfAppraisalOutcome}
                        onChange={(e) => setPerfAppraisalOutcome(e.target.value)}
                        placeholder="e.g. Eligible for annual increment of 15% and promotion."
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                  </>
                )}

                {/* 4. Promotion Letter */}
                {selectedLetterType === 'Promotion Letter' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Promoted Designation *</label>
                      <input 
                        type="text"
                        required
                        value={promotedNewRole}
                        onChange={(e) => setPromotedNewRole(e.target.value)}
                        placeholder="e.g. Senior Branch Manager"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Effective Date *</label>
                      <input 
                        type="date"
                        required
                        value={promotionEffectiveDate}
                        onChange={(e) => setPromotionEffectiveDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                  </>
                )}

                {/* 5. Transfer Letter */}
                {selectedLetterType === 'Transfer Letter' && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Transfer To Branch *</label>
                      <select 
                        required
                        value={transferToBranchId}
                        onChange={(e) => setTransferToBranchId(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      >
                        <option value="">Select Branch</option>
                        {branches.map((b) => (
                          <option key={b.id || b._id} value={b.id || b._id}>
                            {b.branchName || b.name || `Branch #${b.id || b._id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Effective Date *</label>
                      <input 
                        type="date"
                        required
                        value={transferEffectiveDate}
                        onChange={(e) => setTransferEffectiveDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reporting Date *</label>
                      <input 
                        type="date"
                        required
                        value={transferReportingDate}
                        onChange={(e) => setTransferReportingDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                  </>
                )}

                {/* 6. Salary Increment Letter */}
                {selectedLetterType === 'Salary Increment' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Review Period *</label>
                      <input 
                        type="text"
                        required
                        value={incrReviewPeriod}
                        onChange={(e) => setIncrReviewPeriod(e.target.value)}
                        placeholder="e.g. FY 2025–26"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Effective Date *</label>
                      <input 
                        type="date"
                        required
                        value={incrEffectiveDate}
                        onChange={(e) => setIncrEffectiveDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Increment Percentage (%) *</label>
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
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Current Annual CTC (₹) *</label>
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
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Revised Annual CTC (₹) *</label>
                      <input 
                        type="number"
                        required
                        min="1000"
                        value={incrRevisedCtc}
                        onChange={(e) => setIncrRevisedCtc(e.target.value)}
                        placeholder="e.g. 690000"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                  </>
                )}

                {/* 7. Salary Slip */}
                {selectedLetterType === 'Salary Slip' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Salary Period (Month & Year) *</label>
                      <select 
                        required
                        value={salaryPayPeriod}
                        onChange={(e) => setSalaryPayPeriod(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      >
                        {monthYearOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Pay Date *</label>
                      <input 
                        type="date"
                        required
                        value={salaryPayDate}
                        onChange={(e) => setSalaryPayDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Working Days *</label>
                      <input 
                        type="number"
                        required
                        min="1"
                        max="31"
                        value={salaryWorkingDays}
                        onChange={(e) => setSalaryWorkingDays(e.target.value)}
                        placeholder="e.g. 31"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Present / Paid Days *</label>
                      <input 
                        type="number"
                        required
                        min="0"
                        max="31"
                        value={salaryPresentDays}
                        onChange={(e) => setSalaryPresentDays(e.target.value)}
                        placeholder="e.g. 29"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">LOP (Loss of Pay) Days</label>
                      <input 
                        type="number"
                        min="0"
                        value={salaryLopDays}
                        onChange={(e) => setSalaryLopDays(e.target.value)}
                        placeholder="e.g. 2"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Account Number (Optional)</label>
                      <input 
                        type="text"
                        value={salaryAccountNumber}
                        onChange={(e) => setSalaryAccountNumber(e.target.value)}
                        placeholder="e.g. 5010023487654321"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                  </>
                )}

                {/* 8. Termination Letter */}
                {selectedLetterType === 'Termination Letter' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Termination Date *</label>
                      <input 
                        type="date"
                        required
                        value={termDate}
                        onChange={(e) => setTermDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Notice Period (Days) *</label>
                      <input 
                        type="number"
                        required
                        min="0"
                        value={termNoticePeriodDays}
                        onChange={(e) => setTermNoticePeriodDays(e.target.value)}
                        placeholder="e.g. 30"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reason for Termination *</label>
                      <input 
                        type="text"
                        required
                        value={termReason}
                        onChange={(e) => setTermReason(e.target.value)}
                        placeholder="e.g. Resignation / Personal Reasons"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Handover Responsibilities To *</label>
                      <input 
                        type="text"
                        required
                        value={termHandoverTo}
                        onChange={(e) => setTermHandoverTo(e.target.value)}
                        placeholder="e.g. Mr. Amit Verma, Senior Branch Officer"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#225091]"
                      />
                    </div>
                  </>
                )}

              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-3">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-[#225091] hover:bg-[#1a3f73] text-white px-6 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <span>Generate {selectedLetterType} PDF</span>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Generated Result Card */}
          {generatedPdfBlob && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-green-600 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-gray-800">
                    {generatedRefNo} — {generatedDocTitle}.pdf
                  </div>
                  <p className="text-xs text-gray-500">
                    Ready for {currentEmployee?.fullName || currentEmployee?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={handlePreview}
                  className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Preview
                </button>
                <button 
                  type="button" 
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Print
                </button>
                <button 
                  type="button" 
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-md bg-[#225091] hover:bg-[#1a3f73] text-white text-xs font-medium"
                >
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DOCUMENT HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          
          {/* History Search & Filter */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                value={historySearch}
                onChange={(e) => {
                  setHistorySearch(e.target.value);
                  setHistoryPage(1);
                }}
                placeholder="Search employee or ref no..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#225091]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={historyTypeFilter}
                onChange={(e) => {
                  setHistoryTypeFilter(e.target.value);
                  setHistoryPage(1);
                }}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs text-gray-700 focus:outline-none focus:border-[#225091]"
              >
                <option value="ALL">All Letter Types</option>
                {LETTER_TYPES.map((lt) => (
                  <option key={lt.id} value={lt.id}>{lt.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 font-semibold">
                  <th className="py-2.5 px-4">Ref No.</th>
                  <th className="py-2.5 px-4">Letter Type</th>
                  <th className="py-2.5 px-4">Employee</th>
                  <th className="py-2.5 px-4">Details</th>
                  <th className="py-2.5 px-4">Generated At</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {paginatedHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No document history records found.
                    </td>
                  </tr>
                ) : (
                  paginatedHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-4 font-mono font-medium text-gray-800">
                        {item.referenceNumber}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-[#225091]">
                        {item.letterType}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-gray-900">
                        {item.employeeName}
                      </td>
                      <td className="py-2.5 px-4 text-gray-600 max-w-xs truncate">
                        {item.detailsSummary}
                      </td>
                      <td className="py-2.5 px-4 text-gray-500 whitespace-nowrap">
                        {new Date(item.generatedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteHistory(item.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredHistory.length > 0 && (
            <div className="p-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <div>
                Showing {(historyPage - 1) * historyLimit + 1} to {Math.min(historyPage * historyLimit, filteredHistory.length)} of {filteredHistory.length} entries
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={historyPage <= 1}
                  onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                  className="px-2 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="px-2 font-medium text-gray-700">
                  {historyPage} / {totalHistoryPages}
                </span>
                <button
                  disabled={historyPage >= totalHistoryPages}
                  onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))}
                  className="px-2 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40"
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
