export const DEFAULT_SETTINGS = {
  apiKey: '',
  selectedModel: 'gemini-2.0-flash',
  defaultTone: 'fix_grammar',
  autoCopy: false,
  showNotifications: true,
  showSelectionBubble: false
};

export const AVAILABLE_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Varsayılan - En Yeni & Ultra Hızlı)' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Gelişmiş Zeka & Yüksek Kalite)' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite (Hafif & Hızlı)' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Klasik)' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Gelişmiş Düşünme)' }
];
