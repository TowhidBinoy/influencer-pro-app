"use client";

import { useState, useCallback, memo } from "react";
import { HamburgerMenu } from "../hamburger";
import { FooterNav } from "../footer";
import { Header } from "../header";
import HomeHero from "./HomeHero";

const Home = memo(function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuOpen = useCallback(() => setIsMenuOpen(true), []);
  const handleMenuClose = useCallback(() => setIsMenuOpen(false), []);

  return (
    <div className="min-h-screen w-full pt-16 pb-20 relative bg-[#07050E]">
      <Header
        onMenuClick={handleMenuOpen}
        earnings="$1,450.00"
      />

      <HamburgerMenu isOpen={isMenuOpen} onClose={handleMenuClose} />

      <main className="w-full px-4 py-4 space-y-4">
        <HomeHero />
      </main>

      <FooterNav />
    </div>
  );
});

export default Home;