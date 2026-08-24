import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Phone, Mail, MapPin, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { kpaReportService } from '../../api/kpaReportService';

const AddKRA = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState({
    fullName: '',
    designation: '',
    phoneNumber: '',
    email: '',
    branchName: '',
  });

  const [kraRows, setKraRows] = useState([
    { id: 1, product: '', target: '' },
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
      
      {/* Header */}
      <PageHeader
        title="Add New KRA"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'HR Management' },
          { label: 'KPA Report', to: '/kpa-report' },
          { label: 'View Report', to: `/kpa-report/view/${id}` },
          { label: 'Add New KRA' }
        ]}
        showBack={true}
        backUrl={`/kpa-report/view/${id}`}
      />

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
              <Phone size={16} className="text-[#225091]" /> {employee.phoneNumber || '—'}
            </div>
            <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
              <Mail size={16} className="text-[#225091]" /> {employee.email || '—'}
            </div>
            <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
              <MapPin size={16} className="text-[#225091]" /> {employee.branchName || '—'}
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
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-700 focus:outline-none focus:border-[#225091] bg-white"
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
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-[14px] focus:outline-none focus:border-[#225091]"
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
              className="text-[#225091] hover:text-[#159a9f] text-[14px] font-semibold flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-teal-50"
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
          className="px-8 py-2.5 rounded-full border border-[#225091] text-[#225091] hover:bg-teal-50 text-[14px] font-semibold transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="px-8 py-2.5 rounded-full bg-[#225091] hover:bg-[#159a9f] text-white text-[14px] font-semibold transition-colors shadow-sm"
        >
          Save Changes
        </button>
      </div>

    </div>
  );
};

export default AddKRA;
