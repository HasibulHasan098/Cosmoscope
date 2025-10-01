import type { ChatMessage } from '../types';

export type Language = 'en' | 'bn';
export type Theme = 'light' | 'dark';

interface SettingsState {
  language: Language;
  theme: Theme;
}

type Listener = () => void;
const listeners = new Set<Listener>();

const getInitialLanguage = (): Language => {
    try {
        const storedLanguage = sessionStorage.getItem('cosmoscope-lang');
        if (storedLanguage === 'en' || storedLanguage === 'bn') {
            return storedLanguage;
        }
    } catch (error) {
        console.warn('Could not access session storage for language preference.', error);
    }
    return 'en';
};

const settingsStore: SettingsState = {
  language: getInitialLanguage(),
  theme: 'dark',
};

export const useSettingsStore = () => {
  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  };

  const getSnapshot = () => {
    return settingsStore;
  };
  
  return { subscribe, getSnapshot };
};

const notifyListeners = () => {
  for (const listener of listeners) {
    listener();
  }
};

export const setLanguage = (language: Language) => {
  if (settingsStore.language === language) return;
  settingsStore.language = language;
  try {
      sessionStorage.setItem('cosmoscope-lang', language);
  } catch (error) {
      console.warn('Could not save language preference to session storage.', error);
  }
  notifyListeners();
};
