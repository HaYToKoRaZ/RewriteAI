import { TONE_DEFINITIONS } from '../core/TonePrompts.js';
import { TextTransformService } from './TextTransformService.js';
import { Logger } from '../core/Logger.js';

export class ContextMenuService {
  static ROOT_ID = 'rewriteai_root';

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
      // Ana sağ tık menü ögesi
      chrome.contextMenus.create({
        id: this.ROOT_ID,
        title: 'RewriteAI ile Dönüştür',
        contexts: ['selection']
      });

      // Ton alt menüleri
      Object.values(TONE_DEFINITIONS).forEach((tone) => {
        chrome.contextMenus.create({
          id: `tone_${tone.id}`,
          parentId: this.ROOT_ID,
          title: tone.name,
          contexts: ['selection']
        });
      });

      Logger.log('Sağ tık menüleri oluşturuldu.');
    });
  }

  static async handleMenuClick(info, tab) {
    if (!info.selectionText || !info.menuItemId.startsWith('tone_')) {
      return;
    }

    const toneId = info.menuItemId.replace('tone_', '');
    const selectedText = info.selectionText;

    try {
      const result = await TextTransformService.transform(selectedText, toneId);

      // Sonucu sekmedeki sayfaya enjekte edip panoya kopyalama ve opsiyonel bildirim gösterme
      if (tab?.id) {
        chrome.scripting?.executeScript?.({
          target: { tabId: tab.id },
          func: (textToCopy) => {
            navigator.clipboard.writeText(textToCopy);
          },
          args: [result]
        }).catch(() => {});
      }
    } catch (err) {
      Logger.error('Sağ tık işleminde hata:', err.message);
    }
  }
}
