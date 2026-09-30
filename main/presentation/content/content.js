(function() {
  // Çoklu enjeksiyonu önle
  if (window.__rewriteAIInjected) return;
  window.__rewriteAIInjected = true;

  let currentSelectedText = '';
  let selectionRange = null;

  // Floating trigger ikonu ve modal arayüzünü oluştur
  const iconUrl = chrome.runtime.getURL('assets/icons/icon32.png');
  const triggerBtn = document.createElement('div');
  triggerBtn.id = 'rewriteai-trigger-btn';
  triggerBtn.innerHTML = `<img src="${iconUrl}" alt="RewriteAI" style="width:20px;height:20px;display:block;">`;
  triggerBtn.title = 'RewriteAI ile Düzenle';
  document.body.appendChild(triggerBtn);

  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'rewriteai-modal-overlay';
  modalOverlay.innerHTML = `
    <div class="rewriteai-modal">
      <div class="rewriteai-modal-header">
        <div class="rewriteai-brand">
          <img src="${iconUrl}" alt="RewriteAI" style="width:22px;height:22px;border-radius:4px;">
          <span class="rewriteai-title">RewriteAI Metin Düzenleyici</span>
        </div>
        <div class="rewriteai-header-controls">
          <select id="rewriteai-modal-model-select" class="rewriteai-select" title="Yapay Zeka Modeli">
            <option value="gemini-3.8-flash">Gemini 3.8 Flash (✨ Önerilen)</option>
            <option value="gemini-3.7-flash">Gemini 3.7 Flash</option>
            <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite</option>
          </select>
          <button id="rewriteai-modal-close" class="rewriteai-close-btn">&times;</button>
        </div>
      </div>

      <div class="rewriteai-modal-body">
        <div class="rewriteai-field">
          <label>Seçilen Metin:</label>
          <div id="rewriteai-preview-text" class="rewriteai-text-box"></div>
        </div>

        <div class="rewriteai-tone-grid">
          <button class="rewriteai-tone-btn active" data-tone="fix_grammar">
            <strong>✍️ İmla & Dilbilgisi</strong>
            <small>Hataları düzeltir</small>
          </button>
          <button class="rewriteai-tone-btn" data-tone="daily">
            <strong>💬 Günlük & Samimi</strong>
            <small>Doğal konuşma dili</small>
          </button>
          <button class="rewriteai-tone-btn" data-tone="formal">
            <strong>💼 Resmi & Kurumsal</strong>
            <small>Profesyonel üslup</small>
          </button>
          <button class="rewriteai-tone-btn" data-tone="slang">
            <strong>🔥 Argo & Sokak Ağzı</strong>
            <small>Gençlik jargonu</small>
          </button>
          <button class="rewriteai-tone-btn" data-tone="academic">
            <strong>🎓 Akademik & Ağır</strong>
            <small>Bilimsel terminoloji</small>
          </button>
          <button class="rewriteai-tone-btn" data-tone="summarize">
            <strong>📌 Özetle</strong>
            <small>Kısa ve netleştir</small>
          </button>
        </div>

        <div class="rewriteai-field">
          <label>Dönüştürülen Sonuç:</label>
          <textarea id="rewriteai-result-text" placeholder="Dönüşüm sonucunuz burada belirecek..." readonly></textarea>
        </div>
      </div>

      <div class="rewriteai-modal-footer">
        <div id="rewriteai-status-msg" class="rewriteai-status">Dönüşüm tonu seçin ve 'Dönüştür'e basın</div>
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
      max-height: 70vh;
      overflow-y: auto;
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
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .rewriteai-tone-btn {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 8px 10px;
      color: #e2e8f0;
      text-align: left;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .rewriteai-tone-btn strong { font-size: 12px; }
    .rewriteai-tone-btn small { font-size: 10px; color: #94a3b8; }
    .rewriteai-tone-btn:hover { border-color: #38bdf8; background: #24344d; }
    .rewriteai-tone-btn.active {
      border-color: #38bdf8;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
    }
    .rewriteai-tone-btn.active small { color: #bae6fd; }
    #rewriteai-result-text {
      width: 100%;
      height: 110px;
      background: #020617;
      border: 1px solid #334155;
      border-radius: 8px;
      color: #fff;
      padding: 10px;
      font-size: 13px;
      line-height: 1.4;
      resize: vertical;
      box-sizing: border-box;
      outline: none;
    }
    #rewriteai-result-text:focus { border-color: #38bdf8; }
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
    .rewriteai-status {
      font-size: 12px;
      color: #94a3b8;
      flex: 1;
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

  // Metin Seçim Takibi
  document.addEventListener('mouseup', (e) => {
    // Modal içindeki tıklamaları yok say
    if (modalOverlay.contains(e.target) || triggerBtn.contains(e.target)) return;

    chrome.storage.local.get({ showSelectionBubble: false }, (items) => {
      if (!items.showSelectionBubble) {
        triggerBtn.style.display = 'none';
        return;
      }

      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text.length > 1) {
          currentSelectedText = text;
          try {
            selectionRange = selection.getRangeAt(0).cloneRange();
          } catch {
            selectionRange = null;
          }

          const rect = selection.getRangeAt(0).getBoundingClientRect();
          triggerBtn.style.top = `${window.scrollY + rect.top - 36}px`;
          triggerBtn.style.left = `${window.scrollX + rect.right - 14}px`;
          triggerBtn.style.display = 'flex';
        } else {
          triggerBtn.style.display = 'none';
        }
      }, 10);
    });
  });

  // Butona tıklayınca modal aç
  triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    triggerBtn.style.display = 'none';
    openModal(currentSelectedText);
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

  let selectedTone = 'fix_grammar';

  toneBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      toneBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTone = btn.getAttribute('data-tone');
    });
  });

  function openModal(text) {
    previewBox.textContent = text;
    resultBox.value = '';
    copyBtn.disabled = true;
    replaceBtn.disabled = true;
    statusMsg.textContent = 'Dönüşüm tonu seçin ve Dönüştür butonuna tıklayın.';

    // Ayarlardan kaydedilmiş varsayılan modeli getir
    chrome.storage.local.get({ selectedModel: 'gemini-3.8-flash' }, (items) => {
      if (items.selectedModel && modelSelect) {
        modelSelect.value = items.selectedModel;
      }
    });

    modalOverlay.style.display = 'flex';
  }

  // Model kutudan değiştirilirse tercihi hatırla
  if (modelSelect) {
    modelSelect.addEventListener('change', () => {
      chrome.storage.local.set({ selectedModel: modelSelect.value });
      statusMsg.textContent = `Model seçildi: ${modelSelect.options[modelSelect.selectedIndex].text}`;
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

    applyBtn.disabled = true;
    applyBtn.textContent = '⏳ İşleniyor...';
    statusMsg.textContent = 'Yapay zeka metni yeniden yazıyor...';

    const chosenModel = modelSelect ? modelSelect.value : 'gemini-3.8-flash';

    chrome.runtime.sendMessage({
      type: 'TRANSFORM_TEXT',
      text: currentSelectedText,
      tone: selectedTone,
      model: chosenModel
    }, (response) => {
      applyBtn.disabled = false;
      applyBtn.textContent = '⚡ Dönüştür';

      if (response && response.success) {
        resultBox.value = response.result;
        copyBtn.disabled = false;
        replaceBtn.disabled = false;
        statusMsg.textContent = '✓ Tamamlandı!';
      } else {
        const err = response?.error || 'Bilinmeyen bir hata oluştu.';
        statusMsg.textContent = `Hata: ${err}`;
      }
    });
  });

  // Sonucu Kopyala
  copyBtn.addEventListener('click', async () => {
    if (!resultBox.value) return;
    await navigator.clipboard.writeText(resultBox.value);
    const orig = copyBtn.textContent;
    copyBtn.textContent = '✓ Kopyalandı';
    setTimeout(() => { copyBtn.textContent = orig; }, 1500);
  });

  // Sayfadaki metni doğrudan değiştir
  replaceBtn.addEventListener('click', () => {
    if (!resultBox.value || !selectionRange) return;
    try {
      selectionRange.deleteContents();
      selectionRange.insertNode(document.createTextNode(resultBox.value));
      closeModal();
    } catch {
      statusMsg.textContent = 'Sayfa metni doğrudan değiştirilemedi, lütfen kopyalayın.';
    }
  });

  // Background'dan doğrudan aç komutu gelirse (Sağ tık menüsünden tetiklenme)
  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'OPEN_REWRITE_MODAL') {
      currentSelectedText = request.text;
      openModal(request.text);
    }
  });
})();
