import "./config";
import { Message, MessageType } from "./messaging";
import { storage } from "./storage";
import {
  onCameraBubbleHide,
  onCameraBubbleShow,
  onMicDisable,
  onMicEnable,
  onRecordingCancel,
  onRecordingDelete,
  onRecordingDownload,
  onRecordingPause,
  onRecordingResume,
  onRecordingStart,
  onRecordingStop,
  onTabChange,
  onTabClosing,
  onTabUpdated,
  onWindowChange,
} from "./handlers";

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  (async (message: Message) => {
    console.log(`[background.ts] Message received ${JSON.stringify(message)})`);

    const messageHandlers = new Map([
      [MessageType.CameraBubbleHide, onCameraBubbleHide],
      [MessageType.CameraBubbleShow, onCameraBubbleShow],
      [MessageType.MicDisable, onMicDisable],
      [MessageType.MicEnable, onMicEnable],
      [MessageType.RecordingCancel, onRecordingCancel],
      [MessageType.RecordingDelete, onRecordingDelete],
      [MessageType.RecordingDownload, onRecordingDownload],
      [MessageType.RecordingPause, onRecordingPause],
      [MessageType.RecordingResume, onRecordingResume],
      [MessageType.RecordingStart, onRecordingStart],
      [MessageType.RecordingStop, onRecordingStop],
    ]);

    try {
      const { type, options } = message;
      const handler = messageHandlers.get(type);
      if (!handler) {
        throw new Error(`Unsupported message type ${type}`);
      }
      console.log(
        `[background.ts] Handle message with type ${type} and options ${JSON.stringify(options)}`,
      );
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
  onTabChange(activeTabInfo).catch((err) => {
    throw err;
  });
});

chrome.tabs.onRemoved.addListener((closedTabId, removeInfo) => {
  onTabClosing(closedTabId, removeInfo).catch((err) => {
    throw err;
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  onTabUpdated(tabId, changeInfo, tab).catch((err) => {
    throw err;
  });
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  onWindowChange(windowId).catch((err) => {
    throw err;
  });
});
