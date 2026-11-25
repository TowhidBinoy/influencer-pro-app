'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Today',
      path: '/dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      name: 'Earnings',
      path: '/earnings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      ),
    },
    {
      name: 'Campaign',
      path: '/campaign',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 3 21 20 3 20" />
        </svg>
      ),
    },
    {
      name: 'Leaderboard',
      path: '/leaderboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
        </svg>
      ),
    },
    {
      name: 'More',
      path: '/more',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      ),
    },
  ];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] bg-[#100B1E]/95 backdrop-blur-lg border border-[#23183D] rounded-[22px] p-2 flex items-center justify-around shadow-2xl z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.path || (item.path === '/dashboard' && pathname === '/');
        return (
          <Link
            key={item.name}
            href={item.path}
            className={`flex flex-col items-center justify-center py-2 px-3.5 rounded-2xl transition-all duration-300 relative ${
              isActive
                ? 'bg-[#8B31FF] text-white shadow-lg shadow-[#8B31FF]/50 font-bold'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1 tracking-tight">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}