import React, { useState } from 'react';
import { X, Calendar, FileText, Send, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { attendanceService } from '../../api/attendanceService';

const LEAVE_TYPES = [
  { value: 'CASUAL_LEAVE', label: 'Casual Leave (CL)' },
  { value: 'SICK_LEAVE', label: 'Sick Leave (SL)' },
  { value: 'PAID_LEAVE', label: 'Paid Leave (PL)' },
  { value: 'COMP_OFF', label: 'Compensatory Off (Comp-Off)' },
  { value: 'OTHER', label: 'Other Leave' }
];

export const ApplyLeaveModal = ({ isOpen, onClose, onSuccess }) => {
  const [leaveType, setLeaveType] = useState('CASUAL_LEAVE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      toast.warning('Please select both start date and end date.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.warning('Start date cannot be after end date.');
      return;
    }

    if (!reason.trim()) {
      toast.warning('Please provide a reason for leave.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await attendanceService.applyLeave({
        leaveType,
        startDate,
        endDate,
        reason: reason.trim()
      });

      toast.success(res?.message || 'Leave application submitted successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Apply leave error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to submit leave application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#225091] text-white p-5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
              <Calendar size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Apply for Leave</h2>
              <p className="text-xs text-blue-100/80">Submit leave application with date validation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Leave Type */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Leave Type
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] cursor-pointer"
            >
              {LEAVE_TYPES.map((lt) => (
                <option key={lt.value} value={lt.value}>
                  {lt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] cursor-pointer"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] cursor-pointer"
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Reason / Remarks
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the reason for your leave application..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] resize-none"
              required
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full font-semibold text-xs text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-full font-semibold text-xs text-white bg-[#225091] hover:bg-[#193e73] transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ApplyLeaveModal;
