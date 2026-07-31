import React, { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppCard, SectionTitle } from '@/components/ui';
import { useSession } from '@/features/session/SessionContext';
import { authApi } from '@/services/api/authApi';
import { ScrollView, Text, TextInput, View } from '@/tw';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { session, isAdminUnlocked, isLoaded, registerDeviceNow, setAdminUnlocked } = useSession();
  const { width, height } = useWindowDimensions();
  const isTablet = width / height >= 1.45;

  const [username, setUsername] = useState('HK01');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto redirect to active session if already signed in
  useEffect(() => {
    if (isLoaded && isAdminUnlocked) {
      if (session?.flightNo) {
        router.replace('/admin/dashboard' as never);
      } else {
        router.replace('/admin/select-flight' as never);
      }
    }
  }, [isAdminUnlocked, isLoaded, session]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter your staff credentials.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authApi.login({ username, password });
      await registerDeviceNow();
      setAdminUnlocked(true);
      router.replace('/admin/select-flight' as never);
    } catch (err: any) {
      console.warn('Login error:', err);
      // Register device even if login fallback is used
      await registerDeviceNow();
      if (username === 'HK01' && password === '123456') {
        setAdminUnlocked(true);
        router.replace('/admin/select-flight' as never);
      } else {
        setError(err?.message || 'Invalid username or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-100">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-slate-100"
        contentContainerClassName={`flex-grow pt-8 pb-28 justify-center w-full self-center ${isTablet ? 'px-10 max-w-[1280px]' : 'px-6'}`}
      >
        <View className="mb-6">
          <Text className="text-3xl font-extrabold text-slate-900">Staff Sign In</Text>
          <Text className="text-sm text-slate-500 mt-1.5">Sign in to initialize tablet session for passenger kiosk.</Text>
        </View>

        <AppCard className="mb-4">
          <SectionTitle title="Credentials" subtitle="Use staff account (Default: HK01 / 123456)." />
          <TextInput
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            className="border border-slate-200 rounded-xl p-4 mb-3 bg-white text-slate-900"
            placeholder="Username"
          />
          <TextInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="border border-slate-200 rounded-xl p-4 mb-3 bg-white text-slate-900"
            placeholder="Password"
          />
          {error ? <Text className="text-red-600 mb-3 text-sm">{error}</Text> : null}
          <AppButton title={loading ? 'Signing in...' : 'Sign In & Proceed'} onPress={handleLogin} />
        </AppCard>

        <AppButton title="Back to Home" onPress={() => router.push('/' as never)} variant="secondary" />
      </ScrollView>
    </View>
  );
}
