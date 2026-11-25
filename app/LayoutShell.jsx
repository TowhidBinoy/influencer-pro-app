'use client';

import { usePathname } from 'next/navigation';

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  // If Admin route, allow full desktop screen width
  if (isAdmin) {
    return (
      <div className="min-h-screen w-full bg-[#07050E] text-white">
        {children}
      </div>
    );
  }

  // Influencer mobile-first layout
  return (
    <div className="min-h-screen w-full bg-[#07050E] text-white flex items-center justify-center sm:p-4 overflow-hidden select-none">
      <div className="w-full h-dvh sm:h-[844px] sm:max-h-[844px] sm:w-[390px] bg-[#07050E] sm:border sm:border-[#231A3D] sm:rounded-[38px] flex flex-col justify-between relative overflow-hidden shadow-2xl">
        <div 
          className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full blur-[100px] opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #B13CFF 0%, #762CFF 100%)' }}
        />
        <div className="w-full h-full flex flex-col justify-between relative z-10 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}