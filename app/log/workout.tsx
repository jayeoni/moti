import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { EXERCISE_TEMPLATES } from '../../constants/exercises';
import { todayString } from '../../lib/utils/dateUtils';
import { ExerciseEntry, SessionType } from '../../types';
import { Colors } from '../../constants/colors';

const SESSION_TYPES: { type: SessionType; emoji: string; label: string; desc: string }[] = [
  { type: 'full', emoji: '🏋️', label: 'Full Session', desc: 'Complete planned workout' },
  { type: 'minimum_viable', emoji: '✅', label: 'Minimum Viable', desc: 'Short but still showed up' },
  { type: 'fallback_12min', emoji: '⚡', label: '12-Min Fallback', desc: 'The "just do something" session' },
  { type: 'active_recovery', emoji: '🚶', label: 'Active Recovery', desc: 'Walk, stretch, mobility' },
];

const RPE_LABELS: Record<number, string> = {
  1: 'Very easy', 2: 'Easy', 3: 'Moderate', 4: 'Somewhat hard',
  5: 'Hard', 6: 'Hard+', 7: 'Very hard', 8: 'Very hard+',
  9: 'Max effort', 10: 'Absolute max',
};

export default function WorkoutLogScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [sessionType, setSessionType] = useState<SessionType>('full');
  const [duration, setDuration] = useState('45');
  const [rpe, setRpe] = useState(7);
  const [quality, setQuality] = useState(7);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const filteredExercises = searchQuery
    ? EXERCISE_TEMPLATES.filter((e) =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.muscle_groups.some((m) => m.includes(searchQuery.toLowerCase()))
      ).slice(0, 8)
    : [];

  function toggleExercise(name: string) {
    if (selectedExercises.includes(name)) {
      setSelectedExercises(selectedExercises.filter((e) => e !== name));
    } else {
      setSelectedExercises([...selectedExercises, name]);
    }
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const today = todayString();

    const exercises: ExerciseEntry[] = selectedExercises.map((name) => ({
      exercise_id: name.toLowerCase().replace(/\s+/g, '_'),
      exercise_name: name,
      sets: [],
    }));

    const { error } = await supabase.from('workout_sessions').insert({
      user_id: user.id,
      session_type: sessionType,
      date: today,
      duration_minutes: parseInt(duration) || null,
      rpe,
      quality_score: quality,
      exercises,
      notes: notes.trim() || null,
      logged_at: new Date().toISOString(),
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      // Update adherence
      await supabase.from('adherence_scores').upsert({
        user_id: user.id,
        date: today,
        score: 25,
        workout_logged: true,
        updated_at: new Date().toISOString(),
      });
      router.back();
    }
    setSaving(false);
  }

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Text className="text-primary font-semibold">← Back</Text>
      </TouchableOpacity>
      <Text className="text-2xl font-bold text-[#3D2B2B] mb-6">Log Workout</Text>

      {/* Session type */}
      <Text className="text-sm font-medium text-[#3D2B2B] mb-3">Session type</Text>
      <View className="gap-2 mb-6">
        {SESSION_TYPES.map((s) => (
          <TouchableOpacity
            key={s.type}
            onPress={() => setSessionType(s.type)}
            className={`flex-row items-center rounded-2xl p-3.5 border-2 ${sessionType === s.type ? 'border-primary bg-[#FFF0F4]' : 'border-[#EEE] bg-white'}`}
          >
            <Text className="text-xl mr-3">{s.emoji}</Text>
            <View>
              <Text className={`font-semibold text-sm ${sessionType === s.type ? 'text-primary' : 'text-[#3D2B2B]'}`}>
                {s.label}
              </Text>
              <Text className="text-xs text-[#B09898]">{s.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Duration */}
      <View className="mb-5">
        <Text className="text-sm font-medium text-[#3D2B2B] mb-1.5">Duration (minutes)</Text>
        <TextInput
          className="bg-white border border-[#F4A7B9] rounded-2xl px-4 py-3 text-[#3D2B2B]"
          placeholder="45"
          placeholderTextColor={Colors.text.muted}
          keyboardType="number-pad"
          value={duration}
          onChangeText={setDuration}
        />
      </View>

      {/* RPE */}
      <View className="mb-5">
        <Text className="text-sm font-medium text-[#3D2B2B] mb-1.5">
          RPE: {rpe}/10 — <Text className="text-[#B09898] font-normal">{RPE_LABELS[rpe]}</Text>
        </Text>
        <View className="flex-row gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => setRpe(n)}
              style={{
                flex: 1, height: 32, borderRadius: 8,
                backgroundColor: rpe >= n ? Colors.primary : '#EEE',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              {rpe === n && <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>{n}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quality */}
      <View className="mb-5">
        <Text className="text-sm font-medium text-[#3D2B2B] mb-1.5">Session quality: {quality}/10</Text>
        <View className="flex-row gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => setQuality(n)}
              style={{
                flex: 1, height: 32, borderRadius: 8,
                backgroundColor: quality >= n ? Colors.secondary : '#EEE',
              }}
            />
          ))}
        </View>
      </View>

      {/* Exercise search */}
      <View className="mb-5">
        <Text className="text-sm font-medium text-[#3D2B2B] mb-1.5">Add exercises</Text>
        <TextInput
          className="bg-white border border-[#F4A7B9] rounded-2xl px-4 py-3 text-[#3D2B2B] mb-2"
          placeholder="Search exercises..."
          placeholderTextColor={Colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {filteredExercises.length > 0 && (
          <View className="bg-white rounded-2xl border border-[#F4E4EA] overflow-hidden">
            {filteredExercises.map((ex, i) => (
              <TouchableOpacity
                key={ex.id}
                onPress={() => { toggleExercise(ex.name); setSearchQuery(''); }}
                className={`flex-row items-center px-4 py-3 ${i < filteredExercises.length - 1 ? 'border-b border-[#F4E4EA]' : ''}`}
              >
                <View className="flex-1">
                  <Text className="text-sm font-medium text-[#3D2B2B]">{ex.name}</Text>
                  <Text className="text-xs text-[#B09898]">{ex.muscle_groups.join(', ')} · {ex.equipment}</Text>
                </View>
                {selectedExercises.includes(ex.name) && (
                  <Text className="text-secondary font-bold">✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedExercises.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-3">
            {selectedExercises.map((name) => (
              <TouchableOpacity
                key={name}
                onPress={() => setSelectedExercises(selectedExercises.filter((e) => e !== name))}
                className="flex-row items-center bg-[#F0FFF8] border border-secondary rounded-xl px-3 py-1.5"
              >
                <Text className="text-xs text-secondary font-medium">{name}</Text>
                <Text className="text-xs ml-1.5 text-[#B09898]">×</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Notes */}
      <View className="mb-6">
        <Text className="text-sm font-medium text-[#3D2B2B] mb-1.5">Notes (optional)</Text>
        <TextInput
          className="bg-white border border-[#F4A7B9] rounded-2xl px-4 py-3 text-[#3D2B2B]"
          placeholder="How did it go? Any PRs?"
          placeholderTextColor={Colors.text.muted}
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <TouchableOpacity
        className="bg-primary rounded-2xl py-4 items-center mb-10"
        onPress={handleSave}
        disabled={saving}
        style={{ opacity: saving ? 0.7 : 1 }}
      >
        <Text className="text-white font-bold text-base">{saving ? 'Saving...' : 'Save Workout ✓'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
