const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboard/InventoryModals.jsx', 'utf8');

content = content.replace(
  'export default function InventoryModals({ isOpen, onClose, modalType }) {',
  'export default function InventoryModals({ isOpen, onClose, modalType, initialData }) {'
);

content = content.replace(
  '      setFormData({});',
  '      setFormData(initialData || {});'
);

content = content.replace(/<input([^>]*?)name="([a-zA-Z0-9_]+)"([^>]*?)>/g, (match, p1, p2, p3) => {
  if (match.includes('value={') || match.includes('type="checkbox"') || match.includes('type="file"')) return match;
  return `<input${p1}name="${p2}" value={formData.${p2} || ''}${p3}>`;
});

content = content.replace(/<textarea([^>]*?)name="([a-zA-Z0-9_]+)"([^>]*?)><\/textarea>/g, (match, p1, p2, p3) => {
  if (match.includes('value={')) return match;
  return `<textarea${p1}name="${p2}" value={formData.${p2} || ''}${p3}></textarea>`;
});

const oldSubmitBlock = `      if (modalType === 'vendors') {`;
const newSubmitBlock = `      const isUpdate = !!(initialData && (initialData._id || initialData.id));
      const entityId = isUpdate ? (initialData._id || initialData.id) : null;

      if (modalType === 'vendors') {`;

content = content.replace(oldSubmitBlock, newSubmitBlock);

content = content.replace('await inventoryService.createVendor(dataToSubmit);', 'isUpdate ? await inventoryService.updateVendor(entityId, dataToSubmit) : await inventoryService.createVendor(dataToSubmit);');
content = content.replace('toast.success("Vendor created successfully!");', 'toast.success(isUpdate ? "Vendor updated successfully!" : "Vendor created successfully!");');

content = content.replace('await inventoryService.createCategory(dataToSubmit);', 'isUpdate ? await inventoryService.updateCategory(entityId, dataToSubmit) : await inventoryService.createCategory(dataToSubmit);');
content = content.replace('toast.success("Category created successfully!");', 'toast.success(isUpdate ? "Category updated successfully!" : "Category created successfully!");');

content = content.replace('await inventoryService.createSubcategory(dataToSubmit);', 'isUpdate ? await inventoryService.updateSubcategory(entityId, dataToSubmit) : await inventoryService.createSubcategory(dataToSubmit);');
content = content.replace('toast.success("Subcategory created successfully!");', 'toast.success(isUpdate ? "Subcategory updated successfully!" : "Subcategory created successfully!");');

content = content.replace('await inventoryService.createCentralWarehouse(dataToSubmit);', 'isUpdate ? await inventoryService.updateCentralWarehouse(entityId, dataToSubmit) : await inventoryService.createCentralWarehouse(dataToSubmit);');
content = content.replace('toast.success("Central Warehouse created successfully!");', 'toast.success(isUpdate ? "Central Warehouse updated successfully!" : "Central Warehouse created successfully!");');

content = content.replace('await inventoryService.createItem(dataToSubmit);', 'isUpdate ? await inventoryService.updateItem(entityId, dataToSubmit) : await inventoryService.createItem(dataToSubmit);');
content = content.replace('toast.success("Catalog Item created successfully!");', 'toast.success(isUpdate ? "Catalog Item updated successfully!" : "Catalog Item created successfully!");');

fs.writeFileSync('src/pages/dashboard/InventoryModals.jsx', content);
console.log('Update complete.');
