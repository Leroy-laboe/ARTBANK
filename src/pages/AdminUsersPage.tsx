import { useEffect, useMemo, useState } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminTopbar } from '../components/admin/AdminTopbar';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { describeAdminError, listUsers, setUserStatus } from '../services/admin';
import type { AdminUserRole, AdminUserRow, AdminUserStatus } from '../types/admin';
import styles from './AdminUsersPage.module.css';

type RoleFilter = 'all' | AdminUserRole;
type StatusFilter = 'all' | AdminUserStatus;

const roleFilters: { id: RoleFilter; label: string }[] = [
  { id: 'all', label: 'All roles' },
  { id: 'artist', label: 'Artist' },
  { id: 'buyer', label: 'Buyer' },
  { id: 'guardian', label: 'Guardian' },
  { id: 'partner', label: 'Partner' },
  { id: 'admin', label: 'Admin' },
];

const statusFilters: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All statuses' },
  { id: 'active', label: 'Active' },
  { id: 'suspended', label: 'Suspended' },
  { id: 'deleted', label: 'Deleted' },
];

/** Admin → Users — the registered directory. Not one of the four numbered
 *  functions in docs/pivot-checklist/29-feature-admin-functions.md, but the
 *  natural next screen: searching for someone to link an unclaimed artwork
 *  to already exists inside Link Artworks, this is the same directory as
 *  its own destination.
 *
 *  Suspend / Reactivate is the only write here on purpose. Role is
 *  deliberately not editable from this screen — migration 0035's
 *  prevent_client_role_change trigger blocks a role write from any
 *  authenticated session, admin included, so the only place `role` can ever
 *  change is the Supabase SQL editor. */
export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<RoleFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      listUsers(query).then((result) => {
        if (!active) return;
        setUsers(result.items);
        setIsDemo(result.isDemo);
        setLoading(false);
      });
    }, 200);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const visible = useMemo(() => {
    return users.filter((user) => {
      if (role !== 'all' && user.role !== role) return false;
      if (status !== 'all' && user.status !== status) return false;
      return true;
    });
  }, [users, role, status]);

  async function toggleStatus(user: AdminUserRow) {
    setActionError(null);
    const next: 'active' | 'suspended' = user.status === 'suspended' ? 'active' : 'suspended';

    if (isDemo) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: next } : u)));
      return;
    }

    setBusyId(user.id);
    try {
      await setUserStatus(user.id, next);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: next } : u)));
    } catch (err) {
      setActionError(describeAdminError(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={styles.shell}>
      <AdminSidebar />

      <main className={styles.body}>
        <AdminTopbar />
        <AdminPageHeader title="Users" subtitle="Search and manage every registered ArtBank account." />

        {isDemo && !loading && (
          <p className={styles.demoNotice} role="status">
            Showing a sample directory — these aren't real accounts yet.
          </p>
        )}
        {actionError && (
          <p className={styles.errorNotice} role="alert">
            <Icon name="x-circle" size={14} />
            {actionError}
          </p>
        )}

        <div className={styles.toolbar}>
          <div className={styles.search}>
            <Icon name="search" size={15} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <span className={styles.selectWrap}>
            <select value={role} onChange={(e) => setRole(e.target.value as RoleFilter)}>
              {roleFilters.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <Icon name="chevron-down" size={14} className={styles.selectCaret} />
          </span>

          <span className={styles.selectWrap}>
            <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
              {statusFilters.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <Icon name="chevron-down" size={14} className={styles.selectCaret} />
          </span>
        </div>

        <div className={styles.tableCard}>
          {loading ? (
            <p className={styles.empty}>Loading users…</p>
          ) : visible.length === 0 ? (
            <p className={styles.empty}>No users match this search.</p>
          ) : (
            <div className={styles.scroller}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th className={styles.actionCol}>
                      <span className="visually-hidden">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className={styles.user}>
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className={styles.avatar} loading="lazy" />
                          ) : (
                            <span className={styles.avatarPlaceholder} aria-hidden="true">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                          <span className={styles.name}>{user.name}</span>
                        </div>
                      </td>
                      <td className={styles.cell}>{user.email}</td>
                      <td>
                        <span className={styles.roleBadge}>{user.role}</span>
                      </td>
                      <td>
                        <span
                          className={[
                            styles.statusBadge,
                            user.status === 'active' && styles.statusActive,
                            user.status === 'suspended' && styles.statusSuspended,
                            user.status === 'deleted' && styles.statusDeleted,
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className={styles.cell}>{user.joinedDate}</td>
                      <td className={styles.actionCol}>
                        {user.status !== 'deleted' && (
                          <Button
                            variant={user.status === 'suspended' ? 'primary' : 'ghost'}
                            size="sm"
                            disabled={busyId === user.id}
                            onClick={() => toggleStatus(user)}
                          >
                            {busyId === user.id
                              ? 'Saving…'
                              : user.status === 'suspended'
                                ? 'Reactivate'
                                : 'Suspend'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
