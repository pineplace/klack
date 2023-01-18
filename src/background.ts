import { onMessage, onTabChange, onTabClosing } from "./callbacks";
import { Message } from "./messaging";

// API reference: https://developer.chrome.com/docs/extensions/reference/

chrome.runtime.onMessage.addListener(
  (message: Message, sender, sendResponse) => {
    onMessage(message, sender, sendResponse).catch((err) => {
      throw err;
    });
    // NOTE: We need to return `true`, because we using `sendResponse` asynchronously
    return true;
  }
);

chrome.tabs.onActivated.addListener((activeTabInfo) => {
  onTabChange(activeTabInfo).catch((err) => {
    throw err;
  });
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  onTabClosing(tabId, removeInfo).catch((err) => {
    throw err;
  });
});
