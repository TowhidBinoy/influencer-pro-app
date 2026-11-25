'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../../lib/api';
import { ENDPOINTS } from '../../../../lib/endpoints';
import { CONTENT_TYPE as CONTENT_TYPE_LABELS, PLATFORM as PLATFORM_LABELS } from '../../../../lib/choices';

function formatError(err) {
  if (err?.error) return err.error;
  if (err?.detail) return err.detail;
  if (err?.details && typeof err.details === 'string') return err.details;
  if (err?.details && typeof err.details === 'object') {
    const firstKey = Object.keys(err.details)[0];
    const val = err.details[firstKey];
    return Array.isArray(val) ? val[0] : val;
  }
  return 'Something went wrong. Please try again.';
}

export default function ResultsPanel({ org, job }) {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [selectedMember, setSelectedMember] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState('');

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [pendingResult, rosterResult] = await Promise.allSettled([
        apiFetch(ENDPOINTS.ADMIN.RESULTS_PENDING(job.uuid)),
        apiFetch(`${ENDPOINTS.ADMIN.JOB_MEMBERS(org.uuid, job.uuid)}?page_size=200`),
      ]);

      if (pendingResult.status !== 'fulfilled') {
        setLoadError(formatError(pendingResult.reason));
        setRows([]);
        return;
      }

      const pending = Array.isArray(pendingResult.value) ? pendingResult.value : [];
      const roster = rosterResult.status === 'fulfilled'
        ? (Array.isArray(rosterResult.value?.results) ? rosterResult.value.results : [])
        : [];
      const nameByUuid = new Map(roster.map((m) => [m.member_uuid, m.member]));

      setRows(pending.map((r) => ({ ...r, member: nameByUuid.get(r.member_uuid) || r.member_uuid })));
    } finally {
      setIsLoading(false);
    }
  }, [org.uuid, job.uuid]);

  useEffect(() => { loadRows(); }, [loadRows]);

  const openMember = async (row) => {
    setSelectedMember(row);
    setIsLoadingTasks(true);
    setTaskError('');
    try {
      const data = await apiFetch(ENDPOINTS.ADMIN.RESULTS_MEMBER(job.uuid, row.member_uuid));
      setTasks(Array.isArray(data?.tasks) ? data.tasks : []);
    } catch (err) {
      setTaskError(formatError(err));
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const closeModal = () => {
    setSelectedMember(null);
    setTasks([]);
    setTaskError('');
  };

  return (
    <div className="space-y-4">
      {loadError && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
          <span>{loadError}</span>
          <button onClick={loadRows} className="font-bold underline shrink-0 cursor-pointer">Retry</button>
        </div>
      )}

      <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
        {isLoading ? (
          <p className="text-xs text-slate-400 text-center py-10">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">Everyone has submitted their results.</p>
        ) : (
          <div className="space-y-2.5">
            {rows.map((row) => (
              <button
                key={row.member_uuid}
                onClick={() => openMember(row)}
                className="w-full flex items-center justify-between gap-3 bg-[#18112E] border border-[#261A45] hover:border-[#762CFF]/60 rounded-2xl p-3.5 transition-all cursor-pointer text-left"
              >
                <span className="text-xs font-bold text-white truncate">{row.member}</span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                  {row.pending_result_count} pending
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedMember && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-md bg-[#120D22] border border-[#2B1F4A] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#231A3D] pb-3">
              <h3 className="font-bold text-white text-sm">{selectedMember.member}</h3>
              <button onClick={closeModal} className="w-7 h-7 rounded-full bg-[#18112E] text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer">✕</button>
            </div>

            {taskError && <p className="text-rose-400 text-[11px]">{taskError}</p>}

            {isLoadingTasks ? (
              <p className="text-xs text-slate-400 text-center py-8">Loading...</p>
            ) : (
              <div className="space-y-2.5">
                {tasks.map((task) => (
                  <div key={task.uuid} className="p-3 bg-[#18112E] border border-[#281B45] rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Day {task.day_number}</span>
                      <span className="text-[10px] text-slate-400">
                        {CONTENT_TYPE_LABELS[task.content_type] || 'Post'} · {PLATFORM_LABELS[task.platform] || ''}
                      </span>
                    </div>

                    {task.has_result ? (
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-4 gap-1.5 text-center">
                          {[
                            { label: 'Views', value: task.views },
                            { label: 'Likes', value: task.likes },
                            { label: 'Comments', value: task.comments },
                            { label: 'Shares', value: task.shares },
                          ].map((f) => (
                            <div key={f.label} className="bg-[#120D22] border border-[#2B1F4A] rounded-lg py-1.5">
                              <div className="text-xs font-bold text-white">{f.value ?? '—'}</div>
                              <div className="text-[9px] text-slate-500 uppercase">{f.label}</div>
                            </div>
                          ))}
                        </div>
                        {task.metrics_screenshot && (
                          <a
                            href={task.metrics_screenshot}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-[11px] text-[#B13CFF] hover:underline"
                          >
                            View screenshot ↗
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500">Not submitted yet</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
