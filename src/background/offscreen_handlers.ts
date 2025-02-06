import { RecorderCreateOptions } from "../messaging";
import { Recorder } from "./recorder";

const offscreenContext: {
  config: {
    mimeType: string;
  };
  recorder?: Recorder;
} = {
  config: {
    mimeType: "video/webm; codecs=vp8,opus",
  },
};

export async function onMessageRecorderCreate(options: RecorderCreateOptions) {
  offscreenContext.recorder = new Recorder(offscreenContext.config.mimeType);
  if (options.mic.enabled) {
    offscreenContext.recorder.addStream(
      await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: options.mic.id,
        },
      }),
    );
  }
  offscreenContext.recorder.addStream(
    await navigator.mediaDevices.getDisplayMedia({
      audio: false, // NOTE: The `true` value lets us record audio from tab
    }),
  );
}

export function onMessageRecorderStart() {
  if (!offscreenContext.recorder) {
    return;
  }
  offscreenContext.recorder.start();
}

export function onMessageRecorderStop() {
  if (!offscreenContext.recorder) {
    return;
  }
  offscreenContext.recorder.stop();
}

export function onMessageRecorderPause() {
  if (!offscreenContext.recorder) {
    return;
  }
  offscreenContext.recorder.pause();
}

export function onMessageRecorderResume() {
  if (!offscreenContext.recorder) {
    return;
  }
  offscreenContext.recorder.resume();
}

export function onMessageRecorderCancel() {
  if (!offscreenContext.recorder) {
    return;
  }
  offscreenContext.recorder.cancel();
}

export function onMessageRecorderDelete() {
  if (!offscreenContext.recorder) {
    return;
  }
  delete offscreenContext.recorder;
}
