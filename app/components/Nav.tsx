'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from './TranslationProvider';

export default function Nav() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <nav className="top-bar p-3 sm:p-4 text-white sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link 
          href="/" 
          className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-yellow-200 via-yellow-100 to-orange-200 bg-clip-text text-transparent drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
          style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            fontFamily: 'Georgia, serif',
            letterSpacing: '0.05em',
          }}
        >
          Fleischshop Johannes
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
              <span className="text-sm sm:text-base">{t('nav.welcome', 'Welcome,')} {session.user.name}</span>
              <Link href="/profile" className="bg-blue-500 text-white px-2 sm:px-3 py-1 rounded text-sm sm:text-base hover:bg-blue-600">
                {t('nav.profile', 'Profile')}
              </Link>
              {session.user.role === 'farmer' && (
                <Link href="/admin" className="bg-white text-green-600 px-2 sm:px-3 py-1 rounded text-sm sm:text-base hover:bg-gray-100">
                  {t('nav.admin', 'Admin')}
                </Link>
              )}
              <button onClick={() => signOut()} className="bg-red-500 px-2 sm:px-3 py-1 rounded text-sm sm:text-base hover:bg-red-600">
                {t('nav.logout', 'Logout')}
              </button>
            </>
          ) : (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 16 }}
              >
                <Link href="/login" className="inline-block bg-blue-500 px-2 sm:px-3 py-1 rounded text-white text-sm sm:text-base hover:bg-blue-600 transition-colors duration-200">
                  {t('nav.login', 'Login')}
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 16 }}
              >
                <Link href="/register" className="inline-block bg-gray-500 px-2 sm:px-3 py-1 rounded text-white text-sm sm:text-base hover:bg-gray-600 transition-colors duration-200">
                  {t('nav.register', 'Register')}
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-2 pb-3 border-t border-green-500 pt-3 space-y-2">
          {session?.user ? (
            <>
              <div className="px-3 py-2 text-sm font-semibold text-green-50">
                {t('nav.welcome', 'Welcome,')} {session.user.name}
              </div>
              <Link 
                href="/profile" 
                className="block px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium shadow-md transition transform hover:scale-105 active:scale-95"
              >
                👤 {t('nav.profile', 'Profile')}
              </Link>
              {session.user.role === 'farmer' && (
                <Link 
                  href="/admin" 
                  className="block px-4 py-3 bg-white hover:bg-gray-100 text-green-600 rounded-lg text-sm font-medium shadow-md transition transform hover:scale-105 active:scale-95"
                >
                  ⚙️ {t('nav.admin', 'Admin')}
                </Link>
              )}
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }} 
                className="w-full text-left px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium shadow-md transition transform hover:scale-105 active:scale-95"
              >
                🚪 {t('nav.logout', 'Logout')}
              </button>
            </>
          ) : (
            <>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 16 }}
              >
                <Link 
                  href="/login" 
                  className="block px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium shadow-md transition-colors duration-200 text-center"
                >
                  🔑 {t('nav.login', 'Login')}
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 16 }}
              >
                <Link 
                  href="/register" 
                  className="block px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium shadow-md transition-colors duration-200 text-center"
                >
                  ✍️ {t('nav.register', 'Register')}
                </Link>
              </motion.div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}