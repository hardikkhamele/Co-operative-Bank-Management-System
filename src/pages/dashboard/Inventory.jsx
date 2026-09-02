import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Search, 
  SlidersHorizontal, 
  Download, 
  Plus, 
  Eye, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Building,
  Calendar,
  Layers,
  Wrench,
  ShoppingCart,
  Boxes,
  Trash2,
  Edit2,
  ExternalLink,
  Loader2,
  Check,
  Ban
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { inventoryService } from '../../api/inventoryService';

// Seeded Initial Data for Tab 1: Inventory Assets (matching screenshot 3)
const INITIAL_INVENTORY_ITEMS = [
  {
    id: 'INV-001',
    item: 'Office Chair',
    category: 'Furniture',
    quantity: 5,
    purchaseDate: '2026-08-30',
    amount: 23500,
    vendor: 'ABC Furniture',
    status: 'Active',
    serialNumber: 'FUR-CH-2026-01',
    location: 'Head Office - 2nd Floor'
  },
  {
    id: 'INV-002',
    item: 'Air Conditioner 1.5T',
    category: 'Appliances',
    quantity: 2,
    purchaseDate: '2025-06-15',
    amount: 84000,
    vendor: 'Reliance Digital',
    status: 'Active',
    serialNumber: 'AC-VOL-8492',
    location: 'Server Room & Main Hall'
  },
  {
    id: 'INV-003',
    item: 'Laser Printer',
    category: 'Office Equipment',
    quantity: 1,
    purchaseDate: '2026-01-10',
    amount: 15000,
    vendor: 'HP Store',
    status: 'Active',
    serialNumber: 'HP-LJ-1020P',
    location: 'Loan Department'
  },
  {
    id: 'INV-004',
    item: 'Water Dispenser',
    category: 'Appliances',
    quantity: 1,
    purchaseDate: '2024-03-22',
    amount: 8500,
    vendor: 'AquaGuard',
    status: 'Damaged',
    serialNumber: 'AQ-WD-9912',
    location: 'Pantry'
  }
];

// Seeded Initial Data for Tab 2: Purchase Requests (matching screenshot 2)
const INITIAL_PURCHASE_REQUESTS = [
  {
    id: 'PR-1001',
    item: 'Office Chair',
    category: 'Furniture',
    quantity: 5,
    estimatedAmount: 25000,
    requestedBy: 'Amit Kumar',
    date: '2026-08-30',
    status: 'Pending',
    reason: 'Additional ergonomic seating required for new loan audit team members.'
  },
  {
    id: 'PR-1002',
    item: 'Water Filter',
    category: 'Appliances',
    quantity: 1,
    estimatedAmount: 12000,
    requestedBy: 'Neha Sharma',
    date: '2026-08-29',
    status: 'Approved',
    reason: 'Replacement of old water filter unit on 1st floor.'
  },
  {
    id: 'PR-1003',
    item: 'Whiteboard',
    category: 'Office Equipment',
    quantity: 2,
    estimatedAmount: 4000,
    requestedBy: 'Raj Singh',
    date: '2026-08-28',
    status: 'Purchased',
    reason: 'Meeting room presentation boards for branch managers.'
  },
  {
    id: 'PR-1004',
    item: 'MacBook Pro',
    category: 'Electronics',
    quantity: 1,
    estimatedAmount: 150000,
    requestedBy: 'Priya Desai',
    date: '2026-08-25',
    status: 'Rejected',
    reason: 'High-performance laptop request for design and reporting tasks.'
  }
];

// Seeded Initial Data for Tab 3: Maintenance & Repair (matching screenshot 1)
const INITIAL_MAINTENANCE_RECORDS = [
  {
    id: 'MR-2001',
    date: '2026-08-30',
    asset: 'Air Conditioner 1.5T',
    type: 'Service',
    serviceProvider: 'ABC Services',
    cost: 1200,
    status: 'Completed',
    billUrl: 'https://storage.example.com/bills/ac-service-aug.pdf',
    notes: 'Quarterly chemical wash and gas level check.'
  },
  {
    id: 'MR-2002',
    date: '2026-08-28',
    asset: 'Office Chair',
    type: 'Repair',
    serviceProvider: 'XYZ Furniture Repair',
    cost: 500,
    status: 'Completed',
    billUrl: 'https://storage.example.com/bills/chair-repair-aug.pdf',
    notes: 'Hydraulic wheel base replaced.'
  },
  {
    id: 'MR-2003',
    date: '2026-08-25',
    asset: 'Water Dispenser',
    type: 'Service',
    serviceProvider: 'Aqua Services',
    cost: 800,
    status: 'Completed',
    billUrl: 'https://storage.example.com/bills/water-dispenser-service.pdf',
    notes: 'Filter candle replacement & sanitation.'
  },
  {
    id: 'MR-2004',
    date: '2026-09-01',
    asset: 'Laser Printer',
    type: 'Maintenance',
    serviceProvider: 'HP Care',
    cost: 2000,
    status: 'Pending',
    billUrl: null,
    notes: 'Paper feed roller replacement scheduled.'
  }
];

const CATEGORY_LIST = [
  'Furniture',
  'Appliances',
  'Office Equipment',
  'Electronics',
  'Vehicles',
  'IT Hardware'
];

const Inventory = () => {
  const navigate = useNavigate();

  // Active Main Tab: 'inventory' | 'requests' | 'maintenance'
  const [activeTab, setActiveTab] = useState('inventory');

  // TAB 1: Inventory Management State
  const [inventoryList, setInventoryList] = useState(() => {
    const saved = localStorage.getItem('crm_inventory_list');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY_ITEMS;
  });
  const [invSearch, setInvSearch] = useState('');
  const [invCategory, setInvCategory] = useState('');
  const [invPage, setInvPage] = useState(1);
  const [invPageSize] = useState(10);
  const [exporting, setExporting] = useState(false);

  // Tab 1 Modals
  const [isAddInvModalOpen, setIsAddInvModalOpen] = useState(false);
  const [isViewInvModalOpen, setIsViewInvModalOpen] = useState(false);
  const [selectedInvItem, setSelectedInvItem] = useState(null);
  const [invForm, setInvForm] = useState({
    item: '',
    category: 'Furniture',
    quantity: 1,
    purchaseDate: new Date().toISOString().split('T')[0],
    amount: '',
    vendor: '',
    status: 'Active',
    serialNumber: '',
    location: ''
  });

  // TAB 2: Purchase Requests State
  const [purchaseRequests, setPurchaseRequests] = useState(() => {
    const saved = localStorage.getItem('crm_purchase_requests');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_REQUESTS;
  });
  const [reqSearch, setReqSearch] = useState('');
  const [reqStatus, setReqStatus] = useState('');
  const [reqPage, setReqPage] = useState(1);
  const [reqPageSize] = useState(10);

  // Tab 2 Modals
  const [isAddReqModalOpen, setIsAddReqModalOpen] = useState(false);
  const [isViewReqModalOpen, setIsViewReqModalOpen] = useState(false);
  const [selectedReqItem, setSelectedReqItem] = useState(null);
  const [reqForm, setReqForm] = useState({
    item: '',
    category: 'Furniture',
    quantity: 1,
    estimatedAmount: '',
    requestedBy: '',
    date: new Date().toISOString().split('T')[0],
    reason: ''
  });

  // TAB 3: Maintenance & Repair State
  const [maintenanceRecords, setMaintenanceRecords] = useState(() => {
    const saved = localStorage.getItem('crm_maintenance_records');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_RECORDS;
  });
  const [maintSearch, setMaintSearch] = useState('');
  const [maintType, setMaintType] = useState('');
  const [maintPage, setMaintPage] = useState(1);
  const [maintPageSize] = useState(10);

  // Tab 3 Modals
  const [isAddMaintModalOpen, setIsAddMaintModalOpen] = useState(false);
  const [isViewMaintModalOpen, setIsViewMaintModalOpen] = useState(false);
  const [selectedMaintItem, setSelectedMaintItem] = useState(null);
  const [maintForm, setMaintForm] = useState({
    asset: '',
    type: 'Service',
    serviceProvider: '',
    cost: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Completed',
    notes: '',
    hasBill: true
  });

  // Slide-out Filter Drawers for all tabs
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [drawerStatusFilter, setDrawerStatusFilter] = useState('');
  const [drawerMinAmount, setDrawerMinAmount] = useState('');
  const [drawerMaxAmount, setDrawerMaxAmount] = useState('');

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem('crm_inventory_list', JSON.stringify(inventoryList));
  }, [inventoryList]);

  useEffect(() => {
    localStorage.setItem('crm_purchase_requests', JSON.stringify(purchaseRequests));
  }, [purchaseRequests]);

  useEffect(() => {
    localStorage.setItem('crm_maintenance_records', JSON.stringify(maintenanceRecords));
  }, [maintenanceRecords]);

  // Optional: Try syncing with backend API if available
  useEffect(() => {
    const fetchApiInventory = async () => {
      try {
        const res = await inventoryService.list({ page: 1, limit: 50 });
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const formatted = res.data.map((item, idx) => ({
            id: item.id || item._id || `INV-${1000 + idx}`,
            item: item.assets || item.item || item.name || 'Office Asset',
            category: item.category || 'Office Equipment',
            quantity: item.quantity || 1,
            purchaseDate: item.purchaseDate ? item.purchaseDate.split('T')[0] : (item.createdAt ? item.createdAt.split('T')[0] : '2026-08-30'),
            amount: item.amount || item.cost || (item.quantity * 2500) || 5000,
            vendor: item.vendor || 'Authorized Supplier',
            status: item.status || 'Active',
            serialNumber: item.serialNumber || `SN-${1000 + idx}`,
            location: item.location || 'Branch Office'
          }));
          // Merge API data
          setInventoryList(prev => {
            const ids = new Set(formatted.map(f => f.id));
            const retained = prev.filter(p => !ids.has(p.id));
            return [...formatted, ...retained];
          });
        }
      } catch (err) {
        // Silent fallback to local/seeded inventory state
      }
    };
    fetchApiInventory();
  }, []);

  // Format Date Helper (e.g., '2026-08-30' -> '30 Aug 2026')
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Format Currency (INR)
  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // --- FILTERED DATA SETS ---

  // 1. Filtered Inventory List
  const filteredInventory = useMemo(() => {
    return inventoryList.filter(item => {
      const matchSearch = !invSearch.trim() || 
        item.item.toLowerCase().includes(invSearch.toLowerCase().trim()) ||
        item.vendor.toLowerCase().includes(invSearch.toLowerCase().trim()) ||
        item.category.toLowerCase().includes(invSearch.toLowerCase().trim());
      const matchCategory = !invCategory || item.category === invCategory;
      const matchStatus = !drawerStatusFilter || item.status === drawerStatusFilter;
      const matchMinAmount = !drawerMinAmount || item.amount >= Number(drawerMinAmount);
      const matchMaxAmount = !drawerMaxAmount || item.amount <= Number(drawerMaxAmount);
      return matchSearch && matchCategory && matchStatus && matchMinAmount && matchMaxAmount;
    });
  }, [inventoryList, invSearch, invCategory, drawerStatusFilter, drawerMinAmount, drawerMaxAmount]);

  // 2. Filtered Purchase Requests List
  const filteredRequests = useMemo(() => {
    return purchaseRequests.filter(item => {
      const matchSearch = !reqSearch.trim() ||
        item.item.toLowerCase().includes(reqSearch.toLowerCase().trim()) ||
        item.id.toLowerCase().includes(reqSearch.toLowerCase().trim()) ||
        item.requestedBy.toLowerCase().includes(reqSearch.toLowerCase().trim());
      const matchStatus = !reqStatus || item.status === reqStatus;
      const matchDrawerStatus = !drawerStatusFilter || item.status === drawerStatusFilter;
      return matchSearch && matchStatus && matchDrawerStatus;
    });
  }, [purchaseRequests, reqSearch, reqStatus, drawerStatusFilter]);

  // 3. Filtered Maintenance Records List
  const filteredMaintenance = useMemo(() => {
    return maintenanceRecords.filter(item => {
      const matchSearch = !maintSearch.trim() ||
        item.asset.toLowerCase().includes(maintSearch.toLowerCase().trim()) ||
        item.serviceProvider.toLowerCase().includes(maintSearch.toLowerCase().trim());
      const matchType = !maintType || item.type === maintType;
      const matchDrawerStatus = !drawerStatusFilter || item.status === drawerStatusFilter;
      return matchSearch && matchType && matchDrawerStatus;
    });
  }, [maintenanceRecords, maintSearch, maintType, drawerStatusFilter]);

  // --- ACTIONS & HANDLERS ---

  // Handle Add Inventory
  const handleCreateInventory = async (e) => {
    e.preventDefault();
    if (!invForm.item.trim()) {
      toast.error('Please enter the asset/item name');
      return;
    }
    const newItem = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      item: invForm.item.trim(),
      category: invForm.category,
      quantity: Number(invForm.quantity) || 1,
      purchaseDate: invForm.purchaseDate,
      amount: Number(invForm.amount) || 0,
      vendor: invForm.vendor.trim() || 'Direct Purchase',
      status: invForm.status,
      serialNumber: invForm.serialNumber.trim() || `SN-${Math.floor(1000 + Math.random() * 9000)}`,
      location: invForm.location.trim() || 'Main Office'
    };

    setInventoryList(prev => [newItem, ...prev]);
    setIsAddInvModalOpen(false);
    toast.success('Inventory item added successfully!');

    // Async sync with API if possible
    try {
      await inventoryService.create({
        assets: newItem.item,
        quantity: newItem.quantity,
        category: newItem.category,
        amount: newItem.amount,
        vendor: newItem.vendor
      });
    } catch (err) {
      // Ignored if custom endpoint not yet implemented
    }

    setInvForm({
      item: '',
      category: 'Furniture',
      quantity: 1,
      purchaseDate: new Date().toISOString().split('T')[0],
      amount: '',
      vendor: '',
      status: 'Active',
      serialNumber: '',
      location: ''
    });
  };

  // Handle Add Purchase Request
  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!reqForm.item.trim() || !reqForm.requestedBy.trim()) {
      toast.error('Please fill in the item name and requester name');
      return;
    }
    const newReq = {
      id: `PR-${1000 + purchaseRequests.length + 1}`,
      item: reqForm.item.trim(),
      category: reqForm.category,
      quantity: Number(reqForm.quantity) || 1,
      estimatedAmount: Number(reqForm.estimatedAmount) || 0,
      requestedBy: reqForm.requestedBy.trim(),
      date: reqForm.date,
      status: 'Pending',
      reason: reqForm.reason.trim()
    };

    setPurchaseRequests(prev => [newReq, ...prev]);
    setIsAddReqModalOpen(false);
    toast.success('Purchase request submitted successfully!');

    setReqForm({
      item: '',
      category: 'Furniture',
      quantity: 1,
      estimatedAmount: '',
      requestedBy: '',
      date: new Date().toISOString().split('T')[0],
      reason: ''
    });
  };

  // Handle Add Maintenance Record
  const handleCreateMaintenance = (e) => {
    e.preventDefault();
    if (!maintForm.asset.trim() || !maintForm.serviceProvider.trim()) {
      toast.error('Please specify the asset and service provider');
      return;
    }
    const newRecord = {
      id: `MR-${2000 + maintenanceRecords.length + 1}`,
      date: maintForm.date,
      asset: maintForm.asset.trim(),
      type: maintForm.type,
      serviceProvider: maintForm.serviceProvider.trim(),
      cost: Number(maintForm.cost) || 0,
      status: maintForm.status,
      billUrl: maintForm.hasBill ? 'https://storage.example.com/bills/invoice.pdf' : null,
      notes: maintForm.notes.trim()
    };

    setMaintenanceRecords(prev => [newRecord, ...prev]);
    setIsAddMaintModalOpen(false);
    toast.success('Maintenance record logged successfully!');

    setMaintForm({
      asset: '',
      type: 'Service',
      serviceProvider: '',
      cost: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
      notes: '',
      hasBill: true
    });
  };

  // Handle Export CSV
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      // Create CSV from current filtered inventory
      const headers = ['Item', 'Category', 'Quantity', 'Purchase Date', 'Amount (INR)', 'Vendor', 'Status', 'Serial No', 'Location'];
      const rows = filteredInventory.map(item => [
        `"${item.item}"`,
        `"${item.category}"`,
        item.quantity,
        `"${formatDate(item.purchaseDate)}"`,
        item.amount,
        `"${item.vendor}"`,
        `"${item.status}"`,
        `"${item.serialNumber}"`,
        `"${item.location}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Inventory exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export inventory CSV.');
    } finally {
      setExporting(false);
    }
  };

  // Status Badge Component
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Active':
      case 'Completed':
      case 'Purchased':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
            {status}
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            Pending
          </span>
        );
      case 'Approved':
      case 'In Progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
            {status}
          </span>
        );
      case 'Damaged':
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200/60">
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Header with Standard Breadcrumbs */}
      <PageHeader
        title="Inventory"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'CRM' },
          { label: 'Inventory' }
        ]}
        showBack={false}
      />

      {/* Top 3 Navigation Tabs (Matching exact design) */}
      <div className="flex items-center gap-8 border-b border-gray-200 px-2">
        <button
          onClick={() => { setActiveTab('inventory'); setIsFilterDrawerOpen(false); }}
          className={`pb-3 font-semibold text-sm transition-all cursor-pointer relative ${
            activeTab === 'inventory'
              ? 'text-[#225091] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#225091]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Inventory
        </button>

        <button
          onClick={() => { setActiveTab('requests'); setIsFilterDrawerOpen(false); }}
          className={`pb-3 font-semibold text-sm transition-all cursor-pointer relative ${
            activeTab === 'requests'
              ? 'text-[#225091] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#225091]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Purchase Requests
        </button>

        <button
          onClick={() => { setActiveTab('maintenance'); setIsFilterDrawerOpen(false); }}
          className={`pb-3 font-semibold text-sm transition-all cursor-pointer relative ${
            activeTab === 'maintenance'
              ? 'text-[#225091] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#225091]'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Maintenance & Repair
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: INVENTORY MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          {/* Subheader & Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Inventory Management</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage office assets and existing inventory.</p>
            </div>
            <button
              onClick={() => setIsAddInvModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#1e3a8a] hover:bg-[#172554] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Plus size={15} />
              <span>Add Existing Inventory</span>
            </button>
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3 flex-1 flex-wrap">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#225091] transition-all font-medium"
                />
                {invSearch && (
                  <button onClick={() => setInvSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="min-w-[150px]">
                <select
                  value={invCategory}
                  onChange={(e) => setInvCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer shadow-2xs"
                >
                  <option value="">All Categories</option>
                  {CATEGORY_LIST.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Action Buttons: Filter & Export */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <SlidersHorizontal size={14} className="text-gray-500" />
                <span>Filter</span>
              </button>

              <button
                onClick={handleExportCSV}
                disabled={exporting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} className="text-gray-500" />}
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                <thead className="bg-[#F8FAFC] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200/80">
                  <tr>
                    <th className="py-3.5 px-5">ITEM</th>
                    <th className="py-3.5 px-5">CATEGORY</th>
                    <th className="py-3.5 px-5">QTY</th>
                    <th className="py-3.5 px-5">PURCHASE DATE</th>
                    <th className="py-3.5 px-5">AMOUNT</th>
                    <th className="py-3.5 px-5">VENDOR</th>
                    <th className="py-3.5 px-5">STATUS</th>
                    <th className="py-3.5 px-5 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-400">
                        <Boxes size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="font-semibold text-gray-700">No inventory records found</p>
                        <p className="text-[11px] mt-0.5">Click "+ Add Existing Inventory" to create your first asset.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-gray-900">{item.item}</td>
                        <td className="py-3.5 px-5 text-gray-600">{item.category}</td>
                        <td className="py-3.5 px-5 text-gray-800">{item.quantity}</td>
                        <td className="py-3.5 px-5 text-gray-600">{formatDate(item.purchaseDate)}</td>
                        <td className="py-3.5 px-5 font-bold text-gray-900">{formatCurrency(item.amount)}</td>
                        <td className="py-3.5 px-5 text-gray-600">{item.vendor}</td>
                        <td className="py-3.5 px-5">{renderStatusBadge(item.status)}</td>
                        <td className="py-3.5 px-5 text-center">
                          <button
                            onClick={() => { setSelectedInvItem(item); setIsViewInvModalOpen(true); }}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#225091] transition-colors cursor-pointer"
                            title="View Asset Details"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="px-5 py-3.5 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
              <div>
                Showing <strong className="text-gray-800">1</strong> to <strong className="text-gray-800">{filteredInventory.length}</strong> of <strong className="text-gray-800">{filteredInventory.length}</strong> results
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 bg-gray-50 text-xs font-semibold cursor-not-allowed"
                >
                  Previous
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-[#1e3a8a] text-white text-xs font-bold shadow-2xs">
                  1
                </button>
                <button
                  disabled
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 bg-gray-50 text-xs font-semibold cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PURCHASE REQUESTS */}
      {/* ========================================================= */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          {/* Subheader & Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Purchase Requests</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage employee requests for new office items.</p>
            </div>
            <button
              onClick={() => setIsAddReqModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#1e3a8a] hover:bg-[#172554] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Plus size={15} />
              <span>New Request</span>
            </button>
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3 flex-1 flex-wrap">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={reqSearch}
                  onChange={(e) => setReqSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#225091] transition-all font-medium"
                />
                {reqSearch && (
                  <button onClick={() => setReqSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="min-w-[140px]">
                <select
                  value={reqStatus}
                  onChange={(e) => setReqStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer shadow-2xs"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Purchased">Purchased</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Right Action Button: Filter */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <SlidersHorizontal size={14} className="text-gray-500" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                <thead className="bg-[#F8FAFC] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200/80">
                  <tr>
                    <th className="py-3.5 px-5">REQUEST ID</th>
                    <th className="py-3.5 px-5">ITEM</th>
                    <th className="py-3.5 px-5">CATEGORY</th>
                    <th className="py-3.5 px-5">QTY</th>
                    <th className="py-3.5 px-5">ESTIMATED AMOUNT</th>
                    <th className="py-3.5 px-5">REQUESTED BY</th>
                    <th className="py-3.5 px-5">DATE</th>
                    <th className="py-3.5 px-5">STATUS</th>
                    <th className="py-3.5 px-5 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-gray-400">
                        <ShoppingCart size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="font-semibold text-gray-700">No purchase requests found</p>
                        <p className="text-[11px] mt-0.5">Click "+ New Request" to create a purchase requisition.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-[#1e3a8a]">{req.id}</td>
                        <td className="py-3.5 px-5 font-bold text-gray-900">{req.item}</td>
                        <td className="py-3.5 px-5 text-gray-600">{req.category}</td>
                        <td className="py-3.5 px-5 text-gray-800">{req.quantity}</td>
                        <td className="py-3.5 px-5 font-bold text-gray-900">{formatCurrency(req.estimatedAmount)}</td>
                        <td className="py-3.5 px-5 text-gray-700">{req.requestedBy}</td>
                        <td className="py-3.5 px-5 text-gray-600">{formatDate(req.date)}</td>
                        <td className="py-3.5 px-5">{renderStatusBadge(req.status)}</td>
                        <td className="py-3.5 px-5 text-center">
                          <button
                            onClick={() => { setSelectedReqItem(req); setIsViewReqModalOpen(true); }}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#225091] transition-colors cursor-pointer"
                            title="View Request Details"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="px-5 py-3.5 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
              <div>
                Showing <strong className="text-gray-800">1</strong> to <strong className="text-gray-800">{filteredRequests.length}</strong> of <strong className="text-gray-800">{filteredRequests.length}</strong> results
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 bg-gray-50 text-xs font-semibold cursor-not-allowed"
                >
                  Previous
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-[#1e3a8a] text-white text-xs font-bold shadow-2xs">
                  1
                </button>
                <button
                  disabled
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 bg-gray-50 text-xs font-semibold cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: MAINTENANCE & REPAIR */}
      {/* ========================================================= */}
      {activeTab === 'maintenance' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          {/* Subheader & Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Maintenance & Repair</h2>
              <p className="text-xs text-gray-500 mt-0.5">Track service and repair history for office assets.</p>
            </div>
            <button
              onClick={() => setIsAddMaintModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#1e3a8a] hover:bg-[#172554] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Plus size={15} />
              <span>Add Maintenance / Repair</span>
            </button>
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3 flex-1 flex-wrap">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                <input
                  type="text"
                  placeholder="Search maintenance records..."
                  value={maintSearch}
                  onChange={(e) => setMaintSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50/70 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#225091] transition-all font-medium"
                />
                {maintSearch && (
                  <button onClick={() => setMaintSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Type Dropdown */}
              <div className="min-w-[140px]">
                <select
                  value={maintType}
                  onChange={(e) => setMaintType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#225091] cursor-pointer shadow-2xs"
                >
                  <option value="">All Types</option>
                  <option value="Service">Service</option>
                  <option value="Repair">Repair</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            {/* Right Action Button: Filter */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                <SlidersHorizontal size={14} className="text-gray-500" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                <thead className="bg-[#F8FAFC] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200/80">
                  <tr>
                    <th className="py-3.5 px-5">DATE</th>
                    <th className="py-3.5 px-5">ASSET / ITEM</th>
                    <th className="py-3.5 px-5">TYPE</th>
                    <th className="py-3.5 px-5">SERVICE PROVIDER</th>
                    <th className="py-3.5 px-5">COST</th>
                    <th className="py-3.5 px-5">STATUS</th>
                    <th className="py-3.5 px-5">BILL</th>
                    <th className="py-3.5 px-5 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredMaintenance.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-400">
                        <Wrench size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="font-semibold text-gray-700">No maintenance records found</p>
                        <p className="text-[11px] mt-0.5">Click "+ Add Maintenance / Repair" to log service history.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredMaintenance.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 text-gray-600">{formatDate(m.date)}</td>
                        <td className="py-3.5 px-5 font-bold text-gray-900">{m.asset}</td>
                        <td className="py-3.5 px-5 text-gray-600">{m.type}</td>
                        <td className="py-3.5 px-5 text-gray-700">{m.serviceProvider}</td>
                        <td className="py-3.5 px-5 font-bold text-gray-900">{formatCurrency(m.cost)}</td>
                        <td className="py-3.5 px-5">{renderStatusBadge(m.status)}</td>
                        <td className="py-3.5 px-5">
                          {m.billUrl ? (
                            <a
                              href={m.billUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#225091] hover:underline font-semibold text-xs"
                            >
                              <Paperclip size={13} className="text-[#225091]" />
                              <span>View Bill</span>
                            </a>
                          ) : (
                            <span className="text-gray-400 italic text-xs">No bill</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <button
                            onClick={() => { setSelectedMaintItem(m); setIsViewMaintModalOpen(true); }}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#225091] transition-colors cursor-pointer"
                            title="View Maintenance Details"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="px-5 py-3.5 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
              <div>
                Showing <strong className="text-gray-800">1</strong> to <strong className="text-gray-800">{filteredMaintenance.length}</strong> of <strong className="text-gray-800">{filteredMaintenance.length}</strong> results
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 bg-gray-50 text-xs font-semibold cursor-not-allowed"
                >
                  Previous
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-[#1e3a8a] text-white text-xs font-bold shadow-2xs">
                  1
                </button>
                <button
                  disabled
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 bg-gray-50 text-xs font-semibold cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD EXISTING INVENTORY */}
      {/* ========================================================= */}
      {isAddInvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center font-bold">
                  <Boxes size={18} />
                </div>
                <h3 className="text-base font-bold text-gray-900">Add Existing Inventory Asset</h3>
              </div>
              <button onClick={() => setIsAddInvModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInventory} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Item Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Office Chair, Laser Printer"
                    value={invForm.item}
                    onChange={e => setInvForm({ ...invForm, item: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={invForm.category}
                    onChange={e => setInvForm({ ...invForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  >
                    {CATEGORY_LIST.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={invForm.quantity}
                    onChange={e => setInvForm({ ...invForm, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    required
                    value={invForm.purchaseDate}
                    onChange={e => setInvForm({ ...invForm, purchaseDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 23500"
                    value={invForm.amount}
                    onChange={e => setInvForm({ ...invForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Vendor / Supplier</label>
                  <input
                    type="text"
                    placeholder="e.g. ABC Furniture"
                    value={invForm.vendor}
                    onChange={e => setInvForm({ ...invForm, vendor: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={invForm.status}
                    onChange={e => setInvForm({ ...invForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Under Repair">Under Repair</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Location / Branch</label>
                  <input
                    type="text"
                    placeholder="e.g. Head Office - 2nd Floor"
                    value={invForm.location}
                    onChange={e => setInvForm({ ...invForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddInvModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1e3a8a] hover:bg-[#172554] text-white rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: VIEW INVENTORY DETAILS */}
      {/* ========================================================= */}
      {isViewInvModalOpen && selectedInvItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <div>
                <h3 className="text-base font-bold text-gray-900">{selectedInvItem.item}</h3>
                <p className="text-[11px] text-gray-500">{selectedInvItem.category}</p>
              </div>
              <button onClick={() => setIsViewInvModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[11px]">Quantity</span>
                  <span className="font-bold text-gray-800 text-sm">{selectedInvItem.quantity} Units</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Total Amount</span>
                  <span className="font-bold text-gray-900 text-sm">{formatCurrency(selectedInvItem.amount)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Purchase Date</span>
                  <span className="font-semibold text-gray-800">{formatDate(selectedInvItem.purchaseDate)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Status</span>
                  <div className="mt-0.5">{renderStatusBadge(selectedInvItem.status)}</div>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Vendor</span>
                  <span className="font-semibold text-gray-800">{selectedInvItem.vendor}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Serial / Tag</span>
                  <span className="font-mono font-semibold text-gray-800">{selectedInvItem.serialNumber || '—'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 block text-[11px]">Location</span>
                  <span className="font-medium text-gray-800">{selectedInvItem.location || 'Main Office'}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  onClick={() => {
                    setInventoryList(prev => prev.filter(i => i.id !== selectedInvItem.id));
                    setIsViewInvModalOpen(false);
                    toast.success('Asset deleted successfully');
                  }}
                  className="text-rose-600 hover:text-rose-700 font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={14} /> Delete Asset
                </button>
                <button
                  onClick={() => setIsViewInvModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: NEW PURCHASE REQUEST */}
      {/* ========================================================= */}
      {isAddReqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center font-bold">
                  <ShoppingCart size={18} />
                </div>
                <h3 className="text-base font-bold text-gray-900">New Purchase Request</h3>
              </div>
              <button onClick={() => setIsAddReqModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Item Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Office Chair, MacBook Pro"
                    value={reqForm.item}
                    onChange={e => setReqForm({ ...reqForm, item: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={reqForm.category}
                    onChange={e => setReqForm({ ...reqForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  >
                    {CATEGORY_LIST.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={reqForm.quantity}
                    onChange={e => setReqForm({ ...reqForm, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Estimated Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 25000"
                    value={reqForm.estimatedAmount}
                    onChange={e => setReqForm({ ...reqForm, estimatedAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Requested By <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amit Kumar"
                    value={reqForm.requestedBy}
                    onChange={e => setReqForm({ ...reqForm, requestedBy: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Reason / Justification</label>
                  <textarea
                    rows={2}
                    placeholder="Specify why this asset is required..."
                    value={reqForm.reason}
                    onChange={e => setReqForm({ ...reqForm, reason: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddReqModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1e3a8a] hover:bg-[#172554] text-white rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: VIEW / APPROVE PURCHASE REQUEST */}
      {/* ========================================================= */}
      {isViewReqModalOpen && selectedReqItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#1e3a8a]">{selectedReqItem.id}</span>
                <h3 className="text-base font-bold text-gray-900">{selectedReqItem.item}</h3>
              </div>
              <button onClick={() => setIsViewReqModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[11px]">Requested By</span>
                  <span className="font-bold text-gray-800">{selectedReqItem.requestedBy}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Date</span>
                  <span className="font-semibold text-gray-800">{formatDate(selectedReqItem.date)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Quantity</span>
                  <span className="font-bold text-gray-800">{selectedReqItem.quantity} Units</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Estimated Amount</span>
                  <span className="font-bold text-gray-900">{formatCurrency(selectedReqItem.estimatedAmount)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 block text-[11px]">Current Status</span>
                  <div className="mt-1">{renderStatusBadge(selectedReqItem.status)}</div>
                </div>
                {selectedReqItem.reason && (
                  <div className="col-span-2">
                    <span className="text-gray-400 block text-[11px]">Reason</span>
                    <p className="text-gray-700 mt-0.5 leading-relaxed">{selectedReqItem.reason}</p>
                  </div>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                {selectedReqItem.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => {
                        setPurchaseRequests(prev => prev.map(r => r.id === selectedReqItem.id ? { ...r, status: 'Approved' } : r));
                        setIsViewReqModalOpen(false);
                        toast.success('Request approved');
                      }}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer text-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setPurchaseRequests(prev => prev.map(r => r.id === selectedReqItem.id ? { ...r, status: 'Rejected' } : r));
                        setIsViewReqModalOpen(false);
                        toast.info('Request rejected');
                      }}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold cursor-pointer text-xs"
                    >
                      Reject
                    </button>
                  </>
                )}
                {selectedReqItem.status === 'Approved' && (
                  <button
                    onClick={() => {
                      setPurchaseRequests(prev => prev.map(r => r.id === selectedReqItem.id ? { ...r, status: 'Purchased' } : r));
                      setIsViewReqModalOpen(false);
                      toast.success('Request marked as purchased');
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer text-xs"
                  >
                    Mark as Purchased
                  </button>
                )}
                <button
                  onClick={() => setIsViewReqModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: ADD MAINTENANCE / REPAIR */}
      {/* ========================================================= */}
      {isAddMaintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center font-bold">
                  <Wrench size={18} />
                </div>
                <h3 className="text-base font-bold text-gray-900">Add Maintenance / Repair</h3>
              </div>
              <button onClick={() => setIsAddMaintModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMaintenance} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Asset / Item <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Air Conditioner 1.5T, Laser Printer"
                    value={maintForm.asset}
                    onChange={e => setMaintForm({ ...maintForm, asset: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Type</label>
                  <select
                    value={maintForm.type}
                    onChange={e => setMaintForm({ ...maintForm, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  >
                    <option value="Service">Service</option>
                    <option value="Repair">Repair</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Service Provider <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ABC Services, HP Care"
                    value={maintForm.serviceProvider}
                    onChange={e => setMaintForm({ ...maintForm, serviceProvider: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1200"
                    value={maintForm.cost}
                    onChange={e => setMaintForm({ ...maintForm, cost: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={maintForm.date}
                    onChange={e => setMaintForm({ ...maintForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={maintForm.status}
                    onChange={e => setMaintForm({ ...maintForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-semibold"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Notes / Description</label>
                  <textarea
                    rows={2}
                    placeholder="Details about the repair or service done..."
                    value={maintForm.notes}
                    onChange={e => setMaintForm({ ...maintForm, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#225091] font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddMaintModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1e3a8a] hover:bg-[#172554] text-white rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: VIEW MAINTENANCE RECORD */}
      {/* ========================================================= */}
      {isViewMaintModalOpen && selectedMaintItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#1e3a8a]">{selectedMaintItem.id}</span>
                <h3 className="text-base font-bold text-gray-900">{selectedMaintItem.asset}</h3>
              </div>
              <button onClick={() => setIsViewMaintModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block text-[11px]">Service Type</span>
                  <span className="font-bold text-gray-800">{selectedMaintItem.type}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Date</span>
                  <span className="font-semibold text-gray-800">{formatDate(selectedMaintItem.date)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Provider</span>
                  <span className="font-bold text-gray-800">{selectedMaintItem.serviceProvider}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Cost</span>
                  <span className="font-bold text-gray-900">{formatCurrency(selectedMaintItem.cost)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Status</span>
                  <div className="mt-0.5">{renderStatusBadge(selectedMaintItem.status)}</div>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Invoice / Bill</span>
                  <div className="mt-0.5">
                    {selectedMaintItem.billUrl ? (
                      <a
                        href={selectedMaintItem.billUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#225091] font-bold hover:underline"
                      >
                        <Paperclip size={13} /> View Invoice
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">No bill</span>
                    )}
                  </div>
                </div>
                {selectedMaintItem.notes && (
                  <div className="col-span-2">
                    <span className="text-gray-400 block text-[11px]">Notes</span>
                    <p className="text-gray-700 mt-0.5 leading-relaxed">{selectedMaintItem.notes}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsViewMaintModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FILTER DRAWER FOR ALL TABS */}
      {/* ========================================================= */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-sm h-full p-6 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#1e3a8a]" />
                <h3 className="font-bold text-gray-900 text-sm">Filter Records</h3>
              </div>
              <button onClick={() => setIsFilterDrawerOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="py-6 space-y-4 flex-1 overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Status</label>
                <select
                  value={drawerStatusFilter}
                  onChange={e => setDrawerStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Purchased">Purchased</option>
                  <option value="Completed">Completed</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {activeTab === 'inventory' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">Amount Range (₹)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={drawerMinAmount}
                      onChange={e => setDrawerMinAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={drawerMaxAmount}
                      onChange={e => setDrawerMaxAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setDrawerStatusFilter('');
                  setDrawerMinAmount('');
                  setDrawerMaxAmount('');
                  setIsFilterDrawerOpen(false);
                }}
                className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-bold text-xs"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="px-5 py-2 bg-[#1e3a8a] text-white rounded-xl font-bold text-xs shadow-sm hover:bg-[#172554]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
