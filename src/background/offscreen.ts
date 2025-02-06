import { Message, MessageType, RecorderCreateOptions } from "../messaging";
import {
  onMessageRecorderCancel,
  onMessageRecorderCreate,
  onMessageRecorderDelete,
  onMessageRecorderPause,
  onMessageRecorderResume,
  onMessageRecorderStart,
  onMessageRecorderStop,
} from "./offscreen_handlers";

chrome.runtime.onMessage.addListener(
  (message, _sender, sendResponse: (response: Message) => void) => {
    (async (message: Message) => {
      const { type, target, options } = message;
      if (target !== "offscreen") {
        return;
      }
      console.log(
        `[offscreen.ts] Handle message with type '${type}' and options '${JSON.stringify(options)}'`,
      );
      switch (type) {
        case MessageType.RecorderCreate:
          await onMessageRecorderCreate(options as RecorderCreateOptions);
          break;
        case MessageType.RecorderStart:
          onMessageRecorderStart();
          break;
        case MessageType.RecorderStop:
          onMessageRecorderStop();
          break;
        case MessageType.RecorderPause:
          onMessageRecorderPause();
          break;
        case MessageType.RecorderResume:
          onMessageRecorderResume();
          break;
        case MessageType.RecorderCancel:
          onMessageRecorderCancel();
          break;
        case MessageType.RecorderDelete:
          onMessageRecorderDelete();
          break;
        default:
          throw new Error(`Unsupported event with type ${type}`);
      }
    })(message as Message)
      .then(() => {
        sendResponse({
          type: MessageType.ResultOk,
        });
      })
      .catch((err) => {
        console.error(
          `[offscreen.ts] Error in 'chrome.runtime.onMessage' handler: ${(err as Error).toString()}`,
        );
        sendResponse({
          type: MessageType.ResultError,
        });
      });
    // NOTE: We need to return `true`, because we using `sendResponse` asynchronously
    return true;
  },
);
