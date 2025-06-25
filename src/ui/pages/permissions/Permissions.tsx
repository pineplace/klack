import { useEffect, useState } from "react";
import {
  IconVideo,
  IconMicrophone,
  IconLoader2,
  IconCircleCheck,
  IconCircleX,
} from "@tabler/icons-react";
import lookup512 from "/static/Lookup_512.png";
import { sender } from "@/shared/messaging";

export const Permissions = () => {
  const [videoPermissionState, setVideoPermissionState] =
    useState<PermissionState>("prompt");
  const [micPermissionsState, setMicPermissionsState] =
    useState<PermissionState>("prompt");

  useEffect(() => {
    (async () => {
      const permissionsStatus = await navigator.permissions.query({
        name: "camera",
      });
      setVideoPermissionState(permissionsStatus.state);
      permissionsStatus.onchange = () => {
        setVideoPermissionState(permissionsStatus.state);
      };
    })().catch((err) => {
      console.error(
        `Can't get permissions status for video: ${(err as Error).toString()}`,
      );
    });
  }, []);

  useEffect(() => {
    (async () => {
      const permissionsStatus = await navigator.permissions.query({
        name: "microphone",
      });
      setMicPermissionsState(permissionsStatus.state);
      permissionsStatus.onchange = () => {
        setMicPermissionsState(permissionsStatus.state);
      };
    })().catch((err) => {
      console.error(
        `Can't get permissions status for video: ${(err as Error).toString()}`,
      );
    });
  }, []);

  useEffect(() => {
    if (
      videoPermissionState !== "granted" ||
      micPermissionsState !== "granted"
    ) {
      return;
    }
    setTimeout(() => {
      sender.background.permissionsTabClose().catch((err) => {
        console.error(
          `Can't send event to background: ${(err as Error).toString()}`,
        );
      });
    }, 3 * 1000);
  }, [micPermissionsState, videoPermissionState]);

  useEffect(() => {
    (async () => {
      await navigator.mediaDevices.getUserMedia({
        video: true,
      });
    })().catch((err) => {
      console.error(
        `Error on 'getUserMedia' for video device permissions: ${(err as Error).toString()}`,
      );
    });
  }, []);

  useEffect(() => {
    (async () => {
      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    })().catch((err) => {
      console.error(
        `Can't on 'getUserMedia' for audio device permissions: ${(err as Error).toString()}`,
      );
    });
  }, []);

  return (
    <div className="bg-klack-charcoal-800 flex h-full w-full flex-col items-center justify-center gap-25">
      <img src={lookup512} />
      <div className="font-dosis w-[665px] text-center text-3xl text-white">
        {videoPermissionState === "denied" ||
        micPermissionsState === "denied" ? (
          <p>
            You denied access to required devices. Please enable them in your
            browser settings and close this tab.
          </p>
        ) : (
          <p>
            Now the browser will ask for your permission to use your camera and
            microphone. Please do not close this tab, it will close
            automatically.
          </p>
        )}
      </div>
      <div className="flex flex-row items-center gap-[150px]">
        <div className="flex flex-row items-center gap-[10px]">
          <IconVideo
            className="stroke-white"
            stroke={2}
            size={64}
          />
          {videoPermissionState === "prompt" ? (
            <IconLoader2
              className="animate-spin stroke-white"
              stroke={2}
              size={32}
            />
          ) : videoPermissionState === "granted" ? (
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
          {micPermissionsState === "prompt" ? (
            <IconLoader2
              className="animate-spin stroke-white"
              stroke={2}
              size={32}
            />
          ) : micPermissionsState === "granted" ? (
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
