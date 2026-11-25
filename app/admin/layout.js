'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthService } from '../../services/auth';
import AdminNotificationBell from '../components/admin/AdminNotificationBell';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  Video, 
  FileText, 
  LogOut, 
  Search, 
  Menu, 
  X 
} from 'lucide-react';

const POSTDESK_MENU = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'User Management', path: '/admin/users', icon: Users },
  { name: 'Frame Management', path: '/admin/frames', icon: Layers },
  { name: 'Video Management', path: '/admin/videos', icon: Video },
  { name: 'Audit Log', path: '/admin/audit-log', icon: FileText },
];

function AdminChrome({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  // Client-side hydration safety
  useEffect(() => {
    const user = AuthService.getCurrentUser('admin');
    setAdminUser(user || { full_name: 'Marcus Brody', username: 'admin' });
  }, []);

  const handleLogout = () => {
    AuthService.logout('/admin/login', 'admin');
  };

  return (
    <div className="fixed inset-0 z-[99999] w-screen h-screen bg-[#07050E] text-slate-100 flex flex-row font-sans antialiased overflow-hidden select-none">
      
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] lg:hidden"
        />
      )}

      {/* 1. POSTDESK SIDEBAR */}
      <aside
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-[101] bg-[#0A0714] border-r border-[#1F1833]
          transition-all duration-300 flex flex-col justify-between shrink-0 h-full
          ${isMobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}
        `}
      >
        <div>
          {/* Logo Branding */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-[#1F1833] shrink-0">
            <div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={() => router.push('/admin')}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shadow-[#8B31FF]/30 shrink-0"
                style={{ background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)' }}
              >
                <span className="text-white font-black text-sm">✦</span>
              </div>
              {(isSidebarOpen || isMobileMenuOpen) && (
                <div className="overflow-hidden whitespace-nowrap">
                  <span className="font-extrabold text-sm tracking-wide text-white block">PostDesk</span>
                  <span className="text-[8px] font-bold text-purple-400/80 tracking-widest uppercase block">INFLUENCER MANAGEMENT</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {POSTDESK_MENU.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === '/admin' 
                ? pathname === '/admin' 
                : pathname.startsWith(item.path);

              return (
                <Link
                  key={item.name}
                  href={item.path}
                  prefetch={false}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-[#8B31FF] text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-[#161126]'
                  }`}
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-300'}`} />
                  {(isSidebarOpen || isMobileMenuOpen) && (
                    <span className="truncate tracking-wide">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account Bar */}
        <div className="p-3 border-t border-[#1F1833] shrink-0">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#110D20] border border-[#231A3D]">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-purple-900/60 border border-purple-500/30 text-purple-200 font-bold text-xs flex items-center justify-center shrink-0">
                {adminUser?.full_name ? adminUser.full_name.charAt(0).toUpperCase() : 'M'}
              </div>
              {(isSidebarOpen || isMobileMenuOpen) && (
                <div className="overflow-hidden truncate">
                  <p className="text-xs font-semibold text-white leading-none truncate">
                    {adminUser ? (adminUser.full_name || adminUser.username) : 'Marcus Brody'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 truncate font-mono">
                    @{adminUser ? adminUser.username : 'admin'}
                  </p>
                </div>
              )}
            </div>
            {(isSidebarOpen || isMobileMenuOpen) && (
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-[#1B142F] shrink-0 cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT & NAVBAR */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#07050E]">
        <header className="h-16 bg-[#0A0714]/90 backdrop-blur-md border-b border-[#1F1833] px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#140E26] text-slate-300 hover:text-white border border-[#231A3D]"
            >
              <Menu className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex p-2 rounded-xl bg-[#140E26] text-slate-300 hover:text-white border border-[#231A3D] cursor-pointer hover:border-[#8B31FF] transition-all"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Search Bar */}
            <div className="relative w-48 sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full bg-[#110D20] border border-[#231A3D] focus:border-[#8B31FF] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AdminNotificationBell />
            <div className="px-3 py-1.5 rounded-xl bg-[#8B31FF]/15 border border-[#8B31FF]/30 text-[10px] font-bold text-purple-300 tracking-wider uppercase">
              ADMIN PORTAL
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-hide overscroll-contain">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return (
      <div className="fixed inset-0 z-[99999] w-screen h-screen bg-[#07050E] overflow-y-auto">
        {children}
      </div>
    );
  }

  return <AdminChrome>{children}</AdminChrome>;
}