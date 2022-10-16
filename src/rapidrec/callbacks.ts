import {
  BrowserTabChange,
  BrowserTabClosing,
  Failure,
  Message,
  MessageResponse,
  Method,
  MethodResult,
  pushMessage,
} from "./communication";
import { ErrorCode } from "./enums";
import { RapidRec } from "./rapidrec";

export type Sender = chrome.runtime.MessageSender;
export type ResponseCallback = (response?: MessageResponse) => void;
export type ActiveTabInfo = chrome.tabs.TabActiveInfo;
export type RemoveInfo = { isWindowClosing: boolean; windowId: number };

class UnknownMethodError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnknownMethodError";
  }
}

export async function onMessage(
  message: Message,
  _sender: Sender,
  sendResponse: ResponseCallback
): Promise<void> {
  console.log(`callbacks onMessage ${JSON.stringify(message)}`);

  const methods = new Map([
    [Method.RecSetMode, RapidRec.setMode],
    [Method.RecStart, RapidRec.startRecording],
    [Method.RecStop, RapidRec.stopRecording],
    [Method.BrowserTabChange, RapidRec.handleTabChange],
    [Method.BrowserTabClosing, RapidRec.handleTabClosing],
  ]);

  try {
    if (!methods.has(message.method)) {
      throw new UnknownMethodError(
        `Invalid message with unknown method ${JSON.stringify(message)}`
      );
    }
    const response = await methods.get(message.method)?.(message);
    console.log(
      `callbacks onMessage, sendResponse ${JSON.stringify(response)}`
    );
    sendResponse(await methods.get(message.method)?.(message));
  } catch (err) {
    console.error((err as Error).message);
    const response = {
      result: MethodResult.Failed,
      errCode: ErrorCode.Some,
      message: (err as Error).message,
    } as Failure;
    console.log(
      `callbacks onMessage, sendResponse as error ${JSON.stringify(response)}`
    );
    sendResponse(response);
  }
}

export async function onTabChange(newTabInfo: ActiveTabInfo): Promise<void> {
  console.log(`callbacks onTabChange ${JSON.stringify(newTabInfo)}`);
  try {
    const response = await pushMessage({
      method: Method.BrowserTabChange,
      params: { tabId: newTabInfo.tabId },
    } as BrowserTabChange);
    console.log(JSON.stringify(response));
  } catch (err) {
    console.error(`callbacks onTabChange error ${(err as Error).message}`);
  }
}

export async function onTabClosing(
  closedTabId: number,
  _removeInfo: RemoveInfo
): Promise<void> {
  console.log(`callbacks onTabClosing ${closedTabId}`);
  try {
    const response = await pushMessage({
      method: Method.BrowserTabClosing,
      params: { tabId: closedTabId },
    } as BrowserTabClosing);
    console.log(JSON.stringify(response));
  } catch (err) {
    console.log(`callbacks onTabClosing error ${(err as Error).message}`);
  }
}
