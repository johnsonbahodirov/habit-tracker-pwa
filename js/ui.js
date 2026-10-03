:root {
  color-scheme: dark;
  --bg: #0b1220;
  --bg-strong: #0f172a;
  --panel: rgba(15, 23, 42, 0.56);
  --panel-strong: rgba(15, 23, 42, 0.78);
  --card: rgba(17, 24, 39, 0.8);
  --card-solid: #111827;
  --text: #e5eefb;
  --muted: #94a3b8;
  --line: rgba(148, 163, 184, 0.2);
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --accent: #7c3aed;
  --shadow: 0 16px 38px rgba(15, 23, 42, 0.28);
  --radius-xl: 24px;
  --radius-lg: 18px;
  --radius-md: 12px;
  --transition: 180ms ease;
}

:root[data-theme='light'] {
  color-scheme: light;
  --bg: #eef4ff;
  --bg-strong: #edf3ff;
  --panel: rgba(255, 255, 255, 0.8);
  --panel-strong: rgba(255, 255, 255, 0.9);
  --card: rgba(255, 255, 255, 0.9);
  --card-solid: #ffffff;
  --text: #122033;
  --muted: #5b6d82;
  --line: rgba(15, 23, 42, 0.08);
  --shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

* { box-sizing: border-box; }
html { font-size: 15px; }
html[data-font-size='14'] { font-size: 14px; }
html[data-font-size='15'] { font-size: 15px; }
html[data-font-size='16'] { font-size: 16px; }
html[data-font-size='17'] { font-size: 17px; }
html[data-font-size='18'] { font-size: 18px; }

body {
  margin: 0;
  min-height: 100vh;
  font-family: Inter, 'Segoe UI', sans-serif;
  background: radial-gradient(circle at top left, rgba(124, 58, 237, 0.18), transparent 30%),
    radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.12), transparent 30%),
    var(--bg);
  color: var(--text);
  transition: background var(--transition), color var(--transition);
}

button, input, select, textarea {
  font: inherit;
}

button {
  cursor: pointer;
  border: 0;
  transition: transform var(--transition), opacity var(--transition), background var(--transition);
}

button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.app-shell {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  max-width: 1500px;
  margin: 0 auto;
  min-height: 100vh;
  gap: 1.2rem;
  padding: 1rem;
}

.sidebar {
  background: var(--panel);
  backdrop-filter: blur(12px);
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: var(--shadow);
}

.main-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.2rem 0.3rem 0.8rem;
}

.logo-badge {
  width: 46px;
  height: 46px;
  color: #fff;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent), #22c55e);
  box-shadow: 0 12px 24px rgba(124, 58, 237, 0.3);
}

.brand-name { font-weight: 800; font-size: 1.08rem; }
.brand-subtitle, .tiny-muted, .eyebrow, .card-label { color: var(--muted); font-size: 0.78rem; }

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item, .mobile-nav-item {
  background: transparent;
  color: var(--text);
  border-radius: 12px;
  padding: 0.9rem 1rem;
  text-align: left;
  font-weight: 600;
  border: 1px solid transparent;
}

.nav-item.active, .mobile-nav-item.active {
  background: rgba(124, 58, 237, 0.14);
  border-color: rgba(124, 58, 237, 0.2);
}

.primary-btn, .ghost-btn, .danger-btn {
  border-radius: 12px;
  padding: 0.8rem 1rem;
  font-weight: 700;
  border: 1px solid var(--line);
}

.primary-btn {
  background: linear-gradient(135deg, var(--accent), #4f46e5);
  color: white;
}

.ghost-btn {
  background: rgba(148, 163, 184, 0.08);
  color: var(--text);
}

.danger-btn {
  background: rgba(239, 68, 68, 0.12);
  color: var(--danger);
}

.wide { width: 100%; }
.compact { padding: 0.55rem 0.8rem; }

.sidebar-card {
  border: 1px solid var(--line);
  background: rgba(148, 163, 184, 0.04);
  border-radius: 16px;
  padding: 0.9rem;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
}

.progress-track {
  height: 10px;
  background: rgba(148, 163, 184, 0.18);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #22c55e);
  border-radius: inherit;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0.2rem;
}

.header-side { min-width: 0; }
.topbar h1 {
  margin: 0.2rem 0 0;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
}

.header-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.view { display: none; }
.view.active { display: block; }

.hero-grid, .stats-grid, .settings-grid {
  display: grid;
  gap: 1rem;
}

.hero-grid { grid-template-columns: 1.1fr 1.2fr; }
.stats-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.settings-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }

.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 1rem 1.1rem;
  box-shadow: var(--shadow);
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.9rem;
}

.card-header-row h3 { margin: 0; font-size: 1.05rem; }

.score-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  min-height: 220px;
}

.score-ring {
  --score: 0;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: conic-gradient(var(--accent) calc(var(--score) * 1%), rgba(148, 163, 184, 0.15) 0);
  display: grid;
  place-items: center;
}

.score-ring-inner {
  width: 98px;
  height: 98px;
  border-radius: 50%;
  background: var(--card-solid);
  display: grid;
  place-items: center;
  font-size: 1.4rem;
  font-weight: 800;
}

.quote-card blockquote {
  margin: 0.6rem 0;
  font-size: 1.05rem;
  line-height: 1.6;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.8rem;
}

.quick-action-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80px;
  border-radius: 14px;
  background: rgba(148, 163, 184, 0.06);
  color: var(--text);
  border: 1px solid var(--line);
}

.habit-list { display: grid; gap: 0.9rem; }

.habit-card {
  background: rgba(148, 163, 184, 0.04);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 0.9rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.8rem;
  align-items: center;
}

.habit-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 1.6rem;
  color: white;
}

.habit-content { min-width: 0; }
.habit-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.8rem;
}
.habit-name { font-weight: 700; }
.habit-meta {
  color: var(--muted);
  font-size: 0.8rem;
  margin-top: 0.28rem;
}

.habit-actions {
  display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
}

.circle-toggle {
  width: 38px; height: 38px; border-radius: 50%; background: transparent; border: 2px solid var(--accent); position: relative; }
.circle-toggle.done { background: linear-gradient(135deg, var(--accent), #22c55e); }
.circle-toggle.done::after {
  content: '✓'; position: absolute; inset: 0; display: grid; place-items: center; color: white; font-size: 0.75rem;
}

.completion-badge {
  display: inline-flex; align-items: center; justify-content: center; min-width: 42px; padding: 0.35rem 0.55rem; border-radius: 999px; background: rgba(255, 255, 255, 0.04); color: var(--muted); font-size: 0.72rem; font-weight: 700;
}

.mini-stat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 120px;
}

.stat-value {
  font-size: clamp(1.5rem, 2vw, 2.1rem);
  font-weight: 800;
  margin-top: 0.4rem;
}

.chart-wrap { min-height: 220px; }

.heatmap-container {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.45rem;
}

.heatmap-day {
  aspect-ratio: 1;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: rgba(148, 163, 184, 0.09);
}

.heatmap-day.level-0 { background: rgba(148, 163, 184, 0.08); }
.heatmap-day.level-1 { background: rgba(16, 185, 129, 0.16); }
.heatmap-day.level-2 { background: rgba(16, 185, 129, 0.34); }
.heatmap-day.level-3 { background: rgba(16, 185, 129, 0.58); }
.heatmap-day.level-4 { background: rgba(16, 185, 129, 0.82); }

.achievement-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.achievement-badge {
  padding: 0.6rem 0.8rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(148, 163, 184, 0.08);
  color: var(--text);
}

.achievement-badge.locked { opacity: 0.45; }

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--line);
}

.setting-row:last-child { border-bottom: 0; }
.setting-row input[type='color'] { width: 50px; height: 36px; border: 0; background: transparent; padding: 0; }
.setting-row input[type='range'] { width: 140px; }
.inline-action { align-items: center; }
.file-input-wrap {
  display: flex; flex-direction: column; gap: 0.45rem; padding: 0.7rem 0;
}
textarea, select, input {
  background: rgba(148, 163, 184, 0.06);
  border: 1px solid var(--line);
  color: var(--text);
  border-radius: 10px;
  padding: 0.72rem 0.8rem;
}
textarea { width: 100%; resize: vertical; }

.journal-form { display: grid; gap: 1rem; }
.journal-form label { display: grid; gap: 0.4rem; }

.mobile-nav {
  display: none;
  position: fixed;
  left: 0.8rem;
  right: 0.8rem;
  bottom: calc(0.8rem + env(safe-area-inset-bottom));
  padding: 0.5rem;
  background: var(--panel-strong);
  backdrop-filter: blur(18px);
  border: 1px solid var(--line);
  border-radius: 18px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.35rem;
  box-shadow: var(--shadow);
}

.mobile-nav-item {
  text-align: center;
  padding: 0.8rem 0.5rem;
  font-size: 0.78rem;
}

.toast-container {
  position: fixed;
  right: 1rem;
  bottom: 5.5rem;
  display: grid;
  gap: 0.7rem;
  z-index: 100;
}

.toast {
  background: rgba(15, 23, 42, 0.9);
  color: white;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--line);
  min-width: 210px;
  box-shadow: var(--shadow);
  animation: slideInUp 180ms ease;
}

@keyframes slideInUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-root {
  position: fixed;
  inset: 0;
  display: none;
  place-items: center;
  background: rgba(2, 6, 23, 0.65);
  z-index: 1000;
}
.modal-root.visible { display: grid; }
.modal-card {
  width: min(520px, calc(100vw - 2rem));
  background: var(--panel-strong);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 1.2rem;
  box-shadow: var(--shadow);
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.7rem;
  margin-top: 1rem;
}
.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}
.template-card {
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgba(148, 163, 184, 0.04);
  padding: 0.8rem;
  text-align: left;
}
.confetti-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1500;
}
.confetti-piece {
  position: absolute;
  width: 10px;
  height: 16px;
  border-radius: 3px;
  animation: confettiFall 1500ms ease-in forwards;
}
@keyframes confettiFall {
  0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
.value-input { width: 90px; }

@media (max-width: 900px) {
  .app-shell {
    grid-template-columns: 1fr;
    padding-bottom: calc(5rem + env(safe-area-inset-bottom));
  }
  .sidebar { display: none; }
  .mobile-nav { display: grid; }
  .hero-grid, .stats-grid, .settings-grid { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
