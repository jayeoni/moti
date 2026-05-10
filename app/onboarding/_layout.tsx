import { createContext, useContext, useState } from 'react';
import { Stack } from 'expo-router';
import { OnboardingData, GoalType, MotivationState, AllergenSeverity, IngredientCategory } from '../../types';

const defaultData: OnboardingData = {
  display_name: '',
  goal_type: 'weight_loss',
  deadline_date: '',
  target_weight_kg: 60,
  current_weight_kg: 70,
  height_cm: 165,
  sport_type: 'general',
  training_days_per_week: 4,
  allergens: [],
  motivation_state: 'steady',
  ingredients: [],
  has_competition: false,
  competition_name: '',
  competition_date: '',
};

interface OnboardingContextValue {
  data: OnboardingData;
  update: (partial: Partial<OnboardingData>) => void;
}

export const OnboardingContext = createContext<OnboardingContextValue>({
  data: defaultData,
  update: () => {},
});

export function useOnboarding() {
  return useContext(OnboardingContext);
}

export default function OnboardingLayout() {
  const [data, setData] = useState<OnboardingData>(defaultData);

  function update(partial: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...partial }));
  }

  return (
    <OnboardingContext.Provider value={{ data, update }}>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </OnboardingContext.Provider>
  );
}
