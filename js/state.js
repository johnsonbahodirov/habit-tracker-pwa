const DB_NAME = 'habitflow-db';
const DB_VERSION = 1;
const STORES = { habits: 'id', logs: 'id', settings: 'key', journal: 'dateKey', backups: 'id' };
let dbPromise = null;

export function openDatabase() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      for (const [name, keyPath] of Object.entries(STORES)) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
    req.onerror = () => {
      dbPromise = null;
      reject(req.error);
    };
  });
  return dbPromise;
}

async function run(storeName, mode, fn) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const out = fn(tx.objectStore(storeName));
    let result;
    if (out && 'onsuccess' in out) out.onsuccess = () => { result = out.result; };
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export const readAll = (n) => run(n, 'readonly', (s) => s.getAll()).then((r) => r || []);
export const readOne = (n, k) => run(n, 'readonly', (s) => s.get(k)).then((r) => r || null);
export const writeData = (n, v) => run(n, 'readwrite', (s) => s.put(v));
export const deleteData = (n, k) => run(n, 'readwrite', (s) => s.delete(k));
export const replaceStore = (n, values) => run(n, 'readwrite', (s) => {
  s.clear();
  values.forEach((v) => s.put(v));
});

export const saveSettings = (settings) => writeData('settings', { key: 'settings', value: settings });
export const loadSettings = async () => (await readOne('settings', 'settings'))?.value ?? null;

export async function deleteHabitCascade(habitId) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['habits', 'logs'], 'readwrite');
    tx.objectStore('habits').delete(habitId);
    const req = tx.objectStore('logs').openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) return;
      if (cursor.value.habitId === habitId) cursor.delete();
      cursor.continue();
    };
    tx.oncomplete = () => resolve();
    tx.onerror = tx.onabort = () => reject(tx.error);
  });
}
