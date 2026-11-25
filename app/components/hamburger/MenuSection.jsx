"use client";

import { memo } from "react";
import { motion } from "framer-motion";

function MenuSection({ title, children }) {
  return (
    <div className="mb-4">
      {title && (
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          {title}
        </p>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

export default memo(MenuSection);