'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './ThemeProvider';
import LanguageSwitcher from './LanguageSwitcher';
import { TranslationProvider } from './TranslationProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TranslationProvider>
        <ThemeProvider>
          {children}
          <LanguageSwitcher />
        </ThemeProvider>
      </TranslationProvider>
    </SessionProvider>
  );
}