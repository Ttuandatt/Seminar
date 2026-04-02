import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { LANGUAGE_KEY } from '../i18n';

type Lang = 'vi' | 'en';

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
            if (saved === 'en' || saved === 'vi') {
                setLang(saved);
            }
        };
        loadLang();
    }, []);

    const setLanguage = useCallback(async (newLang: Lang) => {
        setLang(newLang);
        await AsyncStorage.setItem(LANGUAGE_KEY, newLang);
        // Also sync the old key for backward compat
        await AsyncStorage.setItem('appLanguage', newLang);
        await i18n.changeLanguage(newLang);
    }, []);

    const getPoiName = useCallback((poi: { nameVi: string; nameEn?: string | null }) => {
        return lang === 'en' ? (poi.nameEn || poi.nameVi) : poi.nameVi;
    }, [lang]);

    const getPoiDescription = useCallback((poi: { descriptionVi?: string | null; descriptionEn?: string | null }) => {
        return lang === 'en' ? (poi.descriptionEn || poi.descriptionVi || '') : (poi.descriptionVi || '');
    }, [lang]);

    const getTourName = useCallback((tour: { nameVi: string; nameEn?: string | null }) => {
        return lang === 'en' ? (tour.nameEn || tour.nameVi) : tour.nameVi;
    }, [lang]);

    const getTourDescription = useCallback((tour: { descriptionVi?: string | null; descriptionEn?: string | null }) => {
        return lang === 'en' ? (tour.descriptionEn || tour.descriptionVi || '') : (tour.descriptionVi || '');
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLanguage, getPoiName, getPoiDescription, getTourName, getTourDescription }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
