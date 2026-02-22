'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function Nav() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-green-600 p-3 sm:p-4 text-white sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-lg sm:text-xl font-bold">
          Farmer&apos;s Meat Shop
        </Link>
        
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 hover:bg-green-700 rounded"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop menu */}
        <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
          {session?.user ? (
            <>
              <span className="text-sm sm:text-base">Welcome, {session.user.name}</span>
              <Link href="/profile" className="bg-blue-500 text-white px-2 sm:px-3 py-1 rounded text-sm sm:text-base hover:bg-blue-600">
                Profile
              </Link>
              {session.user.role === 'farmer' && (
                <Link href="/admin" className="bg-white text-green-600 px-2 sm:px-3 py-1 rounded text-sm sm:text-base hover:bg-gray-100">
                  Admin
                </Link>
              )}
              <button onClick={() => signOut()} className="bg-red-500 px-2 sm:px-3 py-1 rounded text-sm sm:text-base hover:bg-red-600">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="bg-blue-500 px-2 sm:px-3 py-1 rounded text-white text-sm sm:text-base hover:bg-blue-600">
                Login
              </Link>
              <Link href="/register" className="bg-gray-500 px-2 sm:px-3 py-1 rounded text-white text-sm sm:text-base hover:bg-gray-600">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-2 pb-2 border-t border-green-500 pt-2">
          {session?.user ? (
            <>
              <div className="px-2 py-2 text-sm">Welcome, {session.user.name}</div>
              <Link href="/profile" className="block px-2 py-2 hover:bg-green-700 rounded text-sm">
                Profile
              </Link>
              {session.user.role === 'farmer' && (
                <Link href="/admin" className="block px-2 py-2 hover:bg-green-700 rounded text-sm">
                  Admin
                </Link>
              )}
              <button onClick={() => {
                setMobileMenuOpen(false);
                signOut();
              }} className="w-full text-left px-2 py-2 hover:bg-green-700 rounded text-sm text-red-200">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block px-2 py-2 hover:bg-green-700 rounded text-sm">
                Login
              </Link>
              <Link href="/register" className="block px-2 py-2 hover:bg-green-700 rounded text-sm">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}