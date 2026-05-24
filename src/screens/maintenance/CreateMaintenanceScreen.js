import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';
import { Card, Button } from '../../components/ui';

export default function CreateMaintenanceScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Maintenance</Text>
      <Text style={styles.subtitle}>Generate a new maintenance bill for all residents</Text>
      
      <Card style={styles.card}>
        <Text style={styles.label}>Bill Title</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. March 2024 Maintenance" 
          value={title}
          onChangeText={setTitle}
        />
        
        <Text style={styles.label}>Amount per plot (₹)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. 2000" 
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        
        <Text style={styles.label}>Due Date</Text>
        <TextInput 
          style={styles.input} 
          placeholder="YYYY-MM-DD" 
          value={dueDate}
          onChangeText={setDueDate}
        />
        
        <Button 
          title="Generate Bills" 
          onPress={() => {
            alert('Maintenance generated successfully!');
            navigation.goBack();
          }} 
          style={{ marginTop: 24 }} 
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
