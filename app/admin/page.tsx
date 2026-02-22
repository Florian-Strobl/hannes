'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Nav from '../components/Nav';

interface Meat {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Order {
  id: string;
  quantity: number;
  total: number;
  createdAt: string;
  user: { name: string; address: string; email: string };
  meat: { name: string };
}

export default function Admin() {
  const { data: session } = useSession();
  const router = useRouter();
  const [meats, setMeats] = useState<Meat[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState({ name: '', price: '', stock: '' });

  const fetchMeats = async () => {
    const res = await fetch('/api/meats');
    const data = await res.json();
    setMeats(data);
  };

  const fetchOrders = async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => {
    if (!session?.user?.role || session.user.role !== 'farmer') {
      router.push('/');
      return;
    }
    const fetchData = async () => {
      await Promise.all([fetchMeats(), fetchOrders()]);
    };
    fetchData();
  }, [session, router]);

  const handleAddMeat = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/meats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        price: parseFloat(form.price),
        stock: parseFloat(form.stock),
      }),
    });
    if (res.ok) {
      setForm({ name: '', price: '', stock: '' });
      fetchMeats();
    } else {
      alert('Error adding meat');
    }
  };

  const handleUpdateMeat = async (id: string, stock: number, price: number) => {
    const res = await fetch(`/api/meats/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock, price }),
    });
    if (res.ok) {
      (document.getElementById(`price-${id}`) as HTMLInputElement).value = '';
      (document.getElementById(`stock-${id}`) as HTMLInputElement).value = '';
      fetchMeats();
    }
  };

  const handleClearOrder = async (orderId: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      fetchOrders();
    } else {
      const error = await res.json();
      alert(error.error || 'Error clearing order');
    }
  };

  const handleDeleteMeat = async (meatId: string) => {
    if (!confirm('Are you sure you want to delete this meat?')) return;
    
    const res = await fetch(`/api/meats/${meatId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      fetchMeats();
    } else {
      const error = await res.json();
      alert(error.error || 'Error deleting meat');
    }
  };

  if (!session || !session.user || session.user.role !== 'farmer') {
    return <div>Access denied</div>;
  }

  return (
    <div>
      <Nav />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Add Meat</h2>
            <form onSubmit={handleAddMeat} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Stock (kg)"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <button type="submit" className="w-full p-2 rounded theme-button">
                Add Meat
              </button>
            </form>
            <h2 className="text-2xl font-semibold mb-4 mt-8">Manage Meats</h2>
            <div className="section-bar"></div>
            <div className="max-h-[420px] overflow-y-auto pr-2 no-scrollbar fancy-scroll">
              {meats.map((meat) => (
                <div key={meat.id} className="border p-4 rounded mb-4">
                <h3>{meat.name}</h3>
                <p>Current price: ${meat.price}</p>
                <p>Current stock: {meat.stock} kg</p>
                <input
                  type="number"
                  step="0.01"
                  placeholder="New price"
                  id={`price-${meat.id}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const price = parseFloat((document.getElementById(`price-${meat.id}`) as HTMLInputElement).value);
                      const stock = parseFloat((document.getElementById(`stock-${meat.id}`) as HTMLInputElement).value);
                      if (!isNaN(price) && !isNaN(stock)) handleUpdateMeat(meat.id, stock, price);
                    }
                  }}
                  className="border p-1 mr-2"
                />
                <input
                  type="number"
                  placeholder="New stock"
                  id={`stock-${meat.id}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const price = parseFloat((document.getElementById(`price-${meat.id}`) as HTMLInputElement).value);
                      const stock = parseFloat((document.getElementById(`stock-${meat.id}`) as HTMLInputElement).value);
                      if (!isNaN(price) && !isNaN(stock)) handleUpdateMeat(meat.id, stock, price);
                    }
                  }}
                  className="border p-1 mr-2"
                />
                <button
                  onClick={() => {
                    const price = parseFloat((document.getElementById(`price-${meat.id}`) as HTMLInputElement).value);
                    const stock = parseFloat((document.getElementById(`stock-${meat.id}`) as HTMLInputElement).value);
                    if (!isNaN(price) && !isNaN(stock)) handleUpdateMeat(meat.id, stock, price);
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDeleteMeat(meat.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded ml-2"
                >
                  Delete
                </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Orders</h2>
            <div className="section-bar"></div>
            <div className="max-h-[420px] overflow-y-auto pr-2 no-scrollbar fancy-scroll">
              {orders.map((order) => (
                <div key={order.id} className="border p-4 rounded mb-4">
                <p><strong>Customer:</strong> {order.user.name} ({order.user.email})</p>
                <p><strong>Address:</strong> {order.user.address}</p>
                <p><strong>Meat:</strong> {order.meat.name}</p>
                <p><strong>Quantity:</strong> {order.quantity} kg</p>
                <p><strong>Total:</strong> ${order.total}</p>
                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <button
                  onClick={() => handleClearOrder(order.id)}
                  className="px-3 py-1 rounded mt-2 theme-success"
                >
                  Mark Delivered
                </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}