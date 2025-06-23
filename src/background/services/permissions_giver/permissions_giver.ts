import {
  Message,
  MessageResponse,
  MessageResponseType,
  MessageType,
} from "@/shared/messaging";
import { storage } from "@/shared/storage";

class PermissionsGiver {
  static async createPermissionsTab() {
    const tab = await chrome.tabs.create({
      active: true,
      url: chrome.runtime.getURL("permissions.html"),
    });
    await storage.permissions.tabId.set(tab.id || 0);
  }

  static async closePermissionsTab() {
    await chrome.tabs.remove(await storage.permissions.tabId.get());
    await storage.permissions.tabId.set(0);
  }
}

chrome.runtime.onInstalled.addListener((_details) => {
  console.log("Handle 'chrome.runtime.onInstalled'");
  (async () => {
    await PermissionsGiver.createPermissionsTab();
  })().catch((err) => {
    console.error(
      `Error in 'chrome.runtime.onInstalled' handler: ${(err as Error).toString()}`,
    );
  });
});

chrome.runtime.onMessage.addListener(
  (
    message: Message,
    _sender,
    senderResponse: (response: MessageResponse) => void,
  ) => {
    (async () => {
      const { type, target, options: _options } = message;
      if (target !== "background") {
        return;
      }
      switch (type) {
        case MessageType.PermissionsPageClose:
          await PermissionsGiver.closePermissionsTab();
          break;
      }
    })()
      .then(() => {
        senderResponse({
          type: MessageResponseType.ResultOk,
        } satisfies MessageResponse);
      })
      .catch((err) => {
        console.error(
          `Error in 'chrome.runtime.onMessage' handler: ${(err as Error).toString()}`,
        );
        senderResponse({
          type: MessageResponseType.ResultError,
          reason: (err as Error).toString(),
        } satisfies MessageResponse);
      });
    // NOTE: We need to return `true`, because we using `sendResponse` asynchronously
    return true;
  },
);
