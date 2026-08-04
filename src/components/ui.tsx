import React from 'react';
import { Text, TouchableOpacity, View } from '@/tw';
import { Icon, IconName } from './ui/Icon';
export * from './ui/Icon';

export type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
  icon?: IconName;
};

export function AppButton({ title, onPress, variant = 'primary', fullWidth = true, icon }: AppButtonProps) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';

  const bgColor = isPrimary ? '#0f766e' : isSecondary ? '#e2e8f0' : '#ffffff';
  const borderColor = isPrimary ? '#0f766e' : '#cbd5e1';
  const textColor = isPrimary ? '#ffffff' : '#1e293b';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="flex-row rounded-2xl py-5 px-8 items-center justify-center mt-4"
      style={{
        backgroundColor: bgColor,
        borderWidth: isPrimary ? 0 : 1,
        borderColor,
        elevation: 3,
        width: fullWidth ? '100%' : undefined,
      }}
    >
      {icon ? (
        <View className="mr-2.5">
          <Icon name={icon} size={22} color={textColor} />
        </View>
      ) : null}
      <Text selectable className="text-lg font-bold text-center" style={{ color: textColor }}>{title}</Text>
    </TouchableOpacity>
  );
}

export function AppCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <View
      className={`bg-white rounded-3xl p-8 border border-slate-200 ${className}`}
      style={{ elevation: 2 }}
    >
      {children}
    </View>
  );
}

import { useLocale } from '@/i18n';

export function PageHeader({ title, subtitle, rightAction }: { title: string; subtitle?: string; rightAction?: React.ReactNode }) {
  const { locale, toggleLocale } = useLocale();

  return (
    <View className="flex-row justify-between items-start mb-6">
      <View className="flex-1 pr-4">
        <Text selectable className="text-4xl font-black text-slate-900" style={{ lineHeight: 44 }}>{title}</Text>
        {subtitle ? <Text selectable className="text-base text-slate-500 mt-1.5" style={{ lineHeight: 24 }}>{subtitle}</Text> : null}
      </View>
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={toggleLocale}
          className="px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200"
          style={{ elevation: 2 }}
        >
          <Text className="text-base font-bold text-slate-700">
            {locale === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}
          </Text>
        </TouchableOpacity>
        {rightAction}
      </View>
    </View>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="mb-4">
      <Text selectable className="text-2xl font-extrabold text-slate-900" style={{ lineHeight: 32 }}>{title}</Text>
      {subtitle ? <Text selectable className="text-base text-slate-500 mt-1" style={{ lineHeight: 22 }}>{subtitle}</Text> : null}
    </View>
  );
}

export function CardHeader({ title, subtitle, rightElement }: { title: string; subtitle?: string; rightElement?: React.ReactNode }) {
  return (
    <View className="flex-row justify-between items-center mb-5">
      <View className="flex-1 pr-2">
        <Text selectable className="text-xl font-extrabold text-slate-900" style={{ lineHeight: 28 }}>{title}</Text>
        {subtitle ? <Text selectable className="text-sm font-semibold text-slate-500 mt-0.5" style={{ lineHeight: 20 }}>{subtitle}</Text> : null}
      </View>
      {rightElement}
    </View>
  );
}

export function MetricCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View
      className="bg-white rounded-2xl p-6 border border-slate-200 flex-1 min-h-[110px] justify-center"
      style={{ elevation: 1 }}
    >
      <Text selectable className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">{label}</Text>
      <Text selectable className="text-3xl font-black text-slate-900" style={accent ? { color: accent } : undefined}>
        {value}
      </Text>
    </View>
  );
}

export function StatusBadge({ label, color }: { label: string; color?: string }) {
  return (
    <View
      className="py-1.5 px-3.5 rounded-full self-start"
      style={{ backgroundColor: color || '#0f766e' }}
    >
      <Text selectable className="text-white text-sm font-bold">{label}</Text>
    </View>
  );
}

export function RatingOption({ label, emoji, selected, onPress }: { label: string; emoji: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="items-center flex-1 py-4 px-2 justify-center"
    >
      <Text selectable className="text-center mb-3 text-7xl" style={{ lineHeight: 84 }}>{emoji}</Text>
      <Text
        selectable
        className="text-lg text-center"
        style={{ color: selected ? '#0f766e' : '#1e293b', fontWeight: selected ? '800' : '700' }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function ReasonChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="flex-row items-center rounded-2xl py-4 px-6 mb-1"
      style={{
        backgroundColor: selected ? '#0f766e' : '#f8fafc',
        borderWidth: 2,
        borderColor: selected ? '#0f766e' : '#cbd5e1',
        elevation: selected ? 2 : 1,
      }}
    >
      <View
        className="w-7 h-7 rounded-xl items-center justify-center mr-3.5"
        style={{
          backgroundColor: selected ? '#ffffff' : '#ffffff',
          borderWidth: 1.5,
          borderColor: selected ? '#ffffff' : '#cbd5e1',
        }}
      >
        {selected ? (
          <Icon name="check" size={18} color="#0f766e" />
        ) : null}
      </View>
      <Text
        selectable
        className="text-lg flex-1"
        style={{ color: selected ? '#ffffff' : '#0f172a', fontWeight: '800' }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
