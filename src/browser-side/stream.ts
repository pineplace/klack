export interface CameraCaptureProperties {
  width: number;
  height: number;
}

export async function createCameraStream(
  properties: CameraCaptureProperties
): Promise<MediaStream> {
  return await navigator.mediaDevices.getUserMedia({
    // audio: true;
    video: {
      width: properties.width,
      height: properties.height,
      facingMode: "environment", // or `user` for mobile devices
    },
  });
}

export async function createScreenCaptureStream() {
  // NOTE: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
  return await navigator.mediaDevices.getDisplayMedia({
    audio: true,
    video: true,
  });
}
