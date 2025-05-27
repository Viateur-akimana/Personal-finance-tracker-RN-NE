import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppTheme from '@/constants/Theme';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'gradient';
    gradient?: string[];
    style?: ViewStyle;
    padding?: keyof typeof AppTheme.spacing;
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    gradient,
    style,
    padding = 'lg',
}) => {
    const cardStyle = [
        styles.base,
        styles[variant],
        { padding: AppTheme.spacing[padding] },
        style,
    ];

    if (variant === 'gradient' || gradient) {
        return (
            <View style={[cardStyle, { backgroundColor: 'transparent' }]}>
                <LinearGradient
                    colors={gradient || AppTheme.gradients.primary}
                    style={[StyleSheet.absoluteFill, { borderRadius: AppTheme.borderRadius.lg }]}
                />
                {children}
            </View>
        );
    }

    return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
    base: {
        borderRadius: AppTheme.borderRadius.lg,
        backgroundColor: AppTheme.colors.background.primary,
    },
    default: {
        borderWidth: 1,
        borderColor: AppTheme.colors.border.light,
    },
    elevated: {
        ...AppTheme.shadows.md,
    },
    gradient: {
        ...AppTheme.shadows.lg,
    },
});
