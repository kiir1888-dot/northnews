import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { UsersIcon, InboxIcon, LifeBuoyIcon, MegaphoneIcon, LayersIcon, LogOutIcon } from './Icons';

const NAV_ITEMS = [
  { to: 'subscribers', label: 'Subscribers', subtitle: 'Reader accounts & directory', icon: UsersIcon },
  { to: 'submissions', label: 'Submissions', subtitle: 'Editorial review pipeline', icon: InboxIcon },
  { to: 'support', label: 'Support', subtitle: 'Reader inbox & tickets', icon: LifeBuoyIcon },
  { to: 'newsletters', label: 'Newsletters', subtitle: 'Bulletins & broadcasts', icon: MegaphoneIcon },
  { to: 'content', label: 'Content', subtitle: 'Site & news', icon: LayersIcon },
];

export default function Sidebar() {
  const { user, logout } = useAdminAuth();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-brand-100 bg-white">
      <div className="border-b border-brand-100 bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-5">
        <p className="font-sans text-lg font-semibold text-white">NORTH i</p>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-100">Editorial admin</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ to, label, subtitle, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-start gap-3 rounded-lg border-l-4 px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                  : 'border-transparent text-ink-600 hover:border-brand-200 hover:bg-brand-50/60 hover:text-ink-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`mt-0.5 h-5 w-5 shrink-0 ${isActive ? 'text-brand-600' : 'text-ink-400 group-hover:text-brand-500'}`}
                />
                <span className="flex flex-col">
                  <span className="font-medium leading-tight">{label}</span>
                  <span className="text-xs leading-tight text-ink-400">{subtitle}</span>
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-brand-100 bg-brand-50/40 px-4 py-4">
        <div className="mb-3 flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white shadow-sm">
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink-900">{user?.email}</p>
            <p className="truncate text-xs capitalize text-ink-400">{user?.role}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-danger-200 bg-white px-3 py-2 text-sm font-medium text-danger-600 transition hover:border-danger-300 hover:bg-danger-50"
        >
          <LogOutIcon className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
