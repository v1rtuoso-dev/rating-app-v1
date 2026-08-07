import { AdminDrawer } from '@/components/AdminDrawer';
import { CounterPerformanceChart } from '@/components/charts/CounterPerformanceChart';
import { RatingBreakdownChart } from '@/components/charts/RatingBreakdownChart';
import { ReasonDistributionChart } from '@/components/charts/ReasonDistributionChart';
import { AppButton, AppCard, Icon, MetricCard, PageHeader, SectionTitle, StatusBadge } from '@/components/ui';
import { useSession } from '@/features/session/SessionContext';
import i18n from '@/i18n';
import { ApiEvaluation, evaluationsApi } from '@/services/api/evaluationsApi';
import { reasonsApi, UnsatisfiedReason } from '@/services/api/reasonsApi';
import { theme } from '@/theme';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from '@/tw';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { BackHandler, useWindowDimensions } from 'react-native';

type TimeFilter = 'all' | 'today' | 'week';
type RatingFilter = 'all' | 4 | 3 | 2 | 1;
type ChartTab = 'breakdown' | 'reasons' | 'counters';

function isCreatedToday(createdAtStr: string | undefined | null): boolean {
  if (!createdAtStr) return false;
  const str = String(createdAtStr).trim();
  if (!str) return false;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayYYYYMMDD = `${yyyy}-${mm}-${dd}`;

  // 1. Direct YYYY-MM-DD match (e.g. "2026-07-31T11:40:00Z")
  if (str.includes(todayYYYYMMDD)) {
    return true;
  }

  // 2. Full Date / ISO string check (contains date hyphen "-")
  if (str.includes('-')) {
    const itemDate = new Date(str);
    if (!isNaN(itemDate.getTime())) {
      const itemYYYY = itemDate.getFullYear();
      const itemMM = String(itemDate.getMonth() + 1).padStart(2, '0');
      const itemDD = String(itemDate.getDate()).padStart(2, '0');
      return `${itemYYYY}-${itemMM}-${itemDD}` === todayYYYYMMDD;
    }
    return false;
  }

  // 3. Anchored time-only string (e.g. "08:10" or "14:20:00")
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) {
    return true;
  }

  return false;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { session, isAdminUnlocked, isLoaded, lockAdmin, touchUserActivity } = useSession();
  const { width, height } = useWindowDimensions();
  const isTablet = width / height >= 1.45;
  const t = i18n.t.bind(i18n);

  const [evaluations, setEvaluations] = useState<ApiEvaluation[]>([]);
  const [reasonsList, setReasonsList] = useState<UnsatisfiedReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Filter States
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeChartTab, setActiveChartTab] = useState<ChartTab>('breakdown');

  // Auto redirect to Kiosk when Admin mode locks due to inactivity
  useEffect(() => {
    if (isLoaded && !isAdminUnlocked && session) {
      router.replace('/kiosk' as never);
    }
  }, [isAdminUnlocked, isLoaded, session]);

  // Handle Android Back button: return to Kiosk mode instead of Sign In
  useEffect(() => {
    const onBackPress = () => {
      lockAdmin();
      router.replace('/kiosk' as never);
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [lockAdmin]);

  useEffect(() => {
    (async () => {
      try {
        const [fetchedEvals, fetchedReasons] = await Promise.all([
          evaluationsApi.getEvaluations(),
          reasonsApi.getReasons().catch(() => []),
        ]);
        setEvaluations(fetchedEvals);
        setReasonsList(fetchedReasons);
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getRatingVal = (e: ApiEvaluation) => e.ratingLevel ?? e.rating ?? 4;

  // Filtered Evaluations
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((item) => {
      // 1. Rating filter
      const ratingVal = getRatingVal(item);
      if (ratingFilter !== 'all' && ratingVal !== ratingFilter) return false;

      // 2. Time filter
      if (timeFilter === 'today') {
        const dateStr = (item as any).createdAt || (item as any).createdDate || (item as any).evaluationDate || (item as any).dateCreated || (item as any).created_at || '';
        if (!isCreatedToday(dateStr)) return false;
      }

      // 3. Search keyword filter
      if (searchKeyword.trim()) {
        const query = searchKeyword.trim().toLowerCase();
        const textToSearch = `${item.deviceName || ''} ${item.checkinCounterName || ''} ${item.flightId || ''}`.toLowerCase();
        if (!textToSearch.includes(query)) return false;
      }

      return true;
    });
  }, [evaluations, timeFilter, ratingFilter, searchKeyword]);

  const totalReviews = filteredEvaluations.length;
  const excellentReviews = filteredEvaluations.filter((e) => getRatingVal(e) >= 4).length;
  const satisfiedReviews = filteredEvaluations.filter((e) => getRatingVal(e) >= 3).length;
  const satisfactionRate = totalReviews > 0 ? Math.round((satisfiedReviews / totalReviews) * 100) : 100;
  const avgRating = totalReviews > 0 ? (filteredEvaluations.reduce((acc, e) => acc + getRatingVal(e), 0) / totalReviews).toFixed(1) : '4.0';

  const hasActiveFilters = timeFilter !== 'all' || ratingFilter !== 'all' || searchKeyword.trim() !== '';

  const clearAllFilters = () => {
    setTimeFilter('all');
    setRatingFilter('all');
    setSearchKeyword('');
  };

  if (!isAdminUnlocked) {
    return (
      <View className="flex-1 bg-slate-100 justify-center items-center p-6">
        <Text className="text-xl font-bold text-slate-900 mb-2">{t('adminSessionLocked')}</Text>
        <Text className="text-sm text-slate-500 mb-4">{t('redirectingToKiosk')}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-100" onTouchStart={touchUserActivity}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 bg-slate-100"
        contentContainerClassName={`flex-grow pt-8 pb-36 w-full self-center ${isTablet ? 'px-10 max-w-[1280px]' : 'px-6'}`}
      >
        {/* Header Bar */}
        <PageHeader
          title={t('operationsDashboard')}
          subtitle={`${t('activeFlightLabel')} ${session?.flightNo || 'WE272'} • ${session?.counter || 'Counter A'}`}
          rightAction={
            <AppButton
              title={t('adminMenu')}
              icon="menu"
              onPress={() => setDrawerVisible(true)}
              variant="secondary"
              fullWidth={false}
            />
          }
        />

        {/* Filter Controls Section */}
        <View className="bg-white rounded-3xl p-6 border border-slate-200 mb-6" style={{ elevation: 2 }}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-extrabold text-slate-900">{t('filterAnalytics')}</Text>
            {hasActiveFilters ? (
              <TouchableOpacity onPress={clearAllFilters} className="bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200">
                <Text className="text-sm font-bold text-rose-700">{t('clearFilters')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Search Keyword Filter */}
          <View className="mb-4 flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
            <View className="mr-2.5">
              <Icon name="search" size={22} color="#64748b" />
            </View>
            <TextInput
              value={searchKeyword}
              onChangeText={setSearchKeyword}
              placeholder={t('searchPlaceholder')}
              className="flex-1 text-slate-900 text-base font-semibold"
            />
            {searchKeyword ? (
              <TouchableOpacity onPress={() => setSearchKeyword('')} className="p-1">
                <Text className="text-slate-400 font-bold text-base">✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Time Window Pills */}
          <View className="mb-4">
            <Text className="text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-2">{t('timeRange')}</Text>
            <View className="flex-row gap-2.5">
              {[
                { id: 'all', label: t('allTime') },
                { id: 'today', label: t('today') },
              ].map((item) => {
                const isActive = timeFilter === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setTimeFilter(item.id as TimeFilter)}
                    className="py-2.5 px-5 rounded-xl"
                    style={{
                      backgroundColor: isActive ? '#17479E' : '#f8fafc',
                      borderWidth: 1,
                      borderColor: isActive ? '#17479E' : '#cbd5e1',
                    }}
                  >
                    <Text className="text-sm font-bold" style={{ color: isActive ? '#ffffff' : '#334155' }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Rating Level Pills */}
          <View>
            <Text className="text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-2">{t('ratingLevel')}</Text>
            <View className="flex-row flex-wrap gap-2.5">
              {[
                { id: 'all', label: t('allRatings') },
                { id: 4, label: t('stars4') },
                { id: 3, label: t('stars3') },
                { id: 2, label: t('stars2') },
                { id: 1, label: t('stars1') },
              ].map((item) => {
                const isActive = ratingFilter === item.id;
                return (
                  <TouchableOpacity
                    key={item.id.toString()}
                    onPress={() => setRatingFilter(item.id as RatingFilter)}
                    className="py-2.5 px-4 rounded-xl"
                    style={{
                      backgroundColor: isActive ? '#17479E' : '#f8fafc',
                      borderWidth: 1,
                      borderColor: isActive ? '#17479E' : '#cbd5e1',
                    }}
                  >
                    <Text className="text-sm font-bold" style={{ color: isActive ? '#ffffff' : '#334155' }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Metric Cards Row */}
        <View className="flex-row gap-3 mb-3">
          <MetricCard label={t('totalReviews')} value={totalReviews.toString()} accent={theme.colors.primary} />
          <MetricCard label={t('satisfactionRate')} value={`${satisfactionRate}%`} accent={theme.colors.success} />
        </View>
        <View className="flex-row gap-3 mb-6">
          <MetricCard label={t('avgRating')} value={avgRating} accent={theme.colors.warning} />
          <MetricCard label={t('excellent4')} value={excellentReviews.toString()} accent={theme.colors.accent} />
        </View>

        {/* Interactive Charts Section Header & Tab Switcher */}
        <View className="flex-row justify-between items-center mb-4">
          <SectionTitle title={t('analyticsInsights')} subtitle={t('analyticsSubtitle')} />
        </View>

        <View className="flex-row bg-slate-200/80 p-1.5 rounded-2xl mb-6 border border-slate-300">
          {[
            { id: 'breakdown', label: t('ratingShare') },
            { id: 'reasons', label: t('complaints') },
            { id: 'counters', label: t('counterRating') },
          ].map((tab) => {
            const isActive = activeChartTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveChartTab(tab.id as ChartTab)}
                className="py-3 rounded-xl items-center justify-center"
                style={{
                  flex: 1,
                  backgroundColor: isActive ? '#ffffff' : 'transparent',
                  elevation: isActive ? 2 : 0,
                }}
              >
                <Text
                  className="text-base font-bold text-center"
                  style={{ color: isActive ? '#17479E' : '#475569', fontWeight: isActive ? '800' : '600' }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Render Active Chart View */}
        {activeChartTab === 'breakdown' && (
          <RatingBreakdownChart evaluations={filteredEvaluations} />
        )}
        {activeChartTab === 'reasons' && (
          <ReasonDistributionChart evaluations={filteredEvaluations} reasonsList={reasonsList} />
        )}
        {activeChartTab === 'counters' && (
          <CounterPerformanceChart evaluations={filteredEvaluations} />
        )}

        {/* Recent Feedback Feed List */}
        <SectionTitle title={t('recentFeedback')} subtitle={t('recentFeedbackSubtitle')} />
        {loading ? (
          <Text className="text-slate-500 py-4">{t('loadingRecords')}</Text>
        ) : filteredEvaluations.length === 0 ? (
          <AppCard className="py-8 items-center justify-center mb-4">
            <Text className="text-slate-500 font-semibold text-base">
              {t('noRecordsMatch')}
            </Text>
          </AppCard>
        ) : (
          filteredEvaluations.map((item) => {
            const ratingVal = getRatingVal(item);
            const counterText = item.checkinCounterName ? ` • ${item.checkinCounterName}` : '';
            return (
              <AppCard key={item.id} className="mb-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-base font-bold text-slate-900">
                    {item.deviceName || t('kioskDevice')}{counterText} • Flight #{item.flightId}
                  </Text>
                  <StatusBadge
                    label={`${ratingVal}/4`}
                    color={ratingVal >= 4 ? theme.colors.success : ratingVal >= 3 ? theme.colors.primary : theme.colors.warning}
                  />
                </View>
                <Text className="text-slate-500 text-xs mt-1.5">{item.createdAt}</Text>
              </AppCard>
            );
          })
        )}
      </ScrollView>

      <AdminDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </View>
  );
}
