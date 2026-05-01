import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../theme';
import { Button, Card } from '../components/ui';
import { getSociety, joinSociety } from '../services';
import { useDebounce, useResponsive } from '../hooks';

export default function SocietyScreen({ navigation, route }) {
  const { role } = route.params || {};
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searching, setSearching] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const insets = useSafeAreaInsets();
  const { gutter, cardMaxWidth, isPhone } = useResponsive();

  React.useEffect(() => {
    if (debouncedQuery.length < 3) { setResults([]); return; }
    setSearching(true);
    getSociety(debouncedQuery)
      .then(setResults).catch(() => setResults([]))
      .finally(() => setSearching(false));
  }, [debouncedQuery]);

  const selectSociety = (s) => {
    setSelected(s); setQuery(s.name); setResults([]); Keyboard.dismiss();
  };

  const handleJoin = async () => {
    if (!selected) return;
    setError(''); setJoining(true);
    try {
      await joinSociety(selected.id);
      navigation.replace('Main', { society: selected, role: role || 'user' });
    } catch (e) {
      setError(e.message || 'Could not join. Try again.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <LinearGradient colors={[COLORS.navyDark, COLORS.navy, COLORS.blue]} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + SPACING.xl, paddingBottom: insets.bottom + SPACING.xl, paddingHorizontal: gutter }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>
          <View style={[styles.content, cardMaxWidth && { maxWidth: cardMaxWidth + 120 }, !isPhone && styles.contentWide]}>
          <View style={styles.hero}>
            <Text style={styles.title}>Select Your Society</Text>
            <Text style={styles.subtitle}>Type at least 3 letters to search</Text>
          </View>

          <Card style={styles.searchCard} noPad>
            <View style={styles.searchRow}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput style={styles.searchInput} value={query} onChangeText={(t) => { setQuery(t); setSelected(null); }} placeholder="Search society name…" placeholderTextColor={COLORS.textMuted} autoCapitalize="words" returnKeyType="search" />
              {searching ? <ActivityIndicator size="small" color={COLORS.blue} style={{ marginRight: 14 }} /> : selected ? <Text style={{ marginRight: 14, fontSize: 18 }}>✅</Text> : null}
            </View>
            {results.length > 0 && !selected && (
              <>
                <View style={styles.dropDivider} />
                {results.map((s, i) => (
                  <TouchableOpacity key={s.id} onPress={() => selectSociety(s)} activeOpacity={0.7} style={[styles.resultItem, i < results.length - 1 && styles.resultItemBorder]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultName}>{s.name}</Text>
                      <Text style={styles.resultMeta}>{s.city} · {s.plots} plots</Text>
                    </View>
                    <Text style={styles.resultChevron}>›</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
            {query.length >= 3 && results.length === 0 && !searching && !selected && (
              <View style={styles.noResult}><Text style={styles.noResultText}>No society found.</Text></View>
            )}
          </Card>

          {selected && (
            <View style={styles.selectedBanner}>
              <Text style={{ fontSize: 20 }}>🏢</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedName}>{selected.name}</Text>
                <Text style={styles.selectedMeta}>{selected.city}</Text>
              </View>
              <TouchableOpacity onPress={() => { setSelected(null); setQuery(''); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button title={joining ? 'Setting up…' : 'Continue to Dashboard →'} onPress={handleJoin} loading={joining} disabled={!selected} style={{ marginTop: SPACING.sm }} />
          <Text style={styles.footNote}>Your plot details will be loaded from the society records</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center' },
  content: { width: '100%', alignSelf: 'center' },
  contentWide: { maxWidth: 640 },
  hero: { marginBottom: SPACING.lg },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  searchCard: { marginBottom: SPACING.sm, borderRadius: RADIUS.lg, overflow: 'hidden' },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm },
  searchIcon: { fontSize: 18, marginRight: 6, marginLeft: 6 },
  searchInput: { flex: 1, paddingVertical: 16, fontSize: 16, color: COLORS.textPrimary },
  dropDivider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.base },
  resultItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: 14 },
  resultItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  resultName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  resultMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  resultChevron: { fontSize: 20, color: COLORS.textMuted, marginLeft: 8 },
  noResult: { paddingHorizontal: SPACING.base, paddingVertical: 14 },
  noResultText: { color: COLORS.textMuted, fontSize: 14 },
  selectedBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.md, padding: 14, marginBottom: SPACING.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  selectedName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  selectedMeta: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  errorText: { color: '#FF8A80', fontSize: 13, textAlign: 'center', marginBottom: SPACING.sm },
  footNote: { textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: SPACING.base },
});
