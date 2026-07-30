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
      ? 'bg-slate-200 border border-slate-300'
      : variant === 'ghost'
        ? 'bg-white border border-slate-300'
        : 'bg-teal-700';

  const textClass = variant === 'primary' ? 'text-white' : 'text-slate-900';
  const widthClass = fullWidth ? 'w-full' : 'w-auto';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={`rounded-2xl py-5 px-8 items-center justify-center mt-4 shadow-md ${bgClass} ${widthClass}`}
    >
      <Text selectable className={`text-lg font-bold text-center ${textClass}`}>{title}</Text>
    </TouchableOpacity>
  );
}

export function AppCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={`bg-white rounded-3xl p-8 border border-slate-200 shadow-md ${className}`}>
      {children}
    </View>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="mb-4">
      <Text selectable className="text-2xl font-bold text-slate-900" style={{ lineHeight: 32 }}>{title}</Text>
      {subtitle ? <Text selectable className="text-base text-slate-500 mt-1" style={{ lineHeight: 22 }}>{subtitle}</Text> : null}
    </View>
  );
}

export function MetricCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View className="bg-white rounded-2xl p-6 border border-slate-200 flex-1 min-h-[110px] justify-center shadow-sm">
      <Text selectable className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">{label}</Text>
      <Text selectable className="text-3xl font-black text-slate-900" style={accent ? { color: accent } : undefined}>
        {value}
      </Text>
    </View>
  );
}

export function StatusBadge({ label, color }: { label: string; color?: string }) {
  return (
    <View className="py-1.5 px-3.5 rounded-full self-start bg-teal-700" style={color ? { backgroundColor: color } : undefined}>
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
      <Text selectable className={`text-lg font-bold text-center ${selected ? 'text-teal-700 font-extrabold' : 'text-slate-800'}`}>
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
      className={`flex-row items-center border rounded-2xl py-3.5 px-5 mr-3 mb-3 shadow-sm ${
        selected ? 'bg-teal-700 border-teal-700' : 'bg-white border-slate-300'
      }`}
    >
      <View
        className={`w-6 h-6 rounded-lg items-center justify-center mr-3 border ${
          selected ? 'bg-white border-white' : 'bg-slate-50 border-slate-300'
        }`}
      >
        {selected ? (
          <Text className="text-teal-700 font-extrabold text-sm" style={{ lineHeight: 18 }}>✓</Text>
        ) : null}
      </View>
      <Text selectable className={`text-base font-bold ${selected ? 'text-white' : 'text-slate-900'}`}>{label}</Text>
    </TouchableOpacity>
  );
}



