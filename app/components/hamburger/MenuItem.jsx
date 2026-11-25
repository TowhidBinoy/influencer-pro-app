"use client";

import Link from "next/link";
import { memo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { tokenStorage } from "../../api/tokenStorage";

function ItemGlyph({ name }) {
  switch (name) {
    case 'home':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'campaign':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case 'submit':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      );
    case 'earnings':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case 'leaderboard':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M6 2v7a6 6 0 0 0 12 0V2H6Z" />
        </svg>
      );
    case 'profile':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'support':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'logout':
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      );
    default:
      return null;
  }
}

function MenuItem({ label, link, action, iconName, onClose }) {
  const router = useRouter();

  const handleAction = () => {
    if (action === "logout") {
      tokenStorage.clearToken();
      router.push("/login");
      return;
    }
    if (action === "support") {
      window.location.href = `mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@influencerpro.io'}`;
    }
  };

  const isLogout = action === "logout";

  const content = (
    <motion.div
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
        isLogout
          ? "text-red-400 hover:bg-red-500/10"
          : "text-gray-300 hover:text-white hover:bg-white/5"
      }`}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="shrink-0 text-gray-400 group-hover:text-white">
        <ItemGlyph name={iconName} />
      </div>
      <span className="text-xs font-medium tracking-tight">
        {label}
      </span>
    </motion.div>
  );

  if (action) {
    return (
      <button
        onClick={() => { handleAction(); onClose?.(); }}
        className="block w-full text-left cursor-pointer"
        aria-label={label}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={link} onClick={onClose} className="block" aria-label={label}>
      {content}
    </Link>
  );
}

export default memo(MenuItem);