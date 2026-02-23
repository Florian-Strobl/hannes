'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from './TranslationProvider';

type Language = {
  code: string;
  label: string;
};

const LANGUAGES: Language[] = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
];


export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();
  const [open, setOpen] = useState(false);

  const applyLanguage = (code: string) => {
    setLanguage(code);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60]">
      <div className="relative w-fit">
        <AnimatePresence>
          {open ? (
            <motion.div
              key="panel"
              initial={{ 
                opacity: 0, 
                width: 48,
                height: 48,
                borderRadius: '9999px',
                scale: 0.8,
                rotateZ: -5
              }}
              animate={{ 
                opacity: 1, 
                width: 290,
                height: 'auto',
                borderRadius: '12px',
                scale: 1,
                rotateZ: 0
              }}
              exit={{ 
                opacity: 0, 
                width: 48,
                height: 48,
                borderRadius: '9999px',
                scale: 0.8,
                rotateZ: -5
              }}
              transition={{ 
                duration: 0.5, 
                type: 'spring', 
                stiffness: 280, 
                damping: 28,
                width: { duration: 0.5, type: 'spring', stiffness: 280, damping: 28 },
                height: { duration: 0.5, type: 'spring', stiffness: 280, damping: 28 },
                borderRadius: { duration: 0.5, type: 'spring', stiffness: 280, damping: 28 },
                scale: { duration: 0.5, type: 'spring', stiffness: 300, damping: 25 },
                rotateZ: { duration: 0.5, type: 'spring', stiffness: 300, damping: 25 }
              }}
              className="language-panel absolute bottom-0 right-0 border p-3 overflow-hidden shadow-lg"
              style={{ 
                transformOrigin: 'bottom right',
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.25, duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                    {t('lang.choose', 'Choose language')}
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                    }}
                    className="close-language-btn h-6 w-6 rounded-md flex items-center justify-center transition-all"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--input-bg) 80%, transparent)' }}
                    whileHover={{ backgroundColor: 'color-mix(in srgb, var(--accent) 20%, var(--input-bg))' }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close language selector"
                  >
                    <span style={{ color: 'var(--text-muted)' }} className="text-lg leading-none">✕</span>
                  </motion.button>
                </div>
                <div className="mt-2 max-h-56 overflow-y-auto no-scrollbar space-y-1">
                  {LANGUAGES.map((item) => (
                    <motion.button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        applyLanguage(item.code);
                        setOpen(false);
                      }}
                      whileHover={{ 
                        scale: 1.05, 
                        x: 4,
                        backgroundColor: 'color-mix(in srgb, var(--accent) 15%, var(--card-bg))'
                      }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                        language === item.code ? 'language-item-active' : 'language-item'
                      }`}
                    >
                      {item.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.button
              key="button"
              type="button"
              className="language-fab absolute bottom-0 right-0 h-12 min-w-12 rounded-full px-4 text-sm font-semibold"
              onClick={() => setOpen(true)}
              aria-label="Open language selector"
              initial={{ opacity: 0, scale: 0.3, rotateZ: 5 }}
              animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
              exit={{ opacity: 0, scale: 0.3, rotateZ: 5 }}
              whileHover={{ scale: 1.1, y: -3 }}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 350, damping: 32 }}
              style={{ transformOrigin: 'bottom right' }}
            >
              {t('lang.button', '🌐 Language')}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}