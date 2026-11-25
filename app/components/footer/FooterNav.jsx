"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { FOOTER_CONFIG, FOOTER_THEME } from './footerConfig';

function NavIcon({ name, active }) {
  const color = active ? FOOTER_THEME.activeColor : FOOTER_THEME.inactiveColor;

  switch (name) {
    case 'campaign':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case 'leaderboard':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-2.34" />
          <path d="M18 14.66V17c0 .55-.45 1-1 1h-2c-.55 0-1-.45-1-1v-2.34" />
          <path d="M6 2v7a6 6 0 0 0 12 0V2H6Z" />
        </svg>
      );
    case 'home':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'submit':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      );
    case 'earnings':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    default:
      return null;
  }
}

const FooterNavItem = memo(({ item, isActive }) => {
  const { label, link, isCenter, iconName } = item;

  if (isCenter) {
    return (
      <div className="relative flex-1 flex items-center justify-center">
        <Link href={link} className="flex flex-col items-center justify-center -top-5 relative">
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#762CFF] to-[#B13CFF] flex items-center justify-center shadow-lg shadow-[#762CFF]/40 border-2 border-[#07050E]"
          >
            <NavIcon name={iconName} active={true} />
          </motion.div>
          <span className="text-[10px] font-bold text-white mt-1">
            {label}
          </span>
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={link}
      className="flex-1 flex flex-col items-center justify-center py-2 transition-colors"
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center gap-1"
      >
        <NavIcon name={iconName} active={isActive} />
        <span
          className={`text-[10px] tracking-tight font-medium ${
            isActive ? 'text-[#B13CFF] font-bold' : 'text-slate-400'
          }`}
        >
          {label}
        </span>
      </motion.div>
    </Link>
  );
});

FooterNavItem.displayName = 'FooterNavItem';

function FooterNav() {
  const pathname = usePathname();

  // Hide bottom nav on admin portal and auth screens
  if (pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname === '/') {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] h-18 z-40 bg-[#0f0b1e]/95 border-t border-[#231A3D] backdrop-blur-lg px-2 flex items-center justify-between">
      <nav className="w-full flex items-center justify-between" role="navigation" aria-label="Bottom Navigation">
        {FOOTER_CONFIG.navItems.map((item) => {
          const isActive = pathname === item.link;
          return <FooterNavItem key={item.id} item={item} isActive={isActive} />;
        })}
      </nav>
    </footer>
  );
}

export default memo(FooterNav);