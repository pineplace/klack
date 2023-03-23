import React, { useEffect, useState } from "react";

const CameraBubbleStream = () => {
  const [source, setSource] = useState<MediaStream | undefined>();

  const createCameraStream = () => {
    return navigator.mediaDevices.getUserMedia({
      video: {
        width: 200,
        height: 200,
        facingMode: "environment",
      },
    });
  };

  useEffect(() => {
    createCameraStream()
      .then((mediaStream) => {
        setSource(mediaStream);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <video
      style={{
        pointerEvents: "none",
      }}
      autoPlay
      ref={(ref: HTMLVideoElement) => {
        if (!ref || !source) {
          return;
        }
        ref.srcObject = source;
      }}
    ></video>
  );
};

export { CameraBubbleStream as default };
