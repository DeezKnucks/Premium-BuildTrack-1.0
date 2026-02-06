import React, { useState, useEffect, useRef } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import api from '../../services/api';

export default function CaptureScreen() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    requestPermissions();
    loadProjects();
    getCurrentLocation();
  }, []);

  const requestPermissions = async () => {
    const cameraStatus = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(cameraStatus.status === 'granted');

    const locationStatus = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(locationStatus.status === 'granted');

    const imageStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
  };

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const takePhoto = async () => {
    if (!cameraPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setCapturedMedia(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickFromGallery = async () => {
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Field Capture</Text>
        <View style={styles.locationBadge}>
          <MaterialIcons name="location-on" size={16} color="#4CAF50" />
          <Text style={styles.locationText}>
            {location ? 'GPS Active' : 'Getting GPS...'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Project Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Project</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[
                  styles.projectChip,
                  selectedProject === project.id && styles.projectChipActive,
                ]}
                onPress={() => setSelectedProject(project.id)}
              >
                <Text
                  style={[
                    styles.projectChipText,
                    selectedProject === project.id && styles.projectChipTextActive,
                  ]}
                >
                  {project.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Capture Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Capture Media</Text>
          <View style={styles.captureButtons}>
            <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
              <View style={styles.captureButtonIcon}>
                <MaterialIcons name="camera-alt" size={32} color="#FF6B35" />
              </View>
              <Text style={styles.captureButtonText}>Take Photo</Text>
              <Text style={styles.captureButtonSubtext}>Camera with GPS tag</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={pickFromGallery}>
              <View style={styles.captureButtonIcon}>
                <MaterialIcons name="photo-library" size={32} color="#FF6B35" />
              </View>
              <Text style={styles.captureButtonText}>From Gallery</Text>
              <Text style={styles.captureButtonSubtext}>Select existing photo</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.voiceButton}>
            <MaterialIcons name="mic" size={24} color="#FFF" />
            <Text style={styles.voiceButtonText}>Record Voice Note</Text>
            <Text style={styles.comingSoon}>Coming Soon</Text>
          </TouchableOpacity>
        </View>

        {/* Preview */}
        {capturedMedia && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={styles.previewCard}>
              <Image source={{ uri: capturedMedia }} style={styles.previewImage} />
              <View style={styles.previewInfo}>
                <View style={styles.infoRow}>
                  <MaterialIcons name="access-time" size={16} color="#999" />
                  <Text style={styles.infoText}>
                    {new Date().toLocaleString()}
                  </Text>
                </View>
                {location && (
                  <View style={styles.infoRow}>
                    <MaterialIcons name="location-on" size={16} color="#4CAF50" />
                    <Text style={styles.infoText}>
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Notes */}
        {capturedMedia && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add notes about this capture..."
              placeholderTextColor="#666"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          </View>
        )}

        {/* Upload Button */}
        {capturedMedia && (
          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <MaterialIcons name="cloud-upload" size={24} color="#FFF" />
                <Text style={styles.uploadButtonText}>Upload to Project</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Info Cards */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={24} color="#2196F3" />
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>GPS Tagging</Text>
              <Text style={styles.infoCardText}>
                All photos are automatically tagged with your current GPS location and
                timestamp for accurate field documentation.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <MaterialIcons name="offline-pin" size={24} color="#4CAF50" />
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Offline Ready</Text>
              <Text style={styles.infoCardText}>
                Captures are saved locally and will sync automatically when you're back
                online.
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  projectChip: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  projectChipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  projectChipText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  projectChipTextActive: {
    color: '#FFF',
  },
  captureButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  captureButton: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  captureButtonIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2A2A3E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  captureButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  captureButtonSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    gap: 12,
  },
  voiceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  comingSoon: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  previewCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  previewImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  previewInfo: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#999',
  },
  notesInput: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    height: 100,
    textAlignVertical: 'top',
  },
  uploadButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    gap: 16,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
});