import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import inventoryService from '../../api/inventoryService';

export default function InventoryModals({ isOpen, onClose, modalType, initialData, authUser }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]); // In a real app, fetch these
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isManagerDropdownOpen, setIsManagerDropdownOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [isCatalogCategoryDropdownOpen, setIsCatalogCategoryDropdownOpen] = useState(false);
  const [isCatalogSubcategoryDropdownOpen, setIsCatalogSubcategoryDropdownOpen] = useState(false);
  const [catalogItems, setCatalogItems] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
      
      // Fetch categories and subcategories to populate the Parent Category dropdown
      if (modalType === 'subcategories' || modalType === 'catalog' || modalType === 'requests' || modalType === 'transfers') {
        const fetchCategoriesData = async () => {
          try {
            const [catRes, subRes] = await Promise.all([
              inventoryService.getCategories(),
              ['catalog', 'requests', 'transfers'].includes(modalType) ? inventoryService.getSubcategories() : Promise.resolve([])
            ]);
            
            // Ultra-robust extraction of array data from API response
            const extractData = (res) => {
              if (!res) return [];
              if (Array.isArray(res)) return res;
              if (Array.isArray(res.data)) return res.data;
              if (Array.isArray(res.data?.data)) return res.data.data;
              if (Array.isArray(res.docs)) return res.docs;
              if (Array.isArray(res.data?.docs)) return res.data.docs;
              // Fallbacks
              for (const key of Object.keys(res)) {
                if (Array.isArray(res[key])) return res[key];
              }
              if (res.data && typeof res.data === 'object') {
                for (const key of Object.keys(res.data)) {
                  if (Array.isArray(res.data[key])) return res.data[key];
                }
              }
              return [];
            };
            
            const catData = extractData(catRes);
            setCategories(catData);
            
            if (['catalog', 'requests', 'transfers'].includes(modalType)) {
              setSubcategories(extractData(subRes));
            }
            
            if (catData.length === 0) {
              toast.warn("No Categories found! Please create a Category first.");
            }
          } catch (err) {
            console.error("Failed to fetch categories:", err);
            toast.error("Failed to load parent categories from the server.");
          }
        };
        fetchCategoriesData();
      }

    // Fetch employees to populate Manager ID dropdown for Central Warehouse
      if (modalType === 'central' || modalType === 'requests' || modalType === 'transfers') {
        const fetchCentralData = async () => {
          try {
            const { employeeService } = await import('../../api/employeeService');
            const { branchService } = await import('../../api/branchService');
            
            const [empRes, branchRes, itemsRes] = await Promise.all([
              employeeService.list(),
              branchService.list(),
              ['requests', 'transfers'].includes(modalType) ? inventoryService.getItems({ limit: 100 }) : Promise.resolve([])
            ]);
            
            const extractArray = (res) => {
              if (Array.isArray(res)) return res;
              if (res?.data && Array.isArray(res.data)) return res.data;
              if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
              if (res?.docs && Array.isArray(res.docs)) return res.docs;
              if (res?.data?.docs && Array.isArray(res.data.docs)) return res.data.docs;
              // Fallbacks for specific nested keys
              if (res && typeof res === 'object') {
                const arr = Object.values(res).find(val => Array.isArray(val));
                if (arr) return arr;
                if (res.data && typeof res.data === 'object') {
                   const arr2 = Object.values(res.data).find(val => Array.isArray(val));
                   if (arr2) return arr2;
                }
              }
              return [];
            };
            
            setEmployees(extractArray(empRes));
            setBranches(extractArray(branchRes));
            if (['requests', 'transfers'].includes(modalType)) {
              setCatalogItems(extractArray(itemsRes));
            }
          } catch (err) {
            console.error("Failed to fetch modal dependency data:", err);
          }
        };
        fetchCentralData();
      }
    }
  }, [isOpen, modalType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleMultiSelect = (name, valueStr) => {
    const arr = valueStr.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [name]: arr }));
  };

  const handleAddItemRow = () => {
    const items = formData.items || [{ catalogItemId: '', quantity: 1 }];
    setFormData(prev => ({ ...prev, items: [...items, { catalogItemId: '', quantity: 1 }] }));
  };

  const handleRemoveItemRow = (index) => {
    const items = [...(formData.items || [])];
    items.splice(index, 1);
    setFormData(prev => ({ ...prev, items }));
  };

  const handleItemChange = (index, field, value) => {
    const items = [...(formData.items || [])];
    if (!items[index]) items[index] = { catalogItemId: '', quantity: 1 };
    items[index][field] = value;
    setFormData(prev => ({ ...prev, items }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const dataToSubmit = { ...formData };
      
      // Auto-generate 'code' field for entities that require it but no longer have an input field
      if (!dataToSubmit.code && ['vendors', 'categories', 'subcategories', 'central', 'catalog'].includes(modalType)) {
        const prefix = modalType === 'vendors' ? 'VND' :
                       modalType === 'categories' ? 'CAT' :
                       modalType === 'subcategories' ? 'SUB' :
                       modalType === 'central' ? 'WH' :
                       modalType === 'catalog' ? 'SKU' : 'CODE';
        dataToSubmit.code = `${prefix}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      }

      const isUpdate = !!(initialData && (initialData._id || initialData.id));
      const entityId = isUpdate ? (initialData._id || initialData.id) : null;

      if (modalType === 'vendors') {
        if (dataToSubmit.gstNumber) {
          const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
          if (!gstRegex.test(dataToSubmit.gstNumber.toUpperCase())) {
            toast.error("Invalid GST Number format. Example: 22AAAAA0000A1Z5");
            setLoading(false);
            return;
          }
          dataToSubmit.gstNumber = dataToSubmit.gstNumber.toUpperCase();
        }
        
        // Prevent code update on PUT
        if (isUpdate) delete dataToSubmit.vendorCode;

        isUpdate ? await inventoryService.updateVendor(entityId, dataToSubmit) : await inventoryService.createVendor(dataToSubmit);
        toast.success(isUpdate ? "Vendor updated successfully!" : "Vendor created successfully!");
      } else if (modalType === 'categories') {
        isUpdate ? await inventoryService.updateCategory(entityId, dataToSubmit) : await inventoryService.createCategory(dataToSubmit);
        toast.success(isUpdate ? "Category updated successfully!" : "Category created successfully!");
      } else if (modalType === 'subcategories') {
        isUpdate ? await inventoryService.updateSubcategory(entityId, dataToSubmit) : await inventoryService.createSubcategory(dataToSubmit);
        toast.success(isUpdate ? "Subcategory updated successfully!" : "Subcategory created successfully!");
      } else if (modalType === 'central') {
        isUpdate ? await inventoryService.updateCentralWarehouse(entityId, dataToSubmit) : await inventoryService.createCentralWarehouse(dataToSubmit);
        toast.success(isUpdate ? "Central Warehouse updated successfully!" : "Central Warehouse created successfully!");
      } else if (modalType === 'catalog') {
        const payload = { ...dataToSubmit };
        // Map unit to unitOfMeasure if needed, or strictly enforce unitOfMeasure
        if (payload.unitOfMeasure === undefined && payload.unit !== undefined) {
          payload.unitOfMeasure = payload.unit;
          delete payload.unit;
        }
        
        // Prevent code update if strictly forbidden, though API handles this.
        if (isUpdate) {
           delete payload.code;
        }

        isUpdate ? await inventoryService.updateItem(entityId, payload) : await inventoryService.createItem(payload);
        toast.success(isUpdate ? "Catalog Item updated successfully!" : "Catalog Item created successfully!");
      } else if (modalType === 'adjust_stock') {
        if (formData.locationType === 'CentralInventory' && formData.adjustmentType === 'ADD') {
          await inventoryService.receiveStock({
            centralInventoryId: formData.locationId,
            itemMasterId: formData.itemMasterId,
            quantity: Number(formData.quantity),
            vendorId: formData.vendorId, 
            assetTags: formData.assetTags || [],
            serialNumbers: formData.serialNumbers || [],
            remarks: formData.remarks
          });
          toast.success("Stock received successfully into Central Warehouse!");
        } else {
          // Use the stock adjustment API for branches or REMOVE operations
          await inventoryService.createStockAdjustment({
            branchId: formData.locationType === 'Branch' ? formData.locationId : undefined,
            centralInventoryId: formData.locationType === 'CentralInventory' ? formData.locationId : undefined,
            itemMasterId: formData.itemMasterId,
            adjustmentType: formData.adjustmentType,
            quantity: Number(formData.quantity),
            reason: formData.reason || "OTHER",
            remarks: formData.remarks
          });
          toast.success("Stock adjustment request created successfully!");
        }
      } else if (modalType === 'requests') {
        const items = formData.items || [];
        const validItems = items.filter(i => i.itemMasterId && Number(i.quantity) > 0);
        
        if (validItems.length === 0) {
          toast.error('Please add at least one valid item and quantity.');
          setLoading(false);
          return;
        }

        if (!dataToSubmit.employeeId) {
          toast.error('Employee selection is required.');
          setLoading(false);
          return;
        }
        
        const requestPayload = {
          branchId: authUser?.branchId || formData.branchId,
          employeeId: dataToSubmit.employeeId,
          remarks: dataToSubmit.remarks || '',
          items: validItems.map(i => ({
            itemMasterId: i.itemMasterId,
            quantity: Number(i.quantity)
          }))
        };
        
        if (!requestPayload.branchId) {
          toast.error("Branch ID is required for Requisition.");
          setLoading(false);
          return;
        }
        await inventoryService.createRequisition(requestPayload);
        toast.success("Branch Requisition submitted successfully!");
      } else if (modalType === 'transfers') {
        const items = formData.items || [];
        const validItems = items.filter(i => i.itemMasterId && Number(i.quantity) > 0);
        
        if (validItems.length === 0) {
          toast.error('Please add at least one valid item and quantity.');
          setLoading(false);
          return;
        }

        if (!formData.fromLocationId || !formData.toLocationId) {
          toast.error('Source and Destination locations are required.');
          setLoading(false);
          return;
        }

        const transferPayload = {
          fromLocationType: formData.fromLocationType || 'CentralInventory',
          fromLocationId: formData.fromLocationId,
          toLocationType: formData.toLocationType || 'Branch',
          toLocationId: formData.toLocationId,
          remarks: formData.remarks || '',
          items: validItems.map(i => ({
            itemMasterId: i.itemMasterId,
            quantity: Number(i.quantity)
          }))
        };
        await inventoryService.createTransfer(transferPayload);
        toast.success("Transfer Request submitted successfully!");
      } else if (modalType === 'assets') {
        if (!formData.itemMasterId || !formData.assetTag || !formData.currentLocationId) {
          toast.error('Item Master, Asset Tag, and Current Location are required.');
          setLoading(false);
          return;
        }
        const assetPayload = {
          itemMasterId: formData.itemMasterId,
          assetTag: formData.assetTag,
          serialNumber: formData.serialNumber || '',
          currentLocationType: formData.currentLocationType || 'CentralInventory',
          currentLocationId: formData.currentLocationId,
          condition: formData.condition || 'new',
          status: formData.status || 'active',
          purchaseDate: formData.purchaseDate || undefined,
          purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : undefined
        };
        
        // Mocked or actual call depending on if createAsset exists
        if (inventoryService.createAsset) {
           await inventoryService.createAsset(assetPayload);
        } else {
           // Fallback to direct axios call if method is missing in service
           const { default: axiosInstance } = await import('../../api/axiosConfig');
           await axiosInstance.post('/v1/society/inventory/assets', assetPayload);
        }
        toast.success("Asset registered successfully!");
      } else if (modalType === 'issue_asset') {
        if (!initialData?._id && !initialData?.id) {
          toast.error("Asset ID is missing.");
          setLoading(false);
          return;
        }
        if (!formData.assignedTo) {
          toast.error("Employee selection is required to assign asset.");
          setLoading(false);
          return;
        }
        await inventoryService.assignAsset({
          assetId: initialData._id || initialData.id,
          assignedTo: formData.assignedTo
        });
        toast.success("Asset assigned successfully!");
      } else {
        toast.info("Action simulated. Connect backend for this specific workflow.");
      }
      onClose(true);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderVendorForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Vendor Name <span className="text-red-500">*</span></label>
          <input type="text" name="vendorName" value={formData.vendorName || formData.name || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" placeholder="e.g. TechSupplies" required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Person</label>
          <input type="text" name="contactPerson" value={formData.contactPerson || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
          <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
          <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">GST Number</label>
          <input type="text" name="gstNumber" value={formData.gstNumber || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm uppercase focus:border-[#225091] focus:outline-none" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
          <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" />
        </div>
        <div className="flex items-center space-x-2 mt-2 col-span-2">
          <input type="checkbox" name="isActive" checked={formData.isActive !== false} onChange={(e) => setFormData(prev => ({...prev, isActive: e.target.checked}))} id="isActiveVendor" className="rounded text-[#225091] focus:ring-[#225091]" />
          <label htmlFor="isActiveVendor" className="text-sm font-semibold text-gray-700">Vendor is Active</label>
        </div>
      </div>
    </div>
  );

  const renderCategoryForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Category Name</label>
          <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" placeholder="e.g. IT Equipment" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
          <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" rows="3"></textarea>
        </div>
      </div>
    </div>
  );

  const renderSubcategoryForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 relative">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Parent Category</label>
          
          {/* Custom Dropdown to fix native OS scaling issues on zoomed browsers */}
          <div 
            className={`w-full border rounded-md px-3 py-2 text-sm bg-white cursor-pointer flex justify-between items-center transition-colors ${isCategoryDropdownOpen ? 'border-[#225091] ring-1 ring-[#225091]/20' : 'border-gray-300 hover:border-gray-400'}`}
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
          >
            <span className={formData.categoryId ? 'text-gray-900 font-medium' : 'text-gray-500'}>
              {formData.categoryId 
                ? `${categories.find(c => c._id === formData.categoryId)?.name || ''} (${categories.find(c => c._id === formData.categoryId)?.code || ''})` 
                : 'Select a Category'}
            </span>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {isCategoryDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-50 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1">
              <div 
                className="px-3 py-2.5 text-sm hover:bg-gray-50 cursor-pointer text-gray-500 border-b border-gray-50"
                onClick={() => {
                  setFormData(prev => ({ ...prev, categoryId: '' }));
                  setIsCategoryDropdownOpen(false);
                }}
              >
                Select a Category
              </div>
              {categories.length === 0 ? (
                <div className="px-3 py-4 text-sm text-center text-gray-500">No categories found</div>
              ) : (
                categories.map((cat) => (
                  <div 
                    key={cat._id}
                    className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${formData.categoryId === cat._id ? 'bg-[#225091]/5 text-[#225091] font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, categoryId: cat._id }));
                      setIsCategoryDropdownOpen(false);
                    }}
                  >
                    {cat.name} <span className="text-xs text-gray-400 ml-1">({cat.code})</span>
                  </div>
                ))
              )}
            </div>
          )}
          {/* Backdrop for closing dropdown when clicking outside */}
          {isCategoryDropdownOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setIsCategoryDropdownOpen(false)}></div>
          )}
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Subcategory Name</label>
          <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" placeholder="e.g. Laptops" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
          <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" rows="2"></textarea>
        </div>
      </div>
    </div>
  );

  const renderCentralForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Warehouse Name</label>
          <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" />
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Branch</label>
            
            <div 
              className={`w-full border rounded-md px-3 py-2 text-sm bg-white cursor-pointer flex justify-between items-center transition-colors ${isBranchDropdownOpen ? 'border-[#225091] ring-1 ring-[#225091]/20' : 'border-gray-300 hover:border-gray-400'}`}
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            >
              <span className={formData.branchId ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                {formData.branchId 
                  ? (() => {
                      const branch = branches.find(b => (b.id || b._id) === formData.branchId);
                      return branch ? branch.name : 'Select a Branch';
                    })()
                  : 'Select a Branch'}
              </span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${isBranchDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {isBranchDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-50 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1">
                <div 
                  className="px-3 py-2.5 text-sm hover:bg-gray-50 cursor-pointer text-gray-500 border-b border-gray-50"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, branchId: '' }));
                    setIsBranchDropdownOpen(false);
                  }}
                >
                  Select a Branch
                </div>
                {branches.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-center text-gray-500">No branches found</div>
                ) : (
                  branches.map((branch) => {
                    const bId = branch.id || branch._id;
                    return (
                    <div 
                      key={bId}
                      className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${formData.branchId === bId ? 'bg-[#225091]/5 text-[#225091] font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => {
                        // Find a manager that belongs to this branch
                        const manager = employees.find(emp => {
                          const empBranch = emp.branchId || emp.branch?._id || emp.branch?.id || emp.branch;
                          const finalBranchId = typeof empBranch === 'object' ? (empBranch.id || empBranch._id) : empBranch;
                          return finalBranchId === bId;
                        });
                        
                        setFormData(prev => ({ 
                          ...prev, 
                          branchId: bId,
                          ...(manager ? { managerId: manager.id || manager._id } : {})
                        }));
                        setIsBranchDropdownOpen(false);
                      }}
                    >
                      {branch.name}
                    </div>
                  )})
                )}
              </div>
            )}
            
            {isBranchDropdownOpen && (
              <div className="fixed inset-0 z-40" onClick={() => setIsBranchDropdownOpen(false)}></div>
            )}
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Manager</label>
            
            <div 
              className={`w-full border rounded-md px-3 py-2 text-sm bg-white cursor-pointer flex justify-between items-center transition-colors ${isManagerDropdownOpen ? 'border-[#225091] ring-1 ring-[#225091]/20' : 'border-gray-300 hover:border-gray-400'}`}
              onClick={() => setIsManagerDropdownOpen(!isManagerDropdownOpen)}
            >
              <span className={formData.managerId ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                {formData.managerId 
                  ? (() => {
                      const emp = employees.find(e => (e.id || e._id) === formData.managerId);
                      return emp ? `${emp.fullName || emp.name} (${emp.employeeId || emp.code || 'N/A'})` : 'Select a Manager';
                    })()
                  : 'Select a Manager'}
              </span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${isManagerDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {isManagerDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-50 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1">
                <div 
                  className="px-3 py-2.5 text-sm hover:bg-gray-50 cursor-pointer text-gray-500 border-b border-gray-50"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, managerId: '' }));
                    setIsManagerDropdownOpen(false);
                  }}
                >
                  Select a Manager
                </div>
                {employees.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-center text-gray-500">No managers found</div>
                ) : (
                  employees.map((emp) => {
                    const eId = emp.id || emp._id;
                    return (
                    <div 
                      key={eId}
                      className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${formData.managerId === eId ? 'bg-[#225091]/5 text-[#225091] font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => {
                        // Extract branchId handling nested object or string
                        const empBranch = emp.branchId || emp.branch?._id || emp.branch?.id || emp.branch;
                        const finalBranchId = typeof empBranch === 'object' ? (empBranch.id || empBranch._id) : empBranch;
                        
                        setFormData(prev => ({ 
                          ...prev, 
                          managerId: eId,
                          ...(finalBranchId ? { branchId: finalBranchId } : {})
                        }));
                        setIsManagerDropdownOpen(false);
                      }}
                    >
                      {emp.fullName || emp.name} <span className="text-xs text-gray-400 ml-1">({emp.employeeId || emp.code || 'N/A'})</span>
                    </div>
                  )})
                )}
              </div>
            )}
            
            {isManagerDropdownOpen && (
              <div className="fixed inset-0 z-40" onClick={() => setIsManagerDropdownOpen(false)}></div>
            )}
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
          <textarea name="address" value={formData.address || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" rows="2"></textarea>
        </div>
      </div>
    </div>
  );

  const renderCatalogForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
          <div 
            className={`w-full border rounded-md px-3 py-2 text-sm bg-white cursor-pointer flex justify-between items-center transition-colors ${isCatalogCategoryDropdownOpen ? 'border-[#225091] ring-1 ring-[#225091]/20' : 'border-gray-300 hover:border-gray-400'}`}
            onClick={() => setIsCatalogCategoryDropdownOpen(!isCatalogCategoryDropdownOpen)}
          >
            <span className={formData.categoryId ? 'text-gray-900 font-medium' : 'text-gray-500'}>
              {formData.categoryId 
                ? `${categories.find(c => (c.id || c._id) === formData.categoryId)?.name || ''}` 
                : 'Select Category'}
            </span>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${isCatalogCategoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {isCatalogCategoryDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-50 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1">
              <div 
                className="px-3 py-2.5 text-sm hover:bg-gray-50 cursor-pointer text-gray-500 border-b border-gray-50"
                onClick={() => {
                  setFormData(prev => ({ ...prev, categoryId: '', subcategoryId: '' })); // Reset subcategory when category changes
                  setIsCatalogCategoryDropdownOpen(false);
                }}
              >
                Select Category
              </div>
              {categories.length === 0 ? (
                <div className="px-3 py-4 text-sm text-center text-gray-500">No categories found</div>
              ) : (
                categories.map((cat) => {
                  const catId = cat.id || cat._id;
                  return (
                  <div 
                    key={catId}
                    className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${formData.categoryId === catId ? 'bg-[#225091]/5 text-[#225091] font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, categoryId: catId, subcategoryId: '' })); // Reset subcategory on change
                      setIsCatalogCategoryDropdownOpen(false);
                    }}
                  >
                    {cat.name}
                  </div>
                )})
              )}
            </div>
          )}
          {isCatalogCategoryDropdownOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setIsCatalogCategoryDropdownOpen(false)}></div>
          )}
        </div>
        
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Subcategory (Optional)</label>
          <div 
            className={`w-full border rounded-md px-3 py-2 text-sm bg-white cursor-pointer flex justify-between items-center transition-colors ${isCatalogSubcategoryDropdownOpen ? 'border-[#225091] ring-1 ring-[#225091]/20' : 'border-gray-300 hover:border-gray-400'}`}
            onClick={() => setIsCatalogSubcategoryDropdownOpen(!isCatalogSubcategoryDropdownOpen)}
          >
            <span className={formData.subcategoryId ? 'text-gray-900 font-medium' : 'text-gray-500'}>
              {formData.subcategoryId 
                ? `${subcategories.find(s => (s.id || s._id) === formData.subcategoryId)?.name || ''}` 
                : 'Select Subcategory'}
            </span>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${isCatalogSubcategoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {isCatalogSubcategoryDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-50 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1">
              <div 
                className="px-3 py-2.5 text-sm hover:bg-gray-50 cursor-pointer text-gray-500 border-b border-gray-50"
                onClick={() => {
                  setFormData(prev => ({ ...prev, subcategoryId: '' }));
                  setIsCatalogSubcategoryDropdownOpen(false);
                }}
              >
                Select Subcategory
              </div>
              {(() => {
                const filteredSubcategories = subcategories.filter(s => {
                  if (!formData.categoryId) return true;
                  // Try to match formData.categoryId against any likely parent category reference
                  const parentRefs = [s.category, s.categoryId, s.parentCategory, s.category_id];
                  for (const ref of parentRefs) {
                    if (!ref) continue;
                    if (typeof ref === 'string' && ref === formData.categoryId) return true;
                    if (typeof ref === 'object' && (ref.id === formData.categoryId || ref._id === formData.categoryId)) return true;
                  }
                  return false;
                });
                
                if (filteredSubcategories.length === 0) {
                  return <div className="px-3 py-4 text-sm text-center text-gray-500">No subcategories found</div>;
                }
                
                return filteredSubcategories.map((sub) => {
                  const subId = sub.id || sub._id;
                  return (
                  <div 
                    key={subId}
                    className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${formData.subcategoryId === subId ? 'bg-[#225091]/5 text-[#225091] font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => {
                      // Attempt to safely deduce parent category id if not already set
                      let deducedCatId = formData.categoryId;
                      if (!deducedCatId) {
                        const refs = [sub.category, sub.categoryId, sub.parentCategory, sub.category_id];
                        for (const ref of refs) {
                          if (!ref) continue;
                          if (typeof ref === 'string') { deducedCatId = ref; break; }
                          if (typeof ref === 'object' && (ref.id || ref._id)) { deducedCatId = ref.id || ref._id; break; }
                        }
                      }
                      
                      setFormData(prev => ({ 
                        ...prev, 
                        subcategoryId: subId,
                        ...(deducedCatId && { categoryId: deducedCatId })
                      }));
                      setIsCatalogSubcategoryDropdownOpen(false);
                    }}
                  >
                    {sub.name}
                  </div>
                )});
              })()}
            </div>
          )}
          {isCatalogSubcategoryDropdownOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setIsCatalogSubcategoryDropdownOpen(false)}></div>
          )}
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Master SKU Name <span className="text-red-500">*</span></label>
          <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" placeholder="e.g. A4 Printer Paper" required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Unit of Measure <span className="text-red-500">*</span></label>
          <input type="text" name="unitOfMeasure" value={formData.unitOfMeasure || formData.unit || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" placeholder="e.g. Ream, Box, Kg" required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Minimum Stock Level</label>
          <input type="number" name="minimumStockLevel" value={formData.minimumStockLevel || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" placeholder="e.g. 50" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Reorder Point</label>
          <input type="number" name="reorderPoint" value={formData.reorderPoint || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" placeholder="e.g. 70" />
        </div>
        <div className="flex items-center space-x-2 mt-6">
          <input type="checkbox" name="isConsumable" checked={formData.isConsumable || false} onChange={handleChange} id="isConsumable" className="rounded text-[#225091] focus:ring-[#225091]" />
          <label htmlFor="isConsumable" className="text-sm font-semibold text-gray-700">Is Consumable?</label>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
        <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" rows="2"></textarea>
      </div>
    </div>
  );

  const renderAdjustStockForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Location Type</label>
          <select name="locationType" onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none">
            <option value="">Select Type</option>
            <option value="CentralInventory">Central Inventory</option>
            <option value="Branch">Branch</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Location ID (Warehouse/Branch ID)</label>
          <input type="text" name="locationId" value={formData.locationId || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" placeholder="Enter Inventory/Branch ID" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Item Master ID</label>
          <input type="text" name="itemMasterId" value={formData.itemMasterId || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" placeholder="Enter SKU ID" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Vendor ID (For Stock-In)</label>
          <input type="text" name="vendorId" value={formData.vendorId || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" placeholder="Enter Vendor ID" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Adjustment Type</label>
          <select name="adjustmentType" onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none">
            <option value="">Select Action</option>
            <option value="ADD">Stock In (Receive / ADD)</option>
            <option value="REMOVE">Stock Out (REMOVE)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
          <input type="number" name="quantity" value={formData.quantity || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Asset Tags (Comma Separated)</label>
          <input type="text" onChange={(e) => handleMultiSelect('assetTags', e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" placeholder="TAG-1, TAG-2" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Serial Numbers (Comma Separated)</label>
          <input type="text" onChange={(e) => handleMultiSelect('serialNumbers', e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" placeholder="SN-1, SN-2" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Remarks</label>
          <textarea name="remarks" value={formData.remarks || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" rows="2"></textarea>
        </div>
      </div>
    </div>
  );

  const renderRequestForm = () => {
    const items = formData.items && formData.items.length > 0 ? formData.items : [{ categoryId: '', subcategoryId: '', itemMasterId: '', quantity: 1 }];
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {!authUser?.branchId && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Branch ID <span className="text-red-500">*</span></label>
              <input type="text" name="branchId" value={formData.branchId || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" placeholder="Enter Branch ID" />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Employee <span className="text-red-500">*</span></label>
            <select name="employeeId" value={formData.employeeId || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none">
              <option value="">-- Select Employee --</option>
              {employees.map(emp => {
                const baseName = emp.name || (emp.userId && emp.userId.name) || (emp.firstName ? `${emp.firstName} ${emp.lastName || ''}` : '') || 'Unknown Employee';
                const empName = `${baseName} (${emp.employeeId || 'N/A'})`;
                return (
                  <option key={emp._id || emp.id} value={emp._id || emp.id}>
                    {empName}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Remarks / Reason</label>
            <input type="text" name="remarks" value={formData.remarks || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" placeholder="e.g. Required for new staff onboarding" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-semibold text-gray-700">Requested Items</label>
            <button type="button" onClick={handleAddItemRow} className="text-xs text-[#225091] font-semibold hover:underline flex items-center gap-1">
              + Add Another Item
            </button>
          </div>
          
          <div className="space-y-3">
            {items.map((item, index) => {
              // Filter subcategories by selected category
              const filteredSubcategories = subcategories.filter(sub => {
                if (!item.categoryId) return true;
                const refs = [sub.category, sub.categoryId, sub.parentCategory, sub.category_id];
                return refs.some(ref => {
                  if (!ref) return false;
                  if (typeof ref === 'string') return ref === item.categoryId;
                  if (typeof ref === 'object') return (ref.id || ref._id) === item.categoryId;
                  return false;
                });
              });

              // Filter items by category and subcategory
              const filteredItems = catalogItems.filter(catItem => {
                let match = true;
                if (item.categoryId) {
                  const catRefs = [catItem.category, catItem.categoryId, catItem.parentCategory, catItem.category_id];
                  const hasCatMatch = catRefs.some(ref => {
                    if (!ref) return false;
                    if (typeof ref === 'string') return ref === item.categoryId;
                    if (typeof ref === 'object') return (ref.id || ref._id) === item.categoryId;
                    return false;
                  });
                  if (!hasCatMatch) match = false;
                }
                if (item.subcategoryId) {
                  const subRefs = [catItem.subcategory, catItem.subcategoryId, catItem.sub_category_id];
                  const hasSubMatch = subRefs.some(ref => {
                    if (!ref) return false;
                    if (typeof ref === 'string') return ref === item.subcategoryId;
                    if (typeof ref === 'object') return (ref.id || ref._id) === item.subcategoryId;
                    return false;
                  });
                  if (!hasSubMatch) match = false;
                }
                return match;
              });

              return (
                <div key={index} className="border border-gray-100 p-3 rounded-lg bg-gray-50 flex gap-2 items-start relative">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <select 
                      value={item.categoryId || ''} 
                      onChange={(e) => {
                        handleItemChange(index, 'categoryId', e.target.value);
                        handleItemChange(index, 'subcategoryId', ''); // reset child
                        handleItemChange(index, 'itemMasterId', ''); // reset child
                      }} 
                      className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none"
                    >
                      <option value="">Select Category...</option>
                      {categories.map(c => (
                        <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                      ))}
                    </select>

                    <select 
                      value={item.subcategoryId || ''} 
                      onChange={(e) => {
                        handleItemChange(index, 'subcategoryId', e.target.value);
                        handleItemChange(index, 'itemMasterId', ''); // reset child
                      }} 
                      className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none"
                    >
                      <option value="">Select Subcategory...</option>
                      {filteredSubcategories.map(sub => (
                        <option key={sub._id || sub.id} value={sub._id || sub.id}>{sub.name}</option>
                      ))}
                    </select>

                    <select 
                      value={item.itemMasterId || ''} 
                      onChange={(e) => handleItemChange(index, 'itemMasterId', e.target.value)} 
                      className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none"
                    >
                      <option value="">Select Item (SKU)...</option>
                      {filteredItems.map(c => (
                        <option key={c._id || c.id} value={c._id || c.id}>
                          {c.name} ({c.code || c.skuCode})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-20">
                    <input 
                      type="number" 
                      min="1" 
                      value={item.quantity || ''} 
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} 
                      className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none text-center" 
                      placeholder="Qty" 
                    />
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItemRow(index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-white border rounded-md shadow-sm">
                      <X size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderAssetForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Item Master (SKU) <span className="text-red-500">*</span></label>
          <select name="itemMasterId" value={formData.itemMasterId || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none">
            <option value="">Select Item (SKU)...</option>
            {catalogItems.map(c => (
              <option key={c._id || c.id} value={c._id || c.id}>{c.name} ({c.code || c.skuCode})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Asset Tag <span className="text-red-500">*</span></label>
          <input type="text" name="assetTag" value={formData.assetTag || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none uppercase" placeholder="e.g. AST-001" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Serial Number</label>
          <input type="text" name="serialNumber" value={formData.serialNumber || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" placeholder="e.g. SN-987654321" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Condition</label>
          <select name="condition" value={formData.condition || 'new'} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none">
            <option value="new">New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="damaged">Damaged</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Current Location Type <span className="text-red-500">*</span></label>
          <select name="currentLocationType" value={formData.currentLocationType || 'CentralInventory'} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none">
            <option value="CentralInventory">Central Warehouse</option>
            <option value="Branch">Branch</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Select Location <span className="text-red-500">*</span></label>
          <select name="currentLocationId" value={formData.currentLocationId || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none">
            <option value="">Select Location...</option>
            {(formData.currentLocationType === 'Branch' ? branches : [{_id: 'central123', name: 'Main Central Warehouse'}]).map(loc => (
              <option key={loc._id || loc.id} value={loc._id || loc.id}>{loc.name || loc.branchName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase Date</label>
          <input type="date" name="purchaseDate" value={formData.purchaseDate || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Purchase Price</label>
          <input type="number" name="purchasePrice" value={formData.purchasePrice || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" placeholder="0.00" />
        </div>
      </div>
    </div>
  );

  const renderIssueAssetForm = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg mb-4">
        <p className="text-sm font-semibold text-[#225091]">Assigning Asset: {initialData?.assetTag}</p>
        <p className="text-xs text-gray-600">Item: {typeof initialData?.itemMasterId === 'object' ? initialData?.itemMasterId?.name : initialData?.itemName}</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Select Employee <span className="text-red-500">*</span></label>
          <select name="assignedTo" value={formData.assignedTo || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none">
            <option value="">Select Employee...</option>
            {employees.map(emp => (
              <option key={emp._id || emp.id} value={emp._id || emp.id}>{emp.name || emp.fullName}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderTransferForm = () => {
    const items = formData.items && formData.items.length > 0 ? formData.items : [{ itemMasterId: '', quantity: 1 }];
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Source Type <span className="text-red-500">*</span></label>
            <select name="fromLocationType" value={formData.fromLocationType || 'CentralInventory'} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none">
              <option value="CentralInventory">Central Warehouse</option>
              <option value="Branch">Branch</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Source Location <span className="text-red-500">*</span></label>
            <select name="fromLocationId" value={formData.fromLocationId || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none">
              <option value="">Select Source...</option>
              {(formData.fromLocationType === 'Branch' ? branches : [{_id: 'central123', name: 'Main Central Warehouse'}]).map(loc => (
                <option key={loc._id || loc.id} value={loc._id || loc.id}>{loc.name || loc.branchName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Destination Type <span className="text-red-500">*</span></label>
            <select name="toLocationType" value={formData.toLocationType || 'Branch'} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none">
              <option value="CentralInventory">Central Warehouse</option>
              <option value="Branch">Branch</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Destination Location <span className="text-red-500">*</span></label>
            <select name="toLocationId" value={formData.toLocationId || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none">
              <option value="">Select Destination...</option>
              {(formData.toLocationType === 'Branch' ? branches : [{_id: 'central123', name: 'Main Central Warehouse'}]).map(loc => (
                <option key={loc._id || loc.id} value={loc._id || loc.id}>{loc.name || loc.branchName}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Remarks</label>
            <input type="text" name="remarks" value={formData.remarks || ''} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none" placeholder="e.g. Relocating extra stock" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-semibold text-gray-700">Items to Transfer</label>
            <button type="button" onClick={handleAddItemRow} className="text-xs text-[#225091] font-semibold hover:underline flex items-center gap-1">
              + Add Item
            </button>
          </div>
          
          <div className="space-y-2 border border-gray-100 p-3 rounded-lg bg-gray-50">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <select 
                    value={item.itemMasterId || ''} 
                    onChange={(e) => handleItemChange(index, 'itemMasterId', e.target.value)} 
                    className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none"
                  >
                    <option value="">Select Item (SKU)...</option>
                    {catalogItems.map(c => (
                      <option key={c._id || c.id} value={c._id || c.id}>{c.name} ({c.code || c.skuCode})</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <input 
                    type="number" 
                    min="1" 
                    value={item.quantity || ''} 
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} 
                    className="w-full border rounded-md px-3 py-2 text-sm focus:border-[#225091] focus:outline-none text-center" 
                    placeholder="Qty" 
                  />
                </div>
                {items.length > 1 && (
                  <button type="button" onClick={() => handleRemoveItemRow(index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-white border rounded-md shadow-sm">
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const getFormTitle = () => {
    switch (modalType) {
      case 'vendors': return 'Add New Vendor';
      case 'categories': return 'Add New Category';
      case 'subcategories': return 'Add New Subcategory';
      case 'central': return 'Add Central Warehouse';
      case 'catalog': return 'Create Catalog Item (SKU)';
      case 'adjust_stock': return 'Adjust Stock Level (Stock-In)';
      case 'requests': return 'Submit Employee/Branch Requisition';
      case 'assets': return 'Register New Asset';
      case 'issue_asset': return 'Issue Asset to Employee';
      case 'transfers': return 'Submit Stock Transfer';
      default: return 'Add Record';
    }
  };

  const getFormBody = () => {
    switch (modalType) {
      case 'vendors': return renderVendorForm();
      case 'categories': return renderCategoryForm();
      case 'subcategories': return renderSubcategoryForm();
      case 'central': return renderCentralForm();
      case 'catalog': return renderCatalogForm();
      case 'adjust_stock': return renderAdjustStockForm();
      case 'requests': return renderRequestForm();
      case 'assets': return renderAssetForm();
      case 'issue_asset': return renderIssueAssetForm();
      case 'transfers': return renderTransferForm();
      default: return <p className="text-sm text-gray-500">Form implementation pending.</p>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-[#225091]">{getFormTitle()}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">
          {getFormBody()}
        </div>
        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-white transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-[#225091] rounded-lg text-sm font-semibold text-white hover:bg-[#193e73] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
            {loading ? 'Submitting...' : 'Save & Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
