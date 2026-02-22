'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Nav from './components/Nav';
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
      <div className="container mx-auto p-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-4"
        >
          Available Meats
        </motion.h1>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search meats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2 rounded fancy-input"
          />
          <motion.button
            type="button"
            onClick={() => setSearch('')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-3 py-2 rounded fancy-clear"
          >
            Clear
          </motion.button>
        </div>
        <div className="section-bar"></div>
        <div className="max-h-[520px] overflow-y-auto pr-2 no-scrollbar fancy-scroll">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMeats.map((meat, index) => (
              <motion.div
                key={meat.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                whileHover={{ y: -4 }}
                className="p-4 rounded fancy-card meat-card"
              >
                <h2 className="text-xl font-semibold">{meat.name}</h2>
                <p>Price: ${meat.price}/kg</p>
                <p>Stock: {meat.stock > 0 ? `${meat.stock} kg` : 'Out of stock'}</p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(session as any)?.user?.role === 'customer' && meat.stock > 0 && (
                  <div className="mt-2">
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
                      className="p-1 mr-2 rounded fancy-input"
                    />
                    <motion.button
                      onClick={() => {
                        const qty = parseFloat((document.getElementById(`qty-${meat.id}`) as HTMLInputElement).value);
                        if (qty > 0) handleBuy(meat.id, qty);
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-3 py-1 rounded fancy-button"
                    >
                      Buy
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {(session as any)?.user?.role === 'customer' && orders.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Your Orders</h2>
          <div className="section-bar"></div>
          <div className="max-h-[300px] overflow-y-auto pr-2 no-scrollbar fancy-scroll">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  className="p-4 rounded fancy-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.03 }}
                >
                  <h3 className="text-lg font-semibold">{order.meat.name}</h3>
                  <p>Quantity: {order.quantity} kg</p>
                  <p>Total: ${order.total}</p>
                  <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
                  <motion.button
                    onClick={() => handleCancel(order.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-2 px-3 py-1 rounded bg-red-500 text-white shadow-md"
                  >
                    Cancel Order
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
