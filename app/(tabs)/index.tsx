import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { expensesAPI, Expense } from '@/services/api';

interface ExpenseItemProps {
  expense: Expense;
  onPress: () => void;
  onDelete: () => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onPress, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined) {
      return '$0.00';
    }
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${(isNaN(numAmount) ? 0 : numAmount).toFixed(2)}`;
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.expenseItem} onPress={onPress}>
      <View style={styles.expenseContent}>
        <View style={styles.expenseHeader}>
          <Text style={styles.expenseTitle}>{expense.title}</Text>
          <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
        </View>
        <View style={styles.expenseDetails}>
          <Text style={styles.expenseCategory}>{expense.category}</Text>
          <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
        </View>
        {expense.description && (
          <Text style={styles.expenseDescription} numberOfLines={2}>
            {expense.description}
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <FontAwesome name="trash" size={18} color="#e53e3e" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchExpenses = async () => {
    try {
      const data = await expensesAPI.getAllExpenses();
      console.log('Fetched expenses data:', data);
      console.log('Sample expense amount type:', typeof data[0]?.amount);
      if (Array.isArray(data)) {
        setExpenses(data);
      } else {
        console.warn('Unexpected data format from API:', data);
        setExpenses([]);
      }
    } catch (error: any) {
      console.error('Fetch expenses error:', error);
      let errorMessage = 'Failed to fetch expenses';

      if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
      setExpenses([]); // Set empty array on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchExpenses();
  };

  const handleExpensePress = (expense: Expense) => {
    router.push(`/expense-details?id=${expense.id}` as any);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await expensesAPI.deleteExpense(expenseId);
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
      Alert.alert('Success', 'Expense deleted successfully', [
        { text: 'OK', style: 'default' }
      ]);
    } catch (error: any) {
      console.error('Delete error:', error);
      let errorMessage = 'Failed to delete expense';

      if (error.response?.status === 404) {
        errorMessage = 'Expense not found. It may have already been deleted.';
        // Remove from local state anyway
        setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    }
  };

  const getTotalExpenses = () => {
    const total = expenses.reduce((total, expense) => {
      // Handle null/undefined amounts
      if (expense.amount === null || expense.amount === undefined) {
        console.log(`Expense: ${expense.title}, Amount: null/undefined, Skipping`);
        return total;
      }

      // Ensure amount is a number to avoid NaN
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
      console.log(`Expense: ${expense.title}, Amount: ${expense.amount} (${typeof expense.amount}), Parsed: ${amount}`);
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
    console.log('Total calculated:', total);
    return total;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FontAwesome name="folder-open" size={60} color="#ccc" />
      <Text style={styles.emptyStateText}>No expenses found</Text>
      <Text style={styles.emptyStateSubtext}>
        Start tracking your expenses by adding your first entry
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={() => {
          console.log('Empty state button pressed - navigating to add-expense');
          router.push('/add-expense');
        }}
      >
        <FontAwesome name="plus" size={16} color="white" />
        <Text style={styles.emptyStateButtonText}>Add First Expense</Text>
      </TouchableOpacity>
    </View>
  );

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <ExpenseItem
      expense={item}
      onPress={() => handleExpensePress(item)}
      onDelete={() => handleDeleteExpense(item.id)}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading expenses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Total Expenses</Text>
        <Text style={styles.summaryAmount}>
          ${isNaN(getTotalExpenses()) ? '0.00' : getTotalExpenses().toFixed(2)}
        </Text>
        <Text style={styles.summaryCount}>{expenses.length} expenses</Text>
      </View>
      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={expenses.length === 0 ? styles.emptyContainer : styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  summaryCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 14,
    color: '#999',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  expenseItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseContent: {
    flex: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expenseDate: {
    fontSize: 14,
    color: '#999',
  },
  expenseDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    padding: 10,
    marginLeft: 10,
  },
});
