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

  function applyOptionsLanguage() {
    t = getT(lang);
    if (optLangTr) { optLangTr.classList.toggle('active', lang === 'tr'); }
    if (optLangEn) { optLangEn.classList.toggle('active', lang === 'en'); }
    const sfx = document.getElementById('optionsTitleSuffix');
    const sub = document.getElementById('optionsSubtitle');
    const wl = document.getElementById('websiteLink');
    const gl = document.getElementById('githubLink');
    if (sfx) sfx.textContent = lang === 'en' ? 'Settings' : 'Ayarları';
    if (sub) sub.textContent = t.optionsSubtitle;
    if (wl) wl.textContent = t.websiteLink;
    if (gl) gl.textContent = t.githubLink;
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

  // Dili uygula
  applyOptionsLanguage();

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

  // Tonları yükle
  Object.values(TONE_DEFINITIONS).forEach((tone) => {
    const opt = document.createElement('option');
    opt.value = tone.id;
    opt.textContent = `${tone.name} (${tone.description})`;
    defaultToneSelect.appendChild(opt);
  });

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

  function showToast(message = 'Ayarlar otomatik kaydedildi') {
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
      if (!confirm('Bu API anahtarını silmek istediğinize emin misiniz?')) {
        return;
      }

      // Bellek ve depolamadan kaldır
      settings[targetId] = '';
      await StorageRepository.saveSettings({ [targetId]: '' });

      const inputEl = document.getElementById(targetId);
      if (inputEl) inputEl.value = '';

      renderKeyStates();
      showToast('API Anahtarı silindi.');
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
  async function autoSave(notificationMsg = 'Ayarlar otomatik kaydedildi') {
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
    showToast(notificationMsg);
  }

  // Model & Ton değişince anında kaydet
  selectedModelSelect.addEventListener('change', () => {
    updateOptionsQuota();
    autoSave('Model tercihi kaydedildi');
  });

  defaultToneSelect.addEventListener('change', () => {
    autoSave('Varsayılan ton kaydedildi');
  });

  // Switch/Checkbox değişince anında kaydet
  autoCopyCheckbox.addEventListener('change', () => {
    autoSave('Tercih güncellendi');
  });

  showSelectionBubbleCheckbox.addEventListener('change', () => {
    autoSave('Tercih güncellendi');
  });

  // API Anahtarı kutularına anahtar yapıştırılıp veya yazılıp çıkıldığında / enter basıldığında kaydet
  keyFieldIds.forEach((fieldId) => {
    const inputEl = document.getElementById(fieldId);
    if (!inputEl) return;

    inputEl.addEventListener('change', () => {
      if (inputEl.value.trim()) {
        autoSave('API Anahtarı güvenle kaydedildi');
      }
    });

    inputEl.addEventListener('blur', () => {
      if (inputEl.value.trim()) {
        autoSave('API Anahtarı güvenle kaydedildi');
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
