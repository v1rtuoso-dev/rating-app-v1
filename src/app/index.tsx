import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { AppButton, AppCard, SectionTitle } from '@/components/ui';
import { useSession } from '@/features/session/SessionContext';
import i18n, { useLocale } from '@/i18n';
import { Text, TouchableOpacity, View } from '@/tw';

export default function HomeScreen() {
  const router = useRouter();
  const { session, isLoaded } = useSession();
  const { locale, toggleLocale, t } = useLocale();

  useEffect(() => {
    if (isLoaded && session) {
      router.replace('/kiosk' as never);
    }
  }, [isLoaded, session]);

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-slate-100 justify-center items-center">
        <Text className="text-lg font-bold text-slate-700">{t('loadingFeedbackKiosk')}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-100 justify-center items-center p-6">
      <View className="absolute top-8 right-8 z-10">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={toggleLocale}
          className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200"
          style={{ elevation: 2 }}
        >
          <Text className="text-base font-bold text-slate-700">
            {locale === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="w-full max-w-[480px]">
        <AppCard>
          <SectionTitle title={t('staffPreparation')} subtitle={t('signInToSelect')} />
          <AppButton title={t('staffSignInSetup')} onPress={() => router.push('/admin' as never)} />
        </AppCard>
      </View>
    </View>
  );
}
