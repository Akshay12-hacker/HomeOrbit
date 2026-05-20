import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../theme';
import { Card, Button } from '../components/ui';

export default function CollectMaintenanceScreen({ navigation }) {
  const [plot, setPlot] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Collect Maintenance (Offline)</Text>
      <Text style={styles.subtitle}>Record a cash or cheque payment</Text>
      
      <Card style={styles.card}>
        <Text style={styles.label}>Plot / Resident</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. A-101 (3BHK)" 
          value={plot}
          onChangeText={setPlot}
        />
        
        <Text style={styles.label}>Amount (₹)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. 2500" 
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        
        <Text style={styles.label}>Date</Text>
        <TextInput 
          style={styles.input} 
          placeholder="YYYY-MM-DD" 
          value={date}
          onChangeText={setDate}
        />
        
        <Button 
          title="Collect Cash" 
          onPress={() => {
            alert('Payment recorded successfully!');
            navigation.goBack();
          }} 
          style={{ marginTop: 24 }} 
          variant="success"
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface, padding: SPACING.base },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginTop: 12 },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: 20 },
  card: { padding: 20 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, backgroundColor: COLORS.white
  },
});
