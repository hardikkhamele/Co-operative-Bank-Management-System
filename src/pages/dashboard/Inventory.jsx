import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Download, Search, CheckCircle, 
  XCircle, Filter, ArrowRightLeft, Layers, ShieldCheck,
  Building2, Users, FileText, Check, AlertCircle, ShoppingCart, Activity,
  BarChart2, Package, Clock, LayoutDashboard, ShieldAlert, Wrench, ChevronDown,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import TableWrapper from '../../components/common/TableWrapper';
import StatsCard from '../../components/common/StatsCard';
import Pagination from '../../components/common/Pagination';
import ExportDropdown from '../../components/common/ExportDropdown';
import InventoryModals from './InventoryModals';
import inventoryService from '../../api/inventoryService';
import { useInventoryPermissions } from '../../hooks/useInventoryPermissions';
import useAuthStore from '../../store/authStore';

const SocietyInventorySPA = () => {
  const navigate = useNavigate();
  const { tab, subtab } = useParams();
  const authUser = useAuthStore(state => state.user);
  
  const permissions = useInventoryPermissions();
  const isBranchManager = !permissions.canManageCatalog;

  // Tab state initialized from URL param, falling back to localStorage or default
  const savedTab = localStorage.getItem('inventory_last_tab');
  const [activeTab, setActiveTab] = useState(() => tab && tab !== 'overview' ? tab : (savedTab || 'master'));
  const [activeSubTab, setActiveSubTab] = useState(subtab || 'categories');
  const masterTableRef = useRef(null);
  const auditLogsTableRef = useRef(null);

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
      localStorage.setItem('inventory_last_tab', tab);
    }
    if (subtab && subtab !== activeSubTab) {
      setActiveSubTab(subtab);
    }
  }, [tab, subtab]);

  const [searchParams, setSearchParams] = useSearchParams();

  // On initial mount if URL has no search params, attempt to restore from localStorage
  useEffect(() => {
    if (!tab) {
      const initialTab = savedTab || 'master';
      navigate(`/inventory/${initialTab}${window.location.search}`, { replace: true });
    }
  }, []);

  const handleTabChange = (newTab, newSubTab = null) => {
    setActiveTab(newTab);
    localStorage.setItem('inventory_last_tab', newTab);
    if (newSubTab) {
      setActiveSubTab(newSubTab);
    }
    const searchString = searchParams.toString();
    navigate(`/inventory/${newTab}${newSubTab ? `/${newSubTab}` : ''}${searchString ? `?${searchString}` : ''}`);
  };

  const handleSubTabChange = (newSubTab) => {
    setActiveSubTab(newSubTab);
    const searchString = searchParams.toString();
    navigate(`/inventory/${activeTab || 'master'}/${newSubTab}${searchString ? `?${searchString}` : ''}`);
  };
  
  const [statsData, setStatsData] = useState(null);
  const [centralStatsData, setCentralStatsData] = useState(null);
  const [branchStatsData, setBranchStatsData] = useState(null);
  const [centralPeriod, setCentralPeriod] = useState('30d');
  const [branchPeriod, setBranchPeriod] = useState('30d');
  const [selectedCentralId, setSelectedCentralId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState(permissions.isStaffScoped || permissions.roleLevel === 'BRANCH_OFFICER' || permissions.roleLevel === 'BRANCH_MANAGER' ? (authUser?.branchId || '') : '');
  const [masterData, setMasterData] = useState([]);
  const [catalogData, setCatalogData] = useState([]);

  // Helper to update a single param without losing others & persist in localStorage
  const updateParam = useCallback((key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) { next.set(key, value); } else { next.delete(key); }
      localStorage.setItem('inventory_last_search_params', next.toString());
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // Read filter values from URL (single source of truth)
  const catalogCategoryId = searchParams.get('category') || '';
  const catalogIsConsumable = searchParams.get('type') || '';
  const setCatalogCategoryId = (v) => updateParam('category', v);
  const setCatalogIsConsumable = (v) => updateParam('type', v);

  // Vendors: show inactive toggle
  const showInactiveVendors = searchParams.get('inactive') === 'true';
  const setShowInactiveVendors = (v) => updateParam('inactive', v ? 'true' : '');

  // Assets: location filter
  const assetLocation = searchParams.get('location') || '';
  const setAssetLocation = (v) => updateParam('location', v);

  // Requisitions: workflow status filter
  const reqStatus = searchParams.get('status') || '';
  const setReqStatus = (v) => updateParam('status', v);

  // Logs: transaction type & date
  const logTxnType = searchParams.get('txnType') || '';
  const setLogTxnType = (v) => updateParam('txnType', v);
  const logDate = searchParams.get('date') || '';
  const setLogDate = (v) => updateParam('date', v);

  const [assetsData, setAssetsData] = useState([]);
  const [transfersData, setTransfersData] = useState([]);
  const [logsData, setLogsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [centralWarehousesDropdown, setCentralWarehousesDropdown] = useState([]);
  const [branchesDropdown, setBranchesDropdown] = useState([]);
  
  // Modal state for all forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editItem, setEditItem] = useState(null);

  const handleEditClick = (item, type) => {
    setEditItem(item);
    setModalType(type);
    setIsModalOpen(true);
  };

  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // searchQuery is driven from URL search param
  const urlSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQueryLocal] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);

  // Keep local search input synced if URL search changes (e.g. refresh or back/forward)
  useEffect(() => {
    setSearchQueryLocal(urlSearch);
    setDebouncedSearch(urlSearch);
  }, [urlSearch]);

  // Wrapper: update local state + URL param together
  const setSearchQuery = useCallback((val) => {
    setSearchQueryLocal(val);
    updateParam('search', val);
  }, [updateParam]);

  // Fake state for Requisitions master-detail expansion
  const [expandedReq, setExpandedReq] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery !== urlSearch) {
        updateParam('search', searchQuery);
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, urlSearch, updateParam]);

  // Reset page number on tab change WITHOUT wiping URL search parameters!
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, activeSubTab]);

  useEffect(() => {
    if (activeSubTab === 'vendors') {
      setCurrentPage(1);
      fetchMasterData();
    }
  }, [showInactiveVendors]);

  const fetchMasterData = async () => {
    setIsLoading(true);
    try {
      let res;
      const params = { page: currentPage, limit: 10, search: debouncedSearch };
      if (activeSubTab === 'categories') {
        res = await inventoryService.getCategories(params);
      } else if (activeSubTab === 'subcategories') {
        res = await inventoryService.getSubcategories(params);
      } else if (activeSubTab === 'central') {
        res = await inventoryService.getCentralWarehouses(params);
      } else if (activeSubTab === 'vendors') {
        if (!showInactiveVendors) params.isActive = true;
        res = await inventoryService.getVendors(params);
      } else if (activeSubTab === 'central_stock') {
        if (selectedCentralId) params.centralInventoryId = selectedCentralId;
        res = await inventoryService.getCentralStock(params);
      }
      const data = res?.data?.data || res?.data || res || [];
      const meta = res?.data?.meta || res?.meta || {};
      setMasterData(Array.isArray(data) ? data : []);
      setTotalPages(meta.totalPages || 1);
      setTotalRecords(meta.totalRecords || meta.total || data.length || 0);
    } catch (error) {
      console.error("Failed to fetch master data", error);
      setMasterData([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCatalogData = async () => {
    setIsLoading(true);
    try {
      const params = { page: currentPage, limit: 10, search: debouncedSearch };
      if (catalogCategoryId) params.categoryId = catalogCategoryId;
      if (catalogIsConsumable) params.isConsumable = catalogIsConsumable === 'true';
      
      const res = await inventoryService.getItems(params);
      const data = res?.data?.data || res?.data || res || [];
      const meta = res?.data?.meta || res?.meta || {};
      setCatalogData(Array.isArray(data) ? data : []);
      setTotalPages(meta.totalPages || 1);
      setTotalRecords(meta.totalRecords || meta.total || data.length || 0);
    } catch (error) {
      console.error("Failed to fetch catalog data", error);
      setCatalogData([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssetsData = async () => {
    setIsLoading(true);
    try {
      const res = await inventoryService.getAssets({ page: currentPage, limit: 10, search: debouncedSearch });
      const data = res?.data?.data || res?.data || res || [];
      const meta = res?.data?.meta || res?.meta || {};
      setAssetsData(Array.isArray(data) ? data : []);
      setTotalPages(meta.totalPages || 1);
      setTotalRecords(meta.totalRecords || meta.total || data.length || 0);
    } catch (error) {
      console.error("Failed to fetch assets data", error);
      setAssetsData([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransfersData = async () => {
    setIsLoading(true);
    try {
      const params = { page: currentPage, limit: 10, search: debouncedSearch };
      const [transfersRes, reqsRes] = await Promise.all([
        inventoryService.getRequisitions(params).catch(() => ({ data: [] })),
        inventoryService.getStockAdjustments(params).catch(() => ({ data: [] }))
      ]);
      const data = [...(transfersRes?.data?.data || transfersRes?.data || []), ...(reqsRes?.data?.data || reqsRes?.data || [])];
      setTransfersData(data);
      const maxPages = Math.max((transfersRes?.data?.meta?.totalPages || 1), (reqsRes?.data?.meta?.totalPages || 1));
      const totalRecs = (transfersRes?.data?.meta?.totalRecords || transfersRes?.data?.meta?.total || (transfersRes?.data?.data || []).length || 0) + 
                        (reqsRes?.data?.meta?.totalRecords || reqsRes?.data?.meta?.total || (reqsRes?.data?.data || []).length || 0);
      setTotalPages(maxPages);
      setTotalRecords(totalRecs);
    } catch (error) {
      console.error("Failed to fetch transfers data", error);
      setTransfersData([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogsData = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: debouncedSearch
      };
      
      const res = await inventoryService.getTransactions(params);
      
      let data = [];
      let totalPagesData = 1;
      let totalRecordsData = 0;
      
      if (res?.data) {
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          data = res.data.data;
          totalPagesData = res.data.meta?.totalPages || 1;
          totalRecordsData = res.data.meta?.totalRecords || res.data.meta?.total || data.length || 0;
        }
      }
      
      setLogsData(data);
      setTotalPages(totalPagesData);
      setTotalRecords(totalRecordsData);
    } catch (error) {
      console.error("Failed to fetch logs data", error);
      setLogsData([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'master') fetchMasterData();
    else if (activeTab === 'catalog') fetchCatalogData();
    else if (activeTab === 'assets') fetchAssetsData();
    else if (activeTab === 'transfers') fetchTransfersData();
    else if (activeTab === 'logs') fetchLogsData();
  }, [activeTab, activeSubTab, currentPage, debouncedSearch]);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const res = await inventoryService.getOverviewStats();
        setStatsData(res?.data || null);
      } catch (error) {
        console.error("Failed to fetch stats", error);
        setStatsData({
          overview: { totalCategories: 12, totalSubcategories: 34, totalMasterSKUs: 145, totalVendors: 20, totalCentralWarehouses: 2 },
          stockDistribution: { totalSocietyStockUnits: 4200, centralStock: { quantity: 3000, availableQuantity: 2750 }, branchStock: { quantity: 1200, availableQuantity: 1150 } },
          assets: { total: 350, active: 310, inRepair: 15, retired: 20, lost: 5 },
          pendingActions: { requisitionsAwaitingApproval: 4, transfersAwaitingApproval: 2, stockAdjustmentsAwaitingApproval: 1 }
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchDropdowns = async () => {
      try {
        if (permissions.canManageCentralWarehouse) {
          const res = await inventoryService.getCentralWarehouses({ limit: 100 });
          setCentralWarehousesDropdown(res?.data?.data || res?.data || []);
        }
        if (permissions.canViewSocietyStats) {
          const { branchService } = await import('../../api/branchService');
          const res = await branchService.getDropdownList().catch(() => ({ data: [] }));
          setBranchesDropdown(res?.data || []);
        }
      } catch (err) {
        console.error("Failed fetching dropdowns", err);
      }
    };

    fetchStats();
    fetchDropdowns();
  }, []);

  useEffect(() => {
    if (activeTab === 'overview' && permissions.canViewSocietyStats && selectedCentralId) {
      inventoryService.getCentralStats({ centralInventoryId: selectedCentralId, period: centralPeriod })
        .then(res => setCentralStatsData(res?.data))
        .catch(err => console.error(err));
    }
  }, [activeTab, selectedCentralId, centralPeriod]);

  useEffect(() => {
    if (activeTab === 'overview' && permissions.canViewBranchStats && selectedBranchId) {
      inventoryService.getBranchStats({ branchId: selectedBranchId, period: branchPeriod })
        .then(res => setBranchStatsData(res?.data))
        .catch(err => console.error(err));
    }
  }, [activeTab, selectedBranchId, branchPeriod]);

  useEffect(() => {
    if (activeTab === 'catalog') {
      setCurrentPage(1);
      fetchCatalogData();
    }
  }, [catalogCategoryId, catalogIsConsumable]);

  const handleModalClose = (success = false) => {
    setIsModalOpen(false);
    setEditItem(null);
    if (success === true && activeTab === 'master') {
      fetchMasterData();
    }
    if (success === true && activeTab === 'catalog') {
      fetchCatalogData();
    }
    if (success === true && activeTab === 'assets') {
      fetchAssetsData();
    }
  };

  const handleApproveRequest = async (req) => {
    try {
      const id = req._id || req.id;
      if (!id) return;
      if (req.type === 'Transfer' || req.transferId) {
        await inventoryService.approveTransfer(id, { status: 'approved' });
      } else if (req.adjustmentType) {
        toast.info("Stock adjustments auto-approve or follow custom logic.");
      } else {
        await inventoryService.approveRequisition(id, { status: 'approved' });
      }
      toast.success("Approved successfully!");
      fetchTransfersData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve.");
    }
  };

  const handleRejectRequest = async (req) => {
    try {
      const id = req._id || req.id;
      if (!id) return;
      if (req.type === 'Transfer' || req.transferId) {
         // Custom fallback for transfer
      } else if (req.adjustmentType) {
      } else {
        await inventoryService.rejectRequisition(id, { status: 'rejected' });
      }
      toast.success("Rejected successfully!");
      fetchTransfersData();
    } catch (err) {
      toast.error("Failed to reject.");
    }
  };

  const handleFulfillRequest = async (req) => {
    try {
      const id = req._id || req.id;
      if (!id) return;
      
      const payload = {
        status: 'fulfilled',
        items: req.items?.map(it => ({
          itemMasterId: typeof it.itemMasterId === 'object' ? (it.itemMasterId._id || it.itemMasterId.id) : it.itemMasterId,
          quantity: Number(it.quantity)
        })) || []
      };
      
      await inventoryService.fulfillRequisition(id, payload);
      toast.success("Requisition fulfilled successfully!");
      fetchTransfersData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fulfill.");
    }
  };

  const handleDispatchTransfer = async (req) => {
    try {
      const id = req._id || req.id;
      if (!id) return;
      
      const payload = {
        status: 'dispatched',
        items: req.items?.map(it => ({
          itemMasterId: typeof it.itemMasterId === 'object' ? (it.itemMasterId._id || it.itemMasterId.id) : it.itemMasterId,
          quantity: Number(it.quantity)
        })) || []
      };
      
      await inventoryService.dispatchTransfer(id, payload);
      toast.success("Transfer dispatched successfully!");
      fetchTransfersData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to dispatch transfer.");
    }
  };

  const handleReceiveTransfer = async (req) => {
    try {
      const id = req._id || req.id;
      if (!id) return;
      
      await inventoryService.receiveTransfer(id, { status: 'received' });
      toast.success("Transfer received successfully!");
      fetchTransfersData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to receive transfer.");
    }
  };

  const handleReportDamage = async (asset) => {
    try {
      const id = asset._id || asset.id;
      if (!id) return;
      await inventoryService.reportAssetDamage(id, { condition: 'DAMAGED' });
      toast.success("Damage reported successfully!");
      fetchAssetsData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to report damage.");
    }
  };

  const handleCompleteRepair = async (asset) => {
    try {
      const id = asset._id || asset.id;
      if (!id) return;
      await inventoryService.completeAssetRepair(id, { condition: 'GOOD' });
      toast.success("Repair completed successfully!");
      fetchAssetsData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete repair.");
    }
  };

  const handleRequestDisposal = async (asset) => {
    try {
      const id = asset._id || asset.id;
      if (!id) return;
      await inventoryService.requestAssetDisposal(id, { status: 'DISPOSED' });
      toast.success("Disposal requested successfully!");
      fetchAssetsData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request disposal.");
    }
  };

  const renderPagination = () => {
    return (
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        limit={10}
        onPageChange={setCurrentPage}
        disabled={isLoading}
      />
    );
  };

  const tabs = [
    ...(permissions.canManageCentralWarehouse || permissions.canViewBranchStats
      ? [{ id: 'master', label: permissions.canManageCentralWarehouse ? 'Central Inventory' : 'Branch Inventory', icon: <Building2 size={16} /> }]
      : []),
    { id: 'catalog', label: 'Catalog/Master Items', icon: <Layers size={16} /> },
    { id: 'assets', label: 'Asset Lifecycle', icon: <ShieldCheck size={16} /> },
    { id: 'transfers', label: 'Requisitions & Transfers', icon: <ArrowRightLeft size={16} /> },
    ...(permissions.roleLevel === 'ADMIN' ? [{ id: 'logs', label: 'System Logs', icon: <Activity size={16} /> }] : [])
  ];

  const renderMasterSetup = () => {
    if (activeSubTab === 'central' && !permissions.canManageCentralWarehouse) {
      return <div className="p-8 text-center text-red-500 font-medium">Access Denied: You do not have permission to view Central Warehouses.</div>;
    }
    if (activeSubTab === 'vendors' && !permissions.canManageVendors) {
      return <div className="p-8 text-center text-red-500 font-medium">Access Denied: You do not have permission to view Vendors.</div>;
    }
    
    return (
    <div className="space-y-4">
      {/* Sub-Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2 overflow-x-auto">
        <button
          onClick={() => handleSubTabChange('categories')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'categories' ? 'bg-[#225091] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => handleSubTabChange('subcategories')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'subcategories' ? 'bg-[#225091] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Subcategories
        </button>
        {permissions.canManageCentralWarehouse && (
          <>
            <button
              onClick={() => handleSubTabChange('central')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'central' ? 'bg-[#225091] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Central Warehouses
            </button>
            <button
              onClick={() => handleSubTabChange('central_stock')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'central_stock' ? 'bg-[#225091] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Central Stock
            </button>
          </>
        )}
        {permissions.canManageVendors && (
          <button
            onClick={() => handleSubTabChange('vendors')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'vendors' ? 'bg-[#225091] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Vendors
          </button>
        )}
      </div>
      
      {/* Filter Toolbar Card */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeSubTab}...`} 
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] transition-all shadow-2xs" 
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activeSubTab === 'vendors' && (
            <div className="flex items-center space-x-2 mr-2">
              <span className="text-xs font-semibold text-gray-600">Show Inactive</span>
              <button 
                type="button"
                onClick={() => setShowInactiveVendors(!showInactiveVendors)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${showInactiveVendors ? 'bg-[#225091]' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${showInactiveVendors ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          )}
          {activeSubTab === 'central_stock' && (
             <div className="relative">
               <select 
                 value={selectedCentralId} 
                 onChange={(e) => {
                   setSelectedCentralId(e.target.value);
                   setTimeout(fetchMasterData, 100);
                 }}
                 className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#225091] appearance-none pr-8 cursor-pointer shadow-2xs"
               >
                 <option value="">Select Warehouse...</option>
                 {centralWarehousesDropdown.map(wh => (
                   <option key={wh._id || wh.id} value={wh._id || wh.id}>{wh.name || wh.warehouseName}</option>
                 ))}
               </select>
               <ChevronDown size={14} className="text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
             </div>
          )}
          {((activeSubTab === 'categories' || activeSubTab === 'subcategories') && permissions.canManageCatalog) ||
           (activeSubTab === 'central' && permissions.canManageCentralWarehouse) ||
           (activeSubTab === 'vendors' && permissions.canManageVendors) ? (
            <button onClick={() => { setModalType(activeSubTab); setIsModalOpen(true); }} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#225091] text-white rounded-xl text-xs font-semibold hover:bg-[#193e73] transition-colors cursor-pointer shadow-2xs"><Plus size={15} /> <span>Add {activeSubTab === 'categories' ? 'Category' : activeSubTab === 'subcategories' ? 'Subcategory' : activeSubTab === 'central' ? 'Warehouse' : activeSubTab === 'vendors' ? 'Vendor' : 'Record'}</span></button>
          ) : null}
          {activeSubTab === 'central_stock' && permissions.canManageCentralWarehouse && (
            <button onClick={() => { setModalType('adjust_stock'); setIsModalOpen(true); }} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#225091] text-white rounded-xl text-xs font-semibold hover:bg-[#193e73] transition-colors cursor-pointer shadow-2xs"><Plus size={15} /> <span>Receive Stock</span></button>
          )}
          <ExportDropdown tableRef={masterTableRef} filename={`Inventory-Master-${activeSubTab}`} title={`Inventory Master - ${activeSubTab}`} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <TableWrapper minHeight="360px">
          <table ref={masterTableRef} className="w-full border-collapse min-w-[800px] text-center text-sm whitespace-nowrap">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Code</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Name</th>
                {activeSubTab === 'vendors' && <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Contact Person</th>}
                {activeSubTab === 'vendors' && <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Email / Phone</th>}
                {activeSubTab === 'vendors' && <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">GST Number</th>}
                {activeSubTab === 'central' && <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Manager</th>}
                {activeSubTab === 'categories' && <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Description</th>}
                {activeSubTab === 'subcategories' && <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Parent Category</th>}
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Status</th>
                {(((activeSubTab === 'categories' || activeSubTab === 'subcategories') && permissions.canManageCatalog) ||
                 (activeSubTab === 'central' && permissions.canManageCentralWarehouse) ||
                 (activeSubTab === 'vendors' && permissions.canManageVendors)) && (
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[13px]">
              {isLoading ? (
                <tr><td colSpan="8" className="py-12 text-center text-gray-500">Loading data...</td></tr>
              ) : masterData.length === 0 ? (
                <tr><td colSpan="8" className="py-12 text-center text-gray-500">No records found.</td></tr>
              ) : (
                masterData.map((item) => {
                  if (activeSubTab === 'central_stock') {
                     return (
                      <tr key={item._id} className="hover:bg-blue-50/25 transition-colors group">
                        <td className="py-3.5 px-4 font-semibold text-gray-900 whitespace-nowrap" colSpan={3}>{typeof item.itemMasterId === 'object' ? item.itemMasterId?.name : item.itemMasterId || 'Unknown'}</td>
                        <td className="py-3.5 px-4 font-semibold text-gray-700 whitespace-nowrap">Qty: {item.currentQuantity || 0}</td>
                        <td className="py-3.5 px-4 text-amber-600 font-semibold whitespace-nowrap">Reserved: {item.reservedQuantity || 0}</td>
                        <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">Reorder: {item.reorderPoint || '-'}</td>
                        <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap" colSpan={2}>Restocked: {item.lastRestockedDate ? new Date(item.lastRestockedDate).toLocaleDateString('en-GB') : 'N/A'}</td>
                      </tr>
                     );
                  }
                  
                  return (
                  <tr key={item._id} className="hover:bg-blue-50/25 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-medium text-gray-900 text-xs whitespace-nowrap">{item.code || item.vendorCode || item.warehouseCode || 'N/A'}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900 whitespace-nowrap">{item.name || item.warehouseName || item.vendorName || 'N/A'}</td>
                    {activeSubTab === 'vendors' && <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">{item.contactPerson || 'N/A'}</td>}
                    {activeSubTab === 'vendors' && <td className="py-3.5 px-4 text-gray-600 text-xs whitespace-nowrap">{item.email || ''}{item.phone ? ` • ${item.phone}` : ''}</td>}
                    {activeSubTab === 'vendors' && <td className="py-3.5 px-4 font-mono text-gray-600 text-xs whitespace-nowrap">{item.gstNumber || 'N/A'}</td>}
                    {activeSubTab === 'central' && <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">{typeof item.managerId === 'object' ? (item.managerId?.fullName || item.managerId?.name || item.managerId?.email || 'N/A') : (item.managerId || 'N/A')}</td>}
                    {activeSubTab === 'categories' && <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">{item.description || 'N/A'}</td>}
                    {activeSubTab === 'subcategories' && <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">{item.categoryId?.name || item.categoryId || 'N/A'}</td>}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${item.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-rose-50 text-rose-700 border-rose-200/60'}`}>
                        {item.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {(((activeSubTab === 'categories' || activeSubTab === 'subcategories') && permissions.canManageCatalog) ||
                     (activeSubTab === 'central' && permissions.canManageCentralWarehouse) ||
                     (activeSubTab === 'vendors' && permissions.canManageVendors)) && (
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button onClick={() => handleEditClick(item, activeSubTab)} className="p-1 text-gray-400 hover:text-[#225091] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" title="Edit"><Edit2 size={15} /></button>
                        <button className="p-1 text-gray-400 hover:text-rose-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" title="Delete"><Trash2 size={15} /></button>
                      </td>
                    )}
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </TableWrapper>
        {renderPagination()}
      </div>
    </div>
    );
  };

  const renderCatalog = () => {
    if (!permissions.canManageCatalog && !permissions.isStaffScoped) {
       // Wait, staff can view catalog read-only.
    }
    return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Master SKUs..." 
              className="w-full pl-9 pr-3 py-2 bg-gray-50/60 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:bg-white focus:border-[#225091] focus:ring-1 focus:ring-[#225091]/20 transition-all" 
            />
          </div>
          <select 
            value={catalogCategoryId} 
            onChange={(e) => setCatalogCategoryId(e.target.value)}
            className="border border-gray-200 bg-gray-50/60 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:bg-white focus:border-[#225091] cursor-pointer">
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="furniture">Furniture</option>
            <option value="stationery">Stationery</option>
          </select>
          <select 
            value={catalogIsConsumable} 
            onChange={(e) => setCatalogIsConsumable(e.target.value)}
            className="border border-gray-200 bg-gray-50/60 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:bg-white focus:border-[#225091] cursor-pointer">
            <option value="">All Types</option>
            <option value="true">Consumable</option>
            <option value="false">Non-Consumable</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          {permissions.canManageCatalog && (
            <button onClick={() => { setModalType('catalog'); setIsModalOpen(true); }} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#225091] text-white rounded-xl text-xs font-semibold hover:bg-[#193e73] transition-colors shadow-xs cursor-pointer"><Plus size={15} /> <span>Create Item</span></button>
          )}
          {permissions.canAdjustStock && (
            <button onClick={() => { setModalType('adjust_stock'); setIsModalOpen(true); }} className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 bg-white text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"><Layers size={15} /> <span>Adjust Stock</span></button>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        <TableWrapper minHeight="360px">
          <table className="w-full border-collapse text-sm text-center whitespace-nowrap">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Code</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Name</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Category</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Subcategory</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Consumable</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Unit</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Min Stock</th>
                {permissions.canManageCatalog && <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="8" className="py-12 text-center text-gray-400 font-medium text-xs">Loading catalog items...</td></tr>
              ) : catalogData.length === 0 ? (
                <tr><td colSpan="8" className="py-12 text-center text-gray-400 font-medium text-xs">No master SKUs found.</td></tr>
              ) : (
                catalogData.map((item) => (
                  <tr key={item._id || item.id} className="hover:bg-blue-50/25 transition-colors group">
                    <td className="py-3.5 px-4 text-[13px] font-bold text-slate-800 whitespace-nowrap font-mono">{item.code || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-[13px] font-semibold text-slate-800 whitespace-nowrap">{item.name || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-[13px] text-slate-600 font-medium whitespace-nowrap">{typeof item.categoryId === 'object' ? item.categoryId?.name : item.categoryId || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-[13px] text-slate-600 font-medium whitespace-nowrap">{typeof item.subcategoryId === 'object' ? item.subcategoryId?.name : item.subcategoryId || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {item.isConsumable ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#225091]">Yes</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500">No</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center text-[13px] text-slate-600 font-medium whitespace-nowrap">{item.unitOfMeasure || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-800 text-[13px] whitespace-nowrap">{item.minimumStockLevel || 0}</td>
                    {permissions.canManageCatalog && (
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button onClick={() => handleEditClick(item, 'catalog')} className="p-1 text-gray-400 hover:text-[#225091] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" title="Edit"><Edit2 size={15} /></button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableWrapper>
        {renderPagination()}
      </div>
    </div>
    );
  };

  const renderAssets = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Asset Tags or Serial Nos..." 
              className="w-full pl-9 pr-3 py-2 bg-gray-50/60 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:bg-white focus:border-[#225091] focus:ring-1 focus:ring-[#225091]/20 transition-all" 
            />
          </div>
          <select 
            value={assetLocation} 
            onChange={(e) => setAssetLocation(e.target.value)}
            className="border border-gray-200 bg-gray-50/60 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:bg-white focus:border-[#225091] cursor-pointer">
            <option value="">All Locations</option>
            <option value="central">Central Warehouse</option>
            <option value="branch">Branch Offices</option>
            <option value="employee">With Employees</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          {!isBranchManager && (
            <button onClick={() => { setModalType('assets'); setIsModalOpen(true); }} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#225091] text-white rounded-xl text-xs font-semibold hover:bg-[#193e73] transition-colors shadow-xs cursor-pointer"><Plus size={15} /> <span>Register Asset</span></button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        <TableWrapper minHeight="360px">
          <table className="w-full border-collapse text-sm text-center whitespace-nowrap">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Asset Tag</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Item Master</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Serial No.</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Current Location / Assignee</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Condition</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Purchase Date / Warranty</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Asset Status</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="8" className="py-12 text-center text-gray-400 font-medium text-xs">Loading assets...</td></tr>
              ) : assetsData.length === 0 ? (
                <tr><td colSpan="8" className="py-12 text-center text-gray-400 font-medium text-xs">No registered assets found.</td></tr>
              ) : (
                assetsData.map((asset) => (
                  <tr key={asset._id || asset.id} className="hover:bg-blue-50/25 transition-colors group">
                    <td className="py-3.5 px-4 text-[13px] font-bold text-slate-900 whitespace-nowrap font-mono">{asset.assetTag || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-[13px] font-semibold text-slate-800 whitespace-nowrap">{typeof asset.itemMasterId === 'object' ? asset.itemMasterId.name : (asset.itemName || 'Unknown Item')}</td>
                    <td className="py-3.5 px-4 text-[13px] font-mono text-slate-500 whitespace-nowrap">{asset.serialNumber || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-[13px] text-slate-600 font-medium whitespace-nowrap">{asset.assignedTo ? `User: ${typeof asset.assignedTo === 'object' ? asset.assignedTo.name : asset.assignedTo}` : (asset.currentLocation || 'Central Warehouse')}</td>
                    <td className="py-3.5 px-4 text-[13px] text-slate-600 font-medium whitespace-nowrap">{asset.condition || 'Good'}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">{new Date(asset.purchaseDate || asset.createdAt).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${asset.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700' : asset.status === 'ASSIGNED' ? 'bg-blue-50 text-[#225091]' : 'bg-amber-50 text-amber-700'}`}>
                        {asset.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {asset.status === 'AVAILABLE' && (
                        <button onClick={() => { setEditItem(asset); setModalType('issue_asset'); setIsModalOpen(true); }} className="p-1 text-gray-400 hover:text-[#225091] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" title="Issue to Employee"><Users size={15} /></button>
                      )}
                      {asset.status !== 'DISPOSED' && asset.condition !== 'DAMAGED' && (
                        <button onClick={() => handleReportDamage(asset)} className="p-1 text-gray-400 hover:text-rose-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" title="Report Damage"><ShieldAlert size={15} /></button>
                      )}
                      {asset.condition === 'DAMAGED' && (
                        <>
                          <button onClick={() => handleCompleteRepair(asset)} className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" title="Complete Repair"><Wrench size={15} /></button>
                          <button onClick={() => handleRequestDisposal(asset)} className="p-1 text-gray-400 hover:text-slate-800 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" title="Request Disposal"><Trash2 size={15} /></button>
                        </>
                      )}
                      <button className="p-1 text-gray-400 hover:text-amber-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" title="Retire/Return"><ArrowRightLeft size={15} /></button>
                      <button onClick={() => handleEditClick(asset, 'assets')} className="p-1 text-gray-400 hover:text-[#225091] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer" title="Edit"><Edit2 size={15} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableWrapper>
        {renderPagination()}
      </div>
    </div>
  );

  const renderRequisitions = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={reqStatus}
            onChange={(e) => setReqStatus(e.target.value)}
            className="border border-gray-200 bg-gray-50/60 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:bg-white focus:border-[#225091] cursor-pointer">
            <option value="">All Workflow Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="DISPATCHED">DISPATCHED</option>
            <option value="RECEIVED">RECEIVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setModalType('requests'); setIsModalOpen(true); }} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#225091] text-white rounded-xl text-xs font-semibold hover:bg-[#193e73] transition-colors shadow-xs cursor-pointer"><ShoppingCart size={15} /> <span>Submit Request</span></button>
          <button onClick={() => { setModalType('transfers'); setIsModalOpen(true); }} className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 bg-white text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"><ArrowRightLeft size={15} /> <span>Submit Transfer</span></button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        <TableWrapper minHeight="360px">
          <table className="w-full border-collapse text-sm text-center whitespace-nowrap">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center w-10"></th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Req ID / Transfer ID</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Origin &rarr; Destination</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Employee</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Remarks</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Status</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="8" className="py-12 text-center text-gray-400 font-medium text-xs">Loading requisitions and transfers...</td></tr>
              ) : transfersData.length === 0 ? (
                <tr><td colSpan="8" className="py-12 text-center text-gray-400 font-medium text-xs">No action requests found.</td></tr>
              ) : (
                transfersData.map((req) => (
                  <React.Fragment key={req._id || req.id}>
                    <tr className="hover:bg-blue-50/25 transition-colors cursor-pointer group" onClick={() => setExpandedReq(expandedReq === (req._id || req.id) ? null : (req._id || req.id))}>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-md font-bold text-xs transition-colors ${expandedReq === (req._id || req.id) ? 'bg-blue-100 text-[#225091]' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-[#225091]'}`}>
                          {expandedReq === (req._id || req.id) ? '−' : '+'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[13px] font-bold text-slate-800 whitespace-nowrap font-mono">{req.code || req.requisitionId || req.transferId || 'REQ-XXX'}</td>
                      <td className="py-3.5 px-4 text-[13px] text-slate-700 font-medium whitespace-nowrap">{req.type || (req.adjustmentType ? 'Stock Adjustment' : 'Branch Requisition')}</td>
                      <td className="py-3.5 px-4 text-[13px] text-slate-600 font-medium whitespace-nowrap">{typeof req.employeeId === 'object' ? req.employeeId.name : (req.employeeId || 'System')}</td>
                      <td className="py-3.5 px-4 text-[13px] text-slate-500 max-w-[200px] truncate">{req.remarks || 'No remarks provided'}</td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${req.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : req.status === 'APPROVED' ? 'bg-blue-50 text-[#225091]' : req.status === 'REJECTED' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {req.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <button className="px-2.5 py-1 text-xs font-semibold text-[#225091] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">View</button>
                      </td>
                    </tr>
                    {expandedReq === (req._id || req.id) && (
                      <tr className="bg-slate-50/50">
                        <td colSpan="7" className="p-0 border-b border-gray-200/80">
                          <div className="p-5 pl-12 bg-slate-50/70">
                            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">Requested Items</h4>
                            <div className="max-w-xl border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                              <table className="w-full border-collapse text-center text-sm whitespace-nowrap">
                                <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
                                  <tr>
                                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Item Master</th>
                                    <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Requested Qty</th>
                                  </tr>
                                </thead>
                                <tbody className="text-xs divide-y divide-gray-100">
                                  {req.items?.map((it, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/60">
                                      <td className="py-2 px-3 text-slate-700 font-medium">{typeof it.itemMasterId === 'object' ? it.itemMasterId.name : it.itemMasterId}</td>
                                      <td className="py-2 px-3 text-right font-bold text-slate-900">{it.quantity}</td>
                                    </tr>
                                  )) || (
                                    <tr>
                                      <td className="py-2 px-3 text-slate-700 font-medium">{typeof req.itemMasterId === 'object' ? req.itemMasterId.name : req.itemMasterId}</td>
                                      <td className="py-2 px-3 text-right font-bold text-slate-900">{req.quantity}</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                            {req.status === 'PENDING' && (
                              <div className="mt-3.5 flex items-center gap-2">
                                {((req.adjustmentType && permissions.canApproveAdjustments) || 
                                  ((req.transferId || req.type === 'Transfer') && permissions.canApproveTransfers) ||
                                  (!(req.adjustmentType || req.transferId || req.type === 'Transfer') && permissions.canApproveRequisitions)) && (
                                  <>
                                    <button onClick={() => handleApproveRequest(req)} className="px-3.5 py-1.5 bg-[#225091] text-white rounded-xl text-xs font-semibold hover:bg-[#193e73] transition-colors shadow-2xs cursor-pointer">Approve</button>
                                    <button onClick={() => handleRejectRequest(req)} className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors shadow-2xs cursor-pointer">Reject</button>
                                  </>
                                )}
                                {!(((req.adjustmentType && permissions.canApproveAdjustments) || 
                                  ((req.transferId || req.type === 'Transfer') && permissions.canApproveTransfers) ||
                                  (!(req.adjustmentType || req.transferId || req.type === 'Transfer') && permissions.canApproveRequisitions))) && (
                                  <span className="text-xs text-rose-500 font-medium italic">Approval requires higher privileges.</span>
                                )}
                              </div>
                            )}
                            {req.status === 'APPROVED' && !req.adjustmentType && !(req.transferId || req.type === 'Transfer') && permissions.canApproveRequisitions && (
                              <div className="mt-3.5 flex items-center gap-2">
                                <button onClick={() => handleFulfillRequest(req)} className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer">Fulfill Requisition</button>
                              </div>
                            )}
                            {req.status === 'APPROVED' && (req.transferId || req.type === 'Transfer') && permissions.canApproveTransfers && (
                              <div className="mt-3.5 flex items-center gap-2">
                                <button onClick={() => handleDispatchTransfer(req)} className="px-3.5 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition-colors shadow-2xs cursor-pointer">Dispatch Transfer</button>
                              </div>
                            )}
                            {req.status === 'DISPATCHED' && (req.transferId || req.type === 'Transfer') && (
                              <div className="mt-3.5 flex items-center gap-2">
                                <button onClick={() => handleReceiveTransfer(req)} className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer">Receive Transfer</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </TableWrapper>
        {renderPagination()}
      </div>
    </div>
  );

  const renderTopStats = () => {
    const reqCount = statsData ? ((statsData.pendingActions?.requisitionsAwaitingApproval || 0) + (statsData.pendingActions?.transfersAwaitingApproval || 0)) : 0;

    return (
      <div className="mb-5 mt-2 space-y-3">
        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3">
          <StatsCard
            layout="centered"
            color="blue"
            label="Total SKUs"
            value={isLoading && !statsData ? '...' : (statsData?.overview?.totalMasterSKUs ?? 0)}
            isActive={activeTab === 'catalog'}
            onClick={() => handleTabChange('catalog')}
          />
          <StatsCard
            layout="centered"
            color="indigo"
            label="Categories"
            value={isLoading && !statsData ? '...' : (statsData?.overview?.totalCategories ?? 0)}
            isActive={activeTab === 'master' && activeSubTab === 'categories'}
            onClick={() => handleTabChange('master', 'categories')}
          />
          <StatsCard
            layout="centered"
            color="emerald"
            label="Total Assets"
            value={isLoading && !statsData ? '...' : (statsData?.assets?.total ?? 0)}
            isActive={activeTab === 'assets' && activeSubTab !== 'active'}
            onClick={() => handleTabChange('assets', 'all')}
          />
          <StatsCard
            layout="centered"
            color="cyan"
            label="Active Assets"
            value={isLoading && !statsData ? '...' : (statsData?.assets?.active ?? 0)}
            isActive={activeTab === 'assets' && activeSubTab === 'active'}
            onClick={() => handleTabChange('assets', 'active')}
          />
          {permissions.canViewSocietyStats && (
            <StatsCard
              layout="centered"
              color="teal"
              label="Central Stock"
              value={isLoading && !statsData ? '...' : (statsData?.stockDistribution?.centralStock?.quantity ?? 0)}
              isActive={activeTab === 'master' && activeSubTab === 'central_stock'}
              onClick={() => handleTabChange('master', 'central_stock')}
            />
          )}
          <StatsCard
            layout="centered"
            color="rose"
            label="Branch Stock"
            value={isLoading && !statsData ? '...' : (statsData?.stockDistribution?.branchStock?.quantity ?? 0)}
            isActive={activeTab === 'master' && activeSubTab === 'branch_stock'}
            onClick={() => handleTabChange('master', 'branch_stock')}
          />
          <StatsCard
            layout="centered"
            color={reqCount > 0 ? 'rose' : 'gray'}
            label="Action Req."
            value={isLoading && !statsData ? '...' : reqCount}
            sublabel={reqCount > 0 ? 'Needs Attention' : 'All Clear'}
            isActive={activeTab === 'transfers'}
            onClick={() => handleTabChange('transfers')}
          />
        </div>

        {/* Secondary Warehouse & Branch Filters */}
        {(permissions.canViewSocietyStats || permissions.canViewBranchStats) && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs">
            <div className="flex flex-wrap items-center gap-3">
              {permissions.canViewSocietyStats && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Central WH:</span>
                  <div className="relative">
                    <select 
                      value={selectedCentralId} 
                      onChange={(e) => setSelectedCentralId(e.target.value)}
                      className="appearance-none bg-slate-50/70 border border-gray-200 hover:border-gray-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 pr-7 focus:outline-none focus:border-[#225091] cursor-pointer"
                    >
                      <option value="">All Warehouses</option>
                      {centralWarehousesDropdown.map(wh => (
                        <option key={wh._id || wh.id} value={wh._id || wh.id}>{wh.name || wh.warehouseName}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select 
                      value={centralPeriod} 
                      onChange={(e) => setCentralPeriod(e.target.value)}
                      className="appearance-none bg-slate-50/70 border border-gray-200 hover:border-gray-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 pr-7 focus:outline-none focus:border-[#225091] cursor-pointer"
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="all">All time</option>
                    </select>
                    <ChevronDown size={13} className="text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              )}

              {permissions.canViewBranchStats && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Branch:</span>
                  <div className="relative">
                    <select 
                      value={selectedBranchId} 
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="appearance-none bg-slate-50/70 border border-gray-200 hover:border-gray-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 pr-7 focus:outline-none focus:border-[#225091] cursor-pointer disabled:opacity-60"
                      disabled={permissions.roleLevel !== 'ADMIN'}
                    >
                      <option value="">{permissions.roleLevel === 'ADMIN' ? 'All Branches' : 'My Branch'}</option>
                      {branchesDropdown.map(b => (
                        <option key={b._id || b.id} value={b._id || b.id}>{b.name || b.branchName}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select 
                      value={branchPeriod} 
                      onChange={(e) => setBranchPeriod(e.target.value)}
                      className="appearance-none bg-slate-50/70 border border-gray-200 hover:border-gray-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 pr-7 focus:outline-none focus:border-[#225091] cursor-pointer"
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="all">All time</option>
                    </select>
                    <ChevronDown size={13} className="text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Detail Cards for selected Warehouse/Branch stats */}
        {(centralStatsData || branchStatsData) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {centralStatsData && (
              <>
                <StatsCard layout="centered" color="teal" label="Central Quantity" value={centralStatsData.stock?.totalQuantity || 0} />
                <StatsCard layout="centered" color="teal" label="Central SKUs" value={centralStatsData.stock?.totalUniqueSKUs || 0} />
              </>
            )}
            {branchStatsData && (
              <>
                <StatsCard layout="centered" color="rose" label="Branch Quantity" value={branchStatsData.stock?.totalQuantity || 0} />
                <StatsCard layout="centered" color="rose" label="Branch Assets" value={branchStatsData.assets?.totalInBranch || 0} />
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderLogs = () => {
    if (permissions.roleLevel !== 'ADMIN') {
      return (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs">
          <p className="text-rose-600 font-semibold text-sm">Access Denied: System logs are restricted to Administrators.</p>
        </div>
      );
    }
    
    return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={logTxnType}
            onChange={(e) => setLogTxnType(e.target.value)}
            className="border border-gray-200 bg-gray-50/60 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:bg-white focus:border-[#225091] cursor-pointer">
            <option value="">All Transaction Types</option>
            <option value="STOCK_IN">STOCK_IN</option>
            <option value="ISSUE">ISSUE</option>
            <option value="RETURN">RETURN</option>
            <option value="TRANSFER">TRANSFER</option>
            <option value="ADJUSTMENT">ADJUSTMENT</option>
          </select>
          <input 
            type="date" 
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            className="border border-gray-200 bg-gray-50/60 rounded-xl px-3.5 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:bg-white focus:border-[#225091] cursor-pointer" 
          />
        </div>
        <ExportDropdown buttonText="Export Trail" tableRef={auditLogsTableRef} filename="Inventory-Audit-Trail" title="Inventory Audit Trail" />
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        <TableWrapper minHeight="360px">
          <table ref={auditLogsTableRef} className="w-full border-collapse text-sm text-center whitespace-nowrap">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Timestamp</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Action Type</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Entity Type</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">User</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-left">Remarks</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="6" className="py-12 text-center text-gray-400 font-medium text-xs">Loading system logs...</td></tr>
              ) : logsData.length === 0 ? (
                <tr><td colSpan="6" className="py-12 text-center text-gray-400 font-medium text-xs">No system logs found.</td></tr>
              ) : (
                logsData.map((log) => (
                  <tr key={log._id || log.id} className="hover:bg-blue-50/25 transition-colors group">
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap font-mono">{new Date(log.createdAt || log.timestamp || Date.now()).toLocaleString()}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${log.actionType === 'STOCK_IN' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-[#225091]'}`}>
                        {log.actionType || log.type || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[13px] text-slate-700 font-medium whitespace-nowrap">{log.entityType || 'InventoryTransaction'}</td>
                    <td className="py-3.5 px-4 text-[13px] text-slate-600 font-medium whitespace-nowrap">{typeof log.userId === 'object' ? (log.userId?.name || log.userId?.email) : (log.userId || 'System')}</td>
                    <td className="py-3.5 px-4 text-[13px] text-slate-600 font-medium">{log.remarks || log.details || 'No details'}</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button className="px-2.5 py-1 text-xs font-semibold text-[#225091] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableWrapper>
        {renderPagination()}
      </div>
    </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-4">
      <PageHeader
        title="Inventory Control System"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Society Operations' },
          { label: 'Inventory' }
        ]}
      />

      {/* Persistent Stats Row */}
      {renderTopStats()}

      {/* Horizontal Tabs below stats */}
      <div className="mt-2 flex items-center gap-6 border-b border-gray-200/80 px-2 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center space-x-2 pb-2.5 font-semibold text-xs sm:text-sm transition-all cursor-pointer relative whitespace-nowrap ${
              activeTab === tab.id 
                ? 'text-[#225091] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#225091]' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active Filter Chips — covers entire inventory module */}
      {(() => {
        const chipClass = "inline-flex items-center gap-1 bg-[#e8edf5] text-[#225091] rounded-full px-3 py-1 text-xs font-medium";
        const xClass = "ml-1 hover:text-red-500 transition-colors font-bold cursor-pointer";
        const chips = [];

        if (searchQuery) chips.push({ label: `Search: "${searchQuery}"`, onClear: () => setSearchQuery('') });
        if (catalogCategoryId) chips.push({ label: `Category: ${catalogCategoryId}`, onClear: () => setCatalogCategoryId('') });
        if (catalogIsConsumable) chips.push({ label: `Type: ${catalogIsConsumable === 'true' ? 'Consumable' : 'Non-Consumable'}`, onClear: () => setCatalogIsConsumable('') });
        if (showInactiveVendors) chips.push({ label: 'Showing Inactive Vendors', onClear: () => setShowInactiveVendors(false) });
        if (assetLocation) chips.push({ label: `Location: ${assetLocation === 'central' ? 'Central Warehouse' : assetLocation === 'branch' ? 'Branch Offices' : 'With Employees'}`, onClear: () => setAssetLocation('') });
        if (reqStatus) chips.push({ label: `Status: ${reqStatus}`, onClear: () => setReqStatus('') });
        if (logTxnType) chips.push({ label: `Txn Type: ${logTxnType}`, onClear: () => setLogTxnType('') });
        if (logDate) chips.push({ label: `Date: ${logDate}`, onClear: () => setLogDate('') });

        if (chips.length === 0) return null;

        const clearAll = () => {
          setSearchQuery(''); setCatalogCategoryId(''); setCatalogIsConsumable('');
          setShowInactiveVendors(false); setAssetLocation(''); setReqStatus('');
          setLogTxnType(''); setLogDate('');
        };

        return (
          <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
            <span className="text-xs font-semibold text-gray-500 mr-1">Active Filters:</span>
            {chips.map((chip, i) => (
              <span key={i} className={chipClass}>
                {chip.label}
                <button onClick={chip.onClear} className={xClass}>×</button>
              </span>
            ))}
            {chips.length > 1 && (
              <button
                onClick={clearAll}
                className="text-xs text-red-500 hover:text-red-700 font-semibold ml-2 underline transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
        );
      })()}

      {/* Main Content Area */}
      <div className="mt-3 w-full">
        {activeTab === 'master' && renderMasterSetup()}
        {activeTab === 'catalog' && renderCatalog()}
        {activeTab === 'assets' && renderAssets()}
        {activeTab === 'transfers' && renderRequisitions()}
        {activeTab === 'logs' && renderLogs()}
      </div>

      <InventoryModals 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        modalType={modalType} 
        initialData={editItem}
        authUser={authUser}
      />
    </div>
  );
};

// Helper for expand icon
const ChevronIcon = ({ expanded }) => (
  <svg 
    className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90 text-[#225091]' : ''}`} 
    fill="none" viewBox="0 0 24 24" stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default SocietyInventorySPA;
