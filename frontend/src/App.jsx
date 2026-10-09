import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const Notices = lazy(() => import('./pages/Notices'));
const Events = lazy(() => import('./pages/Events'));
const Complaints = lazy(() => import('./pages/Complaints'));
const Businesses = lazy(() => import('./pages/Businesses'));
const Records = lazy(() => import('./pages/Records'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const BlockManagerDashboard = lazy(() => import('./pages/manager/BlockManagerDashboard'));

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen bg-[#F7F0DF]" />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Main Application Pages */}
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
              <Route path="/notices" element={<ProtectedRoute><Notices /></ProtectedRoute>} />
              <Route path="/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
              <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
              <Route path="/businesses" element={<ProtectedRoute><Businesses /></ProtectedRoute>} />
              <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* Governance Dashboards */}
              <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['ADMIN', 'COMMUNITY_HEAD']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/manager/*" element={<ProtectedRoute allowedRoles={['ADMIN', 'BLOCK_MANAGER']}><BlockManagerDashboard /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;