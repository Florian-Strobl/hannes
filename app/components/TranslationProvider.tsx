'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type SupportedLanguage = 'en' | 'de' | 'fr' | 'es';

type TranslationContextValue = {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, fallback: string) => string;
};

const STORAGE_KEY = 'meatshop-language';

const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {},
  de: {
    'lang.choose': 'Sprache wählen',
    'lang.search': 'Sprache suchen...',
    'lang.none': 'Keine Sprache gefunden.',
    'lang.button': '🌐 Sprache',
    'nav.welcome': 'Willkommen,',
    'nav.profile': 'Profil',
    'nav.admin': 'Admin',
    'nav.logout': 'Abmelden',
    'nav.login': 'Anmelden',
    'nav.register': 'Registrieren',
    'home.availableMeats': 'Verfügbare Fleischangebote',
    'home.search': 'Fleisch suchen...',
    'home.clear': 'Zurücksetzen',
    'home.noOffers': 'Noch keine Angebote',
    'home.noOffersSub': 'Frische Ware kommt bald. Schau später wieder vorbei.',
    'home.buy': 'Kaufen',
    'home.price': 'Preis',
    'home.stock': 'Bestand',
    'home.outOfStock': 'Nicht auf Lager',
    'home.yourOrders': 'Deine Bestellungen',
    'home.cancelOrder': 'Bestellung stornieren',
    'home.quantity': 'Menge',
    'home.total': 'Gesamt',
    'home.date': 'Datum',
    'role.customer': 'Kunde',
    'role.farmer': 'Landwirt',
    'register.pinCreate': '4-stellige PIN erstellen',
  },
  fr: {
    'lang.choose': 'Choisir la langue',
    'lang.search': 'Rechercher une langue...',
    'lang.none': 'Aucune langue trouvée.',
    'lang.button': '🌐 Langue',
    'nav.welcome': 'Bienvenue,',
    'nav.profile': 'Profil',
    'nav.admin': 'Admin',
    'nav.logout': 'Déconnexion',
    'nav.login': 'Connexion',
    'nav.register': 'Inscription',
    'home.availableMeats': 'Viandes disponibles',
    'home.search': 'Rechercher de la viande...',
    'home.clear': 'Effacer',
    'home.noOffers': 'Aucune offre pour le moment',
    'home.noOffersSub': 'De nouvelles coupes arrivent bientôt.',
    'home.buy': 'Acheter',
    'role.customer': 'Client',
    'role.farmer': 'Agriculteur',
    'register.pinCreate': 'Créer un code PIN à 4 chiffres',
  },
  es: {
    'lang.choose': 'Elegir idioma',
    'lang.search': 'Buscar idioma...',
    'lang.none': 'No se encontró idioma.',
    'lang.button': '🌐 Idioma',
    'nav.welcome': 'Bienvenido,',
    'nav.profile': 'Perfil',
    'nav.admin': 'Admin',
    'nav.logout': 'Cerrar sesión',
    'nav.login': 'Iniciar sesión',
    'nav.register': 'Registrarse',
    'home.availableMeats': 'Carnes disponibles',
    'home.search': 'Buscar carnes...',
    'home.clear': 'Limpiar',
    'home.noOffers': 'Aún no hay ofertas',
    'home.noOffersSub': 'Pronto habrá cortes frescos disponibles.',
    'home.buy': 'Comprar',
    'role.customer': 'Cliente',
    'role.farmer': 'Granjero',
    'register.pinCreate': 'Crear PIN de 4 dígitos',
  },
};

const TranslationContext = createContext<TranslationContextValue | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>('en');

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (nextLanguage: string) => {
    setLanguageState(nextLanguage);
  };

  const t = (key: string, fallback: string) => {
    if (language === 'en') return fallback;
    const table = TRANSLATIONS[language as SupportedLanguage];
    return table?.[key] ?? fallback;
  };

  const value = useMemo(() => ({ language, setLanguage, t }), [language]);

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}
