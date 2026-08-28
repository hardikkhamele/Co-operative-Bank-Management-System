import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Phone, Mail, MapPin, Plus, Trash2, Loader2, Target, 
  Calendar, Layers, CheckCircle2, Calculator 
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { kpaReportService } from '../../api/kpaReportService';
import { 
  deriveKpaGoals, 
  ALL_KPA_PRODUCTS, 
  getRecommendedProductsForRole 
} from '../../utils/kpaConstants';
import { Skeleton, SkeletonAvatar } from '../../components/common/Skeleton';

const AVAILABLE_YEARS = [2026, 2025, 2024, 2027];

const AddKRA = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loadingEmployee, setLoadingEmployee] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [employee, setEmployee] = useState({
    id: '',
    fullName: '',
    designation: '',
    phoneNumber: '',
    email: '',
    branchName: '',
  });

  const [kraRows, setKraRows] = useState([
    { id: 1, product: 'Loan Disbursement', targetType: 'AMOUNT', targetValue: '' },
  ]);

  useEffect(() => {
    if (!id) return;
    const loadEmployee = async () => {
      try {
        setLoadingEmployee(true);
        const res = await kpaReportService.getDetail(id, { year: selectedYear });
        if (res?.data?.employee) {
          const emp = res.data.employee;
          setEmployee(emp);

          // Pre-populate recommended targets matching role if empty
          const recommended = getRecommendedProductsForRole(emp.designation || emp.role);
          if (recommended && recommended.length > 0) {
            setKraRows(
              recommended.map((rec, idx) => ({
                id: idx + 1,
                product: rec.product,
                targetType: rec.targetType || 'AMOUNT',
                targetValue: rec.defaultTarget || '',
              }))
            );
          }
        }
      } catch (err) {
        console.error('Failed to load employee for KRA:', err);
        toast.warn('Could not load existing KRA profile for this employee.');
      } finally {
        setLoadingEmployee(false);
      }
    };
    loadEmployee();
  }, [id, selectedYear]);

  const handleAddRow = () => {
    const newId = kraRows.length > 0 ? Math.max(...kraRows.map(r => r.id)) + 1 : 1;
    setKraRows([
      ...kraRows,
      { id: newId, product: 'Deposit Collection', targetType: 'AMOUNT', targetValue: '' }
    ]);
  };

  const handleRemoveRow = (rowId) => {
    if (kraRows.length === 1) {
      toast.warn('At least one KPA target row is required.');
      return;
    }
    setKraRows(kraRows.filter(r => r.id !== rowId));
  };

  const handleRowChange = (rowId, field, value) => {
    setKraRows(
      kraRows.map(row => {
        if (row.id !== rowId) return row;

        const updated = { ...row, [field]: value };
        // Auto-adjust default targetType if product changes
        if (field === 'product') {
          const found = ALL_KPA_PRODUCTS.find(p => p.name === value);
          if (found) {
            updated.targetType = found.defaultType;
          }
        }
        return updated;
      })
    );
  };

  const handleSave = async () => {
    // Validate rows
    const validRows = kraRows.filter(r => r.product && r.targetValue !== '');
    if (validRows.length === 0) {
      toast.error('Please specify at least one valid product and target value.');
      return;
    }

    setSaving(true);
    try {
      // Save all targets sequentially or in parallel
      for (const row of validRows) {
        const payload = {
          employeeId: id,
          year: Number(selectedYear),
          product: row.product,
          targetType: row.targetType || 'AMOUNT',
          targetValue: Math.max(0, Number(row.targetValue) || 0)
        };

        // Try add/upsert endpoint
        try {
          await kpaReportService.addKpaTarget(payload);
        } catch (addErr) {
          // If already exists (409), call update endpoint
          if (addErr.response?.status === 409) {
            await kpaReportService.updateKpaTarget(payload);
          } else {
            throw addErr;
          }
        }
      }

      toast.success('KPA performance targets saved & synced successfully!');
      navigate(`/kpa-report/view/${id}`);
    } catch (err) {
      console.error('Failed to save KPA targets:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to save KPA targets.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Header */}
      <PageHeader
        title="Add / Configure KPA Targets"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'HR Management' },
          { label: 'KPA Report', to: '/kpa-report' },
          { label: 'View Report', to: `/kpa-report/view/${id}` },
          { label: 'Configure KPA' }
        ]}
        showBack={true}
        backUrl={`/kpa-report/view/${id}`}
      />

      {/* Employee Profile Header Card */}
      {loadingEmployee ? (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 flex items-center gap-4">
          <SkeletonAvatar size="w-16 h-16" rounded="rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shadow-2xs shrink-0 bg-blue-50/80 flex items-center justify-center text-[#225091] font-bold text-2xl">
              {employee.fullName ? employee.fullName.charAt(0).toUpperCase() : 'E'}
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-[19px] font-bold text-gray-900">{employee.fullName || 'Employee'}</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex px-2.5 py-0.5 bg-blue-50 text-[#225091] border border-blue-200/60 rounded-full text-xs font-semibold">
                  {employee.designation || 'Staff'}
                </span>
                {employee.employeeCode && (
                  <span className="text-xs text-gray-400 font-mono">({employee.employeeCode})</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex flex-col gap-2 text-xs text-gray-600 font-medium">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#225091]" /> {employee.phoneNumber || '—'}
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#225091]" /> {employee.email || '—'}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#225091]" /> {employee.branchName || 'Main Branch'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Target Configuration Panel */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 sm:p-8 flex flex-col gap-6">
        
        {/* Top Config Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Target size={18} className="text-[#225091]" />
              <span>Annual Target Configuration & Breakdown</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Specify yearly goals. The system automatically derives monthly, weekly, and daily milestone goals.
            </p>
          </div>

          {/* Fiscal Year Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-600">Fiscal Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer shadow-2xs"
            >
              {AVAILABLE_YEARS.map(yr => (
                <option key={yr} value={yr}>FY {yr} - {yr + 1}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Target Rows */}
        <div className="flex flex-col gap-5">
          {kraRows.map((row, index) => {
            const derived = deriveKpaGoals(row.targetValue);
            const isAmount = row.targetType === 'AMOUNT';

            const formatVal = (v) => {
              const formatted = Number(v).toLocaleString('en-IN');
              return isAmount ? `₹${formatted}` : formatted;
            };

            return (
              <div 
                key={row.id} 
                className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-5 transition-all flex flex-col gap-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  
                  {/* Fixed Product Title and Type Badge */}
                  <div className="md:col-span-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#225091] border border-blue-100 flex items-center justify-center font-bold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{row.product}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isAmount ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                        }`}>
                          {isAmount ? '₹ AMOUNT GOAL' : '🔢 COUNT GOAL'}
                        </span>
                        {employee.designation && (
                          <span className="text-[10px] text-gray-400 font-medium">Assigned via {employee.designation}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Yearly Target Input */}
                  <div className="md:col-span-6 flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Annual Goal ({row.targetType === 'AMOUNT' ? '₹ Target' : 'Total Count'})
                    </label>
                    <div className="relative">
                      {row.targetType === 'AMOUNT' && (
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-xs">₹</span>
                      )}
                      <input 
                        type="number" 
                        value={row.targetValue}
                        onChange={(e) => handleRowChange(row.id, 'targetValue', e.target.value)}
                        placeholder={row.targetType === 'AMOUNT' ? 'e.g. 2400000' : 'e.g. 150'}
                        className={`w-full ${row.targetType === 'AMOUNT' ? 'pl-7' : 'pl-3.5'} pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#225091] bg-white shadow-2xs`}
                      />
                    </div>
                  </div>
                </div>

                {/* Derived Milestone Goals Preview Bar */}
                {row.targetValue > 0 && (
                  <div className="bg-white border border-slate-200/70 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500 font-semibold">
                      <Calculator size={14} className="text-[#225091]" />
                      <span>Derived Goal Hierarchy:</span>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Daily Goal (W/5)</span>
                        <span className="font-bold text-gray-800">{formatVal(derived.daily)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Weekly Goal (M/4)</span>
                        <span className="font-bold text-gray-800">{formatVal(derived.weekly)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Monthly Goal (Y/12)</span>
                        <span className="font-bold text-gray-800">{formatVal(derived.monthly)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-emerald-600 font-bold uppercase">Yearly Total</span>
                        <span className="font-bold text-emerald-700">{formatVal(derived.yearly)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button 
          type="button"
          onClick={() => navigate(`/kpa-report/view/${id}`)}
          className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button 
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-[#225091] hover:bg-[#193e73] text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Saving KPA Targets...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={15} />
              <span>Save & Synchronize KPA Targets</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default AddKRA;
