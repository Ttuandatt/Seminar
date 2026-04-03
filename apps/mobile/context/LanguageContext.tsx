import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { LANGUAGE_KEY } from '../i18n';

const SUPPORTED_CONTENT_LANGUAGES = [
    'vi',
    'en',
    'ja',
    'ko',
    'zh-cn',
    'zh-tw',
    'fr',
    'de',
    'es',
    'th',
    'ru',
] as const;

type Lang = (typeof SUPPORTED_CONTENT_LANGUAGES)[number];

interface LanguageContextType {
    lang: Lang;
    setLanguage: (lang: Lang) => Promise<void>;
    getPoiName: (poi: { nameVi: string; nameEn?: string | null }) => string;
    getPoiDescription: (poi: { descriptionVi?: string | null; descriptionEn?: string | null }) => string;
    getTourName: (tour: { nameVi: string; nameEn?: string | null }) => string;
    getTourDescription: (tour: { descriptionVi?: string | null; descriptionEn?: string | null }) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    lang: 'vi',
    setLanguage: async () => {},
    getPoiName: (poi) => poi.nameVi,
    getPoiDescription: (poi) => poi.descriptionVi || '',
    getTourName: (tour) => tour.nameVi,
    getTourDescription: (tour) => tour.descriptionVi || '',
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<Lang>('vi');

    useEffect(() => {
        const loadLang = async () => {
            const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
            if (saved && SUPPORTED_CONTENT_LANGUAGES.includes(saved as Lang)) {
                setLang(saved as Lang);
            }
        };
        loadLang();
    }, []);

    const setLanguage = useCallback(async (newLang: Lang) => {
        setLang(newLang);
        await AsyncStorage.setItem(LANGUAGE_KEY, newLang);
        // Also sync the old key for backward compat
        await AsyncStorage.setItem('appLanguage', newLang);

        // UI copy currently has vi/en resources. Other content languages use EN UI fallback.
        const uiLanguage = newLang === 'vi' ? 'vi' : 'en';
        await i18n.changeLanguage(uiLanguage);
    }, []);

    const getPoiName = useCallback((poi: { nameVi: string; nameEn?: string | null }) => {
        if (lang === 'vi') return poi.nameVi;
        return poi.nameEn || poi.nameVi;
    }, [lang]);

    const getPoiDescription = useCallback((poi: { descriptionVi?: string | null; descriptionEn?: string | null }) => {
        if (lang === 'vi') return poi.descriptionVi || '';
        return poi.descriptionEn || poi.descriptionVi || '';
    }, [lang]);

    const getTourName = useCallback((tour: { nameVi: string; nameEn?: string | null }) => {
        if (lang === 'vi') return tour.nameVi;
        return tour.nameEn || tour.nameVi;
    }, [lang]);

    const getTourDescription = useCallback((tour: { descriptionVi?: string | null; descriptionEn?: string | null }) => {
        if (lang === 'vi') return tour.descriptionVi || '';
        return tour.descriptionEn || tour.descriptionVi || '';
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLanguage, getPoiName, getPoiDescription, getTourName, getTourDescription }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
