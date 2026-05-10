import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from './_layout';
import { Colors } from '../../constants/colors';

export default function OnboardingBody() {
  const { data, update } = useOnboarding();
  const router = useRouter();
  const [currentWeight, setCurrentWeight] = useState(data.current_weight_kg.toString());
  const [height, setHeight] = useState(data.height_cm.toString());

  const currentW = parseFloat(currentWeight) || 0;
  const targetW = data.target_weight_kg;
  const deadlineDate = new Date(data.deadline_date);
  const today = new Date();
  const daysLeft = Math.max(1, Math.ceil((deadlineDate.getTime() - today.getTime()) / 86400000));
  const weeksLeft = daysLeft / 7;
  const gap = currentW - targetW;
  const weeklyRate = gap > 0 ? gap / weeksLeft : 0;
  const tooAggressive = weeklyRate > 1.5;

  function handleNext() {
    update({
      current_weight_kg: parseFloat(currentWeight) || data.current_weight_kg,
      height_cm: parseInt(height) || data.height_cm,
    });
    router.push('/onboarding/sport');
  }

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <Text className="text-xs text-[#B09898] mb-6">Step 2 of 7</Text>
      <View className="h-1.5 bg-[#F4E4EA] rounded-full mb-8">
        <View className="h-1.5 bg-primary rounded-full" style={{ width: '28%' }} />
      </View>

      <Text className="text-2xl font-bold text-[#3D2B2B] mb-2">Your current body stats</Text>
      <Text className="text-sm text-[#7A6060] mb-6">This helps us calculate a safe pace for your goal.</Text>

      <View className="gap-4 mb-6">
        <View>
          <Text className="text-sm font-medium text-[#3D2B2B] mb-1.5">Current weight (kg)</Text>
          <TextInput
            className="bg-white border border-[#F4A7B9] rounded-2xl px-4 py-3.5 text-[#3D2B2B]"
            placeholder="e.g. 68.5"
            placeholderTextColor={Colors.text.muted}
            keyboardType="decimal-pad"
            value={currentWeight}
            onChangeText={setCurrentWeight}
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-[#3D2B2B] mb-1.5">Height (cm)</Text>
          <TextInput
            className="bg-white border border-[#F4A7B9] rounded-2xl px-4 py-3.5 text-[#3D2B2B]"
            placeholder="e.g. 165"
            placeholderTextColor={Colors.text.muted}
            keyboardType="number-pad"
            value={height}
            onChangeText={setHeight}
          />
        </View>
      </View>

      {/* Pace indicator */}
      {gap > 0 && (
        <View className={`rounded-2xl p-4 mb-6 ${tooAggressive ? 'bg-[#FFF0F0] border border-[#FF6B6B]' : 'bg-[#F0FFF8] border border-[#7EC8A4]'}`}>
          <Text className="font-semibold text-[#3D2B2B] mb-1">
            {tooAggressive ? '⚠️ Pace check' : '✅ Pace looks good'}
          </Text>
          <Text className="text-sm text-[#7A6060]">
            You want to lose {gap.toFixed(1)} kg in {weeksLeft.toFixed(1)} weeks
            — that's <Text className="font-semibold">{weeklyRate.toFixed(2)} kg/week</Text>.
          </Text>
          {tooAggressive && (
            <Text className="text-sm text-[#FF6B6B] mt-1">
              That's above the safe limit of 1.0 kg/week. Consider extending your deadline or adjusting your target.
            </Text>
          )}
        </View>
      )}

      {tooAggressive ? (
        <View className="gap-3 mb-10">
          <TouchableOpacity
            className="bg-white border-2 border-primary rounded-2xl py-4 items-center"
            onPress={() => router.back()}
          >
            <Text className="text-primary font-bold text-base">← Edit My Goal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-[#FF6B6B] rounded-2xl py-4 items-center"
            onPress={handleNext}
          >
            <Text className="text-white font-bold text-base">Continue Anyway →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          className="bg-primary rounded-2xl py-4 items-center mb-10"
          onPress={handleNext}
        >
          <Text className="text-white font-bold text-base">Next →</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
