import {
  handleAllowMicrophone,
  handleCancelRecording,
  handleDisallowMicrophone,
  handleDownloadRecording,
  handleHideCameraBubble,
  handleOpenUserActiveWindow,
  handleShowCameraBubble,
  handleStartRecording,
  handleStopRecording,
  handleTabChange,
  handleTabClosing,
  handleTabUpdated,
} from "./handlers";
import { builder, Message, MessageResponse, Method } from "./messaging";

export async function onMessage(
  message: Message,
  _sender?: chrome.runtime.MessageSender,
  sendResponse?: (response?: MessageResponse) => void
): Promise<void> {
  console.log(`onMessage ${JSON.stringify(message)}`);

  const methods = new Map([
    [Method.StartRecording, handleStartRecording],
    [Method.StopRecording, handleStopRecording],
    [Method.CancelRecording, handleCancelRecording],
    [Method.DownloadRecording, handleDownloadRecording],

    [Method.ShowCameraBubble, handleShowCameraBubble],
    [Method.HideCameraBubble, handleHideCameraBubble],

    [Method.AllowMicrophone, handleAllowMicrophone],
    [Method.DisallowMicrophone, handleDisallowMicrophone],

    [Method.BrowserTabChange, handleTabChange],
    [Method.BrowserTabClosing, handleTabClosing],
    [Method.BrowserTabUpdated, handleTabUpdated],
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

export async function onTabChange(
  newTabId: chrome.tabs.TabActiveInfo
): Promise<void> {
  await onMessage(builder.event.browserTabChange(newTabId.tabId));
}

export async function onTabClosing(
  closedTabId: number,
  _removeInfo: { isWindowClosing: boolean; windowId: number }
): Promise<void> {
  await onMessage(builder.event.browserTabClosing(closedTabId));
}

export async function onTabUpdated(
  _tabId: number,
  _changeInfo: chrome.tabs.TabChangeInfo,
  _tab: chrome.tabs.Tab
): Promise<void> {
  await onMessage(builder.event.browserTabUpdated());
}
