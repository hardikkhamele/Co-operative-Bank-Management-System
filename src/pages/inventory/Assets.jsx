import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';

export default function Assets() {
  const [activeTab, setActiveTab] = useState('assets');

  return (
    <>
      <div className="page-header">
        <h2>Serialized Assets Management</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary">
            <Plus size={14} />
            {activeTab === 'assets' ? 'Register Asset' : 'New Assignment'}
          </button>
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveTab('assets')}>
          Asset Registry (Devices)
        </div>
        <div className={`tab ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>
          Assignment History Log
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="search-bar" style={{ width: '250px', backgroundColor: '#fff' }}>
              <Search size={14} color="#666" />
              <input type="text" placeholder="Search by Tag or SN..." />
            </div>
            <select className="btn-secondary" style={{ padding: '4px 8px', outline: 'none' }}>
              <option>All Locations</option>
              <option>Branches Only</option>
              <option>Central Only</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          {activeTab === 'assets' && (
            <table>
              <thead>
                <tr>
                  <th>Asset Tag (Barcode)</th>
                  <th>SKU Master</th>
                  <th>Serial Number</th>
                  <th>Curr. Loc Type</th>
                  <th>Curr. Location/User</th>
                  <th>Condition</th>
                  <th>Purchased On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>AST-2049</td>
                  <td>Lenovo ThinkPad T14</td>
                  <td>PF-123456</td>
                  <td>User</td>
                  <td>Rahul Sharma</td>
                  <td>New</td>
                  <td>15 Jan 2026</td>
                  <td><span className="status active">Active</span></td>
                  <td>
                    <div className="action-links"><a>Details</a> <a>Assign</a></div>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>AST-2050</td>
                  <td>Dell Ultrasharp Monitor</td>
                  <td>CN-987654</td>
                  <td>CentralInventory</td>
                  <td>Main Warehouse</td>
                  <td>Good</td>
                  <td>10 Feb 2026</td>
                  <td><span className="status active">Active</span></td>
                  <td>
                    <div className="action-links"><a>Details</a> <a>Assign</a></div>
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {activeTab === 'assignments' && (
            <table>
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Asset Tag</th>
                  <th>Assigned To</th>
                  <th>Branch</th>
                  <th>Assigned By</th>
                  <th>Assigned On</th>
                  <th>Returned On</th>
                  <th>Condition Note</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ASN-9902</td>
                  <td>AST-2049</td>
                  <td>Rahul Sharma</td>
                  <td>Main Branch</td>
                  <td>Admin User</td>
                  <td>02 Sep 2026</td>
                  <td>-</td>
                  <td>Fresh box opened</td>
                  <td><span className="status active">In Use</span></td>
                  <td>
                    <div className="action-links"><a>Mark Return</a></div>
                  </td>
                </tr>
                <tr>
                  <td>ASN-9811</td>
                  <td>AST-1721</td>
                  <td>Sneha Gupta</td>
                  <td>Main Branch</td>
                  <td>Admin User</td>
                  <td>15 Aug 2026</td>
                  <td>30 Aug 2026</td>
                  <td>Screen scratched</td>
                  <td><span className="status inactive">Returned</span></td>
                  <td>
                    <div className="action-links"><a>View</a></div>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
