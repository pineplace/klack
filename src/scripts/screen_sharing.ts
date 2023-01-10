import { Message, Method, builder, sender } from "../messaging";

class Recorder {
  #mimeType: string;
  #tracks: MediaStreamTrack[];
  #mediaRecorder: MediaRecorder;
  #mediaChunks: BlobPart[];

  constructor(mimeType: string, screenSharing: MediaStream, mic: MediaStream) {
    this.#mimeType = mimeType;
    this.#tracks = [...screenSharing.getTracks(), ...mic.getTracks()];
    this.#mediaRecorder = new MediaRecorder(
      new MediaStream([
        ...screenSharing.getVideoTracks(),
        ...this.#mergedAudioTracks(screenSharing, mic),
      ]),
      { mimeType }
    );
    this.#mediaChunks = [];

    /* NOTE: Clicking the native `Stop sharing` button only stops the screen sharing
     *       tracks, but doesn't affect the microphone stream tracks.
     *       This event listener fixes that.
     */
    screenSharing.getVideoTracks()[0].addEventListener("ended", () => {
      this.stop();
    });

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

  #mergedAudioTracks(...streams: MediaStream[]): MediaStreamTrack[] {
    const audioContext = new AudioContext();
    const streamDestination = audioContext.createMediaStreamDestination();

    for (const stream of streams) {
      if (!stream.getAudioTracks().length) {
        continue;
      }
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(streamDestination);
    }

    return streamDestination.stream.getAudioTracks();
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
    for (const track of this.#tracks) {
      track.stop();
    }
  }
}

async function share(): Promise<void> {
  const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
    audio: true,
    video: true,
  });
  const recorder = new Recorder("video/webm", screenSharingStream, micStream);
  recorder.start();

  chrome.runtime.onMessage.addListener((message: Message) => {
    if (message.method !== Method.TabStopMediaRecorder) {
      console.error(`Unexpected method: ${message.method}`);
      return;
    }
    console.log("MediaRecorder stop event received");
    recorder.stop();
  });
}

share().catch((err) => {
  console.error(`Can't start screen sharing ${(err as Error).message}`);
  sender.send(builder.cancelRecording()).catch((err) => console.error(err));
});
