const ALGO = { name: 'AES-GCM', length: 256 };

async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' },
    keyMaterial,
    { name: ALGO.name, length: ALGO.length },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptBackup(payload, password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const data = encoder.encode(JSON.stringify(payload));
  const encrypted = await crypto.subtle.encrypt({ name: ALGO.name, iv }, key, data);
  return JSON.stringify({ version: 1, salt: Array.from(salt), iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted)) });
}

export async function decryptBackup(blob, password) {
  try {
    const parsed = JSON.parse(blob);
    const salt = new Uint8Array(parsed.salt);
    const iv = new Uint8Array(parsed.iv);
    const encryptedData = new Uint8Array(parsed.data);
    const key = await deriveKey(password, salt);
    const decrypted = await crypto.subtle.decrypt({ name: ALGO.name, iv }, key, encryptedData.buffer);
    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch (error) {
    throw new Error('Unable to decrypt backup. Check the password.');
  }
}

export function downloadBlob(filename, content, mime = 'application/json') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function exportProgressCardImage(summary) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#7c3aed';
  ctx.fillRect(40, 40, canvas.width - 80, canvas.height - 80);
  ctx.fillStyle = '#ecfeff';
  ctx.font = '700 42px sans-serif';
  ctx.fillText('HabitFlow Progress', 90, 120);
  ctx.font = '500 30px sans-serif';
  ctx.fillStyle = '#dbeafe';
  ctx.fillText(`Level ${summary.level}`, 90, 190);
  ctx.fillText(`XP ${summary.xp}`, 90, 240);
  ctx.fillText(`Today ${summary.todayScore}%`, 90, 290);
  ctx.fillText(`Current streak ${summary.streak}d`, 90, 340);
  ctx.fillStyle = '#a7f3d0';
  ctx.fillRect(90, 420, 380, 22);
  ctx.fillStyle = '#34d399';
  ctx.fillRect(90, 420, (summary.todayScore / 100) * 380, 22);
  ctx.fillStyle = '#fff';
  ctx.font = '600 22px sans-serif';
  ctx.fillText('Built with HabitFlow', 90, 560);
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `habitflow-progress-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
