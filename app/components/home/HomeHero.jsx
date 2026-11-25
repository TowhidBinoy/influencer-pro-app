"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const HomeHero = memo(function HomeHero() {
  return (
    <div className="space-y-4">
      {/* Creator Greeting & Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 bg-gradient-to-br from-[#1A1033] to-[#120D22] border border-[#2B1F4A] shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#B13CFF]/15 rounded-full blur-2xl pointer-events-none" />
        
        <p className="text-xs font-semibold text-[#B13CFF] uppercase tracking-wider">
          Creator Overview
        </p>
        <h2 className="text-2xl font-black text-white mt-1">
          $1,450.00
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Available balance ready for withdrawal
        </p>

        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <Link
            href="/submit-proof"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#9033FF] hover:bg-[#7825DC] text-white text-xs font-bold shadow-md shadow-[#9033FF]/30 transition-all"
          >
            <span>+</span> Submit Proof
          </Link>
          <Link
            href="/earnings"
            className="flex items-center justify-center py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-all"
          >
            View Payouts
          </Link>
        </div>
      </motion.div>

      {/* Active Tasks Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-4 bg-[#120D22] border border-[#231A3D] flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#9033FF]/20 border border-[#9033FF]/40 flex items-center justify-center text-lg">
            🔥
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">4 New Campaigns</h4>
            <p className="text-[10px] text-slate-400">Available to join today</p>
          </div>
        </div>
        <Link
          href="/campaign"
          className="text-xs font-bold text-[#B13CFF] hover:underline"
        >
          Explore →
        </Link>
      </motion.div>
    </div>
  );
});

export default HomeHero;