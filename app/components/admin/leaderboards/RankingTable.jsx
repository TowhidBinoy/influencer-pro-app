"use client";

import ArchiveButton from "./ArchiveButton";

function fmt(n) {
  if (n == null || n === "") return "0";
  const num = Number(n);
  return Number.isFinite(num) ? num.toLocaleString("en-US") : String(n);
}

export default function RankingTable({ rows = [], type = "earnings", onArchive }) {
  const isReferral = type === "referral";
  const metricLabel = isReferral ? "Referral Earnings" : "Total Earnings";
  const countLabel = isReferral ? "Referrals" : "Completed Tasks";
  const hasActions = typeof onArchive === "function";

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
              <th className="px-5 py-3">Rank</th>
              <th className="px-5 py-3">Influencer</th>
              <th className="px-5 py-3">Handle</th>
              <th className="px-5 py-3">{metricLabel}</th>
              <th className="px-5 py-3">{countLabel}</th>
              {hasActions && <th className="px-5 py-3 text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={hasActions ? 6 : 5} className="px-5 py-8 text-center text-gray-400">
                  No leaderboard records found.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id ?? row.memberId ?? index} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 font-bold text-[#B13CFF]">#{row.rank || index + 1}</td>
                  <td className="px-5 py-4 font-medium text-white">{row.fullName || row.name || "Creator"}</td>
                  <td className="px-5 py-4 text-xs text-gray-400">{row.memberId || "@creator"}</td>
                  <td className="px-5 py-4 font-semibold text-emerald-400">${fmt(row.amount || row.earnings)}</td>
                  <td className="px-5 py-4 text-gray-300">{fmt(row.count || row.tasks)}</td>
                  {hasActions && (
                    <td className="px-5 py-4">
                      <ArchiveButton onClick={() => onArchive(row)} />
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}