import { Logger } from '../core/Logger.js';
import { detectLanguage, getT } from '../core/i18n.js';

export class ContextMenuService {
  static ROOT_ID = 'rewriteai_open_modal';

  static init() {
    chrome.runtime.onInstalled.addListener(() => {
      this.createMenus();
    });

    chrome.runtime.onStartup.addListener(() => {
      this.createMenus();
    });

    // Dil tercihi değiştiğinde menüleri hemen yeni dile göre yeniden oluştur
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.uiLanguage) {
        this.createMenus();
      }
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      this.handleMenuClick(info, tab);
    });
  }

  static async createMenus() {
    const lang = await detectLanguage();
    const t = getT(lang);

    chrome.contextMenus.removeAll(() => {
      // Doğrudan düzenleme penceresini açacak ana bağlam menüsü (seçili metin)
      chrome.contextMenus.create({
        id: this.ROOT_ID,
        title: t.contextEdit || 'RewriteAI ile Düzenle...',
        contexts: ['selection']
      });

      // Ayırıcı (sadece eklenti simgesinde)
      chrome.contextMenus.create({
        id: 'rewriteai_separator',
        type: 'separator',
        contexts: ['action']
      });

      // Web sitesi linki (sadece eklenti simgesinde)
      chrome.contextMenus.create({
        id: 'rewriteai_visit_site',
        title: t.contextVisitSite || '🌐 RewriteAI Web Sitesini Aç',
        contexts: ['action']
      });

      // Portal linki (sadece eklenti simgesinde)
      chrome.contextMenus.create({
        id: 'rewriteai_open_portal',
        title: t.contextOpenPortal || '🚀 RewriteAI Portalı',
        contexts: ['action']
      });

      Logger.log(`Sağ tık menüsü (${lang.toUpperCase()}) oluşturuldu.`);
    });
  }

  static async handleMenuClick(info, tab) {
    // Web sitesi ve portal linkleri
    if (info.menuItemId === 'rewriteai_visit_site') {
      chrome.tabs.create({ url: 'https://rewriteai.app' });
      return;
    }

    if (info.menuItemId === 'rewriteai_open_portal') {
      chrome.tabs.create({ url: 'https://rewriteai.app/portal' });
      return;
    }

    if (!info.selectionText || info.menuItemId !== this.ROOT_ID) {
      return;
    }

    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'OPEN_REWRITE_MODAL',
        text: info.selectionText
      }).catch((err) => {
        Logger.warn('Content script hazır değil, enjekte ediliyor:', err.message);
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['presentation/content/content.js']
        }).then(() => {
          chrome.tabs.sendMessage(tab.id, {
            type: 'OPEN_REWRITE_MODAL',
            text: info.selectionText
          });
        });
      });
    }
  }
}
