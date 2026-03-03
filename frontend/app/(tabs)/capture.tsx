import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import api from '../../services/api';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { GlassCard } from '../../components/GlassCard';
import { AnimatedTouchable } from '../../components/AnimatedTouchable';

export default function CaptureScreen() {
  const { colors } = useTheme();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    requestPermissions();
    loadProjects();
    getCurrentLocation();
  }, []);

  const requestPermissions = async () => {
    await Camera.requestCameraPermissionsAsync();
    await Location.requestForegroundPermissionsAsync();
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  };

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
      if (data.length > 0) setSelectedProject(data[0].id);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const takePhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          setCapturedMedia(`data:image/jpeg;base64,${asset.base64}`);
        } else if (asset.uri) {
          setCapturedMedia(asset.uri);
        }
        getCurrentLocation();
      }
    } catch (error: any) {
      Alert.alert('Camera Error', error.message || 'Failed to take photo.');
    }
  };

  const pickFromGallery = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setCapturedMedia(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUpload = async () => {
    if (!capturedMedia) {
      Alert.alert('Error', 'Please capture or select media first');
      return;
    }
    if (!selectedProject) {
      Alert.alert('Error', 'Please select a project');
      return;
    }

    setUploading(true);
    try {
      await api.uploadMedia({
        project_id: selectedProject,
        media_type: 'photo',
        file_data: capturedMedia,
        location: location,
        notes: notes,
        tags: ['field-capture', new Date().toISOString().split('T')[0]],
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Media uploaded successfully!');
      setCapturedMedia(null);
      setNotes('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Premium Header */}
      <LinearGradient
        colors={[Colors.success, '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View>
          <Text style={styles.headerTitle}>Field Capture</Text>
          <Text style={styles.headerSubtitle}>GPS-Tagged Documentation</Text>
        </View>
        <View style={styles.gpsIndicator}>
          <MaterialIcons name="gps-fixed" size={20} color={location ? '#4ADE80' : '#FFF'} />
          <Text style={styles.gpsText}>{location ? 'GPS Active' : 'Locating...'}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Project Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Project</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[styles.projectChip, selectedProject === project.id && styles.projectChipActive]}
                onPress={() => setSelectedProject(project.id)}
              >
                <Text style={[styles.projectChipText, selectedProject === project.id && styles.projectChipTextActive]}>
                  {project.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Capture Buttons */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Capture Media</Text>
          <View style={styles.captureButtons}>
            <AnimatedTouchable style={styles.captureButton} onPress={takePhoto}>
              <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.captureButtonGradient}>
                <MaterialIcons name="camera-alt" size={40} color="#FFF" />
                <Text style={styles.captureButtonText}>Take Photo</Text>
                <Text style={styles.captureButtonSubtext}>With GPS Tag</Text>
              </LinearGradient>
            </AnimatedTouchable>

            <AnimatedTouchable style={styles.captureButton} onPress={pickFromGallery}>
              <LinearGradient colors={[Colors.secondary, Colors.secondaryLight]} style={styles.captureButtonGradient}>
                <MaterialIcons name="photo-library" size={40} color="#FFF" />
                <Text style={styles.captureButtonText}>Gallery</Text>
                <Text style={styles.captureButtonSubtext}>Select Photo</Text>
              </LinearGradient>
            </AnimatedTouchable>
          </View>

          <GlassCard style={styles.voiceButton}>
            <MaterialIcons name="mic" size={24} color={Colors.primary} />
            <Text style={[styles.voiceButtonText, { color: colors.text }]}>Record Voice Note</Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </GlassCard>
        </View>

        {/* Preview */}
        {capturedMedia && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Preview</Text>
            <GlassCard style={styles.previewCard}>
              <Image source={{ uri: capturedMedia }} style={styles.previewImage} />
              <View style={styles.previewInfo}>
                <View style={styles.infoRow}>
                  <MaterialIcons name="access-time" size={16} color={colors.textSecondary} />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>{new Date().toLocaleString()}</Text>
                </View>
                {location && (
                  <View style={styles.infoRow}>
                    <MaterialIcons name="location-on" size={16} color={Colors.success} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </Text>
                  </View>
                )}
              </View>
            </GlassCard>
          </View>
        )}

        {/* Notes */}
        {capturedMedia && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Add Notes (Optional)</Text>
            <TextInput
              style={[styles.notesInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Add notes about this capture..."
              placeholderTextColor={colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          </View>
        )}

        {/* Upload Button */}
        {capturedMedia && (
          <TouchableOpacity onPress={handleUpload} disabled={uploading}>
            <LinearGradient
              colors={uploading ? [Colors.dark.border, Colors.dark.border] : [Colors.success, '#059669']}
              style={styles.uploadButton}
            >
              {uploading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <MaterialIcons name="cloud-upload" size={24} color="#FFF" />
                  <Text style={styles.uploadButtonText}>Upload to Project</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Info Cards */}
        <View style={styles.section}>
          <GlassCard style={styles.infoCard}>
            <MaterialIcons name="gps-fixed" size={28} color={Colors.success} />
            <View style={styles.infoCardContent}>
              <Text style={[styles.infoCardTitle, { color: colors.text }]}>GPS Tagging</Text>
              <Text style={[styles.infoCardText, { color: colors.textSecondary }]}>
                All photos are automatically tagged with your current GPS location and timestamp.
              </Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.infoCard}>
            <MaterialIcons name="offline-pin" size={28} color={Colors.info} />
            <View style={styles.infoCardContent}>
              <Text style={[styles.infoCardTitle, { color: colors.text }]}>Offline Ready</Text>
              <Text style={[styles.infoCardText, { color: colors.textSecondary }]}>
                Captures are saved locally and sync automatically when back online.
              </Text>
            </View>
          </GlassCard>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    ...Shadows.lg,
  },
  headerTitle: { fontSize: Typography['3xl'], fontWeight: Typography.extrabold, color: '#FFF' },
  headerSubtitle: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  gpsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  gpsText: { fontSize: 12, color: '#FFF', fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  section: { marginTop: Spacing.lg },
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, marginBottom: Spacing.md },
  projectChip: {
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  projectChipActive: { backgroundColor: Colors.success, borderColor: Colors.success },
  projectChipText: { color: Colors.dark.textSecondary, fontSize: 14, fontWeight: '600' },
  projectChipTextActive: { color: '#FFF' },
  captureButtons: { flexDirection: 'row', gap: 12 },
  captureButton: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  captureButtonGradient: { padding: 24, alignItems: 'center', justifyContent: 'center', minHeight: 140 },
  captureButtonText: { fontSize: 16, fontWeight: '700', color: '#FFF', marginTop: 12 },
  captureButtonSubtext: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  voiceButton: { flexDirection: 'row', alignItems: 'center', padding: 16, marginTop: 12, gap: 12 },
  voiceButtonText: { fontSize: 16, fontWeight: '600', flex: 1 },
  comingSoonBadge: { backgroundColor: Colors.warning + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  comingSoonText: { fontSize: 11, color: Colors.warning, fontWeight: '700' },
  previewCard: { padding: 0, overflow: 'hidden' },
  previewImage: { width: '100%', height: 250, resizeMode: 'cover' },
  previewInfo: { padding: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoText: { fontSize: 14 },
  notesInput: { borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, height: 100, textAlignVertical: 'top' },
  uploadButton: { borderRadius: 12, padding: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: Spacing.lg },
  uploadButtonText: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  infoCard: { flexDirection: 'row', padding: 16, marginBottom: 12, gap: 16 },
  infoCardContent: { flex: 1 },
  infoCardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  infoCardText: { fontSize: 14, lineHeight: 20 },
});
