import { ScrollView, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useGoal } from '../../hooks/useGoal';
import { useAdherence } from '../../hooks/useAdherence';
import { Colors } from '../../constants/colors';
import { getWeekDates, formatDisplayDate, formatDayName, daysUntil } from '../../lib/utils/dateUtils';
import { todayString } from '../../lib/utils/dateUtils';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { AdherenceScore, CompetitionEvent } from '../../types';

function isTaskDone(task: string, todayScore: AdherenceScore | null): boolean {
  if (!todayScore) return false;
  const t = task.toLowerCase();
  if (t.includes('workout') || t.includes('train') || t.includes('exercise') || t.includes('session')) return todayScore.workout_logged;
  if (t.includes('meal') || t.includes('eat') || t.includes('food') || t.includes('calorie') || t.includes('nutrition')) return todayScore.meal_logged;
  if (t.includes('weight') || t.includes('scale') || t.includes('weigh')) return todayScore.weight_logged;
  if (t.includes('check') || t.includes('mood') || t.includes('feeling') || t.includes('readiness')) return todayScore.checkin_completed;
  if (t.includes('flour') || t.includes('gluten') || t.includes('flour-free')) return todayScore.flour_free;
  return false;
}

export default function PlanScreen() {
  const router = useRouter();
  const { goal, plan, loading: goalLoading } = useGoal();
  const { weekHistory } = useAdherence();
  const { user } = useAuth();
  const [competition, setCompetition] = useState<CompetitionEvent | null>(null);
  const [todayScore, setTodayScore] = useState<AdherenceScore | null>(null);
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
    supabase
      .from('adherence_scores')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle()
      .then(({ data }) => setTodayScore(data as AdherenceScore | null));
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
          <Text className="text-sm font-bold text-[#3D2B2B] mb-1">Daily Must-Dos</Text>
          <Text className="text-xs text-[#B09898] mb-3">Circles fill automatically as you log today's activities.</Text>
          {plan.non_negotiables.map((task, i) => {
            const done = isTaskDone(task, todayScore);
            return (
              <View key={i} className="flex-row items-center mb-3">
                <View
                  style={{
                    width: 22, height: 22, borderRadius: 11,
                    borderWidth: 2,
                    borderColor: done ? Colors.status.success : Colors.primary,
                    backgroundColor: done ? Colors.status.success : 'transparent',
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  {done && <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
                </View>
                <Text className={`text-sm flex-1 ${done ? 'line-through text-[#B09898]' : 'text-[#3D2B2B]'}`}>{task}</Text>
              </View>
            );
          })}
          <View className="flex-row gap-2 mt-2 pt-3 border-t border-[#F4E4EA]">
            {[
              { label: '⚖️ Weight', route: '/log/weight' as const, done: todayScore?.weight_logged },
              { label: '🍽️ Meal', route: '/log/meal' as const, done: todayScore?.meal_logged },
              { label: '💪 Workout', route: '/log/workout' as const, done: todayScore?.workout_logged },
            ].map(({ label, route, done }) => (
              <TouchableOpacity
                key={route}
                onPress={() => router.push(route)}
                style={{
                  flex: 1, paddingVertical: 6, borderRadius: 10, alignItems: 'center',
                  backgroundColor: done ? '#F0FFF8' : '#FFF0F4',
                  borderWidth: 1,
                  borderColor: done ? Colors.status.success : Colors.primary,
                }}
              >
                <Text style={{ fontSize: 11, color: done ? Colors.status.success : Colors.primary, fontWeight: '600' }}>
                  {done ? '✓ ' : ''}{label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
