"use client";

import Link from "next/link";

export default function HistoryPageShell({ title, memberName, memberId, children }) {
  return (
    <main className="min-h-screen px-4 pt-6 pb-10 sm:px-6 md:px-8 xl:pl-[300px] xl:pr-10 xl:pt-8">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-bold text-xl sm:text-2xl text-white">
          {title}
        </h1>
      </div>

      {/* Back link */}
      <Link
        href="/admin/influencers"
        className="inline-flex items-center gap-1 text-[13px] text-gray-400 hover:text-white transition-colors mb-3"
      >
        <span>&#8249;</span> Back to Influencer Directory
      </Link>

      {/* Subtitle */}
      {memberName && (
        <p className="text-[13px] text-[#B13CFF] mb-6">
          Viewing details for: <span className="font-semibold text-white">{memberName}</span>
          {memberId && (
            <span className="text-gray-500 ml-2 font-mono text-[12px]">({memberId})</span>
          )}
        </p>
      )}

      {/* Content */}
      <div className="w-full">
        {children}
      </div>
    </main>
  );
}