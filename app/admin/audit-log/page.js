'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown, CheckCircle2 } from 'lucide-react';

const AUDIT_LOGS_DATA = [
  {
    id: 'log_1',
    timestamp: 'Jan 20, 2026 14:32:01',
    user: 'Eliska Jones',
    actionType: 'REEL SUBMITTED',
    description: 'Submitted active Instagram link for Cosplay Gaming #2',
    ipAddress: '192.168.1.42',
    actionStyle: 'text-purple-300 bg-purple-900/30 border-purple-500/30',
  },
  {
    id: 'log_2',
    timestamp: 'Jan 21, 2026 09:15:32',
    user: 'Marcus Lee',
    actionType: 'REVIEW',
    description: 'Downloaded Video for VR Adventure #1',
    ipAddress: '192.168.1.50',
    actionStyle: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  },
  {
    id: 'log_3',
    timestamp: 'Jan 22, 2026 11:45:10',
    user: 'Sofia Patel',
    actionType: 'APPROVED',
    description: 'Approved Submission for Fantasy Quest',
    ipAddress: '192.168.1.15',
    actionStyle: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    id: 'log_4',
    timestamp: 'Jan 23, 2026 13:30:45',
    user: 'David Kim',
    actionType: 'APPROVED',
    description: 'Approved Submission for the Puzzle Escape',
    ipAddress: '192.168.1.60',
    actionStyle: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    id: 'log_5',
    timestamp: 'Jan 24, 2026 15:20:00',
    user: 'Aisha Gupta',
    actionType: 'DELETED',
    description: 'Deleted Submission for Retro Racer',
    ipAddress: '192.168.1.30',
    actionStyle: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
  {
    id: 'log_6',
    timestamp: 'Jan 20, 2026 13:10:45',
    user: 'Marcus Brody',
    actionType: 'USER DELETED',
    description: 'Removed testing user KOC_Demo99 from the group',
    ipAddress: '192.168.1.1',
    actionStyle: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
];

const ACTION_OPTIONS = ['All', 'REEL SUBMITTED', 'REVIEW', 'APPROVED', 'DELETED', 'USER DELETED'];

export default function AuditLogPage() {
  const [logs] = useState(AUDIT_LOGS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipAddress.includes(searchQuery) ||
        log.timestamp.toLowerCase().includes(searchQuery.toLowerCase());

      const matchAction = selectedAction === 'All' || log.actionType === selectedAction;

      return matchSearch && matchAction;
    });
  }, [logs, searchQuery, selectedAction]);

  return (
    <div className="w-full space-y-6 select-none font-sans text-slate-200 pb-16 animate-in fade-in duration-300">
      
      {/* 1. Header Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
          Audit Log
        </h1>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Filter logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#16102B] border border-[#261E3E] focus:border-[#8B31FF] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* Action Custom Dropdown */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-[#16102B] border border-[#261E3E] hover:border-[#8B31FF]/50 rounded-xl px-4 py-2.5 text-xs text-slate-300 transition-all cursor-pointer"
          >
            <span>Action: {selectedAction}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-purple-400' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-[110%] left-0 w-48 z-50 bg-[#140E26] border border-[#2F2150] rounded-xl py-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              {ACTION_OPTIONS.map((action) => (
                <div
                  key={action}
                  onClick={() => {
                    setSelectedAction(action);
                    setIsDropdownOpen(false);
                  }}
                  className={`px-3.5 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    selectedAction === action ? 'bg-[#8B31FF] text-white font-semibold' : 'text-slate-300 hover:bg-[#1E153A]'
                  }`}
                >
                  <span>{action === 'All' ? 'All Actions' : action}</span>
                  {selectedAction === action && <CheckCircle2 className="w-3 h-3" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Main Data Container */}
      <div className="bg-[#110D20] border border-[#211A35] rounded-2xl p-5 sm:p-6 shadow-xl">
        
        {/* ================= MOBILE VIEW: Cards ================= */}
        <div className="block md:hidden space-y-3">
          {filteredLogs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No audit logs matching query.</p>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-[#16102B] border border-[#251B40] rounded-xl p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white">{log.user}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${log.actionStyle}`}>
                    {log.actionType}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {log.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#20173D] text-[10px] text-slate-500 font-mono">
                  <span>{log.timestamp}</span>
                  <span className="text-purple-300">{log.ipAddress}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ================= DESKTOP VIEW: Data Table ================= */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="text-slate-500 uppercase text-[10px] tracking-wider border-b border-[#211A35]">
                <th className="pb-3.5 px-4 font-semibold">TIMESTAMP</th>
                <th className="pb-3.5 px-4 font-semibold">USER</th>
                <th className="pb-3.5 px-4 font-semibold text-center">ACTION TYPE</th>
                <th className="pb-3.5 px-4 font-semibold">DESCRIPTION</th>
                <th className="pb-3.5 px-4 font-semibold text-right">IP ADDRESS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A132C]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500 text-xs">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#18112C]/60 transition-colors group">
                    {/* Timestamp */}
                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    {/* User */}
                    <td className="py-4 px-4 font-bold text-white whitespace-nowrap group-hover:text-purple-300 transition-colors">
                      {log.user}
                    </td>

                    {/* Action Type Pill */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${log.actionStyle}`}>
                        {log.actionType}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-4 px-4 text-slate-300 font-medium">
                      {log.description}
                    </td>

                    {/* IP Address */}
                    <td className="py-4 px-4 text-right text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}