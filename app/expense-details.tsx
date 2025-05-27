import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { expensesAPI, Expense } from '@/services/api';

export default function ExpenseDetailsScreen() {
    const [expense, setExpense] = useState<Expense | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    useEffect(() => {
        if (id) {
            fetchExpenseDetails();
        }
    }, [id]);

    const fetchExpenseDetails = async () => {
        try {
            if (!id) {
                Alert.alert('Error', 'No expense ID provided');
                router.back();
                return;
            }

            const data = await expensesAPI.getExpenseById(id);
            if (!data) {
                Alert.alert('Error', 'Expense not found');
                router.back();
                return;
            }
            setExpense(data);
        } catch (error: any) {
            console.error('Fetch expense error:', error);
            let errorMessage = 'Failed to fetch expense details';

            if (error.response?.status === 404) {
                errorMessage = 'Expense not found. It may have been deleted.';
            } else if (error.response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert('Error', errorMessage, [
                { text: 'Go Back', onPress: () => router.back() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Expense',
            'Are you sure you want to delete this expense? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: confirmDelete,
                },
            ]
        );
    };

    const confirmDelete = async () => {
        try {
            if (!expense?.id) return;

            await expensesAPI.deleteExpense(expense.id);
            Alert.alert(
                'Success',
                'Expense deleted successfully',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete expense');
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Invalid date';
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const formatCurrency = (amount: number) => {
        if (isNaN(amount)) {
            return '$0.00';
        }
        return `$${amount.toFixed(2)}`;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.loadingText}>Loading expense details...</Text>
            </View>
        );
    }

    if (!expense) {
        return (
            <View style={styles.errorContainer}>
                <FontAwesome name="exclamation-triangle" size={60} color="#e53e3e" />
                <Text style={styles.errorText}>Expense not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <View style={styles.amountContainer}>
                        <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{expense.category}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.detailRow}>
                        <FontAwesome name="tag" size={20} color="#666" />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Title</Text>
                            <Text style={styles.detailValue}>{expense.title}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <FontAwesome name="calendar" size={20} color="#666" />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Date</Text>
                            <Text style={styles.detailValue}>{formatDate(expense.date)}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <FontAwesome name="folder" size={20} color="#666" />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Category</Text>
                            <Text style={styles.detailValue}>{expense.category}</Text>
                        </View>
                    </View>

                    {expense.description && (
                        <View style={styles.detailRow}>
                            <FontAwesome name="file-text" size={20} color="#666" />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Description</Text>
                                <Text style={styles.detailValue}>{expense.description}</Text>
                            </View>
                        </View>
                    )}

                    {expense.userId && (
                        <View style={styles.detailRow}>
                            <FontAwesome name="user" size={20} color="#666" />
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>User ID</Text>
                                <Text style={styles.detailValue}>{expense.userId}</Text>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <FontAwesome name="trash" size={18} color="white" />
                        <Text style={styles.deleteButtonText}>Delete Expense</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <FontAwesome name="info-circle" size={16} color="#666" />
                    <Text style={styles.infoText}>
                        This expense was created on {formatDate(expense.date)}
                    </Text>
                </View>
            </View>
        </ScrollView>
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#2E7D32',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    card: {
        backgroundColor: 'white',
        margin: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        overflow: 'hidden',
    },
    header: {
        backgroundColor: '#2E7D32',
        padding: 20,
        alignItems: 'center',
    },
    amountContainer: {
        alignItems: 'center',
    },
    amount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    categoryBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    section: {
        padding: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    detailContent: {
        marginLeft: 15,
        flex: 1,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    actions: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    deleteButton: {
        backgroundColor: '#e53e3e',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 8,
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    infoCard: {
        backgroundColor: 'white',
        margin: 16,
        marginTop: 0,
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
});
