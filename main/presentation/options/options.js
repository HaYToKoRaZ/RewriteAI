import { StorageRepository } from '../../data/StorageRepository.js';
import { AVAILABLE_MODELS } from '../../data/DefaultSettings.js';
import { TONE_DEFINITIONS } from '../../core/TonePrompts.js';
import { detectLanguage, getT } from '../../core/i18n.js';

document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const groqApiKeyInput = document.getElementById('groqApiKey');
  const cohereApiKeyInput = document.getElementById('cohereApiKey');
  const hfApiKeyInput = document.getElementById('hfApiKey');
  const openaiApiKeyInput = document.getElementById('openaiApiKey');
  const anthropicApiKeyInput = document.getElementById('anthropicApiKey');
  const deepseekApiKeyInput = document.getElementById('deepseekApiKey');

  const selectedModelSelect = document.getElementById('selectedModel');
  const defaultToneSelect = document.getElementById('defaultTone');
  const autoCopyCheckbox = document.getElementById('autoCopy');
  const showSelectionBubbleCheckbox = document.getElementById('showSelectionBubble');

  // ── Dil Başlatma ──
  let lang = await detectLanguage();
  let t = getT(lang);

  const optLangTr = document.getElementById('optLangTr');
  const optLangEn = document.getElementById('optLangEn');

  function renderToneOptions() {
    const currentVal = defaultToneSelect.value;
    defaultToneSelect.innerHTML = '';
    Object.values(TONE_DEFINITIONS).forEach((tone) => {
      const opt = document.createElement('option');
      opt.value = tone.id;
      const localizedTone = t.tones && t.tones[tone.id] ? t.tones[tone.id] : null;
      const title = localizedTone ? localizedTone.title : tone.name;
      const desc = localizedTone ? localizedTone.desc : tone.description;
      opt.textContent = `${title} (${desc})`;
      defaultToneSelect.appendChild(opt);
    });
    if (currentVal) defaultToneSelect.value = currentVal;
  }

  function applyOptionsLanguage() {
    t = getT(lang);
    if (optLangTr) { optLangTr.classList.toggle('active', lang === 'tr'); }
    if (optLangEn) { optLangEn.classList.toggle('active', lang === 'en'); }

    // Header & Meta
    const sfx = document.getElementById('optionsTitleSuffix');
    const sub = document.getElementById('optionsSubtitle');
    const wl = document.getElementById('websiteLink');
    const gl = document.getElementById('githubLink');
    if (sfx) sfx.textContent = lang === 'en' ? 'Settings' : 'Ayarları';
    if (sub) sub.textContent = t.optionsSubtitle;
    if (wl) wl.textContent = t.websiteLink;
    if (gl) gl.textContent = t.githubLink;

    // Form Elemanları & Açıklamaları
    const lblModel = document.getElementById('lblModelSelect');
    const helperModel = document.getElementById('helperModelSelect');
    const lblTone = document.getElementById('lblDefaultTone');
    const lblAutoCopy = document.getElementById('lblAutoCopy');
    const lblShowBubble = document.getElementById('lblShowBubble');
    const helperShowBubble = document.getElementById('helperShowBubble');

    if (lblModel) lblModel.textContent = t.modelLabel;
    if (helperModel) helperModel.textContent = t.modelHelper;
    if (lblTone) lblTone.textContent = t.toneDefaultLabel;
    if (lblAutoCopy) lblAutoCopy.textContent = t.autoCopyLabel;
    if (lblShowBubble) lblShowBubble.textContent = t.showBubbleLabel;
    if (helperShowBubble) helperShowBubble.textContent = t.showBubbleHelper;

    // API Anahtarları Bölümü
    const apiKeysTitleEl = document.getElementById('apiKeysTitle');
    const apiKeysDescEl = document.getElementById('apiKeysDesc');
    if (apiKeysTitleEl) apiKeysTitleEl.textContent = t.apiKeysTitle;
    if (apiKeysDescEl) apiKeysDescEl.textContent = t.apiKeysDesc;

    // Sağlayıcı Rozetleri (Badges)
    const badgeGemini = document.getElementById('badge-gemini');
    const badgeGroq = document.getElementById('badge-groq');
    const badgeCohere = document.getElementById('badge-cohere');
    const badgeHf = document.getElementById('badge-hf');
    const badgeOpenai = document.getElementById('badge-openai');
    const badgeClaude = document.getElementById('badge-claude');
    const badgeDeepseek = document.getElementById('badge-deepseek');

    if (badgeGemini) badgeGemini.textContent = t.freeTierBadge;
    if (badgeGroq) badgeGroq.textContent = t.freeUltraBadge;
    if (badgeCohere) badgeCohere.textContent = t.freeTrialBadge;
    if (badgeHf) badgeHf.textContent = t.freeTokenBadge;
    if (badgeOpenai) badgeOpenai.textContent = t.paidChatGptBadge;
    if (badgeClaude) badgeClaude.textContent = t.paidBalanceBadge;
    if (badgeDeepseek) badgeDeepseek.textContent = t.paidBudgetBadge;

    // Sağlayıcı Linkleri
    const linkGemini = document.getElementById('link-gemini');
    const linkGroq = document.getElementById('link-groq');
    const linkCohere = document.getElementById('link-cohere');
    const linkHf = document.getElementById('link-hf');
    const linkOpenai = document.getElementById('link-openai');
    const linkClaude = document.getElementById('link-claude');
    const linkDeepseek = document.getElementById('link-deepseek');

    if (linkGemini) linkGemini.textContent = t.getKeyLink;
    if (linkGroq) linkGroq.textContent = t.getKeyLink;
    if (linkCohere) linkCohere.textContent = t.getTrialLink;
    if (linkHf) linkHf.textContent = t.getTokenLink;
    if (linkOpenai) linkOpenai.textContent = t.openAiPortalLink;
    if (linkClaude) linkClaude.textContent = t.claudePortalLink;
    if (linkDeepseek) linkDeepseek.textContent = t.deepseekPortalLink;

    // Kayıtlı Token Metinleri & Sil Butonları
    document.querySelectorAll('.saved-text').forEach((el) => {
      el.textContent = t.tokenSaved;
    });
    document.querySelectorAll('.delete-token-btn').forEach((btn) => {
      btn.textContent = t.deleteToken;
    });

    // Kota Kartı Metinleri
    const quotaTitleEl = document.getElementById('quotaTitle');
    const quotaOfficialLinkEl = document.getElementById('quotaOfficialLink');
    const quotaLimitTextEl = document.getElementById('quotaLimitText');
    const quotaRpmTextEl = document.getElementById('quotaRpmText');
    const quotaRpdTextEl = document.getElementById('quotaRpdText');

    if (quotaTitleEl) quotaTitleEl.textContent = t.quotaCardTitle;
    if (quotaOfficialLinkEl) quotaOfficialLinkEl.textContent = t.quotaOfficialPanel;
    if (quotaLimitTextEl) quotaLimitTextEl.textContent = t.quotaTodaySuffix;
    if (quotaRpmTextEl) quotaRpmTextEl.innerHTML = t.quotaRpm;
    if (quotaRpdTextEl) quotaRpdTextEl.innerHTML = t.quotaRpd;

    // Ton Seçeneklerini güncelle
    renderToneOptions();

    // Manifest versiyonunu badge'e yaz
    const vb = document.getElementById('versionBadge');
    if (vb) {
      const mVersion = chrome.runtime.getManifest().version;
      vb.textContent = `v${mVersion}`;
    }
  }

  [optLangTr, optLangEn].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener('click', async () => {
      lang = btn.dataset.lang;
      await chrome.storage.local.set({ uiLanguage: lang });
      applyOptionsLanguage();
    });
  });

  // Modelleri sağlayıcı gruplarıyla yükle
  const groups = {};
  AVAILABLE_MODELS.forEach((m) => {
    const groupName = m.group || 'Diğer Modeller';
    if (!groups[groupName]) {
      const optGroup = document.createElement('optgroup');
      optGroup.label = groupName;
      groups[groupName] = optGroup;
      selectedModelSelect.appendChild(optGroup);
    }
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.name;
    groups[groupName].appendChild(opt);
  });

  // Dili uygula (tonları da render eder)
  applyOptionsLanguage();

  // Mevcut ayarları çek
  let settings = await StorageRepository.getSettings();

  const keyFieldIds = [
    'apiKey',
    'groqApiKey',
    'cohereApiKey',
    'hfApiKey',
    'openaiApiKey',
    'anthropicApiKey',
    'deepseekApiKey'
  ];

  // Token kayıtlıysa giriş kutusunu gizle, güvenli rozet ve silme butonunu göster
  function renderKeyStates() {
    keyFieldIds.forEach((fieldId) => {
      const inputEl = document.getElementById(fieldId);
      const wrapEl = document.getElementById(`input-wrap-${fieldId}`);
      const statusEl = document.getElementById(`status-${fieldId}`);
      const hasKey = !!(settings[fieldId] && settings[fieldId].trim());

      if (hasKey) {
        if (wrapEl) wrapEl.classList.add('hidden');
        if (statusEl) statusEl.classList.remove('hidden');
        if (inputEl) inputEl.value = settings[fieldId];
      } else {
        if (wrapEl) wrapEl.classList.remove('hidden');
        if (statusEl) statusEl.classList.add('hidden');
        if (inputEl) inputEl.value = '';
      }
    });
  }

  renderKeyStates();

  // Toast Bildirimi Göster
  const toastEl = document.getElementById('toastNotification');
  const toastMsgEl = document.getElementById('toastMsg');
  let toastTimer = null;

  function showToast(message = t.settingsAutoSaved || 'Ayarlar otomatik kaydedildi') {
    if (!toastEl) return;
    if (toastMsgEl) toastMsgEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2400);
  }

  // Token Silme Butonları
  document.querySelectorAll('.delete-token-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const targetId = btn.getAttribute('data-target');
      if (!confirm(t.deleteConfirm || 'Bu API anahtarını silmek istediğinize emin misiniz?')) {
        return;
      }

      // Bellek ve depolamadan kaldır
      settings[targetId] = '';
      await StorageRepository.saveSettings({ [targetId]: '' });

      const inputEl = document.getElementById(targetId);
      if (inputEl) inputEl.value = '';

      renderKeyStates();
      showToast(t.deleteSuccess || 'API Anahtarı silindi.');
    });
  });

  selectedModelSelect.value = settings.selectedModel || 'gemini-3.5-flash-lite';
  defaultToneSelect.value = settings.defaultTone || 'fix_grammar';
  autoCopyCheckbox.checked = !!settings.autoCopy;
  showSelectionBubbleCheckbox.checked = !!settings.showSelectionBubble;

  // Kota ve kullanım istatistiğini seçili modele göre göster
  async function updateOptionsQuota() {
    const curModel = selectedModelSelect.value;
    const usage = await StorageRepository.getDailyUsage(curModel);
    const usageCountEl = document.getElementById('dailyUsageCount');
    const progressBarEl = document.getElementById('quotaProgressBar');
    if (usageCountEl && progressBarEl) {
      usageCountEl.textContent = usage.count;
      const pct = Math.min(100, Math.round((usage.count / 1500) * 100));
      progressBarEl.style.width = `${pct}%`;
    }
  }

  updateOptionsQuota();

  // Otomatik Kayıt Fonksiyonu
  async function autoSave(notificationMsg) {
    const msg = notificationMsg || t.settingsAutoSaved || 'Ayarlar otomatik kaydedildi';
    const updatedKeys = {};
    keyFieldIds.forEach((fieldId) => {
      const inputEl = document.getElementById(fieldId);
      const val = inputEl ? inputEl.value.trim() : '';
      if (val) {
        updatedKeys[fieldId] = val;
        settings[fieldId] = val;
      }
    });

    const newSettings = {
      ...updatedKeys,
      selectedModel: selectedModelSelect.value,
      defaultTone: defaultToneSelect.value,
      autoCopy: autoCopyCheckbox.checked,
      showSelectionBubble: showSelectionBubbleCheckbox.checked
    };

    await StorageRepository.saveSettings(newSettings);
    renderKeyStates();
    showToast(msg);
  }

  // Model & Ton değişince anında kaydet
  selectedModelSelect.addEventListener('change', () => {
    updateOptionsQuota();
    autoSave(t.modelSavedToast || 'Model tercihi kaydedildi');
  });

  defaultToneSelect.addEventListener('change', () => {
    autoSave(t.toneSavedToast || 'Varsayılan ton kaydedildi');
  });

  // Switch/Checkbox değişince anında kaydet
  autoCopyCheckbox.addEventListener('change', () => {
    autoSave(t.prefSavedToast || 'Tercih güncellendi');
  });

  showSelectionBubbleCheckbox.addEventListener('change', () => {
    autoSave(t.prefSavedToast || 'Tercih güncellendi');
  });

  // API Anahtarı kutularına anahtar yapıştırılıp veya yazılıp çıkıldığında / enter basıldığında kaydet
  keyFieldIds.forEach((fieldId) => {
    const inputEl = document.getElementById(fieldId);
    if (!inputEl) return;

    inputEl.addEventListener('change', () => {
      if (inputEl.value.trim()) {
        autoSave(t.keySavedToast || 'API Anahtarı güvenle kaydedildi');
      }
    });

    inputEl.addEventListener('blur', () => {
      if (inputEl.value.trim()) {
        autoSave(t.keySavedToast || 'API Anahtarı güvenle kaydedildi');
      }
    });

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        inputEl.blur(); // change tetikler
      }
    });
  });

  // Açılır pencereden (modal) veya başka bir yerden model değişirse seçeneklerde canlı güncelle
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.selectedModel) {
      if (selectedModelSelect && changes.selectedModel.newValue) {
        selectedModelSelect.value = changes.selectedModel.newValue;
        updateOptionsQuota();
      }
    }
  });
});
