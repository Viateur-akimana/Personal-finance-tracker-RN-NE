import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/UI/Button';
import { Card } from '@/components/UI/Card';
import AppTheme from '@/constants/Theme';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const router = useRouter(); const validateInputs = () => {
        if (!username.trim()) {
            Alert.alert('Validation Error', 'Please enter your username');
            return false;
        }
        if (!password.trim()) {
            Alert.alert('Validation Error', 'Please enter your password');
            return false;
        }
        return true;
    };

    const handleLogin = async () => {
        if (!validateInputs()) return;

        try {
            setIsLoading(true);
            const success = await login(username.trim(), password);

            if (success) {
                router.replace('/(tabs)');
            } else {
                Alert.alert('Login Failed', 'Invalid username or password. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#22c55e', '#16a34a']}
            style={styles.container}
        >
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Card variant="elevated" style={styles.formCard}>
                        <Text style={styles.formTitle}>Welcome Back</Text>
                        <Text style={styles.formSubtitle}>Sign in to continue</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Username</Text>
                            <View style={styles.inputWrapper}>
                                <FontAwesome name="user" size={16} color={AppTheme.colors.text.tertiary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Enter your username"
                                    placeholderTextColor={AppTheme.colors.text.tertiary}
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <FontAwesome name="lock" size={16} color={AppTheme.colors.text.tertiary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Enter your password"
                                    placeholderTextColor={AppTheme.colors.text.tertiary}
                                    secureTextEntry={!showPassword}
                                    editable={!isLoading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeButton}
                                >
                                    <FontAwesome
                                        name={showPassword ? "eye-slash" : "eye"}
                                        size={16}
                                        color={AppTheme.colors.text.tertiary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={isLoading}
                            gradient={true}
                            style={styles.loginButton}
                        />

                        <View style={styles.demoCredentials}>
                            <Text style={styles.demoTitle}>Demo Credentials:</Text>
                            <Text style={styles.demoText}>Username: Rosemary.Auer@gmail.com</Text>
                            <Text style={styles.demoText}>Password: IoqOWrplBc9lqjI</Text>
                        </View>
                    </Card>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: AppTheme.spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: AppTheme.spacing['3xl'],
    },
    logoContainer: {
        marginBottom: AppTheme.spacing.lg,
    },
    logoBackground: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        ...AppTheme.shadows.lg,
    },
    title: {
        fontSize: AppTheme.typography.fontSizes['3xl'],
        fontWeight: '700' as const,
        color: 'white',
        textAlign: 'center',
        marginBottom: AppTheme.spacing.sm,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: AppTheme.typography.fontSizes.lg,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
    },
    formCard: {
        backgroundColor: 'white',
        ...AppTheme.shadows.xl,
    },
    formTitle: {
        fontSize: AppTheme.typography.fontSizes['2xl'],
        fontWeight: '700' as const,
        color: AppTheme.colors.text.primary,
        textAlign: 'center',
        marginBottom: AppTheme.spacing.sm,
    },
    formSubtitle: {
        fontSize: AppTheme.typography.fontSizes.md,
        color: AppTheme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: AppTheme.spacing['2xl'],
    },
    inputContainer: {
        marginBottom: AppTheme.spacing.lg,
    },
    label: {
        fontSize: AppTheme.typography.fontSizes.md,
        fontWeight: '500' as const,
        color: AppTheme.colors.text.primary,
        marginBottom: AppTheme.spacing.sm,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: AppTheme.colors.border.light,
        borderRadius: AppTheme.borderRadius.md,
        backgroundColor: AppTheme.colors.background.secondary,
        paddingHorizontal: AppTheme.spacing.md,
    },
    inputIcon: {
        marginRight: AppTheme.spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: AppTheme.spacing.md,
        fontSize: AppTheme.typography.fontSizes.md,
        color: AppTheme.colors.text.primary,
    },
    passwordInput: {
        paddingRight: AppTheme.spacing.sm,
    },
    eyeButton: {
        padding: AppTheme.spacing.xs,
    },
    loginButton: {
        marginTop: AppTheme.spacing.lg,
        marginBottom: AppTheme.spacing.xl,
    },
    demoCredentials: {
        backgroundColor: AppTheme.colors.background.tertiary,
        padding: AppTheme.spacing.md,
        borderRadius: AppTheme.borderRadius.md,
        borderLeftWidth: 4,
        borderLeftColor: AppTheme.colors.accent[500],
    },
    demoTitle: {
        fontSize: AppTheme.typography.fontSizes.sm,
        fontWeight: '600' as const,
        color: AppTheme.colors.text.primary,
        marginBottom: AppTheme.spacing.xs,
    },
    demoText: {
        fontSize: AppTheme.typography.fontSizes.xs,
        color: AppTheme.colors.text.secondary,
        fontFamily: 'monospace',
    },
});
