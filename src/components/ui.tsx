import React from 'react';
import { Text, TouchableOpacity, View } from '@/tw';

export type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
};

export function AppButton({ title, onPress, variant = 'primary', fullWidth = true }: AppButtonProps) {
  const bgClass =
    variant === 'secondary'
      ? 'bg-slate-100'
      : variant === 'ghost'
        ? 'bg-white'
        : 'bg-teal-700';

  const textClass = variant === 'primary' ? 'text-white' : 'text-slate-900';
  const widthClass = fullWidth ? 'w-full' : 'w-auto';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className={`rounded-2xl py-4 px-6 items-center justify-center mt-3 shadow-sm ${bgClass} ${widthClass}`}
    >
      <Text selectable className={`text-base font-bold ${textClass}`}>{title}</Text>
    </TouchableOpacity>
  );
}

export function AppCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={`bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm ${className}`}>
      {children}
    </View>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="mb-3">
      <Text selectable className="text-lg font-bold text-slate-900">{title}</Text>
      {subtitle ? <Text selectable className="text-xs text-slate-500 mt-1">{subtitle}</Text> : null}
    </View>
  );
}

export function MetricCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex-1 min-h-[92px] justify-center">
      <Text selectable className="text-xs text-slate-500 mb-1 uppercase tracking-wider">{label}</Text>
      <Text selectable className="text-2xl font-extrabold text-slate-900" style={accent ? { color: accent } : undefined}>
        {value}
      </Text>
    </View>
  );
}

export function StatusBadge({ label, color }: { label: string; color?: string }) {
  return (
    <View className="py-1 px-2.5 rounded-full self-start bg-teal-700" style={color ? { backgroundColor: color } : undefined}>
      <Text selectable className="text-white text-xs font-bold">{label}</Text>
    </View>
  );
}

export function RatingOption({ label, emoji, selected, onPress }: { label: string; emoji: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className={`border rounded-2xl p-4 items-center flex-1 mx-1 min-h-[116px] justify-center ${
        selected ? 'border-teal-700 bg-cyan-50' : 'border-slate-200 bg-white'
      }`}
    >
      <Text selectable className="text-3xl mb-1.5">{emoji}</Text>
      <Text selectable className="text-sm font-semibold text-slate-900">{label}</Text>
    </TouchableOpacity>
  );
}

export function ReasonChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className={`border rounded-full py-2.5 px-3.5 mr-2.5 mb-2.5 ${
        selected ? 'bg-teal-700 border-teal-700' : 'bg-white border-slate-200'
      }`}
    >
      <Text selectable className={`font-semibold ${selected ? 'text-white' : 'text-slate-900'}`}>{label}</Text>
    </TouchableOpacity>
  );
}

