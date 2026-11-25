"use client";

import { useMemo } from "react";

export default function MemberTable({ members = [] }) {
  const displayData = useMemo(() => {
    return members.slice(0, 10).map((member) => {
      let lastActive = 'Never';
      if (member.last_login_datetime || member.last_active) {
        const date = new Date(member.last_login_datetime || member.last_active);
        lastActive = date.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        });
      }

      return {
        id: member.id || member.uuid,
        name: member.name || member.full_name || member.username || 'Creator',
        handle: member.handle || member.username ? `@${(member.handle || member.username).replace(/^@/, '')}` : '@influencer',
        lastActive,
        tier: member.tier || member.level || 'Gold Influencer',
        earnings: member.total_earnings || member.balance || 0,
        tasksCompleted: member.tasks_completed || member.posts_count || 0,
      };
    });
  }, [members]);

  if (!members.length) {
    return (
      <div className="w-full py-8 text-center text-sm text-gray-400">
        No influencer records available.
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      {/* Table Header */}
      <div className="grid grid-cols-6 gap-4 border-b border-white/10 bg-[#0d091a] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        <p>Influencer</p>
        <p>Handle</p>
        <p>Tier / Level</p>
        <p>Total Earnings</p>
        <p>Completed Tasks</p>
        <p>Last Active</p>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-white/5">
        {displayData.map((row) => (
          <div key={row.id} className="grid grid-cols-6 gap-4 px-5 py-3.5 items-center hover:bg-white/[0.02] transition-colors text-sm">
            <p className="font-medium text-white">{row.name}</p>
            <p className="text-xs font-mono text-[#B13CFF]">{row.handle}</p>
            <p className="text-gray-300">{row.tier}</p>
            <p className="font-semibold text-emerald-400">${Number(row.earnings).toLocaleString()}</p>
            <p className="text-gray-300">{row.tasksCompleted}</p>
            <p className="text-xs text-gray-400">{row.lastActive}</p>
          </div>
        ))}
      </div>
    </div>
  );
}