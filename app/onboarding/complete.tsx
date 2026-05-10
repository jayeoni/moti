import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from './_layout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';

export default function OnboardingComplete() {
  const { data } = useOnboarding();
  const { user } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    save();
  }, []);

  async function save() {
    if (!user) return;
    setSaving(true);
    setError(null);

    try {
      // 1. Upsert profile
      const { error: profileError } = await supabase.from('profiles').upsert({
        user_id: user.id,
        display_name: data.display_name,
        goal_type: data.goal_type,
        sport_type: data.sport_type,
        current_weight_kg: data.current_weight_kg,
        target_weight_kg: data.target_weight_kg,
        height_cm: data.height_cm,
        goal_deadline: data.deadline_date,
        motivation_state: data.motivation_state,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      });
      if (profileError) throw profileError;

      // 2. Insert active goal
      const { error: goalError } = await supabase.from('goals').insert({
        user_id: user.id,
        goal_type: data.goal_type,
        target_weight_kg: data.target_weight_kg,
        deadline_date: data.deadline_date,
        current_phase: 'restart',
        is_active: true,
      });
      if (goalError) throw goalError;

      // 3. Insert competition event if applicable
      if (data.has_competition && data.competition_date) {
        await supabase.from('competition_events').insert({
          user_id: user.id,
          event_name: data.competition_name || 'My Competition',
          event_date: data.competition_date,
          event_type: data.sport_type,
        });
      }

      // 4. Insert allergy rules
      if (data.allergens.length > 0) {
        const allergyRows = data.allergens.map((a) => ({
          user_id: user.id,
          allergen_name: a.name,
          severity: a.severity,
          is_trigger_food: a.is_trigger,
        }));
        await supabase.from('allergy_rules').upsert(allergyRows);
      }

      // 5. Insert ingredient inventory
      if (data.ingredients.length > 0) {
        const inventoryRows = data.ingredients.map((i) => ({
          user_id: user.id,
          ingredient_name: i.name,
          category: i.category,
          is_available: true,
        }));
        await supabase.from('ingredient_inventory').upsert(inventoryRows);
      }

      setSaved(true);
    } catch (e: any) {
      setError(e.message ?? 'Failed to save your setup. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (saving) {
    return (
      <View className="flex-1 bg-cream items-center justify-center px-6">
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text className="text-[#7A6060] mt-4 text-base">Setting up your plan...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-cream items-center justify-center px-6">
        <Text className="text-5xl mb-4">😢</Text>
        <Text className="text-xl font-bold text-[#3D2B2B] mb-2">Something went wrong</Text>
        <Text className="text-sm text-[#7A6060] text-center mb-6">{error}</Text>
        <TouchableOpacity className="bg-primary rounded-2xl py-4 px-8" onPress={save}>
          <Text className="text-white font-bold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-cream items-center justify-center px-6">
      <Text className="text-7xl mb-6">🎉</Text>
      <Text className="text-3xl font-bold text-[#3D2B2B] text-center mb-3">
        You're all set, {data.display_name}!
      </Text>
      <Text className="text-base text-[#7A6060] text-center mb-8 leading-6">
        Your personalized plan is ready. Let's go get it!
      </Text>

      <View className="bg-white rounded-3xl p-5 w-full mb-8 shadow-sm">
        <Text className="text-sm text-[#7A6060]">
          Goal: <Text className="font-semibold text-[#3D2B2B]">{data.goal_type.replace('_', ' ')}</Text>
        </Text>
        <Text className="text-sm text-[#7A6060] mt-1">
          Target: <Text className="font-semibold text-[#3D2B2B]">{data.target_weight_kg} kg by {data.deadline_date}</Text>
        </Text>
        {data.allergens.length > 0 && (
          <Text className="text-sm text-[#7A6060] mt-1">
            Avoiding: <Text className="font-semibold text-error">{data.allergens.map((a) => a.name).join(', ')}</Text>
          </Text>
        )}
      </View>

      <TouchableOpacity
        className="bg-primary rounded-2xl py-4 w-full items-center"
        onPress={() => router.replace('/(tabs)')}
      >
        <Text className="text-white font-bold text-base">Start My Journey →</Text>
      </TouchableOpacity>
    </View>
  );
}
