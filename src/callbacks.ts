import {
  handleAllowMicrophone,
  handleCancelRecording,
  handleDeleteRecording,
  handleDisallowMicrophone,
  handleDownloadRecording,
  handleHideCameraBubble,
  handleOpenUserActiveWindow,
  handleShowCameraBubble,
  handleStartRecording,
  handleStopRecording,
  handlePauseRecording,
  handleResumeRecording,
  handleTabChange,
  handleTabClosing,
  handleTabUpdated,
  handleWindowChange,
} from "./handlers";
import { builder, Message, MessageResponse, Method } from "./messaging";
import { storage } from "./storage";

export async function onMessage(
  message: Message,
  _sender?: chrome.runtime.MessageSender,
  sendResponse?: (response?: MessageResponse) => void,
) {
  console.log(`onMessage ${JSON.stringify(message)}`);

  const methods = new Map([
    [Method.StartRecording, handleStartRecording],
    [Method.StopRecording, handleStopRecording],
    [Method.PauseRecording, handlePauseRecording],
    [Method.ResumeRecording, handleResumeRecording],
    [Method.DeleteRecording, handleDeleteRecording],
    [Method.CancelRecording, handleCancelRecording],
    [Method.DownloadRecording, handleDownloadRecording],

    [Method.ShowCameraBubble, handleShowCameraBubble],
    [Method.HideCameraBubble, handleHideCameraBubble],

    [Method.AllowMicrophone, handleAllowMicrophone],
    [Method.DisallowMicrophone, handleDisallowMicrophone],

    [Method.BrowserTabChange, handleTabChange],
    [Method.BrowserTabClosing, handleTabClosing],
    [Method.BrowserTabUpdated, handleTabUpdated],
    [Method.BrowserWindowChange, handleWindowChange],
    [Method.OpenUserActiveWindow, handleOpenUserActiveWindow],
  ]);

  const { method, args } = message;
  const handler = methods.get(method);
  try {
    if (!handler) {
      throw new Error(`Unexpected method: ${method}`);
    }
    await handler(args ?? {});
    sendResponse?.(builder.response.ok());
  } catch (err) {
    console.error(err);
    sendResponse?.(builder.response.error(err as Error));
  }
}

export async function onInstalled(_details: chrome.runtime.InstalledDetails) {
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
}

export function onTabChange(newTabId: chrome.tabs.TabActiveInfo) {
  return onMessage(builder.event.browserTabChange(newTabId.tabId));
}

export function onTabClosing(
  closedTabId: number,
  _removeInfo: { isWindowClosing: boolean; windowId: number },
) {
  return onMessage(builder.event.browserTabClosing(closedTabId));
}

export function onTabUpdated(
  _tabId: number,
  _changeInfo: chrome.tabs.TabChangeInfo,
  _tab: chrome.tabs.Tab,
) {
  return onMessage(builder.event.browserTabUpdated());
}

export function onWindowChange(windowId: number) {
  return onMessage(builder.event.browserWindowChange(windowId));
}
