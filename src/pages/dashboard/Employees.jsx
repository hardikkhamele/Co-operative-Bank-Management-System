import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Search,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  X,
  Users,
  UserCheck,
  UserX,
  UserCog,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { employeeService } from "../../api/employeeService";
import { roleService } from "../../api/roleService";
import useBranchStore from "../../store/branchStore";

const Employees = () => {
  const navigate = useNavigate();

  // Data State
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Persistent Global Overview Stats (does not get wiped by table pagination/filters)
  const [overviewStats, setOverviewStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    managers: 0,
  });

  // Active Stat Card Filter ('ALL' | 'ACTIVE' | 'INACTIVE' | 'MANAGERS')
  const [activeStatCard, setActiveStatCard] = useState("ALL");

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [includeBranchManagers, setIncludeBranchManagers] = useState(true);

  // Dropdown Options State
  const [roleOptions, setRoleOptions] = useState([]);
  const { globalBranchId, branchOptions, fetchBranches } = useBranchStore();

  // Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // Load branch list if not already available
  useEffect(() => {
    if (!branchOptions || branchOptions.length === 0) {
      fetchBranches();
    }
  }, [branchOptions, fetchBranches]);

  // Extract unique States and State-to-City map from branchOptions
  const { statesList, stateCityMap } = useMemo(() => {
    const statesSet = new Set();
    const map = {};

    (branchOptions || []).forEach((b) => {
      if (b.state) {
        statesSet.add(b.state);
        if (!map[b.state]) map[b.state] = new Set();
        if (b.city) map[b.state].add(b.city);
      }
    });

    const states = Array.from(statesSet).sort();
    const finalMap = {};
    Object.keys(map).forEach((s) => {
      finalMap[s] = Array.from(map[s]).sort();
    });

    return { statesList: states, stateCityMap: finalMap };
  }, [branchOptions]);

  // Available cities for the selected state
  const availableCities = useMemo(() => {
    if (!selectedState) return [];
    return stateCityMap[selectedState] || [];
  }, [selectedState, stateCityMap]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Roles for Filter Dropdown
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roleRes = await roleService.list({ limit: 100 });
        if (roleRes && roleRes.success) {
          const list = Array.isArray(roleRes.data)
            ? roleRes.data
            : roleRes.data?.items || [];
          setRoleOptions(list);
        }
      } catch (err) {
        console.warn("Failed to load roles:", err);
      }
    };
    fetchRoles();
  }, []);

  // 1. Fetch Global Overview Stats (unfiltered accurate count)
  const fetchOverviewStats = useCallback(async () => {
    try {
      const params = {
        limit: 1000,
        includeBranchManagers: true,
      };
      if (globalBranchId) params.branchId = globalBranchId;
      if (selectedBranchId) params.branchId = selectedBranchId;

      const response = await employeeService.list(params);
      if (response && response.success) {
        const listData = Array.isArray(response.data)
          ? response.data
          : response.data?.items || response.data?.employees || response.items || [];

        // Calculate accurate overall metrics
        const total = listData.length;
        const active = listData.filter((e) => e.status === "ACTIVE" || !e.status).length;
        const inactive = listData.filter((e) => e.status === "INACTIVE").length;
        const managers = listData.filter(
          (e) =>
            e.type === "MANAGER" ||
            e.role?.code === "BRANCH_MANAGER" ||
            (e.designation && e.designation.toLowerCase().includes("manager"))
        ).length;

        setOverviewStats({
          total,
          active,
          inactive,
          managers,
        });
      }
    } catch (err) {
      console.warn("Failed to load overview stats:", err);
    }
  }, [globalBranchId, selectedBranchId]);

  useEffect(() => {
    fetchOverviewStats();
  }, [fetchOverviewStats]);

  // 2. Fetch Paginated / Filtered Employees for Table
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        includeBranchManagers,
      };

      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (selectedBranchId) {
        params.branchId = selectedBranchId;
      } else if (globalBranchId) {
        params.branchId = globalBranchId;
      }

      if (selectedRoleId) params.roleId = selectedRoleId;
      if (selectedState) params.state = selectedState;
      if (selectedCity) params.city = selectedCity;

      // Apply status from dropdown or stat card
      if (activeStatCard === "ACTIVE") {
        params.status = "ACTIVE";
      } else if (activeStatCard === "INACTIVE") {
        params.status = "INACTIVE";
      } else if (selectedStatus && selectedStatus !== "ALL") {
        params.status = selectedStatus.toUpperCase();
      }

      // If Branch Managers stat card is active
      if (activeStatCard === "MANAGERS") {
        params.includeBranchManagers = true;
        const managerRole = roleOptions.find(
          (r) => r.code === "BRANCH_MANAGER" || r.name?.toLowerCase().includes("manager")
        );
        if (managerRole?.id) {
          params.roleId = managerRole.id;
        }
      }

      const response = await employeeService.list(params);
      if (response && response.success) {
        let listData = Array.isArray(response.data)
          ? response.data
          : response.data?.items || response.data?.employees || response.items || [];

        // If filtering by managers card and backend didn't narrow it, filter client-side
        if (activeStatCard === "MANAGERS" && !params.roleId) {
          listData = listData.filter(
            (e) =>
              e.type === "MANAGER" ||
              e.role?.code === "BRANCH_MANAGER" ||
              (e.designation && e.designation.toLowerCase().includes("manager"))
          );
        }

        setEmployees(listData);

        const meta =
          response.meta ||
          response.pagination ||
          response.data?.meta ||
          response.data?.pagination ||
          {};

        setTotalPages(meta.totalPages || Math.ceil(listData.length / limit) || 1);
        setTotalRecords(meta.totalRecords || listData.length);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError("Failed to load employees list.");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    debouncedSearch,
    globalBranchId,
    selectedBranchId,
    selectedRoleId,
    selectedState,
    selectedCity,
    selectedStatus,
    includeBranchManagers,
    activeStatCard,
    roleOptions,
  ]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await employeeService.delete(employeeToDelete.id);
      toast.success("Employee deactivated successfully");
      setIsDeleteModalOpen(false);
      setEmployeeToDelete(null);
      fetchEmployees();
      fetchOverviewStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete employee");
    }
  };

  const getInitials = (name) => {
    if (!name) return "E";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedStatus("");
    setSelectedRoleId("");
    setSelectedBranchId("");
    setSelectedState("");
    setSelectedCity("");
    setActiveStatCard("ALL");
    setIncludeBranchManagers(true);
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    Boolean(selectedStatus) ||
    Boolean(selectedRoleId) ||
    Boolean(selectedBranchId) ||
    Boolean(selectedState) ||
    Boolean(selectedCity) ||
    activeStatCard !== "ALL" ||
    !includeBranchManagers;

  return (
    <div className="w-full max-w-none space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#225091] m-0">
            Society Employees
          </h1>
          <div className="flex items-center text-sm font-medium text-gray-500 mt-1">
            <Link to="/dashboard" className="hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <ChevronRight size={15} className="mx-1 text-gray-400" />
            <span className="text-gray-600">HR Management</span>
            <ChevronRight size={15} className="mx-1 text-gray-400" />
            <span className="text-[#225091] font-semibold">Employees</span>
          </div>
        </div>

        <Link
          to="/employees/create"
          className="bg-[#225091] hover:bg-[#1b427b] text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-sm flex items-center gap-2 text-sm shrink-0 hover:shadow"
        >
          + Add Staff
        </Link>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Staff Card */}
        <div
          onClick={() => {
            setActiveStatCard("ALL");
            setSelectedStatus("");
            setSelectedRoleId("");
            setPage(1);
          }}
          className={`bg-white rounded-xl p-4.5 border shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${
            activeStatCard === "ALL" && !selectedStatus && !selectedRoleId
              ? "border-[#225091] ring-2 ring-[#225091]/10 bg-blue-50/20"
              : "border-gray-100 hover:border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 text-[#225091] mb-1">
            <Users size={18} />
            <span className="text-[26px] font-bold leading-none">
              {overviewStats.total}
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
            Total Staff
          </span>
        </div>

        {/* Active Staff Card */}
        <div
          onClick={() => {
            setActiveStatCard(activeStatCard === "ACTIVE" ? "ALL" : "ACTIVE");
            setSelectedStatus("");
            setPage(1);
          }}
          className={`bg-white rounded-xl p-4.5 border shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${
            activeStatCard === "ACTIVE"
              ? "border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-50/20"
              : "border-gray-100 hover:border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <UserCheck size={18} />
            <span className="text-[26px] font-bold leading-none">
              {overviewStats.active}
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
            Active Staff
          </span>
        </div>

        {/* Inactive Staff Card */}
        <div
          onClick={() => {
            setActiveStatCard(activeStatCard === "INACTIVE" ? "ALL" : "INACTIVE");
            setSelectedStatus("");
            setPage(1);
          }}
          className={`bg-white rounded-xl p-4.5 border shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${
            activeStatCard === "INACTIVE"
              ? "border-rose-500 ring-2 ring-rose-500/10 bg-rose-50/20"
              : "border-gray-100 hover:border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 text-rose-600 mb-1">
            <UserX size={18} />
            <span className="text-[26px] font-bold leading-none">
              {overviewStats.inactive}
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
            Inactive Staff
          </span>
        </div>

        {/* Branch Managers Card */}
        <div
          onClick={() => {
            setActiveStatCard(activeStatCard === "MANAGERS" ? "ALL" : "MANAGERS");
            setSelectedRoleId("");
            setPage(1);
          }}
          className={`bg-white rounded-xl p-4.5 border shadow-xs flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md ${
            activeStatCard === "MANAGERS"
              ? "border-purple-500 ring-2 ring-purple-500/10 bg-purple-50/20"
              : "border-gray-100 hover:border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <UserCog size={18} />
            <span className="text-[26px] font-bold leading-none">
              {overviewStats.managers}
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
            Branch Managers
          </span>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-100 space-y-3.5">
        {/* Top Search & Reset Row */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, employee code, email, phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer select-none bg-gray-50 px-3 py-2 rounded-lg border border-gray-200/80 hover:bg-gray-100/70 transition-colors">
              <input
                type="checkbox"
                checked={includeBranchManagers}
                onChange={(e) => {
                  setIncludeBranchManagers(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 rounded text-[#225091] focus:ring-[#225091] border-gray-300"
              />
              <span>Include Managers</span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 rounded-lg border border-gray-200 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Bottom Inline Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-gray-100">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-medium text-gray-700 shadow-2xs"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Department / Role Filter */}
          <div className="relative">
            <select
              value={selectedRoleId}
              onChange={(e) => {
                setSelectedRoleId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-medium text-gray-700 shadow-2xs"
            >
              <option value="">All Roles / Depts</option>
              <option value="BRANCH_MANAGER">Branch Manager</option>
              {roleOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* State Filter (Bank Owner location filtering) */}
          <div className="relative">
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity("");
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-medium text-gray-700 shadow-2xs"
            >
              <option value="">All States</option>
              {statesList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter (Bank Owner location filtering) */}
          <div className="relative">
            <select
              value={selectedCity}
              disabled={!selectedState || availableCities.length === 0}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-medium text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed shadow-2xs"
            >
              <option value="">
                {selectedState ? "All Cities" : "Select State First"}
              </option>
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div className="relative">
            <select
              value={selectedBranchId}
              onChange={(e) => {
                setSelectedBranchId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] bg-white text-xs font-medium text-gray-700 shadow-2xs"
            >
              <option value="">All Branches</option>
              {(branchOptions || []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.code ? `(${b.code})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Employees Table */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead className="bg-[#F8FAFC] text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200/80">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Sr.No.</th>
                <th className="py-3.5 px-5 font-semibold">Employee</th>
                <th className="py-3.5 px-5 font-semibold">Emp Code</th>
                <th className="py-3.5 px-5 font-semibold">Designation / Role</th>
                <th className="py-3.5 px-5 font-semibold">Branch & State</th>
                <th className="py-3.5 px-5 font-semibold">Status</th>
                <th className="py-3.5 px-5 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading && employees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2
                        size={22}
                        className="animate-spin text-[#225091]"
                      />
                      <span className="text-sm font-medium">
                        Loading society employees...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="7"
                    className="py-10 text-center text-rose-600 text-sm font-medium"
                  >
                    {error}
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="py-14 text-center text-gray-500 text-sm"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users size={32} className="text-gray-300" />
                      <span className="font-semibold text-gray-700">
                        No employees found
                      </span>
                      <span className="text-xs text-gray-400">
                        Try adjusting your search or active filters
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3.5 px-5 text-[13px] text-gray-500 font-medium">
                      {row.srNo || (page - 1) * limit + index + 1}
                    </td>

                    {/* Employee Profile */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#225091] font-bold text-xs shrink-0 shadow-2xs">
                          {getInitials(row.fullName)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 text-sm">
                            {row.fullName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {row.email || "-"}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {row.phoneNumber || ""}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Employee Code & Badge */}
                    <td className="py-3.5 px-5">
                      <span className="text-gray-800 font-mono font-semibold text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {row.employeeId || row.employeeCode || "-"}
                      </span>
                      {row.type === "MANAGER" || row.role?.code === "BRANCH_MANAGER" ? (
                        <div className="text-[10px] bg-purple-50 border border-purple-200/60 text-purple-700 font-semibold px-2 py-0.5 rounded-full inline-block mt-1">
                          Branch Manager
                        </div>
                      ) : null}
                    </td>

                    {/* Designation / Department */}
                    <td className="py-3.5 px-5 text-xs text-gray-700 font-medium">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">
                          {row.designation || row.role?.name || "-"}
                        </span>
                        {row.department && (
                          <span className="text-[11px] text-gray-400">
                            {row.department}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Branch & State */}
                    <td className="py-3.5 px-5 text-xs text-gray-600">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">
                          {row.branch?.name || "-"}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {row.branch?.state || row.branch?.city || row.branch?.code || ""}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${
                          row.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                            : "bg-rose-50 text-rose-700 border-rose-200/60"
                        }`}
                      >
                        {row.status || "ACTIVE"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/employees/view/${row.id}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#225091] bg-[#EAF2FB] hover:bg-[#d8e8f8] border border-[#225091]/15 transition-all shadow-2xs"
                          title="View Employee Profile"
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          onClick={() => navigate(`/employees/edit/${row.id}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-all shadow-2xs"
                          title="Edit Staff"
                        >
                          <Edit size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(row)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all shadow-2xs"
                          title="Delete / Deactivate"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && employees.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto bg-gray-50/40">
            <div className="text-xs text-gray-500 font-medium">
              Showing page <span className="font-semibold text-gray-800">{page}</span> of{" "}
              <span className="font-semibold text-gray-800">{totalPages}</span> (
              <span className="font-semibold text-gray-800">{totalRecords}</span> total entries)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#225091] hover:bg-[#225091] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 bg-[#225091] text-white text-xs font-bold rounded-full shadow-2xs">
                {page}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#225091] hover:bg-[#225091] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Deactivate Employee
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to deactivate{" "}
              <span className="font-semibold text-gray-800">
                {employeeToDelete.fullName}
              </span>
              ? They will no longer be able to log in.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setEmployeeToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-full bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors shadow-sm text-sm"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
