import React from 'react';
import { Plus, Filter, Download } from 'lucide-react';

export default function Dashboard() {
  return (
    <>
      <div className="page-header">
        <h2>Inventory Control Center</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary">
            <Download size={14} style={{ marginRight: '6px' }} />
            Export Report
          </button>
          <button className="btn-primary">
            <Plus size={14} />
            Quick Assignment
          </button>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total SKUs in Catalog</div>
          <div className="stat-value">1,248</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Active Field Assets</div>
          <div className="stat-value">843</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Pending Approvals</div>
          <div className="stat-value" style={{ color: '#854d0e' }}>24</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Critical Low Stock</div>
          <div className="stat-value" style={{ color: '#991b1b' }}>8</div>
        </div>
      </div>
      
      <div className="table-container">
        <div className="table-header">
          <h3>Recent Asset Assignments Ledger</h3>
          <div className="table-controls">
            <input type="date" title="Filter by date" />
            <select>
              <option>All Branches</option>
              <option>Main Branch</option>
              <option>North Branch</option>
            </select>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Asset Tag</th>
                <th>Employee Name</th>
                <th>Branch</th>
                <th>Condition</th>
                <th>Issued Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>TXN-901</td>
                <td>AST-2049</td>
                <td>Rahul Sharma</td>
                <td>Main Branch</td>
                <td>New</td>
                <td>02 Sep 2026</td>
                <td>-</td>
                <td><span className="status active">Active</span></td>
                <td>
                  <div className="action-links">
                    <a>View</a>
                    <a className="danger">Revoke</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td>TXN-900</td>
                <td>AST-1932</td>
                <td>Priya Patel</td>
                <td>North Branch</td>
                <td>Good</td>
                <td>01 Sep 2026</td>
                <td>-</td>
                <td><span className="status active">Active</span></td>
                <td>
                  <div className="action-links">
                    <a>View</a>
                    <a className="danger">Revoke</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td>TXN-899</td>
                <td>AST-1850</td>
                <td>Amit Kumar</td>
                <td>South Branch</td>
                <td>Fair</td>
                <td>28 Aug 2026</td>
                <td>-</td>
                <td><span className="status pending">Return Pending</span></td>
                <td>
                  <div className="action-links">
                    <a>View</a>
                    <a>Mark Received</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td>TXN-895</td>
                <td>AST-1721</td>
                <td>Sneha Gupta</td>
                <td>Main Branch</td>
                <td>Damaged</td>
                <td>15 Aug 2026</td>
                <td>30 Aug 2026</td>
                <td><span className="status inactive">Returned</span></td>
                <td>
                  <div className="action-links">
                    <a>View</a>
                  </div>
                </td>
              </tr>
              {/* Additional dense rows for layout preview */}
              <tr>
                <td>TXN-894</td>
                <td>AST-1700</td>
                <td>Kiran Rao</td>
                <td>East Branch</td>
                <td>Good</td>
                <td>10 Aug 2026</td>
                <td>-</td>
                <td><span className="status active">Active</span></td>
                <td>
                  <div className="action-links">
                    <a>View</a>
                    <a className="danger">Revoke</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td>TXN-893</td>
                <td>AST-1688</td>
                <td>Mohit Singh</td>
                <td>Central Warehouse</td>
                <td>New</td>
                <td>05 Aug 2026</td>
                <td>-</td>
                <td><span className="status active">Active</span></td>
                <td>
                  <div className="action-links">
                    <a>View</a>
                    <a className="danger">Revoke</a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
