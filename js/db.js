import { state, getHabitStatus, getTodayKey, addDays, isScheduled, getStreaks } from './state.js';

export function dayScore(dateKey) {
  const list = state.habits.filter((h) => isScheduled(h, dateKey));
  if (!list.length) return null;
  return Math.round(list.reduce((a, h) => a + getHabitStatus(h, dateKey).percent, 0) / list.length);
}

export function computeDailyScore(dateKey = getTodayKey()) {
  return dayScore(dateKey) ?? 0;
}

export function computeCompletionRate(days = 30) {
  const today = getTodayKey();
  const scores = [];
  for (let i = 0; i < days; i++) {
    const v = dayScore(addDays(today, -i));
    if (v !== null) scores.push(v);
  }
  return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
}

export function computeHeatmap(days = 28) {
  const today = getTodayKey();
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const dateKey = addDays(today, -i);
    const s = dayScore(dateKey);
    out.push({ dateKey, level: s === null ? 0 : Math.min(4, Math.ceil(s / 25)) });
  }
  return out;
}

export function computeXP() {
  let n = 0;
  for (const h of state.habits) {
    for (const k in (state.logs[h.id] || {})) {
      if (getHabitStatus(h, k).completed) n += 1;
    }
  }
  return n * 10;
}

export function computeAchievementList() {
  const best = Math.max(0, ...state.habits.map((h) => getStreaks(h).best));
  const today = getTodayKey();
  const perfectWeek = Array.from({ length: 7 }, (_, i) => dayScore(addDays(today, -i))).every((s) => s === 100);
  return [7, 30, 100, 365].map((n) => ({ name: `${n}-day streak`, unlocked: best >= n }))
    .concat({ name: 'Perfect week', unlocked: perfectWeek });
}

export function renderTrendChart(element, days = 14) {
  const today = getTodayKey();
  const w = 640, h = 220, pad = 15;
  const data = Array.from({ length: days }, (_, i) => dayScore(addDays(today, i - days + 1)) ?? 0);
  const points = data.map((v, i) => [(i / (days - 1)) * w, h - pad - (v / 100) * (h - 2 * pad)]);
  element.innerHTML = `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Last ${days} days completion" width="100%" height="220">
    <polyline points="${points.map((p) => p.join(',')).join(' ')}" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    ${points.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="var(--accent)"/>`).join('')}
  </svg>`;
}
