import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from './_layout';

const SPORT_OPTIONS = [
  { id: 'general', emoji: '🏃', label: 'General Fitness' },
  { id: 'powerlifting', emoji: '🏋️', label: 'Powerlifting' },
  { id: 'bodybuilding', emoji: '💪', label: 'Bodybuilding' },
  { id: 'running', emoji: '👟', label: 'Running' },
  { id: 'martial_arts', emoji: '🥊', label: 'Martial Arts' },
  { id: 'crossfit', emoji: '🔥', label: 'CrossFit' },
];

const DAYS = [1, 2, 3, 4, 5, 6, 7];

export default function OnboardingSport() {
  const { data, update } = useOnboarding();
  const router = useRouter();
  const [sport, setSport] = useState(data.sport_type);
  const [trainingDays, setTrainingDays] = useState(data.training_days_per_week);

  function handleNext() {
    update({ sport_type: sport, training_days_per_week: trainingDays });
    router.push('/onboarding/diet');
  }

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <Text className="text-xs text-[#B09898] mb-6">Step 3 of 7</Text>
      <View className="h-1.5 bg-[#F4E4EA] rounded-full mb-8">
        <View className="h-1.5 bg-primary rounded-full" style={{ width: '42%' }} />
      </View>

      <Text className="text-2xl font-bold text-[#3D2B2B] mb-4">Sport & training</Text>

      <Text className="text-sm font-medium text-[#3D2B2B] mb-3">What do you train for?</Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {SPORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            onPress={() => setSport(opt.id)}
            className={`flex-row items-center rounded-2xl px-4 py-2.5 border-2 ${sport === opt.id ? 'border-primary bg-[#FFF0F4]' : 'border-[#F0E0E0] bg-white'}`}
          >
            <Text className="mr-1.5">{opt.emoji}</Text>
            <Text className={`text-sm font-medium ${sport === opt.id ? 'text-primary' : 'text-[#7A6060]'}`}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-sm font-medium text-[#3D2B2B] mb-3">
        How many days do you train per week?
      </Text>
      <View className="flex-row gap-2 mb-8">
        {DAYS.map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => setTrainingDays(d)}
            className={`flex-1 py-3 rounded-xl border-2 items-center ${trainingDays === d ? 'border-primary bg-primary' : 'border-[#F0E0E0] bg-white'}`}
          >
            <Text className={`font-bold ${trainingDays === d ? 'text-white' : 'text-[#7A6060]'}`}>{d}</Text>
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
