import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useWeightTrend } from '../../hooks/useWeightTrend';
import { todayString, formatDisplayDate } from '../../lib/utils/dateUtils';
import { Colors } from '../../constants/colors';

export default function WeightLogScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { raw, refresh } = useWeightTrend(7);
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const kg = parseFloat(weight);
    if (isNaN(kg) || kg < 30 || kg > 300) {
      Alert.alert('Invalid weight', 'Please enter a weight between 30–300 kg.');
      return;
    }

    // Safety check: large jump
    if (raw.length > 0) {
      const last = raw[raw.length - 1].weight_kg;
      if (Math.abs(kg - last) > 3) {
        Alert.alert(
          'Large change detected',
          `That's a ${Math.abs(kg - last).toFixed(1)} kg change from yesterday. Are you sure?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Save anyway', onPress: () => doSave(kg) },
          ]
        );
        return;
      }
    }
    doSave(kg);
  }

  async function doSave(kg: number) {
    if (!user) return;
    setSaving(true);
    const today = todayString();
    const { error } = await supabase.from('body_weight_logs').upsert({
      user_id: user.id,
      weight_kg: kg,
      date: today,
      note: note.trim() || null,
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
        weight_logged: true,
        updated_at: new Date().toISOString(),
      });
      refresh();
      router.back();
    }
    setSaving(false);
  }

  const recentWeights = [...raw].reverse().slice(0, 5);

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      {/* Header */}
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Text className="text-primary font-semibold">← Back</Text>
      </TouchableOpacity>
      <Text className="text-2xl font-bold text-[#3D2B2B] mb-1">Log Weight</Text>
      <Text className="text-xs text-[#B09898] mb-6">Morning weigh-in, after bathroom, before eating</Text>

      {/* Input */}
      <View className="bg-white rounded-3xl p-6 mb-4 shadow-sm items-center">
        <View className="flex-row items-baseline gap-3">
          <TextInput
            className="text-5xl font-bold text-[#3D2B2B] text-center"
            style={{ minWidth: 120 }}
            placeholder="68.5"
            placeholderTextColor={Colors.text.muted}
            keyboardType="decimal-pad"
            value={weight}
            onChangeText={setWeight}
          />
          <Text className="text-2xl text-[#7A6060]">kg</Text>
        </View>

        {/* ± adjustment buttons */}
        <View className="flex-row gap-3 mt-4">
          {[-0.5, -0.1, +0.1, +0.5].map((delta) => (
            <TouchableOpacity
              key={delta}
              onPress={() => {
                const curr = parseFloat(weight) || 0;
                setWeight((curr + delta).toFixed(1));
              }}
              className="bg-[#F4E4EA] rounded-xl px-3 py-2"
            >
              <Text className="text-primary font-semibold text-sm">
                {delta > 0 ? '+' : ''}{delta}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Note */}
      <View className="mb-6">
        <Text className="text-sm font-medium text-[#3D2B2B] mb-1.5">Note (optional)</Text>
        <TextInput
          className="bg-white border border-[#F4A7B9] rounded-2xl px-4 py-3 text-[#3D2B2B]"
          placeholder="e.g. After rest day"
          placeholderTextColor={Colors.text.muted}
          value={note}
          onChangeText={setNote}
        />
      </View>

      {/* Recent weights */}
      {recentWeights.length > 0 && (
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <Text className="text-xs font-semibold text-[#B09898] mb-2">RECENT</Text>
          {recentWeights.map((w) => (
            <View key={w.date} className="flex-row justify-between mb-1">
              <Text className="text-sm text-[#7A6060]">{formatDisplayDate(w.date)}</Text>
              <Text className="text-sm font-semibold text-[#3D2B2B]">{w.weight_kg} kg</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        className="bg-primary rounded-2xl py-4 items-center mb-10"
        onPress={handleSave}
        disabled={saving}
        style={{ opacity: saving ? 0.7 : 1 }}
      >
        <Text className="text-white font-bold text-base">{saving ? 'Saving...' : 'Save Weight ✓'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
