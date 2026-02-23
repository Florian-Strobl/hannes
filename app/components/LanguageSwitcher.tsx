'use client';

import { useMemo, useState } from 'react';
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
        {open && (
          <div className="language-panel mb-3 w-[290px] max-w-[82vw] rounded-xl border p-3">
            <div className="mb-2 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              {t('lang.choose', 'Choose language')}
            </div>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('lang.search', 'Search language...')}
              className="w-full rounded-md px-3 py-2 text-sm fancy-input"
            />
            <div className="mt-2 max-h-56 overflow-y-auto no-scrollbar space-y-1">
              {filteredLanguages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    applyLanguage(item.code);
                    setOpen(false);
                  }}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                    language === item.code ? 'language-item-active' : 'language-item'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {filteredLanguages.length === 0 && (
                <div className="px-2 py-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {t('lang.none', 'No language found.')}
                </div>
              )}
            </div>
          </div>
        )}
        <button
          type="button"
          className="language-fab h-12 min-w-12 rounded-full px-4 text-sm font-semibold"
          onClick={() => setOpen((current) => !current)}
          aria-label="Open language selector"
        >
          {t('lang.button', '🌐 Language')}
        </button>
      </div>
  );
}