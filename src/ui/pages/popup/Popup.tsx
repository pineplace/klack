import { RecordingState, StorageKey } from "@/shared/storage";
import { sender } from "@/shared/messaging";
import useStorageValue from "@/ui/hooks/useStorageValue";
import { PauseButton } from "./components/PauseButton";
import { PlayButton } from "./components/PlayButton";
import { RecButton } from "./components/RecButton";
import {
  IconAssembly,
  IconCircleOff,
  IconDownload,
  IconMenu2,
  IconMicrophone,
  IconMicrophoneOff,
  IconTrash,
  IconUserCircle,
} from "@tabler/icons-react";
import background from "/static/Background.svg";
import lookup128 from "/static/Lookup_128.png";

const Settings = () => {
  const [cameraBubbleEnabled] = useStorageValue(
    StorageKey.UiCameraBubbleEnabled,
  );
  const [micEnabled, setMicEnabled] = useStorageValue(
    StorageKey.DevicesMicEnabled,
  );

  return (
    <div className="flex w-full flex-row items-center justify-between p-[10px]">
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
          <IconCircleOff
            className="stroke-black"
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
            className="stroke-black"
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
    </div>
  );
};

const RecordingControl = () => {
  const [recordingState] = useStorageValue(StorageKey.RecordingState);

  return (
    <div className="flex h-full w-full flex-row items-center justify-center gap-[20px]">
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
      ) : recordingState === RecordingState.InProgress ? (
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
      ) : recordingState === RecordingState.OnPause ? (
        <>
          <IconDownload
            className="h-[28px] w-[28px] stroke-black transition-colors hover:stroke-[#00d492]"
            stroke={2}
            onClick={() => {
              (async () => {
                await sender.background.recordingComplete();
              })().catch((err) =>
                console.error(
                  `Can't complete and download recording: ${(err as Error).toString()}`,
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
      ) : null}
    </div>
  );
};

const RecordingDuration = () => {
  // TODO: Implement me
  return (
    <div className="font-dosis invisible flex w-full flex-row items-center justify-center gap-[5px] p-[10px] text-2xl">
      01:23:45
    </div>
  );
};

export const Popup = () => {
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
        <Settings />
        <RecordingControl />
        <RecordingDuration />
      </main>
    </div>
  );
};
