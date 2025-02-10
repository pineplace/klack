import { RecorderCreateOptions } from "../../messaging";
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
    console.log(`[offscreen.ts] Added microphone stream to the recorder`);
  }
  offscreenContext.recorder.addStream(
    await navigator.mediaDevices.getDisplayMedia({
      audio: false, // NOTE: The `true` value lets us record audio from tab
    }),
  );
  console.log(`[offscreen.ts] Added screen stream to the recorder`);
}

export function onMessageRecorderStart() {
  if (!offscreenContext.recorder) {
    console.error(`[offscreen.ts] Recorder is not created`);
    return;
  }
  offscreenContext.recorder.start();
}

export function onMessageRecorderStop() {
  if (!offscreenContext.recorder) {
    console.error(`[offscreen.ts] Recorder is not created`);
    return;
  }
  offscreenContext.recorder.stop();
}

export function onMessageRecorderPause() {
  if (!offscreenContext.recorder) {
    console.error(`[offscreen.ts] Recorder is not created`);
    return;
  }
  offscreenContext.recorder.pause();
}

export function onMessageRecorderResume() {
  if (!offscreenContext.recorder) {
    console.error(`[offscreen.ts] Recorder is not created`);
    return;
  }
  offscreenContext.recorder.resume();
}

export function onMessageRecorderCancel() {
  if (!offscreenContext.recorder) {
    console.error(`[offscreen.ts] Recorder is not created`);
    return;
  }
  offscreenContext.recorder.cancel();
}

export function onMessageRecorderDelete() {
  if (!offscreenContext.recorder) {
    console.error(`[offscreen.ts] Recorder is not created`);
    return;
  }
  delete offscreenContext.recorder;
}
