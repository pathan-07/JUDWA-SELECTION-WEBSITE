'use client';

import { useRouter } from 'next/navigation';
import { KeyRound, LogOut, ShieldCheck, Users } from 'lucide-react';

export default function AdminUsersSettingsPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-7 h-7 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User &amp; Roles</h2>
          <p className="text-sm text-gray-600 mt-1">Who can open the admin panel</p>
        </div>
      </div>

      <div className="max-w-xl space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900">Owner (full access)</h3>
              <p className="text-sm text-gray-600 mt-1">
                The admin panel is protected by one admin password. Anyone with this password gets full access to
                products, orders, payments and settings.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-3">
            <KeyRound className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900">Change admin password</h3>
              <ol className="text-sm text-gray-600 mt-2 list-decimal pl-5 space-y-1">
                <li>
                  Open the <code className="bg-gray-100 px-1 rounded">.env.local</code> file (or your hosting
                  dashboard&apos;s environment variables).
                </li>
                <li>
                  Change <code className="bg-gray-100 px-1 rounded">ADMIN_PASSWORD</code> to a new strong password.
                </li>
                <li>Restart the website. Everyone must log in again with the new password.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-gray-900">Log out of this device</h3>
          <p className="text-sm text-gray-600 mt-1 mb-4">Use this on shared phones or computers.</p>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Separate staff accounts with limited roles (e.g. orders-only) need the database (Supabase) to be connected.
        </p>
      </div>
    </div>
  );
}
