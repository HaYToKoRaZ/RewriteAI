import { StorageRepository } from '../../data/StorageRepository.js';
import { TONE_DEFINITIONS } from '../../core/TonePrompts.js';
import { TextTransformService } from '../../services/TextTransformService.js';
import { detectLanguage, getT } from '../../core/i18n.js';

document.addEventListener('DOMContentLoaded', async () => {
  // ── DOM ──
  const toneSelect = document.getElementById('toneSelect');
  const inputText = document.getElementById('inputText');
  const outputText = document.getElementById('outputText');
  const transformBtn = document.getElementById('transformBtn');
  const pasteBtn = document.getElementById('pasteBtn');
  const clearBtn = document.getElementById('clearBtn');
  const copyBtn = document.getElementById('copyBtn');
  const openOptionsBtn = document.getElementById('openOptionsBtn');
  const goToOptionsBtn = document.getElementById('goToOptionsBtn');
  const apiAlert = document.getElementById('apiAlert');
  const apiAlertText = document.getElementById('apiAlertText');
  const loader = document.getElementById('loader');
  const btnText = document.getElementById('transformBtnText');
  const charCount = document.getElementById('charCount');
  const statusInfo = document.getElementById('statusInfo');
  const toneLabelEl = document.getElementById('toneLabelEl');
  const inputPanelLabel = document.getElementById('inputPanelLabel');
  const outputPanelLabel = document.getElementById('outputPanelLabel');
  const langBtnTr = document.getElementById('langBtnTr');
  const langBtnEn = document.getElementById('langBtnEn');

  // ── Dil Başlatma ──
  let lang = await detectLanguage();
  let t = getT(lang);

  function applyLanguage() {
    t = getT(lang);

    // Dil butonları
    langBtnTr.classList.toggle('active', lang === 'tr');
    langBtnEn.classList.toggle('active', lang === 'en');

    // Metinleri güncelle
    toneLabelEl.textContent = t.toneLabel;
    inputPanelLabel.textContent = t.originalText;
    outputPanelLabel.textContent = t.convertedText;
    btnText.textContent = t.convertBtn;
    pasteBtn.innerHTML = t.paste;
    clearBtn.innerHTML = t.clear;
    copyBtn.innerHTML = t.copyResult;
    charCount.textContent = t.charCount(inputText.value.length);
    apiAlertText.textContent = t.apiMissingAlert;
    if (goToOptionsBtn) goToOptionsBtn.textContent = t.setupBtn;

    // Placeholder
    inputText.placeholder = t.statusEnterText;
    outputText.placeholder = t.resultPlaceholder;

    // Status
    const cur = statusInfo.textContent;
    if (!transformBtn.disabled) {
      statusInfo.textContent = t.statusReady;
    }
  }

  // Dil butonları tıklama
  [langBtnTr, langBtnEn].forEach((btn) => {
    btn.addEventListener('click', async () => {
      lang = btn.dataset.lang;
      await chrome.storage.local.set({ uiLanguage: lang });
      applyLanguage();
    });
  });

  // ── Ton seçeneklerini doldur ──
  toneSelect.innerHTML = '';
  Object.values(TONE_DEFINITIONS).forEach((tone) => {
    const opt = document.createElement('option');
    opt.value = tone.id;
    opt.textContent = tone.name;
    toneSelect.appendChild(opt);
  });

  // ── Ayarları yükle ──
  const settings = await StorageRepository.getSettings();

  const hasAnyKey = !!(
    settings.apiKey ||
    settings.groqApiKey ||
    settings.cohereApiKey ||
    settings.hfApiKey ||
    settings.openaiApiKey ||
    settings.anthropicApiKey ||
    settings.deepseekApiKey
  );

  apiAlert.classList.toggle('hidden', hasAnyKey);

  if (settings.defaultTone) {
    toneSelect.value = settings.defaultTone;
  }

  // Son oturumdan metni geri yükle
  const lastState = await StorageRepository.getLastResult();
  if (lastState.lastInputText) inputText.value = lastState.lastInputText;
  if (lastState.lastOutputText) outputText.value = lastState.lastOutputText;
  if (lastState.lastTone) toneSelect.value = lastState.lastTone;

  // Dili uygula
  applyLanguage();

  // ── Karakter sayımı ──
  inputText.addEventListener('input', () => {
    charCount.textContent = t.charCount(inputText.value.length);
  });

  // ── Ayarlar açma ──
  const openOptions = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('presentation/options/options.html') });
  };
  openOptionsBtn.addEventListener('click', openOptions);
  if (goToOptionsBtn) goToOptionsBtn.addEventListener('click', openOptions);

  // ── Panodan yapıştır ──
  pasteBtn.addEventListener('click', async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        inputText.value = clipText;
        charCount.textContent = t.charCount(clipText.length);
        setStatus(t.statusPasted, 'success');
      }
    } catch {
      setStatus(t.statusClipboardError, 'error');
    }
  });

  // ── Temizle ──
  clearBtn.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
    charCount.textContent = t.charCount(0);
    setStatus(t.statusCleared, '');
  });

  // ── Kopyala ──
  copyBtn.addEventListener('click', async () => {
    const val = outputText.value;
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
      const orig = copyBtn.innerHTML;
      copyBtn.innerHTML = t.copied;
      setTimeout(() => { copyBtn.innerHTML = orig; }, 2000);
    } catch {
      setStatus(t.statusError, 'error');
    }
  });

  // ── Dönüştür ──
  transformBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    if (!text) {
      setStatus(t.statusEnterText, 'error');
      return;
    }

    setLoading(true);
    setStatus(t.statusProcessing, '');

    try {
      const toneId = toneSelect.value;
      const result = await TextTransformService.transform(text, toneId);
      outputText.value = result;
      setStatus(t.statusDone, 'success');

      // Otomatik kopyalama
      const currentSettings = await StorageRepository.getSettings();
      if (currentSettings.autoCopy) {
        await navigator.clipboard.writeText(result);
        setStatus(t.statusCopied, 'success');
      }

      // Son durumu kaydet
      await StorageRepository.saveLastResult(text, result, toneId);
    } catch (err) {
      setStatus(t.statusError, 'error');
      outputText.value = `Hata: ${err.message}`;
    } finally {
      setLoading(false);
    }
  });

  // ── Yardımcılar ──
  function setLoading(isLoading) {
    transformBtn.disabled = isLoading;
    if (isLoading) {
      loader.classList.remove('hidden');
      btnText.textContent = t.processing;
    } else {
      loader.classList.add('hidden');
      btnText.textContent = t.convertBtn;
    }
  }

  function setStatus(msg, type = '') {
    statusInfo.textContent = msg;
    statusInfo.className = type;
    if (type === 'success') {
      setTimeout(() => {
        statusInfo.textContent = t.statusReady;
        statusInfo.className = '';
      }, 3000);
    }
  }
});
