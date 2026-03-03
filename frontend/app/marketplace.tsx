import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { AnimatedTouchable } from '../components/AnimatedTouchable';

const { width } = Dimensions.get('window');

const MOCK_VENDORS = [
  {
    id: '1',
    name: 'ABC Concrete Solutions',
    category: 'Concrete & Foundation',
    rating: 4.8,
    reviews: 127,
    verified: true,
    image: null,
    services: ['Foundations', 'Slabs', 'Driveways', 'Repairs'],
    priceRange: '$$',
    distance: '2.3 mi',
  },
  {
    id: '2',
    name: 'Elite Electrical Services',
    category: 'Electrical',
    rating: 4.9,
    reviews: 243,
    verified: true,
    image: null,
    services: ['Commercial', 'Residential', 'Industrial', 'Solar'],
    priceRange: '$$$',
    distance: '5.1 mi',
  },
  {
    id: '3',
    name: 'Pro Plumbing Co.',
    category: 'Plumbing',
    rating: 4.7,
    reviews: 89,
    verified: true,
    image: null,
    services: ['Installation', 'Repair', 'Maintenance', 'Emergency'],
    priceRange: '$$',
    distance: '3.8 mi',
  },
  {
    id: '4',
    name: 'SteelWorks Inc.',
    category: 'Steel & Metal',
    rating: 4.6,
    reviews: 156,
    verified: false,
    image: null,
    services: ['Structural Steel', 'Fabrication', 'Welding'],
    priceRange: '$$$',
    distance: '8.2 mi',
  },
  {
    id: '5',
    name: 'GreenScape Landscaping',
    category: 'Landscaping',
    rating: 4.9,
    reviews: 312,
    verified: true,
    image: null,
    services: ['Design', 'Installation', 'Irrigation', 'Maintenance'],
    priceRange: '$$',
    distance: '1.5 mi',
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'apps' },
  { id: 'concrete', name: 'Concrete', icon: 'terrain' },
  { id: 'electrical', name: 'Electrical', icon: 'bolt' },
  { id: 'plumbing', name: 'Plumbing', icon: 'water-drop' },
  { id: 'steel', name: 'Steel', icon: 'build' },
  { id: 'landscaping', name: 'Landscape', icon: 'grass' },
];

export default function MarketplaceScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredVendors = MOCK_VENDORS.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || v.category.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <MaterialIcons
        key={i}
        name={i < Math.floor(rating) ? 'star' : i < rating ? 'star-half' : 'star-outline'}
        size={16}
        color={Colors.warning}
      />
    ));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.completed, '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Vendor Marketplace</Text>
          <Text style={styles.headerSubtitle}>Find trusted contractors & suppliers</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialIcons name="store" size={32} color="#FFF" />
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MaterialIcons name="search" size={24} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search vendors..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCategory(cat.id);
            }}
          >
            <MaterialIcons
              name={cat.icon as any}
              size={18}
              color={selectedCategory === cat.id ? '#FFF' : colors.textSecondary}
            />
            <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Vendor List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
          {filteredVendors.length} vendors found
        </Text>

        {filteredVendors.map((vendor) => (
          <AnimatedTouchable key={vendor.id} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <GlassCard style={styles.vendorCard}>
              <View style={styles.vendorHeader}>
                <LinearGradient
                  colors={[Colors.secondary, Colors.secondaryLight]}
                  style={styles.vendorAvatar}
                >
                  <Text style={styles.vendorInitial}>{vendor.name.charAt(0)}</Text>
                </LinearGradient>
                <View style={styles.vendorInfo}>
                  <View style={styles.vendorNameRow}>
                    <Text style={[styles.vendorName, { color: colors.text }]} numberOfLines={1}>{vendor.name}</Text>
                    {vendor.verified && (
                      <View style={styles.verifiedBadge}>
                        <MaterialIcons name="verified" size={16} color={Colors.info} />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.vendorCategory, { color: colors.textSecondary }]}>{vendor.category}</Text>
                  <View style={styles.ratingRow}>
                    <View style={styles.stars}>{renderStars(vendor.rating)}</View>
                    <Text style={[styles.ratingText, { color: colors.text }]}>{vendor.rating}</Text>
                    <Text style={[styles.reviewsText, { color: colors.textSecondary }]}>({vendor.reviews})</Text>
                  </View>
                </View>
              </View>

              <View style={styles.vendorServices}>
                {vendor.services.slice(0, 3).map((service, i) => (
                  <View key={i} style={[styles.serviceTag, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.serviceText, { color: colors.textSecondary }]}>{service}</Text>
                  </View>
                ))}
                {vendor.services.length > 3 && (
                  <View style={[styles.serviceTag, { backgroundColor: Colors.primary + '20' }]}>
                    <Text style={[styles.serviceText, { color: Colors.primary }]}>+{vendor.services.length - 3}</Text>
                  </View>
                )}
              </View>

              <View style={styles.vendorFooter}>
                <View style={styles.vendorMeta}>
                  <MaterialIcons name="location-on" size={16} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{vendor.distance}</Text>
                </View>
                <View style={styles.vendorMeta}>
                  <MaterialIcons name="attach-money" size={16} color={Colors.success} />
                  <Text style={[styles.metaText, { color: colors.text }]}>{vendor.priceRange}</Text>
                </View>
                <TouchableOpacity style={styles.contactButton}>
                  <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.contactButtonGradient}>
                    <Text style={styles.contactButtonText}>Contact</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </AnimatedTouchable>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    ...Shadows.lg,
  },
  backButton: { marginRight: Spacing.md },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold, color: '#FFF' },
  headerSubtitle: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  headerIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  searchContainer: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 16, marginLeft: 12 },
  categoriesContainer: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  categoryChipActive: { backgroundColor: Colors.completed, borderColor: Colors.completed },
  categoryText: { fontSize: 13, fontWeight: '600', color: Colors.dark.textSecondary },
  categoryTextActive: { color: '#FFF' },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  resultsCount: { fontSize: Typography.sm, marginBottom: Spacing.md },
  vendorCard: { marginBottom: Spacing.md, padding: Spacing.base },
  vendorHeader: { flexDirection: 'row', marginBottom: Spacing.md },
  vendorAvatar: { width: 56, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  vendorInitial: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  vendorInfo: { flex: 1, marginLeft: Spacing.md },
  vendorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vendorName: { fontSize: Typography.base, fontWeight: Typography.bold, flex: 1 },
  verifiedBadge: { marginLeft: 4 },
  vendorCategory: { fontSize: Typography.sm, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  stars: { flexDirection: 'row' },
  ratingText: { fontSize: Typography.sm, fontWeight: Typography.bold, marginLeft: 4 },
  reviewsText: { fontSize: Typography.xs },
  vendorServices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  serviceTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  serviceText: { fontSize: 12, fontWeight: '500' },
  vendorFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vendorMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: Typography.sm },
  contactButton: { borderRadius: 8, overflow: 'hidden' },
  contactButtonGradient: { paddingHorizontal: 16, paddingVertical: 8 },
  contactButtonText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
});
