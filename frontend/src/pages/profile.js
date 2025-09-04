import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Profile() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card text-slate-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/40 backdrop-blur p-6">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-600/20 blur-2xl" aria-hidden="true" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-cyan-500/20">
                {(session?.user?.name || session?.user?.email || '?').slice(0,1).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">Your Profile</h1>
                <p className="text-slate-400">Manage your account information</p>
              </div>
            </div>
            <Link href="/" className="btn-secondary border border-slate-600/50 px-4 py-2">Back to Home</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Account Overview</h2>
            {session ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="label">Name</div>
                    <div className="text-slate-200">{session.user?.name || '—'}</div>
                  </div>
                  <span className="badge">Active</span>
                </div>
                <div>
                  <div className="label">Email</div>
                  <div className="text-slate-200 break-all">{session.user?.email || '—'}</div>
                </div>
                {session.user?.role && (
                  <div>
                    <div className="label">Role</div>
                    <div className="text-slate-200 capitalize">{session.user.role}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-300">You are not signed in.</div>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Security</h2>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3v2h-6v-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13a7 7 0 0014 0v-2a7 7 0 00-14 0v2z" />
                  </svg>
                  Password
                </span>
                <span className="badge">Protected</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A2 2 0 0122 9.528V14.5a2 2 0 01-1.106 1.789L15 18" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 6l-6 3m0 0l6 3m-6-3v6" />
                  </svg>
                  Sessions
                </span>
                <span className="badge">Secure</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
                  </svg>
                  Last updated
                </span>
                <span className="text-slate-400">Just now</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


