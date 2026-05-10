import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from './_layout';
import { IngredientCategory } from '../../types';
import { Colors } from '../../constants/colors';

const QUICK_INGREDIENTS: { name: string; category: IngredientCategory }[] = [
  { name: 'Chicken breast', category: 'protein' },
  { name: 'Beef', category: 'protein' },
  { name: 'Eggs', category: 'protein' },
  { name: 'Tuna', category: 'protein' },
  { name: 'Rice', category: 'carb' },
  { name: 'Oats', category: 'carb' },
  { name: 'Rice cake', category: 'carb' },
  { name: 'Sweet potato', category: 'carb' },
  { name: 'Broccoli', category: 'vegetable' },
  { name: 'Cabbage', category: 'vegetable' },
  { name: 'Tomato', category: 'vegetable' },
  { name: 'Spinach', category: 'vegetable' },
  { name: 'Fruit', category: 'other' },
  { name: 'Olive oil', category: 'fat' },
  { name: 'Garlic', category: 'condiment' },
];

export default function OnboardingInventory() {
  const { data, update } = useOnboarding();
  const router = useRouter();
  const [selected, setSelected] = useState<Array<{ name: string; category: IngredientCategory }>>(
    data.ingredients
  );
  const [customInput, setCustomInput] = useState('');

  function toggleIngredient(name: string, category: IngredientCategory) {
    const idx = selected.findIndex((i) => i.name === name);
    if (idx >= 0) {
      setSelected(selected.filter((i) => i.name !== name));
    } else {
      setSelected([...selected, { name, category }]);
    }
  }

  function addCustom() {
    const trimmed = customInput.trim();
    if (!trimmed || selected.some((i) => i.name.toLowerCase() === trimmed.toLowerCase())) {
      setCustomInput('');
      return;
    }
    setSelected([...selected, { name: trimmed, category: 'other' }]);
    setCustomInput('');
  }

  function handleNext() {
    update({ ingredients: selected });
    router.push('/onboarding/complete');
  }

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <Text className="text-xs text-[#B09898] mb-6">Step 6 of 7</Text>
      <View className="h-1.5 bg-[#F4E4EA] rounded-full mb-8">
        <View className="h-1.5 bg-primary rounded-full" style={{ width: '84%' }} />
      </View>

      <Text className="text-2xl font-bold text-[#3D2B2B] mb-2">What's in your kitchen?</Text>
      <Text className="text-sm text-[#7A6060] mb-6">
        I'll suggest meals using what you actually have. Tap to select.
      </Text>

      <View className="flex-row flex-wrap gap-2 mb-6">
        {QUICK_INGREDIENTS.map((ing) => {
          const isSelected = selected.some((i) => i.name === ing.name);
          return (
            <TouchableOpacity
              key={ing.name}
              onPress={() => toggleIngredient(ing.name, ing.category)}
              className={`px-3 py-2 rounded-xl border-2 ${isSelected ? 'border-secondary bg-[#E8F5F0]' : 'border-[#F0E0E0] bg-white'}`}
            >
              <Text className={`text-sm font-medium ${isSelected ? 'text-secondary' : 'text-[#7A6060]'}`}>
                {isSelected ? '✓ ' : ''}{ing.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Custom ingredient */}
      <Text className="text-sm font-medium text-[#3D2B2B] mb-2">Add something else</Text>
      <View className="flex-row gap-2 mb-6">
        <TextInput
          className="flex-1 bg-white border border-[#F4A7B9] rounded-2xl px-4 py-3 text-[#3D2B2B]"
          placeholder="e.g. salmon, tofu..."
          placeholderTextColor={Colors.text.muted}
          value={customInput}
          onChangeText={setCustomInput}
          onSubmitEditing={addCustom}
        />
        <TouchableOpacity
          className="bg-primary rounded-2xl px-4 items-center justify-center"
          onPress={addCustom}
        >
          <Text className="text-white font-bold text-lg">+</Text>
        </TouchableOpacity>
      </View>

      {selected.length > 0 && (
        <View className="bg-white rounded-2xl p-4 mb-6">
          <Text className="text-sm font-semibold text-[#3D2B2B] mb-2">
            Selected ({selected.length} items):
          </Text>
          <Text className="text-sm text-[#7A6060]">
            {selected.map((i) => i.name).join(', ')}
          </Text>
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
