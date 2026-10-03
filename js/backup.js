import { openDatabase, loadSettings, readAll, saveSettings, writeData, replaceStore, deleteHabitCascade } from './db.js';
import { DEFAULT_SETTINGS, state, habitTemplates, createHabitFromTemplate, getTodayKey, addDays, normalizeHabit, flattenLogs, getHabitStatus, setHabitLog, getLevelFromXP } from './state.js';
import { renderApp, renderTemplateLibrary, openHabitForm, closeModal } from './ui.js';
import { computeDailyScore, computeXP } from './stats.js';
import { showToast, confirmDialog, showConfetti } from './notifications.js';
import { encryptBackup, decryptBackup, downloadBlob, exportProgressCardImage } from './backup.js';

async function initializeDatabase() {
  try {
    await openDatabase();
    const [habits, settings, journal, logs] = await Promise.all([
      readAll('habits'),
      loadSettings(),
      readAll('journal'),
      readAll('logs')
    ]);

    state.settings = { ...DEFAULT_SETTINGS, ...(settings || {}) };
    state.habits = (habits || []).map((habit) => normalizeHabit(habit));
    state.journal = Object.fromEntries((journal || []).map((entry) => [entry.dateKey, entry]));
    state.logs = {};
    (logs || []).forEach((log) => {
      const { habitId, dateKey, ...rest } = log;
      if (!state.logs[habitId]) state.logs[habitId] = {};
      state.logs[habitId][dateKey] = rest;
    });

    if (!state.settings.seeded) {
      if (!state.habits.length) {
        state.habits = habitTemplates.slice(0, 3).map((tp) => createHabitFromTemplate(tp));
      }
      state.settings.seeded = true;
      await saveSettings(state.settings);
    }

    if (navigator.storage && navigator.storage.persist) {
      try { await navigator.storage.persist(); } catch (error) { /* noop */ }
    }
  } catch (error) {
    console.error('Failed to initialize database', error);
    state.habits = habitTemplates.slice(0, 3).map((tp) => createHabitFromTemplate(tp));
    showToast('Using in-memory fallback mode');
  }
}

async function safe(promise) {
  try { return await promise; } catch (error) { console.error(error); showToast('Failed to save data locally'); }
}

async function persistSettings() {
  await safe(saveSettings(state.settings));
}

function buildExport() {
  const { pinHash, seeded, ...settings } = state.settings;
  return { version: 1, settings, habits: state.habits, journal: state.journal, logs: flattenLogs() };
}

async function hashPin(pin) {
  const data = new TextEncoder().encode('habitflow:' + pin);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function setValue(habit, dateKey, value) {
  const before = getHabitStatus(habit, dateKey).completed;
  const nextValue = Math.max(0, Number(value) || 0);
  setHabitLog(habit.id, dateKey, habit.type === 'yesno' ? { completed: nextValue > 0, value: nextValue > 0 ? 1 : 0 } : { value: nextValue });
  await safe(writeData('logs', { id: `${habit.id}-${dateKey}`, habitId: habit.id, dateKey, ...state.logs[habit.id][dateKey] }));
  if (!before && getHabitStatus(habit, dateKey).completed) showConfetti();
  renderApp();
}

async function requireUnlock() {
  if (!state.settings.pinHash) return;
  const root = document.getElementById('modalRoot');
  root.classList.add('visible');
  root.innerHTML = `<div class="modal-card"><h3>PIN</h3><input id="unlockInput" type="password" inputmode="numeric" maxlength="6" autocomplete="off"><div class="tiny-muted" id="unlockMsg"></div><div class="modal-actions"><button class="primary-btn" id="unlockBtn" type="button">OK</button></div></div>`;
  await new Promise((resolve) => {
    const tryUnlock = async () => {
      const pin = document.getElementById('unlockInput').value.trim();
      if ((await hashPin(pin)) === state.settings.pinHash) {
        root.classList.remove('visible'); root.innerHTML = ''; resolve();
      } else {
        document.getElementById('unlockMsg').textContent = 'Wrong PIN';
      }
    };
    document.getElementById('unlockBtn').addEventListener('click', tryUnlock);
    document.getElementById('unlockInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') tryUnlock(); });
  });
}

function attachGlobalUI() {
  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach((button) => {
    button.addEventListener('click', () => {
      state.currentView = button.dataset.view;
      renderApp();
    });
  });

  document.getElementById('addHabitBtn').addEventListener('click', () => openHabitForm());

  document.getElementById('prevDayBtn').addEventListener('click', () => {
    state.selectedDate = addDays(state.selectedDate, -1);
    renderApp();
  });

  document.getElementById('nextDayBtn').addEventListener('click', () => {
    const next = addDays(state.selectedDate, 1);
    if (next <= getTodayKey()) {
      state.selectedDate = next;
      renderApp();
    }
  });

  document.getElementById('themeToggle').addEventListener('click', () => {
    state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
    persistSettings();
    renderApp();
  });

  document.getElementById('quoteRefreshBtn').addEventListener('click', () => {
    const quotes = [
      ['Small actions compound into big results.', 'HabitFlow'],
      ['Discipline is choosing what you want most over what you want now.', 'Abraham Lincoln'],
      ['Consistency creates momentum.', 'HabitFlow'],
      ['Well-being is built one day at a time.', 'HabitFlow']
    ];
    const [quote, author] = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('quoteText').textContent = `“${quote}”`;
    document.getElementById('quoteAuthor').textContent = `— ${author}`;
  });

  document.getElementById('backupBtn').addEventListener('click', () => {
    downloadBlob(`habitflow-backup-${getTodayKey()}.json`, JSON.stringify(buildExport(), null, 2));
    showToast('Backup downloaded');
  });

  document.getElementById('saveJournalBtn').addEventListener('click', async () => {
    const dateKey = document.getElementById('journalDateInput').value || getTodayKey();
    state.journal[dateKey] = {
      dateKey,
      mood: document.getElementById('journalMoodSelect').value,
      note: document.getElementById('journalNoteInput').value.trim()
    };
    await safe(writeData('journal', state.journal[dateKey]));
    showToast('Journal saved');
  });

  document.getElementById('journalDateInput').addEventListener('change', (e) => {
    const entry = state.journal[e.target.value] || {};
    document.getElementById('journalMoodSelect').value = entry.mood || 'happy';
    document.getElementById('journalNoteInput').value = entry.note || '';
  });

  document.getElementById('themeSelect').addEventListener('change', (event) => {
    state.settings.theme = event.target.value;
    persistSettings();
    renderApp();
  });

  document.getElementById('languageSelect').addEventListener('change', (event) => {
    state.settings.language = event.target.value;
    persistSettings();
    renderApp();
  });

  document.getElementById('accentPicker').addEventListener('input', (event) => {
    state.settings.accent = event.target.value;
    document.documentElement.style.setProperty('--accent', event.target.value);
  });
  document.getElementById('accentPicker').addEventListener('change', persistSettings);

  document.getElementById('fontSizeRange').addEventListener('input', (event) => {
    state.settings.fontSize = Number(event.target.value);
    document.documentElement.dataset.fontSize = event.target.value;
  });
  document.getElementById('fontSizeRange').addEventListener('change', persistSettings);

  document.getElementById('lockBtn').addEventListener('click', async () => {
    const pin = document.getElementById('pinInput').value.trim();
    if (!pin) {
      if (state.settings.pinHash) {
        state.settings.pinHash = '';
        await persistSettings();
        showToast('PIN lock disabled');
      }
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) {
      showToast('PIN must be 4–6 digits');
      return;
    }
    state.settings.pinHash = await hashPin(pin);
    await persistSettings();
    document.getElementById('pinInput').value = '';
    showToast('PIN lock enabled');
  });

  document.getElementById('resetDataBtn').addEventListener('click', async () => {
    if (!(await confirmDialog('Reset all data', 'This will clear habits, journal, and progress from this device. Continue?'))) return;
    state.habits = [];
    state.logs = {};
    state.journal = {};
    state.settings = { ...DEFAULT_SETTINGS, seeded: true };
    await safe(Promise.all([
      replaceStore('habits', []),
      replaceStore('logs', []),
      replaceStore('journal', [])
    ]));
    await persistSettings();
    renderApp();
    showToast('All data cleared');
  });

  document.getElementById('exportJsonBtn').addEventListener('click', () => {
    downloadBlob(`habitflow-export-${getTodayKey()}.json`, JSON.stringify(buildExport(), null, 2));
    showToast('JSON export created');
  });

  document.getElementById('importJsonInput').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      let parsed = JSON.parse(await file.text());
      if (parsed.salt && parsed.iv && parsed.data) {
        const password = window.prompt('Backup password');
        if (!password) return;
        parsed = await decryptBackup(JSON.stringify(parsed), password);
      }
      if (!Array.isArray(parsed.habits)) throw new Error('Invalid backup format');
      if (!(await confirmDialog('Import', 'This replaces your current data. Continue?'))) return;
      state.habits = parsed.habits.map(normalizeHabit);
      state.journal = {};
      Object.values(parsed.journal || {}).forEach((entry) => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(entry?.dateKey)) {
          state.journal[entry.dateKey] = { dateKey: entry.dateKey, mood: String(entry.mood || 'happy'), note: String(entry.note || '') };
        }
      });
      state.logs = {};
      (parsed.logs || []).forEach((log) => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(log?.dateKey) && state.habits.some((h) => h.id === log.habitId)) {
          if (!state.logs[log.habitId]) state.logs[log.habitId] = {};
          state.logs[log.habitId][log.dateKey] = { completed: Boolean(log.completed), value: Number(log.value) || 0 };
        }
      });
      await Promise.all([
        replaceStore('habits', state.habits),
        replaceStore('logs', flattenLogs()),
        replaceStore('journal', Object.values(state.journal))
      ]);
      renderApp();
      showToast('Import completed');
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Backup import failed');
    } finally {
      event.target.value = '';
    }
  });

  document.getElementById('encryptBackupBtn').addEventListener('click', async () => {
    const password = window.prompt('Enter a password to encrypt the backup');
    if (!password) return;
    const blob = await encryptBackup(buildExport(), password);
    downloadBlob(`habitflow-encrypted-${getTodayKey()}.json`, blob);
    showToast('Encrypted backup saved');
  });

  document.getElementById('shareCardBtn').addEventListener('click', () => {
    const xp = computeXP();
    exportProgressCardImage({
      level: getLevelFromXP(xp),
      xp,
      todayScore: computeDailyScore(getTodayKey()),
      streak: Math.max(0, ...state.habits.map((h) => (state.logs[h.id] ? Object.keys(state.logs[h.id]).length : 0)))
    });
    showToast('Progress image downloaded');
  });

  document.getElementById('templateLibraryBtn').addEventListener('click', () => renderTemplateLibrary());

  document.body.addEventListener('click', async (event) => {
    const closeBtn = event.target.closest('[data-close="close-modal"]');
    if (closeBtn) { closeModal(); return; }

    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;
    const habitId = actionEl.dataset.habitId;
    const habit = habitId ? state.habits.find((h) => h.id === habitId) : null;
    const dateKey = state.selectedDate;

    switch (action) {
      case 'toggle-habit':
        if (habit) await setValue(habit, dateKey, getHabitStatus(habit, dateKey).completed ? 0 : 1);
        break;
      case 'inc':
        if (habit) await setValue(habit, dateKey, getHabitStatus(habit, dateKey).value + 1);
        break;
      case 'dec':
        if (habit) await setValue(habit, dateKey, getHabitStatus(habit, dateKey).value - 1);
        break;
      case 'edit-habit':
        if (habit) openHabitForm(habit);
        break;
      case 'delete-habit': {
        if (!habit) break;
        if (!(await confirmDialog('Delete habit', `Delete "${habit.name}" and its history?`))) break;
        state.habits = state.habits.filter((h) => h.id !== habit.id);
        delete state.logs[habit.id];
        await safe(deleteHabitCascade(habit.id));
        renderApp();
        break;
      }
      case 'save-habit': {
        const name = document.getElementById('hfName').value.trim();
        if (!name) { showToast('Name is required'); break; }
        const kind = document.getElementById('hfKind').value;
        const days = [...document.querySelectorAll('.hfDay:checked')].map((i) => Number(i.value));
        const schedule = kind === 'weekdays' ? { kind, weekdays: days.length ? days : [1, 2, 3, 4, 5] } : kind === 'everyN' ? { kind, every: Math.max(1, Number(document.getElementById('hfEvery').value) || 1) } : { kind: 'daily' };
        const type = document.getElementById('hfType').value;
        const existing = state.habits.find((h) => h.id === habitId) || null;
        const saved = normalizeHabit({
          ...(existing || {}),
          id: habitId || undefined,
          name,
          schedule,
          type,
          icon: document.getElementById('hfIcon').value || '✨',
          color: document.getElementById('hfColor').value,
          targetValue: type === 'yesno' ? 1 : Number(document.getElementById('hfTarget').value) || 1
        });
        if (existing) Object.assign(existing, saved); else state.habits.push(saved);
        await safe(writeData('habits', saved));
        closeModal();
        renderApp();
        break;
      }
      case 'add-template': {
        const tp = habitTemplates.find((x) => x.name === actionEl.dataset.templateName);
        if (!tp) break;
        const next = createHabitFromTemplate(tp);
        state.habits.push(next);
        await safe(writeData('habits', next));
        closeModal();
        renderApp();
        showToast(`${tp.name} added`);
        break;
      }
      case 'template-library': renderTemplateLibrary(); break;
      case 'open-journal': state.currentView = 'journal'; renderApp(); break;
      case 'export-json': document.getElementById('exportJsonBtn').click(); break;
    }
  });

  document.body.addEventListener('change', async (event) => {
    const input = event.target.closest('[data-set-value]');
    if (!input) return;
    const habit = state.habits.find((h) => h.id === input.dataset.habitId);
    if (habit) await setValue(habit, state.selectedDate, Number(input.value));
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('./sw.js');
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (worker) {
            worker.addEventListener('statechange', () => {
              if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                showToast('New version ready — refresh to update');
              }
            });
          }
        });
      } catch (error) {
        console.error('SW registration failed', error);
      }
    });
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    window.installPromptEvent = event;
    showToast('App can be installed');
  });

  document.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.target.closest('input, textarea, select, [contenteditable]')) return;
    if (document.getElementById('modalRoot').classList.contains('visible')) return;
    const k = event.key.toLowerCase();
    if (k === 'n') openHabitForm();
    if (k === 'j') { state.currentView = 'journal'; renderApp(); }
    if (k === 't') { state.currentView = 'today'; state.selectedDate = getTodayKey(); renderApp(); }
    if (event.key === '?') showToast('Shortcuts: N add, T today, J journal');
  });
}

async function initialize() {
  await initializeDatabase();
  await requireUnlock();
  attachGlobalUI();
  renderApp();
}

window.addEventListener('DOMContentLoaded', initialize);
