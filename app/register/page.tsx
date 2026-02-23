'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Nav from '../components/Nav';
import { useTranslation } from '../components/TranslationProvider';

export default function Register() {
  const { t } = useTranslation();
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
  const [farmerExists, setFarmerExists] = useState(false);
  const [checkingFarmer, setCheckingFarmer] = useState(true);
  const router = useRouter();

  // Check if a farmer already exists
  useEffect(() => {
    const checkFarmerExists = async () => {
      try {
        const res = await fetch('/api/check-farmer');
        const data = await res.json();
        setFarmerExists(data.exists || false);
      } catch (err) {
        console.error('Error checking farmer status:', err);
      } finally {
        setCheckingFarmer(false);
      }
    };

    checkFarmerExists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const existsRes = await fetch(`/api/users/exists?email=${encodeURIComponent(form.email)}`);
      if (existsRes.ok) {
        const existsData = await existsRes.json();
        if (existsData.exists) {
          setError(t('register.emailExists', 'Email already exists!'));
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
        alert(t('register.success', 'Registration successful! Please login.'));
        router.push('/login');
      } else {
        // Handle specific farmer error
        if (data.error && data.error.includes('farmer')) {
          setError(t('register.farmerExists.warning', 'Cannot register as farmer. A farmer account already exists. The existing farmer must delete their account first.'));
          setFarmerExists(true);
        } else {
          setError(data.error || data.details || t('register.errorOccurred', 'An error occurred'));
        }
      }
    } catch (err) {
      setError(t('register.errorOccurred', 'An error occurred'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Nav />
      <div className="container mx-auto p-2 sm:p-4 max-w-full sm:max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">{t('register.title', 'Register')}</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t('register.email', 'Email')}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder={t('register.password', 'Password')}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder={t('register.name', 'Name')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          {form.role === 'customer' && (
            <textarea
              placeholder={t('register.address', 'Address')}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          )}
          <select
            value={form.role}
            onChange={(e) => {
              setForm({ ...form, role: e.target.value });
              // Clear error when changing role
              if (form.role === 'farmer' && farmerExists) {
                setError('');
              }
            }}
            className="w-full p-2 border rounded"
            style={{ backgroundColor: 'var(--input-bg)', color: 'var(--foreground)', borderColor: 'var(--card-border)' }}
          >
            <option value="customer" style={{ backgroundColor: 'var(--input-bg)', color: 'var(--foreground)' }}>{t('role.customer', 'Customer')}</option>
            <option value="farmer" disabled={farmerExists} style={{ backgroundColor: 'var(--input-bg)', color: farmerExists ? '#999' : 'var(--foreground)' }}>
              {farmerExists ? `❌ ${t('role.farmer', 'Farmer')} (${t('common.notAvailable', 'Not Available')})` : t('role.farmer', 'Farmer')}
            </option>
          </select>
          {farmerExists && form.role !== 'farmer' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative overflow-hidden rounded-lg border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 shadow-md"
              style={{
                '--gradient-start': '#fef3c7',
                '--gradient-end': '#fef9e7',
              } as React.CSSProperties}
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-amber-300 rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-300 rounded-full translate-x-16 translate-y-16"></div>
              </div>
              <div className="relative z-10">
                <div className="flex items-start gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex-shrink-0 text-2xl"
                  >
                    ℹ️
                  </motion.div>
                  <p className="text-sm font-medium text-amber-900">
                    {t('register.farmerExists.info', 'ℹ️ A farmer account already exists. Only one farmer can be registered. The existing farmer must delete their account before a new farmer can sign up.')}
                  </p>
                </div>
              </div>
              <motion.div
                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-400"
                animate={{ scaleX: [0, 1] }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ transformOrigin: 'left' }}
              />
            </motion.div>
          )}
          {form.role === 'farmer' && farmerExists && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative overflow-hidden rounded-lg border-2 border-red-400 bg-gradient-to-r from-red-50 to-rose-50 p-4 shadow-md"
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-red-400 rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-400 rounded-full translate-x-16 translate-y-16"></div>
              </div>
              <div className="relative z-10">
                <div className="flex items-start gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex-shrink-0 text-2xl"
                  >
                    ⚠️
                  </motion.div>
                  <p className="text-sm font-medium text-red-900">
                    {t('register.farmerExists.warning', '⚠️ Cannot register as farmer. A farmer account already exists. The existing farmer must delete their account first.')}
                  </p>
                </div>
              </div>
              <motion.div
                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-red-400 to-rose-400"
                animate={{ scaleX: [0, 1] }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ transformOrigin: 'left' }}
              />
            </motion.div>
          )}
          {form.role === 'farmer' && (
            <input
              type="password"
              placeholder={t('register.pinCreate', 'Create a 4-digit PIN')}
              value={form.pin}
              onChange={(e) => setForm({ ...form, pin: e.target.value })}
              maxLength={4}
              className="w-full p-2 border rounded"
              required
            />
          )}
          <motion.button
            type="submit"
            disabled={loading || (farmerExists && form.role === 'farmer')}
            className="w-full bg-blue-500 text-white p-2 rounded font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            whileHover={!loading && !(farmerExists && form.role === 'farmer') ? { backgroundColor: '#2563eb', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)' } : {}}
            whileTap={!loading && !(farmerExists && form.role === 'farmer') ? { scale: 0.96, backgroundColor: '#1d4ed8' } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 16 }}
          >
            {loading ? t('register.registering', 'Registering...') : t('register.button', 'Register')}
          </motion.button>
        </form>
      </div>
    </div>
  );
}