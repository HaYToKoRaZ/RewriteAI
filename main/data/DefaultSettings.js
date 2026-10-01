export const DEFAULT_SETTINGS = {
  apiKey: '', // Gemini API Anahtarı (Geriye dönük uyumluluk)
  groqApiKey: '',
  cohereApiKey: '',
  hfApiKey: '',
  openaiApiKey: '',
  anthropicApiKey: '',
  deepseekApiKey: '',
  selectedModel: 'gemini-3.5-flash-lite',
  defaultTone: 'fix_grammar',
  autoCopy: false,
  showNotifications: true,
  showSelectionBubble: false,
  twitterMode: false
};

export const AVAILABLE_MODELS = [
  // Google Gemini (Ücretsiz Tier)
  { id: 'gemini-3.5-flash-lite', provider: 'gemini', group: '🆓 Google Gemini (Ücretsiz Tier)', name: 'Gemini 3.5 Flash Lite (✨ En Hafif & Yüksek Kota)' },
  { id: 'gemini-3.8-flash', provider: 'gemini', group: '🆓 Google Gemini (Ücretsiz Tier)', name: 'Gemini 3.8 Flash (Zeki & Hızlı)' },
  { id: 'gemini-3.7-flash', provider: 'gemini', group: '🆓 Google Gemini (Ücretsiz Tier)', name: 'Gemini 3.7 Flash (Kararlı)' },

  // Groq Cloud (Tamamen Ücretsiz & Ultra Hızlı)
  { id: 'llama-3.3-70b-versatile', provider: 'groq', group: '⚡ Groq (Ücretsiz & Işık Hızında)', name: 'Llama 3.3 70B Versatile (Meta - Ücretsiz & Çok Hızlı)' },
  { id: 'llama-3.1-8b-instant', provider: 'groq', group: '⚡ Groq (Ücretsiz & Işık Hızında)', name: 'Llama 3.1 8B Instant (Meta - Anında Yanıt)' },

  // Cohere (Trial Free Key)
  { id: 'command-a', provider: 'cohere', group: '🏢 Cohere (Ücretsiz Trial Key)', name: 'Command A (En Yeni & Güçlü Agentic Model)' },
  { id: 'command-r7b-12-2024', provider: 'cohere', group: '🏢 Cohere (Ücretsiz Trial Key)', name: 'Command R7B (Hızlı & Dengeli)' },

  // Hugging Face (Ücretsiz Token)
  { id: 'Qwen/Qwen2.5-72B-Instruct', provider: 'huggingface', group: '🤗 Hugging Face (Ücretsiz Token)', name: 'Qwen 2.5 72B Instruct (Açık Kaynak Lideri)' },

  // OpenAI (Global Dev)
  { id: 'gpt-4o-mini', provider: 'openai', group: '🌐 OpenAI (Hesap Bakiyesi)', name: 'GPT-4o Mini (Hızlı, Akıllı & Ekonomik)' },
  { id: 'gpt-4o', provider: 'openai', group: '🌐 OpenAI (Hesap Bakiyesi)', name: 'GPT-4o (Amiral Gemisi)' },

  // Anthropic Claude
  { id: 'claude-3-5-haiku-20241022', provider: 'anthropic', group: '🧠 Anthropic Claude (Hesap Bakiyesi)', name: 'Claude 3.5 Haiku (Yüksek Türkçe Kalitesi)' },
  { id: 'claude-3-5-sonnet-20241022', provider: 'anthropic', group: '🧠 Anthropic Claude (Hesap Bakiyesi)', name: 'Claude 3.5 Sonnet (Edebi & Üst Seviye)' },

  // DeepSeek
  { id: 'deepseek-chat', provider: 'deepseek', group: '🐋 DeepSeek (Ekonomik Bakiye)', name: 'DeepSeek-V3 (Yüksek Zeka & Çok Ucuz)' }
];
