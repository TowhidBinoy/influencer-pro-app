'use client';

/**
 * There is no affiliate/commission-tier system in the backend — no
 * `/admin/affiliates/` or `/admin/affiliates/tiers/` endpoint exists
 * anywhere in doc/API.md (confirmed against the full changelog through
 * 1.6). The only affiliate-related field is `affiliate_link` /
 * `affiliate_link_status` on a member's job application (§16), set from
 * Companies > a job > Applicants > Approve — not a referral/commission
 * program. This page previously rendered hardcoded fake tiers, top
 * affiliates and stats that never reflected real data; it's hidden from
 * the admin nav (see app/admin/layout.js) but is replaced with an honest
 * "not available" state here in case it's reached directly.
 */
export default function AffiliatesPage() {
  return (
    <div className="w-full min-h-full flex flex-col justify-start font-sans select-none">
      <div>
        <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">Affiliate & Commission Engine</h2>
        <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
          This feature isn&apos;t available yet — there&apos;s no backend support for referral tiers or commissions.
        </p>
      </div>

      <div className="mt-6 p-8 text-center bg-[#120D22] border border-[#231A3D] rounded-2xl space-y-3 max-w-lg">
        <div className="w-12 h-12 rounded-2xl bg-[#1A1230] border border-[#2B1F4A] flex items-center justify-center mx-auto text-slate-400">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <p className="text-xs font-bold text-white">No commission/referral system yet</p>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Each member&apos;s affiliate tracking link is managed per job instead — go to Companies, open a job&apos;s Applicants tab, and set the affiliate link when approving.
        </p>
      </div>
    </div>
  );
}
