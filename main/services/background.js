import { ContextMenuService } from './ContextMenuService.js';
import { TextTransformService } from './TextTransformService.js';
import { AppPulseService } from './AppPulseService.js';
import { Logger } from '../core/Logger.js';

Logger.log('Background Service Worker başlatıldı.');

// Sağ tık menülerini başlat ve oluştur
ContextMenuService.init();
ContextMenuService.createMenus();

// Anonim uygulama durum bildirimi başlatıcı
AppPulseService.init();

// Content Script & Popup mesajlaşma merkezi
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ status: 'PONG' });
    return true;
  }

  if (message.type === 'OPEN_OPTIONS') {
    chrome.runtime.openOptionsPage();
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'TRANSFORM_TEXT') {
    TextTransformService.transform(message.text, message.tone, message.model, message.targetLanguage || 'auto', message.twitterMode || false)
      .then((result) => {
        sendResponse({ success: true, result });
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message });
      });
    return true; // Asenkron yanıt için şart
  }
});
