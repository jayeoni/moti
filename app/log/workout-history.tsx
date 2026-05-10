import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { WorkoutSession, SessionType } from '../../types';
import { Colors } from '../../constants/colors';
import { formatDisplayDate } from '../../lib/utils/dateUtils';

const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  full: '🏋️ Full Session',
  minimum_viable: '✅ Minimum Viable',
  fallback_12min: '⚡ 12-Min Fallback',
  active_recovery: '🚶 Active Recovery',
};

const RPE_COLOR = (rpe: number) =>
  rpe >= 9 ? Colors.error : rpe >= 7 ? Colors.warning : Colors.status.success;

export default function WorkoutHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', user!.id)
      .order('date', { ascending: false })
      .limit(60);
    setSessions((data ?? []) as WorkoutSession[]);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    Alert.alert('Delete Workout', 'Remove this session from your diary?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await supabase.from('workout_sessions').delete().eq('id', id);
          setSessions((prev) => prev.filter((s) => s.id !== id));
          setExpanded(null);
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Compute simple stats
  const totalSessions = sessions.length;
  const avgRpe = sessions.filter((s) => s.rpe).length > 0
    ? (sessions.reduce((sum, s) => sum + (s.rpe ?? 0), 0) / sessions.filter((s) => s.rpe).length).toFixed(1)
    : '—';
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0);

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Text className="text-primary font-semibold">← Back</Text>
      </TouchableOpacity>

      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-2xl font-bold text-[#3D2B2B]">Workout Diary</Text>
        <TouchableOpacity
          className="bg-primary rounded-2xl px-4 py-2"
          onPress={() => router.push('/log/workout')}
        >
          <Text className="text-white font-semibold text-sm">+ Log</Text>
        </TouchableOpacity>
      </View>

      {/* Summary stats */}
      {totalSessions > 0 && (
        <View className="flex-row gap-3 mt-4 mb-6">
          {[
            { label: 'Sessions', value: String(totalSessions) },
            { label: 'Avg RPE', value: String(avgRpe) },
            { label: 'Total time', value: totalMinutes >= 60 ? `${Math.round(totalMinutes / 60)}h` : `${totalMinutes}m` },
          ].map((stat) => (
            <View key={stat.label} className="flex-1 bg-white rounded-2xl p-3 items-center shadow-sm">
              <Text className="text-lg font-bold text-[#3D2B2B]">{stat.value}</Text>
              <Text className="text-xs text-[#B09898]">{stat.label}</Text>
            </View>
          ))}
        </View>
      )}

      {totalSessions === 0 && (
        <View className="items-center py-16">
          <Text style={{ fontSize: 52 }}>📖</Text>
          <Text className="text-[#3D2B2B] font-semibold mt-3 text-lg">No sessions yet</Text>
          <Text className="text-sm text-[#B09898] mt-1 text-center">
            Your workout diary will appear here.{'\n'}The AI uses it to plan upcoming sessions.
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-2xl px-6 py-3 mt-6"
            onPress={() => router.push('/log/workout')}
          >
            <Text className="text-white font-bold">Log First Workout</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="gap-3">
        {sessions.map((session) => {
          const isExpanded = expanded === session.id;
          return (
            <View
              key={session.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm"
              style={{ borderWidth: 1, borderColor: '#F4E4EA' }}
            >
              {/* Collapsed header */}
              <TouchableOpacity
                onPress={() => setExpanded(isExpanded ? null : session.id)}
                className="p-4"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View className="flex-1">
                    <Text className="text-xs text-[#B09898] mb-0.5">{formatDisplayDate(session.date)}</Text>
                    <Text className="font-bold text-[#3D2B2B] text-sm">
                      {SESSION_TYPE_LABELS[session.session_type]}
                    </Text>
                    <View className="flex-row gap-3 mt-1 flex-wrap">
                      {session.duration_minutes != null && (
                        <Text className="text-xs text-[#7A6060]">⏱ {session.duration_minutes} min</Text>
                      )}
                      {session.rpe != null && (
                        <Text style={{ fontSize: 11, color: RPE_COLOR(session.rpe) }} className="font-semibold">
                          RPE {session.rpe}
                        </Text>
                      )}
                      {session.exercises.length > 0 && (
                        <Text className="text-xs text-[#7A6060]">
                          {session.exercises.slice(0, 2).map((e) => e.exercise_name).join(', ')}
                          {session.exercises.length > 2 ? ` +${session.exercises.length - 2}` : ''}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text className="text-[#B09898] ml-2">{isExpanded ? '↑' : '↓'}</Text>
                </View>
              </TouchableOpacity>

              {/* Expanded detail */}
              {isExpanded && (
                <View className="px-4 pb-4 border-t border-[#F4E4EA]">
                  {/* All exercises */}
                  {session.exercises.length > 0 && (
                    <View className="mt-3 mb-3">
                      <Text className="text-xs font-semibold text-[#B09898] mb-2">EXERCISES</Text>
                      {session.exercises.map((ex, i) => (
                        <Text key={i} className="text-sm text-[#3D2B2B] mb-1">• {ex.exercise_name}</Text>
                      ))}
                    </View>
                  )}

                  {/* RPE + Quality */}
                  {(session.rpe != null || session.quality_score != null) && (
                    <View className="flex-row gap-4 mb-3">
                      {session.rpe != null && (
                        <View>
                          <Text className="text-xs text-[#B09898]">Effort (RPE)</Text>
                          <Text style={{ fontWeight: 'bold', color: RPE_COLOR(session.rpe) }}>
                            {session.rpe}/10
                          </Text>
                        </View>
                      )}
                      {session.quality_score != null && (
                        <View>
                          <Text className="text-xs text-[#B09898]">Quality</Text>
                          <Text className="font-bold text-[#3D2B2B]">{session.quality_score}/10</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Diary notes */}
                  {session.notes ? (
                    <View className="bg-[#FFF9F5] rounded-xl p-3 mb-3">
                      <Text className="text-xs font-semibold text-[#B09898] mb-1">DIARY NOTE</Text>
                      <Text className="text-sm text-[#3D2B2B] leading-5">{session.notes}</Text>
                    </View>
                  ) : null}

                  {/* Actions */}
                  <View className="flex-row gap-2 mt-1">
                    <TouchableOpacity
                      onPress={() => router.push(`/log/workout?id=${session.id}`)}
                      style={{ flex: 1, backgroundColor: '#F0F0FF', borderRadius: 14, paddingVertical: 10, alignItems: 'center' }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#5050CC' }}>✏️ Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(session.id)}
                      style={{ flex: 1, backgroundColor: '#FFF0F0', borderRadius: 14, paddingVertical: 10, alignItems: 'center' }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#FF6B6B' }}>🗑 Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
