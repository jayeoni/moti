import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingWelcome() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-cream items-center justify-center px-6">
      <Text className="text-7xl mb-6">🌸</Text>
      <Text className="text-3xl font-bold text-[#3D2B2B] text-center mb-3">
        Welcome to MotiCutie!
      </Text>
      <Text className="text-base text-[#7A6060] text-center mb-4 leading-6">
        Your AI companion for real-life body goals under imperfect motivation. Let's build a plan that actually works for you.
      </Text>

      <View className="bg-white rounded-3xl p-5 w-full mb-8 shadow-sm">
        <Text className="text-sm font-semibold text-[#3D2B2B] mb-3">You'll set up:</Text>
        {[
          '🎯  Your goal & deadline',
          '💪  Your current body status',
          '🥗  Your diet rules & allergens',
          '🏠  What food you have at home',
          '💭  Your current motivation level',
        ].map((item) => (
          <Text key={item} className="text-sm text-[#7A6060] mb-1.5">{item}</Text>
        ))}
      </View>

      <TouchableOpacity
        className="bg-primary rounded-2xl py-4 w-full items-center"
        onPress={() => router.push('/onboarding/goal')}
      >
        <Text className="text-white font-bold text-base">Let's Get Started →</Text>
      </TouchableOpacity>
    </View>
  );
}
