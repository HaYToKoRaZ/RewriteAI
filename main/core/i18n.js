/**
 * RewriteAI Çift Dil Modülü (TR/EN)
 * Tarayıcı dilini okur, chrome.storage'dan kullanıcı tercihini alır.
 */

export const TRANSLATIONS = {
  tr: {
    // Genel
    appName: 'RewriteAI Metin Düzenleyici',
    settings: 'Ayarlar',
    close: 'Kapat',
    langLabel: 'Dil',
    // Modal
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
    keyMissing: 'API Anahtarı girilmemiş! Bu modeli kullanabilmek için anahtar ekleyin.',
    keyMissingWarningPrefix: '⚠️ Bu model için API Anahtarı girilmemiş!',
    goToSettings: '⚙️ Ayarlara Git',
    quotaLabel: 'Google Kotası',
    quotaToday: 'Bugün',
    quotaPanel: 'Panel ↗',
    pageReplaceError: 'Sayfa metni doğrudan değiştirilemedi, lütfen kopyalayın.',
    triggerBtnTitle: 'RewriteAI ile Düzenle',
    // Popup
    popupTitle: 'RewriteAI',
    originalText: 'Orijinal Metin',
    paste: '📋 Yapıştır',
    clear: '🗑️ Temizle',
    convertBtn: 'Metni Yeniden Yaz',
    convertedText: 'Dönüştürülen Metin',
    copyResult: '📄 Kopyala',
    charCount: (n) => `${n} karakter`,
    statusReady: 'Hazır',
    statusPasted: 'Panodan yapıştırıldı',
    statusClipboardError: 'Pano okunamadı',
    statusCleared: 'Temizlendi',
    statusCopied: 'Tamamlandı & panoya kopyalandı',
    statusError: 'Hata oluştu',
    statusEnterText: 'Lütfen metin girin',
    apiMissingAlert: 'API anahtarınızı girmediniz.',
    setupBtn: 'Ayarla',
    modelLabelShort: 'AI Modeli:',
    toneLabel: 'Dönüşüm Tonu:',
    // Options Page
    optionsTitle: 'RewriteAI Ayarları',
    optionsSubtitle: 'Çoklu Yapay Zeka Sağlayıcıları ve Tercihler',
    modelLabel: 'Yapay Zeka Modeli',
    modelHelper: '💡 İstediğiniz sağlayıcının modelini seçebilirsiniz. Seçtiğiniz modele ait API anahtarının aşağıdaki panelde girilmiş olduğundan emin olun.',
    toneDefaultLabel: 'Varsayılan Ton',
    autoCopyLabel: 'Dönüştürme tamamlandığında sonucu otomatik panoya kopyala',
    showBubbleLabel: 'Metin seçildiğinde hızlı düzenleme butonunu (ikonu) göster',
    showBubbleHelper: 'Kapalı olduğunda yalnızca sağ tıklayıp "RewriteAI ile Düzenle" menüsünü kullanarak pencereyi açabilirsiniz.',
    apiKeysTitle: '🔑 Yapay Zeka API Anahtarları / Tokenleri',
    apiKeysDesc: 'Kullanmak istediğiniz servisin anahtarını buraya girmeniz yeterlidir. En az bir tanesini girmeniz tavsiye edilir.',
    freeTierBadge: 'Ücretsiz Tier',
    freeUltraBadge: 'Ücretsiz & Ultra Hızlı',
    freeTrialBadge: 'Ücretsiz Trial',
    freeTokenBadge: 'Ücretsiz Token',
    paidChatGptBadge: 'ChatGPT / Bakiye',
    paidBalanceBadge: 'Hesap Bakiyesi',
    paidBudgetBadge: 'Ekonomik Bakiye',
    getKeyLink: 'Ücretsiz Anahtar Al ↗',
    getTrialLink: 'Ücretsiz Trial Al ↗',
    getTokenLink: 'Ücretsiz Token Al ↗',
    openAiPortalLink: 'OpenAI Paneli ↗',
    claudePortalLink: 'Claude Paneli ↗',
    deepseekPortalLink: 'DeepSeek Paneli ↗',
    tokenSaved: 'Token Kayıtlı ve Güvende',
    deleteToken: '🗑️ Sil',
    deleteConfirm: 'Bu API anahtarını silmek istediğinize emin misiniz?',
    deleteSuccess: 'API Anahtarı silindi.',
    settingsAutoSaved: 'Ayarlar otomatik kaydedildi',
    modelSavedToast: 'Model tercihi kaydedildi',
    toneSavedToast: 'Varsayılan ton kaydedildi',
    prefSavedToast: 'Tercih güncellendi',
    keySavedToast: 'API Anahtarı güvenle kaydedildi',
    versionLabel: 'Sürüm',
    websiteLink: '🌐 Web Sitesi',
    githubLink: '📂 GitHub',
    quotaCardTitle: '📊 Google Gemini Kota Kullanımı',
    quotaOfficialPanel: 'AI Studio Resmi Panel ↗',
    quotaTodaySuffix: '/ 1.500 istek (Bugün)',
    quotaRpm: '⚡ Dakikalık Limit (RPM): <strong>15 istek/dk</strong>',
    quotaRpd: '📅 Günlük Limit (RPD): <strong>1.500 istek/gün</strong>',
    // Tonlar (Kartlar & Butonlar)
    tones: {
      fix_grammar: { title: '✍️ İmla & Dilbilgisi', desc: 'Hataları düzeltir' },
      daily: { title: '💬 Günlük & Samimi', desc: 'Doğal konuşma dili' },
      formal: { title: '💼 Resmi & Kurumsal', desc: 'Profesyonel üslup' },
      slang: { title: '🔥 Argo & Sokak Ağzı', desc: 'Gençlik jargonu' },
      academic: { title: '🎓 Akademik & Ağır', desc: 'Bilimsel terminoloji' },
      summarize: { title: '📌 Özetle', desc: 'Kısa ve netleştir' }
    },
    // Context menu
    contextEdit: 'RewriteAI ile Düzenle...',
    contextVisitSite: '🌐 RewriteAI Web Sitesini Aç',
    contextOpenPortal: '🚀 RewriteAI Portalı'
  },
  en: {
    // General
    appName: 'RewriteAI Text Editor',
    settings: 'Settings',
    close: 'Close',
    langLabel: 'Language',
    // Modal
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
    keyMissing: 'API Key missing! Add your key in settings to use this model.',
    keyMissingWarningPrefix: '⚠️ No API Key found for this model!',
    goToSettings: '⚙️ Go to Settings',
    quotaLabel: 'Google Quota',
    quotaToday: 'Today',
    quotaPanel: 'Panel ↗',
    pageReplaceError: 'Could not replace text directly in page, please copy manually.',
    triggerBtnTitle: 'Edit with RewriteAI',
    // Popup
    popupTitle: 'RewriteAI',
    originalText: 'Original Text',
    paste: '📋 Paste',
    clear: '🗑️ Clear',
    convertBtn: 'Rewrite Text',
    convertedText: 'Converted Text',
    copyResult: '📄 Copy',
    charCount: (n) => `${n} characters`,
    statusReady: 'Ready',
    statusPasted: 'Pasted from clipboard',
    statusClipboardError: 'Clipboard read failed',
    statusCleared: 'Cleared',
    statusCopied: 'Done & copied to clipboard',
    statusError: 'An error occurred',
    statusEnterText: 'Please enter some text',
    apiMissingAlert: 'No API key found.',
    setupBtn: 'Setup',
    modelLabelShort: 'AI Model:',
    toneLabel: 'Tone:',
    // Options Page
    optionsTitle: 'RewriteAI Settings',
    optionsSubtitle: 'Multi-Provider AI Support & Preferences',
    modelLabel: 'AI Model',
    modelHelper: '💡 Choose any provider model. Ensure the corresponding API key is entered in the panel below.',
    toneDefaultLabel: 'Default Tone',
    autoCopyLabel: 'Automatically copy result to clipboard after transform',
    showBubbleLabel: 'Show quick-edit button (icon) when text is selected',
    showBubbleHelper: 'When off, only right-click context menu "Edit with RewriteAI" can open the editor.',
    apiKeysTitle: '🔑 AI API Keys / Tokens',
    apiKeysDesc: 'Enter the key for the service you wish to use. At least one key is recommended.',
    freeTierBadge: 'Free Tier',
    freeUltraBadge: 'Free & Ultra Fast',
    freeTrialBadge: 'Free Trial',
    freeTokenBadge: 'Free Token',
    paidChatGptBadge: 'ChatGPT / Credit',
    paidBalanceBadge: 'Account Balance',
    paidBudgetBadge: 'Cost-effective',
    getKeyLink: 'Get Free Key ↗',
    getTrialLink: 'Get Free Trial ↗',
    getTokenLink: 'Get Free Token ↗',
    openAiPortalLink: 'OpenAI Console ↗',
    claudePortalLink: 'Claude Console ↗',
    deepseekPortalLink: 'DeepSeek Console ↗',
    tokenSaved: 'Token Saved & Secure',
    deleteToken: '🗑️ Delete',
    deleteConfirm: 'Are you sure you want to delete this API key?',
    deleteSuccess: 'API Key deleted.',
    settingsAutoSaved: 'Settings saved automatically',
    modelSavedToast: 'Model preference saved',
    toneSavedToast: 'Default tone saved',
    prefSavedToast: 'Preference updated',
    keySavedToast: 'API Key securely saved',
    versionLabel: 'Version',
    websiteLink: '🌐 Website',
    githubLink: '📂 GitHub',
    quotaCardTitle: '📊 Google Gemini Quota Usage',
    quotaOfficialPanel: 'Official AI Studio Panel ↗',
    quotaTodaySuffix: '/ 1,500 requests (Today)',
    quotaRpm: '⚡ Rate Limit (RPM): <strong>15 req/min</strong>',
    quotaRpd: '📅 Daily Limit (RPD): <strong>1,500 req/day</strong>',
    // Tones (Cards & Buttons)
    tones: {
      fix_grammar: { title: '✍️ Grammar & Spelling', desc: 'Fixes errors' },
      daily: { title: '💬 Casual & Friendly', desc: 'Natural conversational' },
      formal: { title: '💼 Formal & Corporate', desc: 'Professional style' },
      slang: { title: '🔥 Slang & Street', desc: 'Youth jargon' },
      academic: { title: '🎓 Academic & Formal', desc: 'Scientific terminology' },
      summarize: { title: '📌 Summarize', desc: 'Brief and clear' }
    },
    // Context menu
    contextEdit: 'Edit with RewriteAI...',
    contextVisitSite: '🌐 Open RewriteAI Website',
    contextOpenPortal: '🚀 RewriteAI Portal'
  }
};

/**
 * Kullanıcının dil tercihini storage'dan veya tarayıcı dilinden belirler.
 * @returns {Promise<'tr'|'en'>}
 */
export async function detectLanguage() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ uiLanguage: '' }, (data) => {
      if (data.uiLanguage === 'tr' || data.uiLanguage === 'en') {
        resolve(data.uiLanguage);
        return;
      }
      // Kullanıcı tercihi yoksa tarayıcı dilini oku
      const browserLang = (navigator.language || navigator.userLanguage || 'tr').toLowerCase();
      resolve(browserLang.startsWith('tr') ? 'tr' : 'en');
    });
  });
}

/**
 * Verilen dil koduna göre çeviri nesnesini döndürür.
 * @param {'tr'|'en'} lang
 * @returns {Object}
 */
export function getT(lang) {
  return TRANSLATIONS[lang] || TRANSLATIONS.tr;
}
