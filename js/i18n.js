import { state, getHabitStatus, getTodayKey } from './state.js';

export function computeDailyScore(habits) {
  const today = getTodayKey();
  if (!habits.length) return 0;

  let total = 0;
  habits.forEach((habit) => {
    const status = getHabitStatus(habit, today);
    total += status.percent || 0;
  });
  return Math.round(total / habits.length);
}

export function computeHeatmap(habits) {
  const days = 28;
  const values = [];

  for (let i = 0; i < days; i += 1) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    const dateKey = date.toISOString().slice(0, 10);
    let total = 0;

    habits.forEach((habit) => {
      const log = state.logs[habit.id]?.[dateKey];
      if (log) {
        total += getHabitStatus(habit, dateKey).percent || 0;
      }
    });

    const avg = habits.length ? total / habits.length : 0;
    values.push(Math.min(4, Math.round(avg / 25)));
  }

  return values;
}

export function computeAchievementList() {
  const list = [
    { name: '7-day streak', threshold: 7, unlocked: false },
    { name: '30-day streak', threshold: 30, unlocked: false },
    { name: '100-day streak', threshold: 100, unlocked: false },
    { name: '365-day streak', threshold: 365, unlocked: false },
    { name: 'Perfect week', threshold: 7, unlocked: false }
  ];

  const streaks = Object.values(state.logs).flatMap((entries) => Object.keys(entries));
  const maxStreak = Math.max(streaks.length, 0);
  list[0].unlocked = maxStreak >= 7;
  list[1].unlocked = maxStreak >= 30;
  list[2].unlocked = maxStreak >= 100;
  list[3].unlocked = maxStreak >= 365;
  list[4].unlocked = true;
  return list;
}

export function renderTrendChart(element) {
  const data = Array.from({ length: 9 }, (_, index) => 35 + Math.sin(index / 1.8) * 20 + index * 2.5);
  const width = 640;
  const height = 220;
  const min = Math.min(...data);
  const max = Math.max(...data);

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / (max - min || 1)) * (height - 30) - 15;
    return `${x},${y}`;
  }).join(' ');

  const svg = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Habit trend chart" width="100%" height="220">
      <defs>
        <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="rgba(124, 58, 237, 0.35)" />
          <stop offset="100%" stop-color="rgba(124, 58, 237, 0)" />
        </linearGradient>
      </defs>
      <path d="M 0 ${height} L ${points} L ${width} ${height} Z" fill="url(#trendFill)" opacity="0.9"></path>
      <polyline points="${points}" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
      ${data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / (max - min || 1)) * (height - 30) - 15;
        return `<circle cx="${x}" cy="${y}" r="4" fill="var(--accent)" />`;
      }).join('')}
    </svg>
  `;

  element.innerHTML = svg;
}

export function computeXPFromState(habits) {
  let total = 0;
  habits.forEach((habit) => {
    const key = getTodayKey();
    const todayLog = state.logs[habit.id]?.[key];
    const value = Number(todayLog?.value || 0);
    const target = Number(habit.targetValue || 1);
    total += Math.min(target, Math.round((value / Math.max(target, 1)) * 10));
  });
  return total * 10;
}
