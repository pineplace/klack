import {
  Message,
  MessageResponse,
  MessageResponseType,
  MessageType,
  RecordingSaveOptions,
  sender,
} from "@/app/messaging";
import { RecordingState, storage } from "@/app/storage";

class RecordingController {
  static async start() {
    console.log("RecordingController.start()");
    if (await chrome.offscreen.hasDocument()) {
      console.warn("Offscreen document is already created");
    } else {
      await chrome.offscreen.createDocument({
        url: chrome.runtime.getURL("offscreen.html"),
        reasons: [chrome.offscreen.Reason.USER_MEDIA],
        justification: "Offscreen launched to start media recorder",
      });
    }
    const response = await sender.offscreen.recorderCreate({
      mic: {
        enabled: await storage.devices.mic.enabled.get(),
        id: await storage.devices.mic.id.get(),
      },
    });
    if (response.type !== MessageResponseType.ResultOk) {
      if (!response.reason?.includes("NotAllowedError: Permission denied")) {
        console.error(`Recording creation failed: ${JSON.stringify(response)}`);
        return;
      }
      console.log("Recorder creation has been canceled");
      await sender.offscreen.recorderDelete();
      await chrome.offscreen.closeDocument();
      return;
    }
    await sender.offscreen.recorderStart();
    await storage.recording.state.set(RecordingState.InProgress);
  }

  static async stop() {
    console.log("RecordingController.stop()");
    if (!(await chrome.offscreen.hasDocument())) {
      return;
    }
    await sender.offscreen.recorderStop();
    await sender.offscreen.recorderDelete();
    await chrome.offscreen.closeDocument();
    await storage.recording.state.set(RecordingState.NotStarted);
  }

  static async pause() {
    console.log("RecordingController.pause()");
    if (!(await chrome.offscreen.hasDocument())) {
      return;
    }
    await sender.offscreen.recorderPause();
    await storage.recording.state.set(RecordingState.OnPause);
  }

  static async resume() {
    console.log("RecordingController.resume()");
    if (!(await chrome.offscreen.hasDocument())) {
      return;
    }
    await sender.offscreen.recorderResume();
    await storage.recording.state.set(RecordingState.InProgress);
  }

  static async cancel() {
    console.log("RecordingController.cancel()");
    if (!(await chrome.offscreen.hasDocument())) {
      return;
    }
    await sender.offscreen.recorderCancel();
    await sender.offscreen.recorderDelete();
    await chrome.offscreen.closeDocument();
    await storage.recording.state.set(RecordingState.NotStarted);
  }

  static async save(options: RecordingSaveOptions) {
    console.log(`RecordingController.save(options=${JSON.stringify(options)})`);
    if (!(await chrome.offscreen.hasDocument())) {
      return;
    }
    await chrome.downloads.download({
      url: options.recordingUrl,
    });
  }
}

chrome.runtime.onMessage.addListener(
  (
    message: Message,
    _sender,
    sendResponse: (response: MessageResponse) => void,
  ) => {
    (async () => {
      const { type, target, options } = message;
      if (target !== "background") {
        return;
      }
      switch (type) {
        case MessageType.RecordingStart:
          await RecordingController.start();
          break;
        case MessageType.RecordingStop:
          await RecordingController.stop();
          break;
        case MessageType.RecordingPause:
          await RecordingController.pause();
          break;
        case MessageType.RecordingResume:
          await RecordingController.resume();
          break;
        case MessageType.RecordingCancel:
          await RecordingController.cancel();
          break;
        case MessageType.RecordingSave:
          await RecordingController.save(options as RecordingSaveOptions);
          break;
      }
    })()
      .then(() => {
        sendResponse({
          type: MessageResponseType.ResultOk,
        } satisfies MessageResponse);
      })
      .catch((err) => {
        console.error(
          `Error in 'chrome.runtime.onMessage' handler: ${(err as Error).toString()}`,
        );
        sendResponse({
          type: MessageResponseType.ResultError,
          reason: (err as Error).toString(),
        } satisfies MessageResponse);
      });
    // NOTE: We need to return `true`, because we using `sendResponse` asynchronously
    return true;
  },
);
