'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Nav from '../components/Nav';
import { useTheme } from '../components/ThemeProvider';
import { useTranslation } from '../components/TranslationProvider';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  address: string;
  role: string;
  profileImage?: string;
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { theme, mode, setTheme, toggleMode } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    password: '',
    confirmPassword: '',
    pin: '',
    confirmPin: '',
    profileImage: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      
      if (res.ok) {
        setProfile(data);
        setFormData({
          name: data.name,
          address: data.address,
          password: '',
          confirmPassword: '',
          pin: '',
          confirmPin: '',
          profileImage: data.profileImage || '',
        });
        setError('');
      } else {
        setError(data.error || t('profile.failedLoad', 'Failed to load profile'));
        console.error('Profile error:', data);
      }
    } catch (error) {
      setError(`${t('profile.failedLoad', 'Failed to load profile')}: ${String(error)}`);
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          profileImage: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError(t('profile.passwordMismatch', 'Passwords do not match'));
      return;
    }

    if (formData.pin && formData.pin !== formData.confirmPin) {
      setError(t('profile.pinMismatch', 'PINs do not match'));
      return;
    }

    if (formData.pin && formData.pin.length !== 4) {
      setError(t('profile.pinLength', 'PIN must be 4 digits'));
      return;
    }

    try {
      const updateData: {
        name?: string;
        address?: string;
        password?: string;
        pin?: string;
        profileImage?: string;
      } = {
        name: formData.name,
        address: formData.address,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      if (formData.pin) {
        updateData.pin = formData.pin;
      }

      if (formData.profileImage) {
        updateData.profileImage = formData.profileImage;
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (res.ok) {
        setProfile(data.user);
        setSuccess(t('profile.updated', 'Profile updated successfully'));
        setFormData({
          ...formData,
          password: '',
          confirmPassword: '',
          pin: '',
          confirmPin: '',
        });
        setEditing(false);
      } else {
        setError(data.error || t('profile.failedUpdate', 'Failed to update profile'));
      }
    } catch (error) {
      console.error('Profile save error:', error);
      setError(t('profile.errorOccurred', 'An error occurred'));
    }
  };

  if (loading) {
    return (
      <div>
        <Nav />
        <div className="container mx-auto p-4">{t('common.loading', 'Loading...')}</div>
      </div>
    );
  }

  if (!profile && error) {
    return (
      <div>
        <Nav />
        <div className="container mx-auto p-4">
          <div className="bg-red-100 text-red-700 p-4 rounded">Error: {error}</div>
          <button onClick={() => router.push('/')} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
            {t('profile.goHome', 'Go to Home')}
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <Nav />
        <div className="container mx-auto p-4">{t('profile.notFound', 'Profile not found')}</div>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="container mx-auto p-2 sm:p-4 max-w-2xl">
        <div className="max-h-[calc(100vh-140px)] overflow-y-auto pr-2 no-scrollbar pb-6">
          <h1 className="text-3xl font-bold mb-6">{t('profile.title', 'My Profile')}</h1>

          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

          {!editing ? (
            <div className="space-y-6">
            <div className="border rounded p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">{t('profile.theme', 'Theme')}</h2>
                <motion.button
                  type="button"
                  onClick={toggleMode}
                  className="px-3 py-1 rounded border transition-all"
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  {mode === 'dark' ? t('profile.dark', 'Dark') : t('profile.light', 'Light')} {t('profile.mode', 'Mode')}
                </motion.button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <motion.button
                  type="button"
                  onClick={() => setTheme('butcher')}
                  className={`rounded p-3 text-left border transition-all group relative ${theme === 'butcher' ? 'border-orange-400' : ''}`}
                  animate={{
                    backgroundColor: hoveredTheme === 'butcher' || theme === 'butcher' ? (hoveredTheme === 'butcher' ? '#5a2514' : '#7c3a17') : 'var(--card-bg)',
                    borderColor: hoveredTheme === 'butcher' || theme === 'butcher' ? '#fb923c' : 'var(--card-border)'
                  }}
                  onHoverStart={() => setHoveredTheme('butcher')}
                  onHoverEnd={() => setHoveredTheme(null)}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <motion.div
                    className="font-semibold"
                    animate={{
                      color: hoveredTheme === 'butcher' ? '#fbb040' : (theme === 'butcher' ? '#fca84c' : 'var(--foreground)')
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    Butcher
                  </motion.div>
                  <motion.div
                    className="text-sm"
                    animate={{
                      color: hoveredTheme === 'butcher' ? '#f97316' : (theme === 'butcher' ? '#fb923c' : 'var(--text-muted)')
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    Warm & rustic
                  </motion.div>
                  <motion.div
                    animate={{ opacity: hoveredTheme === 'butcher' ? 1 : 0, height: hoveredTheme === 'butcher' ? 'auto' : 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="mt-3 rounded-lg h-12 bg-gradient-to-r overflow-hidden border-2"
                    style={{ backgroundImage: 'linear-gradient(to right, #ea580c, #dc2626, #f97316)', borderColor: 'rgba(0,0,0,0.1)' }}
                  />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setTheme('forest')}
                  className={`rounded p-3 text-left border transition-all group relative ${theme === 'forest' ? 'border-green-400' : ''}`}
                  animate={{
                    backgroundColor: hoveredTheme === 'forest' || theme === 'forest' ? (hoveredTheme === 'forest' ? '#1b4332' : '#2d6a4f') : 'var(--card-bg)',
                    borderColor: hoveredTheme === 'forest' || theme === 'forest' ? '#4ade80' : 'var(--card-border)'
                  }}
                  onHoverStart={() => setHoveredTheme('forest')}
                  onHoverEnd={() => setHoveredTheme(null)}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <motion.div
                    className="font-semibold"
                    animate={{
                      color: hoveredTheme === 'forest' ? '#52b788' : (theme === 'forest' ? '#74c69d' : 'var(--foreground)')
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    Forest
                  </motion.div>
                  <motion.div
                    className="text-sm"
                    animate={{
                      color: hoveredTheme === 'forest' ? '#40916c' : (theme === 'forest' ? '#52b788' : 'var(--text-muted)')
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    Fresh & earthy
                  </motion.div>
                  <motion.div
                    animate={{ opacity: hoveredTheme === 'forest' ? 1 : 0, height: hoveredTheme === 'forest' ? 'auto' : 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="mt-3 rounded-lg h-12 bg-gradient-to-r overflow-hidden border-2"
                    style={{ backgroundImage: 'linear-gradient(to right, #14532d, #166534, #15803d)', borderColor: 'rgba(0,0,0,0.1)' }}
                  />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setTheme('stone')}
                  className={`rounded p-3 text-left border transition-all group relative ${theme === 'stone' ? 'border-blue-400' : ''}`}
                  animate={{
                    backgroundColor: hoveredTheme === 'stone' || theme === 'stone' ? (hoveredTheme === 'stone' ? '#0c2340' : '#1e3a5f') : 'var(--card-bg)',
                    borderColor: hoveredTheme === 'stone' || theme === 'stone' ? '#60a5fa' : 'var(--card-border)'
                  }}
                  onHoverStart={() => setHoveredTheme('stone')}
                  onHoverEnd={() => setHoveredTheme(null)}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <motion.div
                    className="font-semibold"
                    animate={{
                      color: hoveredTheme === 'stone' ? '#60a5fa' : (theme === 'stone' ? '#93c5fd' : 'var(--foreground)')
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    Stone
                  </motion.div>
                  <motion.div
                    className="text-sm"
                    animate={{
                      color: hoveredTheme === 'stone' ? '#3b82f6' : (theme === 'stone' ? '#60a5fa' : 'var(--text-muted)')
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    Cool & clean
                  </motion.div>
                  <motion.div
                    animate={{ opacity: hoveredTheme === 'stone' ? 1 : 0, height: hoveredTheme === 'stone' ? 'auto' : 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="mt-3 rounded-lg h-12 bg-gradient-to-r overflow-hidden border-2"
                    style={{ backgroundImage: 'linear-gradient(to right, #1e3a8a, #1e40af, #2563eb)', borderColor: 'rgba(0,0,0,0.1)' }}
                  />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setTheme('violet')}
                  className={`rounded p-3 text-left border transition-all group relative ${theme === 'violet' ? 'border-purple-400' : ''}`}
                  animate={{
                    backgroundColor: hoveredTheme === 'violet' || theme === 'violet' ? (hoveredTheme === 'violet' ? '#3e2465' : '#5b2c8f') : 'var(--card-bg)',
                    borderColor: hoveredTheme === 'violet' || theme === 'violet' ? '#c084fc' : 'var(--card-border)'
                  }}
                  onHoverStart={() => setHoveredTheme('violet')}
                  onHoverEnd={() => setHoveredTheme(null)}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <motion.div
                    className="font-semibold"
                    animate={{
                      color: hoveredTheme === 'violet' ? '#d8b4fe' : (theme === 'violet' ? '#e9d5ff' : 'var(--foreground)')
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    Violet
                  </motion.div>
                  <motion.div
                    className="text-sm"
                    animate={{
                      color: hoveredTheme === 'violet' ? '#c084fc' : (theme === 'violet' ? '#d8b4fe' : 'var(--text-muted)')
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    Lush & radiant
                  </motion.div>
                  <motion.div
                    animate={{ opacity: hoveredTheme === 'violet' ? 1 : 0, height: hoveredTheme === 'violet' ? 'auto' : 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="mt-3 rounded-lg h-12 bg-gradient-to-r overflow-hidden border-2"
                    style={{ backgroundImage: 'linear-gradient(to right, #6d28d9, #7c3aed, #a855f7)', borderColor: 'rgba(0,0,0,0.1)' }}
                  />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setTheme('midnight')}
                  className={`rounded p-3 text-left border transition-all group relative ${theme === 'midnight' ? 'border-violet-400' : ''}`}
                  animate={{
                    backgroundColor: hoveredTheme === 'midnight' || theme === 'midnight' ? (hoveredTheme === 'midnight' ? '#0f172a' : '#1e1b4b') : 'var(--card-bg)',
                    borderColor: hoveredTheme === 'midnight' || theme === 'midnight' ? '#a78bfa' : 'var(--card-border)',
                    color: theme === 'midnight' ? '#e9d5ff' : 'var(--foreground)'
                  }}
                  onHoverStart={() => setHoveredTheme('midnight')}
                  onHoverEnd={() => setHoveredTheme(null)}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <motion.div
                    className="font-semibold"
                    animate={{
                      color: hoveredTheme === 'midnight' ? '#e0e7ff' : (theme === 'midnight' ? '#ddd6fe' : 'var(--foreground)')
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    Midnight
                  </motion.div>
                  <motion.div
                    className="text-sm"
                    animate={{
                      color: hoveredTheme === 'midnight' ? '#c4b5fd' : (theme === 'midnight' ? '#c4b5fd' : 'var(--text-muted)')
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    Noir & electric
                  </motion.div>
                  <motion.div
                    animate={{ opacity: hoveredTheme === 'midnight' ? 1 : 0, height: hoveredTheme === 'midnight' ? 'auto' : 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="mt-3 rounded-lg h-12 bg-gradient-to-r overflow-hidden border-2"
                    style={{ backgroundImage: 'linear-gradient(to right, #1e293b, #475569, #a78bfa)', borderColor: 'rgba(0,0,0,0.1)' }}
                  />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setTheme('obsidian')}
                  className={`rounded p-3 text-left border transition-all group relative ${theme === 'obsidian' ? 'border-fuchsia-400' : ''}`}
                  animate={{
                    backgroundColor: hoveredTheme === 'obsidian' || theme === 'obsidian' ? (hoveredTheme === 'obsidian' ? '#16111d' : '#2a1f3d') : 'var(--card-bg)',
                    borderColor: hoveredTheme === 'obsidian' || theme === 'obsidian' ? '#ec4899' : 'var(--card-border)',
                    color: theme === 'obsidian' ? '#f8d5ff' : 'var(--foreground)'
                  }}
                  onHoverStart={() => setHoveredTheme('obsidian')}
                  onHoverEnd={() => setHoveredTheme(null)}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <motion.div
                    className="font-semibold"
                    animate={{
                      color: hoveredTheme === 'obsidian' ? '#f472b6' : (theme === 'obsidian' ? '#f8b4d8' : 'var(--foreground)')
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    Obsidian
                  </motion.div>
                  <motion.div
                    className="text-sm"
                    animate={{
                      color: hoveredTheme === 'obsidian' ? '#ec4899' : (theme === 'obsidian' ? '#f472b6' : 'var(--text-muted)')
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    Ink & violet
                  </motion.div>
                  <motion.div
                    animate={{ opacity: hoveredTheme === 'obsidian' ? 1 : 0, height: hoveredTheme === 'obsidian' ? 'auto' : 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="mt-3 rounded-lg h-12 bg-gradient-to-r overflow-hidden border-2"
                    style={{ backgroundImage: 'linear-gradient(to right, #18181b, #3f3f46, #d946ef)', borderColor: 'rgba(0,0,0,0.1)' }}
                  />
                </motion.button>
              </div>
            </div>
            <div className="border rounded p-6">
              <div className="mb-6">
              {profile.profileImage ? (
                  <Image
                    src={profile.profileImage}
                    alt={profile.name}
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--bg-muted)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('profile.noImage', 'No image')}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-semibold">{t('profile.email', 'Email')}:</label>
                  <p style={{ color: 'var(--text-normal)' }}>{profile.email}</p>
                </div>
                <div>
                  <label className="font-semibold">{t('profile.name', 'Name')}:</label>
                  <p style={{ color: 'var(--text-normal)' }}>{profile.name}</p>
                </div>
                {profile.role === 'customer' && (
                  <div>
                    <label className="font-semibold">{t('profile.address', 'Address')}:</label>
                    <p style={{ color: 'var(--text-normal)' }}>{profile.address}</p>
                  </div>
                )}
                <div>
                  <label className="font-semibold">{t('profile.role', 'Role')}:</label>
                  <p className="capitalize" style={{ color: 'var(--text-normal)' }}>{profile.role === 'farmer' ? t('roles.farmer', 'Farmer') : t('roles.customer', 'Customer')}</p>
                </div>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {t('profile.edit', 'Edit Profile')}
              </button>
            </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 border rounded p-6">
            <div>
              <label className="block font-semibold mb-2">{t('profile.profilePicture', 'Profile Picture')}</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-2 border rounded"
              />
              {formData.profileImage && (
                <Image
                  src={formData.profileImage}
                  alt="Preview"
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full object-cover mt-2"
                />
              )}
            </div>

            <div>
              <label className="block font-semibold mb-2">{t('profile.name', 'Name')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            {profile.role === 'customer' && (
              <div>
                <label className="block font-semibold mb-2">{t('profile.address', 'Address')}</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold mb-2">{t('profile.newPassword', 'New Password (leave blank to keep current)')}</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            {formData.password && (
              <div>
                <label className="block font-semibold mb-2">{t('profile.confirmPassword', 'Confirm Password')}</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}

            {profile.role === 'farmer' && (
              <>
                <div>
                  <label className="block font-semibold mb-2">{t('profile.newPin', 'New PIN (leave blank to keep current)')}</label>
                  <input
                    type="password"
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value.slice(0, 4) })}
                    maxLength={4}
                    className="w-full p-2 border rounded"
                  />
                </div>

                {formData.pin && (
                  <div>
                    <label className="block font-semibold mb-2">{t('profile.confirmPin', 'Confirm PIN')}</label>
                    <input
                      type="password"
                      value={formData.confirmPin}
                      onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value.slice(0, 4) })}
                      maxLength={4}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
              </>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600"
              >
                {t('profile.saveChanges', 'Save Changes')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setError('');
                  setSuccess('');
                  fetchProfile();
                }}
                className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
              >
                {t('profile.cancel', 'Cancel')}
              </button>
            </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
