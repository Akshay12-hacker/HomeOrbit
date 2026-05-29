import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius, shadows } from '../../theme';
import { Button } from '../../components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ReceiptUploadScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const onSelect = route.params?.onSelect;
  const initialImage = route.params?.initialImage;

  const [selectedImage, setSelectedImage] = useState(initialImage || null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (useCamera = false) => {
    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission Denied', `We need ${useCamera ? 'camera' : 'gallery'} access to attach bills.`);
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({ quality: 0.6 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });

      if (!result.canceled && result.assets?.length) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleConfirm = () => {
    if (selectedImage) {
      onSelect?.(selectedImage);
      navigation.goBack();
    } else {
      Alert.alert('No Image', 'Please capture or select a receipt first.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={{ fontSize: 24, color: colors.textPrimary }}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Attach Receipt</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.previewContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage.uri }} style={styles.preview} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderIcon}>📄</Text>
              <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
                No receipt attached yet
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => pickImage(true)}
          >
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => pickImage(false)}
          >
            <Text style={styles.actionIcon}>🖼️</Text>
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <Button
          title="Confirm Receipt"
          onPress={handleConfirm}
          disabled={!selectedImage}
          style={styles.confirmBtn}
        />
        <TouchableOpacity 
          style={styles.clearBtn} 
          onPress={() => setSelectedImage(null)}
          disabled={!selectedImage}
        >
          <Text style={[styles.clearText, { color: colors.error }]}>Remove Attachment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 60,
    marginBottom: spacing.md,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  actionBtn: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.xs,
    ...shadows.sm,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  confirmBtn: {
    height: 56,
  },
  clearBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
