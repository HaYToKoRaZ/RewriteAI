import { StorageRepository } from '../../data/StorageRepository.js';
import { TextTransformService } from '../../services/TextTransformService.js';
import { AVAILABLE_MODELS } from '../../data/DefaultSettings.js';
import { detectLanguage, getT } from '../../core/i18n.js';
import { FLAG_SVGS, TARGET_LANG_ITEMS } from '../../core/FlagSVGs.js';

document.addEventListener('DOMContentLoaded', async () => {
  // ── DOM ──
  const modelSelect = document.getElementById('popupModelSelect');
  const targetLangSelect = document.getElementById('popupTargetLangSelect');
  const lblTargetLang = document.getElementById('lblTargetLang');
  const keyWarningBox = document.getElementById('keyWarningBox');
  const keyWarningText = document.getElementById('keyWarningText');
  const warningSettingsBtn = document.getElementById('warningSettingsBtn');
  const toneCardBtns = document.querySelectorAll('.tone-card-btn:not(#moreTonesToggleBtn)');
  const moreTonesToggleBtn = document.getElementById('moreTonesToggleBtn');
  const moreTonesBtnLabel = document.getElementById('moreTonesBtnLabel');
  const moreTonesBtnIcon = document.getElementById('moreTonesBtnIcon');
  const moreTonesDrawer = document.getElementById('moreTonesDrawer');
  const moreToneItems = document.querySelectorAll('.more-tone-item');
  const drawerCustomToneName = document.getElementById('drawerCustomToneName');
  const editCustomHint = document.getElementById('editCustomHint');

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
  const twitterModeBtn = document.getElementById('twitterModeBtn');
  const twitterBar = document.getElementById('twitterBar');
  const twitterTogglePill = document.getElementById('twitterTogglePill');
  const twitterLimitHint = document.getElementById('twitterLimitHint');
  const outputCharBar = document.getElementById('outputCharBar');
  const outputCharCount = document.getElementById('outputCharCount');

  let selectedTone = 'fix_grammar';
  let targetLang = 'auto';
  let twitterMode = false;

  let lang = await detectLanguage();
  let t = getT(lang);

  // Versiyon Gösterimi
  try {
    const brandVersionEl = document.getElementById('brandVersion');
    if (brandVersionEl && chrome.runtime && chrome.runtime.getManifest) {
      brandVersionEl.textContent = `v${chrome.runtime.getManifest().version}`;
    }
  } catch (err) {
    console.warn('Versiyon yüklenemedi:', err);
  }

  function renderPopupModels() {
    const currentVal = modelSelect.value;
    modelSelect.innerHTML = '';
    const groups = {};

    AVAILABLE_MODELS.forEach((m) => {
      const groupKey = m.provider || 'other';
      const localizedGroup = (t.modelGroups && t.modelGroups[groupKey]) ? t.modelGroups[groupKey] : (m.group || 'Diğer Modeller');

      if (!groups[groupKey]) {
        const optGroup = document.createElement('optgroup');
        optGroup.label = localizedGroup;
        groups[groupKey] = optGroup;
        modelSelect.appendChild(optGroup);
      }

      const opt = document.createElement('option');
      opt.value = m.id;
      const localizedName = (t.models && t.models[m.id]) ? t.models[m.id] : m.name;
      opt.textContent = localizedName;
      groups[groupKey].appendChild(opt);
    });

    if (currentVal) modelSelect.value = currentVal;
  }

  const customLangDropdown = document.getElementById('customLangDropdown');
  const customLangBtn = document.getElementById('customLangBtn');
  const customLangMenu = document.getElementById('customLangMenu');
  const customLangSelectedFlag = document.getElementById('customLangSelectedFlag');
  const customLangSelectedText = document.getElementById('customLangSelectedText');

  function updateCustomDropdownUI(val) {
    const item = TARGET_LANG_ITEMS.find((it) => it.code === val) || TARGET_LANG_ITEMS[0];
    const flagSvg = FLAG_SVGS[item.code] || FLAG_SVGS.auto;
    const name = lang === 'en' ? item.nameEn : item.nameTr;
    
    if (customLangSelectedFlag) {
      customLangSelectedFlag.style.backgroundImage = `url("${flagSvg}")`;
    }
    if (customLangSelectedText) {
      customLangSelectedText.textContent = name;
    }
    if (customLangMenu) {
      customLangMenu.querySelectorAll('.custom-dropdown-item').forEach((el) => {
        el.classList.toggle('active', el.getAttribute('data-code') === item.code);
      });
    }
  }

  function renderTargetLangOptions() {
    if (!customLangMenu) return;
    const currentVal = targetLangSelect ? (targetLangSelect.value || targetLang) : targetLang;

    // Özel menüyü oluştur
    customLangMenu.innerHTML = '';
    TARGET_LANG_ITEMS.forEach((it) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `custom-dropdown-item ${it.code === currentVal ? 'active' : ''}`;
      btn.setAttribute('data-code', it.code);

      const flagSpan = document.createElement('span');
      flagSpan.className = 'custom-dropdown-flag';
      flagSpan.style.backgroundImage = `url("${FLAG_SVGS[it.code] || FLAG_SVGS.auto}")`;

      const textSpan = document.createElement('span');
      textSpan.textContent = lang === 'en' ? it.nameEn : it.nameTr;

      btn.appendChild(flagSpan);
      btn.appendChild(textSpan);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        targetLang = it.code;
        if (targetLangSelect) targetLangSelect.value = targetLang;
        StorageRepository.saveTargetLanguage(targetLang);
        updateCustomDropdownUI(targetLang);
        customLangDropdown && customLangDropdown.classList.remove('open');
      });

      customLangMenu.appendChild(btn);
    });

    // Native select güncelle (yedek)
    if (targetLangSelect) {
      targetLangSelect.innerHTML = TARGET_LANG_ITEMS.map((it) => {
        const name = lang === 'en' ? it.nameEn : it.nameTr;
        return `<option value="${it.code}">${name}</option>`;
      }).join('');
      targetLangSelect.value = currentVal;
    }

    updateCustomDropdownUI(currentVal);
  }

  // Dropdown açma / kapatma
  if (customLangBtn) {
    customLangBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      customLangDropdown && customLangDropdown.classList.toggle('open');
    });
  }

  document.addEventListener('click', (e) => {
    if (customLangDropdown && !customLangDropdown.contains(e.target)) {
      customLangDropdown.classList.remove('open');
    }
  });

  function applyLanguage() {
    t = getT(lang);

    // Dil butonları
    langBtnTr.classList.toggle('active', lang === 'tr');
    langBtnEn.classList.toggle('active', lang === 'en');

    // Model çubuğu ve hedef dil etiketi
    const modelBarLabel = document.querySelector('.model-bar-label');
    if (modelBarLabel) {
      modelBarLabel.textContent = t.modelLabelShort || (lang === 'en' ? 'AI Model:' : 'AI Modeli:');
    }
    if (lblTargetLang) {
      lblTargetLang.textContent = t.targetLangLabel || (lang === 'en' ? 'Output:' : 'Çıktı:');
    }
    renderPopupModels();
    renderTargetLangOptions();

    // Ton Butonları (Açıklamasız, sadece başlık)
    toneCardBtns.forEach((btn) => {
      const toneKey = btn.getAttribute('data-tone');
      if (t.tones && t.tones[toneKey]) {
        const titleEl = btn.querySelector('strong');
        if (titleEl) {
          // Başlıktan emojiyi veya uzun kısmı ayır
          const fullTitle = t.tones[toneKey].title;
          const cleanTitle = fullTitle.replace(/^[^\wğüşıöçĞÜŞİÖÇa-zA-Z0-9]+/, '').split('&')[0].trim();
          titleEl.textContent = cleanTitle || fullTitle;
        }
      }
    });

    if (moreTonesBtnLabel && !moreTonesToggleBtn.classList.contains('active-custom')) {
      moreTonesBtnLabel.textContent = t.moreTonesBtn || (lang === 'en' ? 'Others ▾' : 'Diğerleri ▾');
    }

    // Çekmece içi tonlar
    moreToneItems.forEach((item) => {
      const toneKey = item.getAttribute('data-tone');
      if (toneKey === 'custom') return;
      if (t.tones && t.tones[toneKey]) {
        const nameEl = item.querySelector('.more-tone-name');
        const descEl = item.querySelector('.more-tone-desc');
        if (nameEl) nameEl.textContent = t.tones[toneKey].title;
        if (descEl) descEl.textContent = t.tones[toneKey].desc;
      }
    });

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
      await StorageRepository.saveUiLanguage(lang);
      applyLanguage();
    });
  });

  // ── Sağlayıcı ve Anahtar Kontrol Fonksiyonu ──
  function checkModelKey(modelId, callback) {
    const providerNames = {
      apiKey: 'Google Gemini', groqApiKey: 'Groq', cohereApiKey: 'Cohere',
      hfApiKey: 'Hugging Face', openaiApiKey: 'OpenAI',
      anthropicApiKey: 'Anthropic Claude', deepseekApiKey: 'DeepSeek'
    };
    StorageRepository.getApiKeyForModel(modelId).then(({ keyName, value }) => {
      const hasKey = !!(value && value.trim());
      if (!hasKey) {
        const providerName = providerNames[keyName] || 'AI';
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
    StorageRepository.saveSelectedModel(newModel).then(() => {
      checkModelKey(newModel, (hasKey) => {
        if (hasKey) {
          setStatus(t.statusDefaultModelUpdated || '✓ Varsayılan model güncellendi', 'success');
        } else {
          setStatus('Uyarı: Model API anahtarı eksik!', 'error');
        }
      });
    });
  });

  // ── Ton Çekmecesi (Diğerleri ▾) Açma/Kapama ──
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

  // ── Çekmece İçi Ton Seçimi ──
  moreToneItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('#editCustomHint')) return; // Düzenle butonuna basıldıysa tetikleme
      const toneKey = item.getAttribute('data-tone');
      selectedTone = toneKey;

      // Ana gridteki butonların aktifliğini kaldır
      toneCardBtns.forEach((b) => b.classList.remove('active'));
      moreToneItems.forEach((b) => b.classList.remove('active'));
      item.classList.add('active');

      // "Diğerleri ▾" butonunu aktif yap ve ikon/başlığını seçilen tona göre güncelle
      if (moreTonesToggleBtn) {
        moreTonesToggleBtn.classList.add('active', 'active-custom');
        const iconSpan = item.querySelector('.more-tone-icon');
        const nameSpan = item.querySelector('.more-tone-name');
        if (iconSpan && moreTonesBtnIcon) moreTonesBtnIcon.textContent = iconSpan.textContent;
        if (nameSpan && moreTonesBtnLabel) {
          const shortName = nameSpan.textContent.split('&')[0].split('/')[0].trim();
          moreTonesBtnLabel.textContent = `${shortName} ▾`;
        }
      }

      // Çekmeceyi kapat
      if (moreTonesDrawer) {
        moreTonesDrawer.classList.remove('open');
        moreTonesToggleBtn.classList.remove('drawer-open');
      }

      // Kullanıcının metni varsa ve işlem çalışmıyorsa direkt dönüştür
      if (inputText.value.trim() && !transformBtn.disabled) {
        runTransformation();
      }
    });
  });

  // ── Özel Ton Düzenle İpucuna Tıklama (Ayarlar sayfasını aç) ──
  if (editCustomHint) {
    editCustomHint.addEventListener('click', (e) => {
      e.stopPropagation();
      chrome.tabs.create({ url: chrome.runtime.getURL('presentation/options/options.html#customToneCard') });
    });
  }

  // ── Ton Butonları Tıklama (Aktif yap + Metin varsa anında dönüştür) ──
  toneCardBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      toneCardBtns.forEach((b) => b.classList.remove('active'));
      moreToneItems.forEach((b) => b.classList.remove('active'));
      if (moreTonesToggleBtn) {
        moreTonesToggleBtn.classList.remove('active', 'active-custom');
        if (moreTonesBtnIcon) moreTonesBtnIcon.textContent = '✨';
        if (moreTonesBtnLabel) moreTonesBtnLabel.textContent = t.moreTonesBtn || (lang === 'en' ? 'Others ▾' : 'Diğerleri ▾');
      }
      if (moreTonesDrawer) moreTonesDrawer.classList.remove('open');

      btn.classList.add('active');
      selectedTone = btn.getAttribute('data-tone');

      // Kullanıcının metni varsa ve işlem çalışmıyorsa direkt dönüştür
      if (inputText.value.trim() && !transformBtn.disabled) {
        runTransformation();
      }
    });
  });

  // ── Hedef Çıktı Dili Değişimi (Kalıcı kaydet) ──
  if (targetLangSelect) {
    targetLangSelect.addEventListener('change', () => {
      targetLang = targetLangSelect.value;
      StorageRepository.saveTargetLanguage(targetLang);
    });
  }

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

  // Kayıtlı hedef çıktı dili seçimi
  const savedTargetLang = await StorageRepository.getTargetLanguage();
  if (savedTargetLang) {
    targetLang = savedTargetLang;
    if (targetLangSelect) targetLangSelect.value = targetLang;
    updateCustomDropdownUI(targetLang);
  }

  // Kayıtlı Twitter modu
  twitterMode = await StorageRepository.getTwitterMode();
  applyTwitterUI();

  // Özel Ton Başlığını UI'a Yansıt
  if (drawerCustomToneName && settings.customToneTitle) {
    drawerCustomToneName.textContent = settings.customToneTitle;
  }

  // Ton Seçimini Geri Yükle Yardımcısı
  function applyActiveToneUI(tone) {
    selectedTone = tone;
    let foundInMainGrid = false;
    toneCardBtns.forEach((btn) => {
      const match = btn.getAttribute('data-tone') === selectedTone;
      btn.classList.toggle('active', match);
      if (match) foundInMainGrid = true;
    });

    if (foundInMainGrid) {
      if (moreTonesToggleBtn) {
        moreTonesToggleBtn.classList.remove('active', 'active-custom');
        if (moreTonesBtnIcon) moreTonesBtnIcon.textContent = '✨';
        if (moreTonesBtnLabel) moreTonesBtnLabel.textContent = t.moreTonesBtn || (lang === 'en' ? 'Others ▾' : 'Diğerleri ▾');
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
        const iconSpan = matchedDrawerItem.querySelector('.more-tone-icon');
        const nameSpan = matchedDrawerItem.querySelector('.more-tone-name');
        if (iconSpan && moreTonesBtnIcon) moreTonesBtnIcon.textContent = iconSpan.textContent;
        if (nameSpan && moreTonesBtnLabel) {
          const shortName = nameSpan.textContent.split('&')[0].split('/')[0].trim();
          moreTonesBtnLabel.textContent = `${shortName} ▾`;
        }
      }
    }
  }

  // Kayıtlı varsayılan ton seçimi
  if (settings.defaultTone) {
    applyActiveToneUI(settings.defaultTone);
  }

  // Son oturumdan metni geri yükle
  const lastState = await StorageRepository.getLastResult();
  if (lastState.lastInputText) inputText.value = lastState.lastInputText;
  if (lastState.lastOutputText) outputText.value = lastState.lastOutputText;
  if (lastState.lastTone) {
    applyActiveToneUI(lastState.lastTone);
  }

  // Dili uygula
  applyLanguage();

  // ── Karakter sayımı (giriş) ──
  inputText.addEventListener('input', () => {
    charCount.textContent = t.charCount(inputText.value.length);
  });

  // ── Twitter Modu UI Güncelleme ──
  function applyTwitterUI() {
    if (twitterMode) {
      twitterBar.classList.add('twitter-active');
    } else {
      twitterBar.classList.remove('twitter-active');
    }
    // Sayac her zaman görünür, sadece içeriği güncelle
    updateOutputCharCounter(outputText.value);
  }

  // ── Output karakter sayacı güncelle ──
  function updateOutputCharCounter(text) {
    const len = (text || '').length;
    outputCharCount.className = '';
    if (twitterMode) {
      outputCharCount.textContent = `${len} / 280`;
      if (len > 280) {
        outputCharCount.classList.add('over-limit');
      } else if (len > 240) {
        outputCharCount.classList.add('near-limit');
      } else if (len > 0) {
        outputCharCount.classList.add('under-limit');
      }
    } else {
      outputCharCount.textContent = `${len} karakter`;
      if (len > 0) outputCharCount.classList.add('under-limit');
    }
  }

  // ── Twitter Modu Toggle ──
  if (twitterModeBtn) {
    twitterModeBtn.addEventListener('click', () => {
      twitterMode = !twitterMode;
      StorageRepository.saveTwitterMode(twitterMode);
      applyTwitterUI();
      if (twitterMode && outputText.value) {
        updateOutputCharCounter(outputText.value);
      }
    });
  }
  if (twitterTogglePill) {
    twitterTogglePill.addEventListener('click', () => {
      twitterModeBtn.click();
    });
  }

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
    const curTargetLang = targetLangSelect ? targetLangSelect.value : targetLang;
    checkModelKey(curModel, async (hasKey) => {
      if (!hasKey) {
        setStatus(t.keyMissing || 'Model API anahtarı eksik!', 'error');
        outputText.value = '⚠️ Lütfen seçtiğiniz model için eklenti ayarlarından API anahtarınızı girin.';
        return;
      }

      setLoading(true);
      setStatus(t.statusProcessing, '');

      try {
        const result = await TextTransformService.transform(text, selectedTone, curModel, curTargetLang, twitterMode);
        outputText.value = result;
        setStatus(t.statusDone, 'success');
        // Output karakter sayacı
        if (twitterMode) updateOutputCharCounter(result);

        // Otomatik kopyalama
        const currentSettings = await StorageRepository.getSettings();
        if (currentSettings.autoCopy) {
          await navigator.clipboard.writeText(result);
          setStatus(t.statusCopied, 'success');
        }
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
