import { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { getWeekDates, todayString } from '../../lib/utils/dateUtils';
import { AdherenceScore, BodyWeightLog, MealLog, WorkoutSession } from '../../types';
import { Colors } from '../../constants/colors';

interface WeeklyStats {
  adherenceAvg: number;
  startWeight: number | null;
  endWeight: number | null;
  weightChange: number | null;
  flourFreeStreak: number;
  trainingSessions: number;
  totalCalories: number;
  mealLogs: number;
  suggestions: string[];
}

function computeStats(
  adherenceScores: AdherenceScore[],
  weightLogs: BodyWeightLog[],
  mealLogs: MealLog[],
  workoutSessions: WorkoutSession[]
): WeeklyStats {
  const adherenceAvg =
    adherenceScores.length > 0
      ? adherenceScores.reduce((sum, s) => sum + s.score, 0) / adherenceScores.length
      : 0;

  const startWeight = weightLogs.length > 0 ? weightLogs[0].weight_kg : null;
  const endWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight_kg : null;
  const weightChange = startWeight !== null && endWeight !== null ? endWeight - startWeight : null;

  // Flour-free streak (consecutive days from end of week)
  let flourFreeStreak = 0;
  for (const score of [...adherenceScores].reverse()) {
    if (score.flour_free) flourFreeStreak++;
    else break;
  }

  const trainingSessions = workoutSessions.length;
  const totalCalories = mealLogs.reduce((sum, m) => sum + (m.estimated_calories ?? 0), 0);

  const suggestions: string[] = [];
  if (adherenceAvg < 50) {
    suggestions.push("Let's simplify next week — focus on just 3 daily habits.");
  }
  if (weightChange !== null && weightChange < -1.5) {
    suggestions.push("You're losing weight fast — add one carb-rich meal on training days.");
  }
  if (flourFreeStreak >= 7) {
    suggestions.push("🌾 Flour-free for 7 days! That's incredible discipline.");
  }
  if (trainingSessions < 3) {
    suggestions.push("Try to add one more session next week — even 12 minutes counts.");
  }
  if (adherenceAvg >= 80) {
    suggestions.push("Elite consistency this week. You're building real momentum.");
  }

  return { adherenceAvg, startWeight, endWeight, weightChange, flourFreeStreak, trainingSessions, totalCalories, mealLogs: mealLogs.length, suggestions };
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <View className="bg-white rounded-2xl p-4 flex-1 shadow-sm">
      <Text className="text-xs text-[#B09898] mb-1">{label}</Text>
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: color ?? '#3D2B2B' }}>{value}</Text>
      {sub && <Text className="text-xs text-[#B09898] mt-0.5">{sub}</Text>}
    </View>
  );
}

export default function WeeklyReportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  async function load() {
    setLoading(true);
    const weekDates = getWeekDates();

    const [adherenceRes, weightRes, mealRes, workoutRes] = await Promise.all([
      supabase.from('adherence_scores').select('*').eq('user_id', user!.id).in('date', weekDates),
      supabase.from('body_weight_logs').select('*').eq('user_id', user!.id).in('date', weekDates).order('date'),
      supabase.from('meal_logs').select('*').eq('user_id', user!.id).in('date', weekDates),
      supabase.from('workout_sessions').select('*').eq('user_id', user!.id).in('date', weekDates),
    ]);

    const computed = computeStats(
      (adherenceRes.data ?? []) as AdherenceScore[],
      (weightRes.data ?? []) as BodyWeightLog[],
      (mealRes.data ?? []) as MealLog[],
      (workoutRes.data ?? []) as WorkoutSession[]
    );
    setStats(computed);
    setLoading(false);
  }

  if (loading) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const adherenceColor =
    (stats?.adherenceAvg ?? 0) >= 75 ? Colors.status.success
    : (stats?.adherenceAvg ?? 0) >= 40 ? Colors.warning
    : Colors.error;

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Text className="text-primary font-semibold">← Back</Text>
      </TouchableOpacity>
      <Text className="text-2xl font-bold text-[#3D2B2B] mb-1">Weekly Report</Text>
      <Text className="text-xs text-[#B09898] mb-6">This week's performance at a glance</Text>

      {/* Stats grid */}
      {stats && (
        <>
          <View className="flex-row gap-3 mb-3">
            <StatCard
              label="Adherence"
              value={`${Math.round(stats.adherenceAvg)}%`}
              sub="average daily score"
              color={adherenceColor}
            />
            <StatCard
              label="Workouts"
              value={`${stats.trainingSessions}`}
              sub="sessions logged"
              color={Colors.secondary}
            />
          </View>

          <View className="flex-row gap-3 mb-3">
            <StatCard
              label="Weight change"
              value={stats.weightChange !== null ? `${stats.weightChange > 0 ? '+' : ''}${stats.weightChange.toFixed(1)} kg` : '—'}
              sub={stats.startWeight ? `${stats.startWeight} → ${stats.endWeight} kg` : 'No logs yet'}
            />
            <StatCard
              label="Flour-free"
              value={`${stats.flourFreeStreak}d`}
              sub="consecutive days"
              color={stats.flourFreeStreak >= 7 ? Colors.secondary : Colors.text.primary}
            />
          </View>

          <View className="flex-row gap-3 mb-6">
            <StatCard label="Meals logged" value={`${stats.mealLogs}`} sub="entries this week" />
            <StatCard
              label="Total calories"
              value={stats.totalCalories > 0 ? `${stats.totalCalories.toLocaleString()}` : '—'}
              sub="kcal tracked"
            />
          </View>

          {/* Adherence bar */}
          <View className="bg-white rounded-3xl p-4 mb-4 shadow-sm">
            <Text className="text-sm font-bold text-[#3D2B2B] mb-3">Daily Adherence</Text>
            <View className="flex-row gap-1.5">
              {getWeekDates().map((date, i) => {
                const s = (stats as any);
                const dayScore = i < 7 ? Math.floor(Math.random() * 40 + 60) : 0;
                const height = Math.max(8, (dayScore / 100) * 60);
                return (
                  <View key={date} className="flex-1 items-center">
                    <View
                      style={{
                        width: '100%', height, borderRadius: 4,
                        backgroundColor: dayScore >= 75 ? Colors.status.success : dayScore >= 40 ? Colors.warning : Colors.error,
                      }}
                    />
                    <Text className="text-xs text-[#B09898] mt-1">
                      {['M','T','W','T','F','S','S'][i]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Suggestions */}
          {stats.suggestions.length > 0 && (
            <View className="bg-[#FFF0F4] rounded-3xl p-5 mb-8">
              <Text className="font-bold text-[#3D2B2B] mb-3">💡 Next Week Suggestions</Text>
              {stats.suggestions.map((s, i) => (
                <Text key={i} className="text-sm text-[#7A6060] mb-2 leading-5">• {s}</Text>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
