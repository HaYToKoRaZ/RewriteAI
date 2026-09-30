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
    selectedText: 'Seçilen Metin',
    convertedResult: 'Dönüştürülen Sonuç',
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
    goToSettings: '⚙️ Ayarlara Git',
    quotaLabel: 'Google Kotası',
    quotaToday: 'Bugün',
    quotaPanel: 'Panel ↗',
    pageReplaceError: 'Sayfa metni doğrudan değiştirilemedi, lütfen kopyalayın.',
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
    toneLabel: 'Dönüşüm Tonu:',
    // Options
    optionsTitle: 'RewriteAI Ayarları',
    optionsSubtitle: 'Çoklu Yapay Zeka Sağlayıcıları ve Tercihler',
    modelLabel: 'Varsayılan Yapay Zeka Modeli',
    modelHelper: '💡 Seçtiğiniz modele ait API anahtarının girilmiş olduğundan emin olun.',
    toneDefaultLabel: 'Varsayılan Ton',
    autoCopyLabel: 'Dönüştürme tamamlandığında sonucu otomatik panoya kopyala',
    showBubbleLabel: 'Metin seçildiğinde hızlı düzenleme ikonunu göster',
    showBubbleHelper: 'Kapalıyken yalnızca sağ tıkla açılabilir.',
    apiKeysTitle: '🔑 Yapay Zeka API Anahtarları / Tokenleri',
    apiKeysDesc: 'Kullanmak istediğiniz servisin anahtarını girin. En az bir tanesini girmeniz tavsiye edilir.',
    tokenSaved: 'Token Kayıtlı ve Güvende',
    deleteToken: '🗑️ Sil',
    versionLabel: 'Sürüm',
    websiteLink: '🌐 Web Sitesi',
    githubLink: '📂 GitHub',
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
    selectedText: 'Selected Text',
    convertedResult: 'Converted Result',
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
    goToSettings: '⚙️ Go to Settings',
    quotaLabel: 'Google Quota',
    quotaToday: 'Today',
    quotaPanel: 'Panel ↗',
    pageReplaceError: 'Could not replace text directly in page, please copy manually.',
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
    toneLabel: 'Tone:',
    // Options
    optionsTitle: 'RewriteAI Settings',
    optionsSubtitle: 'Multi-Provider AI Support & Preferences',
    modelLabel: 'Default AI Model',
    modelHelper: '💡 Make sure the API key for your selected model is entered below.',
    toneDefaultLabel: 'Default Tone',
    autoCopyLabel: 'Automatically copy result to clipboard after transform',
    showBubbleLabel: 'Show quick-edit bubble icon on text selection',
    showBubbleHelper: 'When off, only right-click menu can open the editor.',
    apiKeysTitle: '🔑 AI API Keys / Tokens',
    apiKeysDesc: 'Enter the key for the service you want to use. At least one is recommended.',
    tokenSaved: 'Token Saved & Secure',
    deleteToken: '🗑️ Delete',
    versionLabel: 'Version',
    websiteLink: '🌐 Website',
    githubLink: '📂 GitHub',
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
