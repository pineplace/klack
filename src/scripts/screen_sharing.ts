import { Message, Method, builder, sender } from "../messaging";

class RecorderV2 {
  #outputType: string;
  #mediaChunks: BlobPart[];
  #audioContext: AudioContext;
  #audioDestination: MediaStreamAudioDestinationNode;
  #audioTracks: MediaStreamTrack[];
  #videoTrack?: MediaStreamTrack;
  #mediaRecorder: MediaRecorder;

  constructor(streams: MediaStream[], outputType = "video/webm") {
    this.#outputType = outputType;
    this.#mediaChunks = [];
    this.#audioContext = new AudioContext();
    this.#audioDestination = this.#audioContext.createMediaStreamDestination();
    this.#audioTracks = [];

    for (const stream of streams) {
      this.#addStream(stream);
    }

    if (!this.#videoTrack) {
      throw new Error("Unable to create MediaRecorder without video track");
    }

    this.#mediaRecorder = new MediaRecorder(
      new MediaStream([
        this.#videoTrack,
        ...(this.#audioTracks.length
          ? this.#audioDestination.stream.getAudioTracks()
          : []),
      ]),
      { mimeType: this.#outputType }
    );

    chrome.runtime.onMessage.addListener((message: Message) => {
      if (message.method !== Method.TabStopMediaRecorder) {
        console.error(`Unexpected method: ${message.method}`);
        return;
      }
      this.stop();
    });

    this.#videoTrack.addEventListener("ended", () => {
      this.stop();
    });

    this.#mediaRecorder.addEventListener("start", () => {
      this.#onStart();
    });

    this.#mediaRecorder.addEventListener("stop", () => {
      this.#onStop();
    });

    this.#mediaRecorder.addEventListener("dataavailable", (event) => {
      this.#onData(event.data);
    });
  }

  #addStream(stream: MediaStream) {
    if (stream.getAudioTracks().length) {
      const source = this.#audioContext.createMediaStreamSource(stream);
      source.connect(this.#audioDestination);

      this.#audioTracks.push(...stream.getAudioTracks());
    }

    if (stream.getVideoTracks().length) {
      if (this.#videoTrack) {
        throw new Error(
          "Recorder already has video track, you can't add another"
        );
      }

      this.#videoTrack = stream.getVideoTracks()[0];
    }
  }

  #onStart() {
    //
  }

  #onStop() {
    const downloadUrl = URL.createObjectURL(
      new Blob(this.#mediaChunks, {
        type: this.#outputType,
      })
    );

    sender
      .send(builder.downloadRecording(downloadUrl))
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
    this.#videoTrack?.stop();
    for (const track of this.#audioTracks) {
      track.stop();
    }
  }
}

async function share(): Promise<void> {
  const resp = await sender.send(builder.getter.isMicrophoneAllowed());
  if (!resp) {
    throw new Error("Can't get response from background script");
  }
  if (resp.error) {
    throw new Error(`Error response from background script ${resp.error}`);
  }
  const micAllowed = resp.result;

  const streams: MediaStream[] = [];
  if (micAllowed) {
    streams.push(await navigator.mediaDevices.getUserMedia({ audio: true }));
  }
  streams.push(
    await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: true,
    })
  );

  const recorder = new RecorderV2(streams);
  recorder.start();
}

share().catch((err) => {
  console.error(`Can't start screen sharing ${(err as Error).message}`);
  sender.send(builder.cancelRecording()).catch((err) => console.error(err));
});
