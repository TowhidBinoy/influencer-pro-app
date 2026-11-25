"use client";

import { motion, AnimatePresence } from "framer-motion";
import { memo } from "react";
import { useHamburgerMenu } from "./useHamburgerMenu";
import { MENU_CONFIG, ANIMATION_CONFIG } from "./menuConfig";
import MenuSection from "./MenuSection";
import MenuItem from "./MenuItem";

function HamburgerMenu({ isOpen, onClose }) {
  useHamburgerMenu(isOpen, onClose);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Overlay Backdrop */}
          <motion.div
            {...ANIMATION_CONFIG.overlay}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer Sidebar */}
          <div className="fixed inset-0 z-50 left-1/2 w-full max-w-[390px] -translate-x-1/2 pointer-events-none">
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={ANIMATION_CONFIG.sidebar.transition}
              className="pointer-events-auto absolute top-0 left-0 h-dvh w-[260px] overflow-y-auto bg-[#0f0b1e]/98 border-r border-[#231A3D] shadow-2xl p-5 flex flex-col justify-between"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div>
                {/* Header Branding & Close Button */}
                <div className="flex items-center justify-between pb-6 mb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#9033FF] to-[#D946EF] flex items-center justify-center font-black text-white text-xs shadow-md shadow-[#9033FF]/30">
                      IP
                    </div>
                    <span className="font-bold text-sm text-white tracking-tight">
                      INFLUENCER <span className="text-[#B13CFF]">PRO</span>
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Main Navigation Items */}
                <nav role="navigation">
                  <MenuSection title={MENU_CONFIG.mainNav.title}>
                    {MENU_CONFIG.mainNav.items.map((item, index) => (
                      <MenuItem key={index} {...item} onClose={onClose} />
                    ))}
                  </MenuSection>

                  <MenuSection title={MENU_CONFIG.support.title}>
                    {MENU_CONFIG.support.items.map((item, index) => (
                      <MenuItem key={index} {...item} onClose={onClose} />
                    ))}
                  </MenuSection>
                </nav>
              </div>

              {/* Footer Copyright */}
              <div className="pt-4 border-t border-white/5 text-[10px] text-gray-500 text-center">
                Influencer Pro © 2026
              </div>
            </motion.aside>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default memo(HamburgerMenu);