export const DEFAULT_SETTINGS = {
  apiKey: '',
  selectedModel: 'gemini-3.8-flash',
  defaultTone: 'fix_grammar',
  autoCopy: false,
  showNotifications: true,
  showSelectionBubble: false
};

export const AVAILABLE_MODELS = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (✨ Ücretsiz Kotası Var - En Zeki & Hızlı)' },
  { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash (✨ Ücretsiz Kotası Var - Kararlı & Hızlı)' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite (✨ Ücretsiz Kotası Var - En Hafif & Seri)' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Alternatif)' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Klasik)' }
];
