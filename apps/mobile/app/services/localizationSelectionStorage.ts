import AsyncStorage from '@react-native-async-storage/async-storage';

function buildPreferenceKey(poiId: string) {
  return `poiLanguagePreference:${poiId}`;
}

export type StoredLanguageCode = string;

export async function getSelectedLanguageForPoi(
  poiId: string,
): Promise<StoredLanguageCode | null> {
  if (!poiId) return null;

  const value = await AsyncStorage.getItem(buildPreferenceKey(poiId));
  if (!value) return null;

  return value.trim().toUpperCase();
}

export async function setSelectedLanguageForPoi(
  poiId: string,
  language: string,
): Promise<void> {
  if (!poiId) return;

  const normalized = language.trim().toUpperCase();
  await AsyncStorage.setItem(buildPreferenceKey(poiId), normalized);
}
