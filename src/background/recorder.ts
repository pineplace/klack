import { senderV2 } from "../messaging";

export class Recorder {
  #ctx: {
    mimeType: string;
    mediaStream: MediaStream;
    chunks: BlobPart[];
    isRecordingCanceled: boolean;
    mediaRecorder?: MediaRecorder;
  };

  constructor(mimeType: string) {
    this.#ctx = {
      mimeType,
      mediaStream: new MediaStream(),
      chunks: [],
      isRecordingCanceled: false,
    };
    console.log(
      `[recorder.ts] Recorder has been created for MIME type '${mimeType}'`,
    );
  }

  #onTrackEnded() {
    (async () => {
      console.log("#onTrackEndedListener");
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
      console.log("#onMediaRecorderDataAvailable");

      if (!this.#ctx.mediaRecorder) {
        return;
      }

      if (this.#ctx.isRecordingCanceled) {
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
      console.log("#onMediaRecorderDataAvailable end");
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

    this.#ctx.mediaRecorder.addEventListener("stop", () => {
      console.log("mediaRecorder.stop");
    });

    this.#ctx.mediaRecorder.start();
  }

  stop() {
    if (!this.#ctx.mediaRecorder) {
      return;
    }
    this.#ctx.mediaRecorder.stop();
    for (const track of this.#ctx.mediaStream.getTracks()) {
      track.stop();
    }
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

  cancel() {
    if (!this.#ctx.mediaRecorder) {
      return;
    }
    this.#ctx.isRecordingCanceled = true;
    this.stop();
  }
}
