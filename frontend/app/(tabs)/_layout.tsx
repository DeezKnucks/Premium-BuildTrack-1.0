import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../../constants/theme';
import {
  ToolboxIcon,
  BlueprintIcon,
  HammerIcon,
  HardHatIcon,
  WrenchIcon,
} from '../../components/CustomIcons';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.dark.bg,
          borderTopColor: Colors.dark.border,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.dark.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.5,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <ToolboxIcon size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <BlueprintIcon size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <HammerIcon size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="capture"
        options={{
          title: 'Capture',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.captureButton, focused && styles.captureButtonActive]}>
              <MaterialIcons name="camera-alt" size={28} color="#FFF" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <MaterialIcons name="psychology" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <WrenchIcon size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    padding: 6,
    borderRadius: 12,
  },
  iconContainerActive: {
    backgroundColor: Colors.primary + '20',
  },
  captureButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    ...Shadows.lg,
  },
  captureButtonActive: {
    backgroundColor: Colors.primaryDark,
    transform: [{ scale: 1.1 }],
  },
});
