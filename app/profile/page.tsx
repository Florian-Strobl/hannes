'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Nav from '../components/Nav';
import { useTheme } from '../components/ThemeProvider';

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
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        setError(data.error || 'Failed to load profile');
        console.error('Profile error:', data);
      }
    } catch (error) {
      setError('Failed to load profile: ' + String(error));
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
      setError('Passwords do not match');
      return;
    }

    if (formData.pin && formData.pin !== formData.confirmPin) {
      setError('PINs do not match');
      return;
    }

    if (formData.pin && formData.pin.length !== 4) {
      setError('PIN must be 4 digits');
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
        setSuccess('Profile updated successfully');
        setFormData({
          ...formData,
          password: '',
          confirmPassword: '',
          pin: '',
          confirmPin: '',
        });
        setEditing(false);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile save error:', error);
      setError('An error occurred');
    }
  };

  if (loading) {
    return (
      <div>
        <Nav />
        <div className="container mx-auto p-4">Loading...</div>
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
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <Nav />
        <div className="container mx-auto p-4">Profile not found</div>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

        {!editing ? (
          <div className="space-y-6">
            <div className="border rounded p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">Theme</h2>
                <button
                  type="button"
                  onClick={toggleMode}
                  className="px-3 py-1 rounded border"
                  style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
                >
                  {mode === 'dark' ? 'Dark' : 'Light'} Mode
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('butcher')}
                  className={`rounded p-3 text-left border ${theme === 'butcher' ? 'bg-orange-100 border-orange-400' : ''}`}
                  style={theme !== 'butcher' ? { backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' } : {}}
                >
                  <div className="font-semibold" style={{ color: theme === 'butcher' ? '#7c2d12' : 'var(--foreground)' }}>Butcher</div>
                  <div className="text-sm" style={{ color: theme === 'butcher' ? '#92400e' : 'var(--text-muted)' }}>Warm & rustic</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('forest')}
                  className={`rounded p-3 text-left border ${theme === 'forest' ? 'bg-green-100 border-green-400' : ''}`}
                  style={theme !== 'forest' ? { backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' } : {}}
                >
                  <div className="font-semibold" style={{ color: theme === 'forest' ? '#14532d' : 'var(--foreground)' }}>Forest</div>
                  <div className="text-sm" style={{ color: theme === 'forest' ? '#166534' : 'var(--text-muted)' }}>Fresh & earthy</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('stone')}
                  className={`rounded p-3 text-left border ${theme === 'stone' ? 'bg-blue-100 border-blue-400' : ''}`}
                  style={theme !== 'stone' ? { backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' } : {}}
                >
                  <div className="font-semibold" style={{ color: theme === 'stone' ? '#1e3a8a' : 'var(--foreground)' }}>Stone</div>
                  <div className="text-sm" style={{ color: theme === 'stone' ? '#1e40af' : 'var(--text-muted)' }}>Cool & clean</div>
                </button>
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
                    <span style={{ color: 'var(--text-muted)' }}>No image</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-semibold">Email:</label>
                  <p style={{ color: 'var(--text-normal)' }}>{profile.email}</p>
                </div>
                <div>
                  <label className="font-semibold">Name:</label>
                  <p style={{ color: 'var(--text-normal)' }}>{profile.name}</p>
                </div>
                {profile.role === 'customer' && (
                  <div>
                    <label className="font-semibold">Address:</label>
                    <p style={{ color: 'var(--text-normal)' }}>{profile.address}</p>
                  </div>
                )}
                <div>
                  <label className="font-semibold">Role:</label>
                  <p className="capitalize" style={{ color: 'var(--text-normal)' }}>{profile.role}</p>
                </div>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 border rounded p-6">
            <div>
              <label className="block font-semibold mb-2">Profile Picture</label>
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
              <label className="block font-semibold mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            {profile.role === 'customer' && (
              <div>
                <label className="block font-semibold mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold mb-2">New Password (leave blank to keep current)</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>

            {formData.password && (
              <div>
                <label className="block font-semibold mb-2">Confirm Password</label>
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
                  <label className="block font-semibold mb-2">New PIN (leave blank to keep current)</label>
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
                    <label className="block font-semibold mb-2">Confirm PIN</label>
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
                Save Changes
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
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
