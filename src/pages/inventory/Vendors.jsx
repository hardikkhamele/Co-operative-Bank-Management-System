import React from 'react';
import { Plus, Search, Mail, Phone, ExternalLink } from 'lucide-react';
import useQueryParam from '../../hooks/useQueryParam';

export default function Vendors() {
  // Use shared hook for search term persistence
  const [searchTerm, setSearchTerm] = useQueryParam('search', '');

  // ----- Static vendor data (could be fetched in real app) -----
  const vendors = [
    {
      code: 'VND-001',
      company: 'TechSolutions India Pvt Ltd',
      contact: 'Ravi Varma',
      phone: '+91 9876543210',
      email: 'ravi@techsol.in',
      gst: '27AADCB2230M1Z2',
      address: 'Plot 45, MIDC, Andheri East, Mumbai',
      status: 'Active',
    },
    {
      code: 'VND-002',
      company: 'Office Mart Distributors',
      contact: 'Sunita Desai',
      phone: '+91 9123456789',
      email: 'contact@officemart.com',
      gst: '27AABCO2230N1Z5',
      address: '12 MG Road, Camp, Pune',
      status: 'Active',
    },
    {
      code: 'VND-003',
      company: 'Global Traders',
      contact: 'Vikram Singh',
      phone: '+91 9988776655',
      email: 'info@globaltraders.co.in',
      gst: '27AAACG2230N1Z8',
      address: 'Shop 4, Market Yard, Surat',
      status: 'Inactive',
    },
  ];

  // Filter vendors based on search term (case‑insensitive, matches several fields)
  const filteredVendors = vendors.filter((v) => {
    const term = searchTerm.toLowerCase();
    return (
      v.code.toLowerCase().includes(term) ||
      v.company.toLowerCase().includes(term) ||
      v.contact.toLowerCase().includes(term) ||
      v.gst.toLowerCase().includes(term) ||
      v.address.toLowerCase().includes(term)
    );
  });

  return (
    <>
      <div className="page-header">
        <h2>Vendor & Supplier Directory</h2>
        <button className="btn-primary">
          <Plus size={14} />
          Register New Vendor
        </button>
      </div>



      <div className="table-container">
        <div className="table-header">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="search-bar" style={{ width: '300px', backgroundColor: '#fff' }}>
              <Search size={14} color="#666" />
              <input
                type="text"
                placeholder="Search Company, GST, or Contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* Filter chips */}
        {searchTerm && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-sm">
              Search: {searchTerm}
              <button
                className="ml-2 text-gray-500 hover:text-gray-700"
                onClick={() => setSearchTerm('')}
              >
                ×
              </button>
            </span>
          </div>
        )}

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Vendor Code</th>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Contact Info</th>
                <th>GST Registration</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((v) => (
                <tr key={v.code}>
                  <td style={{ fontWeight: 600 }}>{v.code}</td>
                  <td>{v.company}</td>
                  <td>{v.contact}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={10} /> {v.phone}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-light)' }}>
                        <Mail size={10} /> {v.email}
                      </span>
                    </div>
                  </td>
                  <td>{v.gst}</td>
                  <td style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {v.address}
                  </td>
                  <td>
                    <span className={`status ${v.status === 'Active' ? 'active' : 'inactive'}`}>{v.status}</span>
                  </td>
                  <td>
                    <div className="action-links">
                      <a href="#">Edit</a>
                      <a href="#"><ExternalLink size={12} /> Profile</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
