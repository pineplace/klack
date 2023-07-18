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

export async function onMessage(
  message: Message,
  _sender?: chrome.runtime.MessageSender,
  sendResponse?: (response?: MessageResponse) => void,
): Promise<void> {
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

export function onTabChange(
  newTabId: chrome.tabs.TabActiveInfo,
): Promise<void> {
  return onMessage(builder.event.browserTabChange(newTabId.tabId));
}

export function onTabClosing(
  closedTabId: number,
  _removeInfo: { isWindowClosing: boolean; windowId: number },
): Promise<void> {
  return onMessage(builder.event.browserTabClosing(closedTabId));
}

export function onTabUpdated(
  _tabId: number,
  _changeInfo: chrome.tabs.TabChangeInfo,
  _tab: chrome.tabs.Tab,
): Promise<void> {
  return onMessage(builder.event.browserTabUpdated());
}

export function onWindowChange(windowId: number): Promise<void> {
  return onMessage(builder.event.browserWindowChange(windowId));
}
