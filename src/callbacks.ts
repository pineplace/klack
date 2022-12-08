import { handleTabChange, handleTabClosing } from "./handlers";
import { Message, MessageResponse, Method } from "./messaging";
import { builder } from "./messaging";

export async function onMessage(
  message: Message,
  _sender?: chrome.runtime.MessageSender,
  sendResponse?: (response?: MessageResponse) => void
): Promise<void> {
  const methods = new Map([
    [Method.BrowserTabChange, handleTabChange],
    [Method.BrowserTabClosing, handleTabClosing],
  ]);

  const { method, args } = message;
  const handler = methods.get(method);
  try {
    if (!handler) {
      throw new Error(`Unexpected method: ${method}`);
    }
    await handler(args);
    sendResponse?.(builder.response.ok());
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
