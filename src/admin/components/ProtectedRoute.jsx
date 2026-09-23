import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

/**
 * Layout-route guard: renders the nested admin routes only for an
 * authenticated session, otherwise bounces to the login screen and remembers
 * where the operator was headed so we can return them there after login.
 */
export default function ProtectedRoute() {
  const { user, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-white">
        <div className="flex items-center gap-3 text-ink-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
          Loading dashboard…
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
