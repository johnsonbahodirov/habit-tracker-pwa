import { state, createHabitFromTemplate, createDefaultHabit, getHabitStatus, getTodayKey, normalizeHabit, safeText } from './state.js';
import { t } from './i18n.js';
import { computeDailyScore, computeHeatmap, computeAchievementList, renderTrendChart, computeXPFromState } from './stats.js';
import { showToast } from './notifications.js';

export function renderApp() {
  const title = document.getElementById('pageTitle');
  const dateLabel = document.getElementById('currentDateLabel');
  const today = new Date();

  title.textContent = t('today', state.settings.language || 'en');
  dateLabel.textContent = today.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const theme = state.settings.theme === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : state.settings.theme;

  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.fontSize = String(state.settings.fontSize || 15);
  document.documentElement.style.setProperty('--accent', state.settings.accent || '#7c3aed');

  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === state.currentView);
  });

  document.querySelectorAll('.view').forEach((view) => {
    view.classList.toggle('active', `view-${state.currentView}` === view.id);
  });

  renderTodayPanel();
  renderHabitsPanel();
  renderStatsPanel();
  renderJournalPanel();
  renderSettingsPanel();
  renderSidebarXP();
}

export function renderTodayPanel() {
  const score = computeDailyScore(state.habits || []);
  const ring = document.getElementById('dailyScoreRing');
  ring.style.setProperty('--score', score);
  document.getElementById('dailyScoreValue').textContent = `${score}%`;

  const actionsEl = document.getElementById('todayQuickActions');
  actionsEl.innerHTML = [
    { label: 'Log today', action: 'log-day' },
    { label: 'Journal', action: 'open-journal' },
    { label: 'Template', action: 'template-library' },
    { label: 'Export', action: 'export-json' }
  ].map((item) => `
    <button class="quick-action-btn" type="button" data-action="${item.action}">${item.label}</button>
  `).join('');

  const listEl = document.getElementById('habitListToday');
  if (!state.habits.length) {
    listEl.innerHTML = '<div class="card"><p>No habits yet. Add one to get started.</p></div>';
    return;
  }

  const visibleHabits = state.habits.filter((habit) => !habit.archived);
  listEl.innerHTML = visibleHabits.map((habit) => {
    const status = getHabitStatus(habit, getTodayKey());
    const doneClass = status.completed ? 'done' : '';
    return `
      <article class="habit-card" data-habit-id="${habit.id}">
        <div class="habit-icon" style="background:${habit.color}">${habit.icon}</div>
        <div class="habit-content">
          <div class="habit-top">
            <div class="habit-name">${safeText(habit.name)}</div>
            <div class="completion-badge">${status.percent}%</div>
          </div>
          <div class="habit-meta">${safeText(habit.category)} • ${safeText(habit.type)}</div>
        </div>
        <div class="habit-actions">
          <button class="circle-toggle ${doneClass}" type="button" data-action="toggle-habit" data-habit-id="${habit.id}" aria-label="Toggle ${safeText(habit.name)}"></button>
        </div>
      </article>
    `;
  }).join('');
}

export function renderHabitsPanel() {
  const listEl = document.getElementById('habitListView');
  if (!state.habits.length) {
    listEl.innerHTML = '<div class="card"><p>No habits yet.</p></div>';
    return;
  }

  listEl.innerHTML = state.habits.map((habit) => `
    <article class="habit-card" data-habit-id="${habit.id}">
      <div class="habit-icon" style="background:${habit.color}">${habit.icon}</div>
      <div class="habit-content">
        <div class="habit-top">
          <div class="habit-name">${safeText(habit.name)}</div>
          <div class="completion-badge">${habit.type}</div>
        </div>
        <div class="habit-meta">${safeText(habit.category)} • ${habit.schedule?.kind || 'daily'}</div>
      </div>
      <div class="habit-actions">
        <button class="ghost-btn compact" type="button" data-action="edit-habit" data-habit-id="${habit.id}">Edit</button>
        <button class="ghost-btn compact" type="button" data-action="delete-habit" data-habit-id="${habit.id}">Delete</button>
      </div>
    </article>
  `).join('');
}

export function renderStatsPanel() {
  document.getElementById('currentStreakValue').textContent = '12';
  document.getElementById('bestStreakValue').textContent = '28';
  document.getElementById('completionRateValue').textContent = `${computeDailyScore(state.habits || [])}%`;
  document.getElementById('xpValue').textContent = String(state.settings.xp || 0);

  const heatmap = document.getElementById('heatmapContainer');
  heatmap.innerHTML = computeHeatmap(state.habits || []).map((value) => `
    <div class="heatmap-day level-${value}" title="Completion level ${value}"></div>
  `).join('');

  const achievements = document.getElementById('achievementList');
  achievements.innerHTML = computeAchievementList().map((item) => `
    <div class="achievement-badge ${item.unlocked ? '' : 'locked'}">${item.name}</div>
  `).join('');

  renderTrendChart(document.getElementById('trendChart'));
}

export function renderJournalPanel() {
  const today = getTodayKey();
  const entry = state.journal[today] || {};
  document.getElementById('journalDateInput').value = today;
  document.getElementById('journalMoodSelect').value = entry.mood || 'happy';
  document.getElementById('journalNoteInput').value = entry.note || '';
}

export function renderSettingsPanel() {
  document.getElementById('themeSelect').value = state.settings.theme || 'dark';
  document.getElementById('languageSelect').value = state.settings.language || 'en';
  document.getElementById('accentPicker').value = state.settings.accent || '#7c3aed';
  document.getElementById('fontSizeRange').value = String(state.settings.fontSize || 15);
  document.getElementById('pinInput').value = state.settings.pin || '';

  try {
    const storageInfo = document.getElementById('storageInfo');
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(({ usage, quota }) => {
        const used = Math.round((usage / quota) * 100);
        storageInfo.textContent = `Storage: ${Math.round(usage / 1024 / 1024)} MB / ${Math.round(quota / 1024 / 1024)} MB (${used}%)`;
      });
    } else {
      storageInfo.textContent = 'Storage: browser supports estimate';
    }
  } catch (error) {
    document.getElementById('storageInfo').textContent = 'Storage: unavailable';
  }
}

export function renderSidebarXP() {
  const xp = Number(state.settings.xp || 0);
  const level = Math.max(1, Math.floor(xp / 100) + 1);
  const fill = document.getElementById('xpProgressBar');
  const text = document.getElementById('xpProgressText');
  fill.style.width = `${Math.min(100, ((xp % 100) / 100) * 100)}%`;
  text.textContent = `${xp} / ${level * 100} XP`;
  document.getElementById('levelValueSidebar').textContent = String(level);
}

export function openModal(contentHtml) {
  const root = document.getElementById('modalRoot');
  root.innerHTML = contentHtml;
  root.classList.add('visible');
}

export function closeModal() {
  const root = document.getElementById('modalRoot');
  root.classList.remove('visible');
  root.innerHTML = '';
}

export function renderTemplateLibrary() {
  const templates = [
    { name: 'Sport', icon: '🏃', color: '#22c55e', type: 'yesno' },
    { name: 'Study', icon: '📖', color: '#f59e0b', type: 'counter' },
    { name: 'Health', icon: '🩺', color: '#38bdf8', type: 'numeric' },
    { name: 'Sleep', icon: '🌙', color: '#a78bfa', type: 'timer' },
    { name: 'Finance', icon: '💼', color: '#fb7185', type: 'numeric' }
  ];

  openModal(`
    <div class="modal-card">
      <h3>Habit templates</h3>
      <div class="template-grid">
        ${templates.map((template) => `
          <button class="template-card" type="button" data-action="add-template" data-template-name="${template.name}">
            <div class="habit-icon" style="background:${template.color}">${template.icon}</div>
            <strong>${template.name}</strong>
            <div class="tiny-muted">${template.type}</div>
          </button>
        `).join('')}
      </div>
      <div class="modal-actions">
        <button class="ghost-btn" type="button" data-close="close-modal">Close</button>
      </div>
    </div>
  `);
}

export function attachInitialHandlers() {
  document.body.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    if (action === 'template-library') {
      renderTemplateLibrary();
    }
    if (action === 'open-journal') {
      state.currentView = 'journal';
      renderApp();
    }
    if (action === 'log-day') {
      showToast('Daily log updated');
    }
    if (action === 'export-json') {
      showToast('Preparing export…');
    }
    if (action === 'close-modal' || target.dataset.close === 'close-modal') {
      closeModal();
    }
  });
}
