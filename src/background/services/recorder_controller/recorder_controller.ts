import {
  Message,
  MessageResponse,
  MessageResponseType,
  MessageType,
  RecorderCreateOptions,
  sender,
} from "@/shared/messaging";

class Recorder {
  #mimeType: string;
  #mediaStream: MediaStream;
  #chunks: BlobPart[];
  #isRecordingCanceled: boolean;
  #mediaRecorder?: MediaRecorder;
  #downloadUrl?: string;

  constructor(mimeType: string) {
    console.log(`Recorder.constructor(mimeType='${mimeType}')`);
    this.#mimeType = mimeType;
    this.#mediaStream = new MediaStream();
    this.#chunks = [];
    this.#isRecordingCanceled = false;
  }

  #onTrackEnded() {
    (async () => {
      await sender.background.recordingComplete();
    })().catch((err) => {
      console.error(
        `Recorder.#onTrackEnded error: ${(err as Error).toString()}`,
      );
      throw err;
    });
  }

  #onMediaRecorderDataAvailable(event: BlobEvent) {
    (async () => {
      if (!this.#mediaRecorder) {
        return;
      }

      if (this.#isRecordingCanceled) {
        return;
      }

      this.#chunks.push(event.data);
      if (this.#mediaRecorder.state !== "inactive") {
        return;
      }

      this.#downloadUrl = URL.createObjectURL(
        new Blob(this.#chunks, {
          type: event.data.type,
        }),
      );

      await sender.background.recordingSave({
        recordingUrl: this.#downloadUrl,
      });
    })().catch((err) => {
      console.error(
        `Recorder.#onMediaRecorderDataAvailable error: ${(err as Error).toString()}`,
      );
    });
  }

  addStream(stream: MediaStream) {
    for (const track of stream.getTracks()) {
      this.#mediaStream.addTrack(track);
    }
  }

  start() {
    this.#mediaRecorder = new MediaRecorder(this.#mediaStream, {
      mimeType: this.#mimeType,
    });

    for (const track of this.#mediaStream.getTracks()) {
      track.addEventListener("ended", this.#onTrackEnded.bind(this));
    }

    this.#mediaRecorder.addEventListener(
      "dataavailable",
      this.#onMediaRecorderDataAvailable.bind(this),
    );

    this.#mediaRecorder.start();
  }

  stop() {
    if (!this.#mediaRecorder) {
      return;
    }
    this.#mediaRecorder.stop();
    for (const track of this.#mediaStream.getTracks()) {
      track.stop();
    }
  }

  pause() {
    if (!this.#mediaRecorder) {
      return;
    }
    this.#mediaRecorder.pause();
  }

  resume() {
    if (!this.#mediaRecorder) {
      return;
    }
    this.#mediaRecorder.resume();
  }

  cancel() {
    if (!this.#mediaRecorder) {
      return;
    }
    this.#isRecordingCanceled = true;
    this.stop();
  }

  cleanup() {
    if (!this.#downloadUrl) {
      return;
    }
    URL.revokeObjectURL(this.#downloadUrl);
    this.#downloadUrl = "";
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
      `RecorderController.create(options=${JSON.stringify(options)})`,
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
      console.log("Added microphone stream to the recorder");
    }
    RecorderController.#recorder.addStream(
      await navigator.mediaDevices.getDisplayMedia({
        audio: false, // NOTE: The `true` value lets us record audio from tab
      }),
    );
    console.log("Added screen stream to the recorder");
  }

  static start() {
    console.log("RecorderController.start()");
    if (!RecorderController.#recorder) {
      console.error("Recorder is not created");
      return;
    }
    RecorderController.#recorder.start();
  }

  static stop() {
    console.log("RecorderController.stop()");
    if (!RecorderController.#recorder) {
      console.error("Recorder is not created");
      return;
    }
    RecorderController.#recorder.stop();
  }

  static pause() {
    console.log("RecorderController.pause()");
    if (!RecorderController.#recorder) {
      console.error("Recorder is not created");
      return;
    }
    RecorderController.#recorder.pause();
  }

  static resume() {
    console.log("RecorderController.resume()");
    if (!RecorderController.#recorder) {
      console.error("Recorder is not created");
      return;
    }
    RecorderController.#recorder.resume();
  }

  static cancel() {
    console.log("RecorderController.cancel()");
    if (!RecorderController.#recorder) {
      console.error("Recorder is not created");
      return;
    }
    RecorderController.#recorder.cancel();
  }

  static delete() {
    console.log("RecorderController.delete()");
    if (!RecorderController.#recorder) {
      console.error("Recorder is not created");
      return;
    }
    RecorderController.#recorder.cleanup();
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
          RecorderController.stop();
          break;
        case MessageType.RecorderPause:
          RecorderController.pause();
          break;
        case MessageType.RecorderResume:
          RecorderController.resume();
          break;
        case MessageType.RecorderCancel:
          RecorderController.cancel();
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
