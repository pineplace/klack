import {
  Message,
  MessageResponse,
  MessageType,
  RecordingSaveOptions,
  senderV2,
} from "../../messaging";
import { RecordingState, storage } from "../../storage";

class RecordingController {
  static async start() {
    console.log("[recording_controller.ts] RecordingController::start()");
    if (await chrome.offscreen.hasDocument()) {
      console.warn(
        "[recording_controller.ts] Offscreen document is already created",
      );
    } else {
      await chrome.offscreen.createDocument({
        url: chrome.runtime.getURL("offscreen.html"),
        reasons: [chrome.offscreen.Reason.USER_MEDIA],
        justification: "Offscreen launched to start media recorder",
      });
    }
    const response = await senderV2.offscreen.recorderCreate({
      mic: {
        enabled: await storage.devices.mic.enabled.get(),
        id: await storage.devices.mic.id.get(),
      },
    });
    if (response.type !== MessageType.ResultOk) {
      if (!response.reason?.includes("NotAllowedError: Permission denied")) {
        console.error(
          `[recording_controller.ts] Recording creation failed: ${JSON.stringify(response)}`,
        );
        return;
      }
      console.log(
        "[recording_controller.ts] Recorder creation has been canceled",
      );
      await senderV2.offscreen.recorderDelete();
      await chrome.offscreen.closeDocument();
      return;
    }
    await senderV2.offscreen.recorderStart();
    await storage.recording.state.set(RecordingState.InProgress);
  }

  static async stop() {
    console.log("[recording_controller.ts] RecordingController::stop()");
    if (!(await chrome.offscreen.hasDocument())) {
      return;
    }
    await senderV2.offscreen.recorderStop();
    await senderV2.offscreen.recorderDelete();
    await chrome.offscreen.closeDocument();
    await storage.recording.state.set(RecordingState.NotStarted);
  }

  static async pause() {
    console.log("[recording_controller.ts] RecordingController::pause()");
    if (!(await chrome.offscreen.hasDocument())) {
      return;
    }
    await senderV2.offscreen.recorderPause();
    await storage.recording.state.set(RecordingState.OnPause);
  }

  static async resume() {
    console.log("[recording_controller.ts] RecordingController::resume()");
    if (!(await chrome.offscreen.hasDocument())) {
      return;
    }
    await senderV2.offscreen.recorderResume();
    await storage.recording.state.set(RecordingState.InProgress);
  }

  static async cancel() {
    console.log("[recording_controller.ts] RecordingController::cancel()");
    if (!(await chrome.offscreen.hasDocument())) {
      return;
    }
    await senderV2.offscreen.recorderCancel();
    await senderV2.offscreen.recorderDelete();
    await chrome.offscreen.closeDocument();
    await storage.recording.state.set(RecordingState.NotStarted);
  }

  static async save(options: RecordingSaveOptions) {
    console.log(
      `[recording_controller.ts] RecordingController::save(options=${JSON.stringify(options)})`,
    );
    if (!(await chrome.offscreen.hasDocument())) {
      return;
    }
    const res = await chrome.downloads.download({
      url: options.recordingUrl,
    });
    console.log("Downloaded", res);
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
          type: MessageType.ResultOk,
        } satisfies MessageResponse);
      })
      .catch((err) => {
        console.error(
          `[recording_controller.ts] Error in 'chrome.runtime.onMessage' handler: ${(err as Error).toString()}`,
        );
        sendResponse({
          type: MessageType.ResultError,
          reason: (err as Error).toString(),
        } satisfies MessageResponse);
      });
    // NOTE: We need to return `true`, because we using `sendResponse` asynchronously
    return true;
  },
);
