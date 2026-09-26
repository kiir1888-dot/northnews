import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import DashboardLayout from './pages/DashboardLayout';
import ContentPage from './pages/ContentPage';
import EditorsPage from './pages/EditorsPage';
import AccountPage from './pages/AccountPage';
import SupportPage from './pages/SupportPage';
import SubscribersPage from './pages/SubscribersPage';
import NewslettersPage from './pages/NewslettersPage';
import CommentsPage from './pages/CommentsPage';
import SubmissionsPage from './pages/SubmissionsPage';
import SettingsPage from './pages/SettingsPage';

function AdminOnly({ children }) {
  const { user } = useAdminAuth();
  return user?.role === 'admin' ? children : <Navigate to="/admin/content" replace />;
}

const adminOnly = (element) => <AdminOnly>{element}</AdminOnly>;

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="content" replace />} />
            <Route path="content" element={<ContentPage />} />
            <Route path="comments" element={<CommentsPage />} />
            <Route path="submissions" element={<SubmissionsPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="subscribers" element={adminOnly(<SubscribersPage />)} />
            <Route path="newsletters" element={adminOnly(<NewslettersPage />)} />
            <Route path="settings" element={adminOnly(<SettingsPage />)} />
            <Route path="editors" element={adminOnly(<EditorsPage />)} />
            <Route path="account" element={<AccountPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="content" replace />} />
      </Routes>
    </AdminAuthProvider>
  );
}
