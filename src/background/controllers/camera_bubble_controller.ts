import { Message, MessageResponse, MessageType } from "../../messaging";
import { storage } from "../../storage";
import { debounce } from "../../utils";

class CameraBubbleController {
  static cameraBubbleInjectionScriptPath = "./camera_bubble.bundle.mjs";
  static cameraBubbleElementId = "klack-camera-bubble";

  static async show() {
    console.log("[camera_bubble_controller.ts] CameraBubbleController::show()");
    const [currentTab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });

    await chrome.scripting.executeScript({
      target: {
        tabId: currentTab.id as number,
      },
      files: [CameraBubbleController.cameraBubbleInjectionScriptPath],
    });

    await storage.ui.cameraBubble.tabId.set(currentTab.id as number);
    await storage.ui.cameraBubble.enabled.set(true);
  }

  static async hide() {
    console.log("[camera_bubble_controller.ts] CameraBubbleController::hide()");
    await chrome.scripting.executeScript({
      target: {
        tabId: await storage.ui.cameraBubble.tabId.get(),
      },
      func: (elementId: string) => {
        document.getElementById(elementId)?.remove();
      },
      args: [CameraBubbleController.cameraBubbleElementId],
    });

    await storage.ui.cameraBubble.tabId.set(0);
    await storage.ui.cameraBubble.enabled.set(false);
  }
}

chrome.tabs.onActivated.addListener((_activeTabInfo) => {
  console.log("[camera_bubble_controller.ts] Handle 'chrome.tabs.onActivated'");
  (async () => {
    if (!(await storage.ui.cameraBubble.enabled.get())) {
      return;
    }
    await CameraBubbleController.hide();
    await CameraBubbleController.show();
  })().catch((err) => {
    console.error(
      `[camera_bubble_controller.ts] Error in 'chrome.tabs.onActivated' handler: ${(err as Error).toString()}`,
    );
  });
});

chrome.tabs.onUpdated.addListener((_tabId, _changeInfo, _tab) => {
  console.log("[camera_bubble_controller.ts] Handle 'chrome.tabs.onUpdated'");
  (async () => {
    if (!(await storage.ui.cameraBubble.enabled.get())) {
      return;
    }
    debounce(() => {
      (async () => {
        await CameraBubbleController.show();
      })().catch((err) => {
        throw new Error(
          `Cannot draw camera bubble after reload: ${(err as Error).toString()}`,
        );
      });
    }, 2 * 1000);
  })().catch((err) => {
    console.error(
      `[camera_bubble_controller.ts] Error in 'chrome.tabs.onUpdated' handler: ${(err as Error).toString()}`,
    );
  });
});

chrome.tabs.onRemoved.addListener((_closedTabId, _removeInfo) => {
  console.log("[camera_bubble_controller.ts] Handle 'chrome.tabs.onRemoved'");
  (async () => {
    if (!(await storage.ui.cameraBubble.enabled.get())) {
      return;
    }
    await CameraBubbleController.show();
  })().catch((err) => {
    console.error(
      `[camera_bubble_controller.ts] Error in 'chrome.tabs.onRemoved' handler: ${(err as Error).toString()}`,
    );
  });
});

chrome.windows.onFocusChanged.addListener((_windowId) => {
  console.log("[camera_bubble_controller.ts] Handle 'chrome.tabs.onRemoved'");
  (async () => {
    if (!(await storage.ui.cameraBubble.enabled.get())) {
      return;
    }
    await CameraBubbleController.hide();
    await CameraBubbleController.show();
  })().catch((err) => {
    console.error(
      `[camera_bubble_controller.ts] Error in 'chrome.windows.onFocusChanged' handler: ${(err as Error).toString()}`,
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
          type: MessageType.ResultOk,
        } satisfies MessageResponse);
      })
      .catch((err) => {
        console.error(
          `[camera_bubble_controller.ts] Error in 'chrome.runtime.onMessage' handler: ${(err as Error).toString()}`,
        );
        sendResponse({
          type: MessageType.ResultError,
          reason: (err as Error).toString(),
        } satisfies MessageResponse);
      });
    // NOTE: We need to return `true`, because we using `sendResponse` asynchronously
    return true;
  },
);
