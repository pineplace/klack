import React, { useEffect, useState } from "react";
import { storage } from "../storage";

const useCameraBubbleSize = () => {
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 200,
    height: 200,
  });

  useEffect(() => {
    const checkSizeUpdate = async () => {
      const newSize = await storage.ui.cameraBubble.size.get();

      if (newSize.width === size.width && newSize.height === size.height) {
        setTimeout(() => {
          checkSizeUpdate().catch((err) => console.error(err));
        });
        return;
      }

      setSize({ ...newSize });
    };

    checkSizeUpdate().catch((err) => console.error(err));
  }, [size]);

  return size;
};

const useCameraStream = (cameraBubbleSize: {
  width: number;
  height: number;
}) => {
  const [stream, setStream] = useState<MediaStream | null>();

  useEffect(() => {
    const createCameraStream = async () => {
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          ...cameraBubbleSize,
        },
      });

      setStream((stream) => {
        if (stream) {
          for (const track of stream.getTracks()) {
            stream.removeTrack(track);
          }
        }
        return userMediaStream;
      });
    };

    createCameraStream().catch((err) => console.error(err));
  }, [cameraBubbleSize]);

  return stream;
};

const CameraBubbleStream = () => {
  const cameraBubbleSize = useCameraBubbleSize();
  const stream = useCameraStream(cameraBubbleSize);

  return (
    <video
      style={{
        pointerEvents: "none",
      }}
      autoPlay
      ref={(ref: HTMLVideoElement) => {
        if (!ref || !stream) {
          return;
        }
        ref.srcObject = stream;
        ref.setAttribute("data-testid", "WithStream");
      }}
    ></video>
  );
};

export { CameraBubbleStream as default };
