'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * "/" is the member site's entry point — it always goes to the member
 * login, no session checks. Member and admin are separate sites reached
 * independently ("/login" vs "/admin/login"); this doesn't inspect either
 * one's session to decide anything.
 */
export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#762CFF] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}