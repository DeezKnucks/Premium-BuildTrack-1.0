import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { AnimatedTouchable } from '../../components/AnimatedTouchable';
import { GlassCard } from '../../components/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';

export default function MoreScreen() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <MaterialIcons name=\"account-circle\" size={80} color=\"#FFF\" />
          <Text style={styles.name}>{user?.full_name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
          </View>
        </LinearGradient>

        {/* Theme Toggle */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>
          <GlassCard>
            <AnimatedTouchable style={styles.themeToggle} onPress={toggleTheme}>
              <View style={styles.menuItemLeft}>
                <MaterialIcons
                  name={isDark ? 'light-mode' : 'dark-mode'}
                  size={24}
                  color={Colors.primary}
                />
                <Text style={[styles.menuText, { color: colors.text }]}>
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </Text>
              </View>
              <View style={[styles.toggle, isDark && styles.toggleActive]}>
                <View style={[styles.toggleKnob, isDark && styles.toggleKnobActive]} />
              </View>
            </AnimatedTouchable>
          </GlassCard>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT</Text>
          <GlassCard>
            <MenuItem
              icon=\"person\"
              title=\"Edit Profile\"
              onPress={() => {}}
              badge=\"Coming Soon\"
              colors={colors}
            />
            <MenuItem
              icon=\"notifications\"
              title=\"Notifications\"
              onPress={() => {}}
              badge=\"Coming Soon\"
              colors={colors}
            />
            <MenuItem
              icon=\"lock\"
              title=\"Privacy & Security\"
              onPress={() => {}}
              badge=\"Coming Soon\"
              colors={colors}
            />
          </GlassCard>
        </View>

        {/* App Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>FEATURES</Text>
          <GlassCard>
            <MenuItem
              icon=\"photo-library\"
              title=\"Media Gallery\"
              onPress={() => router.push('/media-gallery')}
              colors={colors}
            />
            <MenuItem
              icon=\"chat\"
              title=\"Team Chat\"
              onPress={() => {}}
              badge=\"Coming Soon\"
              colors={colors}
            />
            <MenuItem
              icon=\"store\"
              title=\"Vendor Marketplace\"
              onPress={() => {}}
              badge=\"Coming Soon\"
              colors={colors}
            />
            <MenuItem
              icon=\"assessment\"
              title=\"Reports & Analytics\"
              onPress={() => {}}
              badge=\"Coming Soon\"
              colors={colors}
            />
          </GlassCard>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SUPPORT</Text>
          <GlassCard>
            <MenuItem icon=\"help\" title=\"Help Center\" onPress={() => {}} colors={colors} />
            <MenuItem icon=\"feedback\" title=\"Send Feedback\" onPress={() => {}} colors={colors} />
            <MenuItem icon=\"info\" title=\"About BuildTrack\" onPress={() => {}} colors={colors} />
          </GlassCard>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>
            BuildTrack v1.0.0
          </Text>
          <Text style={[styles.appInfoText, { color: colors.textSecondary }]}>
            © 2025 All Rights Reserved
          </Text>
        </View>

        {/* Logout Button with Gradient */}
        <View style={styles.logoutContainer}>
          <AnimatedTouchable onPress={handleLogout}>
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoutButton}
            >
              <MaterialIcons name=\"logout\" size={24} color=\"#FFF\" />
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </AnimatedTouchable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface MenuItemProps {
  icon: any;
  title: string;
  onPress: () => void;
  badge?: string;
  colors: any;
}

function MenuItem({ icon, title, onPress, badge, colors }: MenuItemProps) {
  return (
    <AnimatedTouchable style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <MaterialIcons name={icon} size={24} color={Colors.primary} />
        <Text style={[styles.menuText, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <MaterialIcons name=\"chevron-right\" size={24} color={colors.textSecondary} />
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    ...Shadows.lg,
  },
  name: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.extrabold,
    color: '#FFF',
    marginTop: Spacing.base,
  },
  email: {
    fontSize: Typography.base,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: Spacing.xs,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  roleText: {
    color: '#FFF',
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    letterSpacing: 1,
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.xs,
    fontWeight: Typography.extrabold,
    marginBottom: Spacing.md,
    letterSpacing: 1.5,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.base,
  },
  toggle: {
    width: 56,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.dark.border,
    padding: 4,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFF',
  },
  toggleKnobActive: {
    marginLeft: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100, 100, 100, 0.1)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    marginLeft: Spacing.md,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: Typography.bold,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  appInfoText: {
    fontSize: Typography.sm,
    marginBottom: 4,
  },
  logoutContainer: {
    paddingHorizontal: Spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    ...Shadows.md,
  },
  logoutText: {
    fontSize: Typography.lg,
    color: '#FFF',
    fontWeight: Typography.bold,
  },
});