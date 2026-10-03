export function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2200);
}

export async function confirmDialog(title, message) {
  return new Promise((resolve) => {
    const root = document.getElementById('modalRoot');
    if (!root) {
      resolve(true);
      return;
    }

    root.innerHTML = `
      <div class="modal-card">
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="modal-actions">
          <button class="ghost-btn" type="button" data-close="cancel">Cancel</button>
          <button class="danger-btn" type="button" data-close="confirm">Confirm</button>
        </div>
      </div>
    `;
    root.classList.add('visible');

    const clickHandler = (event) => {
      const action = event.target.dataset.close;
      root.classList.remove('visible');
      root.innerHTML = '';
      resolve(action === 'confirm');
      root.removeEventListener('click', clickHandler);
    };

    root.addEventListener('click', clickHandler);
  });
}

export function showConfetti() {
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
