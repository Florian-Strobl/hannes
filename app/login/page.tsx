'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Nav from '../components/Nav';

export default function Login() {
  const [loginType, setLoginType] = useState<'password' | 'pin'>('password');
  const [form, setForm] = useState({ email: '', password: '', pin: '' });
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const existsRes = await fetch(`/api/users/exists?email=${encodeURIComponent(form.email)}`);
    if (existsRes.ok) {
      const existsData = await existsRes.json();
      if (!existsData.exists) {
        setLoginError("Email doesn't exist!");
        return;
      }
    }
    
    if (loginType === 'password') {
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.ok) {
        router.push('/');
      } else {
        setLoginError('Login failed - invalid email or password');
      }
    } else {
      const result = await signIn('credentials', {
        email: form.email,
        pin: form.pin,
        redirect: false,
      });
      if (result?.ok) {
        router.push('/');
      } else {
        setLoginError('Login failed - invalid email or PIN');
      }
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    setResetLink('');

    if (!forgotEmail) {
      setForgotError('Email is required');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setForgotMessage(`Verification code has been sent to ${forgotEmail}. Please check your email.`);
        setVerificationStep(true);
      } else {
        setForgotError(data.error || 'Failed to process request');
      }
    } catch {
      setForgotError('An error occurred');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!verificationCode || verificationCode.length !== 6) {
      setForgotError('Please enter a valid 6-digit code');
      return;
    }

    setVerifyLoading(true);

    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: verificationCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setResetLink(data.resetLink);
        setForgotMessage('Verification successful! You can now open the reset link.');
        setVerificationStep(false);
      } else {
        setForgotError(data.error || 'Verification failed');
      }
    } catch {
      setForgotError('An error occurred');
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div>
      <Nav />
      <div className="container mx-auto p-4 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        
        <div className="mb-4 flex gap-4">
          <button
            type="button"
            onClick={() => setLoginType('password')}
            className={`flex-1 p-2 rounded ${loginType === 'password' ? 'bg-blue-500 text-white' : ''}`}
            style={loginType !== 'password' ? { backgroundColor: 'var(--bg-muted)', color: 'var(--foreground)' } : {}}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setLoginType('pin')}
            className={`flex-1 p-2 rounded ${loginType === 'pin' ? 'bg-blue-500 text-white' : ''}`}
            style={loginType !== 'pin' ? { backgroundColor: 'var(--bg-muted)', color: 'var(--foreground)' } : {}}
          >
            Farmer
          </button>
        </div>

        {loginError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{loginError}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          
          {loginType === 'password' ? (
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          ) : (
            <input
              type="password"
              placeholder="4-digit PIN"
              value={form.pin}
              onChange={(e) => setForm({ ...form, pin: e.target.value.slice(0, 4) })}
              maxLength={4}
              className="w-full p-2 border rounded"
              required
            />
          )}
          
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            Login
          </button>
        </form>

        <button
          onClick={() => setShowForgot(true)}
          className="w-full mt-4 text-blue-500 hover:underline text-sm"
        >
          Forgot {loginType === 'password' ? 'Password' : 'PIN'}?
        </button>
      </div>

      {/* Forgot Password/PIN Modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-lg max-w-md w-full p-6" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Reset {loginType === 'password' ? 'Password' : 'PIN'}</h2>

            {forgotError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{forgotError}</div>}
            {forgotMessage && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{forgotMessage}</div>}

            {!verificationStep && !resetLink ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Enter your email address and we&apos;ll send you a verification code to reset your {loginType === 'password' ? 'password' : 'PIN'}.
                </p>
                <input
                  type="email"
                  placeholder="Email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--foreground)', borderColor: 'var(--card-border)' }}
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(false);
                      setForgotEmail('');
                      setForgotError('');
                      setForgotMessage('');
                      setVerificationStep(false);
                      setVerificationCode('');
                    }}
                    className="flex-1 bg-gray-500 text-white p-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : verificationStep ? (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Enter the 6-digit verification code sent to your email.
                </p>
                <input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="w-full p-2 border rounded text-center text-2xl tracking-widest"
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--foreground)', borderColor: 'var(--card-border)' }}
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={verifyLoading}
                    className="flex-1 bg-green-600 text-white p-2 rounded disabled:bg-gray-400"
                  >
                    {verifyLoading ? 'Verifying...' : 'Verify Code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationStep(false);
                      setVerificationCode('');
                      setForgotMessage('');
                      setForgotError('');
                    }}
                    className="flex-1 bg-gray-500 text-white p-2 rounded"
                  >
                    Back
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {resetLink && (
                  <a
                    href={resetLink}
                    className="block w-full text-center bg-green-600 text-white p-2 rounded"
                  >
                    Open Reset Link
                  </a>
                )}
                <button
                  onClick={() => {
                    setShowForgot(false);
                    setForgotEmail('');
                    setForgotError('');
                    setForgotMessage('');
                    setResetLink('');
                    setVerificationStep(false);
                    setVerificationCode('');
                  }}
                  className="w-full bg-gray-500 text-white p-2 rounded"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}