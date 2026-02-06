import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function MoreScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const openURL = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <MaterialIcons name="account-circle" size={80} color="#FF6B35" />
          <Text style={styles.name}>{user?.full_name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <MenuItem 
            icon="person" 
            title="Edit Profile" 
            onPress={() => {}} 
            badge="Coming Soon"
          />
          <MenuItem 
            icon="notifications" 
            title="Notifications" 
            onPress={() => {}} 
            badge="Coming Soon"
          />
          <MenuItem 
            icon="lock" 
            title="Privacy & Security" 
            onPress={() => {}} 
            badge="Coming Soon"
          />
        </View>

        {/* App Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <MenuItem 
            icon="photo-library" 
            title="Media Gallery" 
            onPress={() => {}} 
            badge="Coming Soon"
          />
          <MenuItem 
            icon="chat" 
            title="Team Chat" 
            onPress={() => {}} 
            badge="Coming Soon"
          />
          <MenuItem 
            icon="store" 
            title="Vendor Marketplace" 
            onPress={() => {}} 
            badge="Coming Soon"
          />
          <MenuItem 
            icon="assessment" 
            title="Reports & Analytics" 
            onPress={() => {}} 
            badge="Coming Soon"
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <MenuItem icon="help" title="Help Center" onPress={() => {}} />
          <MenuItem icon="feedback" title="Send Feedback" onPress={() => {}} />
          <MenuItem icon="info" title="About BuildTrack" onPress={() => {}} />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>BuildTrack v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2025 All Rights Reserved</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#F44336" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

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
}

function MenuItem({ icon, title, onPress, badge }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <MaterialIcons name={icon} size={24} color="#FFF" />
        <Text style={styles.menuText}>{title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <MaterialIcons name="chevron-right" size={24} color="#666" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
  },
  email: {
    fontSize: 16,
    color: '#999',
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
  },
  roleText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    color: '#FFF',
    marginLeft: 16,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appInfoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A2E',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  logoutText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 12,
  },
});