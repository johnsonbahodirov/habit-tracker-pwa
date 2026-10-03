export const DEFAULT_SETTINGS = {
  theme: 'dark',
  language: 'en',
  accent: '#7c3aed',
  fontSize: 15,
  weekStart: 1,
  timeFormat: '24h',
  pin: '',
  xp: 0,
  level: 1,
  currentDate: getTodayKey()
};

export const habitTemplates = [
  {
    name: 'Workout',
    type: 'yesno',
    icon: '🏋️',
    color: '#22c55e',
    category: 'Sport',
    schedule: { kind: 'weekdays', weekdays: [1, 3, 5] },
    notes: 'Stay active and strong.'
  },
  {
    name: 'Reading',
    type: 'counter',
    icon: '📚',
    color: '#f59e0b',
    category: 'Study',
    schedule: { kind: 'daily' },
    targetValue: 20,
    notes: 'Read a few pages or a chapter.'
  },
  {
    name: 'Hydration',
    type: 'numeric',
    icon: '💧',
    color: '#38bdf8',
    category: 'Health',
    schedule: { kind: 'daily' },
    targetValue: 2,
    notes: 'Track water intake in liters.'
  },
  {
    name: 'Sleep',
    type: 'timer',
    icon: '😴',
    color: '#a78bfa',
    category: 'Health',
    schedule: { kind: 'daily' },
    targetValue: 8,
    notes: 'Sleep duration in hours.'
  },
  {
    name: 'Budget',
    type: 'numeric',
    icon: '💰',
    color: '#f97316',
    category: 'Finance',
    schedule: { kind: 'weekly', timesPerWeek: 3 },
    targetValue: 200,
    notes: 'Track savings and spending.'
  }
];

export const state = {
  settings: { ...DEFAULT_SETTINGS },
  habits: [],
  journal: {},
  logs: {},
  currentView: 'today',
  selectedDate: getTodayKey(),
  appVersion: '1.0.0'
};

export function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return getTodayKey(date);
}

export function normalizeHabit(rawHabit = {}) {
  return {
    id: rawHabit.id || crypto.randomUUID(),
    name: rawHabit.name || 'New habit',
    type: rawHabit.type || 'yesno',
    icon: rawHabit.icon || '✨',
    color: rawHabit.color || '#7c3aed',
    category: rawHabit.category || 'General',
    tags: Array.isArray(rawHabit.tags) ? rawHabit.tags : [],
    notes: rawHabit.notes || '',
    schedule: rawHabit.schedule || { kind: 'daily' },
    targetValue: rawHabit.targetValue || 1,
    startDate: rawHabit.startDate || getTodayKey(),
    pinned: Boolean(rawHabit.pinned),
    archived: Boolean(rawHabit.archived),
    paused: Boolean(rawHabit.paused),
    reminders: Array.isArray(rawHabit.reminders) ? rawHabit.reminders : [],
    createdAt: rawHabit.createdAt || new Date().toISOString()
  };
}

export function createDefaultHabit() {
  return normalizeHabit({
    id: crypto.randomUUID(),
    name: 'New habit',
    type: 'yesno',
    icon: '✨',
    color: '#7c3aed',
    category: 'General',
    tags: ['general'],
    notes: '',
    schedule: { kind: 'daily' },
    targetValue: 1,
    startDate: getTodayKey(),
    pinned: false,
    archived: false,
    paused: false,
    reminders: []
  });
}

export function createHabitFromTemplate(template) {
  return normalizeHabit({
    id: crypto.randomUUID(),
    name: template.name,
    type: template.type,
    icon: template.icon,
    color: template.color,
    category: template.category,
    tags: [template.category.toLowerCase()],
    notes: template.notes,
    schedule: template.schedule,
    targetValue: template.targetValue || 1,
    startDate: getTodayKey(),
    pinned: false,
    archived: false,
    paused: false,
    reminders: [],
    createdAt: new Date().toISOString()
  });
}

export function getHabitLog(habitId, dateKey) {
  return state.logs[habitId]?.[dateKey] || null;
}

export function setHabitLog(habitId, dateKey, logEntry) {
  if (!state.logs[habitId]) {
    state.logs[habitId] = {};
  }
  state.logs[habitId][dateKey] = { ...logEntry, habitId, dateKey };
}

export function getHabitStatus(habit, dateKey = getTodayKey()) {
  const log = getHabitLog(habit.id, dateKey);
  if (!log) {
    return { completed: false, value: 0, percent: 0 };
  }

  if (habit.type === 'yesno') {
    return {
      completed: Boolean(log.completed),
      value: Number(log.value || 0),
      percent: log.completed ? 100 : 0
    };
  }

  if (habit.type === 'counter' || habit.type === 'numeric' || habit.type === 'timer') {
    const target = Number(habit.targetValue || 1);
    const value = Number(log.value || 0);
    return {
      completed: value >= target,
      value,
      percent: Math.min(100, Math.round((value / target) * 100))
    };
  }

  if (habit.type === 'checklist') {
    const items = Array.isArray(log.items) ? log.items : [];
    const done = items.filter(Boolean).length;
    return {
      completed: done >= items.length && items.length > 0,
      value: done,
      percent: items.length ? Math.round((done / items.length) * 100) : 0
    };
  }

  return { completed: Boolean(log.completed), value: Number(log.value || 0), percent: 0 };
}

export function flattenLogs() {
  const result = [];
  Object.entries(state.logs).forEach(([habitId, dates]) => {
    Object.entries(dates).forEach(([dateKey, log]) => {
      result.push({ id: `${habitId}-${dateKey}`, habitId, dateKey, ...log });
    });
  });
  return result;
}

export function safeText(value) {
  return String(value ?? '').replace(/[<>]/g, '');
}

export function calculateXP(habitCount = 0, completionRate = 0) {
  return Math.max(0, Math.round(habitCount * 8 + completionRate * 4));
}

export function getLevelFromXP(xp) {
  return 1 + Math.floor(xp / 100);
}
