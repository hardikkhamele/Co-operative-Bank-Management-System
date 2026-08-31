import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Calendar, 
  Phone, 
  Mail, 
  Lock, 
  Map, 
  MapPin, 
  Clock, 
  Banknote, 
  Users, 
  Check, 
  ArrowUpToLine, 
  AlertCircle, 
  ArrowLeftRight, 
  ArrowLeft,
  Edit,
  RefreshCw,
  Target,
  TrendingUp,
  Award
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { branchService } from '../../api/branchService';
import { Skeleton } from '../../components/common/Skeleton';

const formatWeeklyOff = (weeklyOff) => {
  if (!weeklyOff) return 'Sunday';
  if (typeof weeklyOff === 'string') return weeklyOff;
  if (Array.isArray(weeklyOff)) {
    return weeklyOff.map(item => (typeof item === 'object' && item !== null ? item.day || item.name || 'Sunday' : item)).join(', ');
  }
  if (typeof weeklyOff === 'object' && weeklyOff !== null) {
    const mainDay = weeklyOff.day || weeklyOff.weeklyOffDay || 'Sunday';
    if (weeklyOff.secondWeeklyOff && weeklyOff.secondWeeklyOffDay) {
      return `${mainDay} & ${weeklyOff.secondWeeklyOffDay}`;
    }
    return mainDay;
  }
  return String(weeklyOff);
};

const DetailCard = ({ icon: Icon, label, value }) => {
  let displayVal = value;
  if (typeof value === 'object' && value !== null) {
    if (value.addressLine1 || value.city) {
      displayVal = [value.addressLine1, value.city, value.state, value.pincode].filter(Boolean).join(', ');
    } else if (value.day !== undefined) {
      displayVal = formatWeeklyOff(value);
    } else {
      displayVal = value.name || value.title || '—';
    }
  }

  return (
    <div className="bg-[#f8f9fa] rounded-xl p-4 flex items-center gap-4 border border-gray-100/60 shadow-2xs">
      <div className="text-[#225091] flex-shrink-0">
        <Icon size={20} strokeWidth={2} />
      </div>
      <div>
        <p className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-[#1b2559] font-bold text-sm">{displayVal || '—'}</p>
      </div>
    </div>
  );
};

const BooleanRuleCard = ({ label, active }) => (
  <div className={`rounded-xl p-4 flex items-center gap-3 border transition-colors ${
    active 
      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' 
      : 'bg-gray-50 border-gray-100 text-gray-500'
  }`}>
    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
      active ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'
    }`}>
      {active ? '✓' : '—'}
    </div>
    <span className="text-xs font-semibold">{label}</span>
  </div>
);

const ViewManager = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const targetId = id || location.state?.branchId || location.state?.id;
      if (!targetId) return;

      setLoading(true);
      try {
        const res = await branchService.getManagerProfile(targetId);
        if (res && (res.success || res.data)) {
          setProfileData(res.data || res);
        } else if (location.state) {
          setProfileData(location.state);
        }
      } catch (err) {
        console.error("Failed to load manager profile:", err);
        if (location.state) {
          setProfileData(location.state);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id, location.state]);

  const targetId = id || location.state?.branchId || location.state?.id || '';

  const manager = profileData?.manager || profileData?.rawManager || profileData || {};
  const branch = profileData?.branch || profileData?.rawBranch || {};
  const personal = manager.personalDetails || manager || {};
  const job = manager.jobDetails || {};
  const shift = manager.shiftSettings || {};
  const attendance = manager.attendanceSettings || {};
  const woffHoff = manager.woffHoffSettings || {};
  const kra = manager.kraSettings || {};

  const fullName = manager.fullName || manager.name || personal.fullName || 'Branch Manager';
  const designation = job.designation || manager.type || 'Branch Manager';
  const branchName = branch.name || profileData?.branchName || 'Main Branch';
  const email = manager.email || personal.email || '—';
  const phone = manager.phoneNumber || personal.phoneNumber || '—';

  return (
    <div className="flex flex-col gap-6 w-full font-sans antialiased pb-16">
      {/* Header Card */}
      <PageHeader
        title="Manager Details"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Branch Management', to: '/branch' },
          { label: 'Manager Details' }
        ]}
        showBack={true}
        backUrl={location.state?.from || "/branch"}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
        
        {/* Profile Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#225091] border border-blue-100 flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              {fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'BM'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
                <span className="px-3 py-0.5 bg-[#225091] text-white text-xs font-bold rounded-full">
                  {designation}
                </span>
              </div>
              <p className="text-xs font-medium text-gray-500 mt-1">
                {branchName} {branch.code ? `(${branch.code})` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-50 border border-gray-100 rounded-xl p-3 gap-6 text-xs">
              <div>
                <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Shift</p>
                <p className="text-gray-900 font-bold mt-0.5">{shift.punchInTime || '09:30'} - {shift.punchOutTime || '18:30'}</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Weekly Off</p>
                <p className="text-gray-900 font-bold mt-0.5">{formatWeeklyOff(shift.weeklyOff)}</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Joined</p>
                <p className="text-gray-900 font-bold mt-0.5">{job.joiningDate || '2026-01-01'}</p>
              </div>
            </div>

            {targetId && (
              <Link 
                to={`/managers/edit/${targetId}`}
                state={profileData}
                className="bg-[#225091] hover:bg-[#183d6e] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Edit size={14} /> Edit HR Settings
              </Link>
            )}
          </div>
        </div>

        {/* 1. Personal Details */}
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={18} className="text-[#225091]" />
            Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DetailCard icon={Users} label="Gender" value={personal.gender || '—'} />
            <DetailCard icon={Calendar} label="Date Of Birth" value={personal.dateOfBirth || '—'} />
            <DetailCard icon={Phone} label="Phone Number" value={phone} />
            <DetailCard icon={Mail} label="Email Address" value={email} />
            <DetailCard icon={Lock} label="Employee Code" value={manager.employeeCode || '—'} />
            <DetailCard icon={MapPin} label="Address" value={personal.address?.addressLine1 || personal.address || '—'} />
          </div>
        </div>

        {/* 2. Job Details */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Map size={18} className="text-[#225091]" />
            Job Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DetailCard icon={Map} label="Department" value={job.department || 'Branch Operations'} />
            <DetailCard icon={MapPin} label="Designation" value={job.designation || 'Branch Manager'} />
            <DetailCard icon={Banknote} label="Salary" value={job.salary ? `₹${Number(job.salary).toLocaleString('en-IN')}` : '—'} />
            <DetailCard icon={Calendar} label="Joining Date" value={job.joiningDate || '—'} />
            <DetailCard icon={Clock} label="Probation (Months)" value={job.probationPeriodMonths || '6'} />
            <DetailCard icon={MapPin} label="Assigned Branch" value={branchName} />
          </div>
        </div>

        {/* 3. Shift Settings */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-[#225091]" />
            Shift & Timing Rules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DetailCard icon={Clock} label="Punch In Time" value={shift.punchInTime || '09:30 AM'} />
            <DetailCard icon={Clock} label="Punch Out Time" value={shift.punchOutTime || '06:30 PM'} />
            <DetailCard icon={Clock} label="Late Grace (Mins)" value={`${shift.lateAllowedMinutes || 15} mins`} />
            <DetailCard icon={Clock} label="Half Day Threshold" value={`${shift.halfDayMinutes || 240} mins`} />
            <DetailCard icon={Clock} label="Full Day Threshold" value={`${shift.fullDayMinutes || 480} mins`} />
            <DetailCard icon={Calendar} label="Weekly Off Schedule" value={formatWeeklyOff(shift.weeklyOff)} />
          </div>
        </div>

        {/* 4. Attendance Settings */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowUpToLine size={18} className="text-[#225091]" />
            Attendance Rules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DetailCard icon={ArrowUpToLine} label="Punch Mode" value={attendance.punchMode || 'DOUBLE'} />
            <DetailCard icon={AlertCircle} label="No Out-Punch Action" value={attendance.noOutPunchAction || 'MARK_HALF_DAY'} />
            <DetailCard icon={Clock} label="WO / Holiday Action" value={attendance.presentOnHolidayAction || 'MARK_COFF'} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <BooleanRuleCard label="Overtime Policy Enabled" active={attendance.overtimeAllowed !== false} />
            <BooleanRuleCard label="Late Deduction Policy Active" active={attendance.lateCutAllowed !== false} />
            <BooleanRuleCard label="Early Leaving Tracking" active={attendance.earlyGoingAllowed !== false} />
          </div>
        </div>

        {/* 5. WOFF & HOFF Policy */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-[#225091]" />
            Weekly Off & Holiday (WOFF/HOFF) Rules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <BooleanRuleCard label="Sandwich Leave Rules on Weekly Off" active={woffHoff.sandwichWeeklyOff !== false} />
            <BooleanRuleCard label="Sandwich Leave Rules on Holidays" active={woffHoff.sandwichHoliday !== false} />
            <BooleanRuleCard label="Holiday Encashment Allowed" active={woffHoff.holidayEncashment === true} />
            <BooleanRuleCard label="Include WO in Leave Application" active={woffHoff.includeWoInLeave !== false} />
            <BooleanRuleCard label="Include Holiday in Leave Application" active={woffHoff.includeHolidayInLeave !== false} />
            <BooleanRuleCard label="Compensatory Off Entitlement" active={woffHoff.compOffAllowed !== false} />
          </div>
        </div>

        {/* 6. KRA Targets */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={18} className="text-[#225091]" />
            KRA Performance Targets ({kra.year || 2026})
          </h3>
          {Array.isArray(kra.targets) && kra.targets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {kra.targets.map((tgt, idx) => (
                <div key={idx} className="bg-slate-50/80 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-900">{tgt.product || `Target ${idx + 1}`}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase">{tgt.targetType || 'AMOUNT'}</span>
                    <span className="text-sm font-bold text-[#225091]">
                      {tgt.targetType === 'AMOUNT' ? `₹${Number(tgt.targetValue || 0).toLocaleString('en-IN')}` : tgt.targetValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 text-xs font-medium text-gray-500">
              No specific KRA targets configured for the current year.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ViewManager;
