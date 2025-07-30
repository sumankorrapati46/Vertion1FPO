import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";

import FarmerForm from "./pages/Formerform";
import Login from "./pages/Login";
import Register from "./pages/RegistrationForm";
import ForgotUsername from "./pages/ForgotUserid";
import ForgotPassword from "./pages/ForgotPassword";
import OtpVerification from "./pages/OtpVerification";
import ChangeUserId from "./pages/ChangeUserId";
import ChangePassword from "./pages/ChangePassword";
import Viewfarmer from "./pages/Viewfarmer";
import Dashboard from "./pages/Dashboard";
import EmployeeDetails from "./pages/EmployeeDetails";
import AddFPOForm from "./pages/Fpo";
import Adminconfig from "./pages/Adminconfig";
import UserProfile from "./pages/UserProfile";
import { RegistrationList, FarmerList, EmployeeList } from "./pages/List";
import { RegistrationDetails } from "./pages/RegistrationDetails";

import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import PrivateRoute from "./PrivateRoute";
import { AuthProvider } from "./AuthContext";

import logo1 from "./assets/leftlogo.png";
import logo2 from "./assets/rightlogo.png";
import "./App.css";
import Viewemployeedetails from "./pages/Viewemployeedetails";

function Layout({ children, currentStep = 0, onStepChange }) {
  const steps = [
    "🏛️ Personal Information",
    "📌 Address",
    "👨‍🌾 Professional Information",
    "🌱 Current Crop Information",
    "🌾 Proposed Crop Information",
    "💧 Irrigation Details",
    "🔍 Other Information",
    "📄 Documents",
  ];

  return (
    <div className="infologo-container">
      <header className="infotop-bar">
        <img src={logo1} alt="Left Logo" className="infologo-left" />
        <img src={logo2} alt="Right Logo" className="infologo-right" />
      </header>

      <div className="infomiddle-container">
        <nav className="infonav-links">
          {steps.map((label, index) => (
            <div
              key={index}
              className={`infonav-item ${index === currentStep ? "active" : ""}`}
              onClick={() => onStepChange(index)}
              style={{ cursor: "pointer" }}
            >
              {label}
            </div>
          ))}
        </nav>
      </div>

      <div className="form-title">
        <u><h3>{steps[currentStep].replace(/^[^\w]+/, "").trim()}</h3></u>
      </div>

      <div className="content-container">{children}</div>
    </div>
  );
}

function FarmerFormWrapper() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <Layout currentStep={currentStep} onStepChange={setCurrentStep}>
      <FarmerForm currentStep={currentStep} setCurrentStep={setCurrentStep} />
    </Layout>
  );
}

function AppContent() {
  const location = useLocation();

  const noFrameRoutes = [
    "/login",
    "/register",
    "/forgot-username",
    "/forgot-password",
    "/change-userid",
    "/change-password",
    "/otp-verification",
    "/dashboard",
    "/super-admin/dashboard",
    "/fpo-form",
    "/admin-config",
    "/employee-details",
    "/test-super-admin",
  ];

  // Dynamic View Routes
  if (location.pathname.startsWith("/view-farmer")) {
    return (
      <Routes>
        <Route path="/view-farmer/:farmerId" element={<Viewfarmer />} />
      </Routes>
    );
  }

  if (location.pathname.startsWith("/view-employee")) {
    return (
      <Routes>
        <Route path="/view-employee/:employeeId" element={<Viewemployeedetails />} />
      </Routes>
    );
  }

  // Static Routes
  if (noFrameRoutes.includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-username" element={<ForgotUsername />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-userid" element={<ChangeUserId />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employee-details" element={<EmployeeDetails />} />
        <Route path="/registration-list" element={<RegistrationList />} />
        <Route path="/farmer-list" element={<FarmerList />} />
        <Route path="/employee-list" element={<EmployeeList />} />
        <Route path="/fpo-form" element={<AddFPOForm />} />
        <Route path="/admin-config" element={<Adminconfig />} />
        <Route path="/dashboard/registration/:id" element={<RegistrationDetails />} />
        <Route
          path="/profile"
          element={localStorage.getItem("token") ? <UserProfile /> : <Navigate to="/login" />}
        />
        {/* Role-based dashboards */}
        <Route element={<PrivateRoute allowedRoles={["SUPER_ADMIN"]} />}>
          <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={["EMPLOYEE"]} />}>
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        </Route>
        
        {/* TEST ROUTE: Super Admin Dashboard without authentication */}
        <Route path="/test-super-admin" element={<SuperAdminDashboard />} />
        
        {/* SIMPLE TEST ROUTE */}
        <Route path="/simple-test" element={
          <div style={{ 
            padding: '50px', 
            backgroundColor: 'red', 
            color: 'white',
            fontSize: '32px',
            textAlign: 'center',
            minHeight: '100vh'
          }}>
            <h1>🔴 SIMPLE TEST ROUTE</h1>
            <p>If you see this red page, routing is working!</p>
            <p>Time: {new Date().toLocaleString()}</p>
          </div>
        } />
      </Routes>
    );
  }

  // Default route for farmer form
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-employee" element={<Register />} />
      <Route path="/register-farmer" element={<Register />} />
      <Route path="/register-fpo" element={<AddFPOForm />} />
      <Route path="/farmer-form" element={<FarmerFormWrapper />} />
    </Routes>
  );
}

function App() {
  console.log("App component is rendering");
  
  return (
    <div>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
