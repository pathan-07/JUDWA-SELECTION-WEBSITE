'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Loader } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      // Only allow redirects back into the admin panel
      const next = searchParams.get('next');
      router.replace(next && next.startsWith('/admin') ? next : '/admin');
      router.refresh();
    } catch {
      setError('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-ink-100 shadow-lg rounded-lg p-8">
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 rounded-full bg-ink-900 flex items-center justify-center mb-3">
          <Lock className="w-5 h-5 text-gold-300" />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-ink-900">JUDWA Admin</h1>
        <p className="text-sm text-gray-500 mt-1">Enter your admin password</p>
      </div>

      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        autoComplete="current-password"
        autoFocus
        required
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
      />
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <button
        type="submit"
        disabled={loading || !password}
        className="mt-4 w-full brand-bg disabled:opacity-60 text-white py-2.5 rounded-lg font-semibold uppercase tracking-wide text-sm flex items-center justify-center gap-2"
      >
        {loading && <Loader className="w-4 h-4 animate-spin" />}
        Login
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
