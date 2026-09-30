import { StorageRepository } from '../../data/StorageRepository.js';
import { AVAILABLE_MODELS } from '../../data/DefaultSettings.js';
import { TONE_DEFINITIONS } from '../../core/TonePrompts.js';

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
  const saveBtn = document.getElementById('saveBtn');
  const saveStatus = document.getElementById('saveStatus');

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
  Object.values(TONE_DEFINITIONS).forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = `${t.name} (${t.description})`;
    defaultToneSelect.appendChild(opt);
  });

  // Mevcut ayarları çek
  const settings = await StorageRepository.getSettings();
  apiKeyInput.value = settings.apiKey || '';
  if (groqApiKeyInput) groqApiKeyInput.value = settings.groqApiKey || '';
  if (cohereApiKeyInput) cohereApiKeyInput.value = settings.cohereApiKey || '';
  if (hfApiKeyInput) hfApiKeyInput.value = settings.hfApiKey || '';
  if (openaiApiKeyInput) openaiApiKeyInput.value = settings.openaiApiKey || '';
  if (anthropicApiKeyInput) anthropicApiKeyInput.value = settings.anthropicApiKey || '';
  if (deepseekApiKeyInput) deepseekApiKeyInput.value = settings.deepseekApiKey || '';

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
  selectedModelSelect.addEventListener('change', updateOptionsQuota);

  // Tüm şifre göster/gizle butonlarını dinle
  document.querySelectorAll('.toggle-key-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const inputEl = document.getElementById(targetId);
      if (!inputEl) return;
      if (inputEl.type === 'password') {
        inputEl.type = 'text';
        btn.textContent = '🔒';
      } else {
        inputEl.type = 'password';
        btn.textContent = '👁️';
      }
    });
  });

  // Kaydet butonu
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Kaydediliyor...';

    const newSettings = {
      apiKey: apiKeyInput.value.trim(),
      groqApiKey: groqApiKeyInput ? groqApiKeyInput.value.trim() : '',
      cohereApiKey: cohereApiKeyInput ? cohereApiKeyInput.value.trim() : '',
      hfApiKey: hfApiKeyInput ? hfApiKeyInput.value.trim() : '',
      openaiApiKey: openaiApiKeyInput ? openaiApiKeyInput.value.trim() : '',
      anthropicApiKey: anthropicApiKeyInput ? anthropicApiKeyInput.value.trim() : '',
      deepseekApiKey: deepseekApiKeyInput ? deepseekApiKeyInput.value.trim() : '',
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
