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
    'profile.title': 'Mein Profil',
    'profile.email': 'E-Mail',
    'profile.name': 'Name',
    'profile.address': 'Adresse',
    'profile.role': 'Rolle',
    'profile.edit': 'Profil bearbeiten',
    'profile.profilePicture': 'Profilbild',
    'profile.noImage': 'Kein Bild',
    'profile.newPassword': 'Neues Passwort (leer lassen, um aktuelles zu behalten)',
    'profile.confirmPassword': 'Passwort bestätigen',
    'profile.newPin': 'Neue PIN (leer lassen, um aktuelle zu behalten)',
    'profile.confirmPin': 'PIN bestätigen',
    'profile.saveChanges': 'Änderungen speichern',
    'profile.cancel': 'Abbrechen',
    'reset.invalidLink': 'Ungültiger Reset-Link',
    'reset.title': 'Passwort/PIN zurücksetzen',
    'reset.passwordTab': 'Passwort zurücksetzen',
    'reset.pinTab': 'PIN zurücksetzen',
    'reset.newPassword': 'Neues Passwort',
    'reset.confirmPassword': 'Passwort bestätigen',
    'reset.newPin': 'Neue 4-stellige PIN',
    'reset.confirmPin': 'PIN bestätigen',
    'reset.resetting': 'Wird zurückgesetzt...',
    'reset.reset': 'Zurücksetzen',
    'reset.valuesMismatch': 'Werte stimmen nicht überein',
    'reset.requiredPassword': 'Passwort ist erforderlich',
    'reset.requiredPin': 'PIN ist erforderlich',
    'reset.success': 'Erfolgreich zurückgesetzt! Du kannst dich jetzt mit deinem neuen {type} anmelden.',
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
    'profile.title': 'Mon profil',
    'profile.email': 'E-mail',
    'profile.name': 'Nom',
    'profile.address': 'Adresse',
    'profile.role': 'Rôle',
    'profile.edit': 'Modifier le profil',
    'profile.profilePicture': 'Photo de profil',
    'profile.noImage': 'Pas d’image',
    'profile.newPassword': 'Nouveau mot de passe (laisser vide pour conserver l’actuel)',
    'profile.confirmPassword': 'Confirmer le mot de passe',
    'profile.newPin': 'Nouveau PIN (laisser vide pour conserver l’actuel)',
    'profile.confirmPin': 'Confirmer le PIN',
    'profile.saveChanges': 'Enregistrer les modifications',
    'profile.cancel': 'Annuler',
    'reset.invalidLink': 'Lien de réinitialisation invalide',
    'reset.title': 'Réinitialiser le mot de passe/PIN',
    'reset.passwordTab': 'Réinitialiser le mot de passe',
    'reset.pinTab': 'Réinitialiser le PIN',
    'reset.newPassword': 'Nouveau mot de passe',
    'reset.confirmPassword': 'Confirmer le mot de passe',
    'reset.newPin': 'Nouveau PIN à 4 chiffres',
    'reset.confirmPin': 'Confirmer le PIN',
    'reset.resetting': 'Réinitialisation...',
    'reset.reset': 'Réinitialiser',
    'reset.valuesMismatch': 'Les valeurs ne correspondent pas',
    'reset.requiredPassword': 'Le mot de passe est requis',
    'reset.requiredPin': 'Le PIN est requis',
    'reset.success': 'Réinitialisation réussie ! Tu peux maintenant te connecter avec ton nouveau {type}.',
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
    'profile.title': 'Mi perfil',
    'profile.email': 'Correo',
    'profile.name': 'Nombre',
    'profile.address': 'Dirección',
    'profile.role': 'Rol',
    'profile.edit': 'Editar perfil',
    'profile.profilePicture': 'Foto de perfil',
    'profile.noImage': 'Sin imagen',
    'profile.newPassword': 'Nueva contraseña (deja vacío para mantener la actual)',
    'profile.confirmPassword': 'Confirmar contraseña',
    'profile.newPin': 'Nuevo PIN (deja vacío para mantener el actual)',
    'profile.confirmPin': 'Confirmar PIN',
    'profile.saveChanges': 'Guardar cambios',
    'profile.cancel': 'Cancelar',
    'reset.invalidLink': 'Enlace de restablecimiento no válido',
    'reset.title': 'Restablecer contraseña/PIN',
    'reset.passwordTab': 'Restablecer contraseña',
    'reset.pinTab': 'Restablecer PIN',
    'reset.newPassword': 'Nueva contraseña',
    'reset.confirmPassword': 'Confirmar contraseña',
    'reset.newPin': 'Nuevo PIN de 4 dígitos',
    'reset.confirmPin': 'Confirmar PIN',
    'reset.resetting': 'Restableciendo...',
    'reset.reset': 'Restablecer',
    'reset.valuesMismatch': 'Los valores no coinciden',
    'reset.requiredPassword': 'La contraseña es obligatoria',
    'reset.requiredPin': 'El PIN es obligatorio',
    'reset.success': '¡Restablecido con éxito! Ahora puedes iniciar sesión con tu nuevo {type}.',
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
