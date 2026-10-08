import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const Tariffs = lazy(() => import('./pages/Tariffs'));
const ChargingHistory = lazy(() => import('./pages/ChargingHistory'));
const CreateCharging = lazy(() => import('./pages/CreateCharging'));
const ChargingDetail = lazy(() => import('./pages/ChargingDetail'));
const Users = lazy(() => import('./pages/Users'));
const Roles = lazy(() => import('./pages/Roles'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const Reports = lazy(() => import('./pages/Reports'));

const PageLoader = () => (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-color)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary-500)]" />
    </div>
);

const ProtectedRoute = ({ children, permission }) => {
    const { user, hasPermission } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (permission && !hasPermission(permission)) return <Navigate to="/" />;
    return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/evcms">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="/" element={<ProtectedRoute permission="dashboard.view"><Dashboard /></ProtectedRoute>} />
            
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            <Route path="/vehicles" element={<ProtectedRoute permission="vehicle.view"><Vehicles /></ProtectedRoute>} />
            
            <Route path="/tariffs" element={<ProtectedRoute permission="tariff.view"><Tariffs /></ProtectedRoute>} />
            
            <Route path="/charging" element={<ProtectedRoute permission="charging.view"><ChargingHistory /></ProtectedRoute>} />
            <Route path="/charging/create" element={<ProtectedRoute permission="charging.create"><CreateCharging /></ProtectedRoute>} />
            <Route path="/charging/:id" element={<ProtectedRoute permission="charging.view"><ChargingDetail /></ProtectedRoute>} />
            
            <Route path="/users" element={<ProtectedRoute permission="user.view"><Users /></ProtectedRoute>} />
            <Route path="/roles" element={<ProtectedRoute permission="user.manage_permission"><Roles /></ProtectedRoute>} />
            <Route path="/audit-logs" element={<ProtectedRoute permission="audit.view"><AuditLogs /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute permission="report.view"><Reports /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
