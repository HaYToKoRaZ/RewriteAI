import { TONE_DEFINITIONS } from '../core/TonePrompts.js';
import { Logger } from '../core/Logger.js';

export class ContextMenuService {
  static ROOT_ID = 'rewriteai_open_modal';

  static init() {
    chrome.runtime.onInstalled.addListener(() => {
      this.createMenus();
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      this.handleMenuClick(info, tab);
    });
  }

  static createMenus() {
    chrome.contextMenus.removeAll(() => {
      // Doğrudan düzenleme penceresini açacak ana bağlam menüsü
      chrome.contextMenus.create({
        id: this.ROOT_ID,
        title: 'RewriteAI ile Düzenle...',
        contexts: ['selection']
      });

      // Ayırıcı
      chrome.contextMenus.create({
        id: 'rewriteai_separator',
        type: 'separator',
        contexts: ['page', 'selection', 'link']
      });

      // Web sitesi linki
      chrome.contextMenus.create({
        id: 'rewriteai_visit_site',
        title: '🌐 RewriteAI Web Sitesini Aç',
        contexts: ['page', 'selection', 'link']
      });

      // Portal linki
      chrome.contextMenus.create({
        id: 'rewriteai_open_portal',
        title: '🚀 RewriteAI Portalı',
        contexts: ['page', 'selection', 'link']
      });

      Logger.log('Sağ tık menüsü (modal tetikleyici + site linkleri) oluşturuldu.');
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
