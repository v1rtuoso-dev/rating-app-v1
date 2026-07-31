import React from 'react';
import { CardHeader } from '@/components/ui';
import { ApiEvaluation } from '@/services/api/evaluationsApi';
import { Text, View } from '@/tw';

export type RatingBreakdownChartProps = {
  evaluations: ApiEvaluation[];
};

const RATING_CONFIG = [
  { level: 4, label: 'Very Satisfied', emoji: '😍', color: '#059669', bgColor: '#059669' },
  { level: 3, label: 'Satisfied', emoji: '😊', color: '#0284c7', bgColor: '#0284c7' },
  { level: 2, label: 'Neutral', emoji: '😐', color: '#d97706', bgColor: '#d97706' },
  { level: 1, label: 'Very Unsatisfied', emoji: '😞', color: '#e11d48', bgColor: '#e11d48' },
];

export function RatingBreakdownChart({ evaluations }: RatingBreakdownChartProps) {
  const total = evaluations.length;

  const counts: Record<number, number> = { 4: 0, 3: 0, 2: 0, 1: 0 };
  evaluations.forEach((item) => {
    const level = item.ratingLevel ?? item.rating ?? 4;
    if (counts[level] !== undefined) {
      counts[level]++;
    } else {
      counts[4]++;
    }
  });

  return (
    <View className="bg-white rounded-3xl p-6 border border-slate-200 mb-6" style={{ elevation: 2 }}>
      <CardHeader
        title="Rating Breakdown"
        subtitle="Distribution of passenger feedback levels"
        rightElement={
          <View className="bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <Text className="text-xs font-bold text-slate-700">{total} Total Ratings</Text>
          </View>
        }
      />

      <View className="gap-4">
        {RATING_CONFIG.map((item) => {
          const count = counts[item.level] || 0;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          // Use flex-based layout: filled portion vs remaining portion
          const filledFlex = count > 0 ? Math.max(percentage, 4) : 0;
          const emptyFlex = 100 - filledFlex;

          return (
            <View key={item.level}>
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center gap-2.5">
                  <Text className="text-xl">{item.emoji}</Text>
                  <Text className="text-base font-bold text-slate-800">{item.label}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-base font-black text-slate-900">{count}</Text>
                  <Text className="text-sm font-bold text-slate-500">({percentage}%)</Text>
                </View>
              </View>

              {/* Progress Bar using flex layout */}
              <View className="h-4.5 bg-slate-100 rounded-full overflow-hidden flex-row">
                {filledFlex > 0 && (
                  <View
                    className="h-full rounded-full"
                    style={{ flex: filledFlex, backgroundColor: item.bgColor }}
                  />
                )}
                {emptyFlex > 0 && (
                  <View style={{ flex: emptyFlex }} />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
