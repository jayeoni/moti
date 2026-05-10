import {
  AllergyRule,
  SafetyInput,
  SafetyOutput,
  SafetyWarning,
} from '../../types';

function checkCalories(calories: number | null): SafetyWarning[] {
  if (calories === null) return [];
  if (calories < 700) {
    return [
      {
        type: 'low_calories',
        message:
          "Today's calories look critically low. Please eat something — your body needs fuel to function.",
        severity: 'critical',
      },
    ];
  }
  if (calories < 1000) {
    return [
      {
        type: 'low_calories',
        message:
          "Today's calorie intake looks very low. Make sure you're fueling your workouts and recovery.",
        severity: 'warning',
      },
    ];
  }
  return [];
}

function checkWeightLoss(trend: number[]): SafetyWarning[] {
  if (trend.length < 7) return [];
  const recent = trend[trend.length - 1];
  const weekAgo = trend[trend.length - 7];
  const weeklyLoss = weekAgo - recent;
  if (weeklyLoss > 2.5) {
    return [
      {
        type: 'rapid_weight_loss',
        message: `You've lost ${weeklyLoss.toFixed(1)} kg this week — that's faster than is safe. Add a refeed meal today.`,
        severity: 'critical',
      },
    ];
  }
  if (weeklyLoss > 1.5) {
    return [
      {
        type: 'rapid_weight_loss',
        message: `You've lost ${weeklyLoss.toFixed(1)} kg this week, which is above the recommended pace. Consider adding a small snack.`,
        severity: 'warning',
      },
    ];
  }
  return [];
}

function checkAllergens(
  flags: string[],
  rules: AllergyRule[]
): SafetyWarning[] {
  const warnings: SafetyWarning[] = [];
  for (const flag of flags) {
    const rule = rules.find((r) =>
      flag.toLowerCase().includes(r.allergen_name.toLowerCase())
    );
    if (!rule) continue;
    if (rule.severity === 'hard_block') {
      warnings.push({
        type: 'allergen_detected',
        message: `${rule.allergen_name} detected in your meal log — this is on your hard block list! Review what you logged.`,
        severity: 'critical',
      });
    } else {
      warnings.push({
        type: 'allergen_detected',
        message: `Heads up: ${rule.allergen_name} is on your watch list and appeared in today's log.`,
        severity: 'warning',
      });
    }
  }
  return warnings;
}

export function runSafetyChecks(input: SafetyInput): SafetyOutput {
  const warnings: SafetyWarning[] = [
    ...checkCalories(input.daily_calories),
    ...checkWeightLoss(input.weight_trend),
    ...checkAllergens(input.allergen_flags_today, input.allergy_rules),
  ];

  return {
    warnings,
    is_safe: !warnings.some((w) => w.severity === 'critical'),
  };
}
