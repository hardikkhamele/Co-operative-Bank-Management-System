import React, { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';

export default function Inventory() {
  const [activeTab, setActiveTab] = useState('items'); // items, categories, stocks, central

  return (
    <>
      <div className="page-header">
        <h2>Inventory Master Data</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary">
            <Plus size={14} />
            {activeTab === 'items' && 'Add SKU'}
            {activeTab === 'categories' && 'Add Category'}
            {activeTab === 'stocks' && 'Add Stock Entry'}
            {activeTab === 'central' && 'Add Warehouse'}
          </button>
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>
          Master Catalog (SKUs)
        </div>
        <div className={`tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
          Category & Subcategory
        </div>
        <div className={`tab ${activeTab === 'stocks' ? 'active' : ''}`} onClick={() => setActiveTab('stocks')}>
          Stock Balances
        </div>
        <div className={`tab ${activeTab === 'central' ? 'active' : ''}`} onClick={() => setActiveTab('central')}>
          Central Inventory Config
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="search-bar" style={{ width: '250px', backgroundColor: '#fff' }}>
              <Search size={14} color="#666" />
              <input type="text" placeholder={`Search ${activeTab}...`} />
            </div>
            <button className="btn-secondary" style={{ padding: '4px 8px' }}><Filter size={14} /></button>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Showing 1-15 of 1240</span>
        </div>
        
        <div className="table-wrapper">
          {activeTab === 'items' && (
            <table>
              <thead>
                <tr>
                  <th>SKU Code</th>
                  <th>Master Name</th>
                  <th>Category</th>
                  <th>Class Type</th>
                  <th>UOM</th>
                  <th>Serialized?</th>
                  <th>Brand/Model</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ITM-001</td>
                  <td>Lenovo ThinkPad T14</td>
                  <td>Laptops</td>
                  <td>Electronics</td>
                  <td>Pcs</td>
                  <td>Yes</td>
                  <td>Lenovo / T14 Gen2</td>
                  <td><span className="status active">Active</span></td>
                  <td>
                    <div className="action-links"><a>Edit</a> <a>Stocks</a></div>
                  </td>
                </tr>
                <tr>
                  <td>ITM-002</td>
                  <td>A4 Printer Paper 500S</td>
                  <td>Stationery</td>
                  <td>Consumable</td>
                  <td>Box</td>
                  <td>No</td>
                  <td>JK / Copier</td>
                  <td><span className="status active">Active</span></td>
                  <td>
                    <div className="action-links"><a>Edit</a> <a>Stocks</a></div>
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {activeTab === 'stocks' && (
            <table>
              <thead>
                <tr>
                  <th>SKU Code</th>
                  <th>Item Name</th>
                  <th>Location ID</th>
                  <th>Location Type</th>
                  <th>Physical Qty</th>
                  <th>Reserved Qty</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ITM-001</td>
                  <td>Lenovo ThinkPad T14</td>
                  <td>Main Warehouse</td>
                  <td>CentralInventory</td>
                  <td>45</td>
                  <td>5</td>
                  <td style={{ fontWeight: 600 }}>40</td>
                  <td>
                    <div className="action-links"><a>Adjust</a> <a>Transfer</a></div>
                  </td>
                </tr>
                <tr>
                  <td>ITM-002</td>
                  <td>A4 Printer Paper 500S</td>
                  <td>North Branch</td>
                  <td>Branch</td>
                  <td>120</td>
                  <td>0</td>
                  <td style={{ fontWeight: 600 }}>120</td>
                  <td>
                    <div className="action-links"><a>Adjust</a> <a>Transfer</a></div>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
          
          {/* Add basic tables for other tabs so they aren't empty */}
          {activeTab === 'categories' && (
             <div style={{ padding: '20px', color: 'var(--text-light)' }}>Category list structure here...</div>
          )}
          {activeTab === 'central' && (
             <div style={{ padding: '20px', color: 'var(--text-light)' }}>Warehouse configs structure here...</div>
          )}
        </div>
      </div>
    </>
  );
}
