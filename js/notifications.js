export const i18n = {
  en: {
    today: 'Today',
    habits: 'Habits',
    stats: 'Stats',
    journal: 'Journal',
    settings: 'Settings',
    addHabit: 'Add habit',
    backup: 'Backup',
    theme: 'Theme',
    quote: 'Quote',
    save: 'Save',
    allDone: 'All done!'
  },
  ru: {
    today: 'Сегодня',
    habits: 'Привычки',
    stats: 'Статистика',
    journal: 'Дневник',
    settings: 'Настройки',
    addHabit: 'Добавить привычку',
    backup: 'Резервная копия',
    theme: 'Тема',
    quote: 'Цитата',
    save: 'Сохранить',
    allDone: 'Готово!'
  },
  uz: {
    today: 'Bugun',
    habits: 'Odatiy',
    stats: 'Statistika',
    journal: 'Kundalik',
    settings: 'Sozlamalar',
    addHabit: 'Odat qo‘shish',
    backup: 'Zaxira',
    theme: 'Mavzu',
    quote: 'Iqtibos',
    save: 'Saqlash',
    allDone: 'Barchasi tayyor!'
  }
};

export function t(key, language = 'en') {
  return i18n[language]?.[key] || i18n.en[key] || key;
}
