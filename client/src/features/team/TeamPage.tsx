import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ShieldCheck
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';
import { Skeleton } from '@/components/ui/Skeleton';
import { getInitials, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export const TeamPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/users?search=${encodeURIComponent(search)}`);
      setUsers(res.data.data.users || []);
    } catch (err: any) {
      toast.error('Failed to load team users');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.patch(`/users/${userId}`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      toast.success(`User role changed to ${newRole}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to change role');
    }
  };

  const handleStatusToggle = async (userId: string, currentActive: boolean) => {
    const newActive = !currentActive;
    try {
      await api.patch(`/users/${userId}`, { isActive: newActive });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: newActive } : u))
      );
      toast.success(`User ${newActive ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-text-primary">
            Workspace Members
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage organization members, access roles, and account statuses.
          </p>
        </div>

        {/* Search member */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 stroke-[1.5]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-border bg-white outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-sm text-text-muted">
            No team members found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-border text-[11px] font-mono uppercase tracking-wider text-text-muted select-none">
                  <th className="py-3 px-5 font-medium">User</th>
                  <th className="py-3 px-4 font-medium">Role</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Tasks</th>
                  <th className="py-3 px-4 font-medium">Joined</th>
                  <th className="py-3 px-5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {users.map((member) => {
                  const isSelf = member._id === currentUser?._id;
                  return (
                    <tr key={member._id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-mono text-xs flex items-center justify-center font-medium shrink-0">
                            {member.initials || getInitials(member.name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-text-primary">{member.name}</span>
                              {isSelf && (
                                <span className="font-mono text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-text-muted block">{member.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-xs font-medium uppercase tracking-wider ${
                            member.role === 'admin'
                              ? 'bg-navy/10 text-navy'
                              : 'bg-surface border border-border text-text-secondary'
                          }`}
                        >
                          {member.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5]" />}
                          {member.role}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-xs ${
                            member.isActive
                              ? 'bg-success/10 text-success'
                              : 'bg-danger/10 text-danger'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              member.isActive ? 'bg-success' : 'bg-danger'
                            }`}
                          />
                          {member.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap font-mono text-xs text-text-secondary">
                        <span>
                          {member.taskCounts?.completed || 0}/{member.taskCounts?.total || 0} completed
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap font-mono text-xs text-text-muted">
                        {formatDate(member.createdAt)}
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => handleRoleToggle(member._id, member.role)}
                            className="px-2.5 py-1 text-xs font-mono rounded-lg border border-border bg-white text-text-secondary hover:text-text-primary hover:border-text-muted disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                          >
                            {member.role === 'admin' ? 'Make User' : 'Make Admin'}
                          </button>

                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => handleStatusToggle(member._id, member.isActive)}
                            className={`px-2.5 py-1 text-xs font-mono rounded-lg border disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${
                              member.isActive
                                ? 'border-border bg-white text-danger hover:bg-danger/10'
                                : 'border-success/30 bg-success/10 text-success'
                            }`}
                          >
                            {member.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
