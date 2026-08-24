import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, User } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 border-b border-white/[0.08] bg-white/[0.02] dark:bg-white/[0.02] backdrop-blur-xl">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400 text-[10px] font-semibold uppercase tracking-wider">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="relative p-2.5 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-white/[0.06] transition-all duration-200"
          aria-label="Toggle theme"
        >
          <div className="relative w-5 h-5">
            <Sun
              className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
                isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
              }`}
            />
            <Moon
              className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
                isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
              }`}
            />
          </div>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-white/[0.08]" />

        {/* User info */}
        <div className="flex items-center gap-3 pl-2">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-200">{user?.name}</p>
            <p className="text-[11px] text-gray-500">{user?.email}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
