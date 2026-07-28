import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppCard, SectionTitle } from '@/components/ui';
import { ScrollView, Text, TextInput, View } from '@/tw';

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
      className="flex-1 bg-slate-100"
      contentContainerClassName={`flex-grow py-6 justify-center w-full self-center ${isTablet ? 'px-8 max-w-[980px]' : 'px-6'}`}
    >
      <View className="mb-6">
        <Text className="text-3xl font-extrabold text-slate-900">Admin access</Text>
        <Text className="text-sm text-slate-500 mt-1.5">Secure staff and management workspace</Text>
      </View>

      <AppCard className="mb-4">
        <SectionTitle title="Sign in" subtitle="Use your staff account to access the admin flow." />
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
        <AppButton title="Sign in" onPress={handleLogin} />
      </AppCard>

      <AppButton title="Back to home" onPress={() => router.push('/' as never)} variant="secondary" />
    </ScrollView>
  );
}

