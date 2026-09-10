import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Map as MapIcon, 
  List, 
  Building2, 
  Smartphone, 
  Check, 
  X,
  Copy,
  Navigation,
  MapPinOff,
  Info,
  AlertCircle
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import geoTaggingService from '../../api/geoTaggingService';
import { employeeService } from '../../api/employeeService';
import { branchService } from '../../api/branchService';
import useBranchStore from '../../store/branchStore';
import { toast } from 'react-toastify';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';

// Haversine formula to compute distance in meters
const calculateDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

// Helper to strictly verify if latitude and longitude are valid, non-zero coordinates
const hasValidCoordinates = (lat, lng) => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (isNaN(nLat) || isNaN(nLng)) return false;
  if (nLat === 0 && nLng === 0) return false;
  return true;
};

const VALID_STATUSES = ['ALL', 'IN_BRANCH', 'OUT_OF_GEOFENCE', 'GPS_INACTIVE'];

const GeoTagging = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation state passed from Attendance Report or other pages
  const navState = location.state || {};
  const targetEmployeeId = navState.employeeId || navState.id || null;
  const targetEmployeeName = navState.employeeName || navState.name || '';
  const targetPunchLat = navState.punchLat || navState.latitude || null;
  const targetPunchLng = navState.punchLng || navState.longitude || null;
  const targetPunchAddress = navState.punchAddress || navState.address || '';
  const navFrom = navState.from || null;

  // Read initial filter values from URL
  const initialStatusParam = (searchParams.get('status') || searchParams.get('filter') || (targetEmployeeId ? 'ALL' : 'ALL')).toUpperCase();
  const initialStatus = VALID_STATUSES.includes(initialStatusParam) ? initialStatusParam : 'ALL';
  const initialBranchFilter = searchParams.get('branch') || 'ALL';
  const initialSearch = searchParams.get('search') || '';
  const initialView = (searchParams.get('view') || 'MAP').toUpperCase();

  const [activeStatus, setActiveStatus] = useState(initialStatus); // ALL, IN_BRANCH, OUT_OF_GEOFENCE, GPS_INACTIVE
  const [selectedBranchFilter, setSelectedBranchFilter] = useState(initialBranchFilter); // 'ALL' or branchName
  const [viewMode, setViewMode] = useState(initialView === 'TABLE' ? 'TABLE' : 'MAP'); // MAP, TABLE
  const [records, setRecords] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [zeroGpsModalRecord, setZeroGpsModalRecord] = useState(null);
  const [showMapAnyway, setShowMapAnyway] = useState(false);
  const locationCache = useRef(new Map());
  const selectedRecordIdRef = useRef(targetEmployeeId || null);

  // Sync state changes to URL search params
  useEffect(() => {
    const params = {};
    if (activeStatus && activeStatus !== 'ALL') {
      params.status = activeStatus;
    }
    if (selectedBranchFilter && selectedBranchFilter !== 'ALL') {
      params.branch = selectedBranchFilter;
    }
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
    if (viewMode && viewMode !== 'MAP') {
      params.view = viewMode.toLowerCase();
    }

    setSearchParams(params, { replace: true });
  }, [activeStatus, selectedBranchFilter, searchQuery, viewMode, setSearchParams]);

  // Sync URL changes from browser back/forward navigation
  useEffect(() => {
    const urlStatus = (searchParams.get('status') || searchParams.get('filter') || 'ALL').toUpperCase();
    if (VALID_STATUSES.includes(urlStatus)) {
      setActiveStatus(prev => prev !== urlStatus ? urlStatus : prev);
    }
    const urlBranch = searchParams.get('branch') || 'ALL';
    setSelectedBranchFilter(prev => prev !== urlBranch ? urlBranch : prev);
    const urlView = (searchParams.get('view') || 'MAP').toUpperCase();
    if (urlView === 'TABLE' || urlView === 'MAP') {
      setViewMode(prev => prev !== urlView ? urlView : prev);
    }
  }, [searchParams]);

  // Handle employee selection with instant cache lookup and direct popup trigger
  const handleSelectRecord = async (record, shouldOpenModal = true) => {
    setSelectedRecord(record);
    selectedRecordIdRef.current = record?.id || null;
    setShowMapAnyway(false);
    const empId = record.employeeId || record.userId || record.id;
    if (!empId) return;

    // 1. Instant cache check (0ms response, zero flicker)
    if (locationCache.current.has(empId)) {
      const cached = locationCache.current.get(empId);
      const merged = { ...record, ...cached };
      setSelectedRecord(merged);
      const hasCoords = hasValidCoordinates(merged.punchLat, merged.punchLng);
      if (!hasCoords && shouldOpenModal) {
        setZeroGpsModalRecord(merged);
      }
      return;
    }

    try {
      const liveLoc = await geoTaggingService.getEmployeeLocation(empId);
      let rawLat = liveLoc?.latitude !== undefined ? liveLoc.latitude : liveLoc?.coordinates?.[1];
      let rawLng = liveLoc?.longitude !== undefined ? liveLoc.longitude : liveLoc?.coordinates?.[0];
      let valid = hasValidCoordinates(rawLat, rawLng);

      // Fallback to the coordinates we already have from the list API if the specific location API returns 0,0
      if (!valid && hasValidCoordinates(record.punchLat, record.punchLng)) {
        rawLat = record.punchLat;
        rawLng = record.punchLng;
        valid = true;
      }

      let dist = null;
      let isInside = false;
      let status = 'GPS_INACTIVE';

      if (valid) {
        const lat = Number(rawLat);
        const lng = Number(rawLng);
        const branchLat = Number(record.branchLat || 21.1458);
        const branchLng = Number(record.branchLng || 79.0882);
        dist = calculateDistanceInMeters(branchLat, branchLng, lat, lng);
        isInside = dist <= 100;
        status = isInside ? 'IN_BRANCH' : 'OUT_OF_GEOFENCE';

        const cacheData = {
          punchLat: lat,
          punchLng: lng,
          punchAddress: liveLoc?.address || record.punchAddress,
          lastUpdatedAt: liveLoc?.lastUpdatedAt || record.lastUpdatedAt || null,
          distanceMeters: dist,
          geofenceStatus: status,
          isZeroCoords: false,
          isLiveGps: Boolean(liveLoc?.lastUpdatedAt || record.isLiveGps),
        };

        locationCache.current.set(empId, cacheData);
        const updated = { ...record, ...cacheData };
        setSelectedRecord(updated);
        setRecords(prev => prev.map(r => (r.id === record.id ? updated : r)));
      } else {
        // Only mark inactive if BOTH live API and list API have no valid coordinates
        const cacheData = {
          punchLat: 0,
          punchLng: 0,
          punchAddress: liveLoc?.address || record.punchAddress,
          lastUpdatedAt: liveLoc?.lastUpdatedAt || null,
          distanceMeters: null,
          geofenceStatus: 'GPS_INACTIVE',
          isZeroCoords: true,
          isLiveGps: false,
        };

        locationCache.current.set(empId, cacheData);
        const updated = { ...record, ...cacheData };
        setSelectedRecord(updated);
        setRecords(prev => prev.map(r => (r.id === record.id ? updated : r)));

        if (shouldOpenModal && updated.isZeroCoords) {
          setZeroGpsModalRecord(updated);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch live employee GPS:', err);
    }
  };

  // Fetch real bank branches with instant store cache lookup
  const fetchBranchesList = async () => {
    try {
      // 1. Instant cache check from global branch store (0ms)
      const storeBranches = useBranchStore.getState().branchOptions;
      if (storeBranches && storeBranches.length > 0) {
        const formatted = storeBranches.map(b => ({
          id: b.id || b._id,
          name: b.name || 'Branch',
          code: b.code || '',
          lat: Number(b.latitude || b.lat || (b.address && b.address.latitude) || 21.1458),
          lng: Number(b.longitude || b.lng || (b.address && b.address.longitude) || 79.0882),
          address: b.address ? (typeof b.address === 'string' ? b.address : `${b.address.line1 || ''}, ${b.address.city || ''}, ${b.address.state || ''}`) : `${b.city || ''}, ${b.state || ''}`
        }));
        setBranches(formatted);
        return;
      }

      // 2. Fallback network fetch if store is not populated
      const res = await branchService.list({ limit: 100 });
      const branchList = Array.isArray(res?.data)
        ? res.data
        : res?.data?.items || res?.data?.branches || res?.branches || [];
      const formatted = branchList.map(b => ({
        id: b.id || b._id,
        name: b.name || 'Branch',
        code: b.code || '',
        lat: Number(b.latitude || b.lat || (b.address && b.address.latitude) || 21.1458),
        lng: Number(b.longitude || b.lng || (b.address && b.address.longitude) || 79.0882),
        address: b.address ? (typeof b.address === 'string' ? b.address : `${b.address.line1 || ''}, ${b.address.city || ''}, ${b.address.state || ''}`) : `${b.city || ''}, ${b.state || ''}`
      }));
      setBranches(formatted);
    } catch (err) {
      console.warn('Could not fetch branches for GeoTagging:', err);
    }
  };

  const fetchData = async (isPolling = false) => {
    if (!isPolling) {
      setLoading(true);
      locationCache.current.clear();
    }
    try {
      // 1. Fetch employees with locations from the new dedicated API
      const empData = await geoTaggingService.getEmployeesLocations({ limit: 50, includeBranchManagers: true });
      const empList = Array.isArray(empData) ? empData : [];
      // Fetch branch list from store to match coordinates since employee API omits branch lat/lng
      let storeBranches = useBranchStore.getState().branchOptions || [];
      
      // If store is empty, fetch them directly so distance calculations are accurate
      if (storeBranches.length === 0) {
        try {
          const res = await branchService.list({ limit: 100 });
          storeBranches = Array.isArray(res?.data) ? res.data : res?.data?.items || res?.data?.branches || res?.branches || [];
        } catch (e) {
          console.warn("Could not fetch branch coordinates for distance mapping.");
        }
      }

      let recordsData = empList.map((emp, idx) => {
        // Find the actual branch object from the global store to get its coordinates
        const realBranch = storeBranches.find(b => (b.id || b._id) === emp.branch?.id) || {};
        
        const bLat = Number(emp.branch?.latitude || emp.branch?.lat || realBranch.latitude || realBranch.lat || (realBranch.address?.latitude) || 21.1458);
        const bLng = Number(emp.branch?.longitude || emp.branch?.lng || realBranch.longitude || realBranch.lng || (realBranch.address?.longitude) || 79.0882);
        const bName = emp.branch?.name || emp.branch?.branchName || realBranch.name || 'Main Branch';
        const bAddr = emp.branch?.address || emp.officeAddress || realBranch.address || `${bName}, ${emp.state || 'Maharashtra'}`;

        const rawLat = emp.location?.latitude ?? emp.location?.coordinates?.[1] ?? emp.punchLat ?? emp.latitude;
        const rawLng = emp.location?.longitude ?? emp.location?.coordinates?.[0] ?? emp.punchLng ?? emp.longitude;
        const valid = hasValidCoordinates(rawLat, rawLng);

        let dist = null;
        let isInside = false;
        let status = 'GPS_INACTIVE';

        if (valid) {
          const lat = Number(rawLat);
          const lng = Number(rawLng);
          dist = calculateDistanceInMeters(bLat, bLng, lat, lng);
          isInside = dist <= 100; // 100 meters geofence
          status = isInside ? 'IN_BRANCH' : 'OUT_OF_GEOFENCE';
        }

        return {
          id: emp.id || emp._id || `EMP-GEO-${idx}`,
          employeeId: emp.id || emp._id || emp.employeeId,
          employeeCode: emp.employeeCode || '',
          employeeName: emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee',
          phone: emp.phoneNumber || '',
          designation: emp.designation || 'Staff',
          department: emp.department || 'Operations',
          branchName: bName,
          branchLat: bLat,
          branchLng: bLng,
          branchAddress: bAddr,
          punchInTime: emp.location?.lastUpdatedAt || emp.updatedAt || new Date().toISOString(),
          punchOutTime: null,
          punchLat: valid ? Number(rawLat) : 0,
          punchLng: valid ? Number(rawLng) : 0,
          punchAddress: emp.location?.address || emp.punchAddress || `${bName} Premises`,
          distanceMeters: dist,
          geofenceStatus: status,
          isZeroCoords: !valid,
          isLiveGps: Boolean(valid && emp.location?.lastUpdatedAt)
        };
      });

      // If navigated with a target employee from attendance report, merge or prepend target record
      if (targetEmployeeId) {
        const foundIdx = recordsData.findIndex(r => r.id === targetEmployeeId || r.employeeId === targetEmployeeId || (targetEmployeeName && r.employeeName?.toLowerCase() === targetEmployeeName.toLowerCase()));
        if (foundIdx !== -1) {
          const targetRec = { ...recordsData[foundIdx] };
          if (hasValidCoordinates(targetPunchLat, targetPunchLng)) {
            targetRec.punchLat = Number(targetPunchLat);
            targetRec.punchLng = Number(targetPunchLng);
            targetRec.punchAddress = targetPunchAddress || targetRec.punchAddress;
            targetRec.isZeroCoords = false;
            targetRec.distanceMeters = calculateDistanceInMeters(targetRec.branchLat, targetRec.branchLng, Number(targetPunchLat), Number(targetPunchLng));
            targetRec.geofenceStatus = targetRec.distanceMeters <= 100 ? 'IN_BRANCH' : 'OUT_OF_GEOFENCE';
          }
          recordsData[foundIdx] = targetRec;
          selectedRecordIdRef.current = targetRec.id;
        } else if (targetEmployeeName || targetEmployeeId) {
          const hasCoords = hasValidCoordinates(targetPunchLat, targetPunchLng);
          const bLat = 21.1458;
          const bLng = 79.0882;
          const dist = hasCoords ? calculateDistanceInMeters(bLat, bLng, Number(targetPunchLat), Number(targetPunchLng)) : null;
          const syntheticRec = {
            id: targetEmployeeId,
            employeeId: targetEmployeeId,
            employeeCode: '',
            employeeName: targetEmployeeName || 'Employee',
            phone: '',
            designation: 'Staff',
            department: 'Operations',
            branchName: 'Main Branch',
            branchLat: bLat,
            branchLng: bLng,
            branchAddress: 'Nagpur',
            punchInTime: new Date().toISOString(),
            punchOutTime: null,
            punchLat: hasCoords ? Number(targetPunchLat) : 0,
            punchLng: hasCoords ? Number(targetPunchLng) : 0,
            punchAddress: targetPunchAddress || 'Punched Location',
            distanceMeters: dist,
            geofenceStatus: hasCoords ? (dist <= 100 ? 'IN_BRANCH' : 'OUT_OF_GEOFENCE') : 'GPS_INACTIVE',
            isZeroCoords: !hasCoords,
            isLiveGps: false
          };
          recordsData = [syntheticRec, ...recordsData];
          selectedRecordIdRef.current = syntheticRec.id;
        }
      }

      // 3. Immediately render records and clear loading spinner - 0 blocking lag!
      setRecords(recordsData);
      setLoading(false);

      // 4. Preserve currently selected employee or select first on-demand
      if (recordsData.length > 0) {
        if (selectedRecordIdRef.current) {
          // If we already have a selected record, try to find it in the new data
          const existingRecord = recordsData.find(r => r.id === selectedRecordIdRef.current);
          if (existingRecord) {
            // Re-select it to update any new background data without opening modals
            handleSelectRecord(existingRecord, false);
          } else {
            handleSelectRecord(recordsData[0], false);
          }
        } else {
          handleSelectRecord(recordsData[0], false);
        }
      } else {
        setSelectedRecord(null);
        selectedRecordIdRef.current = null;
      }
    } catch (err) {
      console.error('Failed to load employee attendance geolocation data:', err);
      setRecords([]);
      setSelectedRecord(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    const initialize = async () => {
      await fetchBranchesList();
      await fetchData();
      
      // Poll API every 10 seconds for live employee tracking
      interval = setInterval(() => {
        fetchData(true);
      }, 10000);
    };
    
    initialize();
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);



  // Filter records by Branch first, then by Status & Search
  const branchScopedRecords = useMemo(() => {
    if (selectedBranchFilter === 'ALL') return records;
    return records.filter(item => {
      return (
        item.branchName === selectedBranchFilter ||
        item.branchId === selectedBranchFilter ||
        (item.branch && (item.branch.id === selectedBranchFilter || item.branch.name === selectedBranchFilter))
      );
    });
  }, [records, selectedBranchFilter]);

  const filteredRecords = useMemo(() => {
    return branchScopedRecords.filter(item => {
      const isZero = item.isZeroCoords || (item.punchLat === 0 && item.punchLng === 0) || item.geofenceStatus === 'GPS_INACTIVE' || item.distanceMeters === null;

      // Status Filter
      if (activeStatus === 'IN_BRANCH') {
        if (isZero) return false;
        if (item.geofenceStatus !== 'IN_BRANCH' || item.distanceMeters > 100) return false;
      }
      if (activeStatus === 'OUT_OF_GEOFENCE') {
        if (isZero) return false;
        if (item.geofenceStatus !== 'OUT_OF_GEOFENCE' && item.distanceMeters <= 100) return false;
      }
      if (activeStatus === 'GPS_INACTIVE') {
        if (!isZero) return false;
      }

      // Search Query
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
  }, [branchScopedRecords, activeStatus, searchQuery]);

  // Keep selected record in sync
  useEffect(() => {
    if (filteredRecords.length > 0) {
      const exists = filteredRecords.some(r => r.id === selectedRecord?.id);
      if (!exists) {
        setSelectedRecord(filteredRecords[0]);
        selectedRecordIdRef.current = filteredRecords[0]?.id || null;
      }
    } else {
      setSelectedRecord(null);
      selectedRecordIdRef.current = null;
    }
  }, [filteredRecords, selectedRecord]);

  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const inBranchCount = branchScopedRecords.filter(r => {
    const isZero = r.isZeroCoords || (r.punchLat === 0 && r.punchLng === 0) || r.geofenceStatus === 'GPS_INACTIVE' || r.distanceMeters === null;
    return !isZero && r.geofenceStatus === 'IN_BRANCH' && r.distanceMeters <= 100;
  }).length;

  const outOfGeofenceCount = branchScopedRecords.filter(r => {
    const isZero = r.isZeroCoords || (r.punchLat === 0 && r.punchLng === 0) || r.geofenceStatus === 'GPS_INACTIVE' || r.distanceMeters === null;
    return !isZero && (r.geofenceStatus === 'OUT_OF_GEOFENCE' || r.distanceMeters > 100);
  }).length;

  const noSignalCount = branchScopedRecords.filter(r => {
    const isZero = r.isZeroCoords || (r.punchLat === 0 && r.punchLng === 0) || r.geofenceStatus === 'GPS_INACTIVE' || r.distanceMeters === null;
    return isZero;
  }).length;

  return (
    <div className="space-y-5 pb-10 w-full animate-in fade-in duration-200">
      {/* 1. Header with minimal essential actions */}
      <PageHeader
        title="Geo Tagging"
        breadcrumbs={navFrom ? [
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Attendance Report', to: navFrom },
          { label: 'Geo Tagging' }
        ] : [
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Geo Tagging' }
        ]}
        showBack={Boolean(navFrom)}
        backUrl={navFrom || '/attendance-report'}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
            title="Refresh GPS Data"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#225091]' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </PageHeader>

      {/* 2. Minimal Filter & Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Branch Filter & Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Branch Filter Dropdown */}
          <div className="relative min-w-[170px]">
            <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#225091] pointer-events-none" />
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] cursor-pointer shadow-2xs transition-all"
            >
              <option value="ALL">All Branches ({records.length})</option>
              {branches.map(b => {
                const count = records.filter(r => r.branchName === b.name || r.branchId === b.id).length;
                return (
                  <option key={b.id || b.name} value={b.name}>
                    {b.name} {count > 0 ? `(${count})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            {[
              { id: 'ALL', label: 'All', count: branchScopedRecords.length, activeClass: 'bg-[#225091] text-white shadow-2xs' },
              { id: 'IN_BRANCH', label: 'Inside', count: inBranchCount, activeClass: 'bg-emerald-600 text-white shadow-2xs' },
              { id: 'OUT_OF_GEOFENCE', label: 'Out of Geofence', count: outOfGeofenceCount, activeClass: 'bg-amber-600 text-white shadow-2xs' },
              { id: 'GPS_INACTIVE', label: 'No Signal', count: noSignalCount, activeClass: 'bg-slate-700 text-white shadow-2xs' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveStatus(tab.id)}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeStatus === tab.id
                    ? tab.activeClass
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  activeStatus === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search employee or branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('MAP')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'MAP' ? 'bg-white text-[#225091] shadow-2xs' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Map View"
            >
              <MapIcon size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'TABLE' ? 'bg-white text-[#225091] shadow-2xs' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Table Log View"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Streamlined Content View */}
      {viewMode === 'MAP' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: Clean Staff List (5 cols) */}
          <div className="lg:col-span-5 space-y-2.5 h-[640px] overflow-y-auto pr-1.5 scrollbar-thin">
            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-8 text-center shadow-2xs">
                <MapPinOff size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-bold text-gray-700">No staff found</p>
                <p className="text-[11px] text-gray-400 mt-1">Try changing the branch or filter status</p>
              </div>
            ) : (
              filteredRecords.map(item => {
                const isSelected = selectedRecord?.id === item.id;
                const hasCoords = hasValidCoordinates(item.punchLat, item.punchLng);
                const isZero = !hasCoords || item.isZeroCoords || item.geofenceStatus === 'GPS_INACTIVE';
                const isInside = hasCoords && !isZero && item.geofenceStatus === 'IN_BRANCH' && item.distanceMeters !== null && item.distanceMeters <= 100;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectRecord(item, true)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? isZero
                          ? 'border-amber-400 bg-amber-50/40 shadow-xs border-l-4 border-l-amber-500'
                          : isInside
                            ? 'border-[#225091] bg-blue-50/40 shadow-xs border-l-4 border-l-[#225091]'
                            : 'border-amber-500 bg-amber-50/40 shadow-xs border-l-4 border-l-amber-600'
                        : 'border-gray-200/90 bg-white hover:border-gray-300 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 relative ${
                          isZero
                            ? 'bg-slate-100 text-slate-700'
                            : isInside
                              ? 'bg-blue-100 text-[#225091]'
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.employeeName.charAt(0)}
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                            isZero
                              ? 'bg-slate-400'
                              : isInside
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-gray-900">{item.employeeName}</h4>
                            {item.isLiveGps && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Mobile GPS Ping" />
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500">{item.designation || 'Staff'}</p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isZero
                          ? 'bg-slate-100 text-slate-700 border border-slate-200/80'
                          : isInside
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                      }`}>
                        {isZero ? 'No Signal' : isInside ? 'In Branch' : 'Out of Geofence'}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                      <span className="truncate max-w-[170px] flex items-center gap-1 font-medium text-gray-600">
                        <Building2 size={12} className="text-gray-400 shrink-0" />
                        {item.branchName}
                      </span>
                      <span className={`font-bold ${
                        isZero
                          ? 'text-gray-400 font-medium'
                          : isInside
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                      }`}>
                        {isZero
                          ? 'No GPS Signal'
                          : item.distanceMeters > 1000
                            ? `${(item.distanceMeters / 1000).toFixed(1)} km`
                            : `${item.distanceMeters} m`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Google Map & Presence Audit Card (7 cols) */}
          <div className="lg:col-span-7 space-y-3 sticky top-4">
            <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs">
              {/* Google Maps View or Zero GPS Visual State */}
              <div className="relative w-full h-[400px] bg-slate-100">
                {selectedRecord && (selectedRecord.isZeroCoords || (selectedRecord.punchLat === 0 && selectedRecord.punchLng === 0)) && !showMapAnyway ? (
                  /* Professional Zero-GPS Location Inactive UI Overlay */
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-50 via-slate-100/40 to-slate-100 relative overflow-hidden">
                    {/* Animated Radar Pulse Rings */}
                    <div className="relative mb-3 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-slate-300/30 animate-ping absolute" />
                      <div className="w-16 h-16 rounded-full bg-slate-200/80 border border-slate-300 flex items-center justify-center text-slate-600 shadow-sm relative z-10">
                        <MapPinOff size={28} className="text-slate-600" />
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 mb-1">
                      No Location Data Available (0, 0)
                    </h4>
                    <p className="text-xs text-gray-500 max-w-sm mb-4 leading-relaxed">
                      There is no live GPS coordinate data available for <span className="font-semibold text-gray-800">{selectedRecord.employeeName}</span> today.
                    </p>

                    <div className="bg-white/95 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-gray-200/90 shadow-2xs text-xs space-y-1.5 mb-4 text-left max-w-sm w-full">
                      <div className="flex items-center justify-between text-gray-600">
                        <span className="font-medium shrink-0">Registered Address:</span>
                        <span className="font-bold text-gray-800 truncate ml-2">{selectedRecord.punchAddress || 'Rameshwari road, nagpur'}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span className="font-medium shrink-0">Assigned Branch:</span>
                        <span className="font-semibold text-[#225091]">{selectedRecord.branchName}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span className="font-medium shrink-0">GPS Signal:</span>
                        <span className="font-bold text-slate-600">No Data Transmitted</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowMapAnyway(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#225091] hover:bg-[#183e70] transition-colors shadow-2xs cursor-pointer"
                      >
                        <MapIcon size={13} />
                        <span>Check on Map</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setZeroGpsModalRecord(selectedRecord)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 transition-colors border border-gray-200 shadow-2xs cursor-pointer"
                      >
                        <Info size={13} />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                ) : selectedRecord ? (
                  <div className="relative w-full h-full">
                    {showMapAnyway && (selectedRecord.isZeroCoords || (selectedRecord.punchLat === 0 && selectedRecord.punchLng === 0)) && (
                      <div className="absolute top-3 left-3 bg-[#225091] text-white px-3 py-1.5 rounded-full shadow-md z-10 flex items-center gap-1.5 text-[11px] font-bold backdrop-blur-xs">
                        <MapPin size={12} className="text-amber-400" />
                        <span>Registered Address: {selectedRecord.punchAddress || 'Rameshwari road, nagpur'}</span>
                        <button
                          type="button"
                          onClick={() => setShowMapAnyway(false)}
                          className="ml-1.5 text-white/80 hover:text-white cursor-pointer"
                          title="Show Radar State"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    <iframe
                      key={`${selectedRecord.id}-${selectedRecord.punchLat}-${selectedRecord.punchLng}-${showMapAnyway}`}
                      title="Google Maps Location"
                      width="100%"
                      height="100%"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={
                        googleMapsKey
                          ? `https://www.google.com/maps/embed/v1/place?key=${googleMapsKey}&q=${
                              (selectedRecord.punchLat && selectedRecord.punchLng && !(selectedRecord.punchLat === 0 && selectedRecord.punchLng === 0))
                                ? `${selectedRecord.punchLat},${selectedRecord.punchLng}`
                                : encodeURIComponent(selectedRecord.punchAddress || selectedRecord.branchAddress || selectedRecord.branchName || 'Nagpur, Maharashtra')
                            }&zoom=16`
                          : `https://maps.google.com/maps?q=${
                              (selectedRecord.punchLat && selectedRecord.punchLng && !(selectedRecord.punchLat === 0 && selectedRecord.punchLng === 0))
                                ? `${selectedRecord.punchLat},${selectedRecord.punchLng}`
                                : encodeURIComponent(selectedRecord.punchAddress || selectedRecord.branchAddress || selectedRecord.branchName || 'Nagpur, Maharashtra')
                            }&z=16&output=embed`
                      }
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <MapPin size={40} className="mb-2 opacity-40" />
                    <p className="text-xs font-semibold">Select an employee to view location</p>
                  </div>
                )}
              </div>

              {/* Enhanced Presence Audit Bar */}
              {selectedRecord && (() => {
                const hasCoords = hasValidCoordinates(selectedRecord.punchLat, selectedRecord.punchLng);
                const isZero = !hasCoords || selectedRecord.isZeroCoords || selectedRecord.geofenceStatus === 'GPS_INACTIVE';
                const isInside = hasCoords && !isZero && selectedRecord.geofenceStatus === 'IN_BRANCH' && selectedRecord.distanceMeters !== null && selectedRecord.distanceMeters <= 100;

                return (
                  <div className="p-4 bg-white border-t border-gray-100 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 text-sm">{selectedRecord.employeeName}</span>
                          <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                            {selectedRecord.designation || 'Staff'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isZero
                              ? 'bg-slate-100 text-slate-700 border border-slate-200'
                              : isInside
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-900'
                          }`}>
                            {isZero
                              ? 'GPS INACTIVE (NO DATA)'
                              : isInside
                                ? 'VERIFIED PRESENT (<100m)'
                                : `${selectedRecord.distanceMeters > 1000 ? `${(selectedRecord.distanceMeters / 1000).toFixed(1)} km` : `${selectedRecord.distanceMeters}m`} OUTSIDE`}
                          </span>
                        </div>
                        <p className="text-gray-500 text-[11px] mt-1">
                          <span className="font-semibold text-gray-700">{selectedRecord.branchName}</span> • {selectedRecord.punchAddress || 'Rameshwari road, nagpur'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                        {isZero && (
                          <button
                            type="button"
                            onClick={() => setZeroGpsModalRecord(selectedRecord)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#225091] bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200/60 shadow-2xs cursor-pointer"
                          >
                            <Info size={12} />
                            <span>No Data Pop-up</span>
                          </button>
                        )}

                        <a
                          href={
                            isZero
                              ? `https://www.google.com/maps?q=${encodeURIComponent(selectedRecord.punchAddress || selectedRecord.branchName)}`
                              : `https://www.google.com/maps?q=${selectedRecord.punchLat},${selectedRecord.punchLng}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#225091] hover:bg-[#183e70] transition-colors shadow-2xs cursor-pointer"
                        >
                          <span>Google Maps</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>

                    {/* Geofence Status Meter */}
                    <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <ShieldCheck size={13} className={isInside ? 'text-emerald-600' : 'text-gray-400'} />
                        <span>
                          {isZero
                            ? 'Perimeter Status: No live GPS coordinates received from device'
                            : isInside
                              ? 'Perimeter Status: Inside 100m authorized branch zone'
                              : `Perimeter Status: ${selectedRecord.distanceMeters > 1000 ? `${(selectedRecord.distanceMeters / 1000).toFixed(1)} km` : `${selectedRecord.distanceMeters}m`} away from branch anchor`}
                        </span>
                      </div>

                      {selectedRecord.lastUpdatedAt && (
                        <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1 shrink-0">
                          <Clock size={11} className="text-gray-400" />
                          <span>Pinged: {new Date(selectedRecord.lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      ) : (
        /* Minimal Table View */
        <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px] text-center text-sm whitespace-nowrap">
              <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
                <tr >
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Staff</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Punch Time</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Distance</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Status</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredRecords.map((item) => {
                  const hasCoords = hasValidCoordinates(item.punchLat, item.punchLng);
                  const isZero = !hasCoords || item.isZeroCoords || item.geofenceStatus === 'GPS_INACTIVE';
                  const isInside = hasCoords && !isZero && item.geofenceStatus === 'IN_BRANCH' && item.distanceMeters !== null && item.distanceMeters <= 100;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">{item.employeeName}</td>
                      <td className="py-3 px-4 text-gray-700">{item.branchName}</td>
                      <td className="py-3 px-4 text-gray-500">
                        {item.punchInTime ? new Date(item.punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {isZero ? (
                          <span className="text-gray-400 font-medium">No Signal</span>
                        ) : item.distanceMeters > 1000 ? (
                          `${(item.distanceMeters / 1000).toFixed(1)} km`
                        ) : (
                          `${item.distanceMeters} m`
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isZero
                            ? 'bg-slate-100 text-slate-700 border border-slate-200/80'
                            : isInside
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                        }`}>
                          {isZero ? 'No Signal' : isInside ? 'In Branch' : 'Out of Geofence'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectRecord(item, true);
                            setViewMode('MAP');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#225091] bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                          <MapIcon size={12} />
                          <span>Map</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Professional Zero GPS / Location Inactive Pop-up Modal */}
      {zeroGpsModalRecord && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-amber-100 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                  <MapPinOff size={24} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    No Location Data Available
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 uppercase tracking-wide">
                      No Data (0, 0)
                    </span>
                    <span className="text-[11px] text-gray-500">No Mobile Ping</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setZeroGpsModalRecord(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Information Card */}
            <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/70 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Staff Member:</span>
                <span className="font-bold text-gray-900">{zeroGpsModalRecord.employeeName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Designation:</span>
                <span className="font-semibold text-gray-800">{zeroGpsModalRecord.designation || 'Staff'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Assigned Branch:</span>
                <span className="font-bold text-[#225091]">{zeroGpsModalRecord.branchName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">GPS Status:</span>
                <span className="font-bold text-amber-700">No Data Available</span>
              </div>
              <div className="pt-2 border-t border-amber-200/60 flex items-start justify-between gap-3">
                <span className="text-gray-500 font-semibold shrink-0">Registered Address:</span>
                <span className="font-medium text-gray-800 text-right truncate">
                  {zeroGpsModalRecord.punchAddress || zeroGpsModalRecord.branchAddress || 'Rameshwari road, nagpur'}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              There is no live geolocation data available for this staff member. The employee has not logged in or transmitted mobile GPS coordinates today.
            </p>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setZeroGpsModalRecord(null);
                  setShowMapAnyway(true);
                  setViewMode('MAP');
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#225091] hover:bg-[#183e70] transition-colors shadow-2xs cursor-pointer"
              >
                <MapIcon size={13} />
                <span>Check on Map</span>
              </button>
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(zeroGpsModalRecord.punchAddress || zeroGpsModalRecord.branchAddress || zeroGpsModalRecord.branchName)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <span>External Maps</span>
                <ExternalLink size={12} />
              </a>
              <button
                type="button"
                onClick={() => setZeroGpsModalRecord(null)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
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

export default GeoTagging;
