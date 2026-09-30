import { StorageRepository } from '../../data/StorageRepository.js';
import { TONE_DEFINITIONS } from '../../core/TonePrompts.js';
import { TextTransformService } from '../../services/TextTransformService.js';

document.addEventListener('DOMContentLoaded', async () => {
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
  const loader = document.getElementById('loader');
  const btnText = transformBtn.querySelector('.btn-text');
  const charCount = document.getElementById('charCount');
  const statusInfo = document.getElementById('statusInfo');

  // Ton seçeneklerini doldur
  Object.values(TONE_DEFINITIONS).forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.name;
    toneSelect.appendChild(opt);
  });

  // Ayarları ve son durumu yükle
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

  if (!hasAnyKey) {
    apiAlert.classList.remove('hidden');
  } else {
    apiAlert.classList.add('hidden');
  }

  if (settings.defaultTone) {
    toneSelect.value = settings.defaultTone;
  }

  // Son oturumdan metin varsa geri getir
  const lastState = await StorageRepository.getLastResult();
  if (lastState.lastInputText) inputText.value = lastState.lastInputText;
  if (lastState.lastOutputText) outputText.value = lastState.lastOutputText;
  if (lastState.lastTone) toneSelect.value = lastState.lastTone;

  updateCharCount();

  // Karakter sayımı
  inputText.addEventListener('input', updateCharCount);

  function updateCharCount() {
    const len = inputText.value.length;
    charCount.textContent = `${len} karakter`;
  }

  // Ayarlar sayfasını açma
  const openOptions = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('presentation/options/options.html') });
  };
  openOptionsBtn.addEventListener('click', openOptions);
  goToOptionsBtn.addEventListener('click', openOptions);

  // Panodan yapıştır
  pasteBtn.addEventListener('click', async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        inputText.value = clipText;
        updateCharCount();
        statusInfo.textContent = 'Panodan yapıştırıldı';
      }
    } catch {
      statusInfo.textContent = 'Pano okunamadı';
    }
  });

  // Temizle
  clearBtn.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
    updateCharCount();
    statusInfo.textContent = 'Temizlendi';
  });

  // Kopyala
  copyBtn.addEventListener('click', async () => {
    const val = outputText.value;
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✓ Kopyalandı!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    } catch {
      statusInfo.textContent = 'Kopyalama hatası';
    }
  });

  // Dönüştür butonu
  transformBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    if (!text) {
      statusInfo.textContent = 'Lütfen metin girin';
      return;
    }

    setLoading(true);
    statusInfo.textContent = 'Yapay zeka işliyor...';

    try {
      const toneId = toneSelect.value;
      const result = await TextTransformService.transform(text, toneId);
      outputText.value = result;
      statusInfo.textContent = 'Tamamlandı';

      // Otomatik kopyalama açıksa
      const currentSettings = await StorageRepository.getSettings();
      if (currentSettings.autoCopy) {
        await navigator.clipboard.writeText(result);
        statusInfo.textContent = 'Tamamlandı & panoya kopyalandı';
      }
    } catch (err) {
      statusInfo.textContent = 'Hata oluştu';
      outputText.value = `Hata: ${err.message}`;
    } finally {
      setLoading(false);
    }
  });

  function setLoading(isLoading) {
    transformBtn.disabled = isLoading;
    if (isLoading) {
      loader.classList.remove('hidden');
      btnText.textContent = 'İşleniyor...';
    } else {
      loader.classList.add('hidden');
      btnText.textContent = 'Metni Yeniden Yaz';
    }
  }
});
