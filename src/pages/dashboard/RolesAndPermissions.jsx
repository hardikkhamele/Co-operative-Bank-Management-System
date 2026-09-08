import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Search,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  X,
  Shield,
  ShieldPlus,
  Plus,
  Loader2,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Lock
} from "lucide-react";
import { roleService } from "../../api/roleService";
import PageHeader from "../../components/common/PageHeader";

const RolesAndPermissions = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRoleForView, setSelectedRoleForView] = useState(null);

  // Error feedback
  const [errorMsg, setErrorMsg] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const response = await roleService.list(params);
      if (response && response.success) {
        const listData = Array.isArray(response.data)
          ? response.data
          : response.data?.items || response.data?.roles || response.items || [];

        setRoles(listData);

        const meta =
          response.meta ||
          response.pagination ||
          response.data?.meta ||
          response.data?.pagination ||
          {};

        setTotalPages(meta.totalPages || Math.ceil((meta.totalRecords || listData.length) / 10) || 1);
        setTotalRecords(meta.totalRecords || listData.length);
      } else {
        setRoles([]);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      setErrorMsg(
        err.response?.status === 502
          ? "The server is temporarily busy (502 Bad Gateway). Please click retry."
          : "Unable to retrieve roles. Please check network connection."
      );
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleDelete = async (id, roleName) => {
    if (!window.confirm(`Are you sure you want to delete role "${roleName || 'this role'}"?`)) return;

    try {
      const res = await roleService.delete(id);
      if (res && res.success) {
        toast.success(res.message || "Role deleted successfully.");
        fetchRoles();
      }
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error(
          "Cannot delete role: It is currently assigned to active employees."
        );
      } else {
        toast.error(err.response?.data?.message || "An error occurred while deleting the role.");
      }
    }
  };

  const handleView = async (id) => {
    try {
      const response = await roleService.getById(id);
      if (response && response.success) {
        setSelectedRoleForView(response.data);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      toast.error("Failed to load role details.");
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 font-sans pb-16 antialiased">
      {/* 1. Header Card */}
      <PageHeader
        title="Roles & Permissions"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Security" },
          { label: "Roles & Permissions" }
        ]}
      />

      {/* Error Alert with Retry */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button
            onClick={fetchRoles}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            <RotateCcw size={13} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 2. Toolbar */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/90 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 sm:max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search roles by title or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#225091] rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#225091] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Roles Configured: <span className="font-bold text-slate-800">{totalRecords}</span>
        </div>
      </div>

      {/* 3. Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3 px-4 text-center w-14">#</th>
                <th className="py-3 px-4">Role Title</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">Permissions</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right pr-6 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && roles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2
                        size={20}
                        className="animate-spin text-[#225091]"
                      />
                      <span className="text-xs font-medium text-slate-600">
                        Loading access roles...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-16 text-center text-slate-500 text-xs"
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Shield size={32} className="text-slate-300 stroke-1" />
                      <span className="font-semibold text-slate-700 text-sm">
                        No roles found
                      </span>
                      <span className="text-xs text-slate-400">
                        Create a role or adjust search filters.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                roles.map((row, index) => {
                  const roleId = row._id || row.id || row.roleId;
                  const isActive = (row.status || "").toUpperCase() === "ACTIVE" || !row.status;
                  const permissionsCount = Array.isArray(row.permissions) ? row.permissions.length : 0;

                  return (
                    <tr
                      key={roleId || index}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center text-slate-400 font-medium">
                        {(page - 1) * 10 + index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#225091] flex items-center justify-center border border-blue-100 shrink-0">
                            <Lock size={13} />
                          </div>
                          <span className="font-semibold text-slate-900 text-xs">
                            {row.name}
                          </span>
                        </div>
                      </td>
                      <td
                        className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate font-normal"
                        title={row.description}
                      >
                        {row.description || "—"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                          {permissionsCount} Granted
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          ></span>
                          {row.status || "ACTIVE"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right pr-6">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleView(roleId)}
                            className="p-1.5 text-slate-500 hover:text-[#225091] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="View Permissions"
                          >
                            <Eye size={15} />
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

        {/* Footer Pagination */}
        {!loading && roles.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
            <div className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{(page - 1) * 10 + 1}</span> to{" "}
              <span className="font-semibold text-slate-700">{Math.min(page * 10, totalRecords)}</span> of{" "}
              <span className="font-semibold text-slate-700">{totalRecords}</span> roles
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <div className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-800">
                {page} / {totalPages}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Role Modal */}
      {isViewModalOpen && selectedRoleForView && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-[#225091] rounded-lg">
                  <Shield size={18} />
                </div>
                <h2 className="text-base font-bold text-slate-900 m-0">
                  Role Capabilities & Permissions
                </h2>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Role Name
                </span>
                <h3 className="text-base font-bold text-[#225091]">
                  {selectedRoleForView.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {selectedRoleForView.description || "No description provided."}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-800 block mb-2">
                  Assigned Permissions ({selectedRoleForView.permissions?.length || 0})
                </span>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  {selectedRoleForView.permissions && selectedRoleForView.permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedRoleForView.permissions.map((perm, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-50 text-[#225091] border border-blue-100/80 px-2.5 py-1 rounded-lg text-xs font-medium"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs py-2 text-center">
                      No specific permissions assigned.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 flex justify-end bg-slate-50/50 rounded-b-xl">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#225091] text-white font-semibold text-xs hover:bg-[#1a3f73] transition-colors"
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

export default RolesAndPermissions;
