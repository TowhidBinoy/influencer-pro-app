'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import { ENDPOINTS } from '../../../lib/endpoints';

export default function AdminNotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('imp_admin_access_token');
    if (!token) return;

    apiFetch(ENDPOINTS.ADMIN.NOTIFICATIONS_UNREAD_COUNT)
      .then((data) => { if (!cancelled) setUnreadCount(data?.count || 0); })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  return (
    <Link
      href="/admin/notifications"
      className="relative cursor-pointer p-2 hover:bg-[#20153D] rounded-xl transition-all focus:outline-none"
      title="Notifications"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C10.34 2 9 3.34 9 5C9 5.86 9.36 6.64 9.94 7.2C9.36 7.07 8.7 7 8 7C5.24 7 3 9.24 3 12C3 14.76 5.24 17 8 17C9.34 17 10.55 16.47 11.45 15.61L10.2 21H13.8L12.55 15.61C13.45 16.47 14.66 17 16 17C18.76 17 21 14.76 21 12C21 9.24 18.76 7 16 7C15.3 7 14.64 7.07 14.06 7.2C14.64 6.64 15 5.86 15 5C15 3.34 13.66 2 12 2Z" fill="#B9AEDD" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#FF2A55] text-white text-[9px] font-bold flex items-center justify-center shadow-md shadow-[#FF2A55]/40">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
