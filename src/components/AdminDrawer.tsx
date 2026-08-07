import React, { useState } from 'react';
import { Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, Icon } from '@/components/ui';
import { useSession } from '@/features/session/SessionContext';
import i18n, { useLocale } from '@/i18n';
import { authApi } from '@/services/api/authApi';
import { Text, TextInput, TouchableOpacity, View } from '@/tw';

export type AdminDrawerProps = {
  visible: boolean;
  onClose: () => void;
};

export function AdminDrawer({ visible, onClose }: AdminDrawerProps) {
  const router = useRouter();
  const { session, currentDevice, changeAdminPin, clearSession, lockAdmin, touchUserActivity } = useSession();
  const { locale, toggleLocale, t } = useLocale();

  // Change PIN Modal State
  const [pinChangeModalVisible, setPinChangeModalVisible] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeMessage, setPinChangeMessage] = useState('');

  const handleSignOut = async () => {
    onClose();
    try {
      await authApi.logout();
    } catch {
      // Continue cleanup
    }
    await clearSession();
    router.replace('/admin' as never);
  };

  const handleLockKiosk = () => {
    onClose();
    lockAdmin();
    router.replace('/kiosk' as never);
  };

  const handleChangePinSubmit = async () => {
    if (!newPinInput || newPinInput.trim().length < 4) {
      setPinChangeMessage(t('pinMinLength'));
      return;
    }
    const success = await changeAdminPin(newPinInput);
    if (success) {
      setPinChangeMessage(t('pinUpdatedSuccess'));
      setTimeout(() => {
        setPinChangeModalVisible(false);
        setNewPinInput('');
        setPinChangeMessage('');
      }, 1200);
    } else {
      setPinChangeMessage(t('pinUpdateFailed'));
    }
  };

  // Helper to check if message is a success (works for both en/vi)
  const isPinSuccess = pinChangeMessage === t('pinUpdatedSuccess');

  if (!visible && !pinChangeModalVisible) return null;

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View className="flex-1 flex-row justify-end" style={{ backgroundColor: 'rgba(15,23,42,0.6)' }} onTouchStart={touchUserActivity}>
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
          
          <View className="w-full max-w-[380px] bg-white h-full p-6 border-l border-slate-200 justify-between" style={{ elevation: 12 }}>
            <View>
              {/* Header */}
              <View className="flex-row justify-between items-center pb-4 border-b border-slate-200 mb-6">
                <View className="flex-row items-center gap-3">
                  <View className="p-2.5 bg-blue-50 rounded-2xl border border-blue-100">
                    <Icon name="devices" size={24} color="#17479E" />
                  </View>
                  <View>
                    <Text className="text-xl font-bold text-slate-900">{t('adminOptions')}</Text>
                    <Text className="text-xs text-slate-500 mt-0.5">
                      {currentDevice?.deviceName || 'Tablet Kiosk'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity onPress={onClose} className="p-2 rounded-xl bg-slate-100">
                  <Text className="text-slate-600 font-bold text-base">✕</Text>
                </TouchableOpacity>
              </View>

              {/* Session Summary Card */}
              <View className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200">
                <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('activeSession')}</Text>
                <Text className="text-lg font-bold text-slate-900">
                  {t('flight')} {session?.flightNo || 'WE272'}
                </Text>
                <Text className="text-sm text-slate-600 mt-0.5">
                  {t('location')} {session?.counter || 'Counter A'}
                </Text>
              </View>

              {/* Menu Options */}
              <View className="gap-3">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleLockKiosk}
                  className="flex-row items-center p-4 bg-slate-100 rounded-2xl border border-slate-200"
                >
                  <Icon name="lock" size={22} color="#17479E" />
                  <View className="ml-3">
                    <Text className="text-base font-bold text-slate-900">{t('lockKioskMode')}</Text>
                    <Text className="text-xs text-slate-500">{t('lockKioskDescription')}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={toggleLocale}
                  className="flex-row items-center p-4 bg-slate-100 rounded-2xl border border-slate-200"
                >
                  <Icon name="translate" size={22} color="#17479E" />
                  <View className="ml-3 flex-1 flex-row justify-between items-center pr-2">
                    <View>
                      <Text className="text-base font-bold text-slate-900">{t('languageLabel')}</Text>
                      <Text className="text-xs text-slate-500">Switch app display language</Text>
                    </View>
                    <Text className="text-base font-black text-[#17479E]">
                      {locale === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setNewPinInput('');
                    setPinChangeMessage('');
                    setPinChangeModalVisible(true);
                  }}
                  className="flex-row items-center p-4 bg-slate-100 rounded-2xl border border-slate-200"
                >
                  <Icon name="key" size={22} color="#17479E" />
                  <View className="ml-3">
                    <Text className="text-base font-bold text-slate-900">{t('changeAdminPin')}</Text>
                    <Text className="text-xs text-slate-500">{t('changeAdminPinDescription')}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSignOut}
                  className="flex-row items-center p-4 bg-red-50 rounded-2xl border border-red-200 mt-2"
                >
                  <Icon name="logout" size={22} color="#dc2626" />
                  <View className="ml-3">
                    <Text className="text-base font-bold text-red-700">{t('signOut')}</Text>
                    <Text className="text-xs text-red-500">{t('signOutDescription')}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View className="pt-4 border-t border-slate-200">
              <AppButton title={t('closeMenu')} onPress={onClose} variant="secondary" />
            </View>
          </View>
        </View>
      </Modal>

      {/* Change PIN Modal */}
      <Modal visible={pinChangeModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center p-6" style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}>
          <View className="bg-white rounded-3xl p-8 w-full max-w-[440px] border border-slate-200" style={{ elevation: 12 }}>
            <Text className="text-2xl font-bold text-slate-900">{t('changeAdminPinTitle')}</Text>
            <Text className="text-base text-slate-500 mt-1 mb-6">{t('enterNewPinDescription')}</Text>

            <TextInput
              secureTextEntry
              keyboardType="number-pad"
              value={newPinInput}
              onChangeText={setNewPinInput}
              placeholder={t('enterNewPinPlaceholder')}
              textAlign="center"
              textAlignVertical="center"
              className="border border-slate-300 rounded-2xl p-5 bg-slate-50 text-slate-900 mb-3 text-2xl font-bold"
              style={{ textAlign: 'center' }}
            />
            {pinChangeMessage ? (
              <View className="flex-row items-center justify-center gap-2 mb-4">
                {isPinSuccess ? (
                  <Icon name="check" size={18} color="#17479E" />
                ) : null}
                <Text
                  className={`text-sm font-bold ${
                    isPinSuccess ? 'text-[#17479E]' : 'text-red-600'
                  }`}
                >
                  {pinChangeMessage}
                </Text>
              </View>
            ) : null}

            <View className="flex-row gap-4 mt-2">
              <View className="flex-1">
                <AppButton title={t('cancel')} onPress={() => setPinChangeModalVisible(false)} variant="secondary" />
              </View>
              <View className="flex-1">
                <AppButton title={t('savePin')} onPress={handleChangePinSubmit} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
