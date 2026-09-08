import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Utility to dynamically load the Razorpay Checkout SDK script
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
import { 
  CreditCard, 
  X, 
  ChevronDown, 
  ArrowDownRight, 
  ArrowUpRight, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCcw, 
  Plus, 
  Send, 
  ShoppingCart, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  FileText, 
  ExternalLink, 
  Clock, 
  Building2, 
  ShieldCheck,
  TrendingUp,
  Receipt,
  Eye,
  Lock,
  Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import cardCreditService from '../../api/cardCreditService';
import branchService from '../../api/branchService';
import PageHeader from '../../components/common/PageHeader';
import TableWrapper from '../../components/common/TableWrapper';
import StatsCard from '../../components/common/StatsCard';

const HistoryIcon = ({ type, action }) => {
  const normAction = (action || '').toUpperCase();
  const normType = (type || '').toLowerCase();

  if (normAction === 'ALLOCATION' || normType === 'transferred' || normType === 'distributed') {
    return (
      <div className="w-10 h-10 shrink-0 rounded-xl bg-orange-50 text-[#ff8f00] flex items-center justify-center relative shadow-sm border border-orange-100/60">
        <CreditCard size={20} strokeWidth={1.7} />
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
          <ArrowUpRight size={13} className="text-[#ff8f00]" strokeWidth={2.5} />
        </div>
      </div>
    );
  } else if (normAction === 'PURCHASE' || normType === 'purchased') {
    return (
      <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-50 text-[#10b981] flex items-center justify-center relative shadow-sm border border-emerald-100/60">
        <CreditCard size={20} strokeWidth={1.7} />
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
          <Plus size={13} className="text-[#10b981]" strokeWidth={2.5} />
        </div>
      </div>
    );
  } else if (normAction === 'DEDUCTION' || normType === 'deducted' || normType === 'used') {
    return (
      <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-50 text-[#8b5cf6] flex items-center justify-center relative shadow-sm border border-purple-100/60">
        <CreditCard size={20} strokeWidth={1.7} />
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
          <ArrowDownRight size={13} className="text-[#8b5cf6]" strokeWidth={2.5} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 text-[#225091] flex items-center justify-center relative shadow-sm border border-blue-100/60">
      <CreditCard size={20} strokeWidth={1.7} />
      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
        <RefreshCcw size={11} className="text-[#225091]" strokeWidth={2.5} />
      </div>
    </div>
  );
};

const CardsAndCredit = () => {
  const navigate = useNavigate();

  // Loading States
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submittingPurchase, setSubmittingPurchase] = useState(false);
  const [submittingTransfer, setSubmittingTransfer] = useState(false);

  // Active Tab for Main View
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'purchases' | 'transfers' | 'branchWallet'

  // Dashboard Data
  const [walletMetrics, setWalletMetrics] = useState({
    emiCards: { purchased: 0, available: 0, used: 0 },
    verificationCredits: { purchased: 0, available: 0, used: 0 }
  });
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [recentTransfers, setRecentTransfers] = useState([]);

  // Branches list for distribution
  const [branches, setBranches] = useState([]);
  const [selectedBranchForInspection, setSelectedBranchForInspection] = useState('');
  const [branchWalletData, setBranchWalletData] = useState(null);
  const [branchWalletLoading, setBranchWalletLoading] = useState(false);

  // Credit Movement History Data
  const [emiHistoryList, setEmiHistoryList] = useState([]);
  const [verificationHistoryList, setVerificationHistoryList] = useState([]);
  const [emiPage, setEmiPage] = useState(1);
  const [verificationPage, setVerificationPage] = useState(1);
  const [emiTotalPages, setEmiTotalPages] = useState(1);
  const [verificationTotalPages, setVerificationTotalPages] = useState(1);
  const [emiTotalRecords, setEmiTotalRecords] = useState(0);
  const [verificationTotalRecords, setVerificationTotalRecords] = useState(0);

  // Purchase History Data (Tab 2)
  const [purchaseHistoryList, setPurchaseHistoryList] = useState([]);
  const [purchaseHistoryPage, setPurchaseHistoryPage] = useState(1);
  const [purchaseHistoryTotalPages, setPurchaseHistoryTotalPages] = useState(1);
  const [purchaseHistoryTotal, setPurchaseHistoryTotal] = useState(0);
  const [purchaseSearch, setPurchaseSearch] = useState('');
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState('ALL');

  // Transfer History Data (Tab 3)
  const [transferHistoryList, setTransferHistoryList] = useState([]);
  const [transferHistoryPage, setTransferHistoryPage] = useState(1);
  const [transferHistoryTotalPages, setTransferHistoryTotalPages] = useState(1);
  const [transferHistoryTotal, setTransferHistoryTotal] = useState(0);
  const [transferSearch, setTransferSearch] = useState('');

  // Modals
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Purchase Form State
  const [purchaseEmi, setPurchaseEmi] = useState(true);
  const [purchaseVerification, setPurchaseVerification] = useState(true);
  const [emiQty, setEmiQty] = useState(100);
  const [verificationQty, setVerificationQty] = useState(200);

  const [pricingData, setPricingData] = useState(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  // Razorpay Checkout & Multi-stage Loading State
  const [paymentStage, setPaymentStage] = useState('IDLE'); // 'IDLE' | 'INITIATING_ORDER' | 'OPENING_GATEWAY' | 'GATEWAY_ACTIVE' | 'VERIFYING_SIGNATURE' | 'POLLING_STATUS' | 'SUCCESS' | 'FAILED'
  const [paymentResult, setPaymentResult] = useState(null);
  const [pollingAttempt, setPollingAttempt] = useState(0);
  const [statusLog, setStatusLog] = useState('');
  const [polling, setPolling] = useState(false);
  const [paymentLink, setPaymentLink] = useState(null);
  const pollIntervalRef = useRef(null);
  const pollCountRef = useRef(0);

  // Distribute / Transfer Form State
  const [distributeType, setDistributeType] = useState('add'); // 'add' (Bank->Branch) | 'transfer' (Branch->Branch)
  const [targetBranchId, setTargetBranchId] = useState('');
  const [sourceBranchId, setSourceBranchId] = useState('');
  const [transferSelection, setTransferSelection] = useState('both'); // 'emi' | 'verification' | 'both'
  const [distributeEmiQty, setDistributeEmiQty] = useState('');
  const [distributeVerificationQty, setDistributeVerificationQty] = useState('');
  const [transferRemarks, setTransferRemarks] = useState('');

  // 1. Fetch Bank Wallet Dashboard
  const fetchDashboardData = useCallback(async () => {
    try {
      setDashboardLoading(true);
      const res = await cardCreditService.getDashboard();
      if (res && res.success && res.data) {
        const data = res.data;
        if (data.wallet) {
          setWalletMetrics(data.wallet);
        }
        if (Array.isArray(data.recentPurchases)) {
          setRecentPurchases(data.recentPurchases);
        }
        if (Array.isArray(data.recentTransfers)) {
          setRecentTransfers(data.recentTransfers);
        }
      }
    } catch (error) {
      console.error('Error fetching cards/credit dashboard:', error);
      toast.error(error.response?.data?.message || 'Failed to load wallet metrics');
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  // 2. Fetch Branches for Allocation Dropdowns
  const fetchBranches = useCallback(async () => {
    try {
      const res = await branchService.list({ limit: 100 });
      let branchList = [];
      if (res && res.data) {
        if (Array.isArray(res.data)) {
          branchList = res.data;
        } else if (Array.isArray(res.data.branches)) {
          branchList = res.data.branches;
        } else if (Array.isArray(res.data.data)) {
          branchList = res.data.data;
        }
      }
      setBranches(branchList);
      if (branchList.length > 0 && !targetBranchId) {
        setTargetBranchId(branchList[0]._id || branchList[0].id);
      }
    } catch (error) {
      console.error('Error fetching branches for card distribution:', error);
    }
  }, [targetBranchId]);

  // 3. Fetch EMI Card Movement History
  const fetchEmiHistory = useCallback(async (page = 1) => {
    try {
      const res = await cardCreditService.getCreditHistory({
        page,
        limit: 6,
        type: 'EMI_CARD'
      });
      if (res && res.success) {
        const items = Array.isArray(res.data) ? res.data : [];
        setEmiHistoryList(items);
        if (res.pagination) {
          setEmiTotalPages(res.pagination.totalPages || 1);
          setEmiTotalRecords(res.pagination.totalRecords || items.length);
        }
      }
    } catch (error) {
      console.error('Error fetching EMI credit history:', error);
    }
  }, []);

  // 4. Fetch Verification Credit Movement History
  const fetchVerificationHistory = useCallback(async (page = 1) => {
    try {
      const res = await cardCreditService.getCreditHistory({
        page,
        limit: 6,
        type: 'VERIFICATION_CREDIT'
      });
      if (res && res.success) {
        const items = Array.isArray(res.data) ? res.data : [];
        setVerificationHistoryList(items);
        if (res.pagination) {
          setVerificationTotalPages(res.pagination.totalPages || 1);
          setVerificationTotalRecords(res.pagination.totalRecords || items.length);
        }
      }
    } catch (error) {
      console.error('Error fetching verification credit history:', error);
    }
  }, []);

  // 5. Fetch Purchase Orders History (Tab 2)
  const fetchPurchaseHistory = useCallback(async (page = 1) => {
    try {
      setHistoryLoading(true);
      const params = {
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      if (purchaseSearch) params.search = purchaseSearch;
      if (purchaseStatusFilter !== 'ALL') params.status = purchaseStatusFilter;

      const res = await cardCreditService.getPurchaseHistory(params);
      if (res && res.success) {
        const items = Array.isArray(res.data) ? res.data : [];
        setPurchaseHistoryList(items);
        if (res.pagination) {
          setPurchaseHistoryTotalPages(res.pagination.totalPages || 1);
          setPurchaseHistoryTotal(res.pagination.totalRecords || items.length);
        }
      }
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      toast.error(error.response?.data?.message || 'Failed to load purchase history');
    } finally {
      setHistoryLoading(false);
    }
  }, [purchaseSearch, purchaseStatusFilter]);

  // 6. Fetch Transfer History (Tab 3)
  const fetchTransferHistory = useCallback(async (page = 1) => {
    try {
      setHistoryLoading(true);
      const params = {
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      if (transferSearch) params.search = transferSearch;

      const res = await cardCreditService.getTransferHistory(params);
      if (res && res.success) {
        const items = Array.isArray(res.data) ? res.data : [];
        setTransferHistoryList(items);
        if (res.pagination) {
          setTransferHistoryTotalPages(res.pagination.totalPages || 1);
          setTransferHistoryTotal(res.pagination.totalRecords || items.length);
        }
      }
    } catch (error) {
      console.error('Error fetching transfer history:', error);
      toast.error(error.response?.data?.message || 'Failed to load transfer history');
    } finally {
      setHistoryLoading(false);
    }
  }, [transferSearch]);

  // 7. Fetch Branch Wallet Details (Tab 4)
  const fetchBranchWalletDetails = async (bId) => {
    if (!bId) return;
    try {
      setBranchWalletLoading(true);
      const res = await cardCreditService.getBranchWallet(bId);
      if (res && res.success) {
        setBranchWalletData(res.data);
      }
    } catch (error) {
      console.error('Error fetching branch wallet:', error);
      toast.error(error.response?.data?.message || 'Failed to load branch wallet');
    } finally {
      setBranchWalletLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchDashboardData();
    fetchBranches();
    fetchEmiHistory(1);
    fetchVerificationHistory(1);
  }, [fetchDashboardData, fetchBranches, fetchEmiHistory, fetchVerificationHistory]);

  // Tab change triggers
  useEffect(() => {
    if (activeTab === 'purchases') {
      fetchPurchaseHistory(purchaseHistoryPage);
    } else if (activeTab === 'transfers') {
      fetchTransferHistory(transferHistoryPage);
    } else if (activeTab === 'branchWallet' && selectedBranchForInspection) {
      fetchBranchWalletDetails(selectedBranchForInspection);
    }
  }, [activeTab, purchaseHistoryPage, transferHistoryPage, fetchPurchaseHistory, fetchTransferHistory]);



  // Dynamic Price Calculation Effect
  useEffect(() => {
    const calculateDynamicPrice = async () => {
      if (!isPurchaseModalOpen) return;
      
      const payload = {
        emiCardQuantity: purchaseEmi ? (Number(emiQty) || 0) : 0,
        verificationCreditQuantity: purchaseVerification ? (Number(verificationQty) || 0) : 0
      };

      if (payload.emiCardQuantity === 0 && payload.verificationCreditQuantity === 0) {
        setPricingData(null);
        return;
      }

      setIsCalculatingPrice(true);
      try {
        const response = await cardCreditService.calculatePrice(payload);
        if (response.success && response.data) {
          setPricingData(response.data);
        }
      } catch (error) {
        console.warn('Price calculation failed:', error);
      } finally {
        setIsCalculatingPrice(false);
      }
    };

    const timer = setTimeout(calculateDynamicPrice, 300);
    return () => clearTimeout(timer);
  }, [isPurchaseModalOpen, purchaseEmi, purchaseVerification, emiQty, verificationQty]);

  // Load Razorpay Script Helper
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Helper to open purchase modal cleanly
  const handleOpenPurchaseModal = () => {
    setPaymentStage('IDLE');
    setPaymentResult(null);
    setStatusLog('');
    setPaymentLink(null);
    setSubmittingPurchase(false);
    setPolling(false);
    setIsPurchaseModalOpen(true);
  };

  // Handle Purchase Submit with Multi-stage Progress Tracking
  const handleInitiatePurchase = async () => {
    if (!purchaseEmi && !purchaseVerification) {
      toast.warning('Please select at least one item (EMI Card or Verification Credit) to purchase.');
      return;
    }

    const emiQ = purchaseEmi ? Number(emiQty) : 0;
    const verQ = purchaseVerification ? Number(verificationQty) : 0;

    if (purchaseEmi && emiQ <= 0) {
      toast.warning('Please enter a valid EMI Card quantity.');
      return;
    }
    if (purchaseVerification && verQ <= 0) {
      toast.warning('Please enter a valid Verification Credit quantity.');
      return;
    }

    let purchaseType = 'BOTH';
    if (purchaseEmi && !purchaseVerification) purchaseType = 'EMI_CARD';
    if (!purchaseEmi && purchaseVerification) purchaseType = 'VERIFICATION_CREDIT';

    try {
      setSubmittingPurchase(true);
      setPaymentStage('INITIATING_ORDER');
      setPaymentResult(null);
      setPaymentLink(null);
      setStatusLog("Loading Razorpay security SDK...");

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error("Failed to load Razorpay SDK. Please check your internet connection.");
        setSubmittingPurchase(false);
        setPaymentStage('FAILED');
        return;
      }

      setStatusLog("Creating secure payment order on banking server...");
      const payload = {
        purchaseType,
        emiQuantity: emiQ,
        verificationQuantity: verQ
      };

      const res = await cardCreditService.initiatePurchase(payload);

      if (res && res.success && res.data) {
        const orderData = res.data;
        if (orderData.paymentLink || orderData.checkoutUrl) {
          setPaymentLink(orderData.paymentLink || orderData.checkoutUrl);
        }

        setPaymentStage('OPENING_GATEWAY');
        setStatusLog("Opening Razorpay Payment Checkout...");

        const options = {
          key: orderData.keyId || orderData.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TTVmOdCGlRjqaK',
          amount: orderData.amountInPaise,
          currency: orderData.currency || "INR",
          name: "Advita Enterprise ERP",
          description: `Credit Purchase (${purchaseType})`,
          order_id: orderData.orderId,
          handler: async function (paymentResponse) {
            setPaymentStage('VERIFYING_SIGNATURE');
            setStatusLog("Payment authorized! Verifying cryptographic signature with banking gateway...");
            try {
              const verifyRes = await cardCreditService.verifyPayment({
                razorpay_order_id: paymentResponse.razorpay_order_id || orderData.orderId,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              });
              
              if (verifyRes && verifyRes.success) {
                const inv = verifyRes.data?.invoiceNumber || orderData.orderId;
                setPaymentResult({
                  invoiceNumber: inv,
                  paymentId: paymentResponse.razorpay_payment_id,
                  orderId: paymentResponse.razorpay_order_id || orderData.orderId,
                  amount: pricingData?.totalPayableAmount || (orderData.amountInPaise / 100),
                  emiQty: emiQ,
                  verQty: verQ
                });
                setPaymentStage('SUCCESS');
                setStatusLog("Payment verified and credits added to wallet successfully!");
                toast.success(`Payment Successful! Invoice: ${inv}`);
                setSubmittingPurchase(false);
                fetchDashboardData();
                fetchPurchaseHistory(1);
                return;
              }
            } catch (err) {
              console.warn("Direct verification failed, falling back to polling...", err);
            }
            startPolling(orderData.orderId, emiQ, verQ);
          },
          prefill: orderData.prefill || {
            email: "bank@advita.com",
            contact: "7798598099",
          },
          modal: {
            ondismiss: function () {
              if (paymentStage !== 'SUCCESS' && paymentStage !== 'VERIFYING_SIGNATURE' && paymentStage !== 'POLLING_STATUS') {
                setStatusLog("Payment popup was closed. You can retry below.");
                setSubmittingPurchase(false);
                setPaymentStage('IDLE');
              }
            },
            escape: true,
            confirm_close: true,
          },
          theme: {
            color: "#225091",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          setStatusLog(`Payment Failed: ${response.error.description}`);
          toast.error(`Payment Failed: ${response.error.description}`);
          setSubmittingPurchase(false);
          setPaymentStage('FAILED');
        });

        rzp.open();
        setPaymentStage('GATEWAY_ACTIVE');
      } else {
        toast.error(res?.message || 'Failed to initiate purchase');
        setSubmittingPurchase(false);
        setPaymentStage('FAILED');
      }
    } catch (error) {
      console.error('Error initiating purchase:', error);
      toast.error(error.response?.data?.message || 'Error occurred while initiating purchase');
      setSubmittingPurchase(false);
      setPaymentStage('FAILED');
    }
  };

  // Status Polling Fallback with live attempt tracker
  const startPolling = (orderId, emiQ = 0, verQ = 0) => {
    setPolling(true);
    setPaymentStage('POLLING_STATUS');
    pollCountRef.current = 0;

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    setStatusLog("Confirming payment status from gateway... (Attempt 1 of 24)");

    pollIntervalRef.current = setInterval(async () => {
      pollCountRef.current += 1;
      setPollingAttempt(pollCountRef.current);
      setStatusLog(`Confirming payment status with gateway... (Attempt ${pollCountRef.current} of 24)`);

      if (pollCountRef.current > 24) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
        setPolling(false);
        setSubmittingPurchase(false);
        setPaymentStage('FAILED');
        setStatusLog("Payment verification timed out. If money was deducted, your wallet will be updated automatically via webhook.");
        toast.info("Payment verification timed out. Please check your purchase history in a few moments.");
        return;
      }

      try {
        const res = await cardCreditService.checkPaymentStatus(orderId);
        if (res && res.success) {
          if (res.data.paymentStatus === "SUCCESS") {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
            setPolling(false);
            setSubmittingPurchase(false);
            setPaymentLink(null);
            const inv = res.data.invoiceNumber || orderId;
            setPaymentResult({
              invoiceNumber: inv,
              paymentId: res.data.paymentId || orderId,
              orderId,
              amount: pricingData?.totalPayableAmount || 0,
              emiQty: emiQ,
              verQty: verQ
            });
            setPaymentStage('SUCCESS');
            setStatusLog("Payment verified successfully!");
            toast.success(`Payment Successful! Invoice: ${inv}`);
            fetchDashboardData();
            fetchPurchaseHistory(1);
          } else if (res.data.paymentStatus === "FAILED") {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
            setPolling(false);
            setSubmittingPurchase(false);
            setPaymentStage('FAILED');
            setStatusLog(`Payment Failed for Order: ${orderId}`);
            toast.error("Payment Failed");
          }
        }
      } catch (err) {
        console.warn(`Status check error: ${err.message} (retrying...)`);
      }
    }, 4000);
  };

  // Handle Stock Transfer Submit
  const handleTransferStock = async () => {
    if (!targetBranchId) {
      toast.warning('Please select a target branch.');
      return;
    }

    const emiQ = Number(distributeEmiQty) || 0;
    const verQ = Number(distributeVerificationQty) || 0;

    if (emiQ <= 0 && verQ <= 0) {
      toast.warning('Please specify at least one quantity for EMI Cards or Verification Credits.');
      return;
    }

    const availableEmi = walletMetrics?.emiCards?.available || 0;
    const availableVer = walletMetrics?.verificationCredits?.available || 0;

    if (emiQ > availableEmi) {
      toast.error(`Cannot transfer ${emiQ} EMI Cards. Only ${availableEmi} available in bank inventory.`);
      return;
    }
    if (verQ > availableVer) {
      toast.error(`Cannot transfer ${verQ} Verification Credits. Only ${availableVer} available in bank inventory.`);
      return;
    }

    try {
      setSubmittingTransfer(true);
      const payload = {
        branchId: targetBranchId,
        emiQuantity: emiQ,
        verificationQuantity: verQ,
        remarks: transferRemarks.trim() || 'Branch stock allocation'
      };

      const res = await cardCreditService.transferStock(payload);

      if (res && res.success) {
        toast.success(res.message || 'Credit stock transferred to branch successfully!');
        setIsDistributeModalOpen(false);
        setDistributeEmiQty('');
        setDistributeVerificationQty('');
        setTransferRemarks('');
        // Refresh dashboard and history
        fetchDashboardData();
        fetchEmiHistory(1);
        fetchVerificationHistory(1);
      } else {
        toast.error(res?.message || 'Failed to transfer stock to branch');
      }
    } catch (error) {
      console.error('Error transferring stock:', error);
      toast.error(error.response?.data?.message || 'Failed to transfer stock to branch');
    } finally {
      setSubmittingTransfer(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 font-sans antialiased pb-16">
      {/* 1. Header Card */}
      <PageHeader
        title="EMI Cards & Verification Credits"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Stock & Verification" },
          { label: "Cards & Credits" }
        ]}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            title="Refresh Metrics"
            className="p-2.5 rounded-full border border-gray-200 text-gray-600 hover:text-[#225091] hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCcw size={16} className={dashboardLoading ? 'animate-spin text-[#225091]' : ''} />
          </button>
          <button 
            onClick={() => setIsDistributeModalOpen(true)}
            className="px-4 py-2.5 rounded-full border border-[#225091] text-[#225091] hover:bg-blue-50 font-semibold transition-all text-xs flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <Send size={14} />
            <span>Distribute</span>
          </button>
          <button 
            onClick={handleOpenPurchaseModal}
            className="px-5 py-2.5 rounded-full bg-[#225091] hover:bg-[#1b427b] text-white font-semibold transition-all text-xs flex items-center gap-2 shadow-sm hover:shadow cursor-pointer"
          >
            <ShoppingCart size={14} />
            <span>Purchase Card & Credit</span>
          </button>
        </div>
      </PageHeader>

      {/* 2. Primary 2 Stats Cards (Available EMI Cards & Verification Credits) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard
          layout="centered"
          color="blue"
          label="AVAILABLE EMI CARDS"
          value={dashboardLoading ? '...' : (walletMetrics?.emiCards?.available || 0).toLocaleString()}
          icon={CreditCard}
        />
        <StatsCard
          layout="centered"
          color="emerald"
          label="AVAILABLE VERIFICATION CREDITS"
          value={dashboardLoading ? '...' : (walletMetrics?.verificationCredits?.available || 0).toLocaleString()}
          icon={ShieldCheck}
        />
      </div>

      {/* 3. Navigation Tabs for Views */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#225091] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Activity & Live History
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'purchases'
              ? 'bg-[#225091] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Purchase Orders
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'transfers'
              ? 'bg-[#225091] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Branch Allocations
        </button>
        <button
          onClick={() => setActiveTab('branchWallet')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'branchWallet'
              ? 'bg-[#225091] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Branch Wallet Inspector
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SPLIT HISTORY */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* EMI Card History */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#1b2559]">EMI Card Activity</h3>
                  <p className="text-xs text-gray-400 font-medium">Recent stock movements & purchase logs</p>
                </div>
                <button
                  onClick={() => fetchEmiHistory(emiPage)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <RefreshCcw size={15} />
                </button>
              </div>

              <div className="space-y-4 min-h-[300px]">
                {emiHistoryList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <CreditCard size={36} className="text-gray-300 mb-2" />
                    <p className="text-sm">No EMI card activity found yet</p>
                  </div>
                ) : (
                  emiHistoryList.map((item, idx) => (
                    <div key={item.id || item._id || idx} className="flex gap-3.5 p-2.5 rounded-xl hover:bg-gray-50/80 transition-colors border border-transparent hover:border-gray-100">
                      <HistoryIcon type={item.type} action={item.action} />
                      <div className="flex flex-col justify-center flex-1 min-w-0">
                        <p className="text-[13px] text-[#1b2559] font-medium leading-snug mb-1 truncate">
                          {item.description || `${item.amount || item.quantity} EMI Cards ${item.action || 'updated'}`}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                          <Clock size={12} />
                          <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : 'Recent'}</span>
                          {item.branch && (
                            <span className="text-[#225091] font-semibold truncate">• {item.branch.name || item.branch}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-500">
                Page {emiPage} of {emiTotalPages} ({emiTotalRecords} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={emiPage <= 1}
                  onClick={() => {
                    const newP = emiPage - 1;
                    setEmiPage(newP);
                    fetchEmiHistory(newP);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-[#225091] hover:text-[#225091] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-[#225091] px-2">{emiPage}</span>
                <button
                  disabled={emiPage >= emiTotalPages}
                  onClick={() => {
                    const newP = emiPage + 1;
                    setEmiPage(newP);
                    fetchEmiHistory(newP);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-[#225091] hover:text-[#225091] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Verification Credit History */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#1b2559]">Verification Credit Activity</h3>
                  <p className="text-xs text-gray-400 font-medium">Recent credit deductions & transfers</p>
                </div>
                <button
                  onClick={() => fetchVerificationHistory(verificationPage)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <RefreshCcw size={15} />
                </button>
              </div>

              <div className="space-y-4 min-h-[300px]">
                {verificationHistoryList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <ShieldCheck size={36} className="text-gray-300 mb-2" />
                    <p className="text-sm">No verification credit activity found yet</p>
                  </div>
                ) : (
                  verificationHistoryList.map((item, idx) => (
                    <div key={item.id || item._id || idx} className="flex gap-3.5 p-2.5 rounded-xl hover:bg-gray-50/80 transition-colors border border-transparent hover:border-gray-100">
                      <HistoryIcon type={item.type} action={item.action} />
                      <div className="flex flex-col justify-center flex-1 min-w-0">
                        <p className="text-[13px] text-[#1b2559] font-medium leading-snug mb-1 truncate">
                          {item.description || `${item.amount || item.quantity} Credits ${item.action || 'updated'}`}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                          <Clock size={12} />
                          <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : 'Recent'}</span>
                          {item.branch && (
                            <span className="text-[#225091] font-semibold truncate">• {item.branch.name || item.branch}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-100">
              <span className="text-xs font-semibold text-gray-500">
                Page {verificationPage} of {verificationTotalPages} ({verificationTotalRecords} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={verificationPage <= 1}
                  onClick={() => {
                    const newP = verificationPage - 1;
                    setVerificationPage(newP);
                    fetchVerificationHistory(newP);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-[#225091] hover:text-[#225091] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-[#225091] px-2">{verificationPage}</span>
                <button
                  disabled={verificationPage >= verificationTotalPages}
                  onClick={() => {
                    const newP = verificationPage + 1;
                    setVerificationPage(newP);
                    fetchVerificationHistory(newP);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-[#225091] hover:text-[#225091] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PURCHASE ORDERS HISTORY */}
      {activeTab === 'purchases' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#1b2559]">Card & Credit Purchase Orders</h3>
              <p className="text-xs text-gray-400">View Easebuzz orders, tax invoices, and payment statuses</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Order ID / Invoice..."
                  value={purchaseSearch}
                  onChange={(e) => setPurchaseSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchPurchaseHistory(1)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]"
                />
              </div>

              <select
                value={purchaseStatusFilter}
                onChange={(e) => {
                  setPurchaseStatusFilter(e.target.value);
                  setPurchaseHistoryPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#225091] bg-white text-gray-700 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <TableWrapper minHeight="360px">
            <table className="w-full border-collapse min-w-[900px] text-center text-sm whitespace-nowrap">
              <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
                <tr>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Order ID</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Type / Units</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Subtotal</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">GST (18%)</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Total Amount</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Status</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Date</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[13px]">
                {historyLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      <RefreshCcw size={20} className="animate-spin mx-auto mb-2 text-[#225091]" />
                      <span className="text-sm font-medium">Loading purchase history...</span>
                    </td>
                  </tr>
                ) : purchaseHistoryList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-gray-500 text-sm font-medium">
                      No purchase orders found matching the filter.
                    </td>
                  </tr>
                ) : (
                  purchaseHistoryList.map((po, idx) => {
                    const status = (po.paymentStatus || 'PENDING').toUpperCase();
                    return (
                      <tr key={po.id || po._id || idx} className="hover:bg-blue-50/25 transition-colors group">
                        <td className="py-3.5 px-4 font-mono font-medium text-gray-900 text-xs whitespace-nowrap">
                          {po.orderId || po.id}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900 text-xs">
                            {po.purchaseType || 'PURCHASE'}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {po.emiQuantity > 0 && `${po.emiQuantity} Cards`}
                            {po.emiQuantity > 0 && po.verificationQuantity > 0 && ' | '}
                            {po.verificationQuantity > 0 && `${po.verificationQuantity} Credits`}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-gray-800 tabular-nums whitespace-nowrap">
                          ₹{(po.subtotal || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-500 tabular-nums whitespace-nowrap">
                          ₹{((po.cgst || 0) + (po.sgst || 0)).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-900 text-xs tabular-nums whitespace-nowrap">
                          ₹{(po.total || po.totalAmount || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border uppercase tracking-wide ${
                            status === 'SUCCESS' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                              : status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                              : 'bg-rose-50 text-rose-700 border-rose-200/60'
                          }`}>
                            {status === 'SUCCESS' && <CheckCircle2 size={12} />}
                            {status === 'PENDING' && <Clock size={12} />}
                            {status === 'FAILED' && <AlertCircle size={12} />}
                            {status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                          {po.createdAt ? new Date(po.createdAt).toLocaleDateString('en-GB') : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedOrderDetails(po)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#225091] bg-[#EAF2FB] hover:bg-[#d8e8f8] border border-[#225091]/15 transition-all shadow-2xs cursor-pointer"
                          >
                            <Eye size={13} /> View Invoice
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </TableWrapper>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-500">
              Showing page {purchaseHistoryPage} of {purchaseHistoryTotalPages} ({purchaseHistoryTotal} total orders)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={purchaseHistoryPage <= 1}
                onClick={() => {
                  const newP = purchaseHistoryPage - 1;
                  setPurchaseHistoryPage(newP);
                  fetchPurchaseHistory(newP);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-[#225091] hover:text-[#225091] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-[#225091] px-2">{purchaseHistoryPage}</span>
              <button
                disabled={purchaseHistoryPage >= purchaseHistoryTotalPages}
                onClick={() => {
                  const newP = purchaseHistoryPage + 1;
                  setPurchaseHistoryPage(newP);
                  fetchPurchaseHistory(newP);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-[#225091] hover:text-[#225091] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSFER HISTORY */}
      {activeTab === 'transfers' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Stock Transfer History</h3>
              <p className="text-xs text-gray-500">Audit trail of cards and credits allocated to branches.</p>
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by branch..."
                value={transferSearch}
                onChange={(e) => setTransferSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchTransferHistory(1)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091]"
              />
            </div>
          </div>

          {/* Table */}
          <TableWrapper minHeight="360px">
            <table className="w-full border-collapse min-w-[850px] text-center text-sm whitespace-nowrap">
              <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
                <tr>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">EMI Cards</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Verification Credits</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Branch Balance (After)</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Remarks</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Allocated By</th>
                  <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[13px]">
                {historyLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <RefreshCcw size={20} className="animate-spin mx-auto mb-2 text-[#225091]" />
                      <span className="text-sm font-medium">Loading transfer history...</span>
                    </td>
                  </tr>
                ) : transferHistoryList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500 text-sm font-medium">
                      No stock transfers found.
                    </td>
                  </tr>
                ) : (
                  transferHistoryList.map((tr, idx) => (
                    <tr key={tr.id || tr._id || idx} className="hover:bg-blue-50/25 transition-colors group">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900 text-xs">
                          {tr.branch?.name || tr.branch || 'Branch'}
                        </div>
                        {tr.branch?.code && (
                          <div className="text-[11px] text-gray-400 font-mono">
                            {tr.branch.code}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-blue-600 tabular-nums text-xs whitespace-nowrap">
                        +{tr.emiQuantity || 0}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600 tabular-nums text-xs whitespace-nowrap">
                        +{tr.verificationQuantity || 0}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-600 whitespace-nowrap">
                        <div>EMI: {tr.balanceAfter?.availableEmiCards ?? '-'}</div>
                        <div>Credits: {tr.balanceAfter?.availableVerificationCredits ?? '-'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500 max-w-[200px] truncate">
                        {tr.remarks || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-600 font-medium whitespace-nowrap">
                        {tr.createdBy?.fullName || tr.createdBy?.email || 'Bank Admin'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {tr.createdAt ? new Date(tr.createdAt).toLocaleDateString('en-GB') : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableWrapper>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-500">
              Showing page {transferHistoryPage} of {transferHistoryTotalPages} ({transferHistoryTotal} total transfers)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={transferHistoryPage <= 1}
                onClick={() => {
                  const newP = transferHistoryPage - 1;
                  setTransferHistoryPage(newP);
                  fetchTransferHistory(newP);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-[#225091] hover:text-[#225091] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-[#225091] px-2">{transferHistoryPage}</span>
              <button
                disabled={transferHistoryPage >= transferHistoryTotalPages}
                onClick={() => {
                  const newP = transferHistoryPage + 1;
                  setTransferHistoryPage(newP);
                  fetchTransferHistory(newP);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-[#225091] hover:text-[#225091] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BRANCH WALLET INSPECTOR */}
      {activeTab === 'branchWallet' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#1b2559]">Branch Wallet Inspector</h3>
              <p className="text-xs text-gray-400">View real-time branch balances, card consumptions, and logs</p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700">Select Branch:</label>
              <div className="relative w-64">
                <select
                  value={selectedBranchForInspection}
                  onChange={(e) => {
                    setSelectedBranchForInspection(e.target.value);
                    fetchBranchWalletDetails(e.target.value);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] appearance-none"
                >
                  <option value="">-- Choose a branch --</option>
                  {branches.map((b) => (
                    <option key={b._id || b.id} value={b._id || b.id}>
                      {b.name} ({b.branchCode || b.code || 'BR'})
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {branchWalletLoading ? (
            <div className="py-12 text-center text-gray-400">
              <RefreshCcw size={24} className="animate-spin mx-auto mb-2 text-[#225091]" />
              Loading branch wallet metrics...
            </div>
          ) : !branchWalletData ? (
            <div className="py-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl">
              <Building2 size={36} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Select a branch above to inspect its live cards & credits wallet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Branch metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                  <span className="text-xs font-semibold text-blue-600 block mb-1">Available EMI Cards</span>
                  <span className="text-2xl font-bold text-gray-800">
                    {branchWalletData.wallet?.availableEmiCards ?? 0}
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-1">
                    Total Allocated: {branchWalletData.wallet?.totalEmiCards ?? 0}
                  </span>
                </div>

                <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-100">
                  <span className="text-xs font-semibold text-teal-600 block mb-1">Available Verification Credits</span>
                  <span className="text-2xl font-bold text-gray-800">
                    {branchWalletData.wallet?.availableVerificationCredits ?? 0}
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-1">
                    Total Allocated: {branchWalletData.wallet?.totalVerificationCredits ?? 0}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <span className="text-xs font-semibold text-gray-600 block mb-1">Branch Code</span>
                  <span className="text-xl font-bold text-gray-800 font-mono">
                    {branchWalletData.branch?.code || 'N/A'}
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-1">
                    Status: {branchWalletData.branch?.status || 'ACTIVE'}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <span className="text-xs font-semibold text-gray-600 block mb-1">Branch Name</span>
                  <span className="text-lg font-bold text-gray-800 truncate block">
                    {branchWalletData.branch?.name || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Recent Usages */}
              <div className="border border-gray-100 rounded-xl p-4">
                <h4 className="text-sm font-bold text-[#1b2559] mb-3">Recent Usages & Consumptions at Branch</h4>
                {(!branchWalletData.recentUsages || branchWalletData.recentUsages.length === 0) ? (
                  <p className="text-xs text-gray-400 py-4">No recent consumption logs for this branch.</p>
                ) : (
                  <div className="divide-y divide-gray-100 text-xs">
                    {branchWalletData.recentUsages.map((u, i) => (
                      <div key={u.id || i} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-gray-800">{u.type} consumed ({u.quantity} unit)</span>
                          <div className="text-gray-400 text-[11px]">
                            By: {u.createdBy?.fullName || 'Branch Officer'} • {new Date(u.createdAt).toLocaleString('en-GB')}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-gray-600">Balance: {u.balanceBefore} → {u.balanceAfter}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PURCHASE MODAL */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in duration-200">
          <div className="bg-[#f8f9fc] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border border-gray-100">
            <div className="flex justify-between items-center p-6 pb-4 bg-white border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-[#1b2559]">
                  {paymentStage === 'SUCCESS' ? 'Purchase Completed' : paymentStage !== 'IDLE' ? 'Payment Transaction' : 'Purchase Cards & Credits'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {paymentStage === 'SUCCESS' ? 'Inventory has been credited to your bank wallet' : paymentStage !== 'IDLE' ? 'Secure banking gateway in progress' : 'Order official inventory through Razorpay Gateway'}
                </p>
              </div>
              <button 
                onClick={() => {
                  if (paymentStage === 'INITIATING_ORDER' || paymentStage === 'VERIFYING_SIGNATURE' || paymentStage === 'POLLING_STATUS') {
                    toast.warning("Payment verification is in progress. Please wait.");
                    return;
                  }
                  setIsPurchaseModalOpen(false);
                  setPaymentStage('IDLE');
                }} 
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* SUCCESS STATE */}
            {paymentStage === 'SUCCESS' ? (
              <div className="p-7 flex flex-col items-center text-center space-y-5">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1b2559]">Payment Confirmed & Stock Added!</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm">
                    Your transaction has been securely authorized and verified. New stock is now ready in your Bank inventory.
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="w-full bg-white rounded-xl p-4 border border-emerald-100 shadow-xs space-y-3 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 text-xs">
                    <span className="text-gray-500 font-medium">Invoice Reference:</span>
                    <span className="font-mono font-bold text-[#225091]">{paymentResult?.invoiceNumber || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-medium">Payment ID:</span>
                    <span className="font-mono text-gray-700">{paymentResult?.paymentId || '-'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    <div className="bg-blue-50/70 p-2.5 rounded-lg text-center">
                      <span className="text-[11px] text-[#225091] font-semibold block">EMI Cards Added</span>
                      <span className="text-lg font-bold text-blue-700">+{paymentResult?.emiQty || 0}</span>
                    </div>
                    <div className="bg-emerald-50/70 p-2.5 rounded-lg text-center">
                      <span className="text-[11px] text-emerald-700 font-semibold block">Credits Added</span>
                      <span className="text-lg font-bold text-emerald-700">+{paymentResult?.verQty || 0}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs font-bold text-gray-800">
                    <span>Total Amount Paid:</span>
                    <span className="text-sm text-[#1b2559]">₹{(paymentResult?.amount || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="w-full pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPurchaseModalOpen(false);
                      setPaymentStage('IDLE');
                    }}
                    className="w-full py-3 rounded-xl bg-[#225091] text-white font-semibold hover:bg-[#1b427b] transition-all shadow-sm text-sm cursor-pointer"
                  >
                    Done / View Updated Wallet
                  </button>
                </div>
              </div>
            ) : paymentStage === 'FAILED' ? (
              /* FAILED STATE */
              <div className="p-7 flex flex-col items-center text-center space-y-5">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 shadow-inner">
                  <AlertCircle size={36} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Payment Incomplete</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm">
                    {statusLog || "The payment transaction could not be completed or was cancelled."}
                  </p>
                </div>
                {paymentLink && (
                  <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 flex flex-col gap-1">
                    <span className="font-semibold">Direct payment link is available:</span>
                    <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="font-bold underline text-[#225091] flex items-center justify-center gap-1">
                      <span>Open Checkout Page</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}
                <div className="w-full flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPurchaseModalOpen(false);
                      setPaymentStage('IDLE');
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-100 transition-colors text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStage('IDLE');
                      setStatusLog('');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#225091] text-white font-semibold hover:bg-[#1b427b] transition-all text-sm cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : paymentStage !== 'IDLE' ? (
              /* IN-PROGRESS PAYMENT PROCESSING OVERLAY */
              <div className="p-7 flex flex-col items-center text-center space-y-6">
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                    <Loader2 size={40} className="animate-spin text-[#225091]" />
                  </div>
                  <Lock size={16} className="absolute text-[#225091]" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#1b2559]">Processing Secure Payment</h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {statusLog || "Please complete the transaction in the Razorpay window..."}
                  </p>
                </div>

                {/* 3-Step Live Progress Indicator */}
                <div className="w-full bg-white rounded-xl p-4 border border-gray-200/80 shadow-2xs space-y-3 text-left">
                  {/* Step 1: Order Creation */}
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      paymentStage === 'INITIATING_ORDER'
                        ? 'bg-blue-100 text-[#225091] animate-pulse'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {paymentStage === 'INITIATING_ORDER' ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-800">1. Order Generation</p>
                      <p className="text-[11px] text-gray-400">
                        {paymentStage === 'INITIATING_ORDER' ? 'Initializing secure order with banking server...' : 'Secure Order generated successfully'}
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Payment Authorization */}
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      paymentStage === 'OPENING_GATEWAY' || paymentStage === 'GATEWAY_ACTIVE'
                        ? 'bg-blue-100 text-[#225091] animate-pulse'
                        : paymentStage === 'VERIFYING_SIGNATURE' || paymentStage === 'POLLING_STATUS'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {paymentStage === 'OPENING_GATEWAY' || paymentStage === 'GATEWAY_ACTIVE' ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : paymentStage === 'VERIFYING_SIGNATURE' || paymentStage === 'POLLING_STATUS' ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        '2'
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-800">2. Razorpay Authorization</p>
                      <p className="text-[11px] text-gray-400">
                        {paymentStage === 'OPENING_GATEWAY' || paymentStage === 'GATEWAY_ACTIVE'
                          ? 'Complete UPI/Card/NetBanking in Razorpay popup'
                          : paymentStage === 'VERIFYING_SIGNATURE' || paymentStage === 'POLLING_STATUS'
                          ? 'Payment authorized by user'
                          : 'Waiting for authorization'}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Signature Verification & Ledger Credit */}
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      paymentStage === 'VERIFYING_SIGNATURE' || paymentStage === 'POLLING_STATUS'
                        ? 'bg-blue-100 text-[#225091] animate-pulse'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {paymentStage === 'VERIFYING_SIGNATURE' || paymentStage === 'POLLING_STATUS' ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        '3'
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-800">3. Signature Verification & Stock Allocation</p>
                      <p className="text-[11px] text-gray-400">
                        {paymentStage === 'VERIFYING_SIGNATURE' || paymentStage === 'POLLING_STATUS'
                          ? 'Verifying HMAC signature & crediting Bank inventory...'
                          : 'Awaiting signature verification'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Important Security Notice */}
                <div className="bg-amber-50/80 border border-amber-200/70 rounded-xl p-3 text-left flex items-start gap-2.5">
                  <ShieldCheck size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                    <strong className="font-semibold">Security Note:</strong> Please do not close or refresh this tab while transaction verification is underway.
                  </p>
                </div>

                {paymentLink && (
                  <div className="text-xs text-gray-500 flex items-center gap-1.5 justify-center">
                    <span>Popup closed?</span>
                    <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="text-[#225091] font-semibold underline flex items-center gap-1">
                      <span>Open Direct Checkout Link</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              /* IDLE STATE: STANDARD FORM */
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center gap-6 bg-white p-4 rounded-xl border border-gray-200/80">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={purchaseEmi}
                      onChange={(e) => setPurchaseEmi(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#225091] focus:ring-[#225091]"
                    />
                    <span className="text-sm font-semibold text-gray-700">EMI Cards</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={purchaseVerification}
                      onChange={(e) => setPurchaseVerification(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#225091] focus:ring-[#225091]"
                    />
                    <span className="text-sm font-semibold text-gray-700">Verification Credits</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      EMI Card Quantity
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      value={emiQty}
                      onChange={(e) => setEmiQty(e.target.value)}
                      disabled={!purchaseEmi}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white text-sm disabled:bg-gray-100 disabled:text-gray-400" 
                    />
                    <span className="text-[11px] text-gray-400 block mt-1">
                      {isCalculatingPrice ? 'Calculating...' : (pricingData?.emiCard?.unitPrice ? `Estimated @ ₹${pricingData.emiCard.unitPrice}/card` : 'Enter quantity')}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Verification Credit Qty
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      value={verificationQty}
                      onChange={(e) => setVerificationQty(e.target.value)}
                      disabled={!purchaseVerification}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white text-sm disabled:bg-gray-100 disabled:text-gray-400" 
                    />
                    <span className="text-[11px] text-gray-400 block mt-1">
                      {isCalculatingPrice ? 'Calculating...' : (pricingData?.verificationCredit?.unitPrice ? `Estimated @ ₹${pricingData.verificationCredit.unitPrice}/credit` : 'Enter quantity')}
                    </span>
                  </div>
                </div>

                {/* Price Breakdown Calculation Card */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-2.5 relative">
                  {isCalculatingPrice && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
                      <RefreshCcw size={20} className="animate-spin text-[#225091]" />
                    </div>
                  )}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-1">
                    <h3 className="font-bold text-[#1b2559] text-sm flex items-center gap-1.5">
                      <Receipt size={16} className="text-[#225091]" />
                      Estimated Price Breakdown
                    </h3>
                    <span className="text-[11px] bg-teal-50 text-[#225091] font-semibold px-2 py-0.5 rounded">
                      Total Amount Includes Applicable Taxes
                    </span>
                  </div>
                  
                  {purchaseEmi && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">EMI Cards ({pricingData?.emiCard?.quantity || 0} Qty)</span>
                      <span className="font-medium text-gray-800">₹{(pricingData?.emiCard?.totalPrice || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {purchaseVerification && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Verification Credits ({pricingData?.verificationCredit?.quantity || 0} Qty)</span>
                      <span className="font-medium text-gray-800">₹{(pricingData?.verificationCredit?.totalPrice || 0).toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xs pt-1 border-t border-gray-100">
                    <span className="text-gray-600 font-semibold">Subtotal</span>
                    <span className="font-semibold text-gray-800">₹{(pricingData?.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-baseline pt-2 border-t border-gray-100 mt-2">
                    <span className="font-bold text-gray-800 text-sm">Estimated Total Payable</span>
                    <span className="font-bold text-[#1b2559] text-xl">₹{(pricingData?.totalPayableAmount || 0).toLocaleString()}</span>
                  </div>
                </div>

                {paymentLink && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col gap-1.5">
                    <span className="text-xs text-emerald-600 font-medium">If popup didn't open, use this link:</span>
                    <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-emerald-700 underline">
                      Open Payment Page →
                    </a>
                  </div>
                )}
                {statusLog && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-600 font-mono text-center">
                    {statusLog}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsPurchaseModalOpen(false)} 
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-100 transition-colors text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    disabled={submittingPurchase || (!purchaseEmi && !purchaseVerification) || isCalculatingPrice || polling}
                    onClick={handleInitiatePurchase} 
                    className="px-6 py-2.5 rounded-xl bg-[#225091] text-white font-semibold hover:bg-[#168f94] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm text-sm flex items-center gap-2 cursor-pointer"
                  >
                    {submittingPurchase || polling ? (
                      <>
                        <RefreshCcw size={16} className="animate-spin" />
                        <span>{polling ? 'Verifying...' : 'Processing...'}</span>
                      </>
                    ) : (
                      <span>Proceed to Pay ₹{(pricingData?.totalPayableAmount || 0).toLocaleString()}</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DISTRIBUTE / TRANSFER MODAL */}
      {isDistributeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in duration-200">
          <div className="bg-[#f8f9fc] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border border-gray-100">
            <div className="flex justify-between items-center p-6 pb-4 bg-white border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-[#1b2559]">Distribute / Allocate Stock</h2>
                <p className="text-xs text-gray-500 mt-0.5">Transfer cards & credits from Bank inventory to branch</p>
              </div>
              <button 
                onClick={() => setIsDistributeModalOpen(false)} 
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Bank Inventory Reference Card */}
              <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-gray-700 block">Bank Available Inventory</span>
                  <div className="text-teal-800 font-bold mt-0.5 flex gap-3">
                    <span>EMI Cards: {walletMetrics?.emiCards?.available ?? 0}</span>
                    <span>Credits: {walletMetrics?.verificationCredits?.available ?? 0}</span>
                  </div>
                </div>
                <Building2 size={24} className="text-[#225091]" />
              </div>

              {/* Target Branch Selection */}
              <div>
                <label className="block text-xs font-bold text-[#1b2559] mb-1.5">
                  Target Branch <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={targetBranchId}
                    onChange={(e) => setTargetBranchId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white text-sm text-gray-700 appearance-none font-medium"
                  >
                    <option value="">-- Select Target Branch --</option>
                    {branches.map((b) => (
                      <option key={b._id || b.id} value={b._id || b.id}>
                        {b.name} ({b.branchCode || b.code || 'BR'})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Quantities */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1b2559] mb-1.5">EMI Cards to Allocate</label>
                  <input 
                    type="number" 
                    min="0"
                    max={walletMetrics?.emiCards?.available || 0}
                    placeholder="Enter quantity"
                    value={distributeEmiQty}
                    onChange={(e) => setDistributeEmiQty(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white text-sm" 
                  />
                  <span className="text-[11px] text-gray-400 block mt-1">
                    Max: {walletMetrics?.emiCards?.available || 0}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1b2559] mb-1.5">Verification Credits</label>
                  <input 
                    type="number" 
                    min="0"
                    max={walletMetrics?.verificationCredits?.available || 0}
                    placeholder="Enter quantity"
                    value={distributeVerificationQty}
                    onChange={(e) => setDistributeVerificationQty(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white text-sm" 
                  />
                  <span className="text-[11px] text-gray-400 block mt-1">
                    Max: {walletMetrics?.verificationCredits?.available || 0}
                  </span>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-[#1b2559] mb-1.5">Remarks / Purpose (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Monthly branch allocation, initial batch..."
                  value={transferRemarks}
                  onChange={(e) => setTransferRemarks(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225091]/20 focus:border-[#225091] transition-all bg-white text-sm" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/80">
                <button 
                  type="button"
                  onClick={() => setIsDistributeModalOpen(false)} 
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-100 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  disabled={submittingTransfer || !targetBranchId}
                  onClick={handleTransferStock} 
                  className="px-6 py-2.5 rounded-xl bg-[#225091] text-white font-semibold hover:bg-[#168f94] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm text-sm flex items-center gap-2"
                >
                  {submittingTransfer ? (
                    <>
                      <RefreshCcw size={16} className="animate-spin" />
                      <span>Allocating Stock...</span>
                    </>
                  ) : (
                    <span>Allocate to Branch</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW ORDER INVOICE MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border border-gray-100">
            <div className="flex justify-between items-center p-6 pb-4 bg-gray-50/60 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#225091] flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1b2559]">Purchase Invoice Details</h2>
                  <p className="text-xs text-gray-400 font-mono">{selectedOrderDetails.orderId || selectedOrderDetails.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrderDetails(null)} 
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                <div>
                  <span className="text-xs text-gray-500 block">Invoice Number</span>
                  <span className="font-semibold text-gray-800 font-mono text-xs">{selectedOrderDetails.invoiceNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Transaction ID</span>
                  <span className="font-semibold text-gray-800 font-mono text-xs">{selectedOrderDetails.transactionId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Payment Method</span>
                  <span className="font-semibold text-gray-800">{selectedOrderDetails.paymentMethod || 'EASEBUZZ'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Payment Status</span>
                  <span className="font-bold text-emerald-600">{selectedOrderDetails.paymentStatus || 'SUCCESS'}</span>
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>EMI Cards ({selectedOrderDetails.emiQuantity || 0} Qty @ ₹{selectedOrderDetails.emiRate || 499})</span>
                  <span>₹{((selectedOrderDetails.emiQuantity || 0) * (selectedOrderDetails.emiRate || 499)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Verification Credits ({selectedOrderDetails.verificationQuantity || 0} Qty @ ₹{selectedOrderDetails.verificationRate || 50})</span>
                  <span>₹{((selectedOrderDetails.verificationQuantity || 0) * (selectedOrderDetails.verificationRate || 50)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 pt-1 border-t border-gray-100">
                  <span>Subtotal</span>
                  <span>₹{(selectedOrderDetails.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>CGST (9%)</span>
                  <span>+ ₹{(selectedOrderDetails.cgst || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>SGST (9%)</span>
                  <span>+ ₹{(selectedOrderDetails.sgst || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-[#1b2559] pt-2 border-t border-gray-100">
                  <span>Total Amount Paid</span>
                  <span>₹{(selectedOrderDetails.total || selectedOrderDetails.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-6 py-2.5 rounded-xl bg-[#225091] text-white font-semibold hover:bg-[#168f94] transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardsAndCredit;
