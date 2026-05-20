import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../theme';
import { Card, Button } from '../components/ui';

export default function CreateNoticeScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Notice</Text>
      <Text style={styles.subtitle}>Broadcast announcements to all residents</Text>
      
      <Card style={styles.card}>
        <Text style={styles.label}>Notice Title</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Water Supply Interruption" 
          value={title}
          onChangeText={setTitle}
        />
        
        <Text style={styles.label}>Description</Text>
        <TextInput 
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
          placeholder="Enter details here..." 
          multiline
          numberOfLines={4}
          value={desc}
          onChangeText={setDesc}
        />
        
        <Button 
          title="Publish Notice" 
          onPress={() => {
            alert('Notice published!');
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
