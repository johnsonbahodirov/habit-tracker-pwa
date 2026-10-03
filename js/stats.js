export const i18n = {
  en: {
    today: 'Today',
    habits: 'Habits',
    stats: 'Stats',
    journal: 'Journal',
    settings: 'Settings',
    addHabit: 'Add habit',
    theme: 'Theme',
    quote: 'Quote',
    backup: 'Backup',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    allDone: 'All done!',
    quit: 'Quit'
  },
  ru: {
    today: 'Сегодня',
    habits: 'Привычки',
    stats: 'Статистика',
    journal: 'Дневник',
    settings: 'Настройки',
    addHabit: 'Добавить привычку',
    theme: 'Тема',
    quote: 'Цитата',
    backup: 'Резервная копия',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Изменить',
    allDone: 'Готово!',
    quit: 'Выход'
  },
  uz: {
    today: 'Bugun',
    habits: 'Odatlar',
    stats: 'Statistika',
    journal: 'Kundalik',
    settings: 'Sozlamalar',
    addHabit: 'Odat qo\'shish',
    theme: 'Mavzu',
    quote: 'Iqtibos',
    backup: 'Zaxira',
    save: 'Saqlash',
    cancel: 'Bekor',
    delete: 'O\'chirish',
    edit: 'O\'zgartirish',
    allDone: 'Barcha tayyor!',
    quit: 'Chiqish'
  }
};

export function t(key, language = 'en') {
  return i18n[language]?.[key] || i18n.en[key] || key;
}

export function applyI18n(lang = 'en') {
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n, lang); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder, lang); });
  document.documentElement.lang = lang;
}
