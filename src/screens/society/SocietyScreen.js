import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  FadeInUp,
  Layout,
  withSpring
} from 'react-native-reanimated';

import { shadows, spacing, radius, typography } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { Button, Card } from '../../components/ui';
import { getSociety } from '../../services';
import { setGlobalIds, getGlobalProfiles, setGlobalProfile, setGlobalProfiles } from '../../services/apiClient';
import { authStore } from '../../stores/authStore';
import { saveSelectedProfile } from '../../storage/authStorage';
import { useDebounce, useResponsive } from '../../hooks';
import { formatCurrency } from '../../utils/currency';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* --- DATA MAPPER --- */
const mapSociety = (item, index) => ({
  id: item?.societyId ?? index,
  name: item?.societyName ?? 'Unknown Society',
  city: item?.city ?? 'Unknown City',
  plots: item?.plots ?? 0,
});

const getProfileUnitsText = (profile) => {
  const units = Array.isArray(profile?.unitOwner) ? profile.unitOwner : [];
  if (units.length === 0) return 'No plots linked';
  return units.map((unit) => unit.unitName).filter(Boolean).join(', ');
};

export default function SocietyScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const { role } = route.params || {};
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searching, setSearching] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  const debouncedQuery = useDebounce(query, 400);
  const myProfiles = getGlobalProfiles() || [];

  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setResults([]);
      return;
    }

    setSearching(true);
    getSociety(debouncedQuery)
      .then((res) => {
        const formatted = (Array.isArray(res) ? res : []).map(mapSociety);
        setResults(formatted);
      })
      .catch(() => setResults([]))
      .finally(() => setSearching(false));
  }, [debouncedQuery]);

  const selectSociety = (s) => {
    setSelected(s);
    setQuery(s.name);
    setResults([]);
    Keyboard.dismiss();
  };

  const handleJoin = async (profileToJoin = null) => {
    const targetId = profileToJoin ? profileToJoin.societyId : selected?.id;
    if (!targetId) return;

    setError('');
    setJoining(true);

    try {
      setGlobalIds(targetId, profileToJoin?.ownerId || 1);
      if (profileToJoin) {
        setGlobalProfile(profileToJoin);
        authStore.updateSelectedProfile(profileToJoin);
        await saveSelectedProfile(profileToJoin);
      } else if (selected) {
        const newProfile = {
          societyId: selected.id,
          societyName: selected.name,
          ownerId: 1,
        };
        setGlobalProfile(newProfile);
        authStore.updateSelectedProfile(newProfile);
        await saveSelectedProfile(newProfile);
      }

      navigation.getParent()?.replace('App', {
        society: profileToJoin ? { id: targetId, name: profileToJoin.societyName } : selected,
        role: role || 'user',
        user: {
          name: profileToJoin?.ownerName || 'Resident',
          phone: profileToJoin?.phone || '',
          ownerId: profileToJoin?.ownerId || null,
        }
      });
    } catch (e) {
      setError(e.message || 'Could not join. Try again.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={isDark ? ['#020617', '#0f172a', '#1e1b4b'] : ['#1e1b4b', '#4F46E5']}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
            <View style={styles.logoBadge}>
               <Text style={{ fontSize: 24 }}>🏢</Text>
            </View>
            <Text style={styles.title}>Your Societies</Text>
            <Text style={styles.subtitle}>Select an existing property or find a new one.</Text>
          </Animated.View>

          {/* MY SOCIETIES SECTION */}
          {myProfiles.length > 0 && !selected && (
            <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.section}>
               <Text style={[styles.sectionLabel, { color: 'rgba(255,255,255,0.6)' }]}>REGISTERED PROPERTIES</Text>
               {myProfiles.map((p, i) => (
                 <TouchableOpacity
                   key={i}
                   onPress={() => handleJoin(p)}
                   activeOpacity={0.8}
                   style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                 >
                   <View style={[styles.profileIcon, { backgroundColor: colors.primaryLight }]}>
                     <Text style={{ fontSize: 20 }}>🏠</Text>
                   </View>
                   <View style={{ flex: 1 }}>
                     <Text style={[styles.profileName, { color: colors.textPrimary }]}>{p.societyName}</Text>
                     <Text style={[styles.profileMeta, { color: colors.textMuted }]}>{p.ownerName} • {getProfileUnitsText(p)}</Text>
                     <View style={[styles.statusBadge, { backgroundColor: p.isApprovedByAdmin ? colors.successLight : colors.warningLight }]}>
                        <Text style={[styles.statusText, { color: p.isApprovedByAdmin ? colors.successDark : colors.warning }]}>
                          {p.isApprovedByAdmin ? 'VERIFIED' : 'PENDING APPROVAL'}
                        </Text>
                     </View>
                   </View>
                   <Text style={[styles.chevron, { color: colors.divider }]}>›</Text>
                 </TouchableOpacity>
               ))}
               <View style={styles.orRow}>
                  <View style={styles.line} />
                  <Text style={styles.orText}>OR FIND OTHERS</Text>
                  <View style={styles.line} />
               </View>
            </Animated.View>
          )}

          {/* SEARCH SECTION */}
          <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.section}>
            <Card style={[styles.searchCard, { backgroundColor: colors.surface, borderColor: colors.border }]} noPad>
              <View style={styles.searchRow}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={[styles.searchInput, { color: colors.textPrimary }]}
                  value={query}
                  onChangeText={(t) => { setQuery(t); setSelected(null); }}
                  placeholder="Search society name..."
                  placeholderTextColor={colors.textMuted}
                />
                {searching && <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 15 }} />}
                {selected && <Text style={{ marginRight: 15, fontSize: 18 }}>✅</Text>}
              </View>

              {results.length > 0 && !selected && (
                <View style={[styles.resultsList, { borderTopColor: colors.divider }]}>
                  {results.map((s, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => selectSociety(s)}
                      style={[styles.resultItem, i < results.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.resultName, { color: colors.textPrimary }]}>{s.name}</Text>
                        <Text style={[styles.resultMeta, { color: colors.textMuted }]}>{s.city} • {s.plots} Plots</Text>
                      </View>
                      <Text style={[styles.chevron, { color: colors.divider }]}>›</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Card>

            {selected && (
              <Animated.View entering={FadeInUp} style={[styles.selectedCard, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }]}>
                 <View style={styles.selectedIcon}>
                    <Text style={{ fontSize: 22 }}>🏢</Text>
                 </View>
                 <View style={{ flex: 1 }}>
                    <Text style={styles.selectedName}>{selected.name}</Text>
                    <Text style={styles.selectedMeta}>{selected.city}</Text>
                 </View>
                 <TouchableOpacity onPress={() => { setSelected(null); setQuery(''); }}>
                    <Text style={{ color: '#fff', opacity: 0.6, fontSize: 20 }}>✕</Text>
                 </TouchableOpacity>
              </Animated.View>
            )}

            {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

            <Button
              title={joining ? 'Setting Up...' : 'Go to Dashboard'}
              onPress={() => handleJoin()}
              loading={joining}
              disabled={!selected}
              style={{ marginTop: 20, height: 60, borderRadius: 20 }}
            />
          </Animated.View>

          <Text style={[styles.footerText, { color: 'rgba(255,255,255,0.4)' }]}>
            Property and dues information will be synced from society records.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scroll: { paddingHorizontal: 24, paddingBottom: 60 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoBadge: { width: 60, height: 60, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  title: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 8, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  section: { marginBottom: 32 },
  sectionLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 16 },
  profileCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, borderWidth: 1, marginBottom: 12, ...shadows.md },
  profileIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  profileName: { fontSize: 17, fontWeight: '800' },
  profileMeta: { fontSize: 13, marginTop: 2, fontWeight: '600' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 8 },
  statusText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  chevron: { fontSize: 24, marginLeft: 10 },
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 32 },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  orText: { paddingHorizontal: 16, fontSize: 11, fontWeight: '900', color: 'rgba(255,255,255,0.4)', letterSpacing: 1 },
  searchCard: { borderRadius: 24, overflow: 'hidden', ...shadows.lg },
  searchRow: { flexDirection: 'row', alignItems: 'center', height: 64, paddingHorizontal: 18 },
  searchIcon: { fontSize: 20, marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '700' },
  resultsList: { borderTopWidth: 1 },
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  resultName: { fontSize: 15, fontWeight: '800' },
  resultMeta: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  selectedCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 24, borderWidth: 1, marginTop: 20, gap: 14 },
  selectedIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  selectedName: { fontSize: 16, fontWeight: '800', color: '#fff' },
  selectedMeta: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  errorText: { textAlign: 'center', marginTop: 16, fontWeight: '700', fontSize: 13 },
  footerText: { textAlign: 'center', fontSize: 11, marginTop: 32, lineHeight: 18, paddingHorizontal: 40 },
});
