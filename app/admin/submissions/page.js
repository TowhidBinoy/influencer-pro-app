'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../lib/api';
import { ENDPOINTS } from '../../../lib/endpoints';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { useToast } from '../../components/admin/ui/Toast';
import SubmissionsPanel from '../../components/admin/jobs/SubmissionsPanel';

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

export default function SubmissionsPickerPage() {
  const toast = useToast();

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeJob, setActiveJob] = useState(null);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await apiFetch(`${ENDPOINTS.ADMIN.JOB_LIST}?page_size=200`);
      const rows = Array.isArray(data?.results) ? data.results : [];
      rows.sort((a, b) => (a.org || '').localeCompare(b.org || '') || a.title.localeCompare(b.title));
      setJobs(rows);
    } catch (err) {
      setLoadError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const filteredJobs = jobs.filter((job) => {
    const term = searchTerm.toLowerCase();
    return job.title.toLowerCase().includes(term) || (job.org || '').toLowerCase().includes(term);
  });

  return (
    <div className="w-full min-h-full space-y-4 sm:space-y-6 pb-2 select-none flex flex-col justify-start font-sans">

      {activeJob && (
        <div className="flex items-center gap-1.5 text-xs sm:text-sm shrink-0 flex-wrap">
          <button
            onClick={() => setActiveJob(null)}
            className="font-bold text-slate-400 hover:text-[#B13CFF] transition-colors cursor-pointer"
          >
            Submissions
          </button>
          <span className="text-slate-600">/</span>
          <span className="font-bold text-white truncate max-w-[220px] sm:max-w-none">{activeJob.title}</span>
        </div>
      )}

      {!activeJob && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">Proof Submissions & Verification</h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Pick a job to review its submitted proof.</p>
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search by job or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#120D22] border border-[#2B1F4A] focus:border-[#762CFF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none w-full shadow-inner"
              />
            </div>
          </div>

          {loadError && (
            <div className="p-3 bg-[#FF2A55]/15 border border-[#FF2A55]/40 text-[#FF2A55] text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
              <span>{loadError}</span>
              <button onClick={loadJobs} className="underline shrink-0 cursor-pointer">Retry</button>
            </div>
          )}

          <div className="bg-[#120D22] border border-[#231A3D] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 flex-1">
            {isLoading ? (
              <p className="text-xs text-slate-400 text-center py-10">Loading jobs...</p>
            ) : filteredJobs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">No jobs found.</p>
            ) : (
              <>
                {/* MOBILE VIEW: Cards */}
                <div className="block sm:hidden space-y-3">
                  {filteredJobs.map((job) => (
                    <button
                      key={job.uuid}
                      onClick={() => setActiveJob(job)}
                      className="w-full text-left bg-[#18112E] border border-[#261A45] rounded-2xl p-3.5 space-y-1.5 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-white text-xs leading-tight">{job.title}</p>
                        {job.is_live && <StatusBadge tone="success" showDot={false}>LIVE</StatusBadge>}
                      </div>
                      <p className="text-[11px] text-[#B13CFF]">{job.org}</p>
                    </button>
                  ))}
                </div>

                {/* DESKTOP VIEW: Data Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[600px]">
                    <thead>
                      <tr className="border-b border-[#231A3D] text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="pb-3 px-3">Job</th>
                        <th className="pb-3 px-3">Company</th>
                        <th className="pb-3 px-3">Status</th>
                        <th className="pb-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C1438]">
                      {filteredJobs.map((job) => (
                        <tr key={job.uuid} className="hover:bg-[#1A1230]/50 transition-colors">
                          <td className="py-3.5 px-3 font-bold text-white">{job.title}</td>
                          <td className="py-3.5 px-3 text-[#B13CFF]">{job.org}</td>
                          <td className="py-3.5 px-3">
                            {job.is_live ? (
                              <StatusBadge tone="success" showDot={false}>LIVE</StatusBadge>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              onClick={() => setActiveJob(job)}
                              className="px-3.5 py-1.5 bg-[#762CFF] hover:bg-[#8B31FF] rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer shadow-sm"
                            >
                              View Submissions
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {activeJob && (
        <SubmissionsPanel toast={toast} job={activeJob} />
      )}

    </div>
  );
}
