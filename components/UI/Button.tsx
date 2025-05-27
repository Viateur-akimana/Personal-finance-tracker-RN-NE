import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppTheme from '@/constants/Theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    gradient?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    gradient = false,
    style,
    textStyle,
    children,
}) => {
    const buttonStyle = [
        styles.base,
        styles[size],
        styles[variant],
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.baseText,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        disabled && styles.disabledText,
        textStyle,
    ];

    const ButtonContent = () => (
        <>
            {loading && <ActivityIndicator size="small" color={variant === 'primary' ? 'white' : AppTheme.colors.primary[500]} />}
            {children || <Text style={textStyles}>{loading ? '' : title}</Text>}
        </>
    );

    if (gradient && variant === 'primary' && !disabled) {
        return (
            <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={[buttonStyle, { backgroundColor: 'transparent' }]}>
                <LinearGradient colors={AppTheme.gradients.primary} style={[StyleSheet.absoluteFill, { borderRadius: AppTheme.borderRadius.md }]} />
                <ButtonContent />
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={buttonStyle}>
            <ButtonContent />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: AppTheme.borderRadius.md,
        gap: AppTheme.spacing.sm,
        ...AppTheme.shadows.sm,
    },

    // Sizes
    sm: {
        paddingHorizontal: AppTheme.spacing.md,
        paddingVertical: AppTheme.spacing.sm,
        minHeight: 36,
    },
    md: {
        paddingHorizontal: AppTheme.spacing.lg,
        paddingVertical: AppTheme.spacing.md,
        minHeight: 44,
    },
    lg: {
        paddingHorizontal: AppTheme.spacing.xl,
        paddingVertical: AppTheme.spacing.lg,
        minHeight: 52,
    },

    // Variants
    primary: {
        backgroundColor: AppTheme.colors.primary[500],
    },
    secondary: {
        backgroundColor: AppTheme.colors.secondary[500],
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: AppTheme.colors.primary[500],
    },
    ghost: {
        backgroundColor: 'transparent',
    },

    disabled: {
        backgroundColor: AppTheme.colors.neutral[300],
    },

    // Text styles
    baseText: {
        fontWeight: AppTheme.typography.fontWeights.semibold,
        textAlign: 'center',
    },
    smText: {
        fontSize: AppTheme.typography.fontSizes.sm,
    },
    mdText: {
        fontSize: AppTheme.typography.fontSizes.md,
    },
    lgText: {
        fontSize: AppTheme.typography.fontSizes.lg,
    },
    primaryText: {
        color: AppTheme.colors.text.inverse,
    },
    secondaryText: {
        color: AppTheme.colors.text.inverse,
    },
    outlineText: {
        color: AppTheme.colors.primary[500],
    },
    ghostText: {
        color: AppTheme.colors.primary[500],
    },
    disabledText: {
        color: AppTheme.colors.text.tertiary,
    },
});
