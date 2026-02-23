'use client';

import { useEffect, useMemo, useState } from 'react';

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

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement?: new (
          options: {
            pageLanguage: string;
            autoDisplay: boolean;
            includedLanguages: string;
          },
          elementId: string
        ) => unknown;
      };
    };
  }
}

const STORAGE_KEY = 'meatshop-language';

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSelectedLanguage(saved);
    }
  }, []);

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      const TranslateElement = window.google?.translate?.TranslateElement;
      if (!TranslateElement) return;

      new TranslateElement(
        {
          pageLanguage: 'en',
          autoDisplay: false,
          includedLanguages: LANGUAGES.map((language) => language.code).join(','),
        },
        'google_translate_element'
      );
    };

    if (!document.querySelector('script[data-google-translate="true"]')) {
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.setAttribute('data-google-translate', 'true');
      document.body.appendChild(script);
    }
  }, []);

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
    setSelectedLanguage(code);
    window.localStorage.setItem(STORAGE_KEY, code);
    document.documentElement.lang = code;

    if (code === 'en') {
      document.cookie = 'googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      window.location.reload();
      return;
    }

    const value = `/auto/${code}`;
    document.cookie = `googtrans=${value};path=/`;
    document.cookie = `googtrans=${value};domain=${window.location.hostname};path=/`;
    window.location.reload();
  };

  return (
    <>
      <div id="google_translate_element" className="hidden" />
      <div className="fixed bottom-4 right-4 z-[60]">
        {open && (
          <div className="language-panel mb-3 w-[290px] max-w-[82vw] rounded-xl border p-3">
            <div className="mb-2 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Choose language
            </div>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search language..."
              className="w-full rounded-md px-3 py-2 text-sm fancy-input"
            />
            <div className="mt-2 max-h-56 overflow-y-auto no-scrollbar space-y-1">
              {filteredLanguages.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => {
                    applyLanguage(language.code);
                    setOpen(false);
                  }}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                    selectedLanguage === language.code ? 'language-item-active' : 'language-item'
                  }`}
                >
                  {language.label}
                </button>
              ))}
              {filteredLanguages.length === 0 && (
                <div className="px-2 py-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  No language found.
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
          🌐 Language
        </button>
      </div>
    </>
  );
}