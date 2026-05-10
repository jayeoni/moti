import { AdherenceInput, AdherenceOutput, DayLogs, MotivationState } from '../../types';

const LOW_MESSAGES = [
  "Hey, you showed up. That counts for everything today.",
  "Bad days are part of the process. Tomorrow is a fresh start.",
  "Three small things. Just those three. You've got this.",
  "Low energy is not failure — it's information. Be gentle with yourself.",
];

const MEDIUM_MESSAGES = [
  "You're building something real. Keep going.",
  "Progress isn't always visible, but it's happening. Trust the process.",
  "Solid day. Every consistent day is a win.",
];

const HIGH_MESSAGES = [
  "You're on fire! Consistency is your actual superpower.",
  "Look at you go! This is exactly how real change happens.",
  "Incredible effort. This is what separates people who achieve goals.",
];

function pickMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

function scoreDay(logs: DayLogs): number {
  let s = 0;
  if (logs.meal_logged) s += 25;
  if (logs.workout_logged) s += 25;
  if (logs.weight_logged) s += 25;
  if (logs.checkin_completed) s += 25;
  return s;
}

function countStreak(days: DayLogs[], minScore = 50): number {
  let streak = 0;
  for (const day of [...days].reverse()) {
    if (scoreDay(day) >= minScore) streak++;
    else break;
  }
  return streak;
}

function countFlourFreeStreak(days: DayLogs[]): number {
  let streak = 0;
  for (const day of [...days].reverse()) {
    if (day.flour_free) streak++;
    else break;
  }
  return streak;
}

export function calculateAdherence(input: AdherenceInput): AdherenceOutput {
  const todayScore = scoreDay(input.logs_today);

  const isLowWillpower =
    todayScore < 40 ||
    input.mood_checkin?.motivation_state === 'struggling' ||
    input.mood_checkin?.motivation_state === 'burnt_out';

  let recoveryMessage: string;
  if (todayScore < 40) {
    recoveryMessage = pickMessage(LOW_MESSAGES);
  } else if (todayScore < 75) {
    recoveryMessage = pickMessage(MEDIUM_MESSAGES);
  } else {
    recoveryMessage = pickMessage(HIGH_MESSAGES);
  }

  const allDays = [...input.logs_last_7_days, input.logs_today];
  const streak = countStreak(allDays);
  const flourFreeStreak = countFlourFreeStreak(allDays);

  return {
    score: todayScore,
    low_willpower_mode: isLowWillpower,
    recovery_message: recoveryMessage,
    current_streak: streak,
    flour_free_streak: flourFreeStreak,
  };
}
