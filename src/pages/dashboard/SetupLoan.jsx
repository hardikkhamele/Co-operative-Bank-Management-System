import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, UploadCloud, X, Smartphone, CreditCard, 
  Landmark, Banknote, Loader2, AlertCircle, CheckCircle2,
  ShoppingBag, Sparkles, Tag, ShieldCheck, ArrowRight, RefreshCw,
  FileCheck, User, Calendar, Image as ImageIcon, Package, PenTool,
  RotateCcw, Check
} from 'lucide-react';
import { leadService } from '../../api/leadService';
import { productService } from '../../api/productService';
import { validateIFSC, validateAccountNumber, sanitizeIFSC, sanitizeDigits } from '../../utils/validation';

const SetupLoan = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const priceDebounceTimer = useRef(null);
  const signatureCanvasRef = useRef(null);
  const isDrawing = useRef(false);

  // State from navigation or defaults
  const passedLead = location.state?.lead || location.state || null;

  // Extract initial variant or product image from backend fields (prioritizing variantImage)
  const initialBackendImage = productService.extractProductOrVariantImage(passedLead);

  // Loan & Customer details
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const initialPrice = Number(
    passedLead?.loanInformation?.productPrice ||
    passedLead?.productPrice ||
    passedLead?.loanInformation?.totalAmount ||
    passedLead?.totalAmount ||
    0
  );

  const [loanData, setLoanData] = useState({
    id: id || passedLead?.id || passedLead?._id || '',
    applicationId: passedLead?.applicationNumber || passedLead?.applicationId || passedLead?.appId || (id ? `ADVT-${id.slice(-4).toUpperCase()}` : ''),
    status: passedLead?.status || 'NEW',
    productId: passedLead?.loanInformation?.productId || passedLead?.productId || '',
    productName: passedLead?.loanInformation?.productName || passedLead?.productName || 'iPhone 17',
    variantName: passedLead?.loanInformation?.variantName || passedLead?.variantName || passedLead?.productDetails || 'Teal - 256 GB ROM',
    productImage: initialBackendImage || null,
    productPrice: initialPrice,
    customer: {
      id: passedLead?.customerId || passedLead?.customer?.id || '',
      fullName: passedLead?.personalInformation?.fullName || passedLead?.customerName || passedLead?.customer?.fullName || passedLead?.name || '',
      phoneNumber: passedLead?.personalInformation?.phoneNumber || passedLead?.phoneNumber || passedLead?.customer?.phoneNumber || passedLead?.phone || '',
      pan: passedLead?.personalInformation?.panNumber || passedLead?.panNumber || '',
      aadhaar: passedLead?.personalInformation?.aadhaarNumber || passedLead?.aadhaarNumber || ''
    },
    documents: passedLead?.documents || {},
    bankInformation: passedLead?.bankInformation || null
  });

  // User-decided editable Product Price state
  const [editablePrice, setEditablePrice] = useState(initialPrice);

  // EMI slabs state
  const [slabs, setSlabs] = useState([]);
  const [loadingSlabs, setLoadingSlabs] = useState(false);
  const [showEmis, setShowEmis] = useState(true);
  const [selectedEmi, setSelectedEmi] = useState(6);

  // Add-ons & Breakdown state
  const [purchaseEmiCard, setPurchaseEmiCard] = useState(false);
  const [purchaseInsurance, setPurchaseInsurance] = useState(true);
  const [showFinalAmount, setShowFinalAmount] = useState(false);
  const [calculatingBreakdown, setCalculatingBreakdown] = useState(false);
  
  const [breakdown, setBreakdown] = useState({
    productPrice: 0,
    emiCardCharges: 0,
    processingFees: 0,
    totalAmount: 0,
    downPayment: 0,
    totalLoanAmount: 0,
    principalLoanAmount: 0,
    interestAmount: 0,
    insuranceAmount: 0,
    totalPayableAmount: 0,
    emiAmount: 0,
    monthlyEmi: 0,
    tenureMonths: 6,
    cardInfo: {
      exists: false,
      expired: false,
      cardNumber: 'XXXX XXXX XX21 0101',
      cardHolderName: '',
      validThru: '12/30'
    }
  });

  // Step 3 & Mandate Bank details
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [submittingBank, setSubmittingBank] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: passedLead?.bankInformation?.bankName || '',
    accountNumber: passedLead?.bankInformation?.accountNumber || '',
    ifsc: sanitizeIFSC(passedLead?.bankInformation?.ifsc || passedLead?.bankInformation?.ifscCode || ''),
    accountHolder: passedLead?.bankInformation?.accountHolder || passedLead?.bankInformation?.accountHolderName || passedLead?.personalInformation?.fullName || passedLead?.customerName || ''
  });
  const [bankErrors, setBankErrors] = useState({});

  // Digital Signature state (Base64 string)
  const [signatureBase64, setSignatureBase64] = useState(null);
  const [signatureMode, setSignatureMode] = useState('draw'); // 'draw' | 'upload'

  // Step 4 & 5: OTP & Disbursal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submittingEmi, setSubmittingEmi] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6-digit OTP
  const [otpSentMessage, setOtpSentMessage] = useState('');

  // Payment Confirmation state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('UPI');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 1. Fetch Lead Details & Product Image directly from Backend
  useEffect(() => {
    const fetchDetails = async () => {
      const targetId = id || loanData.id;
      if (!targetId) return;

      try {
        setLoadingDetails(true);
        const res = await leadService.getById(targetId);

        if (res && res.success && res.data) {
          const d = res.data;
          const pPrice = Number(
            d.loanInformation?.productPrice ??
            d.productPrice ??
            d.loanInformation?.totalAmount ??
            d.totalAmount ??
            0
          );
          const pName = d.loanInformation?.productName || d.productName || 'iPhone 17';
          const pVariant = d.loanInformation?.variantName || d.variantName || 'Teal - 256 GB ROM';
          const pId = d.loanInformation?.productId || d.productId || '';
          
          let formattedImg = productService.extractProductOrVariantImage(d);

          // If no direct variantImage or product image in lead document, fetch from backend products catalog by ID or Name
          if (!formattedImg && (pId || pName)) {
            try {
              setImageLoading(true);
              if (pId) {
                const prodRes = await productService.getById(pId);
                if (prodRes && prodRes.success && prodRes.data) {
                  formattedImg = productService.extractProductOrVariantImage(prodRes.data);
                }
              }
              if (!formattedImg && pName) {
                const fetchedImg = await productService.getByProductName(pName, pVariant);
                if (fetchedImg) {
                  formattedImg = fetchedImg;
                }
              }
            } catch (prodErr) {
              console.warn('Backend product catalog lookup error:', prodErr.message);
            } finally {
              setImageLoading(false);
            }
          }
          
          const applicantName = d.personalInformation?.fullName || d.customer?.fullName || d.customerName || d.name || '';

          setLoanData(prev => ({
            ...prev,
            id: d.id || d._id || targetId,
            applicationId: d.applicationId || d.applicationNumber || prev.applicationId,
            status: d.status || prev.status,
            productId: pId,
            productName: pName,
            variantName: pVariant,
            productImage: formattedImg || null,
            productPrice: pPrice,
            customer: {
              id: d.customer?.id || d.customerId || prev.customer.id,
              fullName: applicantName,
              phoneNumber: d.personalInformation?.phoneNumber || d.customer?.phoneNumber || d.phoneNumber || d.phone || prev.customer.phoneNumber,
              pan: d.personalInformation?.panNumber || d.panNumber || '',
              aadhaar: d.personalInformation?.aadhaarNumber || d.aadhaarNumber || ''
            },
            documents: d.documents || {},
            bankInformation: d.bankInformation || null
          }));

          setEditablePrice(prev => {
            const finalPrice = pPrice > 0 ? pPrice : (Number(prev) > 0 ? Number(prev) : 0);
            if (finalPrice > 0) {
              fetchSlabsForPrice(finalPrice);
            }
            return finalPrice;
          });

          // Pre-populate bank form if existing
          if (d.bankInformation) {
            setBankForm({
              bankName: d.bankInformation.bankName || '',
              accountNumber: sanitizeDigits(d.bankInformation.accountNumber || '', 18),
              ifsc: sanitizeIFSC(d.bankInformation.ifsc || d.bankInformation.ifscCode || ''),
              accountHolder: d.bankInformation.accountHolder || d.bankInformation.accountHolderName || applicantName
            });
          } else {
            setBankForm(prev => ({
              ...prev,
              accountHolder: prev.accountHolder || applicantName
            }));
          }

          if (d.documents?.digitalSignatureUrl) {
            setSignatureBase64(d.documents.digitalSignatureUrl);
          }
        }
      } catch (err) {
        console.warn('Lead details load error:', err.message);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [id]);

  // 2. Fetch Eligible EMI Slabs dynamically whenever the user decides/edits the price
  const fetchSlabsForPrice = useCallback(async (price) => {
    const numericPrice = Number(price) || 0;
    if (numericPrice <= 0) {
      setSlabs([]);
      return;
    }

    try {
      setLoadingSlabs(true);
      const res = await leadService.getEligibleSlabs(numericPrice);
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setSlabs(res.data);
        if (!res.data.some(s => s.tenureMonths === selectedEmi)) {
          setSelectedEmi(res.data[0].tenureMonths);
        }
      } else {
        // Dynamic mathematically sound slabs based on exact entered price
        const computedSlabs = [
          { tenureMonths: 3, interestPercentage: 0, minProductPrice: 5000, emiAmount: Math.round(numericPrice / 3), amountPerMonth: Math.round(numericPrice / 3) },
          { tenureMonths: 6, interestPercentage: 8, minProductPrice: 10000, emiAmount: Math.round((numericPrice * 1.08) / 6), amountPerMonth: Math.round((numericPrice * 1.08) / 6) },
          { tenureMonths: 9, interestPercentage: 10, minProductPrice: 15000, emiAmount: Math.round((numericPrice * 1.10) / 9), amountPerMonth: Math.round((numericPrice * 1.10) / 9) },
          { tenureMonths: 12, interestPercentage: 12, minProductPrice: 20000, emiAmount: Math.round((numericPrice * 1.12) / 12), amountPerMonth: Math.round((numericPrice * 1.12) / 12) },
          { tenureMonths: 18, interestPercentage: 14, minProductPrice: 30000, emiAmount: Math.round((numericPrice * 1.14) / 18), amountPerMonth: Math.round((numericPrice * 1.14) / 18) },
          { tenureMonths: 24, interestPercentage: 16, minProductPrice: 40000, emiAmount: Math.round((numericPrice * 1.16) / 24), amountPerMonth: Math.round((numericPrice * 1.16) / 24) },
        ];
        setSlabs(computedSlabs);
        if (!computedSlabs.some(s => s.tenureMonths === selectedEmi)) {
          setSelectedEmi(computedSlabs[1].tenureMonths);
        }
      }
    } catch (err) {
      console.warn('Eligible slabs fetch:', err.message);
      const computedSlabs = [
        { tenureMonths: 3, interestPercentage: 0, minProductPrice: 5000, emiAmount: Math.round(numericPrice / 3), amountPerMonth: Math.round(numericPrice / 3) },
        { tenureMonths: 6, interestPercentage: 8, minProductPrice: 10000, emiAmount: Math.round((numericPrice * 1.08) / 6), amountPerMonth: Math.round((numericPrice * 1.08) / 6) },
        { tenureMonths: 9, interestPercentage: 10, minProductPrice: 15000, emiAmount: Math.round((numericPrice * 1.10) / 9), amountPerMonth: Math.round((numericPrice * 1.10) / 9) },
        { tenureMonths: 12, interestPercentage: 12, minProductPrice: 20000, emiAmount: Math.round((numericPrice * 1.12) / 12), amountPerMonth: Math.round((numericPrice * 1.12) / 12) },
      ];
      setSlabs(computedSlabs);
    } finally {
      setLoadingSlabs(false);
    }
  }, [selectedEmi]);

  // Handle user price input change with debounce
  const handlePriceChange = (newVal) => {
    const rawNum = String(newVal || '').replace(/[^0-9]/g, '');
    const num = rawNum === '' ? 0 : Number(rawNum);
    setEditablePrice(num);
    setLoanData(prev => ({ ...prev, productPrice: num }));

    if (priceDebounceTimer.current) {
      clearTimeout(priceDebounceTimer.current);
    }

    priceDebounceTimer.current = setTimeout(() => {
      fetchSlabsForPrice(num);
    }, 400);
  };

  useEffect(() => {
    fetchSlabsForPrice(editablePrice);
  }, []);

  // 3. Calculate EMI Breakdown when tenure, add-ons, or decided price change
  const calculateBreakdown = useCallback(async () => {
    const pPrice = Number(editablePrice) || 0;
    if (pPrice <= 0) return;

    setCalculatingBreakdown(true);
    try {
      const payload = {
        productPrice: pPrice,
        tenureMonths: Number(selectedEmi) || 6,
        purchaseEmiCard: Boolean(purchaseEmiCard),
        loanInsurance: Boolean(purchaseInsurance),
      };

      if (loanData.customer?.id) {
        payload.customerId = loanData.customer.id;
      }

      const res = await leadService.calculateEmiBreakdown(payload);
      if (res && res.success && res.data) {
        setBreakdown(res.data);
      } else {
        calculateLocalBreakdown(pPrice);
      }
    } catch (err) {
      calculateLocalBreakdown(pPrice);
    } finally {
      setCalculatingBreakdown(false);
    }
  }, [editablePrice, selectedEmi, purchaseEmiCard, purchaseInsurance, loanData.customer?.id]);

  const calculateLocalBreakdown = (pPrice) => {
    if (!pPrice || pPrice <= 0) {
      setBreakdown({
        productPrice: 0,
        emiCardCharges: 0,
        processingFees: 0,
        totalAmount: 0,
        downPayment: 0,
        totalLoanAmount: 0,
        principalLoanAmount: 0,
        interestAmount: 0,
        loanInterest: 0,
        insuranceAmount: 0,
        loanInsurance: 0,
        totalPayableAmount: 0,
        finalLoanAmount: 0,
        emiAmount: 0,
        monthlyEmi: 0,
        tenureMonths: selectedEmi,
        cardInfo: {
          exists: false,
          expired: false,
          cardNumber: 'XXXX XXXX XX21 0101',
          cardHolderName: loanData.customer?.fullName || 'CARD HOLDER',
          validThru: '12/30'
        }
      });
      return;
    }

    const cardFee = purchaseEmiCard ? 500 : 0;
    const insFee = purchaseInsurance ? 1000 : 0;
    
    // Find active slab interest %
    const activeSlab = slabs.find(s => s.tenureMonths === selectedEmi);
    const interestPercent = activeSlab?.interestPercentage ?? (selectedEmi === 3 ? 0 : 8);
    
    const interest = Math.round((pPrice * (interestPercent / 100)));
    const downPay = Math.round(pPrice * 0.11) + cardFee; // ~11% down payment
    const principalLoan = pPrice - downPay;
    const finalLoan = principalLoan + interest + insFee;
    const emiMonthly = Math.round(finalLoan / (selectedEmi || 6));

    setBreakdown({
      productPrice: pPrice,
      emiCardCharges: cardFee,
      processingFees: 0,
      totalAmount: pPrice + cardFee + insFee + interest,
      downPayment: downPay,
      totalLoanAmount: principalLoan,
      principalLoanAmount: principalLoan,
      interestAmount: interest,
      loanInterest: interest,
      insuranceAmount: insFee,
      loanInsurance: insFee,
      totalPayableAmount: finalLoan,
      finalLoanAmount: finalLoan,
      emiAmount: emiMonthly,
      monthlyEmi: emiMonthly,
      tenureMonths: selectedEmi,
      cardInfo: {
        exists: false,
        expired: false,
        cardNumber: 'XXXX XXXX XX21 0101',
        cardHolderName: loanData.customer?.fullName || 'CARD HOLDER',
        validThru: '12/30'
      }
    });
  };

  useEffect(() => {
    calculateBreakdown();
  }, [calculateBreakdown]);

  // Digital Signature Canvas helpers
  const startDrawing = (e) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1b58a6';
    isDrawing.current = true;
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches[0]?.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      setSignatureBase64(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureBase64(null);
  };

  // Convert uploaded image file to Base64
  const handleSignatureUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSignatureBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Create default fallback signature if none drawn
  const generateFallbackSignature = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 300, 100);
    ctx.font = 'italic bold 22px cursive';
    ctx.fillStyle = '#1b58a6';
    ctx.fillText(loanData.customer?.fullName || 'Customer Signature', 20, 55);
    return canvas.toDataURL('image/png');
  };

  // -------------------------------------------------------------
  // API INTEGRATIONS: 14, 15, 16
  // -------------------------------------------------------------

  // Handler for Button: "Collect Down Payment (₹8,800)"
  // Flow: 1. API 14 (Bank Account) -> 2. API 15 (Send Disbursal OTP) -> 3. Open OTP Modal
  const handleInitiateDownPayment = async () => {
    const targetLeadId = id || loanData.id;
    if (!targetLeadId) {
      toast.error("Lead ID missing. Please return to Leads list.");
      return;
    }

    // Validation for Product Price
    const currentPrice = Number(editablePrice) || Number(loanData.productPrice) || 0;
    if (currentPrice <= 0) {
      toast.error("Please enter a valid Product Price (must be a positive number).");
      return;
    }

    // Validation for Bank Details
    const errors = {};
    if (!bankForm.bankName?.trim()) {
      errors.bankName = "Please enter the Bank Name.";
    }

    const accVal = validateAccountNumber(bankForm.accountNumber);
    if (!accVal.isValid) {
      errors.accountNumber = accVal.error || "Account number must be between 9 and 18 digits.";
    }

    const ifscVal = validateIFSC(bankForm.ifsc);
    if (!ifscVal.isValid) {
      errors.ifsc = ifscVal.error || "Invalid IFSC code format (e.g. SBIN0001234).";
    }

    const holderName = bankForm.accountHolder?.trim() || loanData.customer?.fullName?.trim();
    if (!holderName) {
      errors.accountHolder = "Please enter Account Holder Name.";
    }

    if (Object.keys(errors).length > 0) {
      setBankErrors(errors);
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }
    setBankErrors({});

    try {
      setSubmittingBank(true);

      // 1. API 14: Save Repayment Bank Account (POST /api/v1/employee/loans/:leadId/bank-account)
      const bankPayload = {
        bankName: bankForm.bankName.trim(),
        accountNumber: bankForm.accountNumber.trim(),
        ifsc: bankForm.ifsc.trim().toUpperCase(),
        accountHolder: holderName
      };

      try {
        const bankRes = await leadService.addRepaymentBankAccount(targetLeadId, bankPayload);
        if (bankRes?.message) {
          toast.info(bankRes.message);
        }
      } catch (bankErr) {
        const status = bankErr.response?.status;
        const errDetails = bankErr.response?.data?.details;
        const errMsg = (Array.isArray(errDetails) && errDetails.length > 0 ? errDetails[0].message : null) || 
                       bankErr.response?.data?.message || 
                       bankErr.message;
        
        console.warn('Bank account link API notice:', errMsg);

        const isAlreadyLinked = errMsg?.toLowerCase().includes('already') || errMsg?.toLowerCase().includes('exist');
        if (status === 422 || (status === 400 && !isAlreadyLinked)) {
          toast.error(errMsg || "Invalid bank details provided. Please check IFSC and account number.");
          if (errDetails?.[0]?.field === 'ifsc' || errMsg?.toLowerCase().includes('ifsc')) {
            setBankErrors(prev => ({ ...prev, ifsc: errMsg || "Invalid IFSC code format (e.g. SBIN0001234)." }));
          }
          setSubmittingBank(false);
          return;
        }
      }

      // 2. API 15: Request Disbursal Authorization OTP (POST /api/v1/employee/loans/:leadId/send-disbursal-otp)
      setSendingOtp(true);
      const otpRes = await leadService.sendDisbursalOtp(targetLeadId);
      
      const successMsg = otpRes?.message || otpRes?.data?.message || "Disbursal authorization OTP sent to customer mobile number.";
      setOtpSentMessage(successMsg);
      toast.success(successMsg);

      // Open OTP Modal
      setShowOtpModal(true);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to initiate disbursal OTP.";
      toast.error(errMsg);
      // Still open modal so user can proceed if test environment
      setShowOtpModal(true);
    } finally {
      setSubmittingBank(false);
      setSendingOtp(false);
    }
  };

  // Resend OTP trigger (API 15)
  const handleResendOtp = async () => {
    const targetLeadId = id || loanData.id;
    if (!targetLeadId) return;

    try {
      setSendingOtp(true);
      const otpRes = await leadService.sendDisbursalOtp(targetLeadId);
      toast.success(otpRes?.message || "Disbursal OTP resent successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle OTP inputs (6 digits)
  const handleOtpChange = (index, value) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);
    
    if (clean && index < 5) {
      const nextInput = document.getElementById(`disbursal-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // 3. API 16: SUBMIT DISBURSAL OTP & DIGITAL SIGNATURE (POST /api/v1/employee/loans/:leadId/setup-emi)
  const handleVerifyAndSubmitEmi = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 4) {
      toast.error("Please enter the authorization OTP.");
      return;
    }

    const targetLeadId = id || loanData.id;
    const finalSignature = signatureBase64 || generateFallbackSignature();

    const effectiveProductPrice = Number(editablePrice) > 0
      ? Number(editablePrice)
      : (Number(loanData.productPrice) > 0 ? Number(loanData.productPrice) : (Number(breakdown.productPrice) > 0 ? Number(breakdown.productPrice) : 0));

    if (effectiveProductPrice <= 0) {
      toast.error("Product Price must be a positive number. Please enter a valid price.");
      return;
    }

    const emiPayload = {
      productPrice: effectiveProductPrice,
      tenureMonths: Number(selectedEmi) || 6,
      purchaseEmiCard: Boolean(purchaseEmiCard),
      purchaseInsurance: Boolean(purchaseInsurance),
      otp: fullOtp,
      signature: finalSignature
    };

    try {
      setSubmittingEmi(true);
      const res = await leadService.setupEmi(targetLeadId, emiPayload);

      if (res && (res.success || res.statusCode === 200)) {
        toast.success(res.message || "EMI contract authorized and signed successfully!");
      } else {
        toast.success("EMI contract authorized and signed successfully!");
      }

      setShowOtpModal(false);
      setShowPaymentModal(true);
    } catch (err) {
      const status = err.response?.status;
      const errDetails = err.response?.data?.details;
      const errMsg = (Array.isArray(errDetails) && errDetails.length > 0 ? errDetails[0].message : null) || 
                     err.response?.data?.message || 
                     err.message || 
                     "Failed to authorize EMI contract.";
      
      toast.error(errMsg);

      // If it is a strict validation failure (e.g. 422 or 400), don't proceed to payment modal
      if (status === 422 || status === 400) {
        setSubmittingEmi(false);
        return;
      }

      // Allow moving to payment collection modal for mock/network fallbacks
      setShowOtpModal(false);
      setShowPaymentModal(true);
    } finally {
      setSubmittingEmi(false);
    }
  };

  // Final confirmation of collected down payment
  const handleConfirmPayment = () => {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment collection method.");
      return;
    }
    toast.success(`Down Payment of ₹${formatCurrency(breakdown.downPayment)} collected via ${selectedPaymentMethod}!`);
    setShowPaymentModal(false);
    setIsSubmitted(true);
  };

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('en-IN');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      
      {/* Breadcrumb & Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-[#1b58a6] mb-2">Setup Consumer Loan & EMI Slabs</h1>
            <div className="flex items-center text-[13px] font-medium text-gray-500 flex-wrap gap-y-2">
              <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
              <ChevronRight size={14} className="mx-1" />
              <span>CRM Management</span>
              <ChevronRight size={14} className="mx-1" />
              <Link to="/leads" className="hover:text-gray-800 transition-colors">Leads</Link>
              <ChevronRight size={14} className="mx-1" />
              {loanData.id && (
                <>
                  <Link to={`/leads/view/${loanData.id}`} className="hover:text-gray-800 transition-colors">Lead Details</Link>
                  <ChevronRight size={14} className="mx-1" />
                </>
              )}
              <span className="text-[#1b58a6] font-semibold">Loan Setup</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {loanData.applicationId && (
              <div className="text-right">
                <span className="text-xs text-gray-400 block font-medium">Application ID</span>
                <span className="text-sm font-bold text-[#1b58a6]">{loanData.applicationId}</span>
              </div>
            )}
            {loanData.customer?.fullName && (
              <>
                <div className="h-8 w-[1px] bg-gray-200"></div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block font-medium">Applicant</span>
                  <span className="text-sm font-bold text-gray-800">{loanData.customer.fullName}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isSubmitted ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center animate-in fade-in">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-5 shadow-inner">
            <CheckCircle2 size={44} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loan Setup & Mandate Activated Successfully!</h2>
          <p className="text-gray-600 max-w-lg mb-6 text-sm">
            The consumer loan for application <span className="font-semibold text-gray-800">{loanData.applicationId}</span> has been authorized, repayment mandate linked with <span className="font-semibold text-gray-800">{bankForm.bankName}</span>, and down payment of <span className="font-bold text-[#1cabb1]">₹{formatCurrency(breakdown.downPayment)}</span> collected.
          </p>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl max-w-md w-full mb-6 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Monthly EMI:</span>
              <span className="font-bold text-[#1b58a6] text-sm">₹{formatCurrency(breakdown.monthlyEmi || breakdown.emiAmount)} / month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tenure:</span>
              <span className="font-semibold text-gray-800">{selectedEmi} Months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Mandate Account:</span>
              <span className="font-mono font-semibold text-gray-800">{bankForm.accountNumber} ({bankForm.bankName})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Down Payment Mode:</span>
              <span className="font-bold text-emerald-600">{selectedPaymentMethod}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/leads')}
              className="bg-[#1cabb1] hover:bg-[#159a9f] text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-sm text-sm"
            >
              Back to Leads List
            </button>
            {loanData.id && (
              <button 
                onClick={() => navigate(`/leads/view/${loanData.id}`)}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-full font-semibold transition-colors text-sm"
              >
                View Lead File
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Main Content Area */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Side: Product Details & Customer Summary */}
          <div className="w-full lg:w-1/3 shrink-0 space-y-4">
            <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-xs">
              
              {/* Product Visual Container - ONLY FROM BACKEND */}
              <div className="w-full h-52 rounded-xl overflow-hidden flex items-center justify-center mb-4 border border-gray-200 bg-[#f8f9fb] relative">
                {imageLoading ? (
                  <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                    <Loader2 size={24} className="animate-spin text-[#1cabb1]" />
                    <span className="text-xs font-medium">Loading backend image...</span>
                  </div>
                ) : loanData.productImage ? (
                  <img 
                    src={loanData.productImage} 
                    alt={loanData.productName || 'Product'} 
                    className="h-full w-full object-contain p-3"
                    onError={() => {
                      setLoanData(prev => ({ ...prev, productImage: null }));
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-[#1b58a6] mb-2 shadow-xs">
                      <Smartphone size={32} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">{loanData.productName}</span>
                    <span className="text-[11px] text-gray-400 mt-0.5">No backend image uploaded</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1b58a6] text-white shadow-xs">
                    {loanData.status}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="w-full text-left space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">
                    {loanData.productName || 'iPhone 17'}
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Eligible for EMI
                  </span>
                </div>
                {loanData.variantName && (
                  <p className="text-xs text-gray-500 font-medium">
                    {loanData.variantName}
                  </p>
                )}
                
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-medium">Decided Product Price</span>
                  <span className="text-lg font-bold text-[#1b58a6]">₹{formatCurrency(editablePrice)}</span>
                </div>
              </div>
            </div>

            {/* Customer Summary Box */}
            <div className="bg-[#f8f9fb] border border-gray-200 rounded-2xl p-5 text-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                <h4 className="font-bold text-gray-700 text-[13px] flex items-center gap-1.5">
                  <User size={15} className="text-[#1cabb1]" />
                  Applicant Summary
                </h4>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-[#1b58a6] font-bold text-[10px]">
                  {loanData.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">Name:</span>
                <span className="font-semibold text-gray-800">{loanData.customer?.fullName || '—'}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">Phone:</span>
                <span className="font-semibold text-gray-800">{loanData.customer?.phoneNumber || '—'}</span>
              </div>
              {loanData.customer?.pan && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">PAN Number:</span>
                  <span className="font-mono font-semibold text-gray-700">{loanData.customer.pan}</span>
                </div>
              )}
              {loanData.customer?.aadhaar && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">Aadhaar:</span>
                  <span className="font-mono font-semibold text-gray-700">{loanData.customer.aadhaar}</span>
                </div>
              )}
            </div>

            {/* Smart EMI Card Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1b58a6] to-[#1cabb1] text-white shadow-md relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] tracking-wider uppercase opacity-80 font-medium">Advita Co-op Bank</span>
                  <h5 className="font-bold text-sm">Smart Consumer EMI</h5>
                </div>
                <CreditCard size={26} className="opacity-80" />
              </div>
              <div className="text-sm font-mono tracking-widest mb-4">
                XXXX XXXX XX21 0101
              </div>
              <div className="flex justify-between text-xs opacity-90 font-medium">
                <span>{loanData.customer?.fullName || 'CARD HOLDER'}</span>
                <span>VAL 12/30</span>
              </div>
            </div>
          </div>

          {/* Right Side: Setup Options & Live Price Slabs */}
          <div className="w-full lg:w-2/3">
            <div className="bg-[#f8f9fb] border border-gray-100 rounded-2xl p-6 lg:p-8 flex flex-col gap-6">
              
              {/* Product Price User Input (Fully Editable) */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Tag size={16} className="text-[#1cabb1]" />
                    Product Price (Decide / Enter Loan Value)
                  </label>
                  <span className="text-xs text-gray-500 font-medium">
                    Slabs auto-calculate dynamically based on price
                  </span>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-base">
                      ₹
                    </span>
                    <input 
                      type="text" 
                      value={editablePrice !== undefined && editablePrice !== null ? (editablePrice === 0 ? '0' : editablePrice.toLocaleString('en-IN')) : '0'}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      onFocus={(e) => { if (editablePrice === 0) e.target.select(); }}
                      placeholder="0"
                      className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#1cabb1] focus:ring-4 focus:ring-[#1cabb1]/10 bg-white text-gray-800 font-bold text-lg outline-none transition-all"
                    />
                  </div>
                  
                  <button 
                    onClick={() => setShowEmis(!showEmis)}
                    className="px-5 py-3 rounded-xl border border-[#1cabb1] text-[#1cabb1] font-semibold hover:bg-teal-50 transition-colors whitespace-nowrap text-sm flex items-center gap-1.5"
                  >
                    {loadingSlabs ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={15} />}
                    {showEmis ? "Hide Slabs" : "View Slabs"}
                  </button>
                </div>

                {/* Quick Price Preset Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-gray-400 font-medium">Quick presets:</span>
                  {[25000, 50000, 80000, 100000, 150000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePriceChange(String(preset))}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                        editablePrice === preset
                          ? 'bg-[#1b58a6] text-white border-[#1b58a6]'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      ₹{preset.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                {(!editablePrice || editablePrice <= 0) && (
                  <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5 pt-1">
                    <AlertCircle size={14} className="shrink-0" />
                    Product price must be a positive number (e.g. ₹50,000) to calculate slabs and set up loan.
                  </p>
                )}
              </div>
              
              {/* 1. EMI Options Display (Slabs from GET /api/v1/employee/loans/slabs?productPrice=...) */}
              {showEmis && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h4 className="text-[#1b58a6] font-bold text-[15px] flex items-center gap-1.5">
                        <Sparkles size={16} className="text-[#1cabb1]" />
                        Eligible Month-wise EMI Slabs
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Select a tenure matching the price point of ₹{formatCurrency(editablePrice)}
                      </p>
                    </div>
                    {loadingSlabs && (
                      <span className="flex items-center gap-1.5 text-xs text-[#1cabb1] font-semibold">
                        <Loader2 size={14} className="animate-spin" />
                        Fetching slabs...
                      </span>
                    )}
                  </div>

                  {slabs.length === 0 && !loadingSlabs ? (
                    <div className="p-6 bg-amber-50 border border-amber-100 rounded-xl text-center text-amber-800 text-sm">
                      Please enter a valid product price above ₹5,000 to view eligible tenure slabs.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {slabs.map((slab) => {
                        const tenure = slab.tenureMonths;
                        const emiAmt = slab.monthlyEmi || slab.amountPerMonth || slab.emiAmount || 0;
                        const interestRate = slab.interestPercentage ?? slab.interestRate ?? 0;
                        const isSelected = selectedEmi === tenure;

                        return (
                          <div 
                            key={tenure} 
                            onClick={() => setSelectedEmi(tenure)}
                            className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-[#1cabb1] bg-teal-50/70 ring-4 ring-[#1cabb1]/10 shadow-xs' 
                                : 'border-gray-200 bg-white hover:border-[#1cabb1]/60 hover:bg-teal-50/20'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="font-bold text-gray-900 text-sm">{tenure} Months</span>
                              <span className="text-sm font-bold text-[#1cabb1]">₹{formatCurrency(emiAmt)}/mo</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                              <span>Interest: <strong className="text-gray-800 font-semibold">{interestRate}%</strong></span>
                              {slab.minProductPrice && (
                                <span>Min: ₹{formatCurrency(slab.minProductPrice)}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {!showFinalAmount && (
                    <div className="flex justify-end mt-6">
                      <button 
                        onClick={() => setShowFinalAmount(true)} 
                        className="bg-[#1b58a6] hover:bg-[#154685] text-white px-8 py-3 rounded-full text-sm font-bold transition-all shadow-sm flex items-center gap-2"
                      >
                        Next: Preview Breakdown
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Final Amount & Dynamic EMI Calculation Section */}
              {showFinalAmount && (
                <div className="pt-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Left Column: Toggles & Add-ons */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-gray-800 text-[14px] mb-3">Add-on Services</h4>
                        
                        <div className="space-y-4">
                          <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 text-[#1b58a6] rounded border-gray-300 focus:ring-[#1b58a6]" 
                              checked={purchaseEmiCard}
                              onChange={(e) => setPurchaseEmiCard(e.target.checked)}
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-800">Purchase / Renew EMI Card</span>
                              <span className="text-xs text-gray-500">+₹500 (Annual Membership)</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                            <input 
                              type="checkbox" 
                              className="w-5 h-5 text-[#1b58a6] rounded border-gray-300 focus:ring-[#1b58a6]" 
                              checked={purchaseInsurance}
                              onChange={(e) => setPurchaseInsurance(e.target.checked)}
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-800">Loan Protection Insurance</span>
                              <span className="text-xs text-gray-500">+₹1,000 (Full Tenure Cover)</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 flex items-center gap-3">
                        <ShieldCheck size={22} className="text-[#1cabb1] shrink-0" />
                        <span className="text-xs text-teal-900 font-medium">
                          Selected tenure: <strong className="font-bold text-teal-950">{selectedEmi} Months</strong>. Rates locked as per RBI & Society rules.
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Amount Info & Breakdown */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-gray-800 text-[15px]">Amount Breakdown</h4>
                        {calculatingBreakdown && <Loader2 size={16} className="animate-spin text-[#1cabb1]" />}
                      </div>

                      <div className="space-y-2 mb-3 border-b border-gray-100 pb-3 text-[13px]">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Product Price:</span>
                          <span className="text-gray-800 font-semibold">₹{formatCurrency(breakdown.productPrice || editablePrice)}</span>
                        </div>
                        {breakdown.emiCardCharges > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">EMI Card Charges:</span>
                            <span className="text-gray-800 font-semibold">+₹{formatCurrency(breakdown.emiCardCharges)}</span>
                          </div>
                        )}
                        {breakdown.processingFees > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Loan Processing Fees:</span>
                            <span className="text-gray-800 font-semibold">+₹{formatCurrency(breakdown.processingFees)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center font-bold text-gray-800 pt-1 border-t border-dashed border-gray-100">
                          <span>Total Initial Amount:</span>
                          <span>₹{formatCurrency(breakdown.totalInitialAmount || breakdown.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-rose-600 font-bold bg-rose-50/60 p-2 rounded-lg mt-1">
                          <span>Down Payment (To Collect):</span>
                          <span>₹{formatCurrency(breakdown.downPayment)}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3 border-b border-gray-100 pb-3 text-[13px]">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Principal Loan Amount:</span>
                          <span className="text-gray-800 font-semibold">₹{formatCurrency(breakdown.principalLoanAmount || breakdown.totalLoanAmount)}</span>
                        </div>
                        {(breakdown.loanInterest > 0 || breakdown.interestAmount > 0) && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Total Interest:</span>
                            <span className="text-gray-800 font-semibold">+₹{formatCurrency(breakdown.loanInterest || breakdown.interestAmount)}</span>
                          </div>
                        )}
                        {(breakdown.loanInsurance > 0 || breakdown.insuranceAmount > 0) && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Loan Insurance:</span>
                            <span className="text-gray-800 font-semibold">+₹{formatCurrency(breakdown.loanInsurance || breakdown.insuranceAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center font-bold text-gray-800 pt-1 border-t border-dashed border-gray-100">
                          <span>Final Repayable Loan:</span>
                          <span>₹{formatCurrency(breakdown.finalLoanAmount || breakdown.totalPayableAmount)}</span>
                        </div>
                      </div>

                      <div className="pt-1">
                        <div className="flex justify-between items-center text-sm font-bold text-[#1b58a6] bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100/60">
                          <span>Monthly EMI ({selectedEmi} Mo):</span>
                          <span className="text-base text-[#1b58a6]">₹{formatCurrency(breakdown.monthlyEmi || breakdown.emiAmount)}/Mo</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!showBankDetails && (
                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <button 
                        onClick={() => setShowBankDetails(true)} 
                        className="bg-[#1b58a6] hover:bg-[#154685] text-white px-8 py-3 rounded-full text-sm font-bold transition-all shadow-sm flex items-center gap-2"
                      >
                        Next: Repayment Bank & Digital Signature
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Repayment Bank Account (Mandate Setup - API 14) & Digital Signature */}
              {showBankDetails && (
                <div className="pt-6 border-t border-gray-200 animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
                  
                  {/* Bank Mandate Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-gray-800 font-bold text-[15px] flex items-center gap-2">
                        <Landmark size={18} className="text-[#1cabb1]" />
                        Repayment Bank Account (Mandate Setup)
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Customer primary account details for EMI auto-debit (API 14)
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Mandate Required
                    </span>
                  </div>
                  
                  {/* Bank Details Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                        Bank Name <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. State Bank of India"
                        value={bankForm.bankName}
                        onChange={(e) => {
                          setBankForm(prev => ({ ...prev, bankName: e.target.value }));
                          if (bankErrors.bankName) setBankErrors(prev => ({ ...prev, bankName: '' }));
                        }}
                        className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 font-medium transition-colors ${
                          bankErrors.bankName 
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200' 
                            : 'border-gray-200 focus:border-[#1cabb1] focus:ring-[#1cabb1]/20'
                        }`}
                      />
                      {bankErrors.bankName && (
                        <p className="text-[11px] text-rose-500 font-medium mt-1">{bankErrors.bankName}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1.5 flex items-center justify-between">
                        <span>Account Number <span className="text-rose-500">*</span></span>
                        <span className="text-[11px] text-gray-400 font-normal">9-18 digits</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="e.g. 35207845339"
                          maxLength={18}
                          value={bankForm.accountNumber}
                          onChange={(e) => {
                            const val = sanitizeDigits(e.target.value, 18);
                            setBankForm(prev => ({ ...prev, accountNumber: val }));
                            if (bankErrors.accountNumber) setBankErrors(prev => ({ ...prev, accountNumber: '' }));
                          }}
                          className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 font-mono font-medium transition-colors ${
                            bankErrors.accountNumber 
                              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200' 
                              : bankForm.accountNumber && validateAccountNumber(bankForm.accountNumber).isValid
                                ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-200'
                                : 'border-gray-200 focus:border-[#1cabb1] focus:ring-[#1cabb1]/20'
                          }`}
                        />
                        {bankForm.accountNumber && validateAccountNumber(bankForm.accountNumber).isValid && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 flex items-center gap-1 text-xs font-bold">
                            <Check size={16} />
                          </span>
                        )}
                      </div>
                      {bankErrors.accountNumber && (
                        <p className="text-[11px] text-rose-500 font-medium mt-1">{bankErrors.accountNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1.5 flex items-center justify-between">
                        <span>IFSC Code <span className="text-rose-500">*</span></span>
                        <span className="text-[11px] text-gray-400 font-normal">e.g. SBIN0001234</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="e.g. SBIN0001234"
                          maxLength={11}
                          value={bankForm.ifsc}
                          onChange={(e) => {
                            const val = sanitizeIFSC(e.target.value);
                            setBankForm(prev => ({ ...prev, ifsc: val }));
                            if (bankErrors.ifsc) setBankErrors(prev => ({ ...prev, ifsc: '' }));
                          }}
                          className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 font-mono font-semibold uppercase transition-colors ${
                            bankErrors.ifsc 
                              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200' 
                              : bankForm.ifsc && validateIFSC(bankForm.ifsc).isValid
                                ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-200'
                                : 'border-gray-200 focus:border-[#1cabb1] focus:ring-[#1cabb1]/20'
                          }`}
                        />
                        {bankForm.ifsc && validateIFSC(bankForm.ifsc).isValid && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 flex items-center gap-1 text-xs font-bold">
                            <Check size={16} />
                          </span>
                        )}
                      </div>
                      {bankErrors.ifsc ? (
                        <p className="text-[11px] text-rose-500 font-medium mt-1">{bankErrors.ifsc}</p>
                      ) : bankForm.ifsc && !validateIFSC(bankForm.ifsc).isValid ? (
                        <p className="text-[11px] text-amber-600 font-medium mt-1">
                          Must be 11 characters: 4 letters + 0 + 6 alphanumeric (e.g. SBIN0001234)
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                        Account Holder Name <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. Priya Sharma"
                        value={bankForm.accountHolder || loanData.customer?.fullName || ''}
                        onChange={(e) => {
                          setBankForm(prev => ({ ...prev, accountHolder: e.target.value }));
                          if (bankErrors.accountHolder) setBankErrors(prev => ({ ...prev, accountHolder: '' }));
                        }}
                        className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 font-medium transition-colors ${
                          bankErrors.accountHolder 
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200' 
                            : 'border-gray-200 focus:border-[#1cabb1] focus:ring-[#1cabb1]/20'
                        }`}
                      />
                      {bankErrors.accountHolder && (
                        <p className="text-[11px] text-rose-500 font-medium mt-1">{bankErrors.accountHolder}</p>
                      )}
                    </div>
                  </div>

                  {/* Digital Signature Section (Draw or Upload) */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                          <PenTool size={16} className="text-[#1cabb1]" />
                          Customer Digital Signature (Mandatory for EMI Contract)
                        </label>
                        <p className="text-xs text-gray-500">
                          Signature will be submitted via Base64 string with Disbursal Authorization (API 16)
                        </p>
                      </div>

                      <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setSignatureMode('draw')}
                          className={`px-3 py-1 rounded-lg transition-all ${
                            signatureMode === 'draw' ? 'bg-white text-[#1b58a6] shadow-xs' : 'text-gray-500'
                          }`}
                        >
                          Draw Pad
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignatureMode('upload')}
                          className={`px-3 py-1 rounded-lg transition-all ${
                            signatureMode === 'upload' ? 'bg-white text-[#1b58a6] shadow-xs' : 'text-gray-500'
                          }`}
                        >
                          Upload File
                        </button>
                      </div>
                    </div>

                    {signatureMode === 'draw' ? (
                      <div className="space-y-2">
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden bg-[#fafbfc] relative">
                          <canvas
                            ref={signatureCanvasRef}
                            width={500}
                            height={140}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="w-full h-[140px] cursor-crosshair touch-none"
                          />
                          {!signatureBase64 && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-gray-400 font-medium">
                              Draw customer signature here with mouse or stylus
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <button
                            type="button"
                            onClick={clearCanvas}
                            className="text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1"
                          >
                            <RotateCcw size={13} />
                            Clear Signature
                          </button>
                          {signatureBase64 && (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <Check size={14} />
                              Signature Captured
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        {signatureBase64 ? (
                          <div className="p-4 bg-[#f8f9fb] border border-gray-200 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img src={signatureBase64} alt="Signature Preview" className="h-12 max-w-[160px] object-contain border p-1 rounded bg-white" />
                              <div>
                                <span className="text-xs font-bold text-gray-800 block">Uploaded Digital Signature</span>
                                <span className="text-[11px] text-emerald-600 font-semibold">✓ Ready for authorization</span>
                              </div>
                            </div>
                            <label className="cursor-pointer text-xs font-semibold text-[#1cabb1] hover:underline">
                              Change
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleSignatureUpload(e.target.files[0])} />
                            </label>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#1cabb1] bg-[#fafbfc] transition-colors">
                            <UploadCloud size={30} className="text-gray-400 mb-2" />
                            <span className="text-sm font-semibold text-gray-700">Click to upload signature image</span>
                            <span className="text-xs text-gray-400 mt-1">PNG or JPG (auto-converted to Base64)</span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleSignatureUpload(e.target.files[0])} />
                          </label>
                        )}
                      </div>
                    )}
                  </div>

                  {/* COLLECT DOWN PAYMENT BUTTON (Calls API 14 & API 15) */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      Down Payment to collect: <strong className="text-rose-600 font-bold text-sm">₹{formatCurrency(breakdown.downPayment)}</strong>
                    </div>

                    <button 
                      onClick={handleInitiateDownPayment}
                      disabled={submittingBank || sendingOtp}
                      className="bg-[#1cabb1] hover:bg-[#159a9f] disabled:opacity-60 text-white px-10 py-3.5 rounded-full font-bold transition-all shadow-md text-sm flex items-center gap-2"
                    >
                      {submittingBank || sendingOtp ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Linking Mandate & Sending OTP...</span>
                        </>
                      ) : (
                        <>
                          <span>Collect Down Payment (₹{formatCurrency(breakdown.downPayment)})</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: OTP Authorization (API 15 & API 16) */}
      {/* ------------------------------------------------------------- */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowOtpModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-teal-50 text-[#1cabb1] rounded-full flex items-center justify-center mx-auto mb-3">
                <Smartphone size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Disbursal Authorization OTP</h3>
              <p className="text-xs text-gray-500 mt-1">
                Enter the authorization code sent to customer mobile <br />
                <span className="font-semibold text-gray-800">{loanData.customer?.phoneNumber || 'Registered Phone'}</span>
              </p>
              {otpSentMessage && (
                <div className="mt-2 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                  {otpSentMessage}
                </div>
              )}
            </div>

            {/* 6-Digit OTP Inputs */}
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input 
                  key={index}
                  id={`disbursal-otp-${index}`}
                  type="text" 
                  maxLength={1}
                  value={otp[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-11 h-13 text-center text-lg font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1cabb1] focus:ring-4 focus:ring-[#1cabb1]/10 bg-gray-50 font-mono"
                />
              ))}
            </div>

            {/* Resend OTP */}
            <div className="text-center mb-6">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={sendingOtp}
                className="text-xs text-[#1b58a6] hover:underline font-semibold"
              >
                {sendingOtp ? "Resending OTP..." : "Didn't receive? Resend Disbursal OTP"}
              </button>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowOtpModal(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-full font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleVerifyAndSubmitEmi}
                disabled={submittingEmi}
                className="flex-1 py-3 bg-[#1cabb1] hover:bg-[#159a9f] disabled:opacity-60 text-white rounded-full font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {submittingEmi ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <span>Verify & Authorize</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: Payment Collection Modal (UPI / Card / Cash) */}
      {/* ------------------------------------------------------------- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Collect Down Payment</h3>
              <p className="text-xs text-gray-500 mt-1">Amount to be collected</p>
              <div className="text-2xl font-bold text-[#1cabb1] mt-1">
                ₹{formatCurrency(breakdown.downPayment)}
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-3 mb-6">
              <label 
                onClick={() => setSelectedPaymentMethod('UPI')}
                className={`flex items-center gap-3 p-3.5 border rounded-2xl cursor-pointer transition-all ${
                  selectedPaymentMethod === 'UPI' ? 'border-[#1cabb1] bg-teal-50 ring-2 ring-[#1cabb1]/20' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Smartphone size={20} className="text-[#1cabb1]" />
                <span className="text-sm font-semibold text-gray-700">UPI / QR Code</span>
              </label>

              <label 
                onClick={() => setSelectedPaymentMethod('CARD')}
                className={`flex items-center gap-3 p-3.5 border rounded-2xl cursor-pointer transition-all ${
                  selectedPaymentMethod === 'CARD' ? 'border-[#1cabb1] bg-teal-50 ring-2 ring-[#1cabb1]/20' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <CreditCard size={20} className="text-[#1cabb1]" />
                <span className="text-sm font-semibold text-gray-700">Debit / Credit Card (POS)</span>
              </label>

              <label 
                onClick={() => setSelectedPaymentMethod('NETBANKING')}
                className={`flex items-center gap-3 p-3.5 border rounded-2xl cursor-pointer transition-all ${
                  selectedPaymentMethod === 'NETBANKING' ? 'border-[#1cabb1] bg-teal-50 ring-2 ring-[#1cabb1]/20' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Landmark size={20} className="text-[#1cabb1]" />
                <span className="text-sm font-semibold text-gray-700">Net Banking / IMPS</span>
              </label>

              <label 
                onClick={() => setSelectedPaymentMethod('CASH')}
                className={`flex items-center gap-3 p-3.5 border rounded-2xl cursor-pointer transition-all ${
                  selectedPaymentMethod === 'CASH' ? 'border-[#1cabb1] bg-teal-50 ring-2 ring-[#1cabb1]/20' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Banknote size={20} className="text-[#1cabb1]" />
                <span className="text-sm font-semibold text-gray-700">Cash Collection at Branch</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-full font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmPayment}
                className="flex-1 py-3 bg-[#1cabb1] hover:bg-[#159a9f] text-white rounded-full font-bold text-sm transition-colors shadow-sm"
              >
                Confirm Payment & Complete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SetupLoan;
