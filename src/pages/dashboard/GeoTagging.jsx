import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  UserCheck, 
  Users, 
  RefreshCw, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  Map as MapIcon, 
  List, 
  AlertOctagon,
  Building2,
  Smartphone,
  Check,
  XCircle,
  X
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import geoTaggingService from '../../api/geoTaggingService';
import { getCurrentPosition } from '../../utils/geolocation';
import { toast } from 'react-toastify';

const GeoTagging = () => {
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, IN_BRANCH, OUT_OF_GEOFENCE
  const [viewMode, setViewMode] = useState('MAP'); // MAP, TABLE
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [capturingGps, setCapturingGps] = useState(false);
  const [punchData, setPunchData] = useState({
    employeeName: '',
    employeeId: 'EMP-750',
    designation: 'Loan Officer',
    branchName: 'Shivaji Nagar Main Branch',
    branchLat: 18.520400,
    branchLng: 73.856700,
    punchLat: 18.520440,
    punchLng: 73.856730,
    punchAddress: '',
    remarks: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, recordsData] = await Promise.all([
        geoTaggingService.getStats(),
        geoTaggingService.getRecords()
      ]);
      setStats(statsData);
      setRecords(recordsData);
      if (recordsData.length > 0 && !selectedRecord) {
        setSelectedRecord(recordsData[0]);
      }
    } catch {
      toast.error('Failed to load employee attendance geolocation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCaptureCurrentLocation = async () => {
    setCapturingGps(true);
    try {
      const pos = await getCurrentPosition();
      setPunchData(prev => ({
        ...prev,
        punchLat: pos.latitude,
        punchLng: pos.longitude,
        punchAddress: pos.address || `Current Location (${pos.latitude}, ${pos.longitude})`
      }));
      toast.success('Live GPS coordinates captured!');
    } catch {
      toast.error('Could not access device GPS');
    } finally {
      setCapturingGps(false);
    }
  };

  const handleAuditGeofence = async (recordId, newStatus) => {
    try {
      await geoTaggingService.updateGeofenceAudit(recordId, { status: newStatus });
      toast.success(`Attendance geofence status updated to ${newStatus.replace('_', ' ')}`);
      setRecords(prev => prev.map(r => r.id === recordId ? { ...r, geofenceStatus: newStatus, riskLevel: newStatus === 'IN_BRANCH' ? 'LOW' : r.riskLevel } : r));
      if (selectedRecord?.id === recordId) {
        setSelectedRecord(prev => ({ ...prev, geofenceStatus: newStatus, riskLevel: newStatus === 'IN_BRANCH' ? 'LOW' : prev.riskLevel }));
      }
    } catch {
      toast.error('Failed to update geofence status');
    }
  };

  const filteredRecords = records.filter(item => {
    // Filter by Tab
    if (activeTab === 'IN_BRANCH' && item.geofenceStatus !== 'IN_BRANCH') return false;
    if (activeTab === 'OUT_OF_GEOFENCE' && item.geofenceStatus !== 'OUT_OF_GEOFENCE') return false;

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.employeeName?.toLowerCase().includes(q) ||
        item.employeeId?.toLowerCase().includes(q) ||
        item.branchName?.toLowerCase().includes(q) ||
        item.punchAddress?.toLowerCase().includes(q) ||
        item.designation?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Employee Attendance & Geo-Location Tracker"
        subtitle="Monitor bank employee punch-in/out GPS coordinates, branch geofences & remote check-in audits"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-[#225091]' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPunchModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#225091] hover:bg-[#1b4177] active:scale-95 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <MapPin size={16} />
            <span>Record GPS Check-In</span>
          </button>
        </div>
      </PageHeader>

      {/* Top 4 Performance & Risk Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Present Today</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{stats?.presentToday || 42} <span className="text-xs text-gray-400 font-normal">/ {stats?.totalEmployees || 48} staff</span></h3>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              {stats?.onTimeRate || '92.8%'} On-Time Punch Rate
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#225091] flex items-center justify-center shrink-0 border border-blue-100">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">In-Branch Punches</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{stats?.inBranchPunches || 36}</h3>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 size={12} />
              Within 100m Branch Geofence
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Out of Geofence</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{stats?.outOfGeofencePunches || 6}</h3>
            <p className="text-xs text-amber-700 font-medium flex items-center gap-1 mt-1">
              <AlertTriangle size={12} />
              Field Visits / Remote Check-in
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <Navigation size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Absent / Not Checked In</p>
            <h3 className="text-2xl font-extrabold text-gray-700 mt-1">{stats?.absentToday || 6}</h3>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1">
              <Clock size={12} />
              Awaiting punch or on leave
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0 border border-gray-200">
            <XCircle size={24} />
          </div>
        </div>
      </div>

      {/* Control Bar: Tabs, Search & View Switcher */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Filter Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Check-Ins', count: records.length },
            { id: 'IN_BRANCH', label: 'In-Branch (On-Site)', count: records.filter(r => r.geofenceStatus === 'IN_BRANCH').length },
            { id: 'OUT_OF_GEOFENCE', label: 'Out of Geofence (Remote)', count: records.filter(r => r.geofenceStatus === 'OUT_OF_GEOFENCE').length, isAmber: true }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? tab.isAmber
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-[#225091] text-white shadow-xs'
                  : tab.isAmber
                    ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                    : 'bg-gray-100/70 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200/80 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right side: Search & View Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee, ID, branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all"
            />
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('MAP')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'MAP'
                  ? 'bg-white text-[#225091] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MapIcon size={14} />
              <span>Map View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-white text-[#225091] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={14} />
              <span>Table Log</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'MAP' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Employee List (4 cols) */}
          <div className="lg:col-span-4 space-y-3 max-h-[720px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Employees Checked-In ({filteredRecords.length})
              </span>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <MapPin size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-bold text-gray-700">No employee check-ins found</p>
                <p className="text-xs text-gray-500 mt-1">Try selecting a different filter or search term.</p>
              </div>
            ) : (
              filteredRecords.map(item => {
                const isSelected = selectedRecord?.id === item.id;
                const isOutOfGeofence = item.geofenceStatus === 'OUT_OF_GEOFENCE';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedRecord(item)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? isOutOfGeofence
                          ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-sm'
                          : 'border-[#225091] bg-blue-50/40 ring-2 ring-[#225091]/20 shadow-sm'
                        : isOutOfGeofence
                          ? 'border-amber-200 bg-white hover:border-amber-300 shadow-2xs'
                          : 'border-gray-200 bg-white hover:border-gray-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-[#225091] flex items-center justify-center font-bold text-xs shrink-0">
                          {item.employeeName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 leading-tight">{item.employeeName}</h4>
                          <span className="text-[11px] text-gray-500 font-medium">{item.employeeId} • {item.designation}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        item.geofenceStatus === 'IN_BRANCH'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.geofenceStatus === 'IN_BRANCH' ? 'In Branch' : 'Out of Geofence'}
                      </span>
                    </div>

                    <div className="mt-2.5 text-xs text-gray-600 flex items-start gap-1.5">
                      <Building2 size={13} className="shrink-0 text-gray-400 mt-0.5" />
                      <p className="line-clamp-1">{item.branchName}</p>
                    </div>

                    <div className="mt-1 text-xs text-gray-600 flex items-start gap-1.5">
                      <MapPin size={13} className="shrink-0 text-gray-400 mt-0.5" />
                      <p className="line-clamp-1">{item.punchAddress}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className="text-gray-500 font-medium flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(item.punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`font-bold ${
                        item.distanceMeters > 500
                          ? 'text-red-600 font-extrabold'
                          : item.distanceMeters > 100
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                      }`}>
                        {item.distanceMeters}m from branch
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Live Map & Inspector (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs relative">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Navigation size={18} className="text-[#225091]" />
                  <span className="text-sm font-bold text-gray-900">
                    {selectedRecord ? `${selectedRecord.employeeName} — Punch-In Location Map` : 'Branch Staff Geolocation Map'}
                  </span>
                </div>
                {selectedRecord && (
                  <a
                    href={`https://www.google.com/maps?q=${selectedRecord.punchLat},${selectedRecord.punchLng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#225091] hover:underline"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>

              {/* Embedded Live Map Display */}
              <div className="relative w-full h-[400px] bg-slate-100">
                {selectedRecord ? (
                  <iframe
                    title="Live Location Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedRecord.punchLng - 0.015}%2C${selectedRecord.punchLat - 0.01}%2C${selectedRecord.punchLng + 0.015}%2C${selectedRecord.punchLat + 0.01}&layer=mapnik&marker=${selectedRecord.punchLat}%2C${selectedRecord.punchLng}`}
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <MapPin size={48} className="mb-2 opacity-50" />
                    <p className="text-sm font-semibold">Select an employee to inspect punch coordinates</p>
                  </div>
                )}

                {/* Floating Map Legend */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-gray-200 shadow-md text-[11px] space-y-1.5">
                  <div className="font-bold text-gray-800 text-xs mb-1">Geofence Legend</div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-gray-700">Inside Branch (&lt;100m)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-gray-700">Remote Check-In (&gt;100m)</span>
                  </div>
                </div>
              </div>

              {/* Selected Pin Deep Audit Box */}
              {selectedRecord && (
                <div className="p-5 bg-white border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Left details (8 cols) */}
                    <div className="md:col-span-8 space-y-4">
                      {/* Distance Offset Risk Gauge */}
                      <div className={`p-4 rounded-xl border ${
                        selectedRecord.geofenceStatus === 'IN_BRANCH'
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-amber-50/60 border-amber-200'
                      }`}>
                        <div className="flex items-center gap-2.5">
                          {selectedRecord.geofenceStatus === 'IN_BRANCH' ? (
                            <ShieldCheck className="text-emerald-600 shrink-0" size={22} />
                          ) : (
                            <AlertTriangle className="text-amber-600 shrink-0" size={22} />
                          )}
                          <div>
                            <p className={`text-xs font-bold uppercase tracking-wider ${
                              selectedRecord.geofenceStatus === 'IN_BRANCH' ? 'text-emerald-800' : 'text-amber-800'
                            }`}>
                              {selectedRecord.geofenceStatus === 'IN_BRANCH' ? 'Geofence Validated (In-Office Punch)' : 'Remote / Out of Geofence Check-In'}
                            </p>
                            <p className="text-xs text-gray-700 mt-0.5">
                              Distance from Branch: <strong className="font-bold">{selectedRecord.distanceMeters} meters</strong> ({selectedRecord.geofenceStatus === 'IN_BRANCH' ? 'Within 100m authorized perimeter' : 'Exceeds branch perimeter threshold'}).
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Side by Side Declared Branch vs Check-In GPS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-1">
                            <Building2 size={12} /> Assigned Branch Office
                          </p>
                          <p className="text-xs text-gray-800 font-bold mt-1">{selectedRecord.branchName}</p>
                          <p className="text-xs text-gray-600 font-medium leading-snug">{selectedRecord.branchAddress}</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-2">GPS: {selectedRecord.branchLat}, {selectedRecord.branchLng}</p>
                        </div>

                        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200">
                          <p className="text-[11px] font-bold text-[#225091] uppercase flex items-center gap-1">
                            <MapPin size={12} /> Actual Punch-In Location
                          </p>
                          <p className="text-xs text-gray-800 font-bold mt-1">Checked In via Mobile App</p>
                          <p className="text-xs text-gray-600 font-medium leading-snug">{selectedRecord.punchAddress}</p>
                          <p className="text-[10px] text-[#225091] font-mono mt-2">GPS: {selectedRecord.punchLat}, {selectedRecord.punchLng}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right side Device & Decision Actions (4 cols) */}
                    <div className="md:col-span-4 flex flex-col justify-between space-y-4">
                      <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs">
                        <p className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">Audit Metadata</p>
                        <p className="text-gray-600 flex items-center gap-1.5">
                          <Clock size={13} className="text-gray-400" />
                          <span>Punch Time: <strong>{new Date(selectedRecord.punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong></span>
                        </p>
                        <p className="text-gray-600 flex items-center gap-1.5">
                          <Smartphone size={13} className="text-gray-400" />
                          <span className="truncate">{selectedRecord.deviceInfo}</span>
                        </p>
                        <p className="pt-1 text-gray-700 italic border-t border-gray-200/80">"{selectedRecord.remarks}"</p>
                      </div>

                      {/* Manager Audit Actions */}
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => handleAuditGeofence(selectedRecord.id, 'IN_BRANCH')}
                          className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check size={15} />
                          <span>Mark as Valid Check-In</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAuditGeofence(selectedRecord.id, 'OUT_OF_GEOFENCE')}
                          className="w-full py-2 px-3 bg-white hover:bg-amber-50 active:scale-98 text-amber-700 border border-amber-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <AlertTriangle size={14} />
                          <span>Flag Out-of-Geofence</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Table Audit View */
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Assigned Branch</th>
                  <th className="py-3.5 px-4">Punch-In Time</th>
                  <th className="py-3.5 px-4">Punch Address</th>
                  <th className="py-3.5 px-4">Branch Offset</th>
                  <th className="py-3.5 px-4">Geofence Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{item.employeeName}</div>
                      <div className="text-[11px] text-gray-500">{item.employeeId} • {item.designation}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      {item.branchName}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 font-medium">
                      {new Date(item.punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-gray-700">
                      {item.punchAddress}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold ${
                        item.distanceMeters > 500
                          ? 'text-red-600 font-extrabold'
                          : item.distanceMeters > 100
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                      }`}>
                        {item.distanceMeters}m
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.geofenceStatus === 'IN_BRANCH'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.geofenceStatus === 'IN_BRANCH' ? 'In Branch' : 'Out of Geofence'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRecord(item);
                            setViewMode('MAP');
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#225091] bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                          View Map
                        </button>
                        <a
                          href={`https://www.google.com/maps?q=${item.punchLat},${item.punchLng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded-lg text-gray-500 hover:text-[#225091] transition-colors"
                          title="Open Google Maps"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Record / Simulate GPS Check-In */}
      {isPunchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#225091] flex items-center justify-center">
                  <MapPin size={18} />
                </div>
                <h3 className="text-base font-bold text-gray-900">Record Employee GPS Check-In</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPunchModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Employee Name & ID</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kulkarni (EMP-755)"
                  value={punchData.employeeName}
                  onChange={(e) => setPunchData(prev => ({ ...prev, employeeName: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#225091]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Branch</label>
                <select
                  value={punchData.branchName}
                  onChange={(e) => setPunchData(prev => ({ ...prev, branchName: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#225091]"
                >
                  <option value="Shivaji Nagar Main Branch">Shivaji Nagar Main Branch</option>
                  <option value="Kothrud Sub-Branch">Kothrud Sub-Branch</option>
                  <option value="Swargate Branch">Swargate Branch</option>
                  <option value="Hadapsar Branch">Hadapsar Branch</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">Punch Coordinates (Lat, Lng)</label>
                  <button
                    type="button"
                    onClick={handleCaptureCurrentLocation}
                    disabled={capturingGps}
                    className="text-xs font-bold text-[#225091] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation size={12} />
                    <span>{capturingGps ? 'Capturing...' : 'Use My Current GPS'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Latitude"
                    value={punchData.punchLat}
                    onChange={(e) => setPunchData(prev => ({ ...prev, punchLat: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                  />
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Longitude"
                    value={punchData.punchLng}
                    onChange={(e) => setPunchData(prev => ({ ...prev, punchLng: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Punch Address Location</label>
                <input
                  type="text"
                  placeholder="e.g. FC Road Branch Office, Pune"
                  value={punchData.punchAddress}
                  onChange={(e) => setPunchData(prev => ({ ...prev, punchAddress: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Audit Notes / Shift Remarks</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Morning check-in on time."
                  value={punchData.remarks}
                  onChange={(e) => setPunchData(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsPunchModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!punchData.employeeName) {
                    toast.error('Please enter employee name');
                    return;
                  }
                  const newEntry = {
                    id: `ATT-GEO-${Date.now().toString().slice(-4)}`,
                    employeeId: `EMP-${Math.floor(700 + Math.random() * 90)}`,
                    employeeName: punchData.employeeName,
                    designation: punchData.designation,
                    department: 'Branch Staff',
                    branchName: punchData.branchName,
                    branchLat: punchData.branchLat,
                    branchLng: punchData.branchLng,
                    branchAddress: `${punchData.branchName}, Pune`,
                    punchInTime: new Date().toISOString(),
                    punchOutTime: null,
                    punchLat: punchData.punchLat,
                    punchLng: punchData.punchLng,
                    punchAddress: punchData.punchAddress || 'Captured via Device GPS',
                    distanceMeters: 14,
                    geofenceStatus: 'IN_BRANCH',
                    riskLevel: 'LOW',
                    deviceInfo: 'Web GPS Portal',
                    remarks: punchData.remarks || 'Standard on-time punch-in.'
                  };
                  setRecords(prev => [newEntry, ...prev]);
                  setSelectedRecord(newEntry);
                  setIsPunchModalOpen(false);
                  toast.success('Employee attendance GPS check-in recorded successfully!');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#225091] hover:bg-[#1b4177] active:scale-95 rounded-xl shadow-xs transition-all"
              >
                Save GPS Check-In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeoTagging;
