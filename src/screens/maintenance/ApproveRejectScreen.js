import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../theme';
import { Card, Button } from '../../components/ui';

export default function ApproveRejectScreen() {
  const pendingMembers = [
    { id: '1', name: 'Rahul Sharma', plot: 'A-101', role: 'Owner' },
    { id: '2', name: 'Priya Gupta', plot: 'B-205', role: 'Tenant' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Pending Approvals</Text>
      <Text style={styles.subtitle}>Review new member requests</Text>
      
      {pendingMembers.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.textMuted }}>No pending requests.</Text>
      ) : (
        pendingMembers.map(m => (
          <Card key={m.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{m.name}</Text>
              <Text style={styles.details}>{m.plot} • {m.role}</Text>
            </View>
            <View style={styles.actions}>
              <Button title="✓" onPress={() => {}} variant="success" style={styles.actionBtn} small />
              <Button title="✗" onPress={() => {}} variant="danger" style={styles.actionBtn} small />
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface, padding: SPACING.base },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginTop: 12 },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: 20 },
  card: { padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  details: { fontSize: 13, color: COLORS.textSecondary },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { minWidth: 44, paddingHorizontal: 0 },
});
