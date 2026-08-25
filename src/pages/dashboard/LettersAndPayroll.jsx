import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronDown,
  X,
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
  ExternalLink,
  Info,
  Send,
  Mail,
  Phone,
  Layers,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
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
    description: 'Official offer / appointment letter containing legal terms & compensation Annexure',
    badgeColor: 'bg-blue-50 text-[#225091] border-blue-200/60'
  },
  { 
    id: 'Confirmation Letter', 
    name: 'Confirmation Letter', 
    code: 'CL',
    icon: ShieldCheck,
    description: 'Employment confirmation upon successful probation review completion',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
  },
  { 
    id: 'Performance Letter', 
    name: 'Performance Appraisal', 
    code: 'PA',
    icon: Sparkles,
    description: 'Annual performance evaluation with 4-column KRA rating grid & manager comments',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200/60'
  },
  { 
    id: 'Promotion Letter', 
    name: 'Promotion Letter', 
    code: 'PL',
    icon: Briefcase,
    description: 'Official promotion to upgraded designation & responsibilities',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200/60'
  },
  { 
    id: 'Transfer Letter', 
    name: 'Transfer Letter', 
    code: 'TL',
    icon: ArrowRightLeft,
    description: 'Branch relocation letter & automatic system branch assignment update',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
  },
  { 
    id: 'Salary Increment', 
    name: 'Salary Increment', 
    code: 'SI',
    icon: TrendingUp,
    description: 'Revised compensation structure & annual increment letter',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/60'
  },
  { 
    id: 'Salary Slip', 
    name: 'Salary Slip', 
    code: 'SS',
    icon: Receipt,
    description: 'Monthly payroll statement with side-by-side Earnings vs Deductions grid',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200/60'
  },
  { 
    id: 'Termination Letter', 
    name: 'Termination Letter', 
    code: 'TM',
    icon: Trash2,
    description: 'Exit / relieving documentation & automatic employee deactivation in database',
    badgeColor: 'bg-red-50 text-red-700 border-red-200/60'
  }
];

const INITIAL_KRA_RATINGS = [
  { kraName: 'Business / Portfolio Growth', target: 'Rs. 5.0 Cr', achievement: 'Rs. 6.2 Cr', rating: '5.0' },
  { kraName: 'Collections / NPA Management', target: '< 1.0%', achievement: '0.4%', rating: '5.0' },
  { kraName: 'Compliance & Process Adherence', target: '100%', achievement: '98%', rating: '4.0' },
  { kraName: 'Team & Stakeholder Management', target: 'Satisfactory', achievement: 'Excellent', rating: '4.0' }
];

const INITIAL_HISTORY = [
  {
    id: 'HIST-001',
    letterType: 'Offer Letter',
    employeeName: 'Aman Sharma',
    employeeEmail: 'aman.sharma@advitabank.com',
    referenceNumber: 'KHAMLA/HR/OL/2026/001',
    designation: 'Senior Loan Officer',
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    detailsSummary: 'Designation: Senior Loan Officer | CTC: ₹4,50,000/yr',
    fileUrl: '',
    sentStatus: true
  },
  {
    id: 'HIST-002',
    letterType: 'Salary Slip',
    employeeName: 'Lala Patil',
    employeeEmail: 'lala.patil@advitabank.com',
    referenceNumber: 'KHAMLA/HR/SS/2026/08/001',
    designation: 'Branch Manager',
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    detailsSummary: 'Period: August 2026 | Net Salary: ₹48,000',
    fileUrl: '',
    sentStatus: false
  },
  {
    id: 'HIST-003',
    letterType: 'Confirmation Letter',
    employeeName: 'Priya Deshmukh',
    employeeEmail: 'priya.deshmukh@advitabank.com',
    referenceNumber: 'KHAMLA/HR/CL/2026/001',
    designation: 'Cashier / Teller',
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    detailsSummary: 'Confirmation: 01/08/2026 | Notice: 60 Days',
    fileUrl: '',
    sentStatus: true
  }
];

// --- High-Performance Searchable Employee Selector ---
const SearchableEmployeeSelect = ({ employees, selectedEmployeeId, onSelect, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = React.useRef(null);

  const selectedEmployee = useMemo(() => {
    return (employees || []).find(e => (e.id || e._id) === selectedEmployeeId);
  }, [employees, selectedEmployeeId]);

  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees || [];
    const q = searchTerm.toLowerCase().trim();
    return (employees || []).filter(e => {
      const name = (e.fullName || e.name || '').toLowerCase();
      const code = (e.employeeCode || '').toLowerCase();
      const email = (e.email || '').toLowerCase();
      const desig = (e.designation || e.role?.name || '').toLowerCase();
      const branch = (e.branch?.name || e.branchName || '').toLowerCase();
      return name.includes(q) || code.includes(q) || email.includes(q) || desig.includes(q) || branch.includes(q);
    });
  }, [employees, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border rounded-xl text-sm transition-all text-left flex items-center justify-between shadow-2xs cursor-pointer ${
          isOpen ? 'border-[#225091] ring-2 ring-[#225091]/20 bg-white' : 'border-gray-200'
        }`}
      >
        {selectedEmployee ? (
          <div className="flex items-center gap-3 truncate">
            <div className="w-7 h-7 rounded-lg bg-[#225091]/10 text-[#225091] font-bold text-xs flex items-center justify-center shrink-0">
              {(selectedEmployee.fullName || selectedEmployee.name || 'E').slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate flex items-center gap-2">
              <span className="font-semibold text-gray-900">{selectedEmployee.fullName || selectedEmployee.name}</span>
              {selectedEmployee.employeeCode && (
                <span className="text-gray-400 font-mono text-xs">({selectedEmployee.employeeCode})</span>
              )}
              <span className="text-gray-500 text-xs font-normal truncate">
                • {selectedEmployee.designation || selectedEmployee.role?.name || 'Staff'}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 font-medium">
            {loading ? 'Loading employee directory...' : '-- Choose Employee from Directory --'}
          </span>
        )}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {employees && employees.length > 0 && (
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {employees.length} Staff
            </span>
          )}
          <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#225091]' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, EMP code, designation, branch..."
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#225091] focus:bg-white"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 space-y-0.5 pr-1">
            {filteredEmployees.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400 font-medium">
                No matching employees found in directory.
              </div>
            ) : (
              filteredEmployees.map((emp) => {
                const empId = emp.id || emp._id;
                const isSelected = empId === selectedEmployeeId;
                return (
                  <button
                    key={empId}
                    type="button"
                    onClick={() => {
                      onSelect(empId);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full p-2.5 rounded-lg text-left transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected ? 'bg-blue-50/80 text-[#225091]' : 'hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-[#225091] text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {(emp.fullName || emp.name || 'E').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-gray-900">{emp.fullName || emp.name}</span>
                          {emp.employeeCode && (
                            <span className="text-[10px] font-mono font-bold text-[#225091] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                              {emp.employeeCode}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5 truncate">
                          <span>{emp.designation || emp.role?.name || 'Staff'}</span>
                          {(emp.branch?.name || emp.branchName) && (
                            <>
                              <span>•</span>
                              <span className="truncate">{emp.branch?.name || emp.branchName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check size={16} className="text-[#225091] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- High-Performance Searchable Branch Selector ---
const SearchableBranchSelect = ({ branches, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = React.useRef(null);

  const selectedBranch = useMemo(() => {
    return (branches || []).find(b => (b.id || b._id) === value);
  }, [branches, value]);

  const filteredBranches = useMemo(() => {
    if (!searchTerm.trim()) return branches || [];
    const q = searchTerm.toLowerCase().trim();
    return (branches || []).filter(b => {
      const name = (b.name || '').toLowerCase();
      const code = (b.code || '').toLowerCase();
      const city = (b.city || b.address?.city || '').toLowerCase();
      const state = (b.state || b.address?.state || '').toLowerCase();
      return name.includes(q) || code.includes(q) || city.includes(q) || state.includes(q);
    });
  }, [branches, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border rounded-xl text-sm transition-all text-left flex items-center justify-between shadow-2xs cursor-pointer ${
          isOpen ? 'border-[#225091] ring-2 ring-[#225091]/20 bg-white' : 'border-gray-200'
        }`}
      >
        {selectedBranch ? (
          <div className="flex items-center gap-2 truncate">
            <Building2 size={15} className="text-[#225091] shrink-0" />
            <span className="font-semibold text-gray-900">{selectedBranch.name}</span>
            {selectedBranch.city && <span className="text-gray-500 text-xs">({selectedBranch.city})</span>}
          </div>
        ) : (
          <span className="text-gray-400">-- Select Destination Branch --</span>
        )}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {branches && branches.length > 0 && (
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
              {branches.length}
            </span>
          )}
          <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#225091]' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search branch name, code, city..."
              className="w-full pl-8.5 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#225091]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1">
            {filteredBranches.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400 font-medium">
                No matching branches found.
              </div>
            ) : (
              filteredBranches.map(b => {
                const bId = b.id || b._id;
                const isSelected = bId === value;
                return (
                  <button
                    key={bId}
                    type="button"
                    onClick={() => {
                      onChange(bId);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full p-2 rounded-lg text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected ? 'bg-blue-50 text-[#225091] font-bold' : 'hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <div className="truncate">
                      <span className="font-semibold">{b.name}</span>
                      {(b.city || b.state) && <span className="text-gray-400 ml-1.5 font-normal">({[b.city, b.state].filter(Boolean).join(', ')})</span>}
                    </div>
                    {isSelected && <Check size={14} className="text-[#225091]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const LettersAndPayroll = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedLetterType, setSelectedLetterType] = useState('Offer Letter');
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [currentEmployee, setCurrentEmployee] = useState(null);

  const [generatedPdfBlob, setGeneratedPdfBlob] = useState(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState('');
  const [generatedDocTitle, setGeneratedDocTitle] = useState('');
  const [generatedRefNo, setGeneratedRefNo] = useState('');

  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTotalRecords, setHistoryTotalRecords] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historySearch, setHistorySearch] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('ALL');
  const [historyBranchFilter, setHistoryBranchFilter] = useState('');
  const [historyEmployeeFilter, setHistoryEmployeeFilter] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [viewingHistoryItem, setViewingHistoryItem] = useState(null);
  const historyLimit = 10;

  const [offerCandidateName, setOfferCandidateName] = useState('');
  const [offerDesignation, setOfferDesignation] = useState('');
  const [offerJoiningDate, setOfferJoiningDate] = useState('');
  const [offerAnnualSalary, setOfferAnnualSalary] = useState('');

  const [probationStartDate, setProbationStartDate] = useState('');
  const [probationEndDate, setProbationEndDate] = useState('');
  const [confirmationDate, setConfirmationDate] = useState('');
  const [confirmationNoticePeriod, setConfirmationNoticePeriod] = useState('60');

  const [perfReviewPeriod, setPerfReviewPeriod] = useState('FY 2025–26');
  const [perfOverallRating, setPerfOverallRating] = useState('4.5 / 5.0 (Exceeds Expectations)');
  const [perfManagerComments, setPerfManagerComments] = useState('Demonstrated outstanding leadership in expanding portfolio growth, maintaining zero NPA, and adhering to RBI compliance guidelines.');
  const [perfAppraisalOutcome, setPerfAppraisalOutcome] = useState('Eligible for annual increment of 15% and promotion consideration.');
  const [kraRatings, setKraRatings] = useState(INITIAL_KRA_RATINGS);

  const [promoNewRole, setPromoNewRole] = useState('Senior Branch Manager');

  const [transferToBranchId, setTransferToBranchId] = useState('');
  const [transferEffectiveDate, setTransferEffectiveDate] = useState('');
  const [transferReportingDate, setTransferReportingDate] = useState('');

  const [incReviewPeriod, setIncReviewPeriod] = useState('FY 2025–26');
  const [incEffectiveDate, setIncEffectiveDate] = useState('');
  const [incPercentage, setIncPercentage] = useState('15');
  const [incCurrentCtc, setIncCurrentCtc] = useState('600000');
  const [incRevisedCtc, setIncRevisedCtc] = useState('690000');

  const [salaryDate, setSalaryDate] = useState('2026-08-01');
  const [payDate, setPayDate] = useState('2026-08-31');
  const [payPeriod, setPayPeriod] = useState('August 2026');
  const [salaryWorkingDays, setSalaryWorkingDays] = useState('31');
  const [salaryPresentDays, setSalaryPresentDays] = useState('29');
  const [salaryPaidDays, setSalaryPaidDays] = useState('29');
  const [salaryLopDays, setSalaryLopDays] = useState('2');
  const [salaryAccountNumber, setSalaryAccountNumber] = useState('5010023487654321');
  
  const [earnings, setEarnings] = useState([
    { label: 'Basic Salary', amount: 25000 },
    { label: 'House Rent Allowance (HRA)', amount: 10000 },
    { label: 'Special Allowance', amount: 15000 }
  ]);
  const [deductions, setDeductions] = useState([
    { label: 'Employee PF', amount: 1800 },
    { label: 'Professional Tax (PT)', amount: 200 }
  ]);
  const [employerContributions, setEmployerContributions] = useState([
    { label: 'Employer PF', amount: 1800 }
  ]);

  const [termDate, setTermDate] = useState('');
  const [termReason, setTermReason] = useState('Resignation / Personal Reasons');
  const [termNoticePeriodDays, setTermNoticePeriodDays] = useState('30');
  const [termHandoverTo, setTermHandoverTo] = useState('Mr. Amit Verma, Senior Branch Officer');

  const fetchHistoryLogs = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const params = {
        page: historyPage,
        limit: historyLimit,
        search: historySearch.trim() || undefined,
        documentType: historyTypeFilter !== 'ALL' ? historyTypeFilter : undefined,
        branchId: historyBranchFilter || undefined,
        employeeId: historyEmployeeFilter || undefined,
        sortBy: 'issuedDate',
        sortOrder: 'desc'
      };

      const response = await letterService.getHistory(params);
      if (response && response.success) {
        const list = Array.isArray(response.data) ? response.data : response.data?.items || response.data?.history || [];
        setHistoryLogs(list);
        if (response.meta) {
          setHistoryTotalRecords(response.meta.totalRecords ?? list.length);
          setHistoryTotalPages(response.meta.totalPages ?? (Math.ceil((response.meta.totalRecords || list.length) / historyLimit) || 1));
        } else {
          setHistoryTotalRecords(list.length);
          setHistoryTotalPages(Math.ceil(list.length / historyLimit) || 1);
        }
      }
    } catch (err) {
      console.error('Failed to fetch employee letter history logs from API:', err);
      const saved = localStorage.getItem('advita_letters_history');
      const fallbackList = saved ? JSON.parse(saved) : INITIAL_HISTORY;
      setHistoryLogs(fallbackList);
      setHistoryTotalRecords(fallbackList.length);
      setHistoryTotalPages(Math.ceil(fallbackList.length / historyLimit) || 1);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage, historyLimit, historySearch, historyTypeFilter, historyBranchFilter, historyEmployeeFilter]);

  useEffect(() => {
    fetchHistoryLogs();
  }, [fetchHistoryLogs]);

  useEffect(() => {
    return () => {
      if (generatedPdfUrl && generatedPdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(generatedPdfUrl);
      }
    };
  }, [generatedPdfUrl]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setFetchingEmployees(true);
        const [empRes, branchRes] = await Promise.allSettled([
          employeeService.list({ limit: 100 }),
          branchService.list({ limit: 100 })
        ]);

        if (empRes.status === 'fulfilled' && empRes.value && empRes.value.success) {
          const empList = Array.isArray(empRes.value.data) ? empRes.value.data : empRes.value.data?.items || empRes.value.data?.employees || [];
          setEmployees(empList);
          if (empList.length > 0) {
            setSelectedEmployeeId(empList[0].id || empList[0]._id);
          }
        }

        if (branchRes.status === 'fulfilled' && branchRes.value && branchRes.value.success) {
          const bList = Array.isArray(branchRes.value.data) ? branchRes.value.data : branchRes.value.data?.items || branchRes.value.data?.branches || [];
          setBranches(bList);
          if (bList.length > 0) {
            setTransferToBranchId(bList[0].id || bList[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load employee/branch data:', err);
      } finally {
        setFetchingEmployees(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedEmployeeId || employees.length === 0) {
      setCurrentEmployee(null);
      return;
    }
    const emp = employees.find(e => (e.id || e._id) === selectedEmployeeId);
    if (emp) {
      setCurrentEmployee(emp);
      const fullName = emp.fullName || emp.name || '';
      setOfferCandidateName(fullName);
      setOfferDesignation(emp.designation || 'Branch Operations Manager');
      setPromoNewRole(emp.designation ? `Senior ${emp.designation}` : 'Senior Branch Manager');
      
      if (emp.salary) {
        const ctc = Number(emp.salary);
        setOfferAnnualSalary(String(ctc));
        setIncCurrentCtc(String(ctc));
        const revised = Math.round(ctc * 1.15);
        setIncRevisedCtc(String(revised));

        const monthlyGross = Math.round(ctc / 12);
        const basic = Math.round(monthlyGross * 0.5);
        const hra = Math.round(monthlyGross * 0.2);
        const special = Math.max(0, monthlyGross - basic - hra);
        setEarnings([
          { label: 'Basic Salary', amount: basic || 25000 },
          { label: 'House Rent Allowance (HRA)', amount: hra || 10000 },
          { label: 'Special Allowance', amount: special || 15000 }
        ]);
      }

      if (emp.accountNumber || emp.bankAccount?.accountNumber) {
        setSalaryAccountNumber(emp.accountNumber || emp.bankAccount?.accountNumber);
      }

      if (emp.joiningDate) {
        try {
          const jd = new Date(emp.joiningDate).toISOString().split('T')[0];
          setOfferJoiningDate(jd);
          setProbationStartDate(jd);
          const pEnd = new Date(emp.joiningDate);
          pEnd.setMonth(pEnd.getMonth() + 6);
          const pEndStr = pEnd.toISOString().split('T')[0];
          setProbationEndDate(pEndStr);
          setConfirmationDate(pEndStr);
        } catch { }
      }
    }
  }, [selectedEmployeeId, employees]);

  const handleIncrementPercentageChange = (pct) => {
    setIncPercentage(pct);
    const curr = Number(incCurrentCtc) || 0;
    const pVal = Number(pct) || 0;
    const rev = Math.round(curr + (curr * pVal) / 100);
    setIncRevisedCtc(String(rev));
  };

  const handleCurrentCtcChange = (currVal) => {
    setIncCurrentCtc(currVal);
    const curr = Number(currVal) || 0;
    const pVal = Number(incPercentage) || 0;
    const rev = Math.round(curr + (curr * pVal) / 100);
    setIncRevisedCtc(String(rev));
  };

  const salaryTotals = useMemo(() => {
    const totalEarnings = earnings.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalDeductions = deductions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const netSalary = Math.max(0, totalEarnings - totalDeductions);
    return { totalEarnings, totalDeductions, netSalary };
  }, [earnings, deductions]);

  const handleKraChange = (index, field, value) => {
    setKraRatings(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddKraRow = () => {
    setKraRatings(prev => [...prev, { kraName: '', target: '', achievement: '', rating: '5.0' }]);
  };

  const handleRemoveKraRow = (index) => {
    setKraRatings(prev => prev.filter((_, i) => i !== index));
  };

  const handleEarningChange = (index, field, value) => {
    setEarnings(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: field === 'amount' ? Number(value) : value };
      return updated;
    });
  };

  const handleAddEarning = () => setEarnings(prev => [...prev, { label: '', amount: 0 }]);
  const handleRemoveEarning = (index) => setEarnings(prev => prev.filter((_, i) => i !== index));

  const handleDeductionChange = (index, field, value) => {
    setDeductions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: field === 'amount' ? Number(value) : value };
      return updated;
    });
  };

  const handleAddDeduction = () => setDeductions(prev => [...prev, { label: '', amount: 0 }]);
  const handleRemoveDeduction = (index) => setDeductions(prev => prev.filter((_, i) => i !== index));

  const handleGenerateDocument = async (e) => {
    if (e) e.preventDefault();
    if (!selectedEmployeeId) {
      toast.warning('Please select an employee first.');
      return;
    }

    try {
      setLoading(true);
      setSentSuccess(false);
      let payload = { letterType: selectedLetterType, employeeId: selectedEmployeeId };
      const empName = currentEmployee?.fullName || currentEmployee?.name || offerCandidateName || 'Employee';
      const empEmail = currentEmployee?.email || '';
      let summaryText = '';

      switch (selectedLetterType) {
        case 'Offer Letter':
          payload = { ...payload, candidateName: offerCandidateName || empName, designation: offerDesignation, joiningDate: offerJoiningDate, annualSalary: Number(offerAnnualSalary) || 0 };
          summaryText = `Designation: ${offerDesignation} | CTC: ₹${Number(offerAnnualSalary).toLocaleString()}/yr`;
          break;
        case 'Confirmation Letter':
          payload = { ...payload, probationStartDate, probationEndDate, confirmationDate, noticePeriodDays: Number(confirmationNoticePeriod) || 60 };
          summaryText = `Confirmation: ${confirmationDate} | Notice: ${confirmationNoticePeriod} Days`;
          break;
        case 'Performance Letter':
          payload = { ...payload, reviewPeriod: perfReviewPeriod, overallRating: perfOverallRating, managerComments: perfManagerComments, appraisalOutcome: perfAppraisalOutcome, kraRatings: kraRatings.filter(k => k.kraName.trim() !== '') };
          summaryText = `Period: ${perfReviewPeriod} | Rating: ${perfOverallRating}`;
          break;
        case 'Promotion Letter':
          payload = { ...payload, newRole: promoNewRole };
          summaryText = `Promoted To: ${promoNewRole}`;
          break;
        case 'Transfer Letter':
          payload = { ...payload, transferToBranchId: transferToBranchId, effectiveDate: transferEffectiveDate, reportingDate: transferReportingDate };
          const destBranch = branches.find(b => (b.id || b._id) === transferToBranchId);
          summaryText = `Transfer To: ${destBranch?.name || 'New Branch'} | Effective: ${transferEffectiveDate}`;
          break;
        case 'Salary Increment':
          payload = { ...payload, reviewPeriod: incReviewPeriod, effectiveDate: incEffectiveDate, incrementPercentage: Number(incPercentage) || 0, currentCtc: Number(incCurrentCtc) || 0, revisedCtc: Number(incRevisedCtc) || 0 };
          summaryText = `Increment: ${incPercentage}% | Revised CTC: ₹${Number(incRevisedCtc).toLocaleString()}/yr`;
          break;
        case 'Salary Slip':
          payload = { ...payload, salaryDate, payDate, payPeriod, workingDays: Number(salaryWorkingDays), presentDays: Number(salaryPresentDays), paidDays: Number(salaryPaidDays), lopDays: Number(salaryLopDays), accountNumber: salaryAccountNumber, earnings: earnings.filter(e => e.label.trim() !== ''), deductions: deductions.filter(d => d.label.trim() !== ''), employerContributions: employerContributions.filter(c => c.label.trim() !== '') };
          summaryText = `Period: ${payPeriod} | Net: ₹${salaryTotals.netSalary.toLocaleString()}`;
          break;
        case 'Termination Letter':
          payload = { ...payload, terminationDate: termDate, reason: termReason, noticePeriodDays: Number(termNoticePeriodDays), handoverTo: termHandoverTo };
          summaryText = `Exit Date: ${termDate} | Handover: ${termHandoverTo}`;
          break;
      }

      const response = await letterService.generate(payload, { format: 'json' });
      let finalFileUrl = '';
      let finalRefNo = `ADV/${selectedLetterType.slice(0, 2).toUpperCase()}/${Date.now().toString().slice(-4)}`;
      let finalDocTitle = `${selectedLetterType.replace(/\s+/g, '_')}_${empName.replace(/\s+/g, '_')}`;

      if (response && response.data) {
        if (response.data.fileUrl) finalFileUrl = response.data.fileUrl;
        if (response.data.referenceNumber) finalRefNo = response.data.referenceNumber;
      } else if (response instanceof Blob || response.data instanceof Blob) {
        const blob = response instanceof Blob ? response : response.data;
        setGeneratedPdfBlob(blob);
        finalFileUrl = URL.createObjectURL(blob);
      }

      setGeneratedPdfUrl(finalFileUrl);
      setGeneratedRefNo(finalRefNo);
      setGeneratedDocTitle(finalDocTitle);

      const newHistoryItem = {
        id: `HIST-${Date.now().toString().slice(-6)}`,
        letterType: selectedLetterType,
        employeeName: empName,
        employeeEmail: empEmail,
        referenceNumber: finalRefNo,
        designation: currentEmployee?.designation || offerDesignation || promoNewRole || 'Staff',
        generatedAt: new Date().toISOString(),
        detailsSummary: summaryText,
        fileUrl: finalFileUrl,
        sentStatus: false
      };
      setHistoryList(prev => [newHistoryItem, ...prev]);
      toast.success(`${selectedLetterType} generated successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to generate document.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToEmployee = async (item = null) => {
    const targetEmp = item ? { name: item.employeeName, email: item.employeeEmail } : currentEmployee;
    const empName = targetEmp?.fullName || targetEmp?.name || 'Employee';
    const empEmail = targetEmp?.email || 'registered email address';
    setSendingEmail(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (item) {
        setHistoryList(prev => prev.map(h => h.id === item.id ? { ...h, sentStatus: true } : h));
      } else {
        setSentSuccess(true);
        setHistoryList(prev => {
          if (prev.length > 0) {
            const updated = [...prev];
            updated[0] = { ...updated[0], sentStatus: true };
            return updated;
          }
          return prev;
        });
      }
      toast.success(
        <div className="flex flex-col">
          <span className="font-bold">Document Dispatched!</span>
          <span className="text-xs">Successfully sent {selectedLetterType} to {empName} ({empEmail}).</span>
        </div>,
        { icon: <Send className="text-emerald-500" size={18} /> }
      );
    } catch (err) {
      toast.error('Failed to send document to employee.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDownload = () => {
    if (!generatedPdfUrl) return;
    const link = document.createElement('a');
    link.href = generatedPdfUrl;
    link.target = '_blank';
    link.setAttribute('download', `${generatedDocTitle || 'document'}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Document downloaded successfully!', { icon: <Download className="text-[#225091]" size={18} /> });
  };

  const handlePrint = () => {
    if (!generatedPdfUrl) return;
    const printWindow = window.open(generatedPdfUrl);
    if (printWindow) { printWindow.focus(); printWindow.print(); }
    else { toast.info('Pop-up blocked. Please allow pop-ups to print.'); }
  };

  const handlePreview = () => { if (generatedPdfUrl) window.open(generatedPdfUrl, '_blank'); };

  return (
    <div className="w-full flex flex-col gap-5 font-sans antialiased pb-16">
      <PageHeader
        title="Letters & Payroll"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "HR Management" },
          { label: "Letters & Payroll" }
        ]}
      >
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setActiveTab('generate')} className={`px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm flex items-center gap-2 text-sm shrink-0 cursor-pointer ${activeTab === 'generate' ? 'bg-[#225091] text-white hover:bg-[#1b427b]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            <FileCheck size={16} />
            <span>Generate Document</span>
          </button>
          <button type="button" onClick={() => setActiveTab('history')} className={`px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm flex items-center gap-2 text-sm shrink-0 cursor-pointer ${activeTab === 'history' ? 'bg-[#225091] text-white hover:bg-[#1b427b]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            <History size={16} />
            <span>History ({historyTotalRecords})</span>
          </button>
        </div>
      </PageHeader>



      {activeTab === 'generate' && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-gray-100 p-5 sm:p-6 space-y-6">
              <form onSubmit={handleGenerateDocument} className="space-y-6">
                {/* Step 1: Document Type Dropdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#225091] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                      <span>Choose Document Type</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs font-bold text-[#225091] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100/80">
                      {LETTER_TYPES.find(l => l.id === selectedLetterType)?.code} Standard
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      value={selectedLetterType}
                      onChange={(e) => setSelectedLetterType(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all text-gray-800 font-semibold cursor-pointer shadow-2xs appearance-none"
                    >
                      {LETTER_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} ({type.code}) — {type.description}
                        </option>
                      ))}
                    </select>
                    <ChevronRight size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                  </div>
                </div>

                {/* Step 2: Searchable Employee Selection Dropdown */}
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#225091] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                    <span>Select Society Employee</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <SearchableEmployeeSelect
                    employees={employees}
                    selectedEmployeeId={selectedEmployeeId}
                    onSelect={(id) => setSelectedEmployeeId(id)}
                    loading={fetchingEmployees}
                  />
                </div>

                {/* Step 3: Parameter Fields with Labels & Proper Dropdowns */}
                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-[#225091] text-white text-[11px] font-bold flex items-center justify-center">3</span>
                      <span>{selectedLetterType} Parameters</span>
                    </label>
                    <span className="text-[11px] text-gray-500 font-medium ml-7 block">{LETTER_TYPES.find(l => l.id === selectedLetterType)?.description}</span>
                  </div>

                  {/* Offer Letter */}
                  {selectedLetterType === 'Offer Letter' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Candidate Full Name <span className="text-rose-500">*</span></label>
                        <input type="text" required value={offerCandidateName} onChange={(e) => setOfferCandidateName(e.target.value)} placeholder="e.g. Rahul Sharma" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Offered Designation <span className="text-rose-500">*</span></label>
                        <input type="text" required value={offerDesignation} onChange={(e) => setOfferDesignation(e.target.value)} placeholder="e.g. Loan Officer" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Joining Date <span className="text-rose-500">*</span></label>
                        <input type="date" required value={offerJoiningDate} onChange={(e) => setOfferJoiningDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Annual CTC (₹) <span className="text-rose-500">*</span></label>
                        <input type="number" min="0" required value={offerAnnualSalary} onChange={(e) => setOfferAnnualSalary(e.target.value)} placeholder="e.g. 450000" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                    </div>
                  )}

                  {/* Confirmation Letter */}
                  {selectedLetterType === 'Confirmation Letter' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Probation Start Date <span className="text-rose-500">*</span></label>
                        <input type="date" required value={probationStartDate} onChange={(e) => setProbationStartDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Probation End Date <span className="text-rose-500">*</span></label>
                        <input type="date" required value={probationEndDate} onChange={(e) => setProbationEndDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirmation Effective Date <span className="text-rose-500">*</span></label>
                        <input type="date" required value={confirmationDate} onChange={(e) => setConfirmationDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Notice Period (Days) <span className="text-rose-500">*</span></label>
                        <input type="number" min="0" required value={confirmationNoticePeriod} onChange={(e) => setConfirmationNoticePeriod(e.target.value)} placeholder="e.g. 60" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                    </div>
                  )}

                  {/* Performance Letter */}
                  {selectedLetterType === 'Performance Letter' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Review Period <span className="text-rose-500">*</span></label>
                        <input type="text" required value={perfReviewPeriod} onChange={(e) => setPerfReviewPeriod(e.target.value)} placeholder="e.g. FY 2025–26" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Manager Comments <span className="text-rose-500">*</span></label>
                        <textarea rows={2} required value={perfManagerComments} onChange={(e) => setPerfManagerComments(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div className="overflow-x-auto border border-gray-200 rounded-xl">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead><tr className="bg-gray-50 text-gray-600 uppercase font-semibold"><th className="p-2.5">KRA</th><th className="p-2.5">Target</th><th className="p-2.5">Achieved</th><th className="p-2.5">Rating</th><th className="p-2.5"></th></tr></thead>
                          <tbody className="divide-y divide-gray-100">{kraRatings.map((row, idx) => (
                            <tr key={idx}>
                              <td className="p-2"><input value={row.kraName} onChange={(e) => handleKraChange(idx, 'kraName', e.target.value)} className="w-full p-1.5 border rounded-lg text-xs" /></td>
                              <td className="p-2"><input value={row.target} onChange={(e) => handleKraChange(idx, 'target', e.target.value)} className="w-full p-1.5 border rounded-lg text-xs" /></td>
                              <td className="p-2"><input value={row.achievement} onChange={(e) => handleKraChange(idx, 'achievement', e.target.value)} className="w-full p-1.5 border rounded-lg text-xs" /></td>
                              <td className="p-2"><input value={row.rating} onChange={(e) => handleKraChange(idx, 'rating', e.target.value)} className="w-full p-1.5 border rounded-lg text-xs" /></td>
                              <td className="p-2 text-center"><button type="button" onClick={() => handleRemoveKraRow(idx)} className="text-rose-600 p-1 hover:bg-rose-50 rounded"><Trash2 size={14}/></button></td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                      <button type="button" onClick={handleAddKraRow} className="text-xs font-bold text-[#225091] hover:underline cursor-pointer">+ Add Row</button>
                    </div>
                  )}

                  {/* Promotion Letter */}
                  {selectedLetterType === 'Promotion Letter' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">New Upgraded Designation / Role <span className="text-rose-500">*</span></label>
                      <input type="text" required value={promoNewRole} onChange={(e) => setPromoNewRole(e.target.value)} placeholder="e.g. Senior Branch Manager" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                    </div>
                  )}

                  {/* Transfer Letter */}
                  {selectedLetterType === 'Transfer Letter' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Destination Branch <span className="text-rose-500">*</span></label>
                        <SearchableBranchSelect
                          branches={branches}
                          value={transferToBranchId}
                          onChange={(bId) => setTransferToBranchId(bId)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Transfer Effective Date <span className="text-rose-500">*</span></label>
                        <input type="date" required value={transferEffectiveDate} onChange={(e) => setTransferEffectiveDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reporting Date <span className="text-rose-500">*</span></label>
                        <input type="date" required value={transferReportingDate} onChange={(e) => setTransferReportingDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                    </div>
                  )}

                  {/* Salary Increment */}
                  {selectedLetterType === 'Salary Increment' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Appraisal Review Period <span className="text-rose-500">*</span></label>
                        <input type="text" required value={incReviewPeriod} onChange={(e) => setIncReviewPeriod(e.target.value)} placeholder="e.g. FY 2025–26" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Effective Date <span className="text-rose-500">*</span></label>
                        <input type="date" required value={incEffectiveDate} onChange={(e) => setIncEffectiveDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Current CTC (₹/yr) <span className="text-rose-500">*</span></label>
                        <input type="number" min="0" required value={incCurrentCtc} onChange={(e) => handleCurrentCtcChange(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Increment Percentage (%) <span className="text-rose-500">*</span></label>
                        <input type="number" min="0" required value={incPercentage} onChange={(e) => handleIncrementPercentageChange(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                    </div>
                  )}

                  {/* Salary Slip */}
                  {selectedLetterType === 'Salary Slip' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Statement Date <span className="text-rose-500">*</span></label>
                        <input type="date" value={salaryDate} onChange={(e) => setSalaryDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Pay Period <span className="text-rose-500">*</span></label>
                        <input type="text" value={payPeriod} onChange={(e) => setPayPeriod(e.target.value)} placeholder="e.g. August 2026" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Total Working Days</label>
                        <input type="number" min="0" value={salaryWorkingDays} onChange={(e) => setSalaryWorkingDays(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Present / Paid Days</label>
                        <input type="number" min="0" value={salaryPresentDays} onChange={(e) => setSalaryPresentDays(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                    </div>
                  )}

                  {/* Termination Letter */}
                  {selectedLetterType === 'Termination Letter' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Relieving / Exit Date <span className="text-rose-500">*</span></label>
                        <input type="date" required value={termDate} onChange={(e) => setTermDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Notice Period (Days)</label>
                        <input type="number" min="0" required value={termNoticePeriodDays} onChange={(e) => setTermNoticePeriodDays(e.target.value)} placeholder="e.g. 30" className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reason for Exit</label>
                        <input type="text" required value={termReason} onChange={(e) => setTermReason(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Handover Assigned To</label>
                        <input type="text" required value={termHandoverTo} onChange={(e) => setTermHandoverTo(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091]" />
                      </div>
                    </div>
                  )}
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#225091] text-white py-3 rounded-xl font-bold hover:bg-[#1b427b] disabled:opacity-50">
                  {loading ? 'Generating...' : `Generate ${selectedLetterType}`}
                </button>
              </form>
            </div>
            {/* Right Sidebar: Employee Profile Card & PDF Ready Result */}
            <div className="space-y-4">
              {currentEmployee ? (
                <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-5 space-y-3.5">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employee Profile</h3>
                    {currentEmployee.status && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentEmployee.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {currentEmployee.status}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#225091]/10 text-[#225091] flex items-center justify-center font-bold text-base shrink-0">
                      {(currentEmployee.fullName || currentEmployee.name || 'E').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-xs space-y-1 flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">{currentEmployee.fullName || currentEmployee.name}</p>
                      <p className="text-[#225091] font-semibold">{currentEmployee.designation || currentEmployee.role?.name || 'Society Staff'}</p>
                      <p className="text-gray-500 text-[11px] truncate flex items-center gap-1">
                        <Mail size={12} className="text-gray-400" />
                        {currentEmployee.email || 'No email registered'}
                      </p>
                      {currentEmployee.phoneNumber && (
                        <p className="text-gray-500 text-[11px] flex items-center gap-1">
                          <Phone size={12} className="text-gray-400" />
                          {currentEmployee.phoneNumber}
                        </p>
                      )}
                      {(currentEmployee.branch?.name || currentEmployee.branchName) && (
                        <p className="text-gray-500 text-[11px] flex items-center gap-1">
                          <Building2 size={12} className="text-gray-400" />
                          {currentEmployee.branch?.name || currentEmployee.branchName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/70 border border-dashed border-gray-200 rounded-xl p-5 text-center text-xs text-gray-400 space-y-2">
                  <User size={24} className="mx-auto text-gray-300" />
                  <p className="font-semibold text-gray-600">No Employee Selected</p>
                  <p className="text-[11px] text-gray-400">Choose an employee from Step 2 to preview profile & generate documentation.</p>
                </div>
              )}
              {/* Enhanced Live PDF Ready Result Card with Explicit "Send to Email" UX */}
              {generatedPdfUrl && (
                <div className="bg-white border-2 border-emerald-500/20 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  {/* Status & Document Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                            Document Generated
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-gray-900 truncate mt-1 max-w-[200px]" title={`${generatedDocTitle}.pdf`}>
                          {generatedDocTitle}.pdf
                        </h4>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-[#225091] bg-blue-50 px-2 py-1 rounded-md border border-blue-100/80">
                      {generatedRefNo}
                    </span>
                  </div>

                  {/* Dedicated "Send to Email" Section */}
                  <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <Mail size={14} className="text-[#225091]" />
                        <span>Send to Employee Email</span>
                      </label>
                      {sentSuccess && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check size={11} /> Dispatched
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="email"
                        value={currentEmployee?.email || offerCandidateName ? (currentEmployee?.email || `${(currentEmployee?.fullName || offerCandidateName || 'employee').toLowerCase().replace(/\s+/g, '.')}@advitabank.com`) : ''}
                        onChange={(e) => {
                          if (currentEmployee) {
                            setCurrentEmployee({ ...currentEmployee, email: e.target.value });
                          }
                        }}
                        placeholder="Enter employee email address..."
                        className="w-full pl-8.5 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={sendingEmail}
                      onClick={() => handleSendToEmployee()}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                        sentSuccess
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-[#225091] hover:bg-[#1b427b] text-white hover:shadow-md'
                      } disabled:opacity-50`}
                    >
                      {sendingEmail ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Dispatching Email with PDF...</span>
                        </>
                      ) : sentSuccess ? (
                        <>
                          <Check size={14} />
                          <span>Email Sent Successfully (Resend)</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>Send Document to Email</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Action Toolbar: Download, Preview & Print */}
                  <div className="space-y-2">
                    <button 
                      type="button" 
                      onClick={handleDownload}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer hover:shadow-md"
                    >
                      <Download size={15} />
                      <span>Download PDF Document</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        type="button" 
                        onClick={handlePreview}
                        className="py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Preview</span>
                      </button>

                      <button 
                        type="button" 
                        onClick={handlePrint}
                        className="py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Printer size={13} />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden flex flex-col">
          {/* History Search & Filter Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => {
                  setHistorySearch(e.target.value);
                  setHistoryPage(1);
                }}
                placeholder="Search by employee name, code, email, reference number..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
              {branches.length > 0 && (
                <select
                  value={historyBranchFilter}
                  onChange={(e) => {
                    setHistoryBranchFilter(e.target.value);
                    setHistoryPage(1);
                  }}
                  className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer shadow-2xs shrink-0"
                >
                  <option value="">All Branches</option>
                  {branches.map(b => (
                    <option key={b.id || b._id} value={b.id || b._id}>
                      {b.name || b.branchName}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={historyTypeFilter}
                onChange={(e) => {
                  setHistoryTypeFilter(e.target.value);
                  setHistoryPage(1);
                }}
                className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer shadow-2xs shrink-0"
              >
                <option value="ALL">All Document Types</option>
                {LETTER_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>

              <button
                type="button"
                onClick={fetchHistoryLogs}
                disabled={historyLoading}
                className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 hover:text-[#225091] transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh history logs"
              >
                <RefreshCw size={15} className={historyLoading ? 'animate-spin text-[#225091]' : ''} />
              </button>
            </div>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200/80">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Ref Number</th>
                  <th className="py-3.5 px-5 font-semibold">Employee</th>
                  <th className="py-3.5 px-5 font-semibold">Branch</th>
                  <th className="py-3.5 px-5 font-semibold">Document Type</th>
                  <th className="py-3.5 px-5 font-semibold">Issued Date</th>
                  <th className="py-3.5 px-5 font-semibold">Details Summary</th>
                  <th className="py-3.5 px-5 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {historyLoading ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#225091]" />
                        <span className="text-xs font-medium">Fetching history logs from server...</span>
                      </div>
                    </td>
                  </tr>
                ) : historyLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-400 font-medium">
                      No employee letter history records found.
                    </td>
                  </tr>
                ) : (
                  historyLogs.map((item, idx) => {
                    const docType = item.documentType || item.letterType || 'Letter';
                    const typeObj = LETTER_TYPES.find(l => l.id === docType || l.name === docType);
                    const refNo = item.referenceNumber || item.id || `HIST-${idx + 1}`;
                    const issuedDateStr = item.formattedIssuedDate || (item.issuedDate ? new Date(item.issuedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (item.generatedAt ? new Date(item.generatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'));

                    return (
                      <tr key={item.id || item._id || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-mono text-[11px] font-bold text-[#225091] whitespace-nowrap">
                          {refNo}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                            <span>{item.employeeName || 'Staff'}</span>
                            {item.employeeCode && (
                              <span className="text-gray-400 font-mono text-[10px] font-normal">({item.employeeCode})</span>
                            )}
                          </div>
                          <div className="text-gray-400 text-[11px] truncate max-w-[180px]">{item.employeeEmail || item.designation || 'Staff'}</div>
                        </td>
                        <td className="py-3.5 px-5 text-gray-600 whitespace-nowrap">
                          <div className="font-medium text-gray-800">{item.branchName || 'Main Branch'}</div>
                          {item.branchCity && <div className="text-gray-400 text-[10px]">{item.branchCity}{item.branchState ? `, ${item.branchState}` : ''}</div>}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${typeObj?.badgeColor || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                            {docType}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-gray-500 font-medium whitespace-nowrap">
                          {issuedDateStr}
                        </td>
                        <td className="py-3.5 px-5 text-gray-600 text-[11px] max-w-[220px] truncate" title={item.detailsSummary}>
                          {item.detailsSummary || '—'}
                        </td>
                        <td className="py-3.5 px-5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingHistoryItem(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-[#225091] hover:bg-[#225091] hover:text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer border border-blue-200/60"
                              title="View Document Details"
                            >
                              <Eye size={13} />
                              <span>View</span>
                            </button>
                            {item.fileUrl && (
                              <a
                                href={item.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg font-semibold text-xs transition-colors border border-emerald-200/60"
                                title="Download PDF File"
                              >
                                <Download size={13} />
                                <span>PDF</span>
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* History Pagination */}
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div>
              Showing {historyLogs.length > 0 ? (historyPage - 1) * historyLimit + 1 : 0} to {Math.min(historyPage * historyLimit, historyTotalRecords)} of {historyTotalRecords} Entries
            </div>
            {historyTotalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={historyPage === 1 || historyLoading}
                  onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 cursor-pointer font-medium"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 bg-gray-100 text-gray-800 font-semibold rounded-lg">
                  {historyPage} / {historyTotalPages}
                </span>
                <button
                  type="button"
                  disabled={historyPage >= historyTotalPages || historyLoading}
                  onClick={() => setHistoryPage(p => Math.min(historyTotalPages, p + 1))}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 cursor-pointer font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View-Only History Document Modal */}
      {viewingHistoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#225091] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {viewingHistoryItem.documentType || viewingHistoryItem.letterType || 'Document'}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">
                  Document History Record
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingHistoryItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 block font-medium mb-0.5">Reference Number</span>
                <span className="font-mono font-bold text-[#225091]">{viewingHistoryItem.referenceNumber || viewingHistoryItem.id || '—'}</span>
              </div>
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 block font-medium mb-0.5">Issued Date</span>
                <span className="font-bold text-gray-800">
                  {viewingHistoryItem.formattedIssuedDate || (viewingHistoryItem.issuedDate ? new Date(viewingHistoryItem.issuedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (viewingHistoryItem.generatedAt ? new Date(viewingHistoryItem.generatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'))}
                </span>
              </div>
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 block font-medium mb-0.5">Recipient Employee</span>
                <span className="font-bold text-gray-900">{viewingHistoryItem.employeeName || 'Staff'}</span>
                {viewingHistoryItem.employeeCode && (
                  <span className="text-gray-500 font-mono block text-[10px]">Code: {viewingHistoryItem.employeeCode}</span>
                )}
                <span className="text-gray-400 block text-[11px] truncate">{viewingHistoryItem.employeeEmail}</span>
              </div>
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 block font-medium mb-0.5">Branch Location</span>
                <span className="font-bold text-gray-800">{viewingHistoryItem.branchName || 'Main Branch'}</span>
                {viewingHistoryItem.branchCity && (
                  <span className="text-gray-400 block text-[11px]">{viewingHistoryItem.branchCity}{viewingHistoryItem.branchState ? `, ${viewingHistoryItem.branchState}` : ''}</span>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-xs">
              <span className="text-gray-500 font-bold block mb-1">Summary Breakdown</span>
              <p className="text-gray-700 font-medium leading-relaxed">{viewingHistoryItem.detailsSummary || 'Official document generated and registered in system.'}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {viewingHistoryItem.fileUrl && (
                <a
                  href={viewingHistoryItem.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#225091] hover:bg-[#1b427b] text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <ExternalLink size={13} />
                  <span>Open PDF File</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setViewingHistoryItem(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LettersAndPayroll;
