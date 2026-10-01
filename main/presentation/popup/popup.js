import { StorageRepository } from '../../data/StorageRepository.js';
import { TextTransformService } from '../../services/TextTransformService.js';
import { detectLanguage, getT } from '../../core/i18n.js';

document.addEventListener('DOMContentLoaded', async () => {
  // ── DOM ──
  const modelSelect = document.getElementById('popupModelSelect');
  const keyWarningBox = document.getElementById('keyWarningBox');
  const keyWarningText = document.getElementById('keyWarningText');
  const warningSettingsBtn = document.getElementById('warningSettingsBtn');
  const toneCardBtns = document.querySelectorAll('.tone-card-btn');
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
  const inputPanelLabel = document.getElementById('inputPanelLabel');
  const outputPanelLabel = document.getElementById('outputPanelLabel');
  const langBtnTr = document.getElementById('langBtnTr');
  const langBtnEn = document.getElementById('langBtnEn');

  let selectedTone = 'fix_grammar';

  // ── Dil Başlatma ──
  let lang = await detectLanguage();
  let t = getT(lang);

  function applyLanguage() {
    t = getT(lang);

    // Dil butonları
    langBtnTr.classList.toggle('active', lang === 'tr');
    langBtnEn.classList.toggle('active', lang === 'en');

    // Metinleri güncelle
    inputPanelLabel.textContent = t.originalText;
    outputPanelLabel.textContent = t.convertedText;
    btnText.textContent = t.transform || '⚡ Dönüştür';
    pasteBtn.innerHTML = t.paste;
    clearBtn.innerHTML = t.clear;
    copyBtn.innerHTML = t.copyResult;
    charCount.textContent = t.charCount(inputText.value.length);
    apiAlertText.textContent = t.apiMissingAlert;
    if (goToOptionsBtn) goToOptionsBtn.textContent = t.setupBtn;
    if (warningSettingsBtn) warningSettingsBtn.textContent = t.goToSettings || '⚙️ Ayarlara Git';

    // Placeholder
    inputText.placeholder = t.statusEnterText;
    outputText.placeholder = t.resultPlaceholder;

    // Status
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

  // ── Sağlayıcı ve Anahtar Kontrol Fonksiyonu ──
  function checkModelKey(modelId, callback) {
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

    chrome.storage.local.get([keyStorageName], (data) => {
      const hasKey = !!(data[keyStorageName] && data[keyStorageName].trim());
      if (!hasKey) {
        keyWarningText.textContent = `⚠️ ${providerName} API Anahtarı girilmemiş!`;
        keyWarningBox.classList.remove('hidden');
      } else {
        keyWarningBox.classList.add('hidden');
      }
      if (callback) callback(hasKey);
    });
  }

  // ── Model Değişimi (Hem ayarları günceller hem uyarıyı tazeler) ──
  modelSelect.addEventListener('change', () => {
    const newModel = modelSelect.value;
    chrome.storage.local.set({ selectedModel: newModel }, () => {
      checkModelKey(newModel, (hasKey) => {
        if (hasKey) {
          setStatus(t.statusDefaultModelUpdated || '✓ Varsayılan model güncellendi', 'success');
        } else {
          setStatus('Uyarı: Model API anahtarı eksik!', 'error');
        }
      });
    });
  });

  // ── Ton Butonları Tıklama (Aktif yap + Metin varsa anında dönüştür) ──
  toneCardBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      toneCardBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTone = btn.getAttribute('data-tone');

      // Kullanıcının metni varsa ve işlem çalışmıyorsa direkt dönüştür
      if (inputText.value.trim() && !transformBtn.disabled) {
        runTransformation();
      }
    });
  });

  // ── Ayarları Yükle ──
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

  // Kayıtlı model seçimi
  if (settings.selectedModel) {
    modelSelect.value = settings.selectedModel;
  }
  checkModelKey(modelSelect.value);

  // Kayıtlı varsayılan ton seçimi
  if (settings.defaultTone) {
    selectedTone = settings.defaultTone;
    toneCardBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-tone') === selectedTone);
    });
  }

  // Son oturumdan metni geri yükle
  const lastState = await StorageRepository.getLastResult();
  if (lastState.lastInputText) inputText.value = lastState.lastInputText;
  if (lastState.lastOutputText) outputText.value = lastState.lastOutputText;
  if (lastState.lastTone) {
    selectedTone = lastState.lastTone;
    toneCardBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-tone') === selectedTone);
    });
  }

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
  if (warningSettingsBtn) warningSettingsBtn.addEventListener('click', openOptions);

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

  // ── Dönüştürme Yürütücüsü ──
  async function runTransformation() {
    const text = inputText.value.trim();
    if (!text) {
      setStatus(t.statusEnterText, 'error');
      return;
    }

    const curModel = modelSelect.value;
    checkModelKey(curModel, async (hasKey) => {
      if (!hasKey) {
        setStatus(t.keyMissing || 'Model API anahtarı eksik!', 'error');
        outputText.value = '⚠️ Lütfen seçtiğiniz model için eklenti ayarlarından API anahtarınızı girin.';
        return;
      }

      setLoading(true);
      setStatus(t.statusProcessing, '');

      try {
        const result = await TextTransformService.transform(text, selectedTone, curModel);
        outputText.value = result;
        setStatus(t.statusDone, 'success');

        // Otomatik kopyalama
        const currentSettings = await StorageRepository.getSettings();
        if (currentSettings.autoCopy) {
          await navigator.clipboard.writeText(result);
          setStatus(t.statusCopied, 'success');
        }

        // Son durumu kaydet
        await StorageRepository.saveLastResult(text, result, selectedTone);
      } catch (err) {
        setStatus(t.statusError, 'error');
        outputText.value = `Hata: ${err.message}`;
      } finally {
        setLoading(false);
      }
    });
  }

  // ── Dönüştür Butonu ──
  transformBtn.addEventListener('click', runTransformation);

  // ── Yardımcılar ──
  function setLoading(isLoading) {
    transformBtn.disabled = isLoading;
    if (isLoading) {
      loader.classList.remove('hidden');
      btnText.textContent = t.processing;
    } else {
      loader.classList.add('hidden');
      btnText.textContent = t.transform || '⚡ Dönüştür';
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
