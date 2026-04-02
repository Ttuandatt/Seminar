import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import vi from './locales/vi.json';
import en from './locales/en.json';

const LANGUAGE_KEY = 'app_language';

const languageDetector = {
    type: 'languageDetector' as const,
    async: true,
    detect: async (callback: (lang: string) => void) => {
        const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLang) {
            callback(savedLang);
            return;
        }
        // Fallback to device locale
        const deviceLang = Localization.getLocales()[0]?.languageCode;
        callback(deviceLang === 'en' ? 'en' : 'vi');
    },
    init: () => {},
    cacheUserLanguage: async (lang: string) => {
        await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    },
};

i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            vi: { translation: vi },
            en: { translation: en },
        },
        fallbackLng: 'vi',
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    });

export default i18n;
export { LANGUAGE_KEY };
