/**
 * RewriteAI Landing Page Logic & Localization
 * Multi-language support (TR/EN) & Interactive Mockup & Cat companion purrs
 */

const I18N_WEB = {
  tr: {
    navFeatures: 'Özellikler',
    navPreview: 'Canlı Deneyim',
    navProviders: 'AI Sağlayıcıları',
    navDownload: 'İndir',
    navReleases: '📦 Sürümler',
    navGithub: '📂 GitHub',
    navPortal: '🚀 HaYTooL PoRTaL',
    navInstallBtn: '🚀 Eklentiyi Edin',
    heroBadge: 'Çoklu AI Destekli Yeni Nesil Tarayıcı Eklentisi',
    heroTitleGradient: 'Tek Tıkla Seç, Dönüştür;',
    heroTitleRest: 'Yazılarınıza Yapay Zeka Dokunuşu Yapın.',
    heroSubtitle: 'İnternette gezinirken veya yazarken metinleri seçin; imla hatalarını anında giderin, resmi, samimi, akademik veya mizahi tonlara saniyeler içinde uyarlayın. Google Gemini, Groq, Claude ve OpenAI gücüyle.',
    storeSubChrome: 'Google Chrome İçin',
    storeSubEdge: 'Microsoft Edge İçin',
    storeSubHelium: 'Helium Browser İçin',
    storeSubReleases: 'Tüm Tarayıcılar İçin',
    badgeOfficial: 'Resmi',
    badgeAddon: 'Eklenti',
    badgeFast: 'Uyumlu',
    badgeRelease: 'Son Sürüm',
    catName: '🐱 RewriteBot Maskotu Mia',
    catQuote: '"Miyav! İster e-posta yaz, ister tweet at, ister makale hazırla... Hatalarını düzeltip tam istediğin üslupla metnini pırıl pırıl yapıyorum!"',
    catPurrBtn: '🐾 Sev Beni',
    mockupBarTitle: 'RewriteAI Content Modal & Ton Seçici Simülasyonu',
    mockupInputTitle: 'Orijinal Metin (Seçilen)',
    mockupOutputTitle: 'AI Çıktısı (Anında Dönüşüm)',
    tone1: '✍️ İmla & Dilbilgisi',
    tone2: '💬 Günlük & Samimi',
    tone3: '💼 Resmi & Kurumsal',
    tone4: '🔥 Argo & Sokak Ağzı',
    tone5: '🎓 Akademik',
    tone6: '📌 Özetle',
    featuresBadge: 'Neden RewriteAI?',
    featuresTitle: 'Gelişmiş Yazım Asistanınız Her Sekmede Yanınızda',
    featuresDesc: 'Karmaşık ayarlar veya kopyala-yapıştır zorunluluğu yok. Metni seçin, tonu belirleyin, sayfaya anında yerleştirin.',
    feat1Title: 'Tek Tıkla Sayfada Değiştir',
    feat1Text: 'Web sayfasında veya giriş alanında seçtiğiniz metni dönüştürdükten sonra tek tıkla doğrudan orijinal metnin yerine yerleştirir.',
    feat2Title: '14+ Farklı Üslup, Ton & Özel Prompt',
    feat2Text: 'İmla, günlük, resmi, argo, gamer, tekno, özetle kartları ve açılır menüde akademik, diplomatik, pazarlama, ELI5, satış ve kendi özel şablonunuzu belirleyebileceğiniz Özel Ton seçeneği.',
    feat3Title: 'Ücretsiz Yüksek Kota',
    feat3Text: 'Google Gemini ile günde 1.500 istek ve dakikada 15 istek ücretsiz kullanım. Kota takip paneli eklenti içine entegredir.',
    feat4Title: 'Çoklu Sağlayıcı Desteği',
    feat4Text: 'Google Gemini, Groq, Cohere, Hugging Face, OpenAI, Anthropic Claude ve DeepSeek modelleri arasında dilediğiniz gibi geçiş yapın.',
    feat5Title: '%100 Gizlilik ve Güvenlik',
    feat5Text: 'Tüm API anahtarlarınız yalnızca kendi tarayıcınızın güvenli yerel depolama alanında saklanır. Asla harici bir sunucuya gitmez.',
    feat6Title: '20+ Dilde Akıllı Ton & Çeviri',
    feat6Text: 'Sadece Türkçe ve İngilizce değil; Almanca, Fransızca, İspanyolca, Japonca, Azerbaycanca dahil 20+ popüler dilde doğrudan seçilen üslup ve tonda çevirip yazar.',
    compBadge: 'Akıllı Ton Uyarlaması',
    compTitle: 'Geleneksel Çeviriciler vs. RewriteAI',
    compDesc: 'Klasik çeviriciler kelimeleri dümdüz çevirir; RewriteAI ise metni istediğiniz yabancı dilde tam arzu ettiğiniz üslupla yeniden yazar.',
    thInput: 'Girdi Metni (TR)',
    thStandard: 'Klasik Çevirici (Google / DeepL)',
    thRewrite: 'RewriteAI (Ton & Çeviri Motoru)',
    providersBadge: 'Yapay Zeka Motorları',
    providersTitle: 'Dünyanın En Güçlü Modelleriyle Entegre',
    providersDesc: 'Kendi API anahtarınızı girerek dilediğiniz modelin hız ve kalitesinden faydalanın.',
    ctaTitle: 'Yazım Deneyiminizi Bugün Yükseltin',
    ctaDesc: 'Chrome, Edge veya Helium tarayıcınıza hemen kurun; internetteki tüm metinleri saniyeler içinde mükemmelleştirin.',
    ctaBtn: '📥 Ücretsiz Eklentiyi İndir'
  },
  en: {
    navFeatures: 'Features',
    navPreview: 'Interactive Demo',
    navProviders: 'AI Providers',
    navDownload: 'Download',
    navReleases: '📦 Releases',
    navGithub: '📂 GitHub',
    navPortal: '🚀 HaYTooL PoRTaL',
    navInstallBtn: '🚀 Get Extension',
    heroBadge: 'Multi-AI Next-Gen Browser Extension',
    heroTitleGradient: 'Select & Transform with 1 Click;',
    heroTitleRest: 'Empower Your Writing with AI.',
    heroSubtitle: 'Highlight text anywhere on the web; instantly fix spelling mistakes, transform into formal, casual, academic or slang tones in seconds. Powered by Google Gemini, Groq, Claude & OpenAI.',
    storeSubChrome: 'For Google Chrome',
    storeSubEdge: 'For Microsoft Edge',
    storeSubHelium: 'For Helium Browser',
    storeSubReleases: 'For All Browsers',
    badgeOfficial: 'Official',
    badgeAddon: 'Add-on',
    badgeFast: 'Compatible',
    badgeRelease: 'Latest',
    catName: '🐱 RewriteBot Mascot Mia',
    catQuote: '"Meow! Whether writing emails, tweets or research papers... I fix mistakes and polish your text into the exact tone you desire!"',
    catPurrBtn: '🐾 Pet Me',
    mockupBarTitle: 'RewriteAI Content Modal & Tone Selector Simulator',
    mockupInputTitle: 'Original Text (Selected)',
    mockupOutputTitle: 'AI Output (Instant Transform)',
    tone1: '✍️ Grammar & Spelling',
    tone2: '💬 Casual & Friendly',
    tone3: '💼 Formal & Corporate',
    tone4: '🔥 Slang & Street',
    tone5: '🎓 Academic',
    tone6: '📌 Summarize',
    featuresBadge: 'Why RewriteAI?',
    featuresTitle: 'Your Advanced Writing Assistant on Every Tab',
    featuresDesc: 'No complicated setups or copy-paste friction. Select text, pick your tone, and replace directly into the webpage.',
    feat1Title: '1-Click In-Page Replace',
    feat1Text: 'Replace selected text directly inside web input boxes or articles with the polished AI result in one tap.',
    feat2Title: '14+ Versatile Tones & Custom Prompt',
    feat2Text: 'Fix grammar, casual, formal, slang, gamer, techie, summarize, plus expandable drawer with academic, diplomatic, marketing, ELI5, sales, and your own Custom Tone persona.',
    feat3Title: 'Free Generous Quota',
    feat3Text: '1,500 daily requests & 15 requests/min completely free via Google Gemini, tracked with built-in quota bar.',
    feat4Title: 'Multi-Provider Freedom',
    feat4Text: 'Seamlessly switch between Google Gemini, Groq, Cohere, Hugging Face, OpenAI, Anthropic Claude and DeepSeek.',
    feat5Title: '100% Privacy & Security',
    feat5Text: 'Your API keys stay strictly inside your own browser local storage. Never sent to any third-party telemetry server.',
    feat6Title: '20+ Languages & Transcreation',
    feat6Text: 'Don\'t just translate words—speak in the exact tone needed! Rewrite directly into English, German, French, Spanish, Japanese, Azerbaijani and 20+ languages in any chosen tone.',
    compBadge: 'Smart Transcreation',
    compTitle: 'Traditional Translators vs. RewriteAI',
    compDesc: 'Standard translators only do literal conversions; RewriteAI transforms your text with native-grade tone adaptation into 20+ languages.',
    thInput: 'Input Text (e.g. TR)',
    thStandard: 'Traditional Translator (Google / DeepL)',
    thRewrite: 'RewriteAI (Tone & Transcreation Engine)',
    providersBadge: 'AI Engines',
    providersTitle: 'Integrated with the World\'s Best Models',
    providersDesc: 'Plug in your own free API keys to leverage lightning speed and premium intelligence.',
    ctaTitle: 'Elevate Your Writing Experience Today',
    ctaDesc: 'Install on Chrome, Edge or Helium browser; transform every word you write across the web in seconds.',
    ctaBtn: '📥 Download Free Extension'
  }
};

const SAMPLE_TEXTS = {
  tr: {
    input: '"slm yarınkı toplantı saat kacda olcak acaba sunumu yetıstıremedımde bıraz erteleyebılırmıyız"',
    fix_grammar: '"Selam, yarınki toplantı saat kaçta olacak acaba? Sunumu yetiştiremedim de, biraz erteleyebilir miyiz?"',
    daily: '"Selamlar! Yarınki toplantı kaçtaydı acaba? Sunum biraz sarktı da, toplantıyı azıcık erteleyebilir miyiz?"',
    formal: '"Sayın İlgili, yarın gerçekleştirilmesi planlanan toplantının saati hususunda bilgi rica ederim. Sunum hazırlıklarındaki gecikme sebebiyle toplantının ileri bir saate ertelenmesi hususunu takdirlerinize arz ederim."',
    slang: '"Selam millet, yarınki toplanma kaçtaydı ya? Sunum elde patladı valla, biraz öteleyebilir miyiz mevzuyu?"',
    academic: '"İlgili toplantının planlanan icra saatinin teyidi talep edilmektedir. Sunum materyallerinin hazırlanma sürecindeki gecikmeler doğrultusunda oturumun tehir edilmesi önerilmektedir."',
    summarize: '"Toplantı saatini sorma ve sunum yetişmediği için erteleme ricası."'
  },
  en: {
    input: '"hey what time is tomorrows meeting gonna be i couldnt finish the presentation can we delay it a bit"',
    fix_grammar: '"Hey, what time is tomorrow\'s meeting going to be? I couldn\'t finish the presentation, can we delay it a bit?"',
    daily: '"Hey there! Quick check on tomorrow\'s meeting time? Running a little behind on the slides, would it be okay if we pushed it back slightly?"',
    formal: '"Dear Team, I am writing to inquire regarding the scheduled time for tomorrow\'s meeting. Due to unexpected delays in finalizing the presentation materials, I would like to kindly request a brief postponement."',
    slang: '"Yo, what time we hitting that meeting tomorrow? Slides ain\'t ready yet fam, can we chill and push it back a sec?"',
    academic: '"This inquiry pertains to the scheduled timing of tomorrow\'s conference. Owing to procedural delays in empirical presentation preparation, a temporal postponement is respectfully proposed."',
    summarize: '"Inquiring about meeting time and requesting a postponement due to unfinished slides."'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  let currentLang = 'tr';

  const btnLangTr = document.getElementById('btnLangTr');
  const btnLangEn = document.getElementById('btnLangEn');
  const demoFrame = document.getElementById('demoFrame');

  // Send language to demo iframe
  function syncDemoLang(lang) {
    if (demoFrame && demoFrame.contentWindow) {
      demoFrame.contentWindow.postMessage({ type: 'setLang', lang }, '*');
    }
  }

  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    // Toggle button active classes
    btnLangTr.classList.toggle('active', lang === 'tr');
    btnLangEn.classList.toggle('active', lang === 'en');

    // Update text elements with data-i18n attribute
    const dict = I18N_WEB[lang];
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Sync demo widget language
    syncDemoLang(lang);
  }

  // Language switcher listeners
  btnLangTr.addEventListener('click', () => applyLanguage('tr'));
  btnLangEn.addEventListener('click', () => applyLanguage('en'));

  // Sync lang once iframe is loaded
  if (demoFrame) {
    demoFrame.addEventListener('load', () => syncDemoLang(currentLang));
  }

  // Cat Companion purr button interactivity
  const catBtn = document.getElementById('catPurrBtn');
  const catQuote = document.getElementById('catQuoteText');
  const purrQuotes = {
    tr: [
      '"Mırrrr! 😻 Birlikte harika metinler yazacağız! Hadi eklentiyi kur!"',
      '"Miyavvv! İmla hatalarını yakalamak tam benim işim! Pati dostun RewriteBot hazır!"',
      '"Purrr! Google Gemini ve Groq hızına şaşıracaksın! Mırrr 🐾"',
      '"Mırrr! Metni seç, sağ tıkla veya tona tıkla; gerisini bana bırak! 😸"'
    ],
    en: [
      '"Purrrrr! 😻 We are going to write amazing texts together! Go get the extension!"',
      '"Meooww! Catching typos is my favorite game! Your paw-some buddy RewriteBot is ready!"',
      '"Purrr! You\'ll be amazed by Google Gemini and Groq\'s lightning speed! 🐾"',
      '"Purrr! Select text, right-click or tap a tone; leave the rest to me! 😸"'
    ]
  };

  let quoteIdx = 0;
  if (catBtn && catQuote) {
    catBtn.addEventListener('click', () => {
      const list = purrQuotes[currentLang];
      quoteIdx = (quoteIdx + 1) % list.length;
      catQuote.textContent = list[quoteIdx];
      catBtn.textContent = '😻 ' + (currentLang === 'tr' ? 'Mırıldanıyor!' : 'Purring!');
      setTimeout(() => {
        catBtn.textContent = currentLang === 'tr' ? '🐾 Sev Beni' : '🐾 Pet Me';
      }, 1800);
    });
  }

  // Privacy Policy Modal Logic
  const openPrivacyModal = document.getElementById('openPrivacyModal');
  const closePrivacyModal = document.getElementById('closePrivacyModal');
  const privacyModal = document.getElementById('privacyModal');

  if (openPrivacyModal && privacyModal) {
    openPrivacyModal.addEventListener('click', (e) => {
      // Eğer kullanıcı ctrl/cmd ile tıklamadıysa sayfadan ayrılmadan modal aç
      if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        privacyModal.classList.add('open');
      }
    });
  }

  if (closePrivacyModal && privacyModal) {
    closePrivacyModal.addEventListener('click', () => {
      privacyModal.classList.remove('open');
    });

    privacyModal.addEventListener('click', (e) => {
      if (e.target === privacyModal) {
        privacyModal.classList.remove('open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && privacyModal.classList.contains('open')) {
        privacyModal.classList.remove('open');
      }
    });
  }

  // Detect user's browser language on first load
  const browserLang = (navigator.language || navigator.userLanguage || 'tr').toLowerCase();
  applyLanguage(browserLang.startsWith('tr') ? 'tr' : 'en');
});
