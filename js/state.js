const DB_NAME = 'habitflow-db';
const DB_VERSION = 1;

const STORE_MAP = {
  habits: 'id',
  logs: 'id',
  settings: 'key',
  journal: 'dateKey',
  backups: 'id'
};

export async function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      Object.entries(STORE_MAP).forEach(([storeName, keyPath]) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath });
        }
      });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

export async function getStore(storeName, mode = 'readonly') {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    resolve({ db, tx, store });
  }).catch(reject);
}

export async function readAll(storeName) {
  const { store } = await getStore(storeName);
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error || new Error(`Read failed for ${storeName}`));
  });
}

export async function readOne(storeName, key) {
  const { store } = await getStore(storeName);
  return new Promise((resolve, reject) => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error || new Error(`Read single failed for ${storeName}`));
  });
}

export async function writeData(storeName, value) {
  const { store } = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = store.put(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error(`Write failed for ${storeName}`));
  });
}

export async function deleteData(storeName, key) {
  const { store } = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = store.delete(key);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error || new Error(`Delete failed for ${storeName}`));
  });
}

export async function replaceStore(storeName, values) {
  const { store, tx } = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    store.clear();
    values.forEach((value) => store.put(value));
    tx.oncomplete = () => resolve(values);
    tx.onerror = () => reject(tx.error || new Error(`Replace failed for ${storeName}`));
  });
}

export async function saveSettings(settings) {
  await writeData('settings', { key: 'settings', value: settings });
}

export async function loadSettings() {
  const result = await readOne('settings', 'settings');
  return result ? result.value : null;
}

export async function saveHabits(habits) {
  await replaceStore('habits', habits);
}

export async function saveLogs(logs) {
  await replaceStore('logs', logs);
}

export async function saveJournal(journalMap) {
  const entries = Object.values(journalMap || {}).map((entry) => ({
    ...entry,
    dateKey: entry.dateKey || Object.keys(journalMap).find((key) => journalMap[key] === entry)
  }));
  await replaceStore('journal', entries);
}

export async function saveBackupEntry(name, payload) {
  const entry = {
    id: crypto.randomUUID(),
    name,
    payload,
    createdAt: new Date().toISOString()
  };
  await writeData('backups', entry);
  return entry.id;
}

export async function listBackups() {
  return readAll('backups');
}

export async function deleteBackup(id) {
  await deleteData('backups', id);
}
