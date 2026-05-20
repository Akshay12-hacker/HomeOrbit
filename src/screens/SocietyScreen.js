import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../theme';
import { Button, Card } from '../components/ui';
import { getSociety } from '../services';
import { setGlobalIds, getGlobalProfiles, setGlobalProfile } from '../services/apiClient';
import { useDebounce, useResponsive } from '../hooks';

/* ------------------- DATA MAPPER (CRITICAL FIX) ------------------- */
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

  const myProfiles = getGlobalProfiles() || [];
  React.useEffect(() => {
    if (debouncedQuery.length < 3) {
      setResults([]);
      return;
    }

    setSearching(true);

    getSociety(debouncedQuery)
      .then((res) => {
        if (!Array.isArray(res)) {
          setResults([]);
          return;
        }

        const formatted = res.map(mapSociety);
        setResults(formatted);
      })
      .catch(() => setResults([]))
      .finally(() => setSearching(false));

  }, [debouncedQuery]);

  /* ------------------- SELECT ------------------- */
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
      if (profileToJoin) setGlobalProfile(profileToJoin);

      navigation.replace('Main', {
        society: profileToJoin 
        ? { 
          id: targetId, 
          name: profileToJoin.societyName || 'Unknown Society' 
        } 
        : selected,
        role: role || 'user',

        user:{
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
    <LinearGradient
      colors={[COLORS.navyDark, COLORS.navy, COLORS.blue]}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + SPACING.xl,
              paddingBottom: insets.bottom + SPACING.xl,
              paddingHorizontal: gutter,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View
            style={[
              styles.content,
              cardMaxWidth && { maxWidth: cardMaxWidth + 120 },
              !isPhone && styles.contentWide,
            ]}
          >
            {/* HEADER */}
            <View style={styles.hero}>
              <Text style={styles.title}>Select Your Society</Text>
              <Text style={styles.subtitle}>
                Choose from your existing societies or search to join a new one.
              </Text>
            </View>

            {/* MY SOCIETIES (FROM OTP) */}
            {myProfiles.length > 0 && !selected && (
              <View style={{ marginBottom: SPACING.xl }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.bluePale, marginBottom: 8, letterSpacing: 1 }}>YOUR SOCIETIES</Text>
                {myProfiles.map((p, i) => (
                  <TouchableOpacity
                    key={`profile-${i}`}
                    onPress={() => handleJoin(p)}
                    activeOpacity={0.8}
                    style={styles.profileCard}
                  >
                    <View style={styles.profileIcon}>
                      <Text style={{ fontSize: 20 }}>🏢</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.profileName}>{p.societyName || 'Green Meadows Society'}</Text>
                      <Text style={styles.profileRole}>{p.ownerName} • Society ID: {p.societyId}</Text>
                      <Text style={styles.profileUnits}>Plots: {getProfileUnitsText(p)}</Text>
                      <Text style={[styles.profileStatus, p.isApprovedByAdmin ? styles.profileApproved : styles.profilePending]}>
                        {p.isApprovedByAdmin ? 'Approved' : 'Pending admin approval'}
                      </Text>
                    </View>
                    <Text style={{ color: COLORS.textMuted, fontSize: 24 }}>›</Text>
                  </TouchableOpacity>
                ))}
                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: SPACING.base }} />
                <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.bluePale, marginBottom: 8, letterSpacing: 1 }}>OR SEARCH NEW SOCIETY</Text>
              </View>
            )}

            {/* SEARCH CARD */}
            <Card style={styles.searchCard} noPad>
              <View style={styles.searchRow}>
                <Text style={styles.searchIcon}>🔍</Text>

                <TextInput
                  style={styles.searchInput}
                  value={query}
                  onChangeText={(t) => {
                    setQuery(t);
                    setSelected(null);
                  }}
                  placeholder="Search society name…"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="words"
                  returnKeyType="search"
                />

                {searching ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.blue}
                    style={{ marginRight: 14 }}
                  />
                ) : selected ? (
                  <Text style={{ marginRight: 14, fontSize: 18 }}>✅</Text>
                ) : null}
              </View>

              {/* RESULTS */}
              {results.length > 0 && !selected && (
                <View>
                  <View style={styles.dropDivider} />

                  {results.map((s, i) => (
                    <TouchableOpacity
                      key={`${s.id}-${i}`} // SAFE KEY
                      onPress={() => selectSociety(s)}
                      activeOpacity={0.7}
                      style={[
                        styles.resultItem,
                        i < results.length - 1 &&
                          styles.resultItemBorder,
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.resultName}>
                          {s.name}
                        </Text>

                        <Text style={styles.resultMeta}>
                          {s.city} · {s.plots} plots
                        </Text>
                      </View>

                      <Text style={styles.resultChevron}>›</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* NO RESULTS */}
              {query.length >= 3 &&
                results.length === 0 &&
                !searching &&
                !selected && (
                  <View style={styles.noResult}>
                    <Text style={styles.noResultText}>
                      No society found.
                    </Text>
                  </View>
                )}
            </Card>

            {/* SELECTED */}
            {selected && (
              <View style={styles.selectedBanner}>
                <Text style={{ fontSize: 20 }}>🏢</Text>

                <View style={{ flex: 1 }}>
                  <Text style={styles.selectedName}>
                    {selected.name}
                  </Text>
                  <Text style={styles.selectedMeta}>
                    {selected.city}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setSelected(null);
                    setQuery('');
                  }}
                >
                  <Text
                    style={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: 20,
                    }}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ERROR */}
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            {/* BUTTON */}
            <Button
              title={
                joining
                  ? 'Setting up…'
                  : 'Continue to Dashboard →'
              }
              onPress={handleJoin}
              loading={joining}
              disabled={!selected}
              style={{ marginTop: SPACING.sm }}
            />

            <Text style={styles.footNote}>
              Your plot details will be loaded from the society records
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

/* ------------------- STYLES ------------------- */
const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center' },
  content: { width: '100%', alignSelf: 'center' },
  contentWide: { maxWidth: 640 },

  hero: { marginBottom: SPACING.lg },

  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },

  searchCard: {
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 6,
    marginLeft: 6,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.textPrimary,
  },

  dropDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.base,
  },

  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: 14,
  },

  resultItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  resultName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  resultMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  resultChevron: {
    fontSize: 20,
    color: COLORS.textMuted,
    marginLeft: 8,
  },

  noResult: {
    paddingHorizontal: SPACING.base,
    paddingVertical: 14,
  },

  noResultText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },

  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  selectedName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  selectedMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },

  errorText: {
    color: '#FF8A80',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },

  footNote: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    marginTop: SPACING.base,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bluePale,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  profileRole: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  profileUnits: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  profileStatus: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 6,
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  profileApproved: {
    color: COLORS.green,
    backgroundColor: COLORS.greenPale,
  },
  profilePending: {
    color: COLORS.orange,
    backgroundColor: COLORS.orangePale,
  },
});
