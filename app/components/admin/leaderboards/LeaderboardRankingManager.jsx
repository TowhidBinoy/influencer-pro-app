"use client";

import { useMemo, useState } from "react";
import RankingTable from "./RankingTable";
import ExclusionsTable from "./ExclusionsTable";
import AddExclusionsModal from "./AddExclusionsModal";
import Button from "../ui/Button";

const PAGE_SIZE = 7;

export default function LeaderboardRankingManager({ rows = [], type = "earnings" }) {
  const [rankings, setRankings] = useState(rows);
  const [rankingPage, setRankingPage] = useState(1);
  const [exclusions, setExclusions] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [memberIds, setMemberIds] = useState("");
  const [addError, setAddError] = useState("");
  const [addBusy, setAddBusy] = useState(false);

  const pagedRankings = useMemo(
    () => rankings.slice((rankingPage - 1) * PAGE_SIZE, rankingPage * PAGE_SIZE),
    [rankings, rankingPage],
  );

  const handleArchiveRanking = (item) => {
    setRankings((prev) => prev.filter((r) => (r.id || r.memberId) !== (item.id || item.memberId)));
    setExclusions((prev) => [...prev, { member_id: item.memberId || item.id, full_name: item.fullName || item.name, created: new Date().toISOString() }]);
  };

  const handleArchiveExclusion = (item) => {
    setExclusions((prev) => prev.filter((e) => e.member_id !== item.member_id));
  };

  const handleAddExclusion = () => {
    if (!memberIds.trim()) {
      setAddError("Please enter at least one ID.");
      return;
    }
    setAddBusy(true);
    setTimeout(() => {
      const ids = memberIds.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      const newItems = ids.map((id) => ({
        member_id: id,
        full_name: `User ${id}`,
        created: new Date().toISOString(),
      }));
      setExclusions((prev) => [...prev, ...newItems]);
      setAddBusy(false);
      setAddOpen(false);
      setMemberIds("");
      setAddError("");
    }, 400);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="text-base font-semibold text-white mb-4">Rankings</h3>
        <RankingTable rows={pagedRankings} type={type} onArchive={handleArchiveRanking} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Excluded Influencers</h3>
          <Button size="sm" onClick={() => setAddOpen(true)}>Add Exclusion</Button>
        </div>
        <ExclusionsTable rows={exclusions} onArchive={handleArchiveExclusion} />
      </div>

      <AddExclusionsModal
        open={addOpen}
        value={memberIds}
        busy={addBusy}
        error={addError}
        onChange={setMemberIds}
        onSubmit={handleAddExclusion}
        onClose={() => setAddOpen(false)}
      />
    </div>
  );
}