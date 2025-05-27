import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { expensesAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const CATEGORIES = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Education',
    'Business',
    'Other'
];

export default function AddExpenseScreen() {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [showCategories, setShowCategories] = useState(false);

    const router = useRouter();
    const { user } = useAuth();

    const validateForm = () => {
        if (!title.trim()) {
            Alert.alert('Validation Error', 'Please enter an expense title');
            return false;
        }
        if (title.trim().length < 2) {
            Alert.alert('Validation Error', 'Expense title must be at least 2 characters');
            return false;
        }
        if (!amount.trim()) {
            Alert.alert('Validation Error', 'Please enter an amount');
            return false;
        }
        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            Alert.alert('Validation Error', 'Please enter a valid amount greater than 0');
            return false;
        }
        if (numAmount > 999999.99) {
            Alert.alert('Validation Error', 'Amount cannot exceed $999,999.99');
            return false;
        }
        if (!category) {
            Alert.alert('Validation Error', 'Please select a category');
            return false;
        }
        if (!date) {
            Alert.alert('Validation Error', 'Please enter a valid date');
            return false;
        }
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            Alert.alert('Validation Error', 'Please enter date in YYYY-MM-DD format');
            return false;
        }
        // Check if date is valid and not in the future
        const parsedDate = new Date(date);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today

        if (isNaN(parsedDate.getTime())) {
            Alert.alert('Validation Error', 'Please enter a valid date');
            return false;
        }
        if (parsedDate > today) {
            Alert.alert('Validation Error', 'Expense date cannot be in the future');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);

            const expenseData = {
                title: title.trim(),
                amount: Number(amount),
                category,
                description: description.trim(),
                date,
                userId: user?.id || '',
            };

            await expensesAPI.createExpense(expenseData);

            // Reset form
            setTitle('');
            setAmount('');
            setCategory('');
            setDescription('');
            setDate(new Date().toISOString().split('T')[0]);

            Alert.alert(
                'Success',
                'Expense created successfully!',
                [
                    {
                        text: 'Add Another',
                        style: 'default',
                        onPress: () => { }, // Stay on the form
                    },
                    {
                        text: 'View Expenses',
                        style: 'default',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Create expense error:', error);

            // Handle duplicate detection
            if (error.message && error.message.includes('DUPLICATE_FOUND:')) {
                try {
                    const duplicateData = JSON.parse(error.message.split('DUPLICATE_FOUND:')[1]);
                    const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
                    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

                    Alert.alert(
                        'Possible Duplicate Expense',
                        `An expense with similar details already exists:\n\n` +
                        `• Title: ${duplicateData.title}\n` +
                        `• Amount: ${formatCurrency(duplicateData.amount)}\n` +
                        `• Category: ${duplicateData.category}\n` +
                        `• Date: ${formatDate(duplicateData.date)}\n\n` +
                        `Would you like to create this expense anyway?`,
                        [
                            {
                                text: 'Cancel',
                                style: 'cancel',
                                onPress: () => setLoading(false),
                            },
                            {
                                text: 'View Existing',
                                style: 'default',
                                onPress: () => {
                                    setLoading(false);
                                    router.push(`/expense-details?id=${duplicateData.id}` as any);
                                },
                            },
                            {
                                text: 'Create Anyway',
                                style: 'default',
                                onPress: async () => {
                                    try {
                                        const expenseData = {
                                            title: title.trim(),
                                            amount: Number(amount),
                                            category,
                                            description: description.trim(),
                                            date,
                                            userId: user?.id || '',
                                        };

                                        await expensesAPI.forceCreateExpense(expenseData);

                                        // Reset form
                                        setTitle('');
                                        setAmount('');
                                        setCategory('');
                                        setDescription('');
                                        setDate(new Date().toISOString().split('T')[0]);

                                        Alert.alert(
                                            'Success',
                                            'Expense created successfully!',
                                            [
                                                {
                                                    text: 'Add Another',
                                                    style: 'default',
                                                    onPress: () => { },
                                                },
                                                {
                                                    text: 'View Expenses',
                                                    style: 'default',
                                                    onPress: () => router.back(),
                                                },
                                            ]
                                        );
                                    } catch (forceError: any) {
                                        Alert.alert('Error', forceError instanceof Error ? forceError.message : 'Failed to create expense');
                                    } finally {
                                        setLoading(false);
                                    }
                                },
                            },
                        ]
                    );
                } catch (parseError) {
                    // If we can't parse the duplicate data, show generic error
                    Alert.alert('Error', 'A similar expense may already exist. Please check your expenses list.');
                    setLoading(false);
                }
            } else {
                // Handle other errors
                Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create expense');
                setLoading(false);
            }
        }
    };

    const selectCategory = (selectedCategory: string) => {
        setCategory(selectedCategory);
        setShowCategories(false);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
                <View style={styles.formCard}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Expense Title *</Text>
                        <TextInput
                            style={[styles.input, loading && styles.disabledInput]}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Enter expense title"
                            maxLength={100}
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Amount ($) *</Text>
                        <TextInput
                            style={[styles.input, loading && styles.disabledInput]}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0.00"
                            keyboardType="numeric"
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Category *</Text>
                        <TouchableOpacity
                            style={[styles.input, styles.categorySelector]}
                            onPress={() => setShowCategories(!showCategories)}
                            disabled={loading}
                        >
                            <Text style={[styles.categoryText, !category && styles.placeholderText]}>
                                {category || 'Select a category'}
                            </Text>
                            <FontAwesome
                                name={showCategories ? "chevron-up" : "chevron-down"}
                                size={16}
                                color="#666"
                            />
                        </TouchableOpacity>

                        {showCategories && (
                            <View style={styles.categoriesContainer}>
                                {CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={styles.categoryOption}
                                        onPress={() => selectCategory(cat)}
                                    >
                                        <Text style={styles.categoryOptionText}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Date *</Text>
                        <TextInput
                            style={[styles.input, loading && styles.disabledInput]}
                            value={date}
                            onChangeText={setDate}
                            placeholder="YYYY-MM-DD"
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Description (Optional)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Add a description..."
                            multiline
                            numberOfLines={3}
                            maxLength={300}
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => router.back()}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={styles.saveButtonText}>
                                {loading ? 'Saving...' : 'Save Expense'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    formCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#fafafa',
    },
    disabledInput: {
        backgroundColor: '#f0f0f0',
        opacity: 0.6,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    categorySelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        color: '#999',
    },
    categoriesContainer: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: 'white',
        maxHeight: 200,
    },
    categoryOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    categoryOptionText: {
        fontSize: 16,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 12,
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    saveButton: {
        backgroundColor: '#2E7D32',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
});
