import { database } from "../database";
import { Message, Method, builder, sender } from "../messaging";
import type { TabStopMediaRecorderArgs } from "../messaging";
import { storage } from "../storage";
import { base64ToBlob, blobToBase64 } from "../utils";

class VolumeLevelHandler {
  #audioContext: AudioContext;
  #mediaSourceNode: MediaStreamAudioSourceNode;
  #analyserNode: AnalyserNode;

  constructor(microphoneDeviceStream: MediaStream) {
    console.log("VolumeLevelHandler::constructor  ()");
    this.#audioContext = new AudioContext();
    this.#mediaSourceNode = this.#audioContext.createMediaStreamSource(
      microphoneDeviceStream,
    );
    this.#analyserNode = this.#audioContext.createAnalyser();
    this.#analyserNode.fftSize = 2048;

    this.#mediaSourceNode
      .connect(this.#analyserNode)
      .connect(this.#audioContext.destination);
  }

  async start() {
    console.log("VolumeLevelHandler::start()");
    await this.#audioContext.resume();
    /* this.#volumeLevelInterval =  */ self.setInterval(() => {
      const dataArray = new Uint8Array(this.#analyserNode.fftSize);
      this.#analyserNode.getByteFrequencyData(dataArray);
      let sum = 0;
      for (const value of dataArray) {
        sum += value;
      }
      const averageMicrophoneVolumeLevel = sum / dataArray.length;
      storage.devices.mic.volume
        .set(Math.floor(averageMicrophoneVolumeLevel))
        .catch((err) => {
          console.error(err);
        });
    });
  }

  async stop() {
    console.log("VolumeLevelHandler::stop()");
    await this.#audioContext.close();
  }
}

class RecorderV2 {
  #recordingUUID: string;
  #recordingDurationInterval: number;
  #recordingDurationSeconds: number;
  #outputType: string;
  #mediaChunks: BlobPart[];
  #audioContext: AudioContext;
  #audioDestination: MediaStreamAudioDestinationNode;
  #audioTracks: MediaStreamTrack[];
  #videoTrack?: MediaStreamTrack;
  #mediaRecorder: MediaRecorder;

  #downloadOnStop = true;

  constructor(
    streams: MediaStream[],
    outputType = "video/webm;codecs=vp8,opus",
  ) {
    this.#recordingUUID = "";
    this.#recordingDurationInterval = 0;
    this.#recordingDurationSeconds = 0;
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
      { mimeType: this.#outputType },
    );

    chrome.runtime.onMessage.addListener((message: Message) => {
      const methods = new Map([
        [
          Method.TabStopMediaRecorder,
          () => {
            const args = message.args as TabStopMediaRecorderArgs;
            this.#downloadOnStop = args.downloadRecording;
            this.stop();
          },
        ],
        [
          Method.TabPauseMediaRecorder,
          () => {
            this.pause();
          },
        ],
        [
          Method.TabResumeMediaRecorder,
          () => {
            this.resume();
          },
        ],
      ]);

      const method = methods.get(message.method);

      if (!method) {
        return;
      }
      method();
    });

    this.#videoTrack.addEventListener("ended", () => {
      this.stop();
    });

    this.#mediaRecorder.addEventListener("start", () => {
      this.#onStart()
        .then(() => {
          console.log("#onStart finished");
        })
        .catch((err) => {
          console.error(err);
        });
    });

    this.#mediaRecorder.addEventListener("stop", () => {
      this.#onStop();
    });

    this.#mediaRecorder.addEventListener("dataavailable", (event) => {
      this.#onData(event.data).catch((err) => console.error(err));
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
          "Recorder already has video track, you can't add another",
        );
      }

      this.#videoTrack = stream.getVideoTracks()[0];
    }
  }

  async #onStart() {
    this.#recordingUUID = crypto.randomUUID();
    await database.recordings.add(this.#recordingUUID);

    storage.recording.duration.set(0).catch((err) => {
      console.error(err);
    });

    this.#recordingDurationInterval = self.setInterval(() => {
      if (this.#mediaRecorder.state !== "recording") {
        return;
      }
      storage.recording.duration
        .set(++this.#recordingDurationSeconds)
        .catch((err) => {
          console.error(err);
        });
    }, 1 * 1000);
  }

  #onStop() {
    console.log("#onStop");
  }

  async #onData(data: Blob) {
    {
      const recording = await database.recordings.get(this.#recordingUUID);
      const encodedChunk = await blobToBase64(data);
      await recording.chunks.add(encodedChunk);
      console.log(
        `Chunk has been added to the recording with uuid=${this.#recordingUUID}`,
      );
    }

    console.log(`state: ${this.#mediaRecorder.state}`);

    if (this.#mediaRecorder.state !== "inactive") {
      return;
    }

    {
      if (!this.#downloadOnStop) {
        sender
          .send(builder.cancelRecording("User decided to delete recording"))
          .catch((err) => console.error(err));
        return;
      }

      const recording = await database.recordings.get(this.#recordingUUID);
      const chunks = await recording.chunks.get();
      const blobs = chunks.map((base64Chunk) =>
        base64ToBlob(base64Chunk, this.#outputType),
      );

      const downloadUrl = URL.createObjectURL(
        new Blob(blobs, {
          type: data.type,
        }),
      );

      sender
        .send(builder.downloadRecording(downloadUrl))
        .then(() => {
          URL.revokeObjectURL(downloadUrl);
        })
        .catch((err) => console.error(err));
    }
  }

  start() {
    this.#mediaRecorder.start(10 * 1000);
  }

  pause() {
    this.#mediaRecorder.pause();
  }

  resume() {
    this.#mediaRecorder.resume();
  }

  stop() {
    this.#mediaRecorder.stop();
    this.#videoTrack?.stop();
    for (const track of this.#audioTracks) {
      track.stop();
    }
  }
}

async function main() {
  try {
    let microphoneVolumeHandler: VolumeLevelHandler | null = null;
    const streams: MediaStream[] = [];

    if (await storage.devices.mic.enabled.get()) {
      const microphoneStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: await storage.devices.mic.id.get(),
        },
      });
      streams.push(microphoneStream);
      microphoneVolumeHandler = new VolumeLevelHandler(microphoneStream);
    }

    streams.push(
      await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: {
          deviceId: await storage.devices.video.id.get(),
        },
      }),
    );

    const recorder = new RecorderV2(streams);
    recorder.start();
    await microphoneVolumeHandler?.start();

    await sender.send(builder.openUserActiveWindow());
  } catch (err) {
    await sender.send(builder.cancelRecording((err as Error).message));
  }
}

main().catch((err) => console.error(err));
