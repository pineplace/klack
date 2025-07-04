import {
  Message,
  MessageResponse,
  MessageResponseType,
  MessageType,
  RecordingSaveOptions,
  sender,
} from "@/shared/messaging";
import { RecordingState, storage } from "@/shared/storage";

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

  static async complete() {
    console.log("RecordingController.complete()");
    if (!(await chrome.offscreen.hasDocument())) {
      return;
    }
    await sender.offscreen.recorderStop();
    await storage.recording.state.set(RecordingState.Completed);
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
    const downloadId = await chrome.downloads.download({
      url: options.recordingUrl,
    });
    await storage.recording.downloadId.set(downloadId);
    await storage.recording.state.set(RecordingState.Downloading);
    console.log(
      `RecordingController.save(): Downloading started with id=${downloadId}`,
    );
  }

  static async saveComplete() {
    console.log("RecordingController.saveComplete()");
    if (!(await chrome.offscreen.hasDocument())) {
      return;
    }
    await sender.offscreen.recorderDelete();
    await chrome.offscreen.closeDocument();
    await storage.recording.state.set(RecordingState.NotStarted);
    await storage.recording.downloadId.set(0);
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
        case MessageType.RecordingComplete:
          await RecordingController.complete();
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

chrome.downloads.onChanged.addListener((downloadDelta) => {
  (async () => {
    const downloadId = await storage.recording.downloadId.get();
    if (!downloadId || downloadDelta.id !== downloadId) {
      return;
    }
    const { state } = downloadDelta;
    // NOTE: We may receive filename update here without `state` on downloading,
    //       so we can just ignore such case
    if (!state) {
      return;
    }
    if (state?.current === "complete") {
      await RecordingController.saveComplete();
      return;
    }
    console.error(
      `Problem with recording downloading: ${JSON.stringify(downloadDelta)}`,
    );
  })().catch((err) => {
    console.error(
      `Error in 'chrome.downloads.onChanged' handler: ${(err as Error).toString()}`,
    );
  });
});
