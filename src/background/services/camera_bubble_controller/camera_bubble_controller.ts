import {
  Message,
  MessageResponse,
  MessageResponseType,
  MessageType,
} from "@/shared/messaging";
import { storage } from "@/shared/storage";
import { Injection, InjectionElementId } from "@/shared/injections";
import { Injector } from "./injector";

class CameraBubbleController {
  static async show() {
    console.log("CameraBubbleController.show()");
    const [currentTab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    await Injector.inject(currentTab.id as number, Injection.CameraBubble);
    await storage.ui.cameraBubble.tabId.set(currentTab.id as number);
    await storage.ui.cameraBubble.enabled.set(true);
  }

  static async hide() {
    console.log("CameraBubbleController.hide()");
    await Injector.deinject(
      await storage.ui.cameraBubble.tabId.get(),
      InjectionElementId.CameraBubble,
    );
    await storage.ui.cameraBubble.tabId.set(0);
    await storage.ui.cameraBubble.enabled.set(false);
  }
}

chrome.tabs.onActivated.addListener((_activeTabInfo) => {
  console.log("Handle 'chrome.tabs.onActivated'");
  (async () => {
    if (!(await storage.ui.cameraBubble.enabled.get())) {
      return;
    }
    await CameraBubbleController.hide();
    await CameraBubbleController.show();
  })().catch((err) => {
    console.error(
      `Error in 'chrome.tabs.onActivated' handler: ${(err as Error).toString()}`,
    );
  });
});

chrome.tabs.onUpdated.addListener((_tabId, _changeInfo, _tab) => {
  console.log("Handle 'chrome.tabs.onUpdated'");
  (async () => {
    if (!(await storage.ui.cameraBubble.enabled.get())) {
      return;
    }
    await CameraBubbleController.show();
  })().catch((err) => {
    console.error(
      `Error in 'chrome.tabs.onUpdated' handler: ${(err as Error).toString()}`,
    );
  });
});

chrome.tabs.onRemoved.addListener((_closedTabId, _removeInfo) => {
  console.log("Handle 'chrome.tabs.onRemoved'");
  (async () => {
    if (!(await storage.ui.cameraBubble.enabled.get())) {
      return;
    }
    await CameraBubbleController.show();
  })().catch((err) => {
    console.error(
      `Error in 'chrome.tabs.onRemoved' handler: ${(err as Error).toString()}`,
    );
  });
});

chrome.windows.onFocusChanged.addListener((_windowId) => {
  console.log("Handle 'chrome.tabs.onRemoved'");
  (async () => {
    if (!(await storage.ui.cameraBubble.enabled.get())) {
      return;
    }
    await CameraBubbleController.hide();
    await CameraBubbleController.show();
  })().catch((err) => {
    console.error(
      `Error in 'chrome.windows.onFocusChanged' handler: ${(err as Error).toString()}`,
    );
  });
});

chrome.runtime.onMessage.addListener(
  (
    message: Message,
    _sender,
    sendResponse: (response: MessageResponse) => void,
  ) => {
    (async () => {
      const { type, target, options: _options } = message;
      if (target !== "background") {
        return;
      }
      switch (type) {
        case MessageType.CameraBubbleShow:
          await CameraBubbleController.show();
          break;
        case MessageType.CameraBubbleHide:
          await CameraBubbleController.hide();
          break;
      }
    })()
      .then(() => {
        sendResponse({
          type: MessageResponseType.ResultOk,
        } satisfies MessageResponse);
      })
      .catch((err) => {
        console.error(
          `Error in 'chrome.runtime.onMessage' handler: ${(err as Error).toString()}`,
        );
        sendResponse({
          type: MessageResponseType.ResultError,
          reason: (err as Error).toString(),
        } satisfies MessageResponse);
      });
    // NOTE: We need to return `true`, because we using `sendResponse` asynchronously
    return true;
  },
);
