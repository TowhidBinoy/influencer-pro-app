'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, 
  Plus, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

const INITIAL_USERS = [
  {
    id: 'usr_1',
    name: 'Eliska Jones',
    email: 'eliska@koc.com',
    avatar: 'E',
    role: 'KOC',
    userGroup: 'Group Alpha',
    status: 'ACTIVE',
    frames: '14 frames',
  },
  {
    id: 'usr_2',
    name: 'Sofia Liu',
    email: 'sofia@kol.com',
    avatar: 'M',
    role: 'KOL',
    userGroup: 'N/A',
    status: 'ACTIVE',
    frames: 'All',
  },
  {
    id: 'usr_3',
    name: 'Marcus Lee',
    email: 'marcus.lee@koc.com',
    avatar: 'M',
    role: 'KOC',
    userGroup: 'Group Beta',
    status: 'ACTIVE',
    frames: '8 frames',
  },
  {
    id: 'usr_4',
    name: 'David Kim',
    email: 'david@kol.com',
    avatar: 'D',
    role: 'KOL',
    userGroup: 'Group Alpha',
    status: 'ACTIVE',
    frames: 'All',
  },
];

const ROLES = ['All', 'KOC', 'KOL'];

export default function UserManagementPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === 'All' || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRole]);

  const confirmDelete = () => {
    if (!userToDelete) return;
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    setUserToDelete(null);
  };

  return (
    <div className="w-full space-y-6 select-none font-sans text-slate-200">
      
      {/* 1. Header Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">User Management</h1>
      </div>

      {/* 2. Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#16102B] border border-[#261E3E] focus:border-[#8B31FF] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner"
            />
          </div>

          {/* Role Filter */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 bg-[#16102B] border border-[#261E3E] hover:border-[#8B31FF]/50 rounded-xl px-4 py-2.5 text-xs text-slate-300 transition-all cursor-pointer"
            >
              <span>Role: {selectedRole}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180 text-purple-400' : ''}`} />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute top-[110%] left-0 w-36 z-50 bg-[#140E26] border border-[#2F2150] rounded-xl py-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                {ROLES.map((role) => (
                  <div
                    key={role}
                    onClick={() => {
                      setSelectedRole(role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`px-3.5 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      selectedRole === role ? 'bg-[#8B31FF] text-white font-semibold' : 'text-slate-300 hover:bg-[#1E153A]'
                    }`}
                  >
                    <span>{role === 'All' ? 'All Roles' : role}</span>
                    {selectedRole === role && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Direct Link to Add User Page */}
        <Link
          href="/admin/users/create"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9D4EDD] to-[#8B31FF] hover:from-[#A855F7] hover:to-[#7C3AED] text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </Link>
      </div>

      {/* 3. Main Data Container */}
      <div className="bg-[#110D20] border border-[#211A35] rounded-2xl p-5 sm:p-6 shadow-xl">
        
        {/* Mobile View: Cards */}
        <div className="block md:hidden space-y-3">
          {filteredUsers.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No users found.</p>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-[#16102B] border border-[#251B40] rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#241744] border border-[#3D296D] text-purple-200 font-bold text-xs flex items-center justify-center">
                      {user.avatar}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">{user.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">{user.email}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                    {user.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#20173D] text-[11px]">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Role</span>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold ${
                      user.role === 'KOC' ? 'bg-[#00B4D8]/15 text-[#00B4D8] border border-[#00B4D8]/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Group</span>
                    <span className="text-slate-300 mt-0.5 block">{user.userGroup}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Frames</span>
                    <span className="text-slate-300 mt-0.5 block">{user.frames}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-1">
                  {/* Direct Link to Edit User */}
                  <Link
                    href={`/admin/users/create?id=${user.id}`}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setUserToDelete(user)}
                    className="text-xs font-semibold text-[#FF4D73] hover:text-[#FF6B8B] cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="text-slate-500 uppercase text-[10px] tracking-wider border-b border-[#211A35]">
                <th className="pb-3.5 px-4 font-semibold">NAME & EMAIL</th>
                <th className="pb-3.5 px-4 font-semibold text-center">ROLE</th>
                <th className="pb-3.5 px-4 font-semibold">USER GROUP</th>
                <th className="pb-3.5 px-4 font-semibold text-center">STATUS</th>
                <th className="pb-3.5 px-4 font-semibold">FRAMES</th>
                <th className="pb-3.5 px-4 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A132C]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 text-xs">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#18112C]/60 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#271947] border border-[#3E286F] text-purple-200 font-bold text-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-white leading-tight">{user.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                        user.role === 'KOC'
                          ? 'bg-[#00B4D8]/10 text-[#00B4D8] border border-[#00B4D8]/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-300 font-medium">
                      {user.userGroup}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        {user.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-300 font-medium">
                      {user.frames}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-4">
                        {/* Direct Link to Edit User with Query Parameter */}
                        <Link
                          href={`/admin/users/create?id=${user.id}`}
                          className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="text-xs font-semibold text-[#FF4D73] hover:text-[#FF6B8B] transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#120D22] border border-[#2B1F4A] rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Delete User</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to remove <span className="text-white font-semibold">{userToDelete.name}</span>?
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2 rounded-xl bg-[#1B142F] border border-[#2B1F4A] text-slate-300 text-xs font-semibold hover:bg-[#251B40] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 rounded-xl bg-[#FF4D73] hover:bg-[#FF335E] text-white text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-rose-600/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}