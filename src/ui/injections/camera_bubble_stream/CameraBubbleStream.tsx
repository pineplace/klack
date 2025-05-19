import { useEffect, useState } from "react";

const CameraBubbleStream = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const createCameraStream = async () => {
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
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
  }, []);

  return (
    <video
      className="pointer-events-none h-full w-full object-cover"
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
