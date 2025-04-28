import React, { forwardRef } from "react";
import { RecordingState, StorageKey } from "@/app/storage";
import { sender } from "@/app/messaging";
import useStorageValue from "@/ui/hooks/useStorageValue";

import {
  IconAssembly,
  IconMenu2,
  IconMicrophone,
  IconMicrophoneOff,
  IconUserCircle,
  IconDownload,
  IconTrash,
} from "@tabler/icons-react";
import background from "/assets/Background.svg";
import lookup128 from "/assets/Lookup_128.png";

const RecButton = forwardRef<
  HTMLButtonElement,
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">
>((props, ref) => {
  return (
    <button
      ref={ref}
      className="bg-klack-red-500 hover:bg-klack-red-600 active:bg-klack-red-500 flex size-[64px] items-center justify-center rounded-full"
      {...props}
    >
      <div className="relative size-[52px] rounded-[100%] border-4 border-white"></div>
    </button>
  );
});
RecButton.displayName = "RecButton";

const PauseButton = forwardRef<
  HTMLButtonElement,
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">
>((props, ref) => {
  return (
    <button
      ref={ref}
      className="bg-klack-red-500 hover:bg-klack-red-600 active:bg-klack-red-500 flex size-[64px] items-center justify-center rounded-full"
      {...props}
    >
      <div className="flex size-[32px] flex-row-reverse items-center justify-center gap-x-2 px-[6px] py-1">
        <div className="relative h-[25px] w-[7px] bg-white"></div>
        <div className="relative h-[25px] w-[7px] bg-white"></div>
      </div>
    </button>
  );
});
PauseButton.displayName = "PauseButton";

const PlayButton = forwardRef<
  HTMLButtonElement,
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">
>((props, ref) => {
  return (
    <button
      ref={ref}
      className="bg-klack-charcoal-700 hover:bg-klack-charcoal-800 active:bg-klack-charcoal-700 flex size-[64px] items-center justify-center rounded-full pl-[5px]"
      {...props}
    >
      <div className="[height:0] [width:0] [border-bottom:16px_solid_transparent] [border-left:25px_solid_white] [border-top:16px_solid_transparent]" />
    </button>
  );
});
PlayButton.displayName = "PlayButton";

export const Popup = () => {
  const [cameraBubbleEnabled] = useStorageValue(
    StorageKey.UiCameraBubbleEnabled,
  );
  const [micEnabled, setMicEnabled] = useStorageValue(
    StorageKey.DevicesMicEnabled,
  );
  const [recordingState] = useStorageValue(StorageKey.RecordingState);

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <header className="flex min-h-[106px] w-full flex-row items-center justify-between p-[10px]">
        <img src={lookup128} />
        <div className="flex h-full flex-grow flex-row items-start justify-end">
          {/* TODO: Implement me */}
          <IconAssembly
            className="invisible stroke-white hover:stroke-gray-400 active:stroke-white"
            stroke={2}
          />
        </div>
      </header>
      <main className="flex h-full w-full flex-col items-center justify-start">
        {/* Settings */}
        <section className="flex w-full flex-row items-center justify-between p-[10px]">
          <div className="flex flex-row items-center justify-start gap-[5px]">
            {cameraBubbleEnabled ? (
              <IconUserCircle
                className="stroke-black"
                stroke={2}
                onClick={() => {
                  sender.background
                    .cameraBubbleHide()
                    .catch((err) =>
                      console.error(
                        `Can't hide camera bubble: ${(err as Error).toString()}`,
                      ),
                    );
                }}
              />
            ) : (
              <IconUserCircle
                className="stroke-gray-500"
                stroke={2}
                onClick={() => {
                  sender.background
                    .cameraBubbleShow()
                    .catch((err) =>
                      console.error(
                        `Can't show camera bubble: ${(err as Error).toString()}`,
                      ),
                    );
                }}
              />
            )}
            {micEnabled ? (
              <IconMicrophone
                className="stroke-black"
                stroke={2}
                onClick={() => {
                  setMicEnabled(false);
                }}
              />
            ) : (
              <IconMicrophoneOff
                className="stroke-gray-500"
                stroke={2}
                onClick={() => {
                  setMicEnabled(true);
                }}
              />
            )}
          </div>
          {/* TODO: Implement me */}
          <IconMenu2
            className="invisible stroke-black hover:stroke-gray-500 active:stroke-black"
            stroke={2}
          />
        </section>
        {/* Recording control */}
        <section className="flex h-full w-full flex-row items-center justify-center gap-[20px]">
          {recordingState === RecordingState.NotStarted ? (
            <RecButton
              onClick={() => {
                sender.background
                  .recordingStart()
                  .catch((err) =>
                    console.error(
                      `Can't start recording: ${(err as Error).toString()}`,
                    ),
                  );
              }}
            />
          ) : recordingState === RecordingState.OnPause ? (
            <>
              <IconDownload
                className="h-[28px] w-[28px] stroke-black transition-colors hover:stroke-[#00d492]"
                stroke={2}
                onClick={() => {
                  sender.background
                    .recordingStop()
                    .catch((err) =>
                      console.error(
                        `Can't stop recording: ${(err as Error).toString()}`,
                      ),
                    );
                }}
              />
              <PlayButton
                onClick={() => {
                  sender.background
                    .recordingResume()
                    .catch((err) =>
                      console.error(
                        `Can't resume recording: ${(err as Error).toString()}`,
                      ),
                    );
                }}
              />
              <IconTrash
                className="hover:stroke-klack-red-500 h-[28px] w-[28px] stroke-black transition-colors"
                stroke={2}
                onClick={() => {
                  sender.background
                    .recordingCancel()
                    .catch((err) =>
                      console.error(
                        `Can't cancel recording: ${(err as Error).toString()}`,
                      ),
                    );
                }}
              />
            </>
          ) : (
            <PauseButton
              onClick={() => {
                sender.background
                  .recordingPause()
                  .catch((err) =>
                    console.error(
                      `Can't pause recording: ${(err as Error).toString()}`,
                    ),
                  );
              }}
            />
          )}
        </section>
        {/* Recording duration */}
        {/* TODO: Implement me */}
        <section className="font-dosis invisible flex w-full flex-row items-center justify-center gap-[5px] p-[10px] text-2xl">
          01:23:45
        </section>
      </main>
    </div>
  );
};
