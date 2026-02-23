'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Nav from '../components/Nav';
import { useTranslation } from '../components/TranslationProvider';

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

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function Admin() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const [meats, setMeats] = useState<Meat[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
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

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    if (res.ok) {
      setUsers(data);
    }
  };

  useEffect(() => {
    if (!session?.user?.role || session.user.role !== 'farmer') {
      router.push('/');
      return;
    }
    const fetchData = async () => {
      await Promise.all([fetchMeats(), fetchOrders(), fetchUsers()]);
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
      alert(t('admin.errorAddMeat', 'Error adding meat'));
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
      alert(error.error || t('admin.errorClearOrder', 'Error clearing order'));
    }
  };

  const handleDeleteMeat = async (meatId: string) => {
    if (!confirm(t('admin.confirmDeleteMeat', 'Are you sure you want to delete this meat?'))) return;
    
    const res = await fetch(`/api/meats/${meatId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      fetchMeats();
    } else {
      const error = await res.json();
      alert(error.error || t('admin.errorDeleteMeat', 'Error deleting meat'));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t('admin.confirmDeleteUser', 'Delete this user and all their orders?'))) return;

    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (res.ok) {
      fetchUsers();
      fetchOrders();
    } else {
      const error = await res.json();
      alert(error.error || t('admin.errorDeleteUser', 'Error deleting user'));
    }
  };

  const hasItems = <T,>(items: T[]) => items.length > 0;

  if (!session || !session.user || session.user.role !== 'farmer') {
    return <div>{t('admin.accessDenied', 'Access denied')}</div>;
  }

  return (
    <div>
      <Nav />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">{t('admin.title', 'Admin Panel')}</h1>
        <div className="max-h-[calc(100vh-160px)] overflow-y-auto pr-2 no-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">{t('admin.addMeat', 'Add Meat')}</h2>
            <form onSubmit={handleAddMeat} className="space-y-4">
              <input
                type="text"
                placeholder={t('admin.name', 'Name')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder={t('admin.price', 'Price')}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder={t('admin.stockKg', 'Stock (kg)')}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <button type="submit" className="w-full p-2 rounded theme-button">
                {t('admin.addMeat', 'Add Meat')}
              </button>
            </form>
            {hasItems(meats) && (
              <>
                <h2 className="text-2xl font-semibold mb-4 mt-8">{t('admin.manageMeats', 'Manage Meats')}</h2>
                <div className="section-bar"></div>
                <div className="max-h-[45vh] sm:max-h-[50vh] lg:max-h-[60vh] overflow-y-auto pr-2 no-scrollbar fancy-scroll">
                  {meats.map((meat) => (
                    <div key={meat.id} className="border p-4 rounded mb-4">
                    <h3>{meat.name}</h3>
                    <p>{t('admin.currentPrice', 'Current price')}: ${meat.price}</p>
                    <p>{t('admin.currentStock', 'Current stock')}: {meat.stock} kg</p>
                    <input
                      type="number"
                      step="0.01"
                      placeholder={t('admin.newPrice', 'New price')}
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
                      placeholder={t('admin.newStock', 'New stock')}
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
                      {t('admin.update', 'Update')}
                    </button>
                    <button
                      onClick={() => handleDeleteMeat(meat.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded ml-2"
                    >
                      {t('admin.delete', 'Delete')}
                    </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          {hasItems(orders) && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">{t('admin.orders', 'Orders')}</h2>
              <div className="section-bar"></div>
              <div className="max-h-[45vh] sm:max-h-[50vh] lg:max-h-[60vh] overflow-y-auto pr-2 no-scrollbar fancy-scroll">
                {orders.map((order) => (
                  <div key={order.id} className="border p-4 rounded mb-4">
                  <p><strong>{t('admin.customer', 'Customer')}:</strong> {order.user.name} ({order.user.email})</p>
                  <p><strong>{t('admin.address', 'Address')}:</strong> {order.user.address}</p>
                  <p><strong>{t('admin.meat', 'Meat')}:</strong> {order.meat.name}</p>
                  <p><strong>{t('admin.quantity', 'Quantity')}:</strong> {order.quantity} kg</p>
                  <p><strong>{t('admin.total', 'Total')}:</strong> ${order.total}</p>
                  <p><strong>{t('admin.date', 'Date')}:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                  <button
                    onClick={() => handleClearOrder(order.id)}
                    className="px-3 py-1 rounded mt-2 theme-success"
                  >
                    {t('admin.markDelivered', 'Mark Delivered')}
                  </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-semibold mb-4">{t('admin.users', 'Users')}</h2>
            <div className="section-bar"></div>
            <div className="max-h-[45vh] sm:max-h-[50vh] lg:max-h-[60vh] overflow-y-auto pr-2 no-scrollbar fancy-scroll">
              {users.map((user) => (
                <div key={user.id} className="border p-4 rounded mb-4">
                  <p><strong>{t('admin.name', 'Name')}:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>{t('admin.role', 'Role')}:</strong> {user.role === 'farmer' ? t('roles.farmer', 'Farmer') : t('roles.customer', 'Customer')}</p>
                  <p><strong>{t('admin.joined', 'Joined')}:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded mt-2"
                  >
                    {t('admin.deleteUser', 'Delete User')}
                  </button>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}