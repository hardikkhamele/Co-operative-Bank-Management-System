import React, { useEffect, useState } from 'react';
import { Check, ArrowLeft, Download, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import cardCreditService from '../../api/cardCreditService';

const PaymentSuccessful = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const orderIdFromUrl = searchParams.get('orderId');
  const stateData = location.state || {};
  const orderId = stateData.orderId || orderIdFromUrl;

  const [paymentDetails, setPaymentDetails] = useState(stateData.paymentData || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId && !paymentDetails) {
      const fetchStatus = async () => {
        try {
          setLoading(true);
          const res = await cardCreditService.checkPaymentStatus(orderId);
          if (res && res.success && res.data) {
            setPaymentDetails(res.data);
          }
        } catch (error) {
          console.error('Error loading payment confirmation:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchStatus();
    }
  }, [orderId, paymentDetails]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col items-center max-w-xl w-full text-center relative overflow-hidden">
        {/* Top green accent */}
        <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20 text-white">
          <Check size={40} strokeWidth={3} />
        </div>

        <h2 className="text-2xl font-bold text-[#1b2559] mb-2">
          Payment Successfully Completed!
        </h2>
        <p className="text-sm text-gray-500 mb-6 font-medium">
          Your purchase has been processed and cards/credits are added to your bank inventory.
        </p>

        {/* Invoice Summary Box */}
        <div className="w-full bg-gray-50/80 rounded-2xl p-5 border border-gray-100 text-left space-y-3 mb-8 text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200/80">
            <span className="text-xs text-gray-500 font-medium">Order ID</span>
            <span className="font-mono text-xs font-bold text-gray-800">{orderId || paymentDetails?.orderId || 'ORD_CC_COMPLETED'}</span>
          </div>

          {paymentDetails?.invoiceNumber && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Invoice Number</span>
              <span className="font-mono text-xs font-bold text-gray-800">{paymentDetails.invoiceNumber}</span>
            </div>
          )}

          {paymentDetails?.paymentTransactionId && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Transaction ID</span>
              <span className="font-mono text-xs font-semibold text-gray-700">{paymentDetails.paymentTransactionId}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium">Items Purchased</span>
            <span className="font-semibold text-gray-800 text-xs">
              {paymentDetails?.emiQuantity ? `${paymentDetails.emiQuantity} Cards` : ''}
              {paymentDetails?.emiQuantity && paymentDetails?.verificationQuantity ? ' + ' : ''}
              {paymentDetails?.verificationQuantity ? `${paymentDetails.verificationQuantity} Credits` : ''}
              {!paymentDetails?.emiQuantity && !paymentDetails?.verificationQuantity ? 'Stock Purchased' : ''}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-200/80">
            <span className="text-xs text-gray-600 font-bold">Total Amount Paid</span>
            <span className="font-bold text-base text-[#1b2559]">
              ₹{(paymentDetails?.totalAmount || paymentDetails?.total || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <Link 
            to="/cards-credit"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#1D4ED8] text-white font-semibold hover:bg-[#168f94] transition-all shadow-sm text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Return to Cards & Credit</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessful;
