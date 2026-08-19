import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { roleService } from "../../api/roleService";

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

  // Delete feedback
  const [errorMsg, setErrorMsg] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchRoles = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;

      const response = await roleService.list(params);
      if (response.success) {
        setRoles(response.data);
        setTotalPages(
          response.meta?.totalPages ||
            response.pagination?.totalPages ||
            response.data?.meta?.totalPages ||
            response.data?.pagination?.totalPages ||
            1,
        );
        setTotalRecords(
          response.meta?.totalRecords ||
            response.pagination?.totalRecords ||
            response.data?.meta?.totalRecords ||
            response.data?.pagination?.totalRecords ||
            0,
        );
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      setErrorMsg("Failed to load roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [page, debouncedSearch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    try {
      const res = await roleService.delete(id);
      if (res.success) {
        toast.success(res.message || "Role deleted successfully.");
        fetchRoles();
      }
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error(
          "Cannot delete role: It is currently assigned to active employees.",
        );
      } else {
        toast.error("An error occurred while deleting the role.");
      }
    }
  };

  const handleView = async (id) => {
    try {
      const response = await roleService.getById(id);
      if (response.success) {
        setSelectedRoleForView(response.data);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      toast.error("Failed to load role details.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#4285F4] mb-2">Roles</h1>
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/dashboard" className="hover:text-[#1D4ED8]">
            Dashboard
          </Link>
          <ChevronRight size={14} className="mx-2" />
          <span>Roles & Permissions</span>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#1B58A6]">Roles & Permissions</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
          {errorMsg}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all"
            />
          </div>
        </div>

        <Link
          to="/roles-permissions/create"
          className="bg-[#1D4ED8] hover:bg-[#168f94] text-white px-4 py-2 rounded-full font-medium transition-colors flex items-center text-sm w-full sm:w-auto justify-center shrink-0"
        >
          + Create Roles
        </Link>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-indigo-50/50 text-gray-700 text-sm font-semibold border-b border-gray-100">
              <th className="py-4 px-6 text-center w-20">Sr. No.</th>
              <th className="py-4 px-6">Role Name</th>

              <th className="py-4 px-6">Description</th>
              <th className="py-4 px-6 text-center">Permissions Count</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-center w-32">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && roles.length === 0 ? null : roles.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-500">
                  No roles found.
                </td>
              </tr>
            ) : (
              roles.map((row, index) => {
                const roleId = row._id || row.id || row.roleId;
                return (
                <tr
                  key={roleId}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors text-sm text-gray-600"
                >
                  <td className="py-4 px-6 text-center">
                    {row.srNo || (page - 1) * 10 + index + 1}
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-800">
                    {row.name}
                  </td>

                  <td
                    className="py-4 px-6 max-w-xs truncate"
                    title={row.description}
                  >
                    {row.description || "—"}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      {row.permissions?.length || 0}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {row.status || "UNKNOWN"}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleView(roleId)}
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/roles-permissions/edit/${roleId}`)
                        }
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(roleId)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
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

      {/* Pagination */}
      {!loading && roles.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div>
            Showing page {page} of {totalPages} ({totalRecords} total entries)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1D4ED8] text-white border border-[#1D4ED8]">
              {page}
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* View Role Modal */}
      {isViewModalOpen && selectedRoleForView && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-[#f4f6fa] rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/60 bg-white rounded-t-xl">
              <h2 className="text-[17px] font-bold text-[#1e293b]">
                Roles & Permissions Details
              </h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-[17px] font-bold text-[#3b82f6]">
                  {selectedRoleForView.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedRoleForView.description}
                </p>
              </div>

              <div className="text-[14px] font-bold text-gray-800 mb-3">
                Assigned Permissions
              </div>

              <div className="flex flex-col rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                {selectedRoleForView.permissions &&
                selectedRoleForView.permissions.length > 0 ? (
                  <div className="p-5 flex flex-wrap gap-2">
                    {selectedRoleForView.permissions.map((perm, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 text-gray-500 text-sm">
                    No permissions assigned.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesAndPermissions;
