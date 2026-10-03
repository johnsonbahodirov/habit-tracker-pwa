import { state, habitTemplates, createDefaultHabit, getHabitStatus, isScheduled, getStreaks, getLevelFromXP, escapeHtml } from './state.js';
import { t, applyI18n } from './i18n.js';
import { computeDailyScore, computeHeatmap, computeAchievementList, renderTrendChart, computeXP, computeCompletionRate } from './stats.js';

export function renderApp() {
  const lang = state.settings.language || 'en';
  document.getElementById('pageTitle').textContent = t(state.currentView, lang);
  document.getElementById('currentDateLabel').textContent = new Date(`${state.selectedDate}T00:00:00`).toLocaleDateString(lang, {
    weekday: 'short', month: 'short', day: 'numeric'
  });

  const theme = state.settings.theme === 'auto' ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : state.settings.theme;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.fontSize = String(state.settings.fontSize || 15);
  document.documentElement.style.setProperty('--accent', state.settings.accent || '#7c3aed');

  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach((b) => {
    b.classList.toggle('active', b.dataset.view === state.currentView);
  });
  document.querySelectorAll('.view').forEach((v) => {
    v.classList.toggle('active', v.id === `view-${state.currentView}`);
  });

  const renderers = {
    today: renderTodayPanel,
    habits: renderHabitsPanel,
    stats: renderStatsPanel,
    journal: renderJournalPanel,
    settings: renderSettingsPanel
  };
  renderers[state.currentView]?.();
  renderSidebarXP();
  applyI18n(lang);
}

function habitControl(habit, status) {
  const id = escapeHtml(habit.id);
  if (habit.type === 'yesno') {
    return `<button class="circle-toggle ${status.completed ? 'done' : ''}" type="button" data-action="toggle-habit" data-habit-id="${id}" aria-pressed="${status.completed}" aria-label="Toggle ${escapeHtml(habit.name)}"></button>`;
  }
  if (habit.type === 'counter') {
    return `<button class="ghost-btn compact" type="button" data-action="dec" data-habit-id="${id}" aria-label="Minus">−</button>
      <span>${status.value}/${habit.targetValue}</span>
      <button class="ghost-btn compact" type="button" data-action="inc" data-habit-id="${id}" aria-label="Plus">+</button>`;
  }
  return `<input class="value-input" type="number" min="0" step="any" value="${status.value}" data-set-value data-habit-id="${id}" aria-label="${escapeHtml(habit.name)}"> / ${habit.targetValue}`;
}

export function renderTodayPanel() {
  const dateKey = state.selectedDate;
  const score = computeDailyScore(dateKey);
  document.getElementById('dailyScoreRing').style.setProperty('--score', score);
  document.getElementById('dailyScoreValue').textContent = `${score}%`;

  document.getElementById('todayQuickActions').innerHTML = [
    { label: 'Journal', action: 'open-journal' },
    { label: 'Templates', action: 'template-library' },
    { label: 'Export', action: 'export-json' }
  ].map((item) => `<button class="quick-action-btn" type="button" data-action="${item.action}">${item.label}</button>`).join('');

  const listEl = document.getElementById('habitListToday');
  const visible = state.habits.filter((h) => isScheduled(h, dateKey));
  if (!visible.length) {
    listEl.innerHTML = `<div class="card"><p>${state.habits.length ? 'Nothing scheduled for this day.' : 'No habits yet. Add one to get started.'}</p></div>`;
    return;
  }

  listEl.innerHTML = visible.map((habit) => {
    const status = getHabitStatus(habit, dateKey);
    return `
      <article class="habit-card">
        <div class="habit-icon" style="background:${escapeHtml(habit.color)}">${escapeHtml(habit.icon)}</div>
        <div class="habit-content">
          <div class="habit-top">
            <div class="habit-name">${escapeHtml(habit.name)}</div>
            <div class="completion-badge">${status.percent}%</div>
          </div>
          <div class="habit-meta">${escapeHtml(habit.category)} • 🔥 ${getStreaks(habit).current}</div>
        </div>
        <div class="habit-actions">${habitControl(habit, status)}</div>
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
    <article class="habit-card" data-habit-id="${escapeHtml(habit.id)}">
      <div class="habit-icon" style="background:${escapeHtml(habit.color)}">${escapeHtml(habit.icon)}</div>
      <div class="habit-content">
        <div class="habit-top">
          <div class="habit-name">${escapeHtml(habit.name)}</div>
          <div class="completion-badge">${escapeHtml(habit.type)}</div>
        </div>
        <div class="habit-meta">${escapeHtml(habit.category)} • ${habit.schedule?.kind || 'daily'}</div>
      </div>
      <div class="habit-actions">
        <button class="ghost-btn compact" type="button" data-action="edit-habit" data-habit-id="${escapeHtml(habit.id)}">Edit</button>
        <button class="ghost-btn compact" type="button" data-action="delete-habit" data-habit-id="${escapeHtml(habit.id)}">Delete</button>
      </div>
    </article>
  `).join('');
}

export function renderStatsPanel() {
  const streaks = state.habits.map(getStreaks);
  const currentBest = Math.max(0, ...streaks.map((s) => s.current));
  const bestBest = Math.max(0, ...streaks.map((s) => s.best));
  document.getElementById('currentStreakValue').textContent = String(currentBest);
  document.getElementById('bestStreakValue').textContent = String(bestBest);
  document.getElementById('completionRateValue').textContent = `${computeCompletionRate(30)}%`;
  document.getElementById('xpValue').textContent = String(computeXP());

  const heatmap = document.getElementById('heatmapContainer');
  heatmap.innerHTML = computeHeatmap(28).map((d) => `<div class="heatmap-day level-${d.level}" title="${d.dateKey}"></div>`).join('');

  const achievements = document.getElementById('achievementList');
  achievements.innerHTML = computeAchievementList().map((item) => `<div class="achievement-badge ${item.unlocked ? '' : 'locked'}">${escapeHtml(item.name)}</div>`).join('');

  renderTrendChart(document.getElementById('trendChart'));
}

export function renderJournalPanel() {
  const today = state.selectedDate;
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
  document.getElementById('pinInput').value = '';

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
  const xp = computeXP();
  const level = getLevelFromXP(xp);
  const fill = document.getElementById('xpProgressBar');
  const text = document.getElementById('xpProgressText');
  fill.style.width = `${Math.min(100, xp % 100)}%`;
  text.textContent = `${xp % 100} / 100 XP`;
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
  openModal(`
    <div class="modal-card">
      <h3>Habit templates</h3>
      <div class="template-grid">
        ${habitTemplates.map((tp) => `
          <button class="template-card" type="button" data-action="add-template" data-template-name="${escapeHtml(tp.name)}">
            <div class="habit-icon" style="background:${escapeHtml(tp.color)}">${escapeHtml(tp.icon)}</div>
            <strong>${escapeHtml(tp.name)}</strong>
            <div class="tiny-muted">${escapeHtml(tp.type)}</div>
          </button>
        `).join('')}
      </div>
      <div class="modal-actions">
        <button class="ghost-btn" type="button" data-close="close-modal">Close</button>
      </div>
    </div>
  `);
}

export function openHabitForm(habit = null) {
  const h = habit || createDefaultHabit();
  const wd = h.schedule?.weekdays || [1, 2, 3, 4, 5];
  const kind = h.schedule?.kind || 'daily';
  openModal(`<div class="modal-card" role="dialog" aria-modal="true"><h3>${habit ? 'Edit habit' : 'New habit'}</h3>
    <div class="journal-form">
      <label><span>Name</span><input id="hfName" maxlength="40" value="${escapeHtml(h.name)}"></label>
      <label><span>Icon</span><input id="hfIcon" maxlength="4" value="${escapeHtml(h.icon)}"></label>
      <label><span>Color</span><input id="hfColor" type="color" value="${escapeHtml(h.color)}"></label>
      <label><span>Type</span><select id="hfType">${['yesno', 'counter', 'numeric', 'timer'].map((x) => `<option value="${x}" ${h.type === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
      <label><span>Target</span><input id="hfTarget" type="number" min="0.1" step="any" value="${h.targetValue}"></label>
      <label><span>Schedule</span><select id="hfKind">${[['daily', 'Every day'], ['weekdays', 'Selected weekdays'], ['everyN', 'Every N days']].map(([v, l]) => `<option value="${v}" ${kind === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label><span>Every N days</span><input id="hfEvery" type="number" min="1" value="${h.schedule?.every || 2}"></label>
      <div style="display:flex;flex-wrap:wrap;gap:.6rem">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((n, i) => `<label style="display:flex;gap:.3rem"><input type="checkbox" class="hfDay" value="${i}" ${wd.includes(i) ? 'checked' : ''}>${n}</label>`).join('')}</div>
    </div>
    <div class="modal-actions">
      <button class="ghost-btn" type="button" data-close="close-modal">Cancel</button>
      <button class="primary-btn" type="button" data-action="save-habit" data-habit-id="${escapeHtml(h.id)}">Save</button>
    </div></div>`);
}
