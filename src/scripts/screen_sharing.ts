import { builder, sender } from "../messaging";

class Recorder {
  #stream: MediaStream;
  #mimeType: string;
  #mediaChunks: BlobPart[];
  #mediaRecorder: MediaRecorder;

  constructor(stream: MediaStream, mimeType: string) {
    this.#stream = stream;
    this.#mimeType = mimeType;
    this.#mediaChunks = [];
    this.#mediaRecorder = new MediaRecorder(stream, { mimeType });

    this.#mediaRecorder.addEventListener("start", (_event) => {
      this.#onStart();
    });

    this.#mediaRecorder.addEventListener("stop", (_event) => {
      this.#onStop();
    });

    this.#mediaRecorder.addEventListener("dataavailable", (event) => {
      this.#onData(event.data);
    });
  }

  #createDownloadUrl(): string {
    this.#mediaRecorder.state;
    return URL.createObjectURL(
      new Blob(this.#mediaChunks, {
        type: this.#mimeType,
      })
    );
  }

  #onStart() {
    // TODO: Implement me
  }

  #onStop() {
    // TODO: Implement me
    sender
      .send(builder.downloadRecording(this.#createDownloadUrl()))
      .catch((err) => console.error(err));
  }

  #onData(data: Blob) {
    this.#mediaChunks.push(data);
  }

  start() {
    this.#mediaRecorder.start();
  }

  stop() {
    this.#mediaRecorder.stop();
  }
}

async function share(): Promise<void> {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    audio: true,
    video: true,
  });
  const mediaRecorder = new Recorder(stream, "video/webm");
  mediaRecorder.start();
}

share().catch((err) => console.error(err));
