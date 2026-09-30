import { ContextMenuService } from './ContextMenuService.js';
import { Logger } from '../core/Logger.js';

Logger.log('Background Service Worker başlatıldı.');

// Sağ tık menülerini başlat
ContextMenuService.init();

// Popup ile iletişim veya mesaj dinleyicileri
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ status: 'PONG' });
  }
  return true;
});
