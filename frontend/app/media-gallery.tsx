import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 3;

export default function MediaGalleryScreen() {
  const [media, setMedia] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'photo' | 'video' | 'voice'>('all');

  useEffect(() => {
    loadData();
  }, [selectedProject, filter]);

  const loadData = async () => {
    try {
      const [mediaData, projectsData] = await Promise.all([
        selectedProject ? api.getMedia(selectedProject) : api.getMedia(),
        api.getProjects(),
      ]);
      
      // Filter by media type
      let filteredMedia = mediaData;
      if (filter !== 'all') {
        filteredMedia = mediaData.filter((m: any) => m.media_type === filter);
      }
      
      setMedia(filteredMedia);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Media Gallery</Text>
        <View style={styles.headerStats}>
          <MaterialIcons name="photo-library" size={20} color="#FF6B35" />
          <Text style={styles.headerStatsText}>{media.length}</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <Text style={styles.filterLabel}>Filter:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { label: 'All', value: 'all', icon: 'filter-list' },
            { label: 'Photos', value: 'photo', icon: 'photo' },
            { label: 'Videos', value: 'video', icon: 'videocam' },
            { label: 'Voice', value: 'voice', icon: 'mic' },
          ].map((filterOption) => (
            <TouchableOpacity
              key={filterOption.value}
              style={[
                styles.filterChip,
                filter === filterOption.value && styles.filterChipActive,
              ]}
              onPress={() => setFilter(filterOption.value as any)}
            >
              <MaterialIcons
                name={filterOption.icon as any}
                size={16}
                color={filter === filterOption.value ? '#FFF' : '#999'}
              />
              <Text
                style={[
                  styles.filterChipText,
                  filter === filterOption.value && styles.filterChipTextActive,
                ]}
              >
                {filterOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Project Filter */}
      <View style={styles.projectFilterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.projectChip,
              !selectedProject && styles.projectChipActive,
            ]}
            onPress={() => setSelectedProject('')}
          >
            <Text
              style={[
                styles.projectChipText,
                !selectedProject && styles.projectChipTextActive,
              ]}
            >
              All Projects
            </Text>
          </TouchableOpacity>
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

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B35"
          />
        }
      >
        {media.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="photo-library" size={64} color="#666" />
            <Text style={styles.emptyText}>No media yet</Text>
            <Text style={styles.emptySubtext}>
              Capture photos, videos, or voice notes from the Capture tab
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {media.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.gridItem}
                onPress={() => setSelectedMedia(item)}
              >
                {item.media_type === 'photo' ? (
                  <Image
                    source={{ uri: item.file_data }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                ) : item.media_type === 'video' ? (
                  <View style={styles.videoThumbnail}>
                    <MaterialIcons name="play-circle-filled" size={48} color="#FFF" />
                  </View>
                ) : (
                  <View style={styles.voiceThumbnail}>
                    <MaterialIcons name="mic" size={32} color="#FF6B35" />
                  </View>
                )}
                <View style={styles.mediaOverlay}>
                  <View style={styles.mediaInfo}>
                    {item.location && (
                      <MaterialIcons name="location-on" size={12} color="#4CAF50" />
                    )}
                    <Text style={styles.mediaDate} numberOfLines={1}>
                      {format(new Date(item.uploaded_at), 'MMM dd')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Media Detail Modal */}
      <Modal
        visible={!!selectedMedia}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedMedia(null)}
      >
        {selectedMedia && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedMedia(null)}>
                <MaterialIcons name="close" size={28} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Media Details</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedMedia.media_type === 'photo' && (
                <Image
                  source={{ uri: selectedMedia.file_data }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              )}

              {selectedMedia.media_type === 'video' && (
                <View style={styles.videoPlaceholder}>
                  <MaterialIcons name="play-circle-filled" size={80} color="#FF6B35" />
                  <Text style={styles.videoPlaceholderText}>Video Player</Text>
                </View>
              )}

              {selectedMedia.media_type === 'voice' && (
                <View style={styles.voicePlayer}>
                  <MaterialIcons name="mic" size={64} color="#FF6B35" />
                  <Text style={styles.voicePlayerText}>Voice Note</Text>
                  <TouchableOpacity style={styles.playButton}>
                    <MaterialIcons name="play-arrow" size={32} color="#FFF" />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.detailsCard}>
                <DetailRow icon="folder" label="Project" value={getProjectName(selectedMedia.project_id)} />
                <DetailRow
                  icon="calendar-today"
                  label="Date"
                  value={format(new Date(selectedMedia.uploaded_at), 'PPpp')}
                />
                {selectedMedia.location && (
                  <DetailRow
                    icon="location-on"
                    label="Location"
                    value={`${selectedMedia.location.lat.toFixed(6)}, ${selectedMedia.location.lng.toFixed(6)}`}
                  />
                )}
                {selectedMedia.notes && (
                  <DetailRow icon="notes" label="Notes" value={selectedMedia.notes} />
                )}
                {selectedMedia.tags && selectedMedia.tags.length > 0 && (
                  <View style={styles.detailRow}>
                    <MaterialIcons name="label" size={20} color="#999" />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Tags</Text>
                      <View style={styles.tagsContainer}>
                        {selectedMedia.tags.map((tag: string, index: number) => (
                          <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <MaterialIcons name={icon} size={20} color="#999" />
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F0F23',
    justifyContent: 'center',
    alignItems: 'center',
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
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerStatsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  filtersSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  filterChipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterChipText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  projectFilterSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  projectChip: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  projectChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  projectChipText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  projectChipTextActive: {
    color: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: imageSize,
    height: imageSize,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A2E',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 6,
  },
  mediaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mediaDate: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalContent: {
    flex: 1,
  },
  fullImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#000',
  },
  videoPlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholderText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  voicePlayer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    margin: 20,
    borderRadius: 16,
  },
  voicePlayerText: {
    fontSize: 18,
    color: '#FFF',
    marginTop: 16,
    marginBottom: 24,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsCard: {
    backgroundColor: '#1A1A2E',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#FFF',
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#2A2A3E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
});