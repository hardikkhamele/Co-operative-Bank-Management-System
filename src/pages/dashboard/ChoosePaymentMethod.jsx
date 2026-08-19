import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Check, 
  ExternalLink, 
  RefreshCcw, 
  ShieldCheck, 
  CreditCard, 
  Building,
  ArrowRight
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import cardCreditService from '../../api/cardCreditService';

const ChoosePaymentMethod = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve purchase order data passed from CardsAndCredit.jsx
  const orderState = location.state || {};
  const { orderData, priceBreakdown, checkoutUrl, orderId } = orderState;

  const [expandedSection, setExpandedSection] = useState('EASEBUZZ');
  const [selectedUpi, setSelectedUpi] = useState('PhonePe');
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Price breakdown with fallback defaults
  const emiQty = priceBreakdown?.emiQuantity ?? orderData?.emiQuantity ?? 100;
  const emiRate = priceBreakdown?.emiRate ?? 499;
  const emiAmount = priceBreakdown?.emiAmount ?? (emiQty * emiRate);

  const verificationQty = priceBreakdown?.verificationQuantity ?? orderData?.verificationQuantity ?? 200;
  const verificationRate = priceBreakdown?.verificationRate ?? 50;
  const verificationAmount = priceBreakdown?.verificationAmount ?? (verificationQty * verificationRate);

  const subtotal = priceBreakdown?.subtotal ?? (emiAmount + verificationAmount);
  const cgst = priceBreakdown?.cgst ?? Math.round(subtotal * 0.09);
  const sgst = priceBreakdown?.sgst ?? Math.round(subtotal * 0.09);
  const totalPayable = priceBreakdown?.totalPayableAmount ?? (subtotal + cgst + sgst);

  // Check payment status with backend API
  const handleCheckStatus = async () => {
    if (!orderId) {
      navigate('/cards-credit/payment/success');
      return;
    }

    try {
      setCheckingStatus(true);
      const res = await cardCreditService.checkPaymentStatus(orderId);
      if (res && res.success && res.data) {
        if (res.data.paymentStatus === 'SUCCESS') {
          toast.success('Payment verified successfully!');
          navigate('/cards-credit/payment/success', {
            state: { paymentData: res.data, orderId }
          });
        } else if (res.data.paymentStatus === 'PENDING') {
          toast.info('Payment is still pending. If you completed payment, please wait a few moments.');
        } else {
          toast.warning(`Payment status: ${res.data.paymentStatus}`);
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast.error(error.response?.data?.message || 'Failed to verify payment status');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleLaunchEasebuzz = () => {
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      toast.info('Easebuzz payment window opened. Complete the transaction and verify status.');
    } else {
      toast.info('Simulating payment gateway redirect...');
      setTimeout(() => {
        navigate('/cards-credit/payment/success', {
          state: { orderId: orderId || 'ORD_CC_DEMO' }
        });
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80">
        <h1 className="text-2xl font-bold text-[#1b2559] mb-1">Choose Payment Method</h1>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-[#1D4ED8] transition-colors">Dashboard</Link>
          <ChevronRight size={15} className="mx-1 text-gray-400" />
          <Link to="/cards-credit" className="hover:text-[#1D4ED8] transition-colors">EMI Cards & Verification Credits</Link>
          <ChevronRight size={15} className="mx-1 text-gray-400" />
          <span className="text-[#1D4ED8] font-semibold">Payment Gateway</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side - Order Summary Breakdown */}
        <div className="w-full lg:w-[420px] bg-gradient-to-b from-[#ebfcf0] to-white rounded-2xl p-6 border border-[#c1f5d6] shadow-sm shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#1b2559]">Order Summary</h3>
            {orderId && (
              <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-[#c1f5d6] text-gray-600">
                {orderId}
              </span>
            )}
          </div>
          
          <div className="space-y-3 text-sm">
            {emiQty > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">EMI Cards ({emiQty} Qty.)</span>
                <span className="font-semibold text-gray-800">₹{emiAmount.toLocaleString()}</span>
              </div>
            )}
            {verificationQty > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Verification Credits ({verificationQty} Qty.)</span>
                <span className="font-semibold text-gray-800">₹{verificationAmount.toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex justify-between pt-2 border-t border-[#c1f5d6]/70">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="font-semibold text-gray-800">₹{subtotal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">CGST (9%)</span>
              <span className="font-semibold text-gray-800">+ ₹{cgst.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between pb-3 border-b border-[#c1f5d6]/70">
              <span className="text-gray-600 font-medium">SGST (9%)</span>
              <span className="font-semibold text-gray-800">+ ₹{sgst.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-baseline pt-2">
              <span className="font-bold text-gray-800 text-sm">Total Payable</span>
              <span className="font-bold text-[#1b2559] text-2xl">₹{totalPayable.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#c1f5d6]/60 flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>Secured 256-bit encrypted checkout via Easebuzz Gateway</span>
          </div>
        </div>

        {/* Right Side - Payment Methods */}
        <div className="flex-1 w-full space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <h3 className="text-lg font-bold text-[#1b2559]">Select Payment Option</h3>

            {/* Easebuzz Payment Gateway Option */}
            <div className={`rounded-xl border transition-all overflow-hidden ${expandedSection === 'EASEBUZZ' ? 'border-[#1D4ED8] bg-teal-50/20' : 'border-gray-200'}`}>
              <button 
                onClick={() => setExpandedSection('EASEBUZZ')}
                className="w-full flex items-center justify-between p-4 focus:outline-none bg-white text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#1D4ED8] flex items-center justify-center font-bold text-xs">
                    EB
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 text-sm block">Easebuzz Official Gateway (Instant)</span>
                    <span className="text-xs text-gray-400">Supports UPI, NetBanking, Credit/Debit Cards</span>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  {expandedSection === 'EASEBUZZ' && <div className="w-2.5 h-2.5 bg-[#1D4ED8] rounded-full"></div>}
                </div>
              </button>

              {expandedSection === 'EASEBUZZ' && (
                <div className="p-4 pt-0 border-t border-teal-100/50 bg-teal-50/10 space-y-3">
                  <p className="text-xs text-gray-600 mt-3">
                    Click below to open the Easebuzz secure payment portal and complete your checkout.
                  </p>
                  <button
                    onClick={handleLaunchEasebuzz}
                    className="w-full py-3 px-4 rounded-xl bg-[#1D4ED8] hover:bg-[#159a9f] text-white font-semibold transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                  >
                    <span>Proceed to Easebuzz Checkout</span>
                    <ExternalLink size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* UPI Option */}
            <div className={`rounded-xl border transition-all overflow-hidden ${expandedSection === 'UPI' ? 'border-[#1D4ED8] bg-teal-50/20' : 'border-gray-200'}`}>
              <button 
                onClick={() => setExpandedSection('UPI')}
                className="w-full flex items-center justify-between p-4 focus:outline-none bg-white text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    UPI
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 text-sm block">Direct UPI / QR</span>
                    <span className="text-xs text-gray-400">GPay, PhonePe, Paytm, or UPI ID</span>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  {expandedSection === 'UPI' && <div className="w-2.5 h-2.5 bg-[#1D4ED8] rounded-full"></div>}
                </div>
              </button>

              {expandedSection === 'UPI' && (
                <div className="p-4 pt-0 border-t border-gray-100 space-y-3 mt-3">
                  <div className="grid grid-cols-3 gap-3">
                    {['PhonePe', 'Gpay', 'Paytm'].map((app) => (
                      <label 
                        key={app} 
                        onClick={() => setSelectedUpi(app)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedUpi === app 
                            ? 'border-[#1D4ED8] bg-teal-50/30 text-[#1D4ED8] font-bold' 
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-xs font-semibold">{app}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Net Banking */}
            <div className={`rounded-xl border transition-all overflow-hidden ${expandedSection === 'NETBANKING' ? 'border-[#1D4ED8] bg-teal-50/20' : 'border-gray-200'}`}>
              <button 
                onClick={() => setExpandedSection('NETBANKING')}
                className="w-full flex items-center justify-between p-4 focus:outline-none bg-white text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Building size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 text-sm block">Net Banking</span>
                    <span className="text-xs text-gray-400">All major Indian banks supported</span>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  {expandedSection === 'NETBANKING' && <div className="w-2.5 h-2.5 bg-[#1D4ED8] rounded-full"></div>}
                </div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button 
              onClick={() => navigate('/cards-credit')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-100 transition-colors text-sm"
            >
              Cancel Order
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                disabled={checkingStatus}
                onClick={handleCheckStatus}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-[#1D4ED8] text-[#1D4ED8] font-semibold hover:bg-teal-50 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <RefreshCcw size={15} className={checkingStatus ? 'animate-spin' : ''} />
                <span>Verify Payment Status</span>
              </button>

              <button 
                onClick={handleLaunchEasebuzz}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#159a9f] text-white font-semibold transition-all shadow-sm text-sm flex items-center justify-center gap-2"
              >
                <span>Pay ₹{totalPayable.toLocaleString()}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoosePaymentMethod;
