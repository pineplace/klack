import {
  Message,
  MessageResponse,
  MessageType,
  RecordingSaveOptions,
} from "../../messaging";
import {
  onEventWindowFocusChanged,
  onEventExtensionInstalled,
  onEventTabChanged,
  onEventTabReloaded,
  onMessageRecordingPause,
  onMessageRecordingResume,
  onMessageRecordingStart,
  onMessageRecordingStop,
  onMessageRecordingCancel,
  onMessageRecordingSave,
  onMessageCameraBubbleShow,
  onMessageCameraBubbleHide,
  onEventTabClosed,
} from "./handlers";

chrome.runtime.onInstalled.addListener((details) => {
  console.log("[background.ts] Handle 'chrome.runtime.onInstalled'");
  onEventExtensionInstalled(details).catch((err) => {
    console.error(
      `[background.ts] Error in 'chrome.runtime.onInstalled' handler: ${(err as Error).toString()}`,
    );
  });
});

chrome.tabs.onActivated.addListener((activatedTabInfo) => {
  console.log("[background.ts] Handle 'chrome.tabs.onActivated'");
  onEventTabChanged(activatedTabInfo).catch((err) => {
    console.error(
      `[background.ts] Error in 'chrome.tabs.onActivated' handler: ${(err as Error).toString()}`,
    );
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("[background.ts] Handle 'chrome.tabs.onUpdated'");
  onEventTabReloaded(tabId, changeInfo, tab).catch((err) => {
    console.error(
      `[background.ts] Error in 'chrome.tabs.onUpdated' handler: ${(err as Error).toString()}`,
    );
  });
});

chrome.tabs.onRemoved.addListener((closedTabId, removeInfo) => {
  console.log("[background.ts] Handle 'chrome.tabs.onRemoved'");
  onEventTabClosed(closedTabId, removeInfo).catch((err) => {
    console.error(
      `[background.ts] Error in 'chrome.tabs.onRemoved' handler: ${(err as Error).toString()}`,
    );
  });
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  console.log("[background.ts] Handle 'chrome.windows.onFocusChanged'");
  onEventWindowFocusChanged(windowId).catch((err) => {
    console.error(
      `[background.ts] Error in 'chrome.windows.onFocusChanged' handler: ${(err as Error).toString()}`,
    );
  });
});

chrome.runtime.onMessage.addListener(
  (message, _sender, sendResponse: (response: MessageResponse) => void) => {
    (async (message: Message) => {
      const { type, target, options } = message;
      if (target !== "background") {
        return;
      }
      console.log(
        `[background.ts] Handle message with type '${type}' and options '${JSON.stringify(options)}'`,
      );
      switch (type) {
        case MessageType.CameraBubbleShow:
          await onMessageCameraBubbleShow();
          break;
        case MessageType.CameraBubbleHide:
          await onMessageCameraBubbleHide();
          break;
        case MessageType.RecordingStart:
          await onMessageRecordingStart();
          break;
        case MessageType.RecordingStop:
          await onMessageRecordingStop();
          break;
        case MessageType.RecordingPause:
          await onMessageRecordingPause();
          break;
        case MessageType.RecordingResume:
          await onMessageRecordingResume();
          break;
        case MessageType.RecordingCancel:
          await onMessageRecordingCancel();
          break;
        case MessageType.RecordingSave:
          await onMessageRecordingSave(options as RecordingSaveOptions);
          break;
        default:
          throw new Error(`Unsupported event with type ${type}`);
      }
    })(message as Message)
      .then(() => {
        sendResponse({
          type: MessageType.ResultOk,
        } satisfies MessageResponse);
      })
      .catch((err) => {
        console.error(
          `[background.ts] Error in 'chrome.runtime.onMessage' handler: ${(err as Error).toString()}`,
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
