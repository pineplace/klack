import { Message, MessageType } from "../messaging";
import {
  onMessageRecorderPause,
  onMessageRecorderResume,
  onMessageRecorderStart,
  onMessageRecorderStop,
} from "./offscreen_handlers";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async (message: Message, _sender, _sendResponse) => {
    const { type, target, options } = message;
    if (target !== "offscreen") {
      return;
    }
    console.log(
      `[offscreen.ts] Handle message with type '${type}' and options '${JSON.stringify(options)}'`,
    );
    try {
      switch (type) {
        case MessageType.RecorderStart:
          await onMessageRecorderStart();
          break;
        case MessageType.RecorderStop:
          await onMessageRecorderStop();
          break;
        case MessageType.RecorderPause:
          await onMessageRecorderPause();
          break;
        case MessageType.RecorderResume:
          await onMessageRecorderResume();
          break;
        case MessageType.RecorderCancel:
          await onMessageRecorderPause();
          break;
        default:
          throw new Error(`Unsupported event with type ${type}`);
      }
    } catch (err) {
      console.error(
        `[offscreen.ts] Error on message handling: ${(err as Error).toString()}`,
      );
    }
  })(message as Message, sender, sendResponse)
    .catch((err) => {
      console.error(
        `[offscreen.ts] Error in 'chrome.runtime.onMessage' handler: ${(err as Error).toString()}`,
      );
      throw err;
    })
    .finally(() => {
      // NOTE: We need to return `true`, because we using `sendResponse` asynchronously
      return true;
    });
});
