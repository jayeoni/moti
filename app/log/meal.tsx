import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { detectAllergens } from '../../lib/ai/nutrition';
import { todayString } from '../../lib/utils/dateUtils';
import { AllergyRule, MealType } from '../../types';
import { Colors } from '../../constants/colors';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_EMOJIS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

export default function MealLogScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [mealName, setMealName] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [calories, setCalories] = useState('');
  const [isEatingOut, setIsEatingOut] = useState(false);
  const [allergyRules, setAllergyRules] = useState<AllergyRule[]>([]);
  const [allergenFlags, setAllergenFlags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('allergy_rules')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => setAllergyRules((data ?? []) as AllergyRule[]));
  }, [user]);

  // Real-time allergen detection
  useEffect(() => {
    const flags = detectAllergens(ingredients, allergyRules);
    setAllergenFlags(flags);
  }, [ingredients, allergyRules]);

  function addIngredient() {
    const trimmed = ingredientInput.trim();
    if (!trimmed || ingredients.includes(trimmed)) {
      setIngredientInput('');
      return;
    }
    setIngredients([...ingredients, trimmed]);
    setIngredientInput('');
  }

  function removeIngredient(name: string) {
    setIngredients(ingredients.filter((i) => i !== name));
  }

  async function handleSave() {
    if (!mealName.trim()) {
      Alert.alert('Meal name required', 'Please enter what you ate.');
      return;
    }

    const hardBlockFlags = allergenFlags.filter((f) =>
      allergyRules.some((r) => r.allergen_name.toLowerCase() === f && r.severity === 'hard_block')
    );

    if (hardBlockFlags.length > 0) {
      Alert.alert(
        '⚠️ Hard block allergen detected',
        `${hardBlockFlags.join(', ')} is on your hard block list. Are you sure you ate this?`,
        [
          { text: 'Edit meal', style: 'cancel' },
          { text: 'Log anyway', style: 'destructive', onPress: () => doSave() },
        ]
      );
      return;
    }

    doSave();
  }

  async function doSave() {
    if (!user) return;
    setSaving(true);
    const today = todayString();

    const { error } = await supabase.from('meal_logs').insert({
      user_id: user.id,
      meal_name: mealName.trim(),
      meal_type: mealType,
      ingredients,
      estimated_calories: parseInt(calories) || null,
      is_eating_out: isEatingOut,
      allergen_flags: allergenFlags,
      date: today,
      logged_at: new Date().toISOString(),
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.back();
    }
    setSaving(false);
  }

  const hardBlockViolations = allergenFlags.filter((f) =>
    allergyRules.some((r) => r.allergen_name.toLowerCase() === f && r.severity === 'hard_block')
  );
  const warningViolations = allergenFlags.filter((f) =>
    allergyRules.some((r) => r.allergen_name.toLowerCase() === f && r.severity === 'warning')
  );

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Text className="text-primary font-semibold">← Back</Text>
      </TouchableOpacity>
      <Text className="text-2xl font-bold text-[#3D2B2B] mb-6">Log a Meal</Text>

      {/* Meal type */}
      <Text className="text-sm font-medium text-[#3D2B2B] mb-2">Meal type</Text>
      <View className="flex-row gap-2 mb-5">
        {MEAL_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setMealType(type)}
            className={`flex-1 items-center py-2.5 rounded-xl border-2 ${mealType === type ? 'border-primary bg-[#FFF0F4]' : 'border-[#EEE] bg-white'}`}
          >
            <Text>{MEAL_EMOJIS[type]}</Text>
            <Text className={`text-xs font-semibold mt-0.5 ${mealType === type ? 'text-primary' : 'text-[#B09898]'}`}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Meal name */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-[#3D2B2B] mb-1.5">What did you eat?</Text>
        <TextInput
          className="bg-white border border-[#F4A7B9] rounded-2xl px-4 py-3 text-[#3D2B2B]"
          placeholder="e.g. Grilled chicken with rice"
          placeholderTextColor={Colors.text.muted}
          value={mealName}
          onChangeText={setMealName}
        />
      </View>

      {/* Ingredients */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-[#3D2B2B] mb-1.5">Ingredients (tap + to add)</Text>
        <View className="flex-row gap-2 mb-2">
          <TextInput
            className="flex-1 bg-white border border-[#F4A7B9] rounded-2xl px-4 py-3 text-[#3D2B2B]"
            placeholder="e.g. chicken, rice, broccoli"
            placeholderTextColor={Colors.text.muted}
            value={ingredientInput}
            onChangeText={setIngredientInput}
            onSubmitEditing={addIngredient}
          />
          <TouchableOpacity className="bg-primary rounded-2xl px-4 items-center justify-center" onPress={addIngredient}>
            <Text className="text-white font-bold text-lg">+</Text>
          </TouchableOpacity>
        </View>

        {ingredients.length > 0 && (
          <View className="flex-row flex-wrap gap-2">
            {ingredients.map((ing) => {
              const isBlocked = hardBlockViolations.includes(ing.toLowerCase());
              const isWarned = warningViolations.includes(ing.toLowerCase());
              return (
                <TouchableOpacity
                  key={ing}
                  onPress={() => removeIngredient(ing)}
                  className={`flex-row items-center rounded-xl px-3 py-1.5 ${isBlocked ? 'bg-[#FFF0F0] border border-error' : isWarned ? 'bg-[#FFF8E0] border border-warning' : 'bg-[#F0F0F0]'}`}
                >
                  <Text className={`text-sm ${isBlocked ? 'text-error' : isWarned ? 'text-warning' : 'text-[#3D2B2B]'}`}>
                    {ing}
                  </Text>
                  <Text className="text-xs ml-1.5 text-[#B09898]">×</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Allergen warnings */}
      {hardBlockViolations.length > 0 && (
        <View className="bg-[#FFF0F0] border border-error rounded-2xl p-4 mb-4">
          <Text className="font-bold text-error mb-1">🚨 Hard Block Allergen!</Text>
          <Text className="text-sm text-[#3D2B2B]">
            {hardBlockViolations.join(', ')} {hardBlockViolations.length === 1 ? 'is' : 'are'} on your hard block list. This is a strict rule you set for yourself.
          </Text>
        </View>
      )}

      {warningViolations.length > 0 && !hardBlockViolations.length && (
        <View className="bg-[#FFF8E0] border border-warning rounded-2xl p-4 mb-4">
          <Text className="font-bold text-warning mb-1">⚠️ Watch-list item</Text>
          <Text className="text-sm text-[#3D2B2B]">
            {warningViolations.join(', ')} {warningViolations.length === 1 ? 'is' : 'are'} on your watch list.
          </Text>
        </View>
      )}

      {/* Calories */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-[#3D2B2B] mb-1.5">Estimated calories (optional)</Text>
        <TextInput
          className="bg-white border border-[#F4A7B9] rounded-2xl px-4 py-3 text-[#3D2B2B]"
          placeholder="e.g. 450"
          placeholderTextColor={Colors.text.muted}
          keyboardType="number-pad"
          value={calories}
          onChangeText={setCalories}
        />
      </View>

      {/* Eating out */}
      <TouchableOpacity
        onPress={() => setIsEatingOut(!isEatingOut)}
        className={`flex-row items-center rounded-2xl p-4 mb-6 border-2 ${isEatingOut ? 'border-accent bg-[#FFF8F0]' : 'border-[#EEE] bg-white'}`}
      >
        <Text className="text-xl mr-3">🍱</Text>
        <Text className="font-medium text-[#3D2B2B]">Eating out</Text>
        {isEatingOut && <Text className="ml-auto text-secondary font-semibold text-sm">✓</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-primary rounded-2xl py-4 items-center mb-10"
        onPress={handleSave}
        disabled={saving}
        style={{ opacity: saving ? 0.7 : 1 }}
      >
        <Text className="text-white font-bold text-base">{saving ? 'Saving...' : 'Save Meal ✓'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
