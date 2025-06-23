import { useEffect, useState } from "react";
import {
  IconVideo,
  IconMicrophone,
  IconLoader2,
  IconCircleCheck,
  IconCircleX,
} from "@tabler/icons-react";
import lookup512 from "/static/Lookup_512.png";
import { storage } from "@/shared/storage";
import { sender } from "@/shared/messaging";

enum PermissionState {
  NotGranted,
  Granted,
  NotAllowed,
}

export const Permissions = () => {
  const [videoPermissionState, setVideoPermissionState] = useState(
    PermissionState.NotGranted,
  );
  const [micPermissionsState, setMicPermissionsState] = useState(
    PermissionState.NotGranted,
  );

  useEffect(() => {
    (async () => {
      await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      await storage.devices.video.permissionsGranted.set(true);
      setVideoPermissionState(PermissionState.Granted);
    })().catch(() => {
      storage.devices.video.permissionsGranted.set(true).catch((err) => {
        console.error(
          `Can't set storage value for video device permissions: ${(err as Error).toString()}`,
        );
      });
      setVideoPermissionState(PermissionState.NotAllowed);
    });
  }, []);

  useEffect(() => {
    (async () => {
      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setMicPermissionsState(PermissionState.Granted);
      await storage.devices.mic.permissionsGranted.set(true);
    })().catch(() => {
      storage.devices.mic.permissionsGranted.set(true).catch((err) => {
        console.error(
          `Can't set storage value for video device permissions: ${(err as Error).toString()}`,
        );
      });
      setMicPermissionsState(PermissionState.NotAllowed);
    });
  }, []);

  useEffect(() => {
    if (
      videoPermissionState === PermissionState.NotGranted ||
      micPermissionsState === PermissionState.NotGranted
    ) {
      return;
    }

    setTimeout(() => {
      sender.background.permissionsPageClose().catch((err) => {
        console.error(
          `Can't send event to background: ${(err as Error).toString()}`,
        );
      });
    }, 1 * 1000);
  }, [micPermissionsState, videoPermissionState]);

  return (
    <div className="bg-klack-charcoal-800 flex h-full w-full flex-col items-center justify-center gap-25">
      <img src={lookup512} />
      <div className="font-dosis w-[665px] text-center text-3xl whitespace-pre-line text-white">
        <p>
          Now the browser will ask for your permission to use your camera and
          microphone.
        </p>
        <p>Please do not close this tab, it will close automatically.</p>
      </div>
      <div className="flex flex-row items-center gap-[150px]">
        <div className="flex flex-row items-center gap-[10px]">
          <IconVideo
            className="stroke-white"
            stroke={2}
            size={64}
          />
          {videoPermissionState === PermissionState.NotGranted ? (
            <IconLoader2
              className="animate-spin stroke-white"
              stroke={2}
              size={32}
            />
          ) : videoPermissionState === PermissionState.Granted ? (
            <IconCircleCheck
              className="fill-klack-emerald-400 stroke-white"
              stroke={2}
              size={48}
            />
          ) : (
            <IconCircleX
              className="fill-klack-red-500 stroke-white"
              stroke={2}
              size={48}
            />
          )}
        </div>
        <div className="flex flex-row items-center gap-[10px]">
          <IconMicrophone
            className="stroke-white"
            stroke={2}
            size={64}
          />
          {micPermissionsState === PermissionState.NotGranted ? (
            <IconLoader2
              className="animate-spin stroke-white"
              stroke={2}
              size={32}
            />
          ) : micPermissionsState === PermissionState.Granted ? (
            <IconCircleCheck
              className="fill-klack-emerald-400 stroke-white"
              stroke={2}
              size={48}
            />
          ) : (
            <IconCircleX
              className="fill-klack-red-500 stroke-white"
              stroke={2}
              size={48}
            />
          )}
        </div>
      </div>
    </div>
  );
};
