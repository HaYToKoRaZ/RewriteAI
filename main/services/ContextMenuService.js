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
        title: '✨ RewriteAI ile Düzenle...',
        contexts: ['selection']
      });

      Logger.log('Sağ tık menüsü (modal tetikleyici) oluşturuldu.');
    });
  }

  static async handleMenuClick(info, tab) {
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
