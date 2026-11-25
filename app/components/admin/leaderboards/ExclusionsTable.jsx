"use client";

import ArchiveButton from "./ArchiveButton";

function formatDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US");
}

export default function ExclusionsTable({ rows = [], onArchive }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
              <th className="px-5 py-3">Influencer ID</th>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Tier</th>
              <th className="px-5 py-3">Excluded On</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                  No excluded influencers.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.uuid || row.member_id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-white">{row.member_id}</td>
                  <td className="px-5 py-4 text-white font-medium">{row.full_name || "-"}</td>
                  <td className="px-5 py-4 text-gray-400">{row.tier || "Gold"}</td>
                  <td className="px-5 py-4 text-gray-400">{formatDate(row.created)}</td>
                  <td className="px-5 py-4">
                    <ArchiveButton onClick={() => onArchive?.(row)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}