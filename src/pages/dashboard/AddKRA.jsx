import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ChevronRight, Phone, Mail, MapPin, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { kpaReportService } from '../../api/kpaReportService';

const AddKRA = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState({
    fullName: 'Clark Kent',
    designation: 'Branch Manager',
    phoneNumber: '9876543210',
    email: 'example@gmail.com',
    branchName: 'Mumbai Branch',
  });

  const [kraRows, setKraRows] = useState([
    { id: 1, product: 'Fixed Deposit', target: '500000' },
    { id: 2, product: 'Loan Disbursement', target: '300000' },
    { id: 3, product: 'Savings Account', target: '200' },
  ]);

  useEffect(() => {
    if (!id) return;
    const loadEmployee = async () => {
      try {
        const res = await kpaReportService.getDetail(id);
        if (res?.data?.employee) {
          setEmployee(res.data.employee);
        }
      } catch (err) {
        console.error('Failed to load employee for KRA:', err);
      }
    };
    loadEmployee();
  }, [id]);

  const handleAddRow = () => {
    const newId = kraRows.length > 0 ? Math.max(...kraRows.map(r => r.id)) + 1 : 1;
    setKraRows([...kraRows, { id: newId, product: '', target: '' }]);
  };

  const handleRemoveRow = (rowId) => {
    if (kraRows.length === 1) {
      toast.warn('At least one KRA target is required.');
      return;
    }
    setKraRows(kraRows.filter(r => r.id !== rowId));
  };

  const handleRowChange = (rowId, field, value) => {
    setKraRows(kraRows.map(row => (row.id === rowId ? { ...row, [field]: value } : row)));
  };

  const handleSave = () => {
    toast.success('KRA targets updated successfully!');
    navigate(`/kpa-report/view/${id}`);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      
      {/* Breadcrumb */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[#1b58a6] mb-3">Add New KRA</h1>
          <div className="flex items-center text-[13px] font-medium text-gray-500 flex-wrap gap-y-2">
            <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
            <ChevronRight size={14} className="mx-1" />
            <span>HR Management</span>
            <ChevronRight size={14} className="mx-1" />
            <Link to="/kpa-report" className="hover:text-gray-800 transition-colors">KPA Report</Link>
            <ChevronRight size={14} className="mx-1" />
            <Link to={`/kpa-report/view/${id}`} className="hover:text-gray-800 transition-colors">View Report</Link>
            <ChevronRight size={14} className="mx-1" />
            <span className="text-[#1b58a6]">Add New KRA</span>
          </div>
        </div>

        <button
          onClick={() => navigate(`/kpa-report/view/${id}`)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors self-start sm:self-center"
        >
          <ArrowLeft size={16} /> Back to View Report
        </button>
      </div>

      {/* Employee Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm shrink-0 bg-purple-50 flex items-center justify-center text-purple-700 font-bold text-xl">
            {employee.fullName ? employee.fullName.charAt(0) : 'E'}
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-bold text-gray-800">{employee.fullName || 'Employee'}</h2>
            <span className="inline-flex px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[12px] font-bold w-max">
              {employee.designation || 'Staff'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
              <Phone size={16} className="text-[#1cabb1]" /> {employee.phoneNumber || '—'}
            </div>
            <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
              <Mail size={16} className="text-[#1cabb1]" /> {employee.email || '—'}
            </div>
            <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
              <MapPin size={16} className="text-[#1cabb1]" /> {employee.branchName || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden p-8">
        <h2 className="text-[18px] font-bold text-gray-800 mb-6">Add New KRA Targets</h2>
        
        <div className="flex flex-col gap-6">
          {kraRows.map((row) => (
            <div key={row.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-6 flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Product</label>
                <select 
                  value={row.product}
                  onChange={(e) => handleRowChange(row.id, 'product', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#1cabb1] bg-white"
                >
                  <option value="">Select Product</option>
                  <option value="Fixed Deposit">Fixed Deposit</option>
                  <option value="Loan Disbursement">Loan Disbursement</option>
                  <option value="Recurring Deposit">Recurring Deposit</option>
                  <option value="Savings Account">Savings Account</option>
                  <option value="Current Account">Current Account</option>
                  <option value="Insurance Policy">Insurance Policy</option>
                </select>
              </div>
              <div className="md:col-span-5 flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Target Amount (₹)</label>
                <input 
                  type="number" 
                  value={row.target}
                  onChange={(e) => handleRowChange(row.id, 'target', e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] focus:outline-none focus:border-[#1cabb1]"
                />
              </div>
              <div className="md:col-span-1 flex items-end justify-center pt-5">
                <button
                  type="button"
                  onClick={() => handleRemoveRow(row.id)}
                  className="p-2.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Remove target"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          <div className="flex justify-start pt-2">
            <button 
              type="button" 
              onClick={handleAddRow}
              className="text-[#1cabb1] hover:text-[#159a9f] text-[14px] font-semibold flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-teal-50"
            >
              <Plus size={16} /> Add More Target
            </button>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-4 mt-2">
        <button 
          onClick={() => navigate(`/kpa-report/view/${id}`)}
          className="px-8 py-2.5 rounded-full border border-[#1cabb1] text-[#1cabb1] hover:bg-teal-50 text-[14px] font-semibold transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="px-8 py-2.5 rounded-full bg-[#1cabb1] hover:bg-[#159a9f] text-white text-[14px] font-semibold transition-colors shadow-sm"
        >
          Save Changes
        </button>
      </div>

    </div>
  );
};

export default AddKRA;
