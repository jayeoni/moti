import { ScrollView, View, Text, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useToday } from '../../hooks/useToday';
import { useGoal } from '../../hooks/useGoal';
import { useWeightTrend } from '../../hooks/useWeightTrend';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/colors';
import { todayString, daysUntil } from '../../lib/utils/dateUtils';
import { MascotExpression } from '../../types';

// ─── Mascot ───────────────────────────────────────────────────────────────────
function Mascot({ expression }: { expression: MascotExpression }) {
  const emojiMap: Record<MascotExpression, string> = {
    celebrating: '🥳',
    happy: '😊',
    encouraging: '💪',
    concerned: '🫂',
    tired: '😴',
  };
  return (
    <View className="items-center">
      <Text style={{ fontSize: 64 }}>{emojiMap[expression]}</Text>
    </View>
  );
}

// ─── Adherence Ring ───────────────────────────────────────────────────────────
function AdherenceRing({ score }: { score: number }) {
  const color = score >= 75 ? Colors.status.success : score >= 40 ? Colors.warning : Colors.error;
  return (
    <View className="items-center">
      <View
        style={{
          width: 100, height: 100, borderRadius: 50,
          borderWidth: 8, borderColor: color,
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#FFF',
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: 'bold', color }}>{score}</Text>
        <Text style={{ fontSize: 10, color: Colors.text.muted }}>today</Text>
      </View>
    </View>
  );
}

// ─── Low Willpower Banner ─────────────────────────────────────────────────────
function LowWillpowerBanner({ tasks }: { tasks: string[] }) {
  return (
    <View className="bg-[#FFF3E0] border border-[#FFB347] rounded-3xl p-4 mb-4">
      <Text className="font-bold text-[#3D2B2B] mb-2">🌿 Just 3 things today</Text>
      <Text className="text-xs text-[#7A6060] mb-3">Low energy is okay. Focus only on these:</Text>
      {tasks.map((t, i) => (
        <Text key={i} className="text-sm text-[#3D2B2B] mb-1">✓ {t}</Text>
      ))}
    </View>
  );
}

// ─── Mood Checkin ─────────────────────────────────────────────────────────────
function MoodCheckin({ onDone }: { onDone: () => void }) {
  const [readiness, setReadiness] = useState(7);
  const [mood, setMood] = useState(3);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const MOODS = ['😞', '😕', '😐', '😊', '😄'];

  async function save() {
    if (!user) return;
    setSaving(true);
    await supabase.from('daily_checkins').upsert({
      user_id: user.id,
      date: todayString(),
      mood,
      readiness,
      soreness: 2,
      sleep_quality: 3,
      hunger_level: 3,
      motivation_state: mood <= 2 ? 'struggling' : mood === 3 ? 'steady' : 'fired_up',
    });
    setSaving(false);
    onDone();
  }

  return (
    <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
      <Text className="font-bold text-[#3D2B2B] mb-4">Good morning! How are you feeling?</Text>

      <Text className="text-sm text-[#7A6060] mb-2">Mood</Text>
      <View className="flex-row gap-2 mb-4">
        {MOODS.map((emoji, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setMood(i + 1)}
            style={{
              flex: 1, alignItems: 'center', padding: 8,
              borderRadius: 12, borderWidth: 2,
              borderColor: mood === i + 1 ? Colors.primary : '#EEE',
              backgroundColor: mood === i + 1 ? '#FFF0F4' : '#FFF',
            }}
          >
            <Text style={{ fontSize: 20 }}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-sm text-[#7A6060] mb-2">Readiness: {readiness}/10</Text>
      <View className="flex-row gap-1 mb-4">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <TouchableOpacity
            key={n}
            onPress={() => setReadiness(n)}
            style={{
              flex: 1, height: 28, borderRadius: 6,
              backgroundColor: readiness >= n ? Colors.primary : '#EEE',
            }}
          />
        ))}
      </View>

      <TouchableOpacity
        className="bg-primary rounded-2xl py-3 items-center"
        onPress={save}
        disabled={saving}
      >
        <Text className="text-white font-semibold">{saving ? 'Saving...' : 'Done ✓'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function TodayDashboard() {
  const { dailyPlan, adherence, safety, checkin, loading, refresh } = useToday();
  const { goal, profile, plan } = useGoal();
  const { latestWeight, trend } = useWeightTrend(14);
  const router = useRouter();

  const expression: MascotExpression =
    !adherence ? 'encouraging'
    : adherence.score >= 80 ? 'celebrating'
    : adherence.score >= 50 ? 'happy'
    : adherence.low_willpower_mode ? 'concerned'
    : 'encouraging';

  const name = profile?.display_name?.split(' ')[0] ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? `Good morning, ${name}!` : hour < 17 ? `Good afternoon, ${name}!` : `Good evening, ${name}!`;

  if (loading) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-cream"
      contentContainerStyle={{ padding: 20, paddingTop: 56 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
    >
      {/* Header + Mascot */}
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-2xl font-bold text-[#3D2B2B]">{greeting}</Text>
          {plan && (
            <Text className="text-xs text-[#B09898] mt-0.5">
              Phase: {plan.phase.replace('_', ' ')} · {plan.deadline_days}d remaining
            </Text>
          )}
        </View>
        <Mascot expression={expression} />
      </View>

      {/* Safety warnings */}
      {safety?.warnings.map((w, i) => (
        <View
          key={i}
          className={`rounded-2xl p-3 mb-3 ${w.severity === 'critical' ? 'bg-[#FFF0F0] border border-error' : 'bg-[#FFF8E0] border border-warning'}`}
        >
          <Text className="text-sm font-semibold text-[#3D2B2B]">
            {w.severity === 'critical' ? '🚨' : '⚠️'} {w.message}
          </Text>
        </View>
      ))}

      {/* Mood checkin if not done */}
      {!checkin && <MoodCheckin onDone={refresh} />}

      {/* Adherence Ring + Score */}
      <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm flex-row items-center">
        <AdherenceRing score={adherence?.score ?? 0} />
        <View className="ml-4 flex-1">
          <Text className="font-bold text-[#3D2B2B] mb-1">Today's adherence</Text>
          <Text className="text-xs text-[#7A6060] leading-4">{adherence?.recovery_message}</Text>
          {adherence && (
            <View className="flex-row gap-3 mt-2">
              <Text className="text-xs text-secondary font-semibold">🔥 {adherence.current_streak}d streak</Text>
              <Text className="text-xs text-primary font-semibold">🌾 {adherence.flour_free_streak}d flour-free</Text>
            </View>
          )}
        </View>
      </View>

      {/* Low willpower mode */}
      {adherence?.low_willpower_mode && dailyPlan?.non_negotiables && (
        <LowWillpowerBanner tasks={dailyPlan.non_negotiables} />
      )}

      {/* Today's focus */}
      {dailyPlan?.focus_statement && (
        <View className="bg-[#FFF0F4] rounded-3xl p-4 mb-4">
          <Text className="text-xs font-semibold text-primary mb-1">TODAY'S FOCUS</Text>
          <Text className="text-sm text-[#3D2B2B] leading-5 font-medium">{dailyPlan.focus_statement}</Text>
        </View>
      )}

      {/* Workout card */}
      {dailyPlan?.must_do_workouts && dailyPlan.must_do_workouts.length > 0 && (
        <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-bold text-[#3D2B2B]">💪 Today's Training</Text>
            <TouchableOpacity onPress={() => router.push('/log/workout')}>
              <Text className="text-xs text-primary font-semibold">Log →</Text>
            </TouchableOpacity>
          </View>
          {dailyPlan.must_do_workouts.slice(0, 4).map((ex, i) => (
            <Text key={i} className="text-sm text-[#7A6060] mb-1">• {ex}</Text>
          ))}
          {dailyPlan.must_do_workouts.length > 4 && (
            <Text className="text-xs text-[#B09898] mt-1">+{dailyPlan.must_do_workouts.length - 4} more</Text>
          )}
        </View>
      )}

      {/* Meal suggestions */}
      {dailyPlan?.meal_suggestions && dailyPlan.meal_suggestions.length > 0 && (
        <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-bold text-[#3D2B2B]">🥗 Meal Ideas</Text>
            {dailyPlan.flour_free_reminder && (
              <View className="bg-[#E8F5F0] rounded-xl px-2.5 py-1">
                <Text className="text-xs text-secondary font-semibold">🌾 Flour-free</Text>
              </View>
            )}
          </View>
          {dailyPlan.meal_suggestions.map((meal, i) => (
            <View key={i} className="mb-2">
              <Text className="text-xs text-[#B09898] uppercase font-semibold">{meal.meal_type}</Text>
              <Text className="text-sm text-[#3D2B2B]">{meal.suggestion_name}</Text>
              <Text className="text-xs text-[#7A6060]">~{meal.estimated_calories} kcal</Text>
            </View>
          ))}
          <TouchableOpacity
            className="mt-2 bg-[#F4E4EA] rounded-xl py-2 items-center"
            onPress={() => router.push('/log/meal')}
          >
            <Text className="text-primary text-xs font-semibold">Log a meal →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Weight trend */}
      <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-bold text-[#3D2B2B]">⚖️ Weight</Text>
          <TouchableOpacity onPress={() => router.push('/log/weight')}>
            <Text className="text-xs text-primary font-semibold">Log →</Text>
          </TouchableOpacity>
        </View>
        {latestWeight ? (
          <View className="flex-row items-baseline gap-2">
            <Text className="text-3xl font-bold text-[#3D2B2B]">{latestWeight.toFixed(1)}</Text>
            <Text className="text-sm text-[#7A6060]">kg</Text>
            <Text className="text-sm">
              {trend === 'down' ? '📉' : trend === 'up' ? '📈' : '➡️'}
            </Text>
          </View>
        ) : (
          <Text className="text-sm text-[#B09898]">No weight logged yet — tap to add</Text>
        )}
        {goal && (
          <Text className="text-xs text-[#B09898] mt-1">
            Target: {goal.target_weight_kg} kg · {daysUntil(goal.deadline_date)} days left
          </Text>
        )}
      </View>

      {/* Quick log buttons */}
      <View className="flex-row gap-3 mb-8">
        <TouchableOpacity
          className="flex-1 bg-secondary rounded-2xl py-3 items-center"
          onPress={() => router.push('/log/weight')}
        >
          <Text className="text-white font-semibold text-sm">⚖️ Weight</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-primary rounded-2xl py-3 items-center"
          onPress={() => router.push('/log/meal')}
        >
          <Text className="text-white font-semibold text-sm">🍽️ Meal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-accent rounded-2xl py-3 items-center"
          onPress={() => router.push('/log/workout')}
        >
          <Text className="text-[#3D2B2B] font-semibold text-sm">💪 Workout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
