import { useEffect, useState } from 'react';
import { Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../components/UI.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useBusiness } from '../context/BusinessContext.jsx';
import { getBusinessUsers } from '../services/posService.js';

export default function Users() {
  const { user } = useAuth();
  const { business, profile } = useBusiness();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setUsers(await getBusinessUsers(business.id));
  };

  useEffect(() => {
    loadUsers()
      .catch((err) => setError(err.message || 'Unable to load users.'))
      .finally(() => setLoading(false));
  }, [business.id]);

  if (loading) return <LoadingState label="Loading users..." />;

  return (
    <>
      <PageHeader title="Users" description="Admin-only staff management for cashiers and managers." />
      {profile?.role !== 'admin' && <div className="mb-4"><ErrorState message="Only admin users can manage staff accounts." /></div>}
      {error && <div className="mb-4"><ErrorState message={error} /></div>}

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <h2 className="text-lg font-bold text-slate-950">Staff access</h2>
          <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <p className="font-semibold text-slate-900">Current setup</p>
            <p className="mt-2">
              Google sign-in creates a secure vendor account. Adding cashiers by email needs a server-side invite flow with a Supabase service-role key, which should never be placed in the browser.
            </p>
            <p className="mt-2">
              For now, this page shows staff profiles already attached to {business.business_name}. The next production step is an invite endpoint for admins.
            </p>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-950">Staff accounts</h2>
          <div className="table-scroll mt-4 overflow-x-auto">
            {users.length === 0 ? (
              <EmptyState title="No users available" />
            ) : (
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((staff) => (
                    <tr key={staff.id}>
                      <td className="px-4 py-3 font-semibold text-slate-900">{staff.name || user?.name}</td>
                      <td className="px-4 py-3">{staff.email}</td>
                      <td className="px-4 py-3"><Badge tone={staff.role === 'admin' ? 'orange' : 'blue'}>{staff.role}</Badge></td>
                      <td className="px-4 py-3 text-slate-500">{new Date(staff.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
