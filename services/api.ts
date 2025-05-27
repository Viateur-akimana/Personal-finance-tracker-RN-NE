import axios from 'axios';

const BASE_URL = 'https://67ac71475853dfff53dab929.mockapi.io/api/v1';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);

        // Handle timeout errors
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timed out. Please check your internet connection and try again.');
        }

        // Handle network errors
        if (!error.response) {
            throw new Error('No internet connection. Please check your network and try again.');
        }

        const status = error.response.status;
        const data = error.response.data;

        // Handle different HTTP status codes
        switch (status) {
            case 400:
                throw new Error(data?.message || 'Invalid request. Please check your input and try again.');
            case 401:
                throw new Error('Authentication failed. Please login again.');
            case 403:
                throw new Error('Access denied. You don\'t have permission to perform this action.');
            case 404:
                throw new Error('The requested item was not found. It may have been deleted.');
            case 409:
                throw new Error('This action conflicts with existing data. Please refresh and try again.');
            case 422:
                throw new Error(data?.message || 'Invalid data provided. Please check your input.');
            case 429:
                throw new Error('Too many requests. Please wait a moment and try again.');
            case 500:
            case 502:
            case 503:
                throw new Error('Server error. Please try again later.');
            default:
                throw new Error(`Request failed (${status}). Please try again.`);
        }
    }
);

// Types
export interface User {
    id: string;
    username: string;
    password: string;
    name?: string;
    email?: string;
}

export interface Expense {
    id: string;
    title: string;
    name?: string; // API returns 'name' instead of 'title'
    amount: number;
    category: string;
    date: string;
    description?: string;
    userId?: string;
    createdAt?: string;
}

// API Functions
export const authAPI = {
    login: async (username: string, password: string): Promise<User | null> => {
        try {
            // Validate input parameters
            if (!username || username.trim() === '') {
                throw new Error('Username is required');
            }
            if (!password || password.trim() === '') {
                throw new Error('Password is required');
            }
            if (username.trim().length < 3) {
                throw new Error('Username must be at least 3 characters long');
            }
            if (password.length < 4) {
                throw new Error('Password must be at least 4 characters long');
            }

            const response = await api.get(`/users?username=${username.trim()}`);
            const users = response.data;

            if (!users || !Array.isArray(users)) {
                throw new Error('Invalid response from authentication server');
            }

            if (users.length === 0) {
                return null; // User not found - let the calling code handle this
            }

            const user = users[0];

            if (!user || !user.password) {
                throw new Error('Invalid user data received from server');
            }

            // In a real app, you'd verify password hash
            if (user.password === password) {
                return {
                    ...user,
                    username: user.username.trim(),
                    name: user.name?.trim() || '',
                    email: user.email?.trim() || '',
                };
            }

            return null; // Invalid password - let the calling code handle this
        } catch (error: any) {
            console.error('Login error:', error);

            // Re-throw validation errors and custom errors
            if (error.message.includes('is required') ||
                error.message.includes('must be at least') ||
                error.message.includes('Invalid response') ||
                error.message.includes('Invalid user data')) {
                throw error;
            }

            // Handle specific HTTP errors that weren't caught by interceptor
            if (error.response?.status === 404) {
                throw new Error('Authentication service not available. Please try again later.');
            } else if (error.response?.status >= 500) {
                throw new Error('Server error during authentication. Please try again later.');
            }

            // Let the interceptor handle other HTTP errors, or provide generic message
            throw new Error(error.message || 'Login failed. Please check your internet connection and try again.');
        }
    },
};

export const expensesAPI = {
    getAllExpenses: async (): Promise<Expense[]> => {
        try {
            const response = await api.get('/expenses');

            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Invalid data format received from server');
            }

            return response.data.map((expense: any) => ({
                ...expense,
                title: expense.title || expense.name || 'Untitled Expense',
                amount: expense.amount !== null && expense.amount !== undefined
                    ? (typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount)
                    : 0,
                category: expense.category || 'Other',
                date: expense.date || new Date().toISOString().split('T')[0],
            }));
        } catch (error: any) {
            console.error('Get expenses error:', error);

            if (error.message.includes('Invalid data format')) {
                throw error; // Re-throw our custom error
            }

            // Let the interceptor handle HTTP errors, just add context
            throw new Error(error.message || 'Failed to load expenses. Please try again.');
        }
    },

    getExpenseById: async (id: string): Promise<Expense> => {
        try {
            if (!id || id.trim() === '') {
                throw new Error('Invalid expense ID provided');
            }

            const response = await api.get(`/expenses/${id}`);
            const expense = response.data;

            if (!expense) {
                throw new Error('Expense data not found');
            }

            return {
                ...expense,
                title: expense.title || expense.name || 'Untitled Expense',
                amount: expense.amount !== null && expense.amount !== undefined
                    ? (typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount)
                    : 0,
                category: expense.category || 'Other',
                date: expense.date || new Date().toISOString().split('T')[0],
            };
        } catch (error: any) {
            console.error('Get expense error:', error);

            if (error.message.includes('Invalid expense ID') || error.message.includes('Expense data not found')) {
                throw error; // Re-throw our custom errors
            }

            // Let the interceptor handle HTTP errors
            throw new Error(error.message || 'Failed to load expense details. Please try again.');
        }
    },

    createExpense: async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
        try {
            // Validate required fields
            if (!expense.title || expense.title.trim() === '') {
                throw new Error('Expense title is required');
            }
            if (!expense.amount || expense.amount <= 0) {
                throw new Error('Valid expense amount is required');
            }
            if (!expense.category || expense.category.trim() === '') {
                throw new Error('Expense category is required');
            }
            if (!expense.date) {
                throw new Error('Expense date is required');
            }

            // Check for potential duplicates
            const existingExpenses = await expensesAPI.getAllExpenses();
            const potentialDuplicates = existingExpenses.filter(existing => {
                const sameTitle = existing.title.toLowerCase().trim() === expense.title.toLowerCase().trim();
                const sameAmount = Math.abs(existing.amount - expense.amount) < 0.01; // Allow for floating point precision
                const sameCategory = existing.category.toLowerCase() === expense.category.toLowerCase();
                const sameDate = existing.date === expense.date;

                // Consider it a potential duplicate if title, amount, and date match
                return sameTitle && sameAmount && sameDate;
            });

            if (potentialDuplicates.length > 0) {
                const duplicate = potentialDuplicates[0];
                throw new Error(`DUPLICATE_FOUND:${JSON.stringify({
                    title: duplicate.title,
                    amount: duplicate.amount,
                    category: duplicate.category,
                    date: duplicate.date,
                    id: duplicate.id
                })}`);
            }

            const response = await api.post('/expenses', {
                ...expense,
                title: expense.title.trim(),
                category: expense.category.trim(),
                description: expense.description?.trim() || '',
            });

            const createdExpense = response.data;

            if (!createdExpense || !createdExpense.id) {
                throw new Error('Failed to create expense - invalid response from server');
            }

            return {
                ...createdExpense,
                title: createdExpense.title || createdExpense.name || expense.title,
                amount: typeof createdExpense.amount === 'string' ? parseFloat(createdExpense.amount) : createdExpense.amount,
                category: createdExpense.category || expense.category,
                date: createdExpense.date || expense.date,
            };
        } catch (error: any) {
            console.error('Create expense error:', error);

            // Re-throw validation errors and duplicate errors
            if (error.message.includes('is required') ||
                error.message.includes('invalid response') ||
                error.message.includes('DUPLICATE_FOUND:')) {
                throw error;
            }

            // Let the interceptor handle HTTP errors
            throw new Error(error.message || 'Failed to create expense. Please check your input and try again.');
        }
    },

    // Add a method to force create expense (bypassing duplicate check)
    forceCreateExpense: async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
        try {
            // Validate required fields (same as createExpense but without duplicate check)
            if (!expense.title || expense.title.trim() === '') {
                throw new Error('Expense title is required');
            }
            if (!expense.amount || expense.amount <= 0) {
                throw new Error('Valid expense amount is required');
            }
            if (!expense.category || expense.category.trim() === '') {
                throw new Error('Expense category is required');
            }
            if (!expense.date) {
                throw new Error('Expense date is required');
            }

            const response = await api.post('/expenses', {
                ...expense,
                title: expense.title.trim(),
                category: expense.category.trim(),
                description: expense.description?.trim() || '',
            });

            const createdExpense = response.data;

            if (!createdExpense || !createdExpense.id) {
                throw new Error('Failed to create expense - invalid response from server');
            }

            return {
                ...createdExpense,
                title: createdExpense.title || createdExpense.name || expense.title,
                amount: typeof createdExpense.amount === 'string' ? parseFloat(createdExpense.amount) : createdExpense.amount,
                category: createdExpense.category || expense.category,
                date: createdExpense.date || expense.date,
            };
        } catch (error: any) {
            console.error('Force create expense error:', error);

            // Re-throw validation errors
            if (error.message.includes('is required') || error.message.includes('invalid response')) {
                throw error;
            }

            // Let the interceptor handle HTTP errors
            throw new Error(error.message || 'Failed to create expense. Please check your input and try again.');
        }
    },

    deleteExpense: async (id: string): Promise<void> => {
        try {
            if (!id || id.trim() === '') {
                throw new Error('Invalid expense ID provided');
            }

            await api.delete(`/expenses/${id}`);
        } catch (error: any) {
            console.error('Delete expense error:', error);

            if (error.message.includes('Invalid expense ID')) {
                throw error; // Re-throw our custom error
            }

            // Let the interceptor handle HTTP errors
            throw new Error(error.message || 'Failed to delete expense. Please try again.');
        }
    },
};
