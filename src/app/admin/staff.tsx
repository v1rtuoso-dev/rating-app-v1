import React from 'react';
import { useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppCard, SectionTitle, StatusBadge } from '@/components/ui';
import { theme } from '@/theme';
import { ScrollView, Text, View } from '@/tw';

const staffMembers = [
  { id: 1, name: 'Linh Tran', role: 'Agent', status: 'Active' },
  { id: 2, name: 'Minh Nguyen', role: 'Supervisor', status: 'Active' },
  { id: 3, name: 'Hoa Le', role: 'Agent', status: 'Pending' },
];

export default function StaffScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isTablet = width / height >= 1.45;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 bg-slate-100"
      contentContainerClassName={`flex-grow py-6 w-full self-center ${isTablet ? 'px-8 max-w-[980px]' : 'px-6'}`}
    >
      <View className="mb-4">
        <Text className="text-3xl font-extrabold text-slate-900">Staff accounts</Text>
        <Text className="text-sm text-slate-500 mt-1.5">Manage staff access and roles.</Text>
      </View>

      <SectionTitle title="Users" subtitle="Role-based access can be configured here." />
      {staffMembers.map((person) => (
        <AppCard key={person.id} className="mb-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-bold text-slate-900">{person.name}</Text>
            <StatusBadge label={person.status} color={person.status === 'Active' ? theme.colors.success : theme.colors.warning} />
          </View>
          <Text className="text-slate-500 text-sm mt-1.5">{person.role}</Text>
        </AppCard>
      ))}

      <AppButton title="Back to dashboard" onPress={() => router.push('/admin/dashboard' as never)} />
      <AppButton title="Back" onPress={() => router.back()} variant="secondary" />
    </ScrollView>
  );
}

