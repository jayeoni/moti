import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { useGoal } from '../../hooks/useGoal';
import { useAdherence } from '../../hooks/useAdherence';
import { Colors } from '../../constants/colors';
import { getWeekDates, formatDisplayDate, formatDayName, daysUntil } from '../../lib/utils/dateUtils';
import { todayString } from '../../lib/utils/dateUtils';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { CompetitionEvent } from '../../types';

export default function PlanScreen() {
  const { goal, plan, loading: goalLoading } = useGoal();
  const { weekHistory } = useAdherence();
  const { user } = useAuth();
  const [competition, setCompetition] = useState<CompetitionEvent | null>(null);
  const weekDates = getWeekDates();
  const today = todayString();

  useEffect(() => {
    if (!user) return;
    supabase
      .from('competition_events')
      .select('*')
      .eq('user_id', user.id)
      .order('event_date', { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setCompetition(data));
  }, [user]);

  if (goalLoading) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const phaseLabel = plan?.phase.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? '—';

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 20, paddingTop: 56 }}>
      <Text className="text-2xl font-bold text-[#3D2B2B] mb-1">Your Plan</Text>
      {plan && (
        <Text className="text-xs text-[#B09898] mb-6">
          Phase: {phaseLabel} · {plan.deadline_days}d to deadline
        </Text>
      )}

      {/* Competition countdown */}
      {competition && (
        <View className="bg-[#FFF0F4] border border-primary rounded-3xl p-5 mb-6">
          <Text className="text-xs font-semibold text-primary mb-1">🏆 COMPETITION COUNTDOWN</Text>
          <Text className="text-xl font-bold text-[#3D2B2B]">{competition.event_name}</Text>
          <Text className="text-4xl font-bold text-primary mt-1">
            {Math.max(0, daysUntil(competition.event_date))}
          </Text>
          <Text className="text-sm text-[#7A6060]">days to go · {competition.event_date}</Text>
        </View>
      )}

      {/* Phase banner */}
      {plan && (
        <View className="bg-white rounded-3xl p-4 mb-4 shadow-sm">
          <Text className="text-xs text-[#B09898] uppercase font-semibold mb-1">Current Phase</Text>
          <Text className="text-lg font-bold text-[#3D2B2B]">{phaseLabel}</Text>
          <Text className="text-sm text-[#7A6060] mt-1 leading-4">{plan.focus_statement}</Text>
          <View className="flex-row mt-3 gap-4">
            <Text className="text-xs text-[#7A6060]">
              🎯 Target: <Text className="font-semibold">-{plan.weekly_target_kg_loss} kg/week</Text>
            </Text>
            <Text className="text-xs text-[#7A6060]">
              🔥 Cal: <Text className="font-semibold">{plan.daily_calorie_guidance.training_day} kcal</Text>
            </Text>
          </View>
        </View>
      )}

      {/* 7-day view */}
      <Text className="text-sm font-bold text-[#3D2B2B] mb-3">This Week</Text>
      <View className="gap-3 mb-6">
        {weekDates.map((date) => {
          const isToday = date === today;
          const pastScore = weekHistory.find((s) => s.date === date);
          const isPast = date < today;

          return (
            <View
              key={date}
              className={`bg-white rounded-2xl p-4 border-2 ${isToday ? 'border-primary' : 'border-transparent'}`}
              style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className={`text-xs font-semibold ${isToday ? 'text-primary' : 'text-[#B09898]'}`}>
                    {formatDayName(date).toUpperCase()} {isToday ? '· TODAY' : ''}
                  </Text>
                  <Text className="text-sm font-medium text-[#3D2B2B]">{formatDisplayDate(date)}</Text>
                </View>
                {isPast && pastScore && (
                  <View
                    style={{
                      width: 36, height: 36, borderRadius: 18,
                      backgroundColor:
                        pastScore.score >= 75 ? Colors.status.success
                        : pastScore.score >= 40 ? Colors.warning
                        : Colors.error,
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#FFF', fontSize: 11, fontWeight: 'bold' }}>
                      {pastScore.score}
                    </Text>
                  </View>
                )}
                {isToday && (
                  <View className="bg-[#FFF0F4] rounded-xl px-2 py-1">
                    <Text className="text-xs text-primary font-semibold">Active</Text>
                  </View>
                )}
                {!isPast && !isToday && (
                  <Text className="text-[#B09898] text-xs">Upcoming</Text>
                )}
              </View>
              {isPast && pastScore && (
                <View className="flex-row gap-2 mt-2">
                  {pastScore.meal_logged && <Text className="text-xs">🍽️</Text>}
                  {pastScore.workout_logged && <Text className="text-xs">💪</Text>}
                  {pastScore.weight_logged && <Text className="text-xs">⚖️</Text>}
                  {pastScore.flour_free && <Text className="text-xs">🌾</Text>}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Non-negotiables */}
      {plan?.non_negotiables && (
        <View className="bg-white rounded-3xl p-4 mb-8 shadow-sm">
          <Text className="text-sm font-bold text-[#3D2B2B] mb-3">Daily Must-Dos</Text>
          {plan.non_negotiables.map((task, i) => (
            <View key={i} className="flex-row items-center mb-2">
              <View className="w-5 h-5 rounded-full border-2 border-primary mr-3" />
              <Text className="text-sm text-[#3D2B2B]">{task}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
