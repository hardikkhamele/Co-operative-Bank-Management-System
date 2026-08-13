import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/routes/ProtectedRoute';
import PublicRoute from './components/routes/PublicRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy Layouts
const DashboardLayout = lazy(() => import('./components/layouts/DashboardLayout'));
const BankDashboardLayout = lazy(() => import('./components/layouts/BankDashboardLayout'));

// Lazy Auth Pages
const Login = lazy(() => import('./pages/auth/Login'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const VerifyOTP = lazy(() => import('./pages/auth/VerifyOTP'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const PasswordChanged = lazy(() => import('./pages/auth/PasswordChanged'));
const BankLogin = lazy(() => import('./pages/bank-auth/BankLogin'));

// Lazy Dashboard Pages
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const BankDashboard = lazy(() => import('./pages/bank-dashboard/BankDashboard'));
const Notifications = lazy(() => import('./pages/dashboard/Notifications'));
const Managers = lazy(() => import('./pages/dashboard/Managers'));
const CreateManager = lazy(() => import('./pages/dashboard/CreateManager'));
const EditManager = lazy(() => import('./pages/dashboard/EditManager'));
const ViewManager = lazy(() => import('./pages/dashboard/ViewManager'));
const MyProfile = lazy(() => import('./pages/dashboard/MyProfile'));
const PriceSettings = lazy(() => import('./pages/dashboard/PriceSettings'));
const Inventory = lazy(() => import('./pages/dashboard/Inventory'));
const CreateInventory = lazy(() => import('./pages/dashboard/CreateInventory'));
const EditInventory = lazy(() => import('./pages/dashboard/EditInventory'));

// Employees & HR
const Employees = lazy(() => import('./pages/dashboard/Employees'));
const CreateEmployee = lazy(() => import('./pages/dashboard/CreateEmployee'));
const EditEmployee = lazy(() => import('./pages/dashboard/EditEmployee'));
const ViewEmployee = lazy(() => import('./pages/dashboard/ViewEmployee'));
// const AttendanceReport = lazy(() => import('./pages/dashboard/AttendanceReport'));
const LettersAndPayroll = lazy(() => import('./pages/dashboard/LettersAndPayroll'));
const DailyWorkReport = lazy(() => import('./pages/dashboard/DailyWorkReport'));
const KPAReport = lazy(() => import('./pages/dashboard/KPAReport'));
const ViewReport = lazy(() => import('./pages/dashboard/ViewReport'));
const AddKRA = lazy(() => import('./pages/dashboard/AddKRA'));
const ImportantDates = lazy(() => import('./pages/dashboard/ImportantDates'));

// Customers & Loans
const Customers = lazy(() => import('./pages/dashboard/Customers'));
const CustomerLoans = lazy(() => import('./pages/dashboard/CustomerLoans'));
const LoanDetails = lazy(() => import('./pages/dashboard/LoanDetails'));
const Leads = lazy(() => import('./pages/dashboard/Leads'));
const CreateLead = lazy(() => import('./pages/dashboard/CreateLead'));
const EditLead = lazy(() => import('./pages/dashboard/EditLead'));
const ViewLead = lazy(() => import('./pages/dashboard/ViewLead'));
const SetupLoan = lazy(() => import('./pages/dashboard/SetupLoan'));

// Structure & Roles
const Region = lazy(() => import('./pages/dashboard/Region'));
const Branch = lazy(() => import('./pages/dashboard/Branch'));
const RolesAndPermissions = lazy(() => import('./pages/dashboard/RolesAndPermissions'));
const CreateRole = lazy(() => import('./pages/dashboard/CreateRole'));
const EditRole = lazy(() => import('./pages/dashboard/EditRole'));

// Products & Partners
const ProductCategories = lazy(() => import('./pages/dashboard/ProductCategories'));
const ProductBrands = lazy(() => import('./pages/dashboard/ProductBrands'));
const Products = lazy(() => import('./pages/dashboard/Products'));
const Banners = lazy(() => import('./pages/dashboard/Banners'));
const CooperativeBanks = lazy(() => import('./pages/dashboard/CooperativeBanks'));
const CreateCooperativeBank = lazy(() => import('./pages/dashboard/CreateCooperativeBank'));
const EditCooperativeBank = lazy(() => import('./pages/dashboard/EditCooperativeBank'));
const ViewCooperativeBank = lazy(() => import('./pages/dashboard/ViewCooperativeBank'));
const HelpSupport = lazy(() => import('./pages/dashboard/HelpSupport'));
const Merchants = lazy(() => import('./pages/dashboard/Merchants'));
const CreateMerchant = lazy(() => import('./pages/dashboard/CreateMerchant'));
const EditMerchant = lazy(() => import('./pages/dashboard/EditMerchant'));
const ViewMerchant = lazy(() => import('./pages/dashboard/ViewMerchant'));

// Finance & Receipts
const Credit = lazy(() => import('./pages/dashboard/Credit'));
const ViewCreditReceipt = lazy(() => import('./pages/dashboard/ViewCreditReceipt'));
const Debit = lazy(() => import('./pages/dashboard/Debit'));
const ViewDebitReceipt = lazy(() => import('./pages/dashboard/ViewDebitReceipt'));
const Transfer = lazy(() => import('./pages/dashboard/Transfer'));
const ViewTransferReceipt = lazy(() => import('./pages/dashboard/ViewTransferReceipt'));
const Contra = lazy(() => import('./pages/dashboard/Contra'));
const ViewContraReceipt = lazy(() => import('./pages/dashboard/ViewContraReceipt'));
const CheckCibilScore = lazy(() => import('./pages/dashboard/CheckCibilScore'));
const KycVerification = lazy(() => import('./pages/dashboard/KycVerification'));
const CashPayment = lazy(() => import('./pages/dashboard/CashPayment'));
const ViewCashPayment = lazy(() => import('./pages/dashboard/ViewCashPayment'));

// Cards & Credit Module
const CardsAndCredit = lazy(() => import('./pages/dashboard/CardsAndCredit'));
const ChoosePaymentMethod = lazy(() => import('./pages/dashboard/ChoosePaymentMethod'));
const PaymentSuccessful = lazy(() => import('./pages/dashboard/PaymentSuccessful'));

// Fallback spinner component for page-level transitions
const PageSuspenseFallback = () => (
  <div className="w-full min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-3 border-gray-200 border-t-[#1cabb1] rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
      <Suspense fallback={<PageSuspenseFallback />}>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/password-changed" element={<PasswordChanged />} />
            <Route path="/bank/login" element={<BankLogin />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            {/* Bank Portal Routes */}
            <Route path="/bank" element={<BankDashboardLayout />}>
              <Route path="dashboard" element={<BankDashboard />} />
            </Route>

            {/* Society Dashboard Routes */}
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="managers" element={<Managers />} />
            <Route path="managers/create" element={<CreateManager />} />
            <Route path="managers/edit" element={<EditManager />} />
            <Route path="managers/view" element={<ViewManager />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/create" element={<CreateEmployee />} />
            <Route path="employees/edit/:id" element={<EditEmployee />} />
            <Route path="employees/view/:id" element={<ViewEmployee />} />
            {/* Attendance Report route commented out */}
            <Route path="letters-payroll" element={<LettersAndPayroll />} />
            <Route path="daily-work-report" element={<DailyWorkReport />} />
            <Route path="kpa-report" element={<KPAReport />} />
            <Route path="kpa-report/view/:id" element={<ViewReport />} />
            <Route path="kpa-report/view/:id/add-kra" element={<AddKRA />} />
            <Route path="important-dates" element={<ImportantDates />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id/loans" element={<CustomerLoans />} />
            <Route path="customers/:id/loans/:loanId" element={<LoanDetails />} />
            <Route path="leads" element={<Leads />} />
            <Route path="leads/create" element={<CreateLead />} />
            <Route path="leads/edit" element={<EditLead />} />
            <Route path="leads/edit/:id" element={<EditLead />} />
            <Route path="leads/view" element={<ViewLead />} />
            <Route path="leads/view/:id" element={<ViewLead />} />
            <Route path="leads/setup-loan" element={<SetupLoan />} />
            <Route path="leads/setup-loan/:id" element={<SetupLoan />} />
            <Route path="region" element={<Region />} />
            <Route path="branch" element={<Branch />} />
            <Route path="roles-permissions" element={<RolesAndPermissions />} />
            <Route path="roles-permissions/create" element={<CreateRole />} />
            <Route path="roles-permissions/edit/:id" element={<EditRole />} />
            <Route path="product-categories" element={<ProductCategories />} />
            <Route path="product-brands" element={<ProductBrands />} />
            <Route path="products" element={<Products />} />
            <Route path="banners" element={<Banners />} />
            <Route path="co-operative-bank" element={<CooperativeBanks />} />
            <Route path="co-operative-bank/create" element={<CreateCooperativeBank />} />
            <Route path="co-operative-bank/edit" element={<EditCooperativeBank />} />
            <Route path="co-operative-bank/view" element={<ViewCooperativeBank />} />
            <Route path="settings/help" element={<HelpSupport />} />
            <Route path="merchant" element={<Merchants />} />
            <Route path="merchant/create" element={<CreateMerchant />} />
            <Route path="merchant/:id/edit" element={<EditMerchant />} />
            <Route path="merchant/:id/view" element={<ViewMerchant />} />
            <Route path="price-settings" element={<PriceSettings />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory/create" element={<CreateInventory />} />
            <Route path="inventory/edit" element={<EditInventory />} />
            <Route path="inventory/edit/:id" element={<EditInventory />} />
            <Route path="credit" element={<Credit />} />
            <Route path="credit/view/:id" element={<ViewCreditReceipt />} />
            <Route path="debit" element={<Debit />} />
            <Route path="debit/view/:id" element={<ViewDebitReceipt />} />
            <Route path="transfer" element={<Transfer />} />
            <Route path="transfer/view/:id" element={<ViewTransferReceipt />} />
            <Route path="contra" element={<Contra />} />
            <Route path="contra/view/:id" element={<ViewContraReceipt />} />
            <Route path="cibil" element={<CheckCibilScore />} />
            <Route path="kyc" element={<KycVerification />} />
            <Route path="cash-payment" element={<CashPayment />} />
            <Route path="cash-payment/view/:id" element={<ViewCashPayment />} />
            <Route path="cards-credit" element={<CardsAndCredit />} />
            <Route path="cards-credit/payment" element={<ChoosePaymentMethod />} />
            <Route path="cards-credit/payment/success" element={<PaymentSuccessful />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
