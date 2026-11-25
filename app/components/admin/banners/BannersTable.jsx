"use client";

import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import { BANNER_LOCATION as LOCATION_LABELS } from "../../../../lib/choices";

export default function BannersTable({ banners = [], onEdit, onArchive }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03]">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <th className="px-5 py-3 text-left">Preview</th>
              <th className="px-5 py-3 text-left">Title</th>
              <th className="px-5 py-3 text-left">Placement</th>
              <th className="px-5 py-3 text-left">Destination</th>
              <th className="px-5 py-3 text-left">Expiry</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {banners.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-5 py-8 text-center text-sm text-gray-400">
                  No banners active. Click above to create one.
                </td>
              </tr>
            ) : (
              banners.map((banner) => (
                <tr key={banner.uuid || banner.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <img
                      src={banner.image || '/placeholder-banner.png'}
                      alt={banner.name}
                      className="w-20 h-12 object-cover rounded border border-white/10"
                    />
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-white">{banner.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-400">
                    <StatusBadge tone="neutral" showDot={false}>
                      {LOCATION_LABELS[banner.location] || 'Unknown'}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-400">
                    {banner.link ? (
                      <a
                        href={banner.link.startsWith('http') ? banner.link : `https://${banner.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#B13CFF] hover:underline"
                      >
                        {banner.link.length > 30 ? banner.link.substring(0, 30) + '...' : banner.link}
                      </a>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-400">
                    {formatDate(banner.active_until)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge tone={banner.is_live ? 'success' : 'danger'}>
                      {banner.is_live ? 'Active' : 'Not Live'}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => onEdit?.(banner)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onArchive?.(banner)}>
                        Archive
                      </Button>
                    </div>
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