"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

function Header({
  onMenuClick,
  showAnimation = false,
  earnings = "$1,250",
  unreadCount = 2,
}) {
  const router = useRouter();

  return (
    <motion.header
      className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] h-16 z-40 bg-[#0f0b1e]/95 backdrop-blur-md border-b border-[#231A3D] px-4"
      initial={showAnimation ? { y: -60, opacity: 0 } : { y: 0, opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      transition={showAnimation ? { type: "spring", stiffness: 300, damping: 30 } : { duration: 0 }}
    >
      <div className="flex items-center justify-between h-full">
        {/* Left: Hamburger Drawer Trigger */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Open Navigation Drawer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Center: Branding */}
        <div 
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#762CFF] to-[#B13CFF] flex items-center justify-center font-black text-white text-xs shadow-md shadow-[#762CFF]/40">
            IP
          </div>
          <span className="font-bold text-sm tracking-tight text-white">
            INFLUENCER <span className="text-[#B13CFF]">PRO</span>
          </span>
        </div>

        {/* Right: Notifications & Quick Profile */}
        <div className="flex items-center gap-2">
          {/* Notifications Icon with Badge */}
          <button
            onClick={() => router.push('/notifications')}
            className="relative p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B13CFF] shadow-[0_0_6px_#B13CFF]" />
            )}
          </button>

          {/* Profile Shortcut */}
          <button
            onClick={() => router.push('/profile')}
            className="w-8 h-8 rounded-xl bg-[#1A1230] border border-[#2B1F4A] hover:border-[#B13CFF] flex items-center justify-center text-xs font-semibold text-white transition-colors cursor-pointer"
            aria-label="User Profile"
          >
            <svg className="w-4 h-4 text-[#B13CFF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;