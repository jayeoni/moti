import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from './_layout';
import { GoalType } from '../../types';
import { Colors } from '../../constants/colors';

const GOAL_OPTIONS: { type: GoalType; emoji: string; label: string; desc: string }[] = [
  { type: 'weight_loss', emoji: '⚖️', label: 'Weight Loss', desc: 'Reduce body weight, cut fat' },
  { type: 'competition_prep', emoji: '🏆', label: 'Competition Prep', desc: 'Get event-ready' },
  { type: 'muscle_gain', emoji: '💪', label: 'Muscle Gain', desc: 'Build strength & size' },
  { type: 'maintenance', emoji: '🎯', label: 'Maintenance', desc: 'Hold current physique' },
];

export default function OnboardingGoal() {
  const { data, update } = useOnboarding();
  const router = useRouter();
  const [selected, setSelected] = useState<GoalType>(data.goal_type);
  const [deadline, setDeadline] = useState(data.deadline_date);
  const [targetWeight, setTargetWeight] = useState(data.target_weight_kg.toString());
  const [name, setName] = useState(data.display_name);
  const [hasCompetition, setHasCompetition] = useState(data.has_competition);
  const [competitionName, setCompetitionName] = useState(data.competition_name);
  const [competitionDate, setCompetitionDate] = useState(data.competition_date);

  function handleNext() {
    if (!name.trim()) return;
    if (!deadline) return;

    update({
      display_name: name.trim(),
      goal_type: selected,
      deadline_date: deadline,
      target_weight_kg: parseFloat(targetWeight) || 60,
      has_competition: hasCompetition,
      competition_name: competitionName,
      competition_date: competitionDate,
    });
    router.push('/onboarding/body');
  }

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      {/* Progress */}
      <Text className="text-xs text-[#B09898] mb-6">Step 1 of 7</Text>
      <View className="h-1.5 bg-[#F4E4EA] rounded-full mb-8">
        <View className="h-1.5 bg-primary rounded-full" style={{ width: '14%' }} />
      </View>

      <Text className="text-2xl font-bold text-[#3D2B2B] mb-1">What's your name?</Text>
      <TextInput
        className="bg-white border border-[#F4A7B9] rounded-2xl px-4 py-3.5 text-[#3D2B2B] mb-6"
        placeholder="Your name"
        placeholderTextColor={Colors.text.muted}
        value={name}
        onChangeText={setName}
      />

      <Text className="text-2xl font-bold text-[#3D2B2B] mb-4">What's your goal?</Text>
      <View className="gap-3 mb-6">
        {GOAL_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.type}
            onPress={() => setSelected(opt.type)}
            className={`flex-row items-center bg-white rounded-2xl p-4 border-2 ${selected === opt.type ? 'border-primary' : 'border-transparent'}`}
            style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
          >
            <Text className="text-2xl mr-3">{opt.emoji}</Text>
            <View>
              <Text className="font-semibold text-[#3D2B2B]">{opt.label}</Text>
              <Text className="text-xs text-[#7A6060]">{opt.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-lg font-bold text-[#3D2B2B] mb-2">Target weight (kg)</Text>
      <TextInput
        className="bg-white border border-[#F4A7B9] rounded-2xl px-4 py-3.5 text-[#3D2B2B] mb-6"
        placeholder="e.g. 58"
        placeholderTextColor={Colors.text.muted}
        keyboardType="decimal-pad"
        value={targetWeight}
        onChangeText={setTargetWeight}
      />

      <Text className="text-lg font-bold text-[#3D2B2B] mb-2">Goal deadline (YYYY-MM-DD)</Text>
      <TextInput
        className="bg-white border border-[#F4A7B9] rounded-2xl px-4 py-3.5 text-[#3D2B2B] mb-6"
        placeholder="e.g. 2026-06-01"
        placeholderTextColor={Colors.text.muted}
        value={deadline}
        onChangeText={setDeadline}
      />

      {/* Competition toggle */}
      <TouchableOpacity
        className={`flex-row items-center rounded-2xl p-4 mb-4 border-2 ${hasCompetition ? 'border-primary bg-[#FFF0F4]' : 'border-transparent bg-white'}`}
        onPress={() => setHasCompetition(!hasCompetition)}
      >
        <Text className="text-xl mr-3">🏆</Text>
        <Text className="font-medium text-[#3D2B2B]">I have a competition / event</Text>
      </TouchableOpacity>

      {hasCompetition && (
        <View className="gap-3 mb-6">
          <TextInput
            className="bg-white border border-[#F4A7B9] rounded-2xl px-4 py-3.5 text-[#3D2B2B]"
            placeholder="Event name (e.g. Powerlifting Meet)"
            placeholderTextColor={Colors.text.muted}
            value={competitionName}
            onChangeText={setCompetitionName}
          />
          <TextInput
            className="bg-white border border-[#F4A7B9] rounded-2xl px-4 py-3.5 text-[#3D2B2B]"
            placeholder="Event date (YYYY-MM-DD)"
            placeholderTextColor={Colors.text.muted}
            value={competitionDate}
            onChangeText={setCompetitionDate}
          />
        </View>
      )}

      <TouchableOpacity
        className="bg-primary rounded-2xl py-4 items-center mb-10"
        onPress={handleNext}
      >
        <Text className="text-white font-bold text-base">Next →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
