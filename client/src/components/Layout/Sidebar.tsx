import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Home,
  ChevronLeft,
  ChevronRight,
  Building2,
  FileText,
  PlusSquare,
  Megaphone,
  Mail,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  const adminLinks = [
    { to: '/admin', icon: Shield, label: 'Admin Dashboard' },
    { to: '/analytics', icon: TrendingUp, label: 'Analytics' },
    { to: '/emails', icon: Mail, label: 'Email Logs' },
    { to: '/notices', icon: Megaphone, label: 'Notice Board' },
    { to: '/complaints', icon: FileText, label: 'All Complaints' },
  ];

  const residentLinks = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/notices', icon: Megaphone, label: 'Notice Board' },
    { to: '/complaints', icon: FileText, label: 'My Complaints' },
    { to: '/complaints/new', icon: PlusSquare, label: 'New Complaint' },
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : residentLinks;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-white/[0.04] dark:bg-white/[0.04] light:bg-gray-50/90 backdrop-blur-2xl border-r border-white/[0.08] dark:border-white/[0.08]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo area */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.08]">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden transition-all duration-300">
              <h1 className="text-sm font-bold text-gray-100 dark:text-gray-100 tracking-tight whitespace-nowrap">
                Society Tracker
              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                Maintenance
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {!collapsed && (
            <p className="px-3 mb-3 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em]">
              Navigation
            </p>
          )}
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-violet-500/15 text-violet-400 shadow-sm shadow-violet-500/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.06]'
                }`}
              >
                <link.icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive
                      ? 'text-violet-400'
                      : 'text-gray-500 group-hover:text-gray-300'
                  }`}
                />
                {!collapsed && <span className="whitespace-nowrap">{link.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 border-t border-white/[0.08]">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/[0.06] transition-all duration-200"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
