import {
  Message,
  MessageResponse,
  MessageType,
  RecorderCreateOptions,
  senderV2,
} from "../../messaging";
import { ControlledPromise, createControlledPromise } from "../../utils";

class Recorder {
  #ctx: {
    mimeType: string;
    mediaStream: MediaStream;
    chunks: BlobPart[];
    isRecordingCanceled: boolean;
    chunksDownloaded: ControlledPromise<void>;
    mediaRecorder?: MediaRecorder;
  };

  constructor(mimeType: string) {
    this.#ctx = {
      mimeType,
      mediaStream: new MediaStream(),
      chunks: [],
      isRecordingCanceled: false,
      chunksDownloaded: createControlledPromise<void>(),
    };
    console.log(
      `[recorder.ts] Recorder has been created for MIME type '${mimeType}'`,
    );
  }

  #onTrackEnded() {
    (async () => {
      await senderV2.background.recordingStop();
    })().catch((err) => {
      console.error(
        `[recorder.ts] #onTrackEndedListener error: ${(err as Error).toString()}`,
      );
      throw err;
    });
  }

  #onMediaRecorderDataAvailable(event: BlobEvent) {
    (async () => {
      if (!this.#ctx.mediaRecorder) {
        return;
      }

      if (this.#ctx.isRecordingCanceled) {
        this.#ctx.chunksDownloaded.resolve();
        return;
      }

      this.#ctx.chunks.push(event.data);
      if (this.#ctx.mediaRecorder.state !== "inactive") {
        return;
      }

      const downloadUrl = URL.createObjectURL(
        new Blob(this.#ctx.chunks, {
          type: event.data.type,
        }),
      );

      await senderV2.background.recordingSave({
        recordingUrl: downloadUrl,
      });

      URL.revokeObjectURL(downloadUrl);

      this.#ctx.chunksDownloaded.resolve();
    })().catch((err) => {
      console.error(
        `[recorder.ts] #onMediaRecorderDataAvailable error: ${(err as Error).toString()}`,
      );
    });
  }

  addStream(stream: MediaStream) {
    for (const track of stream.getTracks()) {
      this.#ctx.mediaStream.addTrack(track);
    }
  }

  start() {
    this.#ctx.mediaRecorder = new MediaRecorder(this.#ctx.mediaStream, {
      mimeType: this.#ctx.mimeType,
    });

    for (const track of this.#ctx.mediaStream.getTracks()) {
      track.addEventListener("ended", this.#onTrackEnded.bind(this));
    }

    this.#ctx.mediaRecorder.addEventListener(
      "dataavailable",
      this.#onMediaRecorderDataAvailable.bind(this),
    );

    this.#ctx.mediaRecorder.start();
  }

  async stop() {
    if (!this.#ctx.mediaRecorder) {
      return;
    }
    this.#ctx.mediaRecorder.stop();
    for (const track of this.#ctx.mediaStream.getTracks()) {
      track.stop();
    }

    await this.#ctx.chunksDownloaded.promise;
  }

  pause() {
    if (!this.#ctx.mediaRecorder) {
      return;
    }
    this.#ctx.mediaRecorder.pause();
  }

  resume() {
    if (!this.#ctx.mediaRecorder) {
      return;
    }
    this.#ctx.mediaRecorder.resume();
  }

  async cancel() {
    if (!this.#ctx.mediaRecorder) {
      return;
    }
    this.#ctx.isRecordingCanceled = true;
    await this.stop();
  }
}

class RecorderController {
  static #config: {
    mimeType: string;
  } = {
    mimeType: "video/webm; codecs=vp8,opus",
  };

  static #recorder?: Recorder;

  static async create(options: RecorderCreateOptions) {
    console.log(
      `[recorder_controller.ts] RecorderController::create(options=${JSON.stringify(options)})`,
    );
    RecorderController.#recorder = new Recorder(
      RecorderController.#config.mimeType,
    );
    if (options.mic.enabled) {
      RecorderController.#recorder.addStream(
        await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: options.mic.id,
          },
        }),
      );
      console.log(
        "[recorder_controller.ts] Added microphone stream to the recorder",
      );
    }
    RecorderController.#recorder.addStream(
      await navigator.mediaDevices.getDisplayMedia({
        audio: false, // NOTE: The `true` value lets us record audio from tab
      }),
    );
    console.log("[recorder_controller.ts] Added screen stream to the recorder");
  }

  static start() {
    console.log("[recorder_controller.ts] RecorderController::start()");
    if (!RecorderController.#recorder) {
      console.error("[recorder_controller.ts] Recorder is not created");
      return;
    }
    RecorderController.#recorder.start();
  }

  static async stop() {
    console.log("[recorder_controller.ts] RecorderController::stop()");
    if (!RecorderController.#recorder) {
      console.error("[recorder_controller.ts] Recorder is not created");
      return;
    }
    await RecorderController.#recorder.stop();
  }

  static pause() {
    console.log("[recorder_controller.ts] RecorderController::pause()");
    if (!RecorderController.#recorder) {
      console.error("[recorder_controller.ts] Recorder is not created");
      return;
    }
    RecorderController.#recorder.pause();
  }

  static resume() {
    console.log("[recorder_controller.ts] RecorderController::resume()");
    if (!RecorderController.#recorder) {
      console.error("[recorder_controller.ts] Recorder is not created");
      return;
    }
    RecorderController.#recorder.resume();
  }

  static async cancel() {
    console.log("[recorder_controller.ts] RecorderController::cancel()");
    if (!RecorderController.#recorder) {
      console.error("[recorder_controller.ts] Recorder is not created");
      return;
    }
    await RecorderController.#recorder.cancel();
  }

  static delete() {
    console.log("[recorder_controller.ts] RecorderController::delete()");
    if (!RecorderController.#recorder) {
      console.error("[recorder_controller.ts] Recorder is not created");
      return;
    }
    RecorderController.#recorder = undefined;
  }
}

chrome.runtime.onMessage.addListener(
  (message, _sender, sendResponse: (response: MessageResponse) => void) => {
    (async (message: Message) => {
      const { type, target, options } = message;
      if (target !== "offscreen") {
        return;
      }
      switch (type) {
        case MessageType.RecorderCreate:
          await RecorderController.create(options as RecorderCreateOptions);
          break;
        case MessageType.RecorderStart:
          RecorderController.start();
          break;
        case MessageType.RecorderStop:
          await RecorderController.stop();
          break;
        case MessageType.RecorderPause:
          RecorderController.pause();
          break;
        case MessageType.RecorderResume:
          RecorderController.resume();
          break;
        case MessageType.RecorderCancel:
          await RecorderController.cancel();
          break;
        case MessageType.RecorderDelete:
          RecorderController.delete();
          break;
        default:
          throw new Error(`Unsupported event with type ${type}`);
      }
    })(message as Message)
      .then(() => {
        sendResponse({
          type: MessageType.ResultOk,
        } satisfies MessageResponse);
      })
      .catch((err) => {
        console.error(
          `[recorder_controller.ts] Error in 'chrome.runtime.onMessage' handler: ${(err as Error).toString()}`,
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
