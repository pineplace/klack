/**
 * This module implements the extension event handler via async/await
 * that are passed from the `background.ts` script
 */
import {
  BrowserTabChange,
  BrowserTabClosing,
  Success,
  Failure,
  Message,
  MessageResponse,
  Method,
  MethodResult,
} from "./communication";
import { ErrorCode } from "./errors";
import { RapidRec } from "./rapidrec";

/* Short aliases for Chrome extension types */
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

/** `background<->background` communication channel */
async function pushMessage(message: Message): Promise<MessageResponse> {
  return new Promise((resolve, reject) => {
    onMessage(message, {} as Sender, (response) => {
      if (response?.result === MethodResult.Failed) {
        reject(response);
      } else {
        resolve(response ?? ({ result: MethodResult.Success } as Success));
      }
    }).catch((err) =>
      reject({
        errCode: ErrorCode.CallbackPushMessage,
        message: (err as Error).message,
        result: MethodResult.Failed,
      } as Failure)
    );
  });
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
    sendResponse(response);
  } catch (err) {
    const response = {
      result: MethodResult.Failed,
      errCode: ErrorCode.CallbackOnMessage,
      message: (err as Error).message,
    } as Failure;

    console.error(
      `callbacks onMessage, sendResponse as error ${JSON.stringify(response)}`
    );
    sendResponse(response);
    return Promise.reject(response);
  }
}

export async function onTabChange(newTabInfo: ActiveTabInfo): Promise<void> {
  console.log(`callbacks onTabChange ${JSON.stringify(newTabInfo)}`);
  try {
    await pushMessage({
      method: Method.BrowserTabChange,
      params: { tabId: newTabInfo.tabId },
    } as BrowserTabChange);
  } catch (err) {
    console.error(`callbacks onTabChange error ${(err as Error).message}`);
    throw err;
  }
}

export async function onTabClosing(
  closedTabId: number,
  _removeInfo: RemoveInfo
): Promise<void> {
  console.log(`callbacks onTabClosing ${closedTabId}`);
  try {
    await pushMessage({
      method: Method.BrowserTabClosing,
      params: { tabId: closedTabId },
    } as BrowserTabClosing);
  } catch (err) {
    console.log(`callbacks onTabClosing error ${(err as Error).message}`);
    throw err;
  }
}
