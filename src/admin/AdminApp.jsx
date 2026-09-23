import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import DashboardLayout from './pages/DashboardLayout';
import ContentPage from './pages/ContentPage';
import Placeholder from './pages/Placeholder';

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="content" replace />} />
            <Route path="content" element={<ContentPage />} />
            <Route
              path="subscribers"
              element={<Placeholder title="Subscribers" subtitle="Reader accounts & directory" />}
            />
            <Route
              path="submissions"
              element={<Placeholder title="Submissions" subtitle="Editorial review pipeline" />}
            />
            <Route path="support" element={<Placeholder title="Support" subtitle="Reader inbox & tickets" />} />
            <Route
              path="newsletters"
              element={<Placeholder title="Newsletters" subtitle="Bulletins & broadcasts" />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="content" replace />} />
      </Routes>
    </AdminAuthProvider>
  );
}
