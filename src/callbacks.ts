import {
  handleAllowMicrophone,
  handleCancelRecording,
  handleDisallowMicrophone,
  handleDownloadRecording,
  handleGetIsCameraBubbleVisible,
  handleGetIsMicrophoneAllowed,
  handleGetRecordingInProgress,
  handleHideCameraBubble,
  handleOpenUserActiveWindow,
  handleShowCameraBubble,
  handleStartRecording,
  handleStopRecording,
  handleTabChange,
  handleTabClosing,
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
    [Method.OpenUserActiveWindow, handleOpenUserActiveWindow],
  ]);

  const getters = new Map([
    [Method.GetterRecordingInProgress, handleGetRecordingInProgress],
    [Method.GetterIsCameraBubbleVisible, handleGetIsCameraBubbleVisible],
    [Method.GetterIsMicrophoneAllowed, handleGetIsMicrophoneAllowed],
  ]);

  const { method, args } = message;
  const handler = methods.get(method) ?? getters.get(method);
  try {
    if (!handler) {
      throw new Error(`Unexpected method: ${method}`);
    }
    const result = await handler(args ?? {});
    sendResponse?.(builder.response.ok(result ?? undefined));
  } catch (err) {
    console.error(err);
    sendResponse?.(builder.response.error(err as Error));
  }
}

export async function onTabChange(
  newTabId: chrome.tabs.TabActiveInfo
): Promise<void> {
  await onMessage(builder.internal.browserTabChange(newTabId.tabId));
}

export async function onTabClosing(
  closedTabId: number,
  _removeInfo: { isWindowClosing: boolean; windowId: number }
): Promise<void> {
  await onMessage(builder.internal.browserTabClosing(closedTabId));
}
