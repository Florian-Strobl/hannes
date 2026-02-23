'use client';

import { useMemo, useState } from 'react';
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
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pl', label: 'Polski' },
  { code: 'cs', label: 'Čeština' },
  { code: 'sk', label: 'Slovenčina' },
  { code: 'sl', label: 'Slovenščina' },
  { code: 'hu', label: 'Magyar' },
  { code: 'ro', label: 'Română' },
  { code: 'bg', label: 'Български' },
  { code: 'hr', label: 'Hrvatski' },
  { code: 'sr', label: 'Српски' },
  { code: 'el', label: 'Ελληνικά' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ru', label: 'Русский' },
  { code: 'uk', label: 'Українська' },
  { code: 'ar', label: 'العربية' },
  { code: 'he', label: 'עברית' },
  { code: 'fa', label: 'فارسی' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ur', label: 'اردو' },
  { code: 'zh-CN', label: '中文 (简体)' },
  { code: 'zh-TW', label: '中文 (繁體)' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'th', label: 'ไทย' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'af', label: 'Afrikaans' },
  { code: 'no', label: 'Norsk' },
  { code: 'sv', label: 'Svenska' },
  { code: 'fi', label: 'Suomi' },
  { code: 'da', label: 'Dansk' },
  { code: 'is', label: 'Íslenska' },
  { code: 'ga', label: 'Gaeilge' },
  { code: 'et', label: 'Eesti' },
  { code: 'lv', label: 'Latviešu' },
  { code: 'lt', label: 'Lietuvių' },
];

const STORAGE_KEY = 'meatshop-language';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredLanguages = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return LANGUAGES;
    return LANGUAGES.filter(
      (language) =>
        language.label.toLowerCase().includes(normalized) ||
        language.code.toLowerCase().includes(normalized)
    );
  }, [query]);

  const applyLanguage = (code: string) => {
    setLanguage(code);
    window.localStorage.setItem(STORAGE_KEY, code);
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
                      setQuery('');
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
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('lang.search', 'Search language...')}
                  className="w-full rounded-md px-3 py-2 text-sm fancy-input"
                  autoFocus
                />
                <div className="mt-2 max-h-56 overflow-y-auto no-scrollbar space-y-1">
                  {filteredLanguages.map((item, idx) => (
                    <motion.button
                      key={item.code}
                      type="button"
                      initial={{ opacity: 0, x: -15, rotateZ: -2 }}
                      animate={{ opacity: 1, x: 0, rotateZ: 0 }}
                      transition={{ delay: 0.3 + idx * 0.025, type: 'spring', stiffness: 300, damping: 20 }}
                      onClick={() => {
                        applyLanguage(item.code);
                        setOpen(false);
                        setQuery('');
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
                  {filteredLanguages.length === 0 && (
                    <div className="px-2 py-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {t('lang.none', 'No language found.')}
                    </div>
                  )}
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