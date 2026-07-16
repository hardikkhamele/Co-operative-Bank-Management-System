import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOTP from './pages/auth/VerifyOTP';
import ResetPassword from './pages/auth/ResetPassword';
import PasswordChanged from './pages/auth/PasswordChanged';
import Login from './pages/auth/Login';
import DashboardLayout from './components/layouts/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Notifications from './pages/dashboard/Notifications';
import Managers from './pages/dashboard/Managers';

import Employees from './pages/dashboard/Employees';
import CreateEmployee from './pages/dashboard/CreateEmployee';
import EditEmployee from './pages/dashboard/EditEmployee';
import ViewEmployee from './pages/dashboard/ViewEmployee';
import AttendanceReport from './pages/dashboard/AttendanceReport';
import Customers from './pages/dashboard/Customers';
import CustomerLoans from './pages/dashboard/CustomerLoans';
import Leads from './pages/dashboard/Leads';
import CreateLead from './pages/dashboard/CreateLead';
import EditLead from './pages/dashboard/EditLead';
import ViewLead from './pages/dashboard/ViewLead';
import Region from './pages/dashboard/Region';
import Branch from './pages/dashboard/Branch';
import LoanDetails from './pages/dashboard/LoanDetails';
import RolesAndPermissions from './pages/dashboard/RolesAndPermissions';
import CreateRole from './pages/dashboard/CreateRole';
import ProductCategories from './pages/dashboard/ProductCategories';
import ProductBrands from './pages/dashboard/ProductBrands';
import Products from './pages/dashboard/Products';
import Banners from './pages/dashboard/Banners';
import CreateManager from './pages/dashboard/CreateManager';
import EditManager from './pages/dashboard/EditManager';
import ViewManager from './pages/dashboard/ViewManager';
import CooperativeBanks from './pages/dashboard/CooperativeBanks';
import CreateCooperativeBank from './pages/dashboard/CreateCooperativeBank';
import EditCooperativeBank from './pages/dashboard/EditCooperativeBank';
import ViewCooperativeBank from './pages/dashboard/ViewCooperativeBank';
import Merchants from './pages/dashboard/Merchants';
import CreateMerchant from './pages/dashboard/CreateMerchant';
import EditMerchant from './pages/dashboard/EditMerchant';
import ViewMerchant from './pages/dashboard/ViewMerchant';

function App() {
  console.log("App Router Loaded - v2");
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/password-changed" element={<PasswordChanged />} />
        
        <Route path="/" element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="managers" element={<Managers />} />
          <Route path="managers/create" element={<CreateManager />} />
          <Route path="managers/edit" element={<EditManager />} />
          <Route path="managers/view" element={<ViewManager />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/create" element={<CreateEmployee />} />
          <Route path="employees/edit" element={<EditEmployee />} />
          <Route path="employees/view" element={<ViewEmployee />} />
          <Route path="attendance" element={<AttendanceReport />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id/loans" element={<CustomerLoans />} />
          <Route path="customers/:id/loans/:loanId" element={<LoanDetails />} />
          <Route path="leads" element={<Leads />} />
          <Route path="leads/create" element={<CreateLead />} />
          <Route path="leads/edit" element={<EditLead />} />
          <Route path="leads/view" element={<ViewLead />} />
          <Route path="region" element={<Region />} />
          <Route path="branch" element={<Branch />} />
          <Route path="roles-permissions" element={<RolesAndPermissions />} />
          <Route path="roles-permissions/create" element={<CreateRole />} />
          <Route path="product-categories" element={<ProductCategories />} />
          <Route path="product-brands" element={<ProductBrands />} />
          <Route path="products" element={<Products />} />
          <Route path="banners" element={<Banners />} />
          <Route path="co-operative-bank" element={<CooperativeBanks />} />
          <Route path="co-operative-bank/create" element={<CreateCooperativeBank />} />
          <Route path="co-operative-bank/edit" element={<EditCooperativeBank />} />
          <Route path="co-operative-bank/view" element={<ViewCooperativeBank />} />
          <Route path="merchant" element={<Merchants />} />
          <Route path="merchant/create" element={<CreateMerchant />} />
          <Route path="merchant/edit" element={<EditMerchant />} />
          <Route path="merchant/view" element={<ViewMerchant />} />
          {/* Add other nested routes here in the future */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
