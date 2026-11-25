"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { HamburgerMenu } from "../hamburger";
import { FooterNav } from "../footer";
import { Header } from "../header";

export default function AppLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isAdminRoute = pathname?.startsWith("/admin");
  const isAuthRoute = pathname?.startsWith("/login") || pathname === "/";

  // For Admin and Auth pages, do not render mobile creator Header/Footer
  if (isAdminRoute || isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full pt-16 pb-20 relative bg-[#07050E] text-white">
      {/* Global Creator Header */}
      <Header
        onMenuClick={() => setIsMenuOpen(true)}
      />

      {/* Hamburger Drawer Menu */}
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Page Content */}
      <main className="w-full h-full overflow-y-auto">{children}</main>

      {/* Global Creator Bottom Navigation */}
      <FooterNav />
    </div>
  );
}