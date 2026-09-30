import { StorageRepository } from '../../data/StorageRepository.js';
import { AVAILABLE_MODELS } from '../../data/DefaultSettings.js';
import { TONE_DEFINITIONS } from '../../core/TonePrompts.js';

document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const toggleApiKeyBtn = document.getElementById('toggleApiKey');
  const selectedModelSelect = document.getElementById('selectedModel');
  const defaultToneSelect = document.getElementById('defaultTone');
  const autoCopyCheckbox = document.getElementById('autoCopy');
  const showSelectionBubbleCheckbox = document.getElementById('showSelectionBubble');
  const saveBtn = document.getElementById('saveBtn');
  const saveStatus = document.getElementById('saveStatus');

  // Modelleri yükle
  AVAILABLE_MODELS.forEach((m) => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.name;
    selectedModelSelect.appendChild(opt);
  });

  // Tonları yükle
  Object.values(TONE_DEFINITIONS).forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = `${t.name} (${t.description})`;
    defaultToneSelect.appendChild(opt);
  });

  // Mevcut ayarları çek
  const settings = await StorageRepository.getSettings();
  apiKeyInput.value = settings.apiKey || '';
  selectedModelSelect.value = settings.selectedModel || 'gemini-3.8-flash';
  defaultToneSelect.value = settings.defaultTone || 'fix_grammar';
  autoCopyCheckbox.checked = !!settings.autoCopy;
  showSelectionBubbleCheckbox.checked = !!settings.showSelectionBubble;

  // Şifre göster/gizle
  toggleApiKeyBtn.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      toggleApiKeyBtn.textContent = '🔒';
    } else {
      apiKeyInput.type = 'password';
      toggleApiKeyBtn.textContent = '👁️';
    }
  });

  // Kaydet butonu
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Kaydediliyor...';

    const newSettings = {
      apiKey: apiKeyInput.value.trim(),
      selectedModel: selectedModelSelect.value,
      defaultTone: defaultToneSelect.value,
      autoCopy: autoCopyCheckbox.checked,
      showSelectionBubble: showSelectionBubbleCheckbox.checked
    };

    await StorageRepository.saveSettings(newSettings);

    saveStatus.textContent = '✓ Ayarlar başarıyla kaydedildi!';
    saveBtn.disabled = false;
    saveBtn.textContent = 'Ayarları Kaydet';

    setTimeout(() => {
      saveStatus.textContent = '';
    }, 3000);
  });
});
