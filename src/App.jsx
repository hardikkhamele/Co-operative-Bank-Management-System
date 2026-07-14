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
import Customers from './pages/dashboard/Customers';
import CustomerLoans from './pages/dashboard/CustomerLoans';
import Leads from './pages/dashboard/Leads';
import Region from './pages/dashboard/Region';
import Branch from './pages/dashboard/Branch';
import LoanDetails from './pages/dashboard/LoanDetails';
import RolesAndPermissions from './pages/dashboard/RolesAndPermissions';
import CreateRole from './pages/dashboard/CreateRole';
import ProductCategories from './pages/dashboard/ProductCategories';
import ProductBrands from './pages/dashboard/ProductBrands';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/password-changed" element={<PasswordChanged />} />
        
        {/* Dashboard Routes */}
        <Route path="/" element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="managers" element={<Managers />} />
          <Route path="employees" element={<Employees />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id/loans" element={<CustomerLoans />} />
          <Route path="customers/:id/loans/:loanId" element={<LoanDetails />} />
          <Route path="leads" element={<Leads />} />
          <Route path="region" element={<Region />} />
          <Route path="branch" element={<Branch />} />
          <Route path="roles-permissions" element={<RolesAndPermissions />} />
          <Route path="roles-permissions/create" element={<CreateRole />} />
          <Route path="product-categories" element={<ProductCategories />} />
          <Route path="product-brands" element={<ProductBrands />} />
          {/* Add other nested routes here in the future */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
