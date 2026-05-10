import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from './_layout';
import { MotivationState } from '../../types';

const STATES: { state: MotivationState; emoji: string; label: string; desc: string }[] = [
  { state: 'fired_up', emoji: '🔥', label: "I'm fired up!", desc: "Ready to push hard and hit every goal" },
  { state: 'steady', emoji: '😊', label: "I'm steady", desc: "Feeling balanced, ready to be consistent" },
  { state: 'struggling', emoji: '😓', label: "I'm struggling", desc: "Motivation is low but I want to change that" },
  { state: 'burnt_out', emoji: '😮‍💨', label: "I'm burnt out", desc: "Really need a gentle restart right now" },
];

export default function OnboardingMotivation() {
  const { data, update } = useOnboarding();
  const router = useRouter();
  const [selected, setSelected] = useState<MotivationState>(data.motivation_state);

  function handleNext() {
    update({ motivation_state: selected });
    router.push('/onboarding/inventory');
  }

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <Text className="text-xs text-[#B09898] mb-6">Step 5 of 7</Text>
      <View className="h-1.5 bg-[#F4E4EA] rounded-full mb-8">
        <View className="h-1.5 bg-primary rounded-full" style={{ width: '70%' }} />
      </View>

      <Text className="text-2xl font-bold text-[#3D2B2B] mb-2">How are you feeling right now?</Text>
      <Text className="text-sm text-[#7A6060] mb-6">
        Honest answer helps me set the right tone for your first plan. No judgement here.
      </Text>

      <View className="gap-3 mb-8">
        {STATES.map((s) => (
          <TouchableOpacity
            key={s.state}
            onPress={() => setSelected(s.state)}
            className={`flex-row items-center bg-white rounded-2xl p-4 border-2 ${selected === s.state ? 'border-primary bg-[#FFF0F4]' : 'border-transparent'}`}
            style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
          >
            <Text className="text-3xl mr-4">{s.emoji}</Text>
            <View className="flex-1">
              <Text className="font-semibold text-[#3D2B2B]">{s.label}</Text>
              <Text className="text-xs text-[#7A6060]">{s.desc}</Text>
            </View>
            {selected === s.state && (
              <Text className="text-primary font-bold">✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className="bg-primary rounded-2xl py-4 items-center mb-10"
        onPress={handleNext}
      >
        <Text className="text-white font-bold text-base">Next →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
