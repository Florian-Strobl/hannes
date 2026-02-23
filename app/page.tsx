'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Nav from './components/Nav';
import { useTheme } from './components/ThemeProvider';
import { useTranslation } from './components/TranslationProvider';
import { motion } from 'framer-motion';

interface Meat {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Order {
  id: string;
  meatId: string;
  quantity: number;
  total: number;
  createdAt: string;
  meat: Meat;
}

export default function Home() {
  const { data: session } = useSession();
  const { theme, mode, setTheme, toggleMode } = useTheme();
  const { t } = useTranslation();
  const [meats, setMeats] = useState<Meat[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMeats = async () => {
    const res = await fetch('/api/meats');
    const data = await res.json();
    setMeats(data);
    setLoading(false);
  };

  const fetchOrders = async () => {
    if (!session) return;
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/meats');
      const data = await res.json();
      setMeats(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (session) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const filteredMeats = meats.filter(meat =>
    meat.name.toLowerCase().includes(search.toLowerCase())
  );

  const hasItems = <T,>(items: T[]) => items.length > 0;
  const hasMeats = hasItems(meats);
  const hasFilteredMeats = hasItems(filteredMeats);

  const handleBuy = async (meatId: string, quantity: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(session as any)?.user || (session as any).user.role !== 'customer') {
      alert('Please login as customer');
      return;
    }
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meatId, quantity }),
    });
    if (res.ok) {
      alert('Order placed!');
      fetchMeats(); // refresh stock
      fetchOrders(); // refresh orders
    } else {
      const error = await res.json();
      alert(error.error);
    }
  };

  const handleCancel = async (orderId: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      alert('Order cancelled!');
      fetchMeats(); // refresh stock
      fetchOrders(); // refresh orders
    } else {
      const error = await res.json();
      alert(error.error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Nav />
      <div className="container mx-auto p-2 sm:p-4">
        {!session && (
          <div className="mb-6 rounded-lg border p-3 sm:p-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-semibold">Theme</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Customize the look before you log in.</p>
              </div>
              <button
                type="button"
                onClick={toggleMode}
                className="px-3 py-1 rounded border text-sm"
                style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
              >
                {mode === 'dark' ? 'Dark' : 'Light'} Mode
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setTheme('butcher')}
                className={`rounded p-2 text-left border ${theme === 'butcher' ? 'bg-orange-100 border-orange-400' : ''}`}
                style={theme !== 'butcher' ? { backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' } : {}}
              >
                <div className="font-semibold" style={{ color: theme === 'butcher' ? '#7c2d12' : 'var(--foreground)' }}>Butcher</div>
                <div className="text-xs" style={{ color: theme === 'butcher' ? '#92400e' : 'var(--text-muted)' }}>Warm & rustic</div>
              </button>
              <button
                type="button"
                onClick={() => setTheme('forest')}
                className={`rounded p-2 text-left border ${theme === 'forest' ? 'bg-green-100 border-green-400' : ''}`}
                style={theme !== 'forest' ? { backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' } : {}}
              >
                <div className="font-semibold" style={{ color: theme === 'forest' ? '#14532d' : 'var(--foreground)' }}>Forest</div>
                <div className="text-xs" style={{ color: theme === 'forest' ? '#166534' : 'var(--text-muted)' }}>Fresh & earthy</div>
              </button>
              <button
                type="button"
                onClick={() => setTheme('stone')}
                className={`rounded p-2 text-left border ${theme === 'stone' ? 'bg-blue-100 border-blue-400' : ''}`}
                style={theme !== 'stone' ? { backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' } : {}}
              >
                <div className="font-semibold" style={{ color: theme === 'stone' ? '#1e3a8a' : 'var(--foreground)' }}>Stone</div>
                <div className="text-xs" style={{ color: theme === 'stone' ? '#1e40af' : 'var(--text-muted)' }}>Cool & clean</div>
              </button>
              <button
                type="button"
                onClick={() => setTheme('violet')}
                className={`rounded p-2 text-left border ${theme === 'violet' ? 'bg-purple-100 border-purple-400' : ''}`}
                style={theme !== 'violet' ? { backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' } : {}}
              >
                <div className="font-semibold" style={{ color: theme === 'violet' ? '#6d28d9' : 'var(--foreground)' }}>Violet</div>
                <div className="text-xs" style={{ color: theme === 'violet' ? '#7c3aed' : 'var(--text-muted)' }}>Lush & radiant</div>
              </button>
              <button
                type="button"
                onClick={() => setTheme('midnight')}
                className={`rounded p-2 text-left border ${theme === 'midnight' ? 'bg-slate-900 border-violet-400' : ''}`}
                style={theme !== 'midnight' ? { backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' } : { color: '#e9e7ff' }}
              >
                <div className="font-semibold" style={{ color: theme === 'midnight' ? '#c4b5fd' : 'var(--foreground)' }}>Midnight</div>
                <div className="text-xs" style={{ color: theme === 'midnight' ? '#a78bfa' : 'var(--text-muted)' }}>Noir & electric</div>
              </button>
              <button
                type="button"
                onClick={() => setTheme('obsidian')}
                className={`rounded p-2 text-left border ${theme === 'obsidian' ? 'bg-zinc-900 border-fuchsia-400' : ''}`}
                style={theme !== 'obsidian' ? { backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' } : { color: '#f0e7ff' }}
              >
                <div className="font-semibold" style={{ color: theme === 'obsidian' ? '#d8b4fe' : 'var(--foreground)' }}>Obsidian</div>
                <div className="text-xs" style={{ color: theme === 'obsidian' ? '#c084fc' : 'var(--text-muted)' }}>Ink & violet</div>
              </button>
            </div>
          </div>
        )}
        <>
          <motion.h1
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="fancy-headline-main text-2xl sm:text-4xl md:text-5xl font-bold mb-6"
          >
            {t('home.availableMeats', 'Available Meats')}
          </motion.h1>
          {hasMeats && (
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="text"
                placeholder={t('home.search', 'Search meats...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 p-2 text-sm sm:text-base rounded fancy-input"
              />
              <motion.button
                type="button"
                onClick={() => setSearch('')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-3 py-2 rounded fancy-clear text-sm sm:text-base"
              >
                {t('home.clear', 'Clear')}
              </motion.button>
            </div>
          )}
          {!hasMeats ? (
            <div className="w-full min-h-[calc(100vh-260px)] flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[220px] w-full"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-3xl sm:text-4xl md:text-5xl font-black"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, var(--accent-strong), var(--accent), var(--accent-warm))',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    textShadow: '0 6px 20px color-mix(in srgb, var(--accent) 35%, transparent)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {t('home.noOffers', 'No offers yet')}
                </motion.div>
                <motion.p
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="mt-3 text-sm sm:text-base"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {t('home.noOffersSub', 'Fresh cuts are on the way. Check back soon to buy.')}
                </motion.p>
              </motion.div>
            </div>
          ) : (
            <>
              {hasFilteredMeats && <div className="section-bar"></div>}
              {hasFilteredMeats && (
                <div className="max-h-[300px] sm:max-h-[400px] md:max-h-[520px] overflow-y-auto pr-2 no-scrollbar fancy-scroll">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredMeats.map((meat, index) => (
                      <motion.div
                        key={meat.id}
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        whileHover={{ y: -4 }}
                        className="p-3 sm:p-4 rounded fancy-card meat-card"
                      >
                        <h2 className="text-base sm:text-lg md:text-xl font-semibold">{meat.name}</h2>
                        <p className="text-sm sm:text-base">{t('home.price', 'Price')}: ${meat.price}/kg</p>
                        <p className="text-sm sm:text-base">{t('home.stock', 'Stock')}: {meat.stock > 0 ? `${meat.stock} kg` : t('home.outOfStock', 'Out of stock')}</p>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(session as any)?.user?.role === 'customer' && meat.stock > 0 && (
                          <div className="mt-2 flex flex-col sm:flex-row gap-2">
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              placeholder="kg"
                              id={`qty-${meat.id}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const value = (e.currentTarget as HTMLInputElement).value;
                                  if (!value) {
                                    return;
                                  }
                                  const qty = parseFloat(value);
                                  if (qty > 0) handleBuy(meat.id, qty);
                                }
                              }}
                              className="flex-1 p-2 text-sm rounded fancy-input min-w-0"
                            />
                            <motion.button
                              onClick={() => {
                                const qty = parseFloat((document.getElementById(`qty-${meat.id}`) as HTMLInputElement).value);
                                if (qty > 0) handleBuy(meat.id, qty);
                              }}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.98 }}
                              className="px-3 py-2 rounded fancy-button text-sm whitespace-nowrap"
                            >
                              {t('home.buy', 'Buy')}
                            </motion.button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {(session as any)?.user?.role === 'customer' && orders.length > 0 && (
        <div className="mt-6 sm:mt-8 px-2 sm:px-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">{t('home.yourOrders', 'Your Orders')}</h2>
          <div className="section-bar"></div>
          <div className="max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-2 no-scrollbar fancy-scroll">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  className="p-3 sm:p-4 rounded fancy-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.03 }}
                >
                  <h3 className="text-base sm:text-lg font-semibold">{order.meat.name}</h3>
                  <p className="text-sm">{t('home.quantity', 'Quantity')}: {order.quantity} kg</p>
                  <p className="text-sm">{t('home.total', 'Total')}: ${order.total}</p>
                  <p className="text-xs sm:text-sm">{t('home.date', 'Date')}: {new Date(order.createdAt).toLocaleString()}</p>
                  <motion.button
                    onClick={() => handleCancel(order.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-2 px-3 py-1 rounded bg-red-500 text-white shadow-md text-sm hover:bg-red-600"
                  >
                    {t('home.cancelOrder', 'Cancel Order')}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
