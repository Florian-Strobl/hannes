'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Nav() {
  const { data: session } = useSession();

  return (
    <nav className="bg-green-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">Farmer&apos;s Meat Shop</Link>
        <div className="flex items-center space-x-4">
          {session?.user ? (
            <>
              <span>Welcome, {session.user.name}</span>
              <Link href="/profile" className="bg-blue-500 text-white px-3 py-1 rounded">Profile</Link>
              {session.user.role === 'farmer' && (
                <Link href="/admin" className="bg-white text-green-600 px-3 py-1 rounded">Admin</Link>
              )}
              <button onClick={() => signOut()} className="bg-red-500 px-3 py-1 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="bg-blue-500 px-3 py-1 rounded text-white">Login</Link>
              <Link href="/register" className="bg-gray-500 px-3 py-1 rounded text-white">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}