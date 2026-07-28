import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppCard, SectionTitle } from '@/components/ui';
import { theme } from '@/theme';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isTablet = width / height >= 1.45;
  const [username, setUsername] = useState('HK01');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (username.trim() && password.trim()) {
      if (username === 'HK01' && password === '123456') {
        setError('');
        router.push('/admin/select-flight' as never);
      } else {
        setError('Invalid username or password.');
      }
    } else {
      setError('Please enter your credentials.');
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.container, { paddingHorizontal: isTablet ? 32 : theme.spacing.lg, maxWidth: isTablet ? 980 : width }]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Admin access</Text>
        <Text style={styles.subtitle}>Secure staff and management workspace</Text>
      </View>

      <AppCard style={styles.card}>
        <SectionTitle title="Sign in" subtitle="Use your staff account to access the admin flow." />
        <TextInput autoCapitalize="none" value={username} onChangeText={setUsername} style={styles.input} placeholder="Username" />
        <TextInput secureTextEntry value={password} onChangeText={setPassword} style={styles.input} placeholder="Password" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton title="Sign in" onPress={handleLogin} />
      </AppCard>

      <AppButton title="Back to home" onPress={() => router.push('/' as never)} variant="secondary" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.lg,
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.muted,
    marginTop: 6,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  error: {
    color: theme.colors.danger,
    marginBottom: theme.spacing.sm,
  },
});
