import React from 'react';
import { CardHeader } from '@/components/ui';
import { ApiEvaluation } from '@/services/api/evaluationsApi';
import { UnsatisfiedReason } from '@/services/api/reasonsApi';
import { Text, View } from '@/tw';

export type ReasonDistributionChartProps = {
  evaluations: ApiEvaluation[];
  reasonsList: UnsatisfiedReason[];
};

export function ReasonDistributionChart({ evaluations, reasonsList }: ReasonDistributionChartProps) {
  const reasonCounts: Record<number, number> = {};

  evaluations.forEach((item) => {
    if (item.reasonIds && Array.isArray(item.reasonIds)) {
      item.reasonIds.forEach((id) => {
        reasonCounts[id] = (reasonCounts[id] || 0) + 1;
      });
    }
  });

  const totalReasonsCount = Object.values(reasonCounts).reduce((a, b) => a + b, 0);

  // Map reasons with count
  const sortedReasons = reasonsList
    .map((r) => ({
      id: r.id,
      name: r.reasonName || `Reason #${r.id}`,
      count: reasonCounts[r.id] || 0,
    }))
    .sort((a, b) => b.count - a.count);

  if (totalReasonsCount === 0) {
    return (
      <View className="bg-white rounded-3xl p-6 border border-slate-200 mb-6" style={{ elevation: 2 }}>
        <CardHeader
          title="Unsatisfied Reasons Analysis"
          subtitle="Breakdown of specific complaint reasons"
        />
        <View className="py-6 bg-slate-50 rounded-2xl items-center justify-center border border-slate-200/60">
          <Text className="text-2xl mb-1">🎉</Text>
          <Text className="text-sm font-bold text-slate-700">No Unsatisfied Reasons Logged</Text>
          <Text className="text-xs text-slate-500 mt-0.5">All recent ratings are positive or neutral without complaints.</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-3xl p-6 border border-slate-200 mb-6" style={{ elevation: 2 }}>
      <CardHeader
        title="Unsatisfied Reasons Analysis"
        subtitle="Passengers can select multiple complaint reasons per evaluation."
        rightElement={
          <View className="bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200">
            <Text className="text-xs font-bold text-rose-700">{totalReasonsCount} Selections Logged</Text>
          </View>
        }
      />

      <View className="gap-3.5">
        {sortedReasons.map((item) => {
          if (item.count === 0) return null;
          const percentage = Math.round((item.count / totalReasonsCount) * 100);
          const filledFlex = Math.max(percentage, 5);
          const emptyFlex = 100 - filledFlex;

          return (
            <View key={item.id}>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base font-bold text-slate-800 flex-1 pr-2">{item.name}</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-base font-black text-rose-600">{item.count}</Text>
                  <Text className="text-sm font-bold text-slate-500">({percentage}%)</Text>
                </View>
              </View>

              {/* Progress Bar using flex layout */}
              <View className="h-4.5 bg-slate-100 rounded-full overflow-hidden flex-row">
                <View
                  className="h-full rounded-full"
                  style={{ flex: filledFlex, backgroundColor: '#f43f5e' }}
                />
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
