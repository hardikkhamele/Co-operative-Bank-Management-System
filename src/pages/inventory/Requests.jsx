import React from 'react';
import { Plus, Search, CheckCircle, XCircle } from 'lucide-react';

export default function Requests() {
  return (
    <>
      <div className="page-header">
        <h2>Material Requisitions</h2>
        <button className="btn-primary">
          <Plus size={14} />
          Raise Requisition
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="search-bar" style={{ width: '250px', backgroundColor: '#fff' }}>
              <Search size={14} color="#666" />
              <input type="text" placeholder="Search Request ID or Emp..." />
            </div>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Req ID</th>
                <th>Employee Name</th>
                <th>Branch</th>
                <th>Total Items</th>
                <th>Remarks</th>
                <th>Requested On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>REQ-5012</td>
                <td>Rahul Sharma</td>
                <td>Main Branch</td>
                <td>2</td>
                <td>Need new laptop for developer</td>
                <td>02 Sep 2026</td>
                <td><span className="status pending">Pending</span></td>
                <td>
                  <div className="action-links">
                    <a>Review</a>
                    <a style={{ color: '#166534' }}><CheckCircle size={14}/> Approve</a>
                    <a className="danger"><XCircle size={14}/> Reject</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>REQ-5011</td>
                <td>Sneha Gupta</td>
                <td>North Branch</td>
                <td>5</td>
                <td>Monthly stationery restock</td>
                <td>01 Sep 2026</td>
                <td><span className="status approved">Approved</span></td>
                <td>
                  <div className="action-links">
                    <a>Fulfill Order</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>REQ-5010</td>
                <td>Amit Kumar</td>
                <td>South Branch</td>
                <td>1</td>
                <td>Replacement mouse</td>
                <td>28 Aug 2026</td>
                <td><span className="status fulfilled">Fulfilled</span></td>
                <td>
                  <div className="action-links">
                    <a>View Details</a>
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
