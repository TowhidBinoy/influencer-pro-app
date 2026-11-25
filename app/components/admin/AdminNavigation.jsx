"use client";

import { useRouter, usePathname } from "next/navigation";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", path: "/admin" },
  { id: "influencers", label: "Influencers", path: "/admin/influencers" },
  { id: "jobs", label: "Campaigns & Jobs", path: "/admin/jobs" },
  { id: "submissions", label: "Submissions", path: "/admin/submissions" },
  { id: "payouts", label: "Payouts", path: "/admin/payouts" },
  { id: "affiliates", label: "Affiliates", path: "/admin/affiliates" },
  { id: "banners", label: "Banners", path: "/admin/banners" },
  { id: "settings", label: "Settings", path: "/admin/settings" },
];

export default function AdminNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname.startsWith(path);
  };

  return (
    <nav className="flex flex-col gap-1.5" role="navigation" aria-label="Admin navigation">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.path);
        return (
          <button
            key={item.id}
            onClick={() => router.push(item.path)}
            className={`
              w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${active ? "bg-[#9033FF] text-white font-semibold shadow-lg shadow-[#9033FF]/20" : "text-gray-300 hover:text-white hover:bg-white/5"}
            `}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}