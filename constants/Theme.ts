export const AppTheme = {
    colors: {
        // Primary colors - Modern Green Finance Theme
        primary: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e', // Main primary
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
        },

        // Secondary colors - Elegant Purple
        secondary: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#a855f7',
            600: '#9333ea',
            700: '#7c3aed',
            800: '#6b21a8',
            900: '#581c87',
        },

        // Accent colors - Vibrant Blue
        accent: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
        },

        // Neutral colors
        neutral: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#e5e5e5',
            300: '#d4d4d4',
            400: '#a3a3a3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
        },

        // Status colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',

        // Background colors
        background: {
            primary: '#ffffff',
            secondary: '#f8fafc',
            tertiary: '#f1f5f9',
            dark: '#0f172a',
        },

        // Text colors
        text: {
            primary: '#1e293b',
            secondary: '#64748b',
            tertiary: '#94a3b8',
            inverse: '#ffffff',
        },

        // Border colors
        border: {
            light: '#e2e8f0',
            medium: '#cbd5e1',
            dark: '#475569',
        },

        // Shadow colors
        shadow: {
            light: 'rgba(0, 0, 0, 0.05)',
            medium: 'rgba(0, 0, 0, 0.1)',
            dark: 'rgba(0, 0, 0, 0.2)',
        },
    },

    typography: {
        fontSizes: {
            xs: 12,
            sm: 14,
            md: 16,
            lg: 18,
            xl: 20,
            '2xl': 24,
            '3xl': 30,
            '4xl': 36,
            '5xl': 48,
        },
        fontWeights: {
            light: '300',
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
            extrabold: '800',
        },
        lineHeights: {
            tight: 1.2,
            normal: 1.5,
            relaxed: 1.7,
        },
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        '2xl': 48,
        '3xl': 64,
    },

    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        full: 9999,
    },

    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
        },
        xl: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 16,
        },
    },

    gradients: {
        primary: ['#22c55e', '#16a34a'],
        secondary: ['#a855f7', '#7c3aed'],
        accent: ['#3b82f6', '#1d4ed8'],
        success: ['#10b981', '#059669'],
        sunset: ['#f59e0b', '#ea580c'],
        ocean: ['#06b6d4', '#0284c7'],
        purple: ['#8b5cf6', '#7c3aed'],
        pink: ['#ec4899', '#db2777'],
    },
};

export default AppTheme;
