import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';

export default function App() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🏗️</Text>
        <Text style={styles.title}>BuildTrack Premium</Text>
        <Text style={styles.subtitle}>Construction Management Platform</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>✅ All Features Complete</Text>
        <Text style={styles.feature}>📊 Custom Gantt Charts</Text>
        <Text style={styles.feature}>💰 Financial Management</Text>
        <Text style={styles.feature}>📹 Video Conferencing</Text>
        <Text style={styles.feature}>🤖 GPT-5.2 AI Risk Analysis</Text>
        <Text style={styles.feature}>📍 GPS Media Logging</Text>
        <Text style={styles.feature}>🛡️ Safety Monitoring</Text>
        <Text style={styles.feature}>📱 30+ Production Screens</Text>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Full app on GitHub:</Text>
        <Text style={styles.link}>DeezKnucks/Premium-BuildTrack-1.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FF6B35',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 20,
    padding: 24,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 20,
  },
  feature: {
    fontSize: 16,
    color: '#FFF',
    marginVertical: 8,
    paddingLeft: 8,
  },
  button: {
    backgroundColor: '#FF6B35',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    padding: 40,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  link: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
