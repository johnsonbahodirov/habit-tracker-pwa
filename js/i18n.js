import { escapeHtml } from './state.js';

export function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

export function confirmDialog(title, message) {
  return new Promise((resolve) => {
    const root = document.getElementById('modalRoot');
    if (!root) { resolve(false); return; }
    root.innerHTML = `<div class="modal-card" role="alertdialog" aria-modal="true"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(message)}</p>
      <div class="modal-actions"><button class="ghost-btn" type="button" data-confirm="no">Cancel</button>
      <button class="danger-btn" type="button" data-confirm="yes">Confirm</button></div></div>`;
    root.classList.add('visible');
    const handler = (event) => {
      const btn = event.target.closest('[data-confirm]');
      if (!btn && event.target !== root) return;
      root.removeEventListener('click', handler);
      root.classList.remove('visible');
      root.innerHTML = '';
      resolve(btn?.dataset.confirm === 'yes');
    };
    root.addEventListener('click', handler);
  });
}

export function showConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.createElement('div');
  layer.className = 'confetti-layer';
  document.body.appendChild(layer);
  const colors = ['#7c3aed', '#10b981', '#f59e0b', '#38bdf8', '#f472b6', '#f87171'];
  for (let i = 0; i < 48; i += 1) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    layer.appendChild(piece);
    setTimeout(() => piece.remove(), 1600);
  }
  setTimeout(() => layer.remove(), 1800);
}
