'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './ThemeProvider';
import LanguageSwitcher from './LanguageSwitcher';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <LanguageSwitcher />
      </ThemeProvider>
    </SessionProvider>
  );
}