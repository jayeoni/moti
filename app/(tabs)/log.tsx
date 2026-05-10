import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const LOG_OPTIONS = [
  { route: '/log/weight', emoji: '⚖️', label: 'Log Weight', desc: 'Daily weigh-in', color: '#B5D5C5' },
  { route: '/log/meal', emoji: '🍽️', label: 'Log Meal', desc: 'Breakfast, lunch, dinner, snack', color: '#F4A7B9' },
  { route: '/log/workout', emoji: '💪', label: 'Log Workout', desc: 'Session, exercises, RPE', color: '#FFD6A5' },
  { route: '/log/workout-history', emoji: '📖', label: 'Workout Diary', desc: 'History · edit · delete sessions', color: '#E8D5F5' },
  { route: '/report/weekly', emoji: '📊', label: 'Weekly Report', desc: 'AI insights & adherence', color: '#AEC6E8' },
];

export default function LogScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 20, paddingTop: 56 }}>
      <Text className="text-2xl font-bold text-[#3D2B2B] mb-2">Log & Track</Text>
      <Text className="text-sm text-[#7A6060] mb-6">Every log builds your streak.</Text>

      <View className="gap-4">
        {LOG_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.route}
            onPress={() => router.push(opt.route as any)}
            className="bg-white rounded-3xl p-5 flex-row items-center shadow-sm"
          >
            <View
              style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: opt.color, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}
            >
              <Text style={{ fontSize: 26 }}>{opt.emoji}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-[#3D2B2B] text-base">{opt.label}</Text>
              <Text className="text-xs text-[#7A6060] mt-0.5">{opt.desc}</Text>
            </View>
            <Text className="text-[#B09898]">›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
