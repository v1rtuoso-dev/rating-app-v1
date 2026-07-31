import React from 'react';
import { CardHeader } from '@/components/ui';
import { ApiEvaluation } from '@/services/api/evaluationsApi';
import { Text, View } from '@/tw';

export type CounterPerformanceChartProps = {
  evaluations: ApiEvaluation[];
};

export function CounterPerformanceChart({ evaluations }: CounterPerformanceChartProps) {
  // Aggregate stats by counter name
  const counterStats: Record<string, { total: number; satisfied: number; sumRating: number }> = {};

  evaluations.forEach((item) => {
    const counter = item.checkinCounterName || item.deviceName || 'Counter A';
    const ratingVal = item.ratingLevel ?? item.rating ?? 4;

    if (!counterStats[counter]) {
      counterStats[counter] = { total: 0, satisfied: 0, sumRating: 0 };
    }

    counterStats[counter].total += 1;
    counterStats[counter].sumRating += ratingVal;
    if (ratingVal >= 3) {
      counterStats[counter].satisfied += 1;
    }
  });

  const sortedCounters = Object.entries(counterStats)
    .map(([counterName, stats]) => {
      const avgRating = stats.total > 0 ? (stats.sumRating / stats.total).toFixed(1) : '4.0';
      const satisfactionRate = stats.total > 0 ? Math.round((stats.satisfied / stats.total) * 100) : 100;
      return {
        counterName,
        total: stats.total,
        avgRating: Number(avgRating),
        satisfactionRate,
      };
    })
    .sort((a, b) => b.total - a.total);

  const topCounter = sortedCounters.length > 0 ? sortedCounters[0] : null;

  return (
    <View className="bg-white rounded-3xl p-6 border border-slate-200 mb-6" style={{ elevation: 2 }}>
      <CardHeader
        title="Counter Performance"
        subtitle="Satisfaction rate & feedback volume by check-in counter"
        rightElement={
          topCounter ? (
            <View className="bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200">
              <Text className="text-xs font-bold text-teal-800">Busiest: {topCounter.counterName}</Text>
            </View>
          ) : null
        }
      />

      {sortedCounters.length === 0 ? (
        <View className="py-6 bg-slate-50 rounded-2xl items-center justify-center border border-slate-200/60">
          <Text className="text-sm font-bold text-slate-700">No Counter Rating Data</Text>
          <Text className="text-xs text-slate-500 mt-0.5">Evaluation records will display counter breakdown here.</Text>
        </View>
      ) : (
        <View className="gap-4">
          {sortedCounters.map((item) => {
            const filledFlex = Math.max(item.satisfactionRate, 6);
            const emptyFlex = 100 - filledFlex;
            const barColor = item.satisfactionRate >= 80 ? '#059669' : item.satisfactionRate >= 60 ? '#d97706' : '#e11d48';

            return (
              <View key={item.counterName}>
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base font-extrabold text-slate-900">{item.counterName}</Text>
                    <View className="bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                      <Text className="text-xs font-bold text-slate-600">{item.total} reviews</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base font-black text-slate-900">⭐ {item.avgRating}</Text>
                    <Text className="text-sm font-bold text-slate-500">({item.satisfactionRate}% happy)</Text>
                  </View>
                </View>

                {/* Performance Bar using flex layout */}
                <View className="h-4.5 bg-slate-100 rounded-full overflow-hidden flex-row">
                  <View
                    className="h-full rounded-full"
                    style={{ flex: filledFlex, backgroundColor: barColor }}
                  />
                  {emptyFlex > 0 && <View style={{ flex: emptyFlex }} />}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
