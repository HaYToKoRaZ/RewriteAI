---
trigger: always_on
---

# RewriteAI - Sistem Anayasası

## 1. Temel Direktifler & Güvenlik
- Sandbox: Sadece `d:\Users\Documents\Metin-Duzenleme-Eklentisi` içinde çalış. Dış dizinlere ASLA erişme.
- İzolasyon: `.agents/` klasörü yerel kalır, Git'e eklenmez.
- KATI MANUEL PUSH KURALI: Otomatik git push KESİNLİKLE YASAKTIR. Kullanıcı sohbette açıkça ve doğrudan "pushla", "gönder" veya "yayınla" talimatı vermedikçe `.agents\push_main.ps1`, `.agents\push_websites.ps1` veya herhangi bir git push komutu ASLA ÇALIŞTIRILAMAZ. İşlem bittiğinde yalnızca durum raporlanır ve kullanıcıdan push onayı beklenir.
- Güvenlik: Kullanıcının Gemini API anahtarı `chrome.storage.local` üzerinde saklanır, dışa aktarılmaz. Kod içinde `eval()` yasaktır.

## 2. Kod Öncesi Çifte Eşitleme (Zorunlu Ön Koşul)
Herhangi bir kod ekleme, silme veya özellik geliştirmeden önce:
1. `.agents\backup.ps1` çalıştır (yerel yedek arşivi).
2. `codebase-memory` eşitlemesini çalıştır (`detect_changes` / `index_repository`).
- **KURAL:** İkisi tamamlanmadan kod düzenlemeye BAŞLANAMAZ.

## 3. Codebase Memory MCP Mandası (Token Tasarrufu)
- Dosyaları baştan sona okumak yerine `codebase-memory` (`search_graph`, `trace_path`, `get_code_snippet`, `detect_changes`) kullan.
- Token tasarrufu için Graph-First prensibini uygula.

## 4. Mimari: N-Tier Katmanlı / Modüler Mimari
Monolitik kodlama YASAKTIR. Tüm kodlar modüler ve ayrık olacaktır:
- **Data Katmanı (`main/data/`):** Storage modelleri (`StorageRepository.js`), varsayılan ayarlar (`DefaultSettings.js`).
- **Services / Logic Katmanı (`main/services/`):** Gemini API istemcisi (`GeminiService.js`), metin dönüştürücü mantığı (`TextTransformService.js`), bağlam menüsü yönetimi (`ContextMenuService.js`).
- **Core / Altyapı (`main/core/`):** Dil ve ton şablonları (`TonePrompts.js`), bildirim/loglayıcı (`Logger.js`).
- **Presentation Katmanı (`main/presentation/`):** 
  - `popup/`: Eklenti açılır pencere arayüzü (metin düzenleme, ton seçimi, kopyalama).
  - `options/`: API anahtarı ve kullanıcı ayarları sayfası.
- **Standart:** Manifest V3 ES Modules (`"type": "module"`). Saf Vanilla JS/CSS (sıfır bundler, anında tepki).

## 5. Git Ağaçları (Worktrees)
- `main/`: Chrome Eklentisi kaynak kodları -> Sadece kullanıcı açıkça onay verdiğinde `.agents\push_main.ps1`
- `websites/`: Tanıtım sitesi ve dokümantasyon -> Sadece kullanıcı açıkça onay verdiğinde `.agents\push_websites.ps1`

## 6. Sürüm Artırımı & Paketleme
- Her özellik döngüsünde `main/manifest.json` sürümünü artır (+0.0.1).
- Kodlama bitiminde `.agents\pack_store.ps1` çalıştırarak `.agents\dist\` altında ZIP paketini güncelle.

## 7. İletişim & Yanıt Formatı (i-have-adhd Kuralı)
- Kullanıcıyla iletişimde `i-have-adhd` skill'i her zaman varsayılan olarak AKTİFTİR.
- Giriş teferruatı (preamble) ve sohbet kapanış lafları YASAKTIR.
- Doğrudan ilk satırda yapılacak bir sonraki eylemle başla.
- Çok adımlı işleri en fazla 5 maddelik net listelerle numaralandır.
- Tamamlanan işi somut olarak göster (win visible).
- Her yanıtın sonunda 2 dakikada yapılabilecek tek bir somut eylem ver.
