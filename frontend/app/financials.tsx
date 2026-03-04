import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../services/api';

export default function FinancialsScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();
  const [summary, setSummary] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'expenses' | 'invoices'>('summary');

  useEffect(() => {
    loadFinancialData();
  }, [projectId]);

  const loadFinancialData = async () => {
    try {
      const [summaryData, expensesData, invoicesData] = await Promise.all([
        api.api.get(`/financial/summary/${projectId}`),
        api.api.get(`/expenses/${projectId}`),
        api.api.get(`/invoices/${projectId}`),
      ]);
      setSummary(summaryData.data);
      setExpenses(expensesData.data);
      setInvoices(invoicesData.data);
    } catch (error) {
      console.error('Failed to load financial data:', error);
      Alert.alert('Error', 'Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: string) => {
    try {
      const response = await api.api.get(`/financial/export/${projectId}`, {
        params: { format },
      });
      const exportData = response.data;
      
      Alert.alert(
        'Export Ready',
        `Financial data exported in ${format.toUpperCase()} format`,
        [
          { text: 'Share', onPress: () => shareExport(exportData) },
          { text: 'OK' },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const shareExport = async (exportData: any) => {
    try {
      await Share.share({
        message: exportData.data,
        title: exportData.filename,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Financials</Text>
          <Text style={styles.headerSubtitle}>Project Financial Management</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['summary', 'expenses', 'invoices'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as any)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'summary' && summary && (
          <View>
            {/* Summary Cards */}
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <MaterialIcons name="attach-money" size={32} color="#10B981" />
                <Text style={styles.summaryValue}>${summary.total_revenue.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Total Revenue</Text>
              </View>
              <View style={styles.summaryCard}>
                <MaterialIcons name="money-off" size={32} color="#EF4444" />
                <Text style={styles.summaryValue}>${summary.total_expenses.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Total Expenses</Text>
              </View>
              <View style={styles.summaryCard}>
                <MaterialIcons name="account-balance" size={32} color="#3B82F6" />
                <Text style={styles.summaryValue}>${summary.net_profit.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Net Profit</Text>
              </View>
              <View style={styles.summaryCard}>
                <MaterialIcons name="schedule" size={32} color="#F59E0B" />
                <Text style={styles.summaryValue}>${summary.outstanding_invoices.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Outstanding</Text>
              </View>
            </View>

            {/* Expense Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Expense Breakdown</Text>
              {Object.entries(summary.expense_breakdown).map(([category, amount]: [string, any]) => (
                <View key={category} style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
                  <Text style={styles.breakdownValue}>${amount.toLocaleString()}</Text>
                </View>
              ))}
            </View>

            {/* Export Buttons */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Export Financial Data</Text>
              <TouchableOpacity style={styles.exportButton} onPress={() => handleExport('csv')}>
                <MaterialIcons name="table-chart" size={24} color="#FFF" />
                <Text style={styles.exportButtonText}>Export as CSV (Excel)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.exportButton} onPress={() => handleExport('iif')}>
                <MaterialIcons name="sync" size={24} color="#FFF" />
                <Text style={styles.exportButtonText}>Export as IIF (QuickBooks)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.exportButton} onPress={() => handleExport('json')}>
                <MaterialIcons name="code" size={24} color="#FFF" />
                <Text style={styles.exportButtonText}>Export as JSON</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'expenses' && (
          <View style={styles.section}>
            {expenses.length === 0 ? (
              <Text style={styles.emptyText}>No expenses recorded yet</Text>
            ) : (
              expenses.map((expense) => (
                <View key={expense.id} style={styles.listItem}>
                  <View style={styles.listItemHeader}>
                    <Text style={styles.listItemTitle}>{expense.description}</Text>
                    <Text style={styles.listItemAmount}>-${expense.amount.toLocaleString()}</Text>
                  </View>
                  <View style={styles.listItemFooter}>
                    <Text style={styles.listItemMeta}>{expense.category}</Text>
                    <Text style={styles.listItemMeta}>
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'invoices' && (
          <View style={styles.section}>
            {invoices.length === 0 ? (
              <Text style={styles.emptyText}>No invoices created yet</Text>
            ) : (
              invoices.map((invoice) => (
                <View key={invoice.id} style={styles.listItem}>
                  <View style={styles.listItemHeader}>
                    <View>
                      <Text style={styles.listItemTitle}>Invoice #{invoice.invoice_number}</Text>
                      <Text style={styles.listItemClient}>{invoice.client_name}</Text>
                    </View>
                    <Text style={styles.listItemAmount}>${invoice.total.toLocaleString()}</Text>
                  </View>
                  <View style={styles.listItemFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
                      <Text style={styles.statusText}>{invoice.status.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.listItemMeta}>Due: {new Date(invoice.due_date).toLocaleDateString()}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return '#10B981';
    case 'sent': return '#3B82F6';
    case 'overdue': return '#EF4444';
    default: return '#6B7280';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: { padding: 8, marginRight: 12 },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#FF6B35' },
  tabText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  tabTextActive: { color: '#FF6B35' },
  content: { flex: 1, paddingHorizontal: 16 },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  summaryValue: { fontSize: 20, fontWeight: '800', color: '#FFF', marginTop: 8 },
  summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  section: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 16 },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  breakdownLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  breakdownValue: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,53,0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 12,
  },
  listItem: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listItemTitle: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  listItemClient: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  listItemAmount: { fontSize: 18, fontWeight: '700', color: '#FF6B35' },
  listItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemMeta: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    paddingVertical: 32,
  },
});