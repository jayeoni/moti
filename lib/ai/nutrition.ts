import { MEAL_TEMPLATES } from '../../constants/meals';
import {
  AllergyRule,
  CarbLevel,
  IngredientItem,
  MealSuggestion,
  MealType,
  NutritionInput,
  NutritionOutput,
  Phase,
  TrainingType,
} from '../../types';

function getHardBlockedNames(rules: AllergyRule[]): string[] {
  return rules
    .filter((r) => r.severity === 'hard_block')
    .map((r) => r.allergen_name.toLowerCase());
}

function getWarnedNames(rules: AllergyRule[]): string[] {
  return rules
    .filter((r) => r.severity === 'warning')
    .map((r) => r.allergen_name.toLowerCase());
}

function ingredientContainsAllergen(
  ingredient: string,
  allergens: string[]
): boolean {
  return allergens.some((a) => ingredient.toLowerCase().includes(a));
}

function carbLevelForDay(trainingType: TrainingType): CarbLevel {
  if (trainingType === 'heavy') return 'high';
  if (trainingType === 'rest') return 'low';
  return 'moderate';
}

function phaseCalorieMultiplier(phase: Phase): number {
  return { competition_ready: 0.85, sharpen: 0.9, build: 1.0, restart: 1.05 }[phase];
}

export function detectAllergens(
  ingredients: string[],
  rules: AllergyRule[]
): string[] {
  const flags: string[] = [];
  const hardBlocked = getHardBlockedNames(rules);
  for (const ingredient of ingredients) {
    if (ingredientContainsAllergen(ingredient, hardBlocked)) {
      const matched = hardBlocked.find((a) =>
        ingredient.toLowerCase().includes(a)
      );
      if (matched && !flags.includes(matched)) flags.push(matched);
    }
  }
  return flags;
}

export function suggestMeals(input: NutritionInput): NutritionOutput {
  const hardBlocked = getHardBlockedNames(input.allergy_rules);
  const warned = getWarnedNames(input.allergy_rules);
  const carbLevel = carbLevelForDay(input.training_type_today);
  const calorieMultiplier = phaseCalorieMultiplier(input.phase);

  const availableIngredients = input.ingredient_inventory
    .filter((i) => i.is_available)
    .filter((i) => !ingredientContainsAllergen(i.ingredient_name, hardBlocked));

  const blockedInInventory = input.ingredient_inventory
    .filter((i) => ingredientContainsAllergen(i.ingredient_name, hardBlocked))
    .map((i) => i.ingredient_name);

  const availableNames = availableIngredients.map((i) =>
    i.ingredient_name.toLowerCase()
  );

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  const suggestions: MealSuggestion[] = [];

  for (const mealType of mealTypes) {
    const candidates = MEAL_TEMPLATES.filter(
      (t) =>
        t.meal_type === mealType &&
        t.phase_suitable.includes(input.phase) &&
        (carbLevel === 'high'
          ? t.carb_level !== 'low'
          : carbLevel === 'low'
          ? t.carb_level !== 'high'
          : true) &&
        !t.allergens.some((a) => hardBlocked.includes(a.toLowerCase()))
    );

    if (candidates.length === 0) continue;

    const scored = candidates.map((t) => {
      const requiredMet = t.required_ingredients.filter((r) =>
        availableNames.some((a) => a.includes(r.toLowerCase()))
      ).length;
      return { template: t, score: requiredMet / t.required_ingredients.length };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0].template;

    suggestions.push({
      meal_type: mealType,
      suggestion_name: best.name,
      ingredients_needed: best.required_ingredients,
      estimated_calories: Math.round(best.estimated_calories * calorieMultiplier),
      is_feasible_from_inventory: scored[0].score >= 0.5,
    });
  }

  const hasFlourRule = hardBlocked.some(
    (a) => a === 'flour' || a === 'gluten'
  );

  return {
    meal_suggestions: suggestions,
    blocked_ingredients: blockedInInventory,
    warned_ingredients: warned,
    flour_free_status: hasFlourRule,
    carb_level: carbLevel,
  };
}
