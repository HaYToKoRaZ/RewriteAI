export const DEFAULT_SETTINGS = {
  apiKey: '',
  selectedModel: 'gemini-1.5-flash-latest',
  defaultTone: 'fix_grammar',
  autoCopy: false,
  showNotifications: true,
  showSelectionBubble: false
};

export const AVAILABLE_MODELS = [
  { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash (Önerilen - Hızlı & Kararlı)' },
  { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro (Gelişmiş Düşünme & Karmaşık Metinler)' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Yeni Nesil Hızlı Model)' }
];
