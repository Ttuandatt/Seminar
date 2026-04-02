import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';

interface SelectorLanguage {
  code: string;
  label: string;
}

interface PoiLanguageSelectorProps {
  activeLanguage: string;
  languages: SelectorLanguage[];
  statusByLanguage: Record<string, string[]>;
  onSelectLanguage: (language: string) => void;
}

export default function PoiLanguageSelector({
  activeLanguage,
  languages,
  statusByLanguage,
  onSelectLanguage,
}: PoiLanguageSelectorProps) {
  const [open, setOpen] = useState(false);

  const active = useMemo(
    () => languages.find((item) => item.code === activeLanguage),
    [activeLanguage, languages],
  );

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <View>
          <Text style={styles.triggerLabel}>Language</Text>
          <Text style={styles.triggerValue}>
            {active?.code || activeLanguage} - {active?.label || activeLanguage}
          </Text>
        </View>
        <ChevronDown size={18} color="#475569" />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Select language</Text>

          {languages.map((item) => {
            const statuses = statusByLanguage[item.code] || [];
            const isActive = activeLanguage === item.code;

            return (
              <TouchableOpacity
                key={item.code}
                style={[styles.item, isActive && styles.itemActive]}
                onPress={() => {
                  onSelectLanguage(item.code);
                  setOpen(false);
                }}
              >
                <View style={styles.itemMain}>
                  <Text style={styles.itemCode}>{item.code}</Text>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                </View>

                <View style={styles.statusContainer}>
                  {statuses.map((status) => (
                    <View key={`${item.code}-${status}`} style={styles.statusChip}>
                      <Text style={styles.statusChipText}>{status}</Text>
                    </View>
                  ))}
                </View>

                {isActive ? <Check size={18} color="#0C4A6E" /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    marginTop: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
  },
  triggerLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  triggerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 22,
    maxHeight: '70%',
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  item: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  itemActive: {
    borderColor: '#0C4A6E',
    backgroundColor: '#eff6ff',
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  itemCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusChip: {
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusChipText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
});
