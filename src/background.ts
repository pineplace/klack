import "./config";
import { Message, MessageType } from "./messaging";
import { storage, StorageChange, StorageKey } from "./storage";
import {
  // onMessageCameraBubbleHide,
  // onMessageCameraBubbleShow,
  onMessageMicDisable,
  onMessageMicEnable,
  onMessageRecordingCancel,
  onMessageRecordingDelete,
  onMessageRecordingDownload,
  onMessageRecordingPause,
  onMessageRecordingResume,
  onMessageRecordingStart,
  onMessageRecordingStop,
  onBrowserEventTabChange,
  onBrowserEventTabClosing,
  onBrowserEventTabUpdated,
  onBrowserEventWindowChange,
  onMessageUserActiveWindowOpen,
  onStorageChangeUiCameraBubbleEnabled,
} from "./handlers";

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  const messageHandlers = new Map([
    // [MessageType.CameraBubbleHide, onMessageCameraBubbleHide],
    // [MessageType.CameraBubbleShow, onMessageCameraBubbleShow],
    [MessageType.MicDisable, onMessageMicDisable],
    [MessageType.MicEnable, onMessageMicEnable],
    [MessageType.RecordingCancel, onMessageRecordingCancel],
    [MessageType.RecordingDelete, onMessageRecordingDelete],
    [MessageType.RecordingDownload, onMessageRecordingDownload],
    [MessageType.RecordingPause, onMessageRecordingPause],
    [MessageType.RecordingResume, onMessageRecordingResume],
    [MessageType.RecordingStart, onMessageRecordingStart],
    [MessageType.RecordingStop, onMessageRecordingStop],
    [MessageType.OpenUserActiveWindow, onMessageUserActiveWindowOpen],
  ]);

  (async (message: Message) => {
    const { type, options } = message;
    const handler = messageHandlers.get(type);
    if (!handler) {
      return;
    }
    console.log(
      `[background.ts] Handle message with type ${type} and options ${JSON.stringify(options)}`,
    );
    try {
      await handler(options ?? {});
    } catch (err) {
      console.error(
        `[background.ts] Error on message handling: ${(err as Error).toString()}`,
      );
    }
  })(message as Message).catch((err) => {
    throw err;
  });
  // NOTE: We need to return `true`, because we using `sendResponse` asynchronously
  return true;
});

chrome.storage.onChanged.addListener((changes, _areaName) => {
  const storageKeyHandlers = new Map([
    [StorageKey.UiCameraBubbleEnabled, onStorageChangeUiCameraBubbleEnabled],
  ]);

  (async (changes: {
    [key: string]: { newValue?: unknown; oldValue?: unknown };
  }) => {
    for (const [key, change] of Object.entries(changes)) {
      const handler = storageKeyHandlers.get(key as StorageKey);
      if (!handler) {
        return;
      }
      console.log(
        `[background.ts] Handle storage change '${key}' '${JSON.stringify(change.oldValue)}'--> '${JSON.stringify(change.newValue)}'`,
      );
      try {
        await handler(change as StorageChange<unknown>);
      } catch (err) {
        console.error(
          `[background.ts] Error on storage change handling: ${(err as Error).toString()}`,
        );
      }
    }
  })(changes).catch((err) => {
    console.error(err);
  });
})

chrome.runtime.onInstalled.addListener((details) => {
  (async (_details: chrome.runtime.InstalledDetails) => {
    await storage.current.windowId.set(0);
    await storage.current.tabId.set(0);

    await storage.devices.video.enabled.set(true);
    await storage.devices.video.id.set("");
    await storage.devices.video.name.set("");

    await storage.devices.mic.enabled.set(true);
    await storage.devices.mic.id.set("");
    await storage.devices.mic.name.set("");
    await storage.devices.mic.volume.set(0);

    await storage.ui.cameraBubble.enabled.set(false);
    await storage.ui.cameraBubble.windowId.set(0);
    await storage.ui.cameraBubble.tabId.set(0);
    await storage.ui.cameraBubble.position.set({ x: 0, y: 0 });
    await storage.ui.cameraBubble.size.set({ width: 200, height: 200 });

    await storage.recording.windowId.set(0);
    await storage.recording.tabId.set(0);
    await storage.recording.inProgress.set(false);
    await storage.recording.onPause.set(false);
    await storage.recording.uuid.set("");
    await storage.recording.duration.set(0);
  })(details).catch((err) => {
    throw err;
  });
});

chrome.tabs.onActivated.addListener((activeTabInfo) => {
  onBrowserEventTabChange(activeTabInfo).catch((err) => {
    throw err;
  });
});

chrome.tabs.onRemoved.addListener((closedTabId, removeInfo) => {
  onBrowserEventTabClosing(closedTabId, removeInfo).catch((err) => {
    throw err;
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  onBrowserEventTabUpdated(tabId, changeInfo, tab).catch((err) => {
    throw err;
  });
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  onBrowserEventWindowChange(windowId).catch((err) => {
    throw err;
  });
});
