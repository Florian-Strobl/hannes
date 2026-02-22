'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Nav from '@/app/components/Nav';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [type, setType] = useState<'password' | 'pin'>('password');
  const [value, setValue] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [canResetPin, setCanResetPin] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      if (!email) {
        return;
      }
      try {
        const res = await fetch(`/api/users/exists?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          setCanResetPin(data.exists && data.role === 'farmer');
          if (!data.exists) {
            setError("Email doesn't exist!");
          }
          if (!data.exists || data.role !== 'farmer') {
            setType('password');
          }
        }
      } catch {
        setCanResetPin(false);
      }
    };
    checkRole();
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token || !email) {
      setError('Invalid reset link');
      return;
    }

    if (value !== confirmValue) {
      setError('Values do not match');
      return;
    }

    if (!value) {
      setError(`${type === 'password' ? 'Password' : 'PIN'} is required`);
      return;
    }

    setLoading(true);

    try {
      const body: { token: string; email: string; password?: string; pin?: string } = { token, email };
      if (type === 'password') {
        body.password = value;
      } else {
        body.pin = value;
      }

      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Reset successful! You can now login with your new ' + (type === 'password' ? 'password' : 'PIN'));
        router.push('/login');
      } else {
        setError(data.error || 'Reset failed');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div>
        <Nav />
        <div className="container mx-auto p-4 max-w-md">
          <div className="text-red-500">Invalid reset link</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="container mx-auto p-4 max-w-md">
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Reset Password/PIN</h1>

        <div className="mb-4 flex gap-4">
          <button
            type="button"
            onClick={() => setType('password')}
            className={`flex-1 p-2 rounded ${type === 'password' ? 'bg-blue-500 text-white' : ''}`}
            style={type !== 'password' ? { backgroundColor: 'var(--bg-muted)', color: 'var(--foreground)' } : {}}
          >
            Reset Password
          </button>
          {canResetPin && (
            <button
              type="button"
              onClick={() => setType('pin')}
              className={`flex-1 p-2 rounded ${type === 'pin' ? 'bg-blue-500 text-white' : ''}`}
              style={type !== 'pin' ? { backgroundColor: 'var(--bg-muted)', color: 'var(--foreground)' } : {}}
            >
              Reset PIN
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}

          {type === 'password' ? (
            <>
              <input
                type="password"
                placeholder="New Password"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full p-2 border rounded"
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--foreground)', borderColor: 'var(--card-border)' }}
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmValue}
                onChange={(e) => setConfirmValue(e.target.value)}
                className="w-full p-2 border rounded"
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--foreground)', borderColor: 'var(--card-border)' }}
                required
              />
            </>
          ) : (
            <>
              <input
                type="password"
                placeholder="New 4-digit PIN"
                value={value}
                onChange={(e) => setValue(e.target.value.slice(0, 4))}
                maxLength={4}
                className="w-full p-2 border rounded"
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--foreground)', borderColor: 'var(--card-border)' }}
                required
              />
              <input
                type="password"
                placeholder="Confirm PIN"
                value={confirmValue}
                onChange={(e) => setConfirmValue(e.target.value.slice(0, 4))}
                maxLength={4}
                className="w-full p-2 border rounded"
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--foreground)', borderColor: 'var(--card-border)' }}
                required
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
          >
            {loading ? 'Resetting...' : 'Reset'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div>
        <Nav />
        <div className="container mx-auto p-4">Loading...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
