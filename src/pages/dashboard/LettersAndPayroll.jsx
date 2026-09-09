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
  Check,
  PenTool,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Save,
  Image as ImageIcon,
  FileUp,
  RefreshCcw,
  Undo2,
  RotateCcw,
  Eraser,
  Pen
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import { Skeleton, SkeletonTable, SkeletonEmployeeProfile } from '../../components/common/Skeleton';
import { employeeService } from '../../api/employeeService';
import { branchService } from '../../api/branchService';
import { roleService } from '../../api/roleService';
import { letterService, DOCUMENT_TYPE_CODES } from '../../api/letterService';
import { validateEmail, validateAccountNumber, validateRequired } from '../../utils/validation';

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

const INITIAL_HISTORY = [];

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

// --- Interactive Touchpad & Mouse Signature Pad Canvas Component ---
const TouchpadSignatureCanvas = ({ onSaveSignature, initialPreview, onClear }) => {
  const canvasRef = React.useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#1B58A6'); // Bank Blue
  const [penWidth, setPenWidth] = useState(2.5); // 2.5px
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [hasDrawn, setHasDrawn] = useState(false);

  const colors = [
    { name: 'Bank Blue', hex: '#1B58A6', bg: 'bg-[#1B58A6]' },
    { name: 'Navy Blue', hex: '#0F294A', bg: 'bg-[#0F294A]' },
    { name: 'Black', hex: '#111827', bg: 'bg-gray-900' }
  ];

  const strokeWidths = [
    { name: 'Fine', value: 1.5 },
    { name: 'Medium', value: 2.5 },
    { name: 'Bold', value: 4.0 }
  ];

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokes.forEach(stroke => {
      if (stroke.points.length < 1) return;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.beginPath();
      
      if (stroke.points.length === 1) {
        ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = stroke.color;
        ctx.fill();
        return;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        const xc = (stroke.points[i].x + stroke.points[i - 1].x) / 2;
        const yc = (stroke.points[i].y + stroke.points[i - 1].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i - 1].x, stroke.points[i - 1].y, xc, yc);
      }
      const lastPoint = stroke.points[stroke.points.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
      ctx.stroke();
    });

    if (currentStroke.length > 0) {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.beginPath();
      if (currentStroke.length === 1) {
        ctx.arc(currentStroke[0].x, currentStroke[0].y, penWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = penColor;
        ctx.fill();
      } else {
        ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
        for (let i = 1; i < currentStroke.length; i++) {
          const xc = (currentStroke[i].x + currentStroke[i - 1].x) / 2;
          const yc = (currentStroke[i].y + currentStroke[i - 1].y) / 2;
          ctx.quadraticCurveTo(currentStroke[i - 1].x, currentStroke[i - 1].y, xc, yc);
        }
        const lastPoint = currentStroke[currentStroke.length - 1];
        ctx.lineTo(lastPoint.x, lastPoint.y);
        ctx.stroke();
      }
    }
  }, [strokes, currentStroke, penColor, penWidth]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    if (e.target.setPointerCapture) {
      try { e.target.setPointerCapture(e.pointerId); } catch {}
    }
    const coords = getCoordinates(e);
    setIsDrawing(true);
    setCurrentStroke([coords]);
    setHasDrawn(true);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    setCurrentStroke(prev => [...prev, coords]);
  };

  const handlePointerUp = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    if (e.target.releasePointerCapture) {
      try { e.target.releasePointerCapture(e.pointerId); } catch {}
    }
    setIsDrawing(false);
    if (currentStroke.length > 0) {
      const newStrokes = [...strokes, { points: currentStroke, color: penColor, width: penWidth }];
      setStrokes(newStrokes);
      setCurrentStroke([]);
      exportSignatureData(newStrokes);
    }
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setHasDrawn(false);
    if (onClear) onClear();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    toast.info('Signature canvas cleared.');
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);
    if (newStrokes.length === 0) {
      setHasDrawn(false);
      if (onClear) onClear();
      toast.info('All strokes undone.');
    } else {
      exportSignatureData(newStrokes, false);
      toast.info('Last signature stroke undone.');
    }
  };

  const exportSignatureData = (targetStrokes, notify = true) => {
    const canvas = canvasRef.current;
    if (!canvas || targetStrokes.length === 0) return;
    // Export strictly as transparent PNG
    const dataUrl = canvas.toDataURL('image/png');
    if (onSaveSignature) {
      onSaveSignature(dataUrl);
    }
    if (notify) {
      toast.success('Touchpad signature rendered in PNG format.');
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-150">
      {/* Control Bar: Pen Color & Stroke Size & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-gray-50/90 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          {/* Colors */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-gray-500 mr-1">Ink:</span>
            {colors.map(c => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setPenColor(c.hex)}
                className={`w-5 h-5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                  c.bg
                } ${penColor === c.hex ? 'ring-2 ring-offset-2 ring-[#225091] scale-110' : 'opacity-70 hover:opacity-100'}`}
                title={c.name}
              >
                {penColor === c.hex && <Check size={10} className="text-white" />}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-gray-300" />

          {/* Stroke Widths */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-gray-500 mr-1">Tip:</span>
            {strokeWidths.map(w => (
              <button
                key={w.name}
                type="button"
                onClick={() => setPenWidth(w.value)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  penWidth === w.value ? 'bg-[#225091] text-white shadow-2xs' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {w.name}
              </button>
            ))}
          </div>
        </div>

        {/* Undo & Clear Buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="px-2.5 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
            title="Undo last stroke"
          >
            <Undo2 size={12} />
            <span>Undo</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={strokes.length === 0 && !hasDrawn}
            className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
            title="Clear signature pad"
          >
            <RotateCcw size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Touchpad / Mouse Interactive Canvas Box */}
      <div className="relative border-2 border-dashed border-[#225091]/50 hover:border-[#225091] rounded-2xl bg-white p-1 overflow-hidden shadow-inner transition-colors">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-44 cursor-crosshair touch-none select-none rounded-xl bg-white block"
          style={{ touchAction: 'none' }}
        />

        {/* Watermark Guidelines & Hint */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <Pen size={11} /> Touchpad / Mouse Signature Pad
            </span>
            <span>Smooth Bézier Mode</span>
          </div>

          <div className="w-full border-b border-dashed border-gray-200 pb-1 text-right">
            <span className="text-[10px] text-gray-400 italic">Sign with touchpad / mouse above ✍️</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-500">
        <span className="flex items-center gap-1">
          💡 <strong className="text-gray-700">Touchpad signing:</strong> Click & drag your finger across your touchpad.
        </span>
        {hasDrawn && strokes.length > 0 && (
          <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            <Check size={12} /> Captured ({strokes.length} stroke{strokes.length > 1 ? 's' : ''})
          </span>
        )}
      </div>
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
  const [roles, setRoles] = useState([]);
  
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
  const [autoSendEmail, setAutoSendEmail] = useState(false);
  const [emailModalItem, setEmailModalItem] = useState(null);
  const [emailModalAddress, setEmailModalAddress] = useState('');
  const [sendingHistoryEmail, setSendingHistoryEmail] = useState(false);
  const [sentHistoryIds, setSentHistoryIds] = useState([]);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isMissingSignatureModalOpen, setIsMissingSignatureModalOpen] = useState(false);
  const [lastGeneratedSummary, setLastGeneratedSummary] = useState('');
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

  // Bank Official Signature & Signatory Management State (API 14)
  const [bankSignatureData, setBankSignatureData] = useState(null);
  const [sigLoading, setSigLoading] = useState(false);
  const [sigSaving, setSigSaving] = useState(false);
  const [sigSignatoryName, setSigSignatoryName] = useState('Aman Verma');
  const [sigSignatoryDesignation, setSigSignatoryDesignation] = useState('Head - Human Resources');
  const [sigFile, setSigFile] = useState(null);
  const [sigFilePreview, setSigFilePreview] = useState('');
  const [sigDirectUrl, setSigDirectUrl] = useState('');
  const [sigMode, setSigMode] = useState('file'); // 'file' | 'url'
  const [isDraggingSig, setIsDraggingSig] = useState(false);

  const fetchBankSignature = useCallback(async () => {
    setSigLoading(true);
    try {
      const res = await letterService.getBankSignatureSettings();
      if (res && res.success && res.data) {
        setBankSignatureData(res.data);
        if (res.data.signatoryName) setSigSignatoryName(res.data.signatoryName);
        if (res.data.signatoryDesignation) setSigSignatoryDesignation(res.data.signatoryDesignation);
        if (res.data.signatureUrl) {
          setSigDirectUrl(res.data.signatureUrl);
          setSigFilePreview(res.data.signatureUrl);
        }
      }
    } catch (err) {
      console.warn('Bank signature settings not yet configured or fetched with fallback:', err);
    } finally {
      setSigLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBankSignature();
  }, [fetchBankSignature]);

  const handleSignatureFileChange = (file) => {
    if (!file) return;
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    if (!isPng) {
      toast.error('Invalid format! Official signatures must be strictly in PNG format (.png).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Signature PNG file size should not exceed 5MB.');
      return;
    }
    setSigFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSigFilePreview(ev.target.result);
      toast.success(`PNG signature file "${file.name}" loaded successfully.`);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBankSignature = async (e) => {
    if (e) e.preventDefault();
    if (!sigSignatoryName.trim()) {
      toast.error('Please enter the Authorized Signatory Name.');
      return;
    }
    if (!sigSignatoryDesignation.trim()) {
      toast.error('Please enter the Signatory Designation / Title.');
      return;
    }

    setSigSaving(true);
    try {
      let payload;
      if (sigMode === 'file' && sigFile) {
        if (sigFile.type !== 'image/png' && !sigFile.name.toLowerCase().endsWith('.png')) {
          toast.error('All signatures must be in PNG format (.png).');
          setSigSaving(false);
          return;
        }
        payload = new FormData();
        payload.append('signature', sigFile);
        payload.append('signatoryName', sigSignatoryName.trim());
        payload.append('signatoryDesignation', sigSignatoryDesignation.trim());
      } else if (sigMode === 'url' && sigDirectUrl.trim()) {
        const lowerUrl = sigDirectUrl.toLowerCase();
        if (!lowerUrl.includes('.png') && !lowerUrl.startsWith('data:image/png')) {
          toast.warning('Note: Ensure your signature image URL points to a valid transparent PNG graphic.');
        }
        payload = {
          signatoryName: sigSignatoryName.trim(),
          signatoryDesignation: sigSignatoryDesignation.trim(),
          signatureUrl: sigDirectUrl.trim()
        };
      } else if (sigFilePreview && sigFilePreview.startsWith('data:image')) {
        payload = {
          signatoryName: sigSignatoryName.trim(),
          signatoryDesignation: sigSignatoryDesignation.trim(),
          signatureBase64: sigFilePreview
        };
      } else {
        payload = {
          signatoryName: sigSignatoryName.trim(),
          signatoryDesignation: sigSignatoryDesignation.trim(),
          signatureUrl: bankSignatureData?.signatureUrl || sigDirectUrl || undefined
        };
      }

      const res = await letterService.updateBankSignatureSettings(payload);
      if (res && res.success) {
        toast.success(res.message || 'Official bank PNG signature & authorized signatory profile saved successfully!');
        const updatedData = res.data || {
          ...bankSignatureData,
          signatoryName: sigSignatoryName.trim(),
          signatoryDesignation: sigSignatoryDesignation.trim(),
          signatureUrl: res.data?.signatureUrl || sigFilePreview || bankSignatureData?.signatureUrl,
          updatedAt: new Date().toISOString()
        };
        setBankSignatureData(updatedData);
        setSigFile(null);
      } else {
        toast.error(res?.message || 'Failed to update bank signature settings.');
      }
    } catch (err) {
      console.error('Error updating bank signature settings:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to update signature settings.');
    } finally {
      setSigSaving(false);
    }
  };

  const handleResetSignatureForm = () => {
    if (bankSignatureData) {
      setSigSignatoryName(bankSignatureData.signatoryName || '');
      setSigSignatoryDesignation(bankSignatureData.signatoryDesignation || '');
      setSigDirectUrl(bankSignatureData.signatureUrl || '');
      setSigFilePreview(bankSignatureData.signatureUrl || '');
      setSigFile(null);
      toast.info('Reset signature form to current active server configuration.');
    } else {
      setSigSignatoryName('Aman Verma');
      setSigSignatoryDesignation('Head - Human Resources');
      setSigDirectUrl('');
      setSigFilePreview('');
      setSigFile(null);
    }
  };

  const getItemTimestamp = (item) => {
    if (!item) return 0;
    if (item.createdAt) {
      const t = new Date(item.createdAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (item.generatedAt) {
      const t = new Date(item.generatedAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    if (item.updatedAt) {
      const t = new Date(item.updatedAt).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    // Extract timestamp from 24-hex MongoDB ObjectId
    const rawId = String(item._id || item.id || '');
    if (/^[0-9a-fA-F]{24}$/.test(rawId)) {
      const hexTime = parseInt(rawId.substring(0, 8), 16) * 1000;
      if (!isNaN(hexTime) && hexTime > 0) return hexTime;
    }
    if (item.issuedDate) {
      const t = new Date(item.issuedDate).getTime();
      if (!isNaN(t) && t > 0) return t;
    }
    return 0;
  };

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
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const response = await letterService.getHistory(params);
      let list = [];
      if (response && response.success) {
        list = Array.isArray(response.data) ? response.data : response.data?.items || response.data?.history || [];
      } else {
        const saved = localStorage.getItem('advita_letters_history');
        list = saved ? JSON.parse(saved) : [];
      }

      // Filter out any legacy dummy records
      list = list.filter(item => {
        const id = String(item.id || item._id || '');
        const name = String(item.employeeName || '');
        return !['HIST-001', 'HIST-002', 'HIST-003'].includes(id) && !['Aman Sharma', 'Lala Patil', 'Priya Deshmukh'].includes(name);
      });

      // Sort newest at the very top (descending by exact millisecond timestamp + ID)
      list.sort((a, b) => {
        const timeA = getItemTimestamp(a);
        const timeB = getItemTimestamp(b);
        if (timeB !== timeA) {
          return timeB - timeA;
        }
        const idA = String(a._id || a.id || a.referenceNumber || '');
        const idB = String(b._id || b.id || b.referenceNumber || '');
        return idB.localeCompare(idA);
      });

      setHistoryLogs(list);
      const total = response?.meta?.totalRecords ?? list.length;
      setHistoryTotalRecords(total);
      setHistoryTotalPages(Math.ceil(total / historyLimit) || 1);
      localStorage.setItem('advita_letters_history', JSON.stringify(list));
    } catch (err) {
      console.error('Failed to fetch employee letter history logs from API:', err);
      const saved = localStorage.getItem('advita_letters_history');
      let fallbackList = saved ? JSON.parse(saved) : [];
      fallbackList = fallbackList.filter(item => {
        const id = String(item.id || item._id || '');
        const name = String(item.employeeName || '');
        return !['HIST-001', 'HIST-002', 'HIST-003'].includes(id) && !['Aman Sharma', 'Lala Patil', 'Priya Deshmukh'].includes(name);
      });
      fallbackList.sort((a, b) => {
        const timeA = getItemTimestamp(a);
        const timeB = getItemTimestamp(b);
        if (timeB !== timeA) {
          return timeB - timeA;
        }
        const idA = String(a._id || a.id || a.referenceNumber || '');
        const idB = String(b._id || b.id || b.referenceNumber || '');
        return idB.localeCompare(idA);
      });
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
        const [empRes, branchRes, roleRes] = await Promise.allSettled([
          employeeService.list({ limit: 100 }),
          branchService.list({ limit: 100 }),
          roleService.list({ limit: 100 })
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

        if (roleRes.status === 'fulfilled' && roleRes.value && roleRes.value.success) {
          const rList = Array.isArray(roleRes.value.data) ? roleRes.value.data : roleRes.value.data?.items || roleRes.value.data?.roles || [];
          setRoles(rList);
        }
      } catch (err) {
        console.error('Failed to load employee/branch/role data:', err);
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

  const handleGenerateDocument = async (e, bypassSignatureCheck = false) => {
    if (e) e.preventDefault();
    if (!selectedEmployeeId) {
      toast.warning('Please select an employee first.');
      return;
    }

    // Check if official bank PNG signature is configured
    const hasSignature = !!(bankSignatureData?.signatureUrl || sigFilePreview);
    if (!hasSignature && !bypassSignatureCheck) {
      setIsMissingSignatureModalOpen(true);
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
          payload = { 
            ...payload, 
            candidateName: currentEmployee?.fullName || currentEmployee?.name || 'Employee', 
            designation: currentEmployee?.designation || currentEmployee?.role?.name || 'Staff Member', 
            joiningDate: currentEmployee?.joiningDate ? new Date(currentEmployee.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], 
            annualSalary: Number(currentEmployee?.salary) || 0 
          };
          summaryText = `Designation: ${payload.designation} | CTC: ₹${Number(payload.annualSalary).toLocaleString()}/yr`;
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
          if (!transferToBranchId) {
            toast.error('Please select a destination branch.');
            return;
          }
          payload = { ...payload, transferToBranchId: transferToBranchId, effectiveDate: transferEffectiveDate, reportingDate: transferReportingDate };
          const destBranch = branches.find(b => (b.id || b._id) === transferToBranchId);
          summaryText = `Transfer To: ${destBranch?.name || 'New Branch'} | Effective: ${transferEffectiveDate}`;
          break;
        case 'Salary Increment':
          if (!incCurrentCtc || Number(incCurrentCtc) <= 0) {
            toast.error('Current CTC must be greater than 0.');
            return;
          }
          payload = { ...payload, reviewPeriod: incReviewPeriod, effectiveDate: incEffectiveDate, incrementPercentage: Number(incPercentage) || 0, currentCtc: Number(incCurrentCtc) || 0, revisedCtc: Number(incRevisedCtc) || 0 };
          summaryText = `Increment: ${incPercentage}% | Revised CTC: ₹${Number(incRevisedCtc).toLocaleString()}/yr`;
          break;
        case 'Salary Slip':
          if (salaryAccountNumber && salaryAccountNumber.trim()) {
            const accCheck = validateAccountNumber(salaryAccountNumber.trim(), { required: false });
            if (!accCheck.isValid) {
              toast.error(accCheck.error);
              return;
            }
          }
          payload = { ...payload, salaryDate, payDate, payPeriod, workingDays: Number(salaryWorkingDays), presentDays: Number(salaryPresentDays), paidDays: Number(salaryPaidDays), lopDays: Number(salaryLopDays), accountNumber: salaryAccountNumber, earnings: earnings.filter(e => e.label.trim() !== ''), deductions: deductions.filter(d => d.label.trim() !== ''), employerContributions: employerContributions.filter(c => c.label.trim() !== '') };
          summaryText = `Period: ${payPeriod} | Net: ₹${salaryTotals.netSalary.toLocaleString()}`;
          break;
        case 'Termination Letter':
          if (!termReason || !termReason.trim()) {
            toast.error('Termination reason is required.');
            return;
          }
          payload = { ...payload, terminationDate: termDate, reason: termReason.trim(), noticePeriodDays: Number(termNoticePeriodDays), handoverTo: termHandoverTo };
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
      setLastGeneratedSummary(summaryText);
      setIsSuccessModalOpen(true);

      const newHistoryItem = {
        id: `HIST-${Date.now().toString().slice(-6)}`,
        letterType: selectedLetterType,
        documentType: selectedLetterType,
        employeeName: empName,
        employeeEmail: empEmail,
        referenceNumber: finalRefNo,
        designation: currentEmployee?.designation || offerDesignation || promoNewRole || 'Staff',
        branchName: currentEmployee?.branch?.name || currentEmployee?.branchName || 'Main Branch',
        branchCity: currentEmployee?.branch?.city || currentEmployee?.branch?.address?.city || '',
        branchState: currentEmployee?.branch?.state || currentEmployee?.branch?.address?.state || '',
        generatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        issuedDate: new Date().toISOString(),
        detailsSummary: summaryText,
        fileUrl: finalFileUrl,
        sentStatus: false
      };
      setHistoryLogs(prev => [newHistoryItem, ...prev.filter(item => (item.id || item._id) !== newHistoryItem.id)]);
      setHistoryTotalRecords(prev => prev + 1);

      const saved = localStorage.getItem('advita_letters_history');
      const existing = saved ? JSON.parse(saved) : [];
      localStorage.setItem('advita_letters_history', JSON.stringify([newHistoryItem, ...existing.filter(i => (i.id || i._id) !== newHistoryItem.id)]));

      fetchHistoryLogs();

      toast.success(
        <div className="flex flex-col">
          <span className="font-bold">{selectedLetterType} Generated Successfully!</span>
          <span className="text-xs">Document #{finalRefNo} is ready and logged in history.</span>
        </div>,
        { icon: <FileCheck className="text-[#225091]" size={18} /> }
      );

      if (autoSendEmail) {
        handleSendToEmployee(newHistoryItem);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to generate document.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToEmployee = async (item = null) => {
    const targetEmp = item ? { name: item.employeeName, email: item.employeeEmail, id: item.employeeId } : currentEmployee;
    const empName = targetEmp?.fullName || targetEmp?.name || (item?.employeeName) || 'Employee';
    const empEmail = (targetEmp?.email) || (item?.employeeEmail) || (currentEmployee?.email) || '';
    const empId = (item?.employeeId) || (currentEmployee?._id || currentEmployee?.id) || selectedEmployeeId;
    const docType = item?.documentType || item?.letterType || selectedLetterType;
    const docCode = DOCUMENT_TYPE_CODES[docType] || 'OFFER_LETTER';
    const rawId = item?.id || item?._id;
    const logId = rawId && String(rawId).length === 24 ? rawId : undefined;

    setSendingEmail(true);
    try {
      const payload = {
        employeeId: empId || undefined,
        documentTypeCode: docCode,
        customEmail: empEmail.trim() || undefined,
        logId: logId || undefined,
      };

      const response = await letterService.sendLetterEmail(payload, logId);
      
      if (item) {
        const itemId = item.id || item._id;
        setSentHistoryIds(prev => [...new Set([...prev, itemId])]);
        setHistoryLogs(prev => prev.map(h => ((h.id || h._id) === itemId ? { ...h, sentStatus: true, employeeEmail: empEmail } : h)));
      } else {
        setSentSuccess(true);
        setHistoryLogs(prev => {
          if (prev.length > 0) {
            const updated = [...prev];
            updated[0] = { ...updated[0], sentStatus: true, employeeEmail: empEmail };
            return updated;
          }
          return prev;
        });
      }

      const successMsg = response?.message || `Successfully sent ${docType} to ${empName} (${empEmail || 'registered email'}).`;
      toast.success(
        <div className="flex flex-col">
          <span className="font-bold">Document Dispatched!</span>
          <span className="text-xs">{successMsg}</span>
        </div>,
        { icon: <Send className="text-emerald-500" size={18} /> }
      );
    } catch (err) {
      console.error('Failed to send letter email via MSG91:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to send document to employee.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleOpenEmailModal = (item) => {
    setEmailModalItem(item);
    setEmailModalAddress(item.employeeEmail || (item.employeeName ? `${item.employeeName.toLowerCase().replace(/\s+/g, '.')}@advitabank.com` : ''));
  };

  const handleSendHistoryEmail = async () => {
    if (!emailModalItem) return;
    const emailCheck = validateEmail(emailModalAddress.trim());
    if (!emailCheck.isValid) {
      toast.error(emailCheck.error);
      return;
    }
    setSendingHistoryEmail(true);
    try {
      const rawId = emailModalItem.id || emailModalItem._id;
      const logId = rawId && String(rawId).length === 24 ? rawId : undefined;
      const docType = emailModalItem.documentType || emailModalItem.letterType || 'Offer Letter';
      const docCode = DOCUMENT_TYPE_CODES[docType] || 'OFFER_LETTER';
      const empId = emailModalItem.employeeId || undefined;

      const payload = {
        logId: logId || undefined,
        employeeId: empId,
        documentTypeCode: docCode,
        customEmail: emailModalAddress.trim(),
      };

      const response = await letterService.sendLetterEmail(payload, logId);

      const itemId = emailModalItem.id || emailModalItem._id;
      setSentHistoryIds(prev => [...new Set([...prev, itemId])]);
      setHistoryLogs(prev => prev.map(h => ((h.id || h._id) === itemId ? { ...h, sentStatus: true, employeeEmail: emailModalAddress } : h)));
      
      const successMsg = response?.message || `Successfully sent ${docType} to ${emailModalItem.employeeName || 'Employee'} (${emailModalAddress}).`;
      toast.success(
        <div className="flex flex-col">
          <span className="font-bold">Email Dispatched!</span>
          <span className="text-xs">{successMsg}</span>
        </div>,
        { icon: <Send className="text-emerald-500" size={18} /> }
      );
      setEmailModalItem(null);
    } catch (err) {
      console.error('Failed to dispatch history email via MSG91:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to dispatch document email.');
    } finally {
      setSendingHistoryEmail(false);
    }
  };

  const handleDownload = () => {
    if (!generatedPdfUrl) return;
    try {
      const link = document.createElement('a');
      link.href = generatedPdfUrl;
      link.download = `${generatedDocTitle || 'document'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Document downloaded successfully!', { icon: <Download className="text-[#225091]" size={18} /> });
    } catch (e) {
      console.error('Download error', e);
    }
  };

  const handlePrint = () => {
    if (!generatedPdfUrl) return;
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = generatedPdfUrl;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.focus();
            iframe.contentWindow?.print();
          } catch (err) {
            window.open(generatedPdfUrl, '_blank')?.print();
          }
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 2000);
        }, 400);
      };
    } catch (err) {
      window.open(generatedPdfUrl, '_blank');
    }
  };

  const handleResetForm = () => {
    setGeneratedPdfUrl('');
    setGeneratedPdfBlob(null);
    setGeneratedRefNo('');
    setGeneratedDocTitle('');
    setLastGeneratedSummary('');
    setSentSuccess(false);
    setSelectedEmployeeId('');
    setCurrentEmployee(null);
    setOfferCandidateName('');
    setOfferDesignation('');
    setOfferJoiningDate('');
    setOfferAnnualSalary('');
    setProbationStartDate('');
    setProbationEndDate('');
    setConfirmationDate('');
    setTransferToBranchId('');
    setTransferEffectiveDate('');
    setTransferReportingDate('');
    setTermDate('');
    toast.info('Form ready for new document generation.');
  };

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
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" onClick={() => setActiveTab('generate')} className={`px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm flex items-center gap-2 text-sm shrink-0 cursor-pointer ${activeTab === 'generate' ? 'bg-[#225091] text-white hover:bg-[#1b427b]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            <FileCheck size={16} />
            <span>Generate Document</span>
          </button>
          <button type="button" onClick={() => setActiveTab('history')} className={`px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm flex items-center gap-2 text-sm shrink-0 cursor-pointer ${activeTab === 'history' ? 'bg-[#225091] text-white hover:bg-[#1b427b]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            <History size={16} />
            <span>History ({historyTotalRecords})</span>
          </button>
          <button type="button" onClick={() => setActiveTab('signature')} className={`px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm flex items-center gap-2 text-sm shrink-0 cursor-pointer ${activeTab === 'signature' ? 'bg-[#225091] text-white hover:bg-[#1b427b]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            <PenTool size={16} />
            <span>Official Signature</span>
            {bankSignatureData?.signatureUrl ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white" title="Signature Active" />
            ) : (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">Setup</span>
            )}
          </button>
        </div>
      </PageHeader>



      {activeTab === 'generate' && (
        <div className="flex flex-col gap-5">
          {/* Bank Authorized Signatory Quick Banner */}
          <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-slate-50 border border-blue-100/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#225091] text-white flex items-center justify-center shrink-0 shadow-sm">
                <PenTool size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#225091]">
                    Official Bank Signatory
                  </span>
                  {bankSignatureData?.signatureUrl ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.2 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={11} /> Graphic Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.2 rounded-full flex items-center gap-1">
                      <AlertCircle size={11} /> Graphic Not Uploaded
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-800 font-semibold mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-gray-900 font-bold">{bankSignatureData?.signatoryName || sigSignatoryName || 'Authorized Signatory'}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{bankSignatureData?.signatoryDesignation || sigSignatoryDesignation || 'Head - Human Resources'}</span>
                  {bankSignatureData?.bankName && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500 font-normal">{bankSignatureData.bankName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('signature')}
              className="px-3.5 py-1.5 bg-white hover:bg-blue-50/80 border border-blue-200 text-[#225091] font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer self-end sm:self-auto"
            >
              <span>{bankSignatureData?.signatureUrl ? 'Manage Signature' : 'Configure Signature Graphic'}</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 sm:p-8 space-y-6">
              <form onSubmit={handleGenerateDocument} className="space-y-6">
                {/* Step 1: Select Document Type Dropdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#225091] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                      <span>Select Document Type</span>
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
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#225091] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                      <span>Select Society Employee</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-gray-500">
                      {employees.length} active staff available
                    </span>
                  </div>
                  <SearchableEmployeeSelect
                    employees={employees}
                    selectedEmployeeId={selectedEmployeeId}
                    onSelect={(id) => setSelectedEmployeeId(id)}
                    loading={fetchingEmployees}
                  />

                  {/* Selected Employee Profile Details Card */}
                  {currentEmployee && (
                    <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-[#225091]" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">Selected Employee Profile</span>
                        </div>
                        {currentEmployee.status && (
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            currentEmployee.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {currentEmployee.status}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Avatar & Title */}
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#225091] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                            {(currentEmployee.fullName || currentEmployee.name || 'E').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-gray-900">{currentEmployee.fullName || currentEmployee.name}</h4>
                              {currentEmployee.employeeCode && (
                                <span className="font-mono text-[10px] font-bold text-[#225091] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                  {currentEmployee.employeeCode}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-[#225091] mt-0.5">
                              {currentEmployee.designation || currentEmployee.role?.name || 'Society Staff Member'}
                            </p>
                          </div>
                        </div>

                        {/* Metadata Badges & Info */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-gray-600 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/70">
                          {(currentEmployee.branch?.name || currentEmployee.branchName) && (
                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200/60">
                              <Building2 size={13} className="text-[#225091] shrink-0" />
                              <span className="font-medium text-gray-700 truncate max-w-[130px]" title={currentEmployee.branch?.name || currentEmployee.branchName}>
                                {currentEmployee.branch?.name || currentEmployee.branchName}
                              </span>
                            </div>
                          )}
                          {currentEmployee.email && (
                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200/60 truncate">
                              <Mail size={13} className="text-[#225091] shrink-0" />
                              <span className="font-medium text-gray-700 truncate max-w-[130px]" title={currentEmployee.email}>
                                {currentEmployee.email}
                              </span>
                            </div>
                          )}
                          {currentEmployee.phoneNumber && (
                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200/60">
                              <Phone size={13} className="text-[#225091] shrink-0" />
                              <span className="font-medium text-gray-700">{currentEmployee.phoneNumber}</span>
                            </div>
                          )}
                          {currentEmployee.joiningDate && (
                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200/60">
                              <Calendar size={13} className="text-[#225091] shrink-0" />
                              <span className="font-medium text-gray-700">Joined {new Date(currentEmployee.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                          )}
                          {currentEmployee.salary && (
                            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200/60">
                              <CreditCard size={13} className="text-emerald-600 shrink-0" />
                              <span className="font-bold text-emerald-700">₹{Number(currentEmployee.salary).toLocaleString()}/yr</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Informational Callout for Offer Letter */}
                  {selectedLetterType === 'Offer Letter' && currentEmployee && (
                    <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-xs text-gray-700 animate-in fade-in duration-150">
                      <Info size={16} className="text-[#225091] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#225091]">Ready to Issue: </span>
                        <span>
                          Official Offer Letter will be generated for <strong>{currentEmployee.fullName || currentEmployee.name}</strong> as <strong>{currentEmployee.designation || currentEmployee.role?.name || 'Staff Member'}</strong> with salary and joining date pre-configured.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 3: Parameter Fields (Only for document types that require extra operational inputs) */}
                {selectedLetterType !== 'Offer Letter' && (
                  <div className="pt-4 border-t border-gray-100 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-[#225091] text-white text-[11px] font-bold flex items-center justify-center">3</span>
                        <span>{selectedLetterType} Parameters</span>
                      </label>
                      <span className="text-[11px] text-gray-500 font-medium ml-7 block">{LETTER_TYPES.find(l => l.id === selectedLetterType)?.description}</span>
                    </div>

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
                        <table className="w-full text-xs border-collapse text-center text-sm whitespace-nowrap">
                          <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]"><tr ><th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">KRA</th><th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Target</th><th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Achieved</th><th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Rating</th><th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center"></th></tr></thead>
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
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">New Upgraded Role <span className="text-rose-500">*</span></label>
                      <select
                        required
                        value={promoNewRole}
                        onChange={(e) => setPromoNewRole(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer"
                      >
                        <option value="">Select Upgraded Role</option>
                        {roles.map((r) => (
                          <option key={r.id || r._id} value={r.name}>
                            {r.name}
                          </option>
                        ))}
                        {promoNewRole && !roles.some(r => r.name === promoNewRole) && (
                          <option value={promoNewRole}>{promoNewRole}</option>
                        )}
                      </select>
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
              )}

                {/* Generate Options & Submit Button */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={autoSendEmail}
                      onChange={(e) => setAutoSendEmail(e.target.checked)}
                      className="w-4 h-4 rounded text-[#225091] focus:ring-[#225091] cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                        <Mail size={13} className="text-[#225091]" />
                        <span>Send copy to employee email automatically on generate</span>
                      </span>
                      <span className="text-[11px] text-gray-500">
                        The generated PDF will be downloaded immediately and automatically dispatched to the recipient's email.
                      </span>
                    </div>
                  </label>

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-[#225091] hover:bg-[#193e73] text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Generating & Preparing Download...</span>
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        <span>Generate & Download {selectedLetterType}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
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
            <table className="w-full border-collapse min-w-[850px] text-center text-sm whitespace-nowrap">
              <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
                <tr>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Ref Number</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Employee</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Document Type</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Issued Date</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Details Summary</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {historyLoading ? (
                  Array.from({ length: 5 }).map((_, rIdx) => (
                    <tr key={rIdx} className="animate-pulse">
                      <td className="py-4 px-5">
                        <Skeleton className="h-4 w-28 rounded" />
                      </td>
                      <td className="py-4 px-5">
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-32 rounded" />
                          <Skeleton className="h-3 w-40 rounded" />
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-24 rounded" />
                          <Skeleton className="h-2.5 w-16 rounded" />
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <Skeleton className="h-6 w-28 rounded-full" />
                      </td>
                      <td className="py-4 px-5">
                        <Skeleton className="h-4 w-20 rounded" />
                      </td>
                      <td className="py-4 px-5">
                        <Skeleton className="h-4 w-44 rounded" />
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Skeleton className="h-7 w-12 rounded-lg" />
                          <Skeleton className="h-7 w-16 rounded-lg" />
                        </div>
                      </td>
                    </tr>
                  ))
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
                                download={`${refNo || 'document'}.pdf`}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg font-semibold text-xs transition-colors border border-emerald-200/60"
                                title="Download PDF File"
                              >
                                <Download size={13} />
                                <span>PDF</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenEmailModal(item)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-colors border cursor-pointer ${
                                item.sentStatus || sentHistoryIds.includes(item.id || item._id)
                                  ? 'bg-purple-50 text-purple-700 border-purple-200/60 hover:bg-purple-100'
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-200/60 hover:bg-[#225091] hover:text-white'
                              }`}
                              title="Send Document to Employee Email"
                            >
                              {item.sentStatus || sentHistoryIds.includes(item.id || item._id) ? (
                                <>
                                  <CheckCircle2 size={13} className="text-purple-600" />
                                  <span>Sent</span>
                                </>
                              ) : (
                                <>
                                  <Mail size={13} />
                                  <span>Send to Email</span>
                                </>
                              )}
                            </button>
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
          <Pagination
            page={historyPage}
            totalPages={historyTotalPages || 1}
            totalRecords={historyTotalRecords}
            limit={historyLimit}
            onPageChange={setHistoryPage}
            disabled={historyLoading}
          />
        </div>
      )}

      {activeTab === 'signature' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          {/* Header Info Banner */}
          <div className="bg-gradient-to-r from-[#225091] via-[#1a4077] to-[#153460] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-100 text-xs font-semibold">
                <ShieldCheck size={14} />
                <span>Bank Official Signatory & Verification Authority</span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">Bank Official Signature & Signatory Profile</h2>
              <p className="text-xs text-blue-100/90 leading-relaxed">
                Configure your institution's authorized signatory name, title, and signature graphic image once.
                All 8 employee letters automatically render this signature image directly above the signatory line in generated PDFs.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 text-xs text-white shrink-0 min-w-[200px]">
              <span className="text-blue-200 block text-[11px]">Active Institution</span>
              <span className="font-bold text-sm block mt-0.5">{bankSignatureData?.bankName || 'Advita Co-operative Bank Society Ltd.'}</span>
              {bankSignatureData?.updatedAt && (
                <span className="text-[10px] text-blue-200/80 block mt-1">
                  Last Updated: {new Date(bankSignatureData.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Section */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-xs border border-gray-100 space-y-6">
              <form onSubmit={handleSaveBankSignature} className="space-y-6">
                {/* Mode Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                    Signature Graphic Input Source
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSigMode('file')}
                      className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        sigMode === 'file' ? 'bg-white text-[#225091] shadow-xs' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <UploadCloud size={14} />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSigMode('draw')}
                      className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        sigMode === 'draw' ? 'bg-white text-[#225091] shadow-xs' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Pen size={14} />
                      <span>Draw on Touchpad</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSigMode('url')}
                      className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        sigMode === 'url' ? 'bg-white text-[#225091] shadow-xs' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <ExternalLink size={14} />
                      <span>Image URL</span>
                    </button>
                  </div>
                </div>

                {/* Draw on Touchpad Mode */}
                {sigMode === 'draw' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                      <span>Draw Signature with Laptop Touchpad / Mouse <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-[#225091] font-semibold">Real-time vector smoothing</span>
                    </label>
                    <TouchpadSignatureCanvas
                      onSaveSignature={(dataUrl) => {
                        setSigFilePreview(dataUrl);
                        setSigFile(null);
                      }}
                      onClear={() => {
                        setSigFilePreview('');
                        setSigFile(null);
                      }}
                    />
                  </div>
                )}

                {/* File Upload Mode Dropzone */}
                {sigMode === 'file' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                      <span>Signature Graphic Image (PNG Only) <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] font-bold text-[#225091] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">.png format</span>
                    </label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingSig(true); }}
                      onDragLeave={() => setIsDraggingSig(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingSig(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleSignatureFileChange(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
                        isDraggingSig
                          ? 'border-[#225091] bg-blue-50/50 scale-[0.99]'
                          : 'border-gray-300 hover:border-[#225091] bg-gray-50/50 hover:bg-gray-50'
                      }`}
                      onClick={() => document.getElementById('signature-file-input')?.click()}
                    >
                      <input
                        id="signature-file-input"
                        type="file"
                        accept="image/png, .png"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleSignatureFileChange(e.target.files[0]);
                          }
                        }}
                      />

                      {sigFilePreview ? (
                        <div className="space-y-3">
                          <div className="max-w-[260px] h-24 mx-auto bg-white border border-gray-200 rounded-xl p-2 flex items-center justify-center shadow-2xs relative group">
                            <img
                              src={sigFilePreview}
                              alt="Signature Preview"
                              className="max-h-full max-w-full object-contain"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSigFile(null);
                                setSigFilePreview('');
                                toast.info('Signature graphic removed.');
                              }}
                              className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition-colors"
                              title="Remove Signature"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 font-medium">
                            {sigFile ? `Selected PNG: ${sigFile.name} (${(sigFile.size / 1024).toFixed(1)} KB)` : 'Current Active PNG Graphic'}
                          </p>
                          <span className="text-[11px] font-bold text-[#225091] hover:underline block">Click or Drag to Replace PNG Graphic</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#225091] flex items-center justify-center mx-auto border border-blue-100">
                            <FileUp size={22} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-800">Click to browse PNG</span>
                            <span className="text-xs text-gray-500"> or drag and drop PNG image here</span>
                          </div>
                          <p className="text-[11px] text-gray-400">
                            PNG format only with transparent background (.png, Max: 5MB, Recommended: 400×120px)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Direct URL Mode */}
                {sigMode === 'url' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 block">
                      Direct HTTP / S3 Signature Graphic URL <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <ImageIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={sigDirectUrl}
                        onChange={(e) => {
                          setSigDirectUrl(e.target.value);
                          setSigFilePreview(e.target.value);
                        }}
                        placeholder="https://storage.advitacredit.com/society/banks/signature.png"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]"
                      />
                    </div>
                    {sigDirectUrl && (
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                        <img
                          src={sigDirectUrl}
                          alt="Signature Preview"
                          className="h-12 max-w-[140px] object-contain bg-white rounded border p-1"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <span className="text-xs text-gray-600">URL preview rendering</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Signatory Profile Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Authorized Signatory Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={sigSignatoryName}
                      onChange={(e) => setSigSignatoryName(e.target.value)}
                      placeholder="e.g. Aman Verma"
                      className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Signatory Designation / Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={sigSignatoryDesignation}
                      onChange={(e) => setSigSignatoryDesignation(e.target.value)}
                      placeholder="e.g. Head - Human Resources"
                      className="w-full px-3.5 py-2.5 bg-gray-50/70 focus:bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleResetSignatureForm}
                    className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCcw size={13} />
                    <span>Reset</span>
                  </button>

                  <button
                    type="submit"
                    disabled={sigSaving || sigLoading}
                    className="px-6 py-2.5 bg-[#225091] hover:bg-[#193e73] text-white font-bold text-xs rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {sigSaving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Saving Settings...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Save Signature & Signatory Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Live Signatory Preview Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                        Document Stamp Preview
                      </h3>
                      <span className="text-[10px] text-gray-400">Live rendering on letter footer</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Official Stamp
                  </span>
                </div>

                {/* Stamp Simulation Box */}
                <div className="bg-gradient-to-b from-slate-50/80 to-white border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center space-y-3">
                  <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest">
                    Authorized Signatory
                  </div>

                  <div className="h-20 flex items-center justify-center my-2">
                    {sigFilePreview || bankSignatureData?.signatureUrl ? (
                      <img
                        src={sigFilePreview || bankSignatureData?.signatureUrl}
                        alt="Authorized Signature"
                        className="max-h-full max-w-[200px] object-contain drop-shadow-xs"
                      />
                    ) : (
                      <div className="border border-dashed border-gray-300 rounded-lg px-6 py-3 text-xs text-gray-400 italic">
                        [ Signature Graphic Image Space ]
                      </div>
                    )}
                  </div>

                  {/* Signatory line */}
                  <div className="w-48 mx-auto border-t-2 border-gray-800 pt-1">
                    <div className="font-extrabold text-xs text-gray-900 tracking-wide uppercase">
                      {sigSignatoryName.trim() || 'Aman Verma'}
                    </div>
                    <div className="text-[11px] font-semibold text-[#225091]">
                      {sigSignatoryDesignation.trim() || 'Head - Human Resources'}
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                      {bankSignatureData?.bankName || 'Advita Co-operative Bank Society Ltd.'}
                    </div>
                  </div>
                </div>

                {/* Checklist & Instructions */}
                <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 text-xs space-y-2.5 text-gray-700">
                  <span className="font-bold text-[#225091] flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>Cross-Document Integration</span>
                  </span>
                  <ul className="text-[11px] space-y-1.5 text-gray-600 list-disc list-inside">
                    <li>Renders above signatory line on Offer, Confirmation & Appraisal letters.</li>
                    <li>Embedded into Promotion, Branch Transfer, Increment & Termination notices.</li>
                    <li>Printed in monthly Salary Slips alongside authorized stamp.</li>
                    <li>Uploaded once and automatically synchronized for all future letter issuances.</li>
                  </ul>
                </div>
              </div>
            </div>
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

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  const item = viewingHistoryItem;
                  setViewingHistoryItem(null);
                  handleOpenEmailModal(item);
                }}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 border border-indigo-200 cursor-pointer"
              >
                <Mail size={13} />
                <span>Send to Email</span>
              </button>
              {viewingHistoryItem.fileUrl && (
                <a
                  href={viewingHistoryItem.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`${viewingHistoryItem.referenceNumber || 'document'}.pdf`}
                  className="px-4 py-2 bg-[#225091] hover:bg-[#193e73] text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Download size={13} />
                  <span>Download PDF</span>
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

      {/* Dedicated Send to Email Modal from History */}
      {emailModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#225091]/10 text-[#225091] flex items-center justify-center font-bold">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Send Document to Email</h3>
                  <p className="text-[11px] text-gray-500">
                    {emailModalItem.documentType || emailModalItem.letterType || 'Document'} ({emailModalItem.referenceNumber || 'Official Record'})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmailModalItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                <div className="flex justify-between text-gray-500">
                  <span>Recipient:</span>
                  <span className="font-bold text-gray-800">{emailModalItem.employeeName || 'Staff Member'}</span>
                </div>
                {emailModalItem.branchName && (
                  <div className="flex justify-between text-gray-500">
                    <span>Branch:</span>
                    <span className="font-medium text-gray-700">{emailModalItem.branchName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Recipient Email Address <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={emailModalAddress}
                    onChange={(e) => setEmailModalAddress(e.target.value)}
                    placeholder="Enter recipient email (e.g. employee@advitabank.com)"
                    className="w-full pl-8.5 pr-3 py-2.5 bg-gray-50/60 focus:bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all"
                  />
                </div>
              </div>

              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-[11px] text-[#225091] flex items-start gap-2">
                <Info size={14} className="shrink-0 mt-0.5" />
                <span>The official PDF document attachment along with reference details will be dispatched immediately.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEmailModalItem(null)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sendingHistoryEmail}
                onClick={handleSendHistoryEmail}
                className="px-5 py-2.5 bg-[#225091] hover:bg-[#193e73] text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {sendingHistoryEmail ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Send Email Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Full-Screen Document Preview Modal */}
      {isPreviewModalOpen && generatedPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
            {/* Modal Top Bar */}
            <div className="px-5 py-3.5 bg-white border-b border-gray-200 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#225091]/10 text-[#225091] flex items-center justify-center font-bold">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{selectedLetterType} Document Preview</h3>
                  <span className="text-[11px] font-mono text-gray-500">Ref: {generatedRefNo}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download size={13} />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Close Preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Embedded Iframe PDF Viewer */}
            <div className="flex-1 w-full bg-slate-100 overflow-hidden relative">
              <iframe
                src={`${generatedPdfUrl}#toolbar=0&navpanes=0`}
                title="Generated Letter Preview"
                className="w-full h-full border-0"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs shrink-0">
              <div className="text-gray-500">
                Recipient: <strong className="text-gray-800">{currentEmployee?.fullName || currentEmployee?.name || offerCandidateName || 'Employee'}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={sendingEmail}
                  onClick={() => handleSendToEmployee()}
                  className="px-4 py-1.5 bg-[#225091] hover:bg-[#193e73] text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send size={12} />
                  <span>{sendingEmail ? 'Sending...' : 'Send to Email'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Document Generated Success Modal */}
      {isSuccessModalOpen && generatedPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header with Success Badge */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                    Generated & Logged in History
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-1">
                    {selectedLetterType} Ready
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Document & Recipient Details */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 text-xs space-y-2">
              <div className="flex justify-between items-center text-gray-600">
                <span>Reference Number:</span>
                <span className="font-mono font-bold text-[#225091] bg-white px-2 py-0.5 rounded border border-blue-100">
                  {generatedRefNo}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Recipient Employee:</span>
                <span className="font-bold text-gray-900">
                  {currentEmployee?.fullName || currentEmployee?.name || 'Employee'}
                </span>
              </div>
              {currentEmployee?.designation && (
                <div className="flex justify-between items-center text-gray-600">
                  <span>Designation:</span>
                  <span className="font-medium text-gray-700">{currentEmployee.designation}</span>
                </div>
              )}
              {currentEmployee?.email && (
                <div className="flex justify-between items-center text-gray-600">
                  <span>Email:</span>
                  <span className="font-mono text-gray-700">{currentEmployee.email}</span>
                </div>
              )}
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleDownload}
                className="py-3 px-4 rounded-xl bg-[#225091] hover:bg-[#193e73] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Download size={15} />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setIsPreviewModalOpen(true);
                }}
                className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Eye size={15} />
                <span>Preview Document</span>
              </button>
            </div>

            {/* Email & Print Secondary Actions */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={sendingEmail}
                onClick={() => handleSendToEmployee()}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                  sentSuccess
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white hover:bg-blue-50 text-[#225091] border-blue-200'
                }`}
              >
                {sendingEmail ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : sentSuccess ? (
                  <Check size={13} />
                ) : (
                  <Send size={13} />
                )}
                <span>{sentSuccess ? 'Email Dispatched' : 'Send via Email'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer size={13} />
                <span>Print Document</span>
              </button>
            </div>

            {/* Footer Navigation */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  setActiveTab('history');
                  fetchHistoryLogs();
                }}
                className="text-xs font-bold text-[#225091] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <History size={14} />
                <span>Open in History Table ➔</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  handleResetForm();
                }}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>Generate Another</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Missing Signature Confirmation Prompt Modal */}
      {isMissingSignatureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                  <Pen size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Official Signature Not Configured
                  </h3>
                  <span className="text-xs text-amber-600 font-semibold">Signature Graphic Missing</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMissingSignatureModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-gray-700 space-y-2">
              <p>
                An official bank PNG signature has not been uploaded yet for <strong>{sigSignatoryName || 'Authorized Signatory'}</strong>.
              </p>
              <p className="text-[11px] text-gray-500">
                You can configure your PNG graphic now to embed a digital stamp, or proceed to generate the certificate with standard text signatory lines.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsMissingSignatureModalOpen(false);
                  setActiveTab('signature');
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#225091] hover:bg-[#193e73] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <Pen size={14} />
                <span>Configure Official Signature Now</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMissingSignatureModalOpen(false);
                  handleGenerateDocument(null, true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText size={14} />
                <span>Proceed Without Signature Graphic</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LettersAndPayroll;
