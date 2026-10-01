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

  // Çeviri Sözlüğü (Content Script içinde bağımsız çalışabilmesi için)
  const I18N = {
    tr: {
      appName: 'RewriteAI Metin Düzenleyici',
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
      tones: {
        fix_grammar: { title: '✍️ İmla & Dilbilgisi' },
        daily: { title: '💬 Günlük & Samimi' },
        formal: { title: '💼 Resmi & Kurumsal' },
        slang: { title: '🔥 Argo & Sokak Ağzı' },
        academic: { title: '🎓 Akademik & Ağır' },
        gamer: { title: '🎮 Gamer' },
        techie: { title: '💻 Teknoloji Kurdu' },
        summarize: { title: '📌 Özetle' }
      },
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
      appName: 'RewriteAI Text Editor',
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
      tones: {
        fix_grammar: { title: '✍️ Grammar & Spelling' },
        daily: { title: '💬 Casual & Friendly' },
        formal: { title: '💼 Formal & Corporate' },
        slang: { title: '🔥 Slang & Street' },
        academic: { title: '🎓 Academic & Formal' },
        gamer: { title: '🎮 Gamer' },
        techie: { title: '💻 Tech Geek' },
        summarize: { title: '📌 Summarize' }
      },
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
        <div class="rewriteai-brand">
          <img src="${iconUrl}" alt="RewriteAI" style="width:22px;height:22px;border-radius:4px;">
          <span class="rewriteai-title" id="rewriteai-modal-title">RewriteAI Metin Düzenleyici</span>
        </div>
        <div class="rewriteai-header-controls">
          <select id="rewriteai-modal-target-lang-select" class="rewriteai-select" title="Çıktı Dili">
            <option value="auto">🌐 Orijinal Dil (Oto)</option>
            <option value="tr">🇹🇷 Türkçe</option>
            <option value="en">🇬🇧 English</option>
          </select>
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
          <div id="rewriteai-preview-text" class="rewriteai-text-box"></div>
        </div>

        <div class="rewriteai-tone-grid">
          <button class="rewriteai-tone-btn active" data-tone="fix_grammar" type="button">
            <strong>✍️ İmla & Dilbilgisi</strong>
          </button>
          <button class="rewriteai-tone-btn" data-tone="daily" type="button">
            <strong>💬 Günlük & Samimi</strong>
          </button>
          <button class="rewriteai-tone-btn" data-tone="formal" type="button">
            <strong>💼 Resmi & Kurumsal</strong>
          </button>
          <button class="rewriteai-tone-btn" data-tone="slang" type="button">
            <strong>🔥 Argo & Sokak Ağzı</strong>
          </button>
          <button class="rewriteai-tone-btn" data-tone="academic" type="button">
            <strong>🎓 Akademik & Ağır</strong>
          </button>
          <button class="rewriteai-tone-btn" data-tone="gamer" type="button">
            <strong>🎮 Gamer</strong>
          </button>
          <button class="rewriteai-tone-btn" data-tone="techie" type="button">
            <strong>💻 Teknoloji Kurdu</strong>
          </button>
          <button class="rewriteai-tone-btn" data-tone="summarize" type="button">
            <strong>📌 Özetle</strong>
          </button>
        </div>

        <div class="rewriteai-field">
          <label id="rewriteai-lbl-result">Dönüştürülen Sonuç:</label>
          <textarea id="rewriteai-result-text" placeholder="Dönüşüm sonucunuz burada belirecek..." readonly></textarea>
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
      max-width: 580px;
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
      gap: 10px;
    }
    .rewriteai-title {
      font-weight: 700;
      font-size: 15px;
      color: #38bdf8;
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
    }
    .rewriteai-select:hover {
      border-color: #38bdf8;
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
    .rewriteai-field label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .rewriteai-text-box {
      max-height: 90px;
      overflow-y: auto;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px;
      font-size: 13px;
      line-height: 1.4;
      color: #cbd5e1;
    }
    .rewriteai-tone-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 7px;
    }
    .rewriteai-tone-btn {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 9px 6px;
      color: #e2e8f0;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .rewriteai-tone-btn strong {
      font-size: 11.5px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rewriteai-tone-btn:hover { border-color: #38bdf8; background: #24344d; transform: translateY(-1px); }
    .rewriteai-tone-btn.active {
      border-color: #38bdf8;
      background: rgba(56, 189, 248, 0.18);
      color: #38bdf8;
      box-shadow: 0 0 8px rgba(56, 189, 248, 0.2);
    }
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
  const toneBtns = document.querySelectorAll('.rewriteai-tone-btn');
  const modelSelect = document.getElementById('rewriteai-modal-model-select');
  const targetLangSelect = document.getElementById('rewriteai-modal-target-lang-select');

  let selectedTone = 'fix_grammar';
  let targetLang = 'auto';

  toneBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      toneBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTone = btn.getAttribute('data-tone');

      // Metin varsa ve dönüştürme çalışmıyorsa otomatik başlat
      if (currentSelectedText && !applyBtn.disabled) {
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

  function renderModalTargetLang() {
    if (!targetLangSelect) return;
    const currentVal = targetLangSelect.value || targetLang;
    targetLangSelect.innerHTML = `
      <option value="auto">${t.autoLang || '🌐 Orijinal Dil (Oto)'}</option>
      <option value="tr">${t.langTurkish || '🇹🇷 Türkçe'}</option>
      <option value="en">${t.langEnglish || '🇬🇧 English'}</option>
    `;
    targetLangSelect.value = currentVal;
  }

  // Modal Arayüz Dilini Güncelle
  function applyModalLanguage() {
    t = I18N[curLang] || I18N.tr;

    // Başlık & Buton İpuçları
    const modalTitleEl = document.getElementById('rewriteai-modal-title');
    if (modalTitleEl) modalTitleEl.textContent = t.appName;
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

    // Ton Butonları (Açıklamasız, sadece başlık)
    toneBtns.forEach((btn) => {
      const toneKey = btn.getAttribute('data-tone');
      if (t.tones && t.tones[toneKey]) {
        const strongEl = btn.querySelector('strong');
        if (strongEl) strongEl.textContent = t.tones[toneKey].title;
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
    previewBox.textContent = text;
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
        }
      });

      if (items.defaultTone) {
        selectedTone = items.defaultTone;
        toneBtns.forEach((btn) => {
          if (btn.getAttribute('data-tone') === selectedTone) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
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
    if (!currentSelectedText) return;

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
      text: currentSelectedText,
      tone: selectedTone,
      model: chosenModel,
      targetLanguage: chosenTargetLang
    }, (response) => {
      applyBtn.disabled = false;
      applyBtn.textContent = t.transform;

      if (response && response.success) {
        resultBox.value = response.result;
        copyBtn.disabled = false;
        replaceBtn.disabled = false;
        statusMsg.textContent = t.statusDone;
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
