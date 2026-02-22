'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../components/Nav';

export default function Register() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    address: '',
    role: 'customer',
    pin: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const existsRes = await fetch(`/api/users/exists?email=${encodeURIComponent(form.email)}`);
      if (existsRes.ok) {
        const existsData = await existsRes.json();
        if (existsData.exists) {
          setError('Email already exists!');
          setLoading(false);
          return;
        }
      }

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        alert('Registration successful! Please login.');
        router.push('/login');
      } else {
        setError(data.error || data.details || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Nav />
      <div className="container mx-auto p-4 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          {form.role === 'customer' && (
            <textarea
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          )}
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full p-2 border rounded"
            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--foreground)', borderColor: 'var(--card-border)' }}
          >
            <option value="customer" style={{ backgroundColor: 'var(--input-bg)', color: 'var(--foreground)' }}>Customer</option>
            <option value="farmer" style={{ backgroundColor: 'var(--input-bg)', color: 'var(--foreground)' }}>Farmer</option>
          </select>
          {form.role === 'farmer' && (
            <input
              type="password"
              placeholder="Create a 4-digit PIN"
              value={form.pin}
              onChange={(e) => setForm({ ...form, pin: e.target.value })}
              maxLength={4}
              className="w-full p-2 border rounded"
              required
            />
          )}
          <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded disabled:bg-gray-400">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}