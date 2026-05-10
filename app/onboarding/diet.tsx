import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from './_layout';
import { AllergenSeverity } from '../../types';

const ALLERGENS = [
  { name: 'Flour', desc: 'All flour-based foods', default_severity: 'hard_block' as AllergenSeverity },
  { name: 'Gluten', desc: 'Wheat, barley, rye', default_severity: 'hard_block' as AllergenSeverity },
  { name: 'Dairy', desc: 'Milk, cheese, yogurt', default_severity: 'warning' as AllergenSeverity },
  { name: 'Nuts', desc: 'Tree nuts & peanuts', default_severity: 'hard_block' as AllergenSeverity },
  { name: 'Eggs', desc: 'Eggs and egg products', default_severity: 'warning' as AllergenSeverity },
  { name: 'Soy', desc: 'Soy sauce, tofu, edamame', default_severity: 'warning' as AllergenSeverity },
  { name: 'Shellfish', desc: 'Shrimp, crab, lobster', default_severity: 'hard_block' as AllergenSeverity },
  { name: 'Fish', desc: 'All fish', default_severity: 'hard_block' as AllergenSeverity },
  { name: 'Sugar', desc: 'Added sugars (trigger food)', default_severity: 'warning' as AllergenSeverity },
];

export default function OnboardingDiet() {
  const { data, update } = useOnboarding();
  const router = useRouter();
  const [selected, setSelected] = useState<
    Array<{ name: string; severity: AllergenSeverity; is_trigger: boolean }>
  >(data.allergens);

  function toggleAllergen(name: string, defaultSeverity: AllergenSeverity) {
    const idx = selected.findIndex((a) => a.name === name);
    if (idx >= 0) {
      setSelected(selected.filter((a) => a.name !== name));
    } else {
      setSelected([...selected, { name, severity: defaultSeverity, is_trigger: name === 'Flour' || name === 'Sugar' }]);
    }
  }

  function toggleSeverity(name: string) {
    setSelected(selected.map((a) =>
      a.name === name
        ? { ...a, severity: a.severity === 'hard_block' ? 'warning' : 'hard_block' }
        : a
    ));
  }

  function handleNext() {
    update({ allergens: selected });
    router.push('/onboarding/motivation');
  }

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <Text className="text-xs text-[#B09898] mb-6">Step 4 of 7</Text>
      <View className="h-1.5 bg-[#F4E4EA] rounded-full mb-8">
        <View className="h-1.5 bg-primary rounded-full" style={{ width: '56%' }} />
      </View>

      <Text className="text-2xl font-bold text-[#3D2B2B] mb-2">Diet rules & allergens</Text>
      <Text className="text-sm text-[#7A6060] mb-6">
        Select anything to avoid. Flour & Gluten default to "Hard Block" — the app will never suggest or allow these.
      </Text>

      <View className="gap-3 mb-8">
        {ALLERGENS.map((allergen) => {
          const isSelected = selected.some((a) => a.name === allergen.name);
          const rule = selected.find((a) => a.name === allergen.name);

          return (
            <View key={allergen.name}>
              <TouchableOpacity
                onPress={() => toggleAllergen(allergen.name, allergen.default_severity)}
                className={`flex-row items-center justify-between bg-white rounded-2xl p-4 border-2 ${isSelected ? 'border-error' : 'border-transparent'}`}
                style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
              >
                <View>
                  <Text className="font-semibold text-[#3D2B2B]">{allergen.name}</Text>
                  <Text className="text-xs text-[#7A6060]">{allergen.desc}</Text>
                </View>
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'border-error bg-error' : 'border-[#DDD]'}`}>
                  {isSelected && <Text className="text-white text-xs font-bold">✓</Text>}
                </View>
              </TouchableOpacity>

              {isSelected && rule && (
                <View className="flex-row mt-2 ml-2 gap-2">
                  <TouchableOpacity
                    onPress={() => toggleSeverity(allergen.name)}
                    className={`px-3 py-1.5 rounded-xl ${rule.severity === 'hard_block' ? 'bg-error' : 'bg-[#EEE]'}`}
                  >
                    <Text className={`text-xs font-semibold ${rule.severity === 'hard_block' ? 'text-white' : 'text-[#7A6060]'}`}>
                      Hard Block
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => toggleSeverity(allergen.name)}
                    className={`px-3 py-1.5 rounded-xl ${rule.severity === 'warning' ? 'bg-warning' : 'bg-[#EEE]'}`}
                  >
                    <Text className={`text-xs font-semibold ${rule.severity === 'warning' ? 'text-white' : 'text-[#7A6060]'}`}>
                      Warning Only
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
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
