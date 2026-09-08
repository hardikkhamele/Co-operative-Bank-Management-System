import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Search, SlidersHorizontal, X, Eye, Users, Store,
  Wallet, TrendingUp, CreditCard, Phone, Mail, Calendar, Building,
  User, BadgeCheck, ShieldCheck, MapPin, FileText, Loader2, ChevronLeft,
  ChevronDown, RefreshCw, Banknote, Layers, Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import { societyCustomerService } from '../../api/societyCustomerService';
import Pagination from '../../components/common/Pagination';

const SocietyCustomers = () => {
  // ── State ──
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    totalRecords: 0, totalCustomers: 0, totalMerchants: 0,
    pigmyCustomersCount: 0, loanCustomersCount: 0,
    totalPigmyCount: 0, totalLoansCount: 0,
  });
  const [meta, setMeta] = useState({ totalRecords: 0, limit: 10, page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [hasPigmy, setHasPigmy] = useState('');
  const [hasLoans, setHasLoans] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Detail modal
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // ── Fetch list ──
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, type: typeFilter };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;
      if (productFilter) params.product = productFilter;
      if (hasPigmy) params.hasPigmy = hasPigmy;
      if (hasLoans) params.hasLoans = hasLoans;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await societyCustomerService.list(params);
      if (res?.success && res.data) {
        setItems(res.data.items || []);
        setStats(res.data.stats || stats);
        setMeta(res.data.meta || meta);
      }
    } catch (err) {
      console.error('Society customer list error:', err);
      toast.error(err?.response?.data?.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, typeFilter, statusFilter, productFilter, hasPigmy, hasLoans, dateFrom, dateTo]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ── Fetch detail ──
  const openDetail = async (member) => {
    setShowDetailModal(true);
    setDetailLoading(true);
    try {
      const res = await societyCustomerService.getById(member.id, { type: member.entityType });
      if (res?.success && res.data) {
        setSelectedMember(res.data);
      }
    } catch (err) {
      console.error('Member detail error:', err);
      toast.error('Failed to load member details');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setShowDetailModal(false);
    setSelectedMember(null);
  };

  const clearFilters = () => {
    setTypeFilter('ALL');
    setStatusFilter('');
    setProductFilter('');
    setHasPigmy('');
    setHasLoans('');
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
    setPage(1);
  };

  // ── Stat Cards Config ──
  const statCards = [
    { label: 'Total Records', value: stats.totalRecords, icon: Users, color: 'bg-blue-50 text-blue-600 border-blue-200', iconBg: 'bg-blue-100' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: User, color: 'bg-emerald-50 text-emerald-600 border-emerald-200', iconBg: 'bg-emerald-100' },
    { label: 'Total Merchants', value: stats.totalMerchants, icon: Store, color: 'bg-purple-50 text-purple-600 border-purple-200', iconBg: 'bg-purple-100' },
    { label: 'Pigmy Members', value: stats.pigmyCustomersCount, icon: Wallet, color: 'bg-amber-50 text-amber-600 border-amber-200', iconBg: 'bg-amber-100' },
    { label: 'Loan Members', value: stats.loanCustomersCount, icon: TrendingUp, color: 'bg-rose-50 text-rose-600 border-rose-200', iconBg: 'bg-rose-100' },
    { label: 'Total Pigmy Accounts', value: stats.totalPigmyCount, icon: Layers, color: 'bg-cyan-50 text-cyan-600 border-cyan-200', iconBg: 'bg-cyan-100' },
    { label: 'Total Loan Accounts', value: stats.totalLoansCount, icon: Banknote, color: 'bg-orange-50 text-orange-600 border-orange-200', iconBg: 'bg-orange-100' },
  ];

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return '—'; }
  };

  const formatCurrency = (v) => {
    if (v === null || v === undefined) return '₹0';
    return '₹' + Number(v).toLocaleString('en-IN');
  };

  return (
    <div className="max-w-[1400px] w-full">
      {/* Header / Breadcrumb */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-[#225091] mb-2">Society Members</h2>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span>CRM Management</span>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="text-[#225091]">Society Members</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`rounded-xl border p-3.5 ${card.color} transition-all`}>
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider opacity-70">{card.label}</span>
              </div>
              <p className="text-2xl font-extrabold">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Toolbar: Search + Filters + Refresh */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-[#225091] focus:border-[#225091] sm:text-sm bg-white"
              placeholder="Search name, phone, email, account..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {['ALL', 'CUSTOMER', 'MERCHANT'].map(t => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  typeFilter === t ? 'bg-[#225091] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {t === 'ALL' ? 'All' : t === 'CUSTOMER' ? 'Customers' : 'Merchants'}
              </button>
            ))}
          </div>

          {/* Filter popover */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-[42px] h-[42px] bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <SlidersHorizontal size={20} className="text-gray-500" />
            </button>

            {isFilterOpen && (
              <div className="absolute z-30 top-full right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl p-5 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-gray-900">Filters</h4>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={18} /></button>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Status</label>
                  <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#225091] focus:border-[#225091]">
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>

                {/* Product */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Product</label>
                  <select value={productFilter} onChange={e => { setProductFilter(e.target.value); setPage(1); }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#225091] focus:border-[#225091]">
                    <option value="">All Products</option>
                    <option value="PIGMY">Pigmy Only</option>
                    <option value="LOAN">Loan Only</option>
                    <option value="BOTH">Both Pigmy & Loan</option>
                    <option value="NONE">No Products</option>
                  </select>
                </div>

                {/* Has Pigmy */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Has Pigmy</label>
                  <select value={hasPigmy} onChange={e => { setHasPigmy(e.target.value); setPage(1); }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#225091] focus:border-[#225091]">
                    <option value="">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                {/* Has Loans */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Has Loans</label>
                  <select value={hasLoans} onChange={e => { setHasLoans(e.target.value); setPage(1); }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#225091] focus:border-[#225091]">
                    <option value="">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">From</label>
                    <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#225091] focus:border-[#225091]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">To</label>
                    <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-[#225091] focus:border-[#225091]" />
                  </div>
                </div>

                <button onClick={clearFilters} className="w-full mt-2 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer">
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Refresh */}
          <button onClick={fetchList} className="w-[42px] h-[42px] bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
            <RefreshCw size={18} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <p className="text-xs text-gray-400 font-medium">
          Showing {items.length} of {meta.totalRecords} records • Page {meta.page} of {meta.totalPages}
        </p>
      </div>

      {/* ── Data Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse text-center whitespace-nowrap">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Sr</th>
                <th className="py-3.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Name</th>
                <th className="py-3.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Type</th>
                <th className="py-3.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Phone</th>
                <th className="py-3.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch</th>
                <th className="py-3.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Loans</th>
                <th className="py-3.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Pigmy</th>
                <th className="py-3.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">EMI Card</th>
                <th className="py-3.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Account No.</th>
                <th className="py-3.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Status</th>
                <th className="py-3.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Created By</th>
                <th className="py-3.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Onboarding</th>
                <th className="py-3.5 px-3 font-semibold text-white uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={13} className="py-16 text-center">
                    <Loader2 size={28} className="animate-spin text-[#225091] mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Loading members...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-16 text-center">
                    <Info size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-800">No members found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-gray-50/60 transition-colors">
                    {/* Sr */}
                    <td className="py-3 px-3 text-gray-500 text-xs">{item.srNo || ((meta.page - 1) * meta.limit) + idx + 1}</td>

                    {/* Name */}
                    <td className="py-3 px-3 text-left">
                      <div className="font-bold text-gray-900 text-xs">{item.name || '—'}</div>
                      {item.shopName && <div className="text-[10px] text-gray-400">{item.shopName}</div>}
                      {item.customerId && <div className="text-[10px] text-blue-500 font-mono">{item.customerId}</div>}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.entityType === 'CUSTOMER' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {item.entityType === 'CUSTOMER' ? 'Customer' : 'Merchant'}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-3 text-xs text-gray-700 font-mono">{item.phoneNumber || '—'}</td>

                    {/* Branch */}
                    <td className="py-3 px-3 text-xs text-gray-700">{item.branchName || '—'}</td>

                    {/* Loans */}
                    <td className="py-3 px-3 text-xs">
                      {item.totalLoans ? (
                        <div>
                          <span className="font-bold text-gray-900">{item.totalLoans.count}</span>
                          <span className="text-gray-400 text-[10px] ml-0.5">({item.totalLoans.activeCount} active)</span>
                          <div className="text-[10px] text-gray-400">{formatCurrency(item.totalLoans.outstandingAmount)} outstanding</div>
                        </div>
                      ) : '—'}
                    </td>

                    {/* Pigmy */}
                    <td className="py-3 px-3 text-xs">
                      {item.totalPigmy ? (
                        <div>
                          <span className="font-bold text-gray-900">{item.totalPigmy.count}</span>
                          <span className="text-gray-400 text-[10px] ml-0.5">({item.totalPigmy.activeCount} active)</span>
                          <div className="text-[10px] text-emerald-600 font-semibold">{formatCurrency(item.totalPigmy.totalBalance)}</div>
                        </div>
                      ) : '—'}
                    </td>

                    {/* EMI Card */}
                    <td className="py-3 px-3 text-xs">
                      {item.emiCardDetails ? (
                        <div>
                          <div className="font-mono text-gray-800 text-[10px]">••••{item.emiCardDetails.cardNumber?.slice(-4)}</div>
                          <div className="text-[10px] text-gray-400">Valid: {item.emiCardDetails.validThru || '—'}</div>
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            item.emiCardDetails.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                          }`}>{item.emiCardDetails.status}</span>
                        </div>
                      ) : <span className="text-gray-300 text-[10px]">No Card</span>}
                    </td>

                    {/* Account No */}
                    <td className="py-3 px-3 text-xs">
                      {item.societyAccountDetails ? (
                        <div>
                          <div className="font-mono font-bold text-[#225091] text-[11px]">{item.societyAccountDetails.accountNumber}</div>
                          <div className="text-[10px] text-gray-400">{item.societyAccountDetails.bankName}</div>
                        </div>
                      ) : '—'}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.status === 'INACTIVE' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.status || '—'}
                      </span>
                    </td>

                    {/* Created By */}
                    <td className="py-3 px-3 text-xs text-left">
                      {item.createdBy ? (
                        <div>
                          <div className="font-bold text-gray-900 text-[11px]">{item.createdBy.name}</div>
                          <div className="text-[10px] text-gray-400">{item.createdBy.role}</div>
                          {item.createdBy.employeeId && <div className="text-[10px] text-blue-500 font-mono">{item.createdBy.employeeId}</div>}
                        </div>
                      ) : '—'}
                    </td>

                    {/* Onboarding Date */}
                    <td className="py-3 px-3 text-xs text-gray-500">{formatDate(item.createdAt)}</td>

                    {/* Action */}
                    <td className="py-3 px-3">
                      <button onClick={() => openDetail(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-[#225091] transition-colors cursor-pointer" title="View Details">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={meta.totalPages}
          totalRecords={meta.totalRecords || items.length}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>

      {/* ════════════════════ DETAIL MODAL ════════════════════ */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDetail} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto z-10">
            {detailLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 size={32} className="animate-spin text-[#225091] mb-3" />
                <p className="text-sm text-gray-400">Loading member details...</p>
              </div>
            ) : selectedMember ? (
              <div>
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                  <div>
                    <h3 className="text-lg font-bold text-[#225091]">{selectedMember.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedMember.entityType === 'CUSTOMER' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>{selectedMember.entityType}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedMember.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>{selectedMember.status}</span>
                      {selectedMember.customerId && <span className="text-[10px] font-mono text-blue-500">{selectedMember.customerId}</span>}
                    </div>
                  </div>
                  <button onClick={closeDetail} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer">
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* ── Personal Details ── */}
                  {selectedMember.personalDetails && (
                    <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <User size={15} className="text-[#225091]" /> Personal Details
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Full Name</span>
                          <span className="font-bold text-gray-900">{selectedMember.personalDetails.fullName || '—'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Phone</span>
                          <span className="font-bold text-gray-900 font-mono">{selectedMember.personalDetails.phoneNumber || '—'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Email</span>
                          <span className="font-bold text-gray-900">{selectedMember.personalDetails.email || '—'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Gender</span>
                          <span className="font-bold text-gray-900">{selectedMember.personalDetails.gender || '—'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Date of Birth</span>
                          <span className="font-bold text-gray-900">{formatDate(selectedMember.personalDetails.dob)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">PAN Number</span>
                          <span className="font-bold text-gray-900 font-mono">{selectedMember.personalDetails.panNumber || '—'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Aadhaar Number</span>
                          <span className="font-bold text-gray-900 font-mono">{selectedMember.personalDetails.aadhaarNumber || '—'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">KYC Status</span>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            selectedMember.personalDetails.kycStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>{selectedMember.personalDetails.kycStatus || '—'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Credit Score</span>
                          <span className="font-bold text-gray-900">{selectedMember.personalDetails.creditScore || '—'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">CIBIL Status</span>
                          <span className="font-bold text-gray-900">{selectedMember.personalDetails.cibilStatus || '—'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Onboarding Stage</span>
                          <span className="font-bold text-gray-900">{selectedMember.personalDetails.onboardingStage || '—'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Pincode</span>
                          <span className="font-bold text-gray-900 font-mono">{selectedMember.personalDetails.residentialPincode || selectedMember.personalDetails.currentPinCode || '—'}</span>
                        </div>
                        {selectedMember.personalDetails.activeAddress && (
                          <div className="col-span-2">
                            <span className="text-gray-400 block text-[11px] mb-0.5">Address</span>
                            <span className="font-medium text-gray-800">{selectedMember.personalDetails.activeAddress.addressLine}, {selectedMember.personalDetails.activeAddress.pinCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Documents ── */}
                  {selectedMember.documents && (
                    <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText size={15} className="text-[#225091]" /> Documents
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: 'PAN Image', url: selectedMember.documents.panImage },
                          { label: 'Aadhaar Image', url: selectedMember.documents.aadhaarImage },
                          { label: 'Live Photo', url: selectedMember.documents.livePhoto },
                          { label: 'Profile Image', url: selectedMember.documents.profileImage || selectedMember.documents.avatar },
                          { label: 'CIBIL Report', url: selectedMember.documents.cibilReportUrl },
                        ].filter(d => d.url).map((doc, i) => (
                          <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 rounded-xl bg-white border border-gray-200 hover:border-[#225091] hover:shadow-sm transition-all text-xs font-semibold text-[#225091]">
                            <FileText size={14} /> {doc.label}
                          </a>
                        ))}
                        {!Object.values(selectedMember.documents || {}).some(v => v) && (
                          <p className="text-xs text-gray-400 col-span-4">No documents uploaded.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Bank Details ── */}
                  {selectedMember.bankDetails && selectedMember.bankDetails.length > 0 && (
                    <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Building size={15} className="text-[#225091]" /> Bank Details
                      </h4>
                      <div className="space-y-3">
                        {selectedMember.bankDetails.map((bank, i) => (
                          <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs p-3 rounded-xl bg-white border border-gray-200">
                            <div>
                              <span className="text-gray-400 block text-[11px] mb-0.5">Account Number</span>
                              <span className="font-bold text-[#225091] font-mono">{bank.accountNumber}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[11px] mb-0.5">Holder Name</span>
                              <span className="font-bold text-gray-900">{bank.accountHolderName}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[11px] mb-0.5">IFSC</span>
                              <span className="font-bold text-gray-900 font-mono">{bank.ifscCode}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[11px] mb-0.5">Bank / Branch</span>
                              <span className="font-bold text-gray-900">{bank.bankName} — {bank.branchName}</span>
                            </div>
                            {bank.isPrimary && (
                              <div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Primary</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Society Account Details ── */}
                  {selectedMember.societyAccountDetails && (
                    <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <ShieldCheck size={15} className="text-[#225091]" /> Society Account
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Account Number</span>
                          <span className="font-bold text-[#225091] font-mono text-sm">{selectedMember.societyAccountDetails.accountNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Holder Name</span>
                          <span className="font-bold text-gray-900">{selectedMember.societyAccountDetails.accountHolderName}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">IFSC</span>
                          <span className="font-bold text-gray-900 font-mono">{selectedMember.societyAccountDetails.ifscCode}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Bank Name</span>
                          <span className="font-bold text-gray-900">{selectedMember.societyAccountDetails.bankName}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Branch</span>
                          <span className="font-bold text-gray-900">{selectedMember.societyAccountDetails.branchName}</span>
                        </div>
                        {selectedMember.societyAccountDetails.pincode && (
                          <div>
                            <span className="text-gray-400 block text-[11px] mb-0.5">Pincode</span>
                            <span className="font-bold text-gray-900 font-mono">{selectedMember.societyAccountDetails.pincode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── EMI Card Details ── */}
                  {selectedMember.emiCardDetails && (
                    <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CreditCard size={15} className="text-purple-600" /> EMI Card
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Card Number</span>
                          <span className="font-bold text-gray-900 font-mono">••••{selectedMember.emiCardDetails.cardNumber?.slice(-4)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Card Holder</span>
                          <span className="font-bold text-gray-900">{selectedMember.emiCardDetails.cardHolderName}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Valid Thru</span>
                          <span className="font-bold text-gray-900">{selectedMember.emiCardDetails.validThru}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Expiry Date</span>
                          <span className="font-bold text-gray-900">{formatDate(selectedMember.emiCardDetails.expiryDate)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Card Limit</span>
                          <span className="font-bold text-gray-900">{formatCurrency(selectedMember.emiCardDetails.cardLimit)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Available Limit</span>
                          <span className="font-bold text-emerald-700">{formatCurrency(selectedMember.emiCardDetails.availableLimit)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Status</span>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            selectedMember.emiCardDetails.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>{selectedMember.emiCardDetails.status}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Loans ── */}
                  {selectedMember.totalLoans && (
                    <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <TrendingUp size={15} className="text-rose-600" /> Loan Accounts ({selectedMember.totalLoans.count})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-4">
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Total Loans</span>
                          <span className="font-bold text-gray-900 text-sm">{selectedMember.totalLoans.count}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Active Loans</span>
                          <span className="font-bold text-emerald-700 text-sm">{selectedMember.totalLoans.activeCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Total Amount</span>
                          <span className="font-bold text-gray-900 text-sm">{formatCurrency(selectedMember.totalLoans.totalAmount)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Outstanding</span>
                          <span className="font-bold text-rose-600 text-sm">{formatCurrency(selectedMember.totalLoans.outstandingAmount)}</span>
                        </div>
                      </div>

                      {selectedMember.totalLoans.loansList && selectedMember.totalLoans.loansList.length > 0 && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <table className="w-full text-xs border-collapse text-center whitespace-nowrap">
                            <thead className="bg-[#225091] text-white">
                              <tr>
                                <th className="py-2.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-[10px]">Application ID</th>
                                <th className="py-2.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-[10px]">Status</th>
                                <th className="py-2.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-[10px]">Loan Amount</th>
                                <th className="py-2.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-[10px]">Outstanding</th>
                                <th className="py-2.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-[10px]">EMI</th>
                                <th className="py-2.5 px-3 font-semibold text-white uppercase tracking-wider text-center text-[10px]">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium">
                              {selectedMember.totalLoans.loansList.map((loan, li) => (
                                <tr key={li} className="hover:bg-gray-50/60 transition-colors">
                                  <td className="py-2.5 px-3 font-mono font-bold text-[#225091]">{loan.applicationId || '—'}</td>
                                  <td className="py-2.5 px-3">
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                      loan.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                                    }`}>{loan.status}</span>
                                  </td>
                                  <td className="py-2.5 px-3 font-bold text-gray-900">{formatCurrency(loan.totalLoanAmount)}</td>
                                  <td className="py-2.5 px-3 font-bold text-rose-600">{formatCurrency(loan.outstandingAmount)}</td>
                                  <td className="py-2.5 px-3 text-gray-700">{formatCurrency(loan.emiAmount)}</td>
                                  <td className="py-2.5 px-3 text-gray-500">{formatDate(loan.createdAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Pigmy Accounts ── */}
                  {selectedMember.totalPigmy && (
                    <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Wallet size={15} className="text-amber-600" /> Pigmy Deposit Accounts ({selectedMember.totalPigmy.count})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs mb-4">
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Total Accounts</span>
                          <span className="font-bold text-gray-900 text-sm">{selectedMember.totalPigmy.count}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Active</span>
                          <span className="font-bold text-emerald-700 text-sm">{selectedMember.totalPigmy.activeCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Total Balance</span>
                          <span className="font-bold text-[#225091] text-sm">{formatCurrency(selectedMember.totalPigmy.totalBalance)}</span>
                        </div>
                      </div>

                      {selectedMember.totalPigmy.pigmyList && selectedMember.totalPigmy.pigmyList.length > 0 && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <table className="w-full text-xs border-collapse text-center whitespace-nowrap">
                            <thead className="bg-[#225091] text-white">
                              <tr>
                                <th className="py-2.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-[10px]">Account No.</th>
                                <th className="py-2.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-[10px]">Scheme</th>
                                <th className="py-2.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-[10px]">Deposit Amt.</th>
                                <th className="py-2.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-[10px]">Balance</th>
                                <th className="py-2.5 px-3 font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-[10px]">Status</th>
                                <th className="py-2.5 px-3 font-semibold text-white uppercase tracking-wider text-center text-[10px]">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium">
                              {selectedMember.totalPigmy.pigmyList.map((pig, pi) => (
                                <tr key={pi} className="hover:bg-gray-50/60 transition-colors">
                                  <td className="py-2.5 px-3 font-mono font-bold text-[#225091]">{pig.pigmyAccountNumber || '—'}</td>
                                  <td className="py-2.5 px-3 text-gray-700">{pig.schemeName || '—'}</td>
                                  <td className="py-2.5 px-3 text-gray-700">{formatCurrency(pig.depositAmount)}</td>
                                  <td className="py-2.5 px-3 font-bold text-emerald-700">{formatCurrency(pig.currentBalance)}</td>
                                  <td className="py-2.5 px-3">
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                      pig.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                                    }`}>{pig.status}</span>
                                  </td>
                                  <td className="py-2.5 px-3 text-gray-500">{formatDate(pig.createdAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Created By ── */}
                  {selectedMember.createdBy && (
                    <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <BadgeCheck size={15} className="text-[#225091]" /> Created By
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Name</span>
                          <span className="font-bold text-gray-900">{selectedMember.createdBy.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Role</span>
                          <span className="font-bold text-gray-900">{selectedMember.createdBy.role}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Employee ID</span>
                          <span className="font-bold text-[#225091] font-mono">{selectedMember.createdBy.employeeId || '—'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px] mb-0.5">Phone</span>
                          <span className="font-bold text-gray-900 font-mono">{selectedMember.createdBy.phone || '—'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Onboarding Date ── */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/60">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-emerald-900">Member Since</h5>
                        <p className="text-[11px] text-emerald-700 font-semibold">{formatDate(selectedMember.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocietyCustomers;
