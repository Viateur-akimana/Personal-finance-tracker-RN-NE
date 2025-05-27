import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { expensesAPI, Expense } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

interface CategoryStats {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export default function DashboardScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const { user } = useAuth();

  const fetchExpenses = async () => {
    try {
      const data = await expensesAPI.getAllExpenses();
      if (Array.isArray(data)) {
        setExpenses(data);
        calculateCategoryStats(data);
      } else {
        console.warn('Unexpected data format from API:', data);
        setExpenses([]);
        setCategoryStats([]);
      }
    } catch (error: any) {
      console.error('Dashboard fetch error:', error);
      let errorMessage = 'Failed to fetch expenses for dashboard';

      if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
      setExpenses([]);
      setCategoryStats([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [])
  );

  const calculateCategoryStats = (expenseData: Expense[]) => {
    const categoryMap = new Map<string, { amount: number; count: number }>();
    let totalAmount = 0;

    expenseData.forEach((expense) => {
      const existing = categoryMap.get(expense.category) || { amount: 0, count: 0 };
      categoryMap.set(expense.category, {
        amount: existing.amount + expense.amount,
        count: existing.count + 1,
      });
      totalAmount += expense.amount;
    });

    const stats: CategoryStats[] = Array.from(categoryMap.entries()).map(
      ([category, { amount, count }]) => ({
        category,
        amount,
        count,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      })
    );

    stats.sort((a, b) => b.amount - a.amount);
    setCategoryStats(stats);
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getThisMonthExpenses = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    }).reduce((total, expense) => total + expense.amount, 0);
  };

  const getRecentExpenses = () => {
    return expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      'Food & Dining': 'cutlery',
      'Transportation': 'car',
      'Shopping': 'shopping-bag',
      'Entertainment': 'film',
      'Bills & Utilities': 'bolt',
      'Healthcare': 'heartbeat',
      'Travel': 'plane',
      'Education': 'graduation-cap',
      'Business': 'briefcase',
      'Other': 'question-circle',
    };
    return iconMap[category] || 'question-circle';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Welcome Section */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome back, {user?.username || 'User'}!</Text>
        <Text style={styles.welcomeSubtitle}>Here's your expense overview</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <FontAwesome name="dollar" size={24} color="#2E7D32" />
          <Text style={styles.summaryAmount}>{formatCurrency(getTotalExpenses())}</Text>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
        </View>

        <View style={styles.summaryCard}>
          <FontAwesome name="calendar" size={24} color="#1976D2" />
          <Text style={styles.summaryAmount}>{formatCurrency(getThisMonthExpenses())}</Text>
          <Text style={styles.summaryLabel}>This Month</Text>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <FontAwesome name="list" size={24} color="#F57C00" />
          <Text style={styles.summaryAmount}>{expenses.length}</Text>
          <Text style={styles.summaryLabel}>Total Transactions</Text>
        </View>

        <View style={styles.summaryCard}>
          <FontAwesome name="tags" size={24} color="#7B1FA2" />
          <Text style={styles.summaryAmount}>{categoryStats.length}</Text>
          <Text style={styles.summaryLabel}>Categories</Text>
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <FontAwesome name="pie-chart" size={20} color="#2E7D32" />
          <Text style={styles.sectionTitle}>Spending by Category</Text>
        </View>

        {categoryStats.length > 0 ? (
          categoryStats.slice(0, 6).map((stat, index) => (
            <View key={stat.category} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <FontAwesome name={getCategoryIcon(stat.category) as any} size={16} color="#666" />
                <Text style={styles.categoryName}>{stat.category}</Text>
              </View>
              <View style={styles.categoryStats}>
                <Text style={styles.categoryAmount}>{formatCurrency(stat.amount)}</Text>
                <Text style={styles.categoryPercentage}>{stat.percentage.toFixed(1)}%</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No expense data available</Text>
        )}
      </View>

      {/* Recent Expenses */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <FontAwesome name="clock-o" size={20} color="#2E7D32" />
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
        </View>

        {getRecentExpenses().length > 0 ? (
          getRecentExpenses().map((expense) => (
            <View key={expense.id} style={styles.recentExpenseItem}>
              <View style={styles.recentExpenseInfo}>
                <Text style={styles.recentExpenseTitle}>{expense.title}</Text>
                <Text style={styles.recentExpenseCategory}>{expense.category}</Text>
              </View>
              <View style={styles.recentExpenseAmount}>
                <Text style={styles.recentExpenseAmountText}>{formatCurrency(expense.amount)}</Text>
                <Text style={styles.recentExpenseDate}>
                  {new Date(expense.date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No recent expenses</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  welcomeCard: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  summaryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recentExpenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentExpenseInfo: {
    flex: 1,
  },
  recentExpenseTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  recentExpenseCategory: {
    fontSize: 14,
    color: '#666',
  },
  recentExpenseAmount: {
    alignItems: 'flex-end',
  },
  recentExpenseAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  recentExpenseDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    paddingVertical: 20,
  },
});
