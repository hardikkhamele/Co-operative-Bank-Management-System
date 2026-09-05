import React from 'react';
import { Plus, Search, Filter } from 'lucide-react';

export default function Transfers() {
  return (
    <>
      <div className="page-header">
        <h2>Inter-location Transfers</h2>
        <button className="btn-primary">
          <Plus size={14} />
          Create Transfer Order
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="search-bar" style={{ width: '250px', backgroundColor: '#fff' }}>
              <Search size={14} color="#666" />
              <input type="text" placeholder="Search Transfer ID..." />
            </div>
            <select className="btn-secondary" style={{ padding: '4px 8px', outline: 'none' }}>
              <option>All Statuses</option>
              <option>Pending</option>
              <option>Dispatched</option>
              <option>Received</option>
            </select>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Transfer ID</th>
                <th>From Location</th>
                <th>To Location</th>
                <th>Requested By</th>
                <th>Item Count</th>
                <th>Created At</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>TRF-1001</td>
                <td>Central Warehouse</td>
                <td>North Branch</td>
                <td>Amit Kumar</td>
                <td>3 Items</td>
                <td>01 Sep 2026 10:30 AM</td>
                <td><span className="status pending">Pending Approval</span></td>
                <td>
                  <div className="action-links">
                    <a>Review</a>
                    <a className="danger">Reject</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>TRF-1002</td>
                <td>South Branch</td>
                <td>Central Warehouse</td>
                <td>Priya Patel</td>
                <td>1 Item</td>
                <td>28 Aug 2026 02:15 PM</td>
                <td><span className="status active">Received</span></td>
                <td>
                  <div className="action-links">
                    <a>View Slip</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>TRF-1003</td>
                <td>Central Warehouse</td>
                <td>East Branch</td>
                <td>Ravi Rao</td>
                <td>5 Items</td>
                <td>20 Aug 2026 11:00 AM</td>
                <td><span className="status approved">Dispatched</span></td>
                <td>
                  <div className="action-links">
                    <a>Track</a>
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
