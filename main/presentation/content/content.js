(function() {
  // Çoklu enjeksiyonu önle
  if (window.__rewriteAIInjected) return;
  window.__rewriteAIInjected = true;

  // Extension Context Geçerlilik Denetleyicisi
  // Eklenti güncellendiğinde veya yeniden yüklendiğinde eski sayfalardaki context kopmasını yakalar
  function isContextValid() {
    return Boolean(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
  }

  // Güvenli Storage Okuyucu
  function safeStorageGet(keys, callback) {
    if (!isContextValid()) return;
    try {
      chrome.storage.local.get(keys, (res) => {
        if (!isContextValid()) return;
        if (chrome.runtime.lastError) return;
        callback(res);
      });
    } catch {
      // Context invalidated hatasını sessizce yut
    }
  }

  // Güvenli Storage Yazıcı
  function safeStorageSet(items, callback) {
    if (!isContextValid()) return;
    try {
      chrome.storage.local.set(items, () => {
        if (!isContextValid()) return;
        if (chrome.runtime.lastError) return;
        if (callback) callback();
      });
    } catch {
      // Context invalidated hatasını sessizce yut
    }
  }

  // Güvenli Mesaj Gönderici
  function safeSendMessage(message, callback) {
    if (!isContextValid()) {
      if (callback) callback({ success: false, error: 'Eklenti güncellendi. Lütfen sayfayı yenileyin (F5).' });
      return;
    }
    try {
      chrome.runtime.sendMessage(message, (res) => {
        if (chrome.runtime.lastError) {
          if (callback) callback({ success: false, error: chrome.runtime.lastError.message });
          return;
        }
        if (callback) callback(res);
      });
    } catch (err) {
      if (callback) callback({ success: false, error: 'Eklenti bağlamı yenilendi. Lütfen sayfayı yenileyin (F5).' });
    }
  }

  let currentSelectedText = '';
  let selectionRange = null;
  let activeInputElement = null;
  let activeInputStart = 0;
  let activeInputEnd = 0;

  // Crisp Vector SVG Bayrakları (Windows emoji font limitlerini aşmak için)
  const FLAG_SVGS = {
    auto: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='2' y1='12' x2='22' y2='12'/%3E%3Cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/%3E%3C/svg%3E`,
    tr: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='30' height='20' fill='%23E30A17'/%3E%3Ccircle cx='10' cy='10' r='6' fill='white'/%3E%3Ccircle cx='12' cy='10' r='4.8' fill='%23E30A17'/%3E%3Cpolygon points='17,10 18.5,6.5 22,8.8 19.5,11.8 22,11' fill='white' transform='rotate(-18,17,10)'/%3E%3C/svg%3E`,
    en: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 30'%3E%3Crect width='60' height='30' fill='%23012169'/%3E%3Cpath d='M0,0 L60,30 M60,0 L0,30' stroke='white' stroke-width='8'/%3E%3Cpath d='M0,0 L60,30 M60,0 L0,30' stroke='%23C8102E' stroke-width='5'/%3E%3Cpath d='M30,0 L30,30 M0,15 L60,15' stroke='white' stroke-width='12'/%3E%3Cpath d='M30,0 L30,30 M0,15 L60,15' stroke='%23C8102E' stroke-width='7'/%3E%3C/svg%3E`,
    de: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='30' height='6.66' y='0' fill='%23000000'/%3E%3Crect width='30' height='6.66' y='6.66' fill='%23DD0000'/%3E%3Crect width='30' height='6.68' y='13.32' fill='%23FFCE00'/%3E%3C/svg%3E`,
    fr: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='10' height='20' x='0' fill='%23002654'/%3E%3Crect width='10' height='20' x='10' fill='%23FFFFFF'/%3E%3Crect width='10' height='20' x='20' fill='%23CE1126'/%3E%3C/svg%3E`,
    es: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='30' height='5' y='0' fill='%23AA151B'/%3E%3Crect width='30' height='10' y='5' fill='%23F1BF00'/%3E%3Crect width='30' height='5' y='15' fill='%23AA151B'/%3E%3C/svg%3E`,
    it: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='10' height='20' x='0' fill='%23009246'/%3E%3Crect width='10' height='20' x='10' fill='%23FFFFFF'/%3E%3Crect width='10' height='20' x='20' fill='%23CE2B37'/%3E%3C/svg%3E`,
    pt: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='12' height='20' x='0' fill='%23046A38'/%3E%3Crect width='18' height='20' x='12' fill='%23DA291C'/%3E%3Ccircle cx='12' cy='10' r='4' fill='%23FFCD00'/%3E%3C/svg%3E`,
    ru: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='30' height='6.66' y='0' fill='%23FFFFFF'/%3E%3Crect width='30' height='6.66' y='6.66' fill='%230039A6'/%3E%3Crect width='30' height='6.68' y='13.32' fill='%23D52B1E'/%3E%3C/svg%3E`,
    ar: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='30' height='20' fill='%23006C35'/%3E%3Ctext x='15' y='12' font-size='8' fill='%23FFFFFF' text-anchor='middle' font-family='sans-serif' font-weight='bold'%3E%D8%B6%3C/text%3E%3C/svg%3E`,
    zh: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='30' height='20' fill='%23EE1C25'/%3E%3Cpolygon points='5,2.5 6,5.5 3.5,3.6 6.5,3.6 4,5.5' fill='%23FFFF00'/%3E%3C/svg%3E`,
    ja: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='30' height='20' fill='%23FFFFFF'/%3E%3Ccircle cx='15' cy='10' r='6' fill='%23BC002D'/%3E%3C/svg%3E`,
    ko: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='30' height='20' fill='%23FFFFFF'/%3E%3Ccircle cx='15' cy='10' r='5' fill='%23CD2E3A'/%3E%3Cpath d='M15,5 A5,5 0 0,0 15,15 A2.5,2.5 0 0,1 15,10 A2.5,2.5 0 0,0 15,5' fill='%230047A0'/%3E%3C/svg%3E`,
    az: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='30' height='6.66' y='0' fill='%2300B5E2'/%3E%3Crect width='30' height='6.66' y='6.66' fill='%23EF3340'/%3E%3Crect width='30' height='6.68' y='13.32' fill='%23509E2F'/%3E%3Ccircle cx='14' cy='10' r='2.8' fill='white'/%3E%3Ccircle cx='14.8' cy='10' r='2.3' fill='%23EF3340'/%3E%3Cpolygon points='17,10 18,9 18,11' fill='white'/%3E%3C/svg%3E`,
    nl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='30' height='6.66' y='0' fill='%23AE1C28'/%3E%3Crect width='30' height='6.66' y='6.66' fill='%23FFFFFF'/%3E%3Crect width='30' height='6.68' y='13.32' fill='%2321468B'/%3E%3C/svg%3E`,
    pl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='30' height='10' y='0' fill='%23FFFFFF'/%3E%3Crect width='30' height='10' y='10' fill='%23DC143C'/%3E%3C/svg%3E`,
    hi: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='30' height='6.66' y='0' fill='%23FF9933'/%3E%3Crect width='30' height='6.66' y='6.66' fill='%23FFFFFF'/%3E%3Crect width='30' height='6.68' y='13.32' fill='%23128807'/%3E%3Ccircle cx='15' cy='10' r='2.2' fill='none' stroke='%23000080' stroke-width='0.6'/%3E%3C/svg%3E`,
    sv: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='30' height='20' fill='%23006AA7'/%3E%3Crect width='30' height='4' y='8' fill='%23FECC00'/%3E%3Crect width='4' height='20' x='9' fill='%23FECC00'/%3E%3C/svg%3E`,
    uk: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='30' height='10' y='0' fill='%23005BBB'/%3E%3Crect width='30' height='10' y='10' fill='%23FFD500'/%3E%3C/svg%3E`,
    id: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='30' height='10' y='0' fill='%23FF0000'/%3E%3Crect width='30' height='10' y='10' fill='%23FFFFFF'/%3E%3C/svg%3E`,
    el: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='30' height='20' fill='%230D5EAF'/%3E%3Crect width='30' height='2.22' y='2.22' fill='white'/%3E%3Crect width='30' height='2.22' y='6.66' fill='white'/%3E%3Crect width='30' height='2.22' y='11.1' fill='white'/%3E%3Crect width='30' height='2.22' y='15.54' fill='white'/%3E%3Crect width='10' height='10' fill='%230D5EAF'/%3E%3Crect width='10' height='2' y='4' fill='white'/%3E%3Crect width='2' height='10' x='4' fill='white'/%3E%3C/svg%3E`
  };

  const TARGET_LANG_ITEMS = [
    { code: 'auto', nameTr: 'Orijinal Dil (Oto)', nameEn: 'Original Language (Auto)' },
    { code: 'tr', nameTr: 'Türkçe', nameEn: 'Turkish' },
    { code: 'en', nameTr: 'İngilizce', nameEn: 'English' },
    { code: 'de', nameTr: 'Almanca', nameEn: 'German' },
    { code: 'fr', nameTr: 'Fransızca', nameEn: 'French' },
    { code: 'es', nameTr: 'İspanyolca', nameEn: 'Spanish' },
    { code: 'it', nameTr: 'İtalyanca', nameEn: 'Italian' },
    { code: 'pt', nameTr: 'Portekizce', nameEn: 'Portuguese' },
    { code: 'ru', nameTr: 'Rusça', nameEn: 'Russian' },
    { code: 'ar', nameTr: 'Arapça', nameEn: 'Arabic' },
    { code: 'zh', nameTr: 'Çince', nameEn: 'Chinese' },
    { code: 'ja', nameTr: 'Japonca', nameEn: 'Japanese' },
    { code: 'ko', nameTr: 'Korece', nameEn: 'Korean' },
    { code: 'az', nameTr: 'Azerbaycanca', nameEn: 'Azerbaijani' },
    { code: 'nl', nameTr: 'Felemenkçe', nameEn: 'Dutch' },
    { code: 'pl', nameTr: 'Lehçe', nameEn: 'Polish' },
    { code: 'hi', nameTr: 'Hintçe', nameEn: 'Hindi' },
    { code: 'sv', nameTr: 'İsveççe', nameEn: 'Swedish' },
    { code: 'uk', nameTr: 'Ukraynaca', nameEn: 'Ukrainian' },
    { code: 'id', nameTr: 'Endonezce', nameEn: 'Indonesian' },
    { code: 'el', nameTr: 'Yunanca', nameEn: 'Greek' }
  ];

  // Çeviri Sözlüğü (Content Script içinde bağımsız çalışabilmesi için)
  const I18N = {
    tr: {
      appName: 'RewriteAI',
      selectedText: 'Seçilen Metin:',
      convertedResult: 'Dönüştürülen Sonuç:',
      resultPlaceholder: 'Dönüşüm sonucunuz burada belirecek...',
      transform: '⚡ Dönüştür',
      processing: '⏳ İşleniyor...',
      copy: '📋 Kopyala',
      copied: '✓ Kopyalandı',
      replaceInPage: '🔄 Sayfaya Yerleştir',
      statusDefault: 'Dönüşüm tonu seçin ve Dönüştür butonuna tıklayın.',
      statusProcessing: 'Yapay zeka metni yeniden yazıyor...',
      statusDone: '✓ Tamamlandı!',
      statusDefaultModelUpdated: '✓ Varsayılan model güncellendi',
      autoRunStopped: 'Otomatik işlem durduruldu: Model API anahtarı girilmemiş.',
      keyMissingWarning: '⚠️ {provider} API Anahtarı girilmemiş! Bu modeli kullanabilmek için anahtar ekleyin.',
      keyMissingStatus: 'Uyarı: {provider} API anahtarı eksik. Ayarlardan anahtarınızı ekleyin.',
      goToSettings: '⚙️ Ayarlara Git',
      quotaText: (count) => `Google Kotası: ${count} / 1.500 istek (Bugün)`,
      quotaPanel: 'Panel ↗',
      pageReplaceError: 'Sayfa metni doğrudan değiştirilemedi, lütfen kopyalayın.',
      triggerBtnTitle: 'RewriteAI ile Düzenle',
      contextInvalidated: 'Eklenti güncellendi veya yeniden yüklendi. Lütfen bu sekmeyi yenileyin (F5).',
      targetLangLabel: 'Çıktı Dili:',
      autoLang: '🌐 Orijinal Dil (Oto)',
      langTurkish: '🇹🇷 Türkçe',
      langEnglish: '🇬🇧 English',
      langGerman: '🇩🇪 Almanca',
      langFrench: '🇫🇷 Fransızca',
      langSpanish: '🇪🇸 İspanyolca',
      langItalian: '🇮🇹 İtalyanca',
      langPortuguese: '🇵🇹 Portekizce',
      langRussian: '🇷🇺 Rusça',
      langArabic: '🇸🇦 Arapça',
      langChinese: '🇨🇳 Çince',
      langJapanese: '🇯🇵 Japonca',
      langKorean: '🇰🇷 Korece',
      langAzerbaijani: '🇦🇿 Azerbaycanca',
      langDutch: '🇳🇱 Felemenkçe',
      langPolish: '🇵🇱 Lehçe',
      langHindi: '🇮🇳 Hintçe',
      langSwedish: '🇸🇪 İsveççe',
      langUkrainian: '🇺🇦 Ukraynaca',
      langIndonesian: '🇮🇩 Endonezce',
      langGreek: '🇬🇷 Yunanca',
      tones: {
        fix_grammar: { title: '✍️ İmla & Dilbilgisi', desc: 'Hataları düzeltir' },
        daily: { title: '💬 Günlük & Samimi', desc: 'Doğal konuşma dili' },
        formal: { title: '💼 Resmi & Kurumsal', desc: 'Profesyonel üslup' },
        slang: { title: '🔥 Argo & Sokak Ağzı', desc: 'Gençlik jargonu' },
        academic: { title: '🎓 Akademik & Ağır', desc: 'Bilimsel terminoloji' },
        gamer: { title: '🎮 Gamer & Espor', desc: 'Oyun dünyası ve oyuncu jargonu' },
        techie: { title: '💻 Teknoloji Kurdu', desc: 'Geek, yazılım ve analitik dil' },
        summarize: { title: '📌 Özetle', desc: 'Kısa ve netleştir' },
        diplomatic: { title: '🕊️ Nazik / Diplomatik Hayır', desc: 'Zarifçe reddetme & kırmama' },
        marketing: { title: '🧲 Pazarlama & Viral Hook', desc: 'Sosyal medya & dikkat çekici' },
        eli5: { title: '💡 Basitleştir (5 Yaşında)', desc: 'Herkesin anlayacağı sadelik' },
        persuasive: { title: '🎯 İkna Edici & Satış', desc: 'Argüman ve fayda odaklı' },
        creative: { title: '🎨 Yaratıcı Hikaye', desc: 'Betimleyici ve akıcı kurgu' },
        custom: { title: '⚙️ Özel Tonum', desc: 'Ayarlardan belirlenen kişisel ton' }
      },
      moreTonesBtn: '✨ Diğerleri ▾',
      modelGroups: {
        gemini: '🆓 Google Gemini (Ücretsiz Tier)',
        groq: '⚡ Groq (Ücretsiz & Işık Hızında)',
        cohere: '🏢 Cohere (Ücretsiz Trial)',
        hf: '🤗 Hugging Face (Ücretsiz Token)',
        openai: '🌐 OpenAI (ChatGPT)',
        claude: '🧠 Anthropic Claude',
        deepseek: '🐋 DeepSeek'
      },
      models: {
        'gemini-3.5-flash-lite': 'Gemini 3.5 Flash Lite (✨ En Hafif)',
        'gemini-3.8-flash': 'Gemini 3.8 Flash (Zeki & Hızlı)',
        'gemini-3.7-flash': 'Gemini 3.7 Flash (Kararlı)',
        'llama-3.3-70b-versatile': 'Groq: Llama 3.3 70B (Çok Hızlı)',
        'llama-3.1-8b-instant': 'Groq: Llama 3.1 8B (Anında)',
        'command-a': 'Cohere: Command A (En Yeni & Güçlü)',
        'command-r7b-12-2024': 'Cohere: Command R7B (Hızlı)',
        'Qwen/Qwen2.5-72B-Instruct': 'HF: Qwen 2.5 72B (Açık Kaynak)',
        'gpt-4o-mini': 'OpenAI: GPT-4o Mini (Ekonomik & Hızlı)',
        'gpt-4o': 'OpenAI: GPT-4o (Amiral Gemisi)',
        'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku (Yüksek Kalite)',
        'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet (Üst Seviye)',
        'deepseek-chat': 'DeepSeek: DeepSeek-V3 (Ekonomik & Zeki)'
      }
    },
    en: {
      appName: 'RewriteAI',
      selectedText: 'Selected Text:',
      convertedResult: 'Converted Result:',
      resultPlaceholder: 'Your converted text will appear here...',
      transform: '⚡ Transform',
      processing: '⏳ Processing...',
      copy: '📋 Copy',
      copied: '✓ Copied',
      replaceInPage: '🔄 Replace in Page',
      statusDefault: 'Select a tone and click Transform.',
      statusProcessing: 'AI is rewriting your text...',
      statusDone: '✓ Done!',
      statusDefaultModelUpdated: '✓ Default model updated',
      autoRunStopped: 'Auto-run stopped: No API key found for this model.',
      keyMissingWarning: '⚠️ {provider} API Key missing! Add your key in settings to use this model.',
      keyMissingStatus: 'Warning: {provider} API key is missing. Add your key in settings.',
      goToSettings: '⚙️ Go to Settings',
      quotaText: (count) => `Google Quota: ${count} / 1,500 req (Today)`,
      quotaPanel: 'Panel ↗',
      pageReplaceError: 'Could not replace text directly in page, please copy manually.',
      triggerBtnTitle: 'Edit with RewriteAI',
      contextInvalidated: 'Extension context invalidated. Please reload this tab (F5).',
      targetLangLabel: 'Output Language:',
      autoLang: '🌐 Original Language (Auto)',
      langTurkish: '🇹🇷 Turkish',
      langEnglish: '🇬🇧 English',
      langGerman: '🇩🇪 German',
      langFrench: '🇫🇷 French',
      langSpanish: '🇪🇸 Spanish',
      langItalian: '🇮🇹 Italian',
      langPortuguese: '🇵🇹 Portuguese',
      langRussian: '🇷🇺 Russian',
      langArabic: '🇸🇦 Arabic',
      langChinese: '🇨🇳 Chinese',
      langJapanese: '🇯🇵 Japanese',
      langKorean: '🇰🇷 Korean',
      langAzerbaijani: '🇦🇿 Azerbaijani',
      langDutch: '🇳🇱 Dutch',
      langPolish: '🇵🇱 Polish',
      langHindi: '🇮🇳 Hindi',
      langSwedish: '🇸🇪 Swedish',
      langUkrainian: '🇺🇦 Ukrainian',
      langIndonesian: '🇮🇩 Indonesian',
      langGreek: '🇬🇷 Greek',
      tones: {
        fix_grammar: { title: '✍️ Grammar & Spelling', desc: 'Fix errors' },
        daily: { title: '💬 Casual & Friendly', desc: 'Natural speech' },
        formal: { title: '💼 Formal & Corporate', desc: 'Professional tone' },
        slang: { title: '🔥 Slang & Street', desc: 'Youth jargon' },
        academic: { title: '🎓 Academic & Formal', desc: 'Scientific terminology' },
        gamer: { title: '🎮 Gamer & Esports', desc: 'Gaming world jargon' },
        techie: { title: '💻 Tech Geek', desc: 'Geek, software & analytical' },
        summarize: { title: '📌 Summarize', desc: 'Short and clear' },
        diplomatic: { title: '🕊️ Diplomatic No', desc: 'Politely decline & set boundaries' },
        marketing: { title: '🧲 Marketing & Viral Hook', desc: 'Social media & attention-grabbing' },
        eli5: { title: '💡 Simplify (ELI5)', desc: 'Simple enough for anyone' },
        persuasive: { title: '🎯 Persuasive & Sales', desc: 'Argument and benefit focused' },
        creative: { title: '🎨 Creative Story', desc: 'Descriptive and fluent narrative' },
        custom: { title: '⚙️ My Custom Tone', desc: 'Personal tone set in settings' }
      },
      moreTonesBtn: '✨ Others ▾',
      modelGroups: {
        gemini: '🆓 Google Gemini (Free Tier)',
        groq: '⚡ Groq (Free & Ultra Fast)',
        cohere: '🏢 Cohere (Free Trial)',
        hf: '🤗 Hugging Face (Free Token)',
        openai: '🌐 OpenAI (ChatGPT)',
        claude: '🧠 Anthropic Claude',
        deepseek: '🐋 DeepSeek'
      },
      models: {
        'gemini-3.5-flash-lite': 'Gemini 3.5 Flash Lite (✨ Lightweight)',
        'gemini-3.8-flash': 'Gemini 3.8 Flash (Smart & Fast)',
        'gemini-3.7-flash': 'Gemini 3.7 Flash (Stable)',
        'llama-3.3-70b-versatile': 'Groq: Llama 3.3 70B (Very Fast)',
        'llama-3.1-8b-instant': 'Groq: Llama 3.1 8B (Instant)',
        'command-a': 'Cohere: Command A (Latest & Powerful)',
        'command-r7b-12-2024': 'Cohere: Command R7B (Fast)',
        'Qwen/Qwen2.5-72B-Instruct': 'HF: Qwen 2.5 72B (Open Source)',
        'gpt-4o-mini': 'OpenAI: GPT-4o Mini (Cost-Effective & Fast)',
        'gpt-4o': 'OpenAI: GPT-4o (Flagship)',
        'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku (High Quality)',
        'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet (Advanced)',
        'deepseek-chat': 'DeepSeek: DeepSeek-V3 (Affordable & Smart)'
      }
    }
  };

  let curLang = 'tr';
  let t = I18N.tr;

  // Floating trigger ikonu ve modal arayüzünü oluştur
  let iconUrl = '';
  try {
    if (isContextValid()) {
      iconUrl = chrome.runtime.getURL('assets/icons/icon32.png');
    }
  } catch {
    iconUrl = '';
  }
  const triggerBtn = document.createElement('div');
  triggerBtn.id = 'rewriteai-trigger-btn';
  triggerBtn.innerHTML = `<img src="${iconUrl}" alt="RewriteAI" style="width:20px;height:20px;display:block;">`;
  triggerBtn.title = t.triggerBtnTitle;
  document.body.appendChild(triggerBtn);

  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'rewriteai-modal-overlay';
  modalOverlay.innerHTML = `
    <div class="rewriteai-modal">
      <div class="rewriteai-modal-header">
        <a href="https://haytokoraz.github.io/RewriteAI/" target="_blank" rel="noopener" class="rewriteai-brand" title="RewriteAI Web Sitesi">
          <img src="${iconUrl}" alt="RewriteAI" style="width:22px;height:22px;border-radius:4px;">
          <span class="rewriteai-title" id="rewriteai-modal-title">RewriteAI</span>
          <span class="rewriteai-version" id="rewriteai-modal-version">v2.1</span>
        </a>
        <div class="rewriteai-header-controls">
          <!-- Gizli select (uyumluluk için) -->
          <select id="rewriteai-modal-target-lang-select" class="rewriteai-select" style="display:none;" title="Çıktı Dili">
            <option value="auto">Orijinal Dil (Oto)</option>
          </select>
          <!-- Özel Bayraklı Açılır Menü -->
          <div class="rewriteai-custom-lang-dropdown" id="rewriteai-modal-lang-dropdown">
            <button class="rewriteai-custom-dropdown-btn" id="rewriteai-modal-lang-btn" type="button" title="Çıktı Dili">
              <span class="rewriteai-custom-dropdown-flag" id="rewriteai-modal-selected-flag"></span>
              <span class="rewriteai-custom-dropdown-text" id="rewriteai-modal-selected-text">Orijinal</span>
              <span class="rewriteai-custom-dropdown-arrow">▾</span>
            </button>
            <div class="rewriteai-custom-dropdown-menu" id="rewriteai-modal-lang-menu">
              <!-- Dinamik doldurulur -->
            </div>
          </div>
          <select id="rewriteai-modal-model-select" class="rewriteai-select" title="Yapay Zeka Modeli">
            <!-- Dinamik doldurulur -->
          </select>
          <button id="rewriteai-modal-close" class="rewriteai-close-btn">&times;</button>
        </div>
      </div>

      <div class="rewriteai-modal-body">
        <div id="rewriteai-key-warning" class="rewriteai-key-warning" style="display:none;">
          <span id="rewriteai-key-warning-text">⚠️ Bu model için API Anahtarı kayıtlı değil!</span>
          <button id="rewriteai-open-settings-btn" type="button" class="rewriteai-settings-btn">⚙️ Ayarlara Git</button>
        </div>

        <div class="rewriteai-field">
          <label id="rewriteai-lbl-selected">Seçilen Metin:</label>
          <textarea id="rewriteai-preview-text" class="rewriteai-preview-textarea" spellcheck="true"></textarea>
        </div>



        <div class="rewriteai-tone-grid">
          <button class="rewriteai-tone-btn active" data-tone="fix_grammar" type="button" title="✍️ İmla &amp; Dilbilgisi">
            <span class="rewriteai-tone-emoji">✍️</span>
            <strong>İmla</strong>
          </button>
          <button class="rewriteai-tone-btn" data-tone="daily" type="button" title="💬 Günlük &amp; Samimi">
            <span class="rewriteai-tone-emoji">💬</span>
            <strong>Günlük</strong>
          </button>
          <button class="rewriteai-tone-btn" data-tone="formal" type="button" title="💼 Resmi &amp; Kurumsal">
            <span class="rewriteai-tone-emoji">💼</span>
            <strong>Resmi</strong>
          </button>
          <button class="rewriteai-tone-btn" data-tone="slang" type="button" title="🔥 Argo &amp; Sokak Ağzı">
            <span class="rewriteai-tone-emoji">🔥</span>
            <strong>Argo</strong>
          </button>
          <button class="rewriteai-tone-btn" data-tone="gamer" type="button" title="🎮 Gamer">
            <span class="rewriteai-tone-emoji">🎮</span>
            <strong>Gamer</strong>
          </button>
          <button class="rewriteai-tone-btn" data-tone="techie" type="button" title="💻 Teknoloji Kurdu">
            <span class="rewriteai-tone-emoji">💻</span>
            <strong>Tekno</strong>
          </button>
          <button class="rewriteai-tone-btn" data-tone="summarize" type="button" title="📌 Özetle">
            <span class="rewriteai-tone-emoji">📌</span>
            <strong>Özetle</strong>
          </button>
          <button class="rewriteai-tone-btn rewriteai-tone-more-btn" id="rewriteai-more-tones-toggle-btn" type="button" title="Diğer Tonlar &amp; Özel Ton">
            <span class="rewriteai-tone-emoji" id="rewriteai-more-tones-icon">✨</span>
            <strong id="rewriteai-more-tones-label">Diğerleri ▾</strong>
          </button>
        </div>

        <!-- Açılır Ton Çekmecesi (Akordiyon / Drawer) -->
        <div id="rewriteai-more-tones-drawer" class="rewriteai-more-tones-drawer">
          <div class="rewriteai-more-tones-header">
            <span id="rewriteai-more-tones-header-text">✨ Diğer Tonlar ve Özel Şablon</span>
          </div>
          <div class="rewriteai-more-tones-list">
            <button type="button" class="rewriteai-more-tone-item" data-tone="academic">
              <span class="rewriteai-more-tone-icon">🎓</span>
              <div class="rewriteai-more-tone-text">
                <span class="rewriteai-more-tone-name">Akademik &amp; Ağır</span>
                <span class="rewriteai-more-tone-desc">Bilimsel, metodolojik ve ağırbaşlı üslup</span>
              </div>
            </button>
            <button type="button" class="rewriteai-more-tone-item" data-tone="diplomatic">
              <span class="rewriteai-more-tone-icon">🕊️</span>
              <div class="rewriteai-more-tone-text">
                <span class="rewriteai-more-tone-name">Nazik / Diplomatik Hayır</span>
                <span class="rewriteai-more-tone-desc">Kırmadan, profesyonelce sınır çizen ve hayır diyen ton</span>
              </div>
            </button>
            <button type="button" class="rewriteai-more-tone-item" data-tone="marketing">
              <span class="rewriteai-more-tone-icon">𝧲</span>
              <div class="rewriteai-more-tone-text">
                <span class="rewriteai-more-tone-name">Pazarlama &amp; Viral Hook</span>
                <span class="rewriteai-more-tone-desc">Dikkat çeken, merak uyandıran ve tıklatan reklam kancası</span>
              </div>
            </button>
            <button type="button" class="rewriteai-more-tone-item" data-tone="eli5">
              <span class="rewriteai-more-tone-icon">💡</span>
              <div class="rewriteai-more-tone-text">
                <span class="rewriteai-more-tone-name">Basitleştir (ELI5)</span>
                <span class="rewriteai-more-tone-desc">5 yaşında birine anlatır gibi sade ve anlaşılır</span>
              </div>
            </button>
            <button type="button" class="rewriteai-more-tone-item" data-tone="persuasive">
              <span class="rewriteai-more-tone-icon">🎯</span>
              <div class="rewriteai-more-tone-text">
                <span class="rewriteai-more-tone-name">İkna Edici &amp; Satış</span>
                <span class="rewriteai-more-tone-desc">Eyleme geçirici, güven veren ve net argümanlar sunan dil</span>
              </div>
            </button>
            <button type="button" class="rewriteai-more-tone-item" data-tone="creative">
              <span class="rewriteai-more-tone-icon">🎨</span>
              <div class="rewriteai-more-tone-text">
                <span class="rewriteai-more-tone-name">Yaratıcı Hikaye</span>
                <span class="rewriteai-more-tone-desc">Edebi, betimleyici ve zengin anlatım</span>
              </div>
            </button>
            <div class="rewriteai-more-tone-item rewriteai-custom-tone-item" data-tone="custom" role="button">
              <span class="rewriteai-more-tone-icon">⚙️</span>
              <div class="rewriteai-more-tone-text">
                <span class="rewriteai-more-tone-name" id="rewriteai-modal-custom-tone-name">Özel Tonum</span>
                <span class="rewriteai-more-tone-desc">Ayarlar sayfasında belirlediğiniz kişiselleştirilmiş prompt</span>
              </div>
              <span class="rewriteai-edit-custom-hint" id="rewriteai-edit-custom-hint" title="Ayarlarda düzenle">Düzenle ⚙️</span>
            </div>
          </div>
        </div>

        <div class="rewriteai-field">
          <div class="rewriteai-field-header">
            <label id="rewriteai-lbl-result">Dönüştürülen Sonuç:</label>
            <div class="rewriteai-twitter-bar rewriteai-twitter-inline" id="rewriteai-twitter-bar">
              <button id="rewriteai-twitter-btn" class="rewriteai-twitter-toggle" type="button" title="Twitter / X Modu (≤ 280 Karakter)">
                <span class="rewriteai-x-icon">𝕏</span>
                <span>X Modu</span>
              </button>
              <div class="rewriteai-toggle-pill" id="rewriteai-toggle-pill" title="Twitter / X Modunu Aç / Kapat">
                <div class="rewriteai-toggle-thumb"></div>
              </div>
            </div>
          </div>
          <textarea id="rewriteai-result-text" placeholder="Dönüşüm sonucunuz burada belirecek..." readonly></textarea>
          <div class="rewriteai-char-bar" id="rewriteai-char-bar">
            <span id="rewriteai-char-count">0 karakter</span>
          </div>
        </div>
      </div>

      <div class="rewriteai-modal-footer">
        <div class="rewriteai-footer-left">
          <div id="rewriteai-status-msg" class="rewriteai-status">Dönüşüm tonu seçin ve 'Dönüştür'e basın</div>
          <div id="rewriteai-modal-quota-badge" class="rewriteai-quota-badge">
            <span id="rewriteai-modal-quota-text">Bugün: 0 / 1.500 istek</span>
            <a id="rewriteai-modal-quota-link" href="https://aistudio.google.com/app/rate-limit" target="_blank" rel="noopener" class="rewriteai-quota-external" title="Google AI Studio Resmi Kota Paneli">Panel ↗</a>
          </div>
        </div>
        <div class="rewriteai-actions">
          <button id="rewriteai-apply-btn" class="rewriteai-btn-primary">⚡ Dönüştür</button>
          <button id="rewriteai-copy-btn" class="rewriteai-btn-secondary" disabled>📋 Kopyala</button>
          <button id="rewriteai-replace-btn" class="rewriteai-btn-accent" disabled>🔄 Sayfaya Yerleştir</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modalOverlay);

  // Stil Tanımları
  const style = document.createElement('style');
  style.textContent = `
    #rewriteai-trigger-btn {
      position: absolute;
      display: none;
      z-index: 2147483646;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #0f172a;
      border: 1px solid #38bdf8;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
      transition: transform 0.15s ease;
      user-select: none;
      align-items: center;
      justify-content: center;
      padding: 3px;
      box-sizing: border-box;
    }
    #rewriteai-trigger-btn:hover {
      transform: scale(1.15);
    }
    #rewriteai-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(4px);
      z-index: 2147483647;
      display: none;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .rewriteai-modal {
      width: 90%;
      max-width: 680px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 14px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
      color: #f8fafc;
      overflow: hidden;
      animation: rewriteai-fade 0.2s ease-out;
    }
    @keyframes rewriteai-fade {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .rewriteai-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      background: #1e293b;
      border-bottom: 1px solid #334155;
    }
    .rewriteai-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      cursor: pointer;
      transition: opacity 0.15s ease;
    }
    .rewriteai-brand:hover {
      opacity: 0.85;
    }
    .rewriteai-title {
      font-weight: 700;
      font-size: 15px;
      color: #38bdf8;
    }
    .rewriteai-version {
      font-size: 10px;
      font-weight: 700;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 1px 6px;
      border-radius: 99px;
      letter-spacing: 0.3px;
    }
    .rewriteai-header-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .rewriteai-select {
      background: #0f172a;
      border: 1px solid #334155;
      color: #38bdf8;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 6px;
      outline: none;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI Emoji", "Twemoji Mozilla", "Noto Color Emoji", "Segoe UI", Roboto, sans-serif;
    }
    .rewriteai-select:hover {
      border-color: #38bdf8;
    }
    /* Modal Özel Bayraklı Açılır Menü */
    .rewriteai-custom-lang-dropdown {
      position: relative;
    }
    .rewriteai-custom-dropdown-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #0f172a;
      border: 1px solid #334155;
      color: #38bdf8;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 6px;
      outline: none;
      cursor: pointer;
      transition: all 0.15s;
    }
    .rewriteai-custom-dropdown-btn:hover,
    .rewriteai-custom-lang-dropdown.open .rewriteai-custom-dropdown-btn {
      border-color: #38bdf8;
      box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
    }
    .rewriteai-custom-dropdown-flag {
      display: inline-block;
      width: 16px;
      height: 11px;
      border-radius: 2px;
      background-size: cover;
      background-position: center;
      flex-shrink: 0;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.15);
    }
    .rewriteai-custom-dropdown-text {
      white-space: nowrap;
    }
    .rewriteai-custom-dropdown-arrow {
      font-size: 9px;
      color: #94a3b8;
      transition: transform 0.2s;
    }
    .rewriteai-custom-lang-dropdown.open .rewriteai-custom-dropdown-arrow {
      transform: rotate(180deg);
    }
    .rewriteai-custom-dropdown-menu {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      min-width: 140px;
      max-height: 220px;
      overflow-y: auto;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.7);
      z-index: 1000;
      display: none;
      padding: 4px;
    }
    .rewriteai-custom-lang-dropdown.open .rewriteai-custom-dropdown-menu {
      display: block;
      animation: rewriteai-fade 0.15s ease-out;
    }
    .rewriteai-custom-dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 5px 8px;
      background: none;
      border: none;
      color: #cbd5e1;
      font-size: 11.5px;
      font-weight: 500;
      border-radius: 5px;
      cursor: pointer;
      text-align: left;
      transition: background 0.12s, color 0.12s;
      box-sizing: border-box;
      font-family: inherit;
    }
    .rewriteai-custom-dropdown-item:hover {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
    }
    .rewriteai-custom-dropdown-item.active {
      background: rgba(56, 189, 248, 0.25);
      color: #38bdf8;
      font-weight: 700;
    }
    .rewriteai-close-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 22px;
      cursor: pointer;
      line-height: 1;
    }
    .rewriteai-close-btn:hover { color: #fff; }
    .rewriteai-modal-body {
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      max-height: 75vh;
      overflow-y: auto;
    }
    .rewriteai-key-warning {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.4);
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      color: #fca5a5;
      animation: fadeInWarning 0.2s ease;
    }
    @keyframes fadeInWarning {
      from { opacity: 0; transform: translateY(-3px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .rewriteai-settings-btn {
      background: #ef4444;
      color: #fff;
      border: none;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s ease;
    }
    .rewriteai-settings-btn:hover {
      background: #dc2626;
    }
    .rewriteai-field-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .rewriteai-field label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .rewriteai-twitter-inline {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 2px 8px;
      background: #0f1d30;
      border: 1px solid #1e3a52;
      border-radius: 99px;
      transition: all 0.2s;
    }
    .rewriteai-twitter-inline.twitter-active {
      background: rgba(29, 155, 240, 0.15);
      border-color: rgba(29, 155, 240, 0.6);
    }
    .rewriteai-twitter-inline .rewriteai-twitter-toggle {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: #94a3b8;
    }
    .rewriteai-twitter-inline.twitter-active .rewriteai-twitter-toggle {
      color: #38bdf8;
      font-weight: 700;
    }
    .rewriteai-twitter-inline .rewriteai-x-icon {
      font-size: 12px;
    }
    .rewriteai-twitter-inline .rewriteai-toggle-pill {
      width: 26px;
      height: 14px;
      border-radius: 7px;
    }
    .rewriteai-twitter-inline .rewriteai-toggle-thumb {
      width: 10px;
      height: 10px;
      top: 2px;
      left: 2px;
    }
    .rewriteai-twitter-inline.twitter-active .rewriteai-toggle-thumb {
      transform: translateX(12px);
    }
    .rewriteai-preview-textarea {
      width: 100%;
      height: 90px;
      max-height: 120px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px;
      font-size: 13px;
      line-height: 1.4;
      color: #cbd5e1;
      resize: vertical;
      box-sizing: border-box;
      outline: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      transition: border-color 0.15s;
    }
    .rewriteai-preview-textarea:focus {
      border-color: #38bdf8;
      box-shadow: 0 0 0 2px rgba(56,189,248,0.12);
    }
    .rewriteai-preview-textarea::placeholder { color: #2d3f57; }
    .rewriteai-tone-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }
    .rewriteai-tone-btn {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 8px 4px 6px;
      color: #e2e8f0;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      min-width: 0;
      overflow: hidden;
    }
    .rewriteai-tone-emoji {
      font-size: 1.05rem;
      line-height: 1;
      display: block;
    }
    .rewriteai-tone-btn strong {
      font-size: 0.64rem;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
      width: 100%;
    }
    .rewriteai-tone-btn:hover { border-color: #38bdf8; background: #24344d; transform: translateY(-1px); }
    .rewriteai-tone-btn.active {
      border-color: #38bdf8;
      background: rgba(56, 189, 248, 0.18);
      color: #38bdf8;
      box-shadow: 0 0 8px rgba(56, 189, 248, 0.2);
    }
    .rewriteai-tone-more-btn.drawer-open {
      border-color: #38bdf8;
      background: rgba(56, 189, 248, 0.25);
    }
    .rewriteai-tone-more-btn.active-custom {
      border-color: #f59e0b;
      background: rgba(245, 158, 11, 0.18);
      color: #fbbf24;
      box-shadow: 0 0 8px rgba(245, 158, 11, 0.2);
    }
    /* Çekmece (Drawer) */
    .rewriteai-more-tones-drawer {
      display: none;
      flex-direction: column;
      gap: 6px;
      padding: 10px;
      background: #090d16;
      border: 1px solid #334155;
      border-radius: 10px;
      animation: rewriteai-fade 0.15s ease-out;
      margin-top: 2px;
    }
    .rewriteai-more-tones-drawer.open {
      display: flex;
    }
    .rewriteai-more-tones-header {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      padding: 2px 4px 6px;
      border-bottom: 1px solid #1e293b;
    }
    .rewriteai-more-tones-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 190px;
      overflow-y: auto;
    }
    .rewriteai-more-tone-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      background: #131b2e;
      border: 1px solid #1e293b;
      border-radius: 7px;
      color: #f1f5f9;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
      transition: all 0.15s ease;
      width: 100%;
      box-sizing: border-box;
    }
    .rewriteai-more-tone-item:hover {
      background: #1e2a47;
      border-color: #38bdf8;
      transform: translateX(2px);
    }
    .rewriteai-more-tone-item.active {
      background: rgba(56, 189, 248, 0.2);
      border-color: #38bdf8;
      box-shadow: 0 0 6px rgba(56, 189, 248, 0.25);
    }
    .rewriteai-more-tone-icon {
      font-size: 1.15rem;
      line-height: 1;
      flex-shrink: 0;
    }
    .rewriteai-more-tone-text {
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
      flex: 1;
    }
    .rewriteai-more-tone-name {
      font-size: 12px;
      font-weight: 700;
      color: #e2e8f0;
    }
    .rewriteai-more-tone-desc {
      font-size: 10.5px;
      color: #94a3b8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rewriteai-custom-tone-item {
      border: 1px dashed #f59e0b;
      background: rgba(245, 158, 11, 0.06);
    }
    .rewriteai-custom-tone-item:hover {
      background: rgba(245, 158, 11, 0.12);
      border-color: #fbbf24;
    }
    .rewriteai-custom-tone-item.active {
      background: rgba(245, 158, 11, 0.22);
      border-color: #fbbf24;
    }
    .rewriteai-edit-custom-hint {
      font-size: 10px;
      font-weight: 600;
      color: #fbbf24;
      background: rgba(245, 158, 11, 0.18);
      padding: 3px 6px;
      border-radius: 4px;
      border: 1px solid rgba(245, 158, 11, 0.35);
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.15s;
    }
    .rewriteai-edit-custom-hint:hover {
      background: rgba(245, 158, 11, 0.3);
    }
    /* Twitter Modu Satırı */
    .rewriteai-twitter-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 10px;
      background: #0f1d30;
      border: 1px solid #1e3a52;
      border-radius: 8px;
      transition: background 0.2s;
    }
    .rewriteai-twitter-bar.twitter-active {
      background: rgba(29, 155, 240, 0.1);
      border-color: rgba(29, 155, 240, 0.4);
    }
    .rewriteai-twitter-toggle {
      display: flex;
      align-items: center;
      gap: 7px;
      background: none;
      border: none;
      cursor: pointer;
      color: #94a3b8;
      font-size: 13px;
      font-weight: 600;
      font-family: inherit;
      padding: 0;
      transition: color 0.15s;
    }
    .rewriteai-twitter-bar.twitter-active .rewriteai-twitter-toggle { color: #1d9bf0; }
    .rewriteai-x-icon { font-size: 15px; font-weight: 900; line-height: 1; }
    .rewriteai-twitter-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .rewriteai-limit-hint {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .rewriteai-twitter-bar.twitter-active .rewriteai-limit-hint { opacity: 1; color: #1d9bf0; }
    .rewriteai-toggle-pill {
      width: 34px;
      height: 18px;
      border-radius: 9px;
      background: #334155;
      position: relative;
      cursor: pointer;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    .rewriteai-twitter-bar.twitter-active .rewriteai-toggle-pill { background: #1d9bf0; }
    .rewriteai-toggle-thumb {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #fff;
      position: absolute;
      top: 3px;
      left: 3px;
      transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow: 0 1px 3px rgba(0,0,0,0.35);
    }
    .rewriteai-twitter-bar.twitter-active .rewriteai-toggle-thumb { transform: translateX(16px); }
    /* Karakter Sayacı */
    .rewriteai-char-bar {
      display: flex;
      justify-content: flex-end;
      padding: 3px 8px;
      background: #020617;
      border: 1px solid #334155;
      border-top: none;
      border-radius: 0 0 8px 8px;
    }
    #rewriteai-char-count {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      transition: color 0.15s;
    }
    #rewriteai-char-count.over-limit { color: #f87171; }
    #rewriteai-char-count.near-limit { color: #fbbf24; }
    #rewriteai-char-count.ok-count { color: #34d399; }
    #rewriteai-result-text {
      width: 100%;
      height: 160px;
      min-height: 120px;
      background: #020617;
      border: 1px solid #334155;
      border-radius: 8px;
      color: #e2e8f0;
      padding: 12px;
      font-size: 13.5px;
      line-height: 1.6;
      resize: vertical;
      box-sizing: border-box;
      outline: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    #rewriteai-result-text::placeholder { color: #2d3f57; }
    #rewriteai-result-text:focus { border-color: #38bdf8; box-shadow: 0 0 0 2px rgba(56,189,248,0.12); }
    .rewriteai-modal-footer {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      background: #1e293b;
      border-top: 1px solid #334155;
    }
    .rewriteai-footer-left {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
    .rewriteai-status {
      font-size: 12px;
      color: #94a3b8;
    }
    .rewriteai-quota-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: #64748b;
    }
    .rewriteai-quota-badge span {
      color: #38bdf8;
      font-weight: 500;
    }
    .rewriteai-quota-external {
      color: #94a3b8;
      text-decoration: none;
      font-size: 11px;
    }
    .rewriteai-quota-external:hover {
      color: #38bdf8;
      text-decoration: underline;
    }
    .rewriteai-actions {
      display: flex;
      gap: 8px;
    }
    .rewriteai-actions button {
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .rewriteai-btn-primary {
      background: #0284c7;
      color: #fff;
    }
    .rewriteai-btn-primary:hover:not(:disabled) { background: #0369a1; }
    .rewriteai-btn-secondary {
      background: #334155;
      color: #fff;
    }
    .rewriteai-btn-secondary:hover:not(:disabled) { background: #475569; }
    .rewriteai-btn-accent {
      background: #059669;
      color: #fff;
    }
    .rewriteai-btn-accent:hover:not(:disabled) { background: #047857; }
    .rewriteai-actions button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);

  // Sayfa genelinde seçim ve odaklanan girdi alanlarını (input, textarea, contenteditable) sürekli takip et
  function captureCurrentSelection() {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      const start = activeEl.selectionStart;
      const end = activeEl.selectionEnd;
      if (typeof start === 'number' && typeof end === 'number' && end > start) {
        activeInputElement = activeEl;
        activeInputStart = start;
        activeInputEnd = end;
        currentSelectedText = activeEl.value.substring(start, end);
        selectionRange = null;
        return;
      }
    }

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const txt = sel.toString();
      if (txt && txt.trim().length > 0) {
        currentSelectedText = txt.trim();
        try {
          selectionRange = sel.getRangeAt(0).cloneRange();
        } catch {
          selectionRange = null;
        }
        activeInputElement = null;
      }
    }
  }

  document.addEventListener('selectionchange', () => {
    // Modal açıkken arkadaki seçimi kaybetme
    if (modalOverlay.style.display === 'flex') return;
    captureCurrentSelection();
  });

  document.addEventListener('contextmenu', (e) => {
    if (modalOverlay.contains(e.target)) return;
    captureCurrentSelection();
  });

  // Metin Seçim Takibi & Bubble Tetikleyici
  document.addEventListener('mouseup', (e) => {
    // Modal içindeki tıklamaları yok say
    if (modalOverlay.contains(e.target) || triggerBtn.contains(e.target)) return;

    captureCurrentSelection();

    safeStorageGet({ showSelectionBubble: false }, (items) => {
      if (!items || !items.showSelectionBubble) {
        triggerBtn.style.display = 'none';
        return;
      }

      setTimeout(() => {
        const selection = window.getSelection();
        const text = currentSelectedText || (selection ? selection.toString().trim() : '');

        if (text && text.length > 1) {
          if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
            const rect = selection.getRangeAt(0).getBoundingClientRect();
            triggerBtn.style.top = `${window.scrollY + rect.top - 36}px`;
            triggerBtn.style.left = `${window.scrollX + rect.right - 14}px`;
            triggerBtn.style.display = 'flex';
          } else if (activeInputElement) {
            const rect = activeInputElement.getBoundingClientRect();
            triggerBtn.style.top = `${window.scrollY + rect.top - 36}px`;
            triggerBtn.style.left = `${window.scrollX + rect.right - 14}px`;
            triggerBtn.style.display = 'flex';
          }
        } else {
          triggerBtn.style.display = 'none';
        }
      }, 10);
    });
  });

  // Butona tıklayınca modal aç (varsayılan tonla otomatik başlat)
  triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    triggerBtn.style.display = 'none';
    openModal(currentSelectedText, true);
  });

  // Modal Kontrolleri
  const closeBtn = document.getElementById('rewriteai-modal-close');
  const previewBox = document.getElementById('rewriteai-preview-text');
  const resultBox = document.getElementById('rewriteai-result-text');
  const statusMsg = document.getElementById('rewriteai-status-msg');
  const applyBtn = document.getElementById('rewriteai-apply-btn');
  const copyBtn = document.getElementById('rewriteai-copy-btn');
  const replaceBtn = document.getElementById('rewriteai-replace-btn');
  const toneBtns = document.querySelectorAll('.rewriteai-tone-btn:not(#rewriteai-more-tones-toggle-btn)');
  const modelSelect = document.getElementById('rewriteai-modal-model-select');
  const targetLangSelect = document.getElementById('rewriteai-modal-target-lang-select');

  let selectedTone = 'fix_grammar';
  let targetLang = 'auto';
  let modalTwitterMode = false;

  // Twitter modu DOM ref'leri
  const twitterBarEl = document.getElementById('rewriteai-twitter-bar');
  const twitterBtnEl = document.getElementById('rewriteai-twitter-btn');
  const twitterPillEl = document.getElementById('rewriteai-toggle-pill');
  const charCountEl = document.getElementById('rewriteai-char-count');

  // Twitter modu UI güncelleme
  function applyModalTwitterUI() {
    if (modalTwitterMode) {
      twitterBarEl && twitterBarEl.classList.add('twitter-active');
    } else {
      twitterBarEl && twitterBarEl.classList.remove('twitter-active');
    }
  }

  // Karakter sayacı güncelle
  function updateModalCharCount(text) {
    if (!charCountEl) return;
    const len = (text || '').length;
    charCountEl.className = '';
    if (modalTwitterMode) {
      charCountEl.textContent = `${len} / 280`;
      if (len > 280) charCountEl.classList.add('over-limit');
      else if (len > 240) charCountEl.classList.add('near-limit');
      else if (len > 0) charCountEl.classList.add('ok-count');
    } else {
      const charLabel = curLang === 'en' ? 'characters' : 'karakter';
      charCountEl.textContent = `${len} ${charLabel}`;
      if (len > 0) charCountEl.classList.add('ok-count');
    }
  }

  // Toggle
  if (twitterBtnEl) {
    twitterBtnEl.addEventListener('click', () => {
      modalTwitterMode = !modalTwitterMode;
      safeStorageSet({ twitterMode: modalTwitterMode });
      applyModalTwitterUI();
      updateModalCharCount(resultBox ? resultBox.value : '');
    });
  }
  if (twitterPillEl) {
    twitterPillEl.addEventListener('click', () => {
      if (twitterBtnEl) twitterBtnEl.click();
    });
  }

  const moreTonesToggleBtn = document.getElementById('rewriteai-more-tones-toggle-btn');
  const moreTonesIcon = document.getElementById('rewriteai-more-tones-icon');
  const moreTonesLabel = document.getElementById('rewriteai-more-tones-label');
  const moreTonesDrawer = document.getElementById('rewriteai-more-tones-drawer');
  const moreToneItems = document.querySelectorAll('.rewriteai-more-tone-item');
  const modalCustomToneName = document.getElementById('rewriteai-modal-custom-tone-name');
  const editCustomHint = document.getElementById('rewriteai-edit-custom-hint');

  // Çekmeceyi Aç / Kapat
  if (moreTonesToggleBtn && moreTonesDrawer) {
    moreTonesToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = moreTonesDrawer.classList.toggle('open');
      moreTonesToggleBtn.classList.toggle('drawer-open', isOpen);
    });

    document.addEventListener('click', (e) => {
      if (moreTonesDrawer.classList.contains('open') && !moreTonesDrawer.contains(e.target) && !moreTonesToggleBtn.contains(e.target)) {
        moreTonesDrawer.classList.remove('open');
        moreTonesToggleBtn.classList.remove('drawer-open');
      }
    });
  }

  // Çekmece İçi Ton Seçimi
  moreToneItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('#rewriteai-edit-custom-hint')) return;
      const toneKey = item.getAttribute('data-tone');
      selectedTone = toneKey;

      toneBtns.forEach((b) => b.classList.remove('active'));
      moreToneItems.forEach((b) => b.classList.remove('active'));
      item.classList.add('active');

      if (moreTonesToggleBtn) {
        moreTonesToggleBtn.classList.add('active', 'active-custom');
        const iconSpan = item.querySelector('.rewriteai-more-tone-icon');
        const nameSpan = item.querySelector('.rewriteai-more-tone-name');
        if (iconSpan && moreTonesIcon) moreTonesIcon.textContent = iconSpan.textContent;
        if (nameSpan && moreTonesLabel) {
          const shortName = nameSpan.textContent.split('&')[0].split('/')[0].trim();
          moreTonesLabel.textContent = `${shortName} ▾`;
        }
      }

      if (moreTonesDrawer) {
        moreTonesDrawer.classList.remove('open');
        moreTonesToggleBtn.classList.remove('drawer-open');
      }

      // Metin varsa anında dönüştür
      const hasText = (previewBox && previewBox.value.trim()) || currentSelectedText;
      if (hasText && !applyBtn.disabled) {
        resultBox.value = '';
        copyBtn.disabled = true;
        replaceBtn.disabled = true;
        applyBtn.click();
      }
    });
  });

  // Özel Tonu Düzenle Butonu (Ayarları aç)
  if (editCustomHint) {
    editCustomHint.addEventListener('click', (e) => {
      e.stopPropagation();
      safeSendMessage({ type: 'OPEN_OPTIONS' });
    });
  }

  toneBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      toneBtns.forEach((b) => b.classList.remove('active'));
      moreToneItems.forEach((b) => b.classList.remove('active'));
      if (moreTonesToggleBtn) {
        moreTonesToggleBtn.classList.remove('active', 'active-custom');
        if (moreTonesIcon) moreTonesIcon.textContent = '✨';
        if (moreTonesLabel) moreTonesLabel.textContent = t.moreTonesBtn || (curLang === 'en' ? 'Others ▾' : 'Diğerleri ▾');
      }
      if (moreTonesDrawer) moreTonesDrawer.classList.remove('open');

      btn.classList.add('active');
      selectedTone = btn.getAttribute('data-tone');

      // Metin varsa ve dönüştürme çalışmıyorsa otomatik başlat
      const hasText = (previewBox && previewBox.value.trim()) || currentSelectedText;
      if (hasText && !applyBtn.disabled) {
        // Sonucu temizle ve anında dönüştür
        resultBox.value = '';
        copyBtn.disabled = true;
        replaceBtn.disabled = true;
        applyBtn.click();
      }
    });
  });

  const quotaBadgeEl = document.getElementById('rewriteai-modal-quota-badge');
  const quotaTextEl = document.getElementById('rewriteai-modal-quota-text');
  const quotaLinkEl = document.getElementById('rewriteai-modal-quota-link');
  const keyWarningEl = document.getElementById('rewriteai-key-warning');
  const keyWarningTextEl = document.getElementById('rewriteai-key-warning-text');
  const openSettingsBtn = document.getElementById('rewriteai-open-settings-btn');

  // Modal Özel Bayraklı Açılır Menü DOM Ref'leri
  const modalLangDropdown = document.getElementById('rewriteai-modal-lang-dropdown');
  const modalLangBtn = document.getElementById('rewriteai-modal-lang-btn');
  const modalLangMenu = document.getElementById('rewriteai-modal-lang-menu');
  const modalSelectedFlag = document.getElementById('rewriteai-modal-selected-flag');
  const modalSelectedText = document.getElementById('rewriteai-modal-selected-text');

  function updateModalCustomDropdownUI(val) {
    const item = TARGET_LANG_ITEMS.find((it) => it.code === val) || TARGET_LANG_ITEMS[0];
    const flagSvg = FLAG_SVGS[item.code] || FLAG_SVGS.auto;
    const name = curLang === 'en' ? item.nameEn : item.nameTr;

    if (modalSelectedFlag) {
      modalSelectedFlag.style.backgroundImage = `url("${flagSvg}")`;
    }
    if (modalSelectedText) {
      modalSelectedText.textContent = name;
    }
    if (modalLangMenu) {
      modalLangMenu.querySelectorAll('.rewriteai-custom-dropdown-item').forEach((el) => {
        el.classList.toggle('active', el.getAttribute('data-code') === item.code);
      });
    }
  }

  function renderModalTargetLang() {
    if (!modalLangMenu) return;
    const currentVal = targetLangSelect ? (targetLangSelect.value || targetLang) : targetLang;

    // Özel bayraklı menüyü oluştur
    modalLangMenu.innerHTML = '';
    TARGET_LANG_ITEMS.forEach((it) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `rewriteai-custom-dropdown-item ${it.code === currentVal ? 'active' : ''}`;
      btn.setAttribute('data-code', it.code);

      const flagSpan = document.createElement('span');
      flagSpan.className = 'rewriteai-custom-dropdown-flag';
      flagSpan.style.backgroundImage = `url("${FLAG_SVGS[it.code] || FLAG_SVGS.auto}")`;

      const textSpan = document.createElement('span');
      textSpan.textContent = curLang === 'en' ? it.nameEn : it.nameTr;

      btn.appendChild(flagSpan);
      btn.appendChild(textSpan);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        targetLang = it.code;
        if (targetLangSelect) targetLangSelect.value = targetLang;
        safeStorageSet({ selectedTargetLanguage: targetLang });
        updateModalCustomDropdownUI(targetLang);
        modalLangDropdown && modalLangDropdown.classList.remove('open');
      });

      modalLangMenu.appendChild(btn);
    });

    // Native select güncelle (yedek)
    if (targetLangSelect) {
      targetLangSelect.innerHTML = TARGET_LANG_ITEMS.map((it) => {
        const name = curLang === 'en' ? it.nameEn : it.nameTr;
        return `<option value="${it.code}">${name}</option>`;
      }).join('');
      targetLangSelect.value = currentVal;
    }

    updateModalCustomDropdownUI(currentVal);
  }

  // Dropdown açma / kapatma
  if (modalLangBtn) {
    modalLangBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      modalLangDropdown && modalLangDropdown.classList.toggle('open');
    });
  }

  document.addEventListener('click', (e) => {
    if (modalLangDropdown && !modalLangDropdown.contains(e.target)) {
      modalLangDropdown.classList.remove('open');
    }
  });

  // Modal Arayüz Dilini Güncelle
  function applyModalLanguage() {
    t = I18N[curLang] || I18N.tr;

    // Başlık & Buton İpuçları
    const modalTitleEl = document.getElementById('rewriteai-modal-title');
    if (modalTitleEl) modalTitleEl.textContent = t.appName;
    const modalVerEl = document.getElementById('rewriteai-modal-version');
    if (modalVerEl && chrome.runtime && chrome.runtime.getManifest) {
      try {
        modalVerEl.textContent = `v${chrome.runtime.getManifest().version}`;
      } catch {
        modalVerEl.textContent = 'v2.2';
      }
    }
    if (triggerBtn) triggerBtn.title = t.triggerBtnTitle;

    // Etiketler & Placeholder
    const lblSelected = document.getElementById('rewriteai-lbl-selected');
    const lblResult = document.getElementById('rewriteai-lbl-result');
    if (lblSelected) lblSelected.textContent = t.selectedText;
    if (lblResult) lblResult.textContent = t.convertedResult;
    if (resultBox) resultBox.placeholder = t.resultPlaceholder;

    // Butonlar
    if (applyBtn && !applyBtn.disabled) applyBtn.textContent = t.transform;
    if (copyBtn) copyBtn.textContent = t.copy;
    if (replaceBtn) replaceBtn.textContent = t.replaceInPage;
    if (openSettingsBtn) openSettingsBtn.textContent = t.goToSettings;
    if (quotaLinkEl) quotaLinkEl.textContent = t.quotaPanel;

    // Model & Hedef Dil Seçim Listesini dinamik doldur
    renderModalModels();
    renderModalTargetLang();

    // Ton Butonları (Açıklamasız, sadece başlık — popup.js ile aynı cleanTitle mantığı)
    toneBtns.forEach((btn) => {
      const toneKey = btn.getAttribute('data-tone');
      if (t.tones && t.tones[toneKey]) {
        const strongEl = btn.querySelector('strong');
        if (strongEl) {
          const fullTitle = t.tones[toneKey].title;
          const cleanTitle = fullTitle.replace(/^[^\wğüşıöçĞÜŞİÖÇa-zA-Z0-9]+/, '').split('&')[0].trim();
          strongEl.textContent = cleanTitle || fullTitle;
        }
      }
    });

    if (moreTonesLabel && !moreTonesToggleBtn.classList.contains('active-custom')) {
      moreTonesLabel.textContent = t.moreTonesBtn || (curLang === 'en' ? 'Others ▾' : 'Diğerleri ▾');
    }

    // Çekmece başlığı
    const drawerHeaderEl = document.getElementById('rewriteai-more-tones-header-text');
    if (drawerHeaderEl) {
      drawerHeaderEl.textContent = curLang === 'en' ? '✨ More Tones & Custom Template' : '✨ Diğer Tonlar ve Özel Şablon';
    }

    // editCustomHint butonu
    if (editCustomHint) {
      editCustomHint.textContent = curLang === 'en' ? 'Edit ⚙️' : 'Düzenle ⚙️';
    }

    // Çekmece içi tonlar
    moreToneItems.forEach((item) => {
      const toneKey = item.getAttribute('data-tone');
      if (toneKey === 'custom') return;
      if (t.tones && t.tones[toneKey]) {
        const nameEl = item.querySelector('.rewriteai-more-tone-name');
        const descEl = item.querySelector('.rewriteai-more-tone-desc');
        if (nameEl) nameEl.textContent = t.tones[toneKey].title;
        if (descEl) descEl.textContent = t.tones[toneKey].desc;
      }
    });
  }

  function renderModalModels() {
    if (!modelSelect) return;
    const currentVal = modelSelect.value;
    modelSelect.innerHTML = '';
    const groups = {};

    const modelDefs = [
      { id: 'gemini-3.5-flash-lite', provider: 'gemini' },
      { id: 'gemini-3.8-flash', provider: 'gemini' },
      { id: 'gemini-3.7-flash', provider: 'gemini' },
      { id: 'llama-3.3-70b-versatile', provider: 'groq' },
      { id: 'llama-3.1-8b-instant', provider: 'groq' },
      { id: 'command-a', provider: 'cohere' },
      { id: 'command-r7b-12-2024', provider: 'cohere' },
      { id: 'Qwen/Qwen2.5-72B-Instruct', provider: 'hf' },
      { id: 'gpt-4o-mini', provider: 'openai' },
      { id: 'gpt-4o', provider: 'openai' },
      { id: 'claude-3-5-haiku-20241022', provider: 'claude' },
      { id: 'claude-3-5-sonnet-20241022', provider: 'claude' },
      { id: 'deepseek-chat', provider: 'deepseek' }
    ];

    modelDefs.forEach((m) => {
      const groupKey = m.provider;
      const groupLabel = (t.modelGroups && t.modelGroups[groupKey]) ? t.modelGroups[groupKey] : groupKey;

      if (!groups[groupKey]) {
        const optGroup = document.createElement('optgroup');
        optGroup.label = groupLabel;
        groups[groupKey] = optGroup;
        modelSelect.appendChild(optGroup);
      }

      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = (t.models && t.models[m.id]) ? t.models[m.id] : m.id;
      groups[groupKey].appendChild(opt);
    });

    if (currentVal) modelSelect.value = currentVal;
  }

  // Storage değişikliklerini dinle (örneğin Ayarlar'da dil değiştirilirse anında güncelle)
  try {
    if (isContextValid() && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (!isContextValid()) return;
        if (area === 'local' && changes.uiLanguage && changes.uiLanguage.newValue) {
          curLang = changes.uiLanguage.newValue;
          applyModalLanguage();
        }
      });
    }
  } catch {
    // Context invalidated durumunda dinleyici hata fırlatırsa yut
  }

  // Sağlayıcı ve anahtar eşleşmesi kontrol fonksiyonu
  function checkModelKeyStatus(modelId, callback) {
    let providerName = 'Google Gemini';
    let keyStorageName = 'apiKey';

    if (modelId.startsWith('gemini')) {
      providerName = 'Google Gemini';
      keyStorageName = 'apiKey';
    } else if (modelId.startsWith('llama')) {
      providerName = 'Groq';
      keyStorageName = 'groqApiKey';
    } else if (modelId.startsWith('command')) {
      providerName = 'Cohere';
      keyStorageName = 'cohereApiKey';
    } else if (modelId.includes('Qwen') || modelId.includes('/')) {
      providerName = 'Hugging Face';
      keyStorageName = 'hfApiKey';
    } else if (modelId.startsWith('gpt')) {
      providerName = 'OpenAI';
      keyStorageName = 'openaiApiKey';
    } else if (modelId.startsWith('claude')) {
      providerName = 'Anthropic Claude';
      keyStorageName = 'anthropicApiKey';
    } else if (modelId.startsWith('deepseek')) {
      providerName = 'DeepSeek';
      keyStorageName = 'deepseekApiKey';
    }

    safeStorageGet([keyStorageName], (data) => {
      const hasKey = !!(data && data[keyStorageName] && data[keyStorageName].trim());
      if (!hasKey) {
        if (keyWarningEl) {
          keyWarningTextEl.textContent = t.keyMissingWarning.replace('{provider}', providerName);
          keyWarningEl.style.display = 'flex';
        }
        if (statusMsg) {
          statusMsg.textContent = t.keyMissingStatus.replace('{provider}', providerName);
        }
      } else {
        if (keyWarningEl) {
          keyWarningEl.style.display = 'none';
        }
      }
      if (callback) callback(hasKey);
    });
  }

  // Ayarlar sayfasını açma butonu
  if (openSettingsBtn) {
    openSettingsBtn.addEventListener('click', () => {
      safeSendMessage({ type: 'OPEN_OPTIONS' });
    });
  }

  function updateModalQuota() {
    const curModel = modelSelect ? modelSelect.value : 'gemini-3.5-flash-lite';
    const isGemini = curModel.startsWith('gemini');

    if (!isGemini) {
      if (quotaBadgeEl) quotaBadgeEl.style.display = 'none';
      return;
    }

    if (quotaBadgeEl) quotaBadgeEl.style.display = 'flex';
    const today = new Date().toISOString().slice(0, 10);
    safeStorageGet(['modelUsageStats'], (data) => {
      const stats = (data && data.modelUsageStats) ? data.modelUsageStats : {};
      const counts = (stats.date === today && stats.counts) ? stats.counts : {};
      const count = counts[curModel] || 0;
      if (quotaTextEl) {
        quotaTextEl.textContent = t.quotaText(count);
      }
    });
  }

  function openModal(text, autoRun = false) {
    previewBox.value = text;
    resultBox.value = '';
    copyBtn.disabled = true;
    replaceBtn.disabled = true;

    // Güncel dili ve ayarları yükle
    safeStorageGet({
      uiLanguage: '',
      selectedModel: 'gemini-3.5-flash-lite',
      defaultTone: 'fix_grammar'
    }, (items) => {
      if (!items) return;
      if (items.uiLanguage === 'tr' || items.uiLanguage === 'en') {
        curLang = items.uiLanguage;
      } else {
        const browserLang = (navigator.language || navigator.userLanguage || 'tr').toLowerCase();
        curLang = browserLang.startsWith('tr') ? 'tr' : 'en';
      }

      applyModalLanguage();
      statusMsg.textContent = t.statusDefault;

      const activeModel = items.selectedModel || 'gemini-3.5-flash-lite';
      if (modelSelect) {
        modelSelect.value = activeModel;
      }

      // Kayıtlı hedef çıktı dili seçimi
      safeStorageGet({ selectedTargetLanguage: 'auto' }, (langData) => {
        if (langData && langData.selectedTargetLanguage) {
          targetLang = langData.selectedTargetLanguage;
          if (targetLangSelect) targetLangSelect.value = targetLang;
          updateModalCustomDropdownUI(targetLang);
        }
      });

      // Twitter modu yükle
      safeStorageGet({ twitterMode: false }, (twData) => {
        if (twData) {
          modalTwitterMode = !!twData.twitterMode;
          applyModalTwitterUI();
          updateModalCharCount('');
        }
      });

      // Özel Ton Başlığını Yansıt
      safeStorageGet({ customToneTitle: 'Benim Tonum' }, (customData) => {
        if (customData && customData.customToneTitle && modalCustomToneName) {
          modalCustomToneName.textContent = customData.customToneTitle;
        }
      });

      if (items.defaultTone) {
        selectedTone = items.defaultTone;
        let foundInMainGrid = false;
        toneBtns.forEach((btn) => {
          const match = btn.getAttribute('data-tone') === selectedTone;
          btn.classList.toggle('active', match);
          if (match) foundInMainGrid = true;
        });

        if (foundInMainGrid) {
          if (moreTonesToggleBtn) {
            moreTonesToggleBtn.classList.remove('active', 'active-custom');
            if (moreTonesIcon) moreTonesIcon.textContent = '✨';
            if (moreTonesLabel) moreTonesLabel.textContent = t.moreTonesBtn || (curLang === 'en' ? 'Others ▾' : 'Diğerleri ▾');
          }
          moreToneItems.forEach((b) => b.classList.remove('active'));
        } else {
          let matchedDrawerItem = null;
          moreToneItems.forEach((b) => {
            const match = b.getAttribute('data-tone') === selectedTone;
            b.classList.toggle('active', match);
            if (match) matchedDrawerItem = b;
          });
          if (matchedDrawerItem && moreTonesToggleBtn) {
            moreTonesToggleBtn.classList.add('active', 'active-custom');
            const iconSpan = matchedDrawerItem.querySelector('.rewriteai-more-tone-icon');
            const nameSpan = matchedDrawerItem.querySelector('.rewriteai-more-tone-name');
            if (iconSpan && moreTonesIcon) moreTonesIcon.textContent = iconSpan.textContent;
            if (nameSpan && moreTonesLabel) {
              const shortName = nameSpan.textContent.split('&')[0].split('/')[0].trim();
              moreTonesLabel.textContent = `${shortName} ▾`;
            }
          }
        }
      }

      updateModalQuota();
      checkModelKeyStatus(activeModel, (hasKey) => {
        // Otomatik çalıştırma istendiyse ve anahtar varsa hemen dönüştür
        if (autoRun) {
          if (hasKey) {
            applyBtn.click();
          } else {
            statusMsg.textContent = t.autoRunStopped;
          }
        }
      });
    });

    modalOverlay.style.display = 'flex';
  }

  // Model kutudan değiştirilirse tercihi kalıcı olarak kaydet (Varsayılan Sistem Modeli yap)
  if (modelSelect) {
    modelSelect.addEventListener('change', () => {
      const newModel = modelSelect.value;
      safeStorageSet({ selectedModel: newModel }, () => {
        updateModalQuota();
        checkModelKeyStatus(newModel, (hasKey) => {
          if (hasKey) {
            statusMsg.textContent = `${t.statusDefaultModelUpdated}: ${modelSelect.options[modelSelect.selectedIndex].text}`;
          }
        });
      });
    });
  }

  // Hedef çıktı dili kutudan değiştirilirse tercihi kalıcı olarak kaydet
  if (targetLangSelect) {
    targetLangSelect.addEventListener('change', () => {
      targetLang = targetLangSelect.value;
      safeStorageSet({ selectedTargetLanguage: targetLang });
    });
  }

  function closeModal() {
    modalOverlay.style.display = 'none';
  }

  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Dönüştürme İsteği (Background üzerinden çalıştırma)
  applyBtn.addEventListener('click', async () => {
    // Kullanıcının düzenlediği metin öncelikli; düzenlenmemişse orijinal seçim
    const textToTransform = (previewBox && previewBox.value.trim()) || currentSelectedText;
    if (!textToTransform) return;

    if (!isContextValid()) {
      statusMsg.textContent = t.contextInvalidated;
      return;
    }

    applyBtn.disabled = true;
    applyBtn.textContent = t.processing;
    statusMsg.textContent = t.statusProcessing;

    const chosenModel = modelSelect ? modelSelect.value : 'gemini-3.5-flash-lite';
    const chosenTargetLang = targetLangSelect ? targetLangSelect.value : targetLang;

    safeSendMessage({
      type: 'TRANSFORM_TEXT',
      text: textToTransform,
      tone: selectedTone,
      model: chosenModel,
      targetLanguage: chosenTargetLang,
      twitterMode: modalTwitterMode
    }, (response) => {
      applyBtn.disabled = false;
      applyBtn.textContent = t.transform;

      if (response && response.success) {
        resultBox.value = response.result;
        copyBtn.disabled = false;
        replaceBtn.disabled = false;
        statusMsg.textContent = t.statusDone;
        updateModalCharCount(response.result);
        updateModalQuota();
      } else {
        const err = response?.error || 'Bilinmeyen bir hata oluştu.';
        statusMsg.textContent = `Hata / Error: ${err}`;
      }
    });
  });

  // Sonucu Kopyala
  copyBtn.addEventListener('click', async () => {
    if (!resultBox.value) return;
    try {
      await navigator.clipboard.writeText(resultBox.value);
      const orig = copyBtn.textContent;
      copyBtn.textContent = t.copied;
      setTimeout(() => { copyBtn.textContent = orig; }, 1500);
    } catch {
      // Pano izni engellendiyse
    }
  });

  // Sayfadaki metni doğrudan değiştir (Input, Textarea, ContentEditable ve Genel DOM Desteği)
  replaceBtn.addEventListener('click', () => {
    const replacementText = resultBox.value;
    if (!replacementText) return;

    let replaced = false;

    // 1. Durum: INPUT veya TEXTAREA içindeyse
    if (activeInputElement && (activeInputElement.tagName === 'INPUT' || activeInputElement.tagName === 'TEXTAREA')) {
      try {
        const val = activeInputElement.value;
        const start = activeInputStart;
        const end = activeInputEnd;

        // execCommand 'insertText' dener (Undo geçmişi korunur)
        activeInputElement.focus();
        activeInputElement.setSelectionRange(start, end);
        const success = document.execCommand('insertText', false, replacementText);

        if (!success) {
          // Doğrudan değer değiştirme ve input event tetikleme
          activeInputElement.value = val.substring(0, start) + replacementText + val.substring(end);
          const newPos = start + replacementText.length;
          activeInputElement.setSelectionRange(newPos, newPos);
          activeInputElement.dispatchEvent(new Event('input', { bubbles: true }));
          activeInputElement.dispatchEvent(new Event('change', { bubbles: true }));
        }
        replaced = true;
      } catch (err) {
        // Fallback aşağıya devam eder
      }
    }

    // 2. Durum: DOM Range üzerinden değiştirme
    if (!replaced && selectionRange) {
      try {
        // Seçim alanını geri yükle
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(selectionRange);
        }

        // execCommand ile contenteditable / zengin editörlerde deneme
        const execSuccess = document.execCommand('insertText', false, replacementText);
        if (execSuccess) {
          replaced = true;
        } else {
          // Range düğüm değişimi
          selectionRange.deleteContents();
          const textNode = document.createTextNode(replacementText);
          selectionRange.insertNode(textNode);
          
          // Yeni imleç pozisyonunu metin sonuna al
          const newRange = document.createRange();
          newRange.setStartAfter(textNode);
          newRange.collapse(true);
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(newRange);
          }
          replaced = true;
        }
      } catch (err) {
        // DOM değiştirilemezse (örneğin salt okunur bir yer veya iframe)
      }
    }

    if (replaced) {
      closeModal();
    } else {
      statusMsg.textContent = t.pageReplaceError;
      // Kolaylık olsun diye otomatik kopyala ve kullanıcıya bildir
      navigator.clipboard.writeText(replacementText).then(() => {
        statusMsg.textContent = `${t.pageReplaceError} (${t.copied}!)`;
      }).catch(() => {});
    }
  });

  // Background'dan doğrudan aç komutu gelirse (Sağ tık menüsünden tetiklenme)
  try {
    if (isContextValid() && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((request) => {
        if (!isContextValid()) return;
        if (request.type === 'OPEN_REWRITE_MODAL') {
          currentSelectedText = request.text;
          openModal(request.text, true); // Varsayılan tonla doğrudan çalıştır
        }
      });
    }
  } catch {
    // Context invalidated durumunda dinleyici hatasını yakala
  }
})();
