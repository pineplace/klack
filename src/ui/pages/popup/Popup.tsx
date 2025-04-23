import React, { useEffect, useState } from "react";
import {
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import { RecordingState, StorageKey } from "@/app/storage";
import { sender } from "@/app/messaging";
import useStorageValue from "@/ui/hooks/useStorageValue";

import {
  IconAssembly,
  IconVideo,
  IconMicrophone,
  IconMenu2,
} from "@tabler/icons-react";
import background from "/assets/Background.svg";
import lookup128 from "/assets/Lookup_128.png";

const CameraBubbleControls = () => {
  const [cameraBubbleEnabled] = useStorageValue(
    StorageKey.UiCameraBubbleEnabled,
  );

  return (
    <Button
      onClick={() => {
        if (cameraBubbleEnabled) {
          sender.background.cameraBubbleHide().catch((err) => {
            console.error(
              `Cannot hide camera bubble: ${(err as Error).toString()}`,
            );
          });
        } else {
          sender.background.cameraBubbleShow().catch((err) => {
            console.error(
              `Cannot show camera bubble: ${(err as Error).toString()}`,
            );
          });
        }
      }}
    >
      {cameraBubbleEnabled ? "Hide bubble" : "Show bubble"}
    </Button>
  );
};

const MicControls = () => {
  const [micEnabled, setMicEnabled] = useStorageValue(
    StorageKey.DevicesMicEnabled,
  );

  return (
    <Button
      onClick={() => {
        if (micEnabled) {
          setMicEnabled(false);
        } else {
          setMicEnabled(true);
        }
      }}
    >
      {micEnabled ? "Disable mic" : "Enable mic"}
    </Button>
  );
};

const DeviceSelector = (props: { type: "Camera" | "Mic" }) => {
  const kindOfDevice = props.type === "Camera" ? "videoinput" : "audioinput";

  const [deviceId, setDeviceId] = useStorageValue(
    props.type === "Camera"
      ? StorageKey.DevicesVideoId
      : StorageKey.DevicesMicId,
  );
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    (async () => {
      if (deviceId === undefined) {
        return;
      }

      const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
        (device) => {
          return device.kind === kindOfDevice;
        },
      );
      if (!devices.length) {
        return;
      }

      setDeviceId(devices[0].deviceId);
      setDevices(devices);
    })().catch((err) => {
      console.error(
        `Cannot initialize list of available devices and default device value: ${(err as Error).toString()}`,
      );
    });
  }, [deviceId, setDeviceId, setDevices, kindOfDevice]);

  if (!devices.length) {
    return <Typography>List of available devices is empty</Typography>;
  }

  return (
    <FormControl sx={{ minWidth: "150px" }}>
      <InputLabel>{props.type}</InputLabel>
      <Select
        label={props.type}
        onChange={(event: SelectChangeEvent) => setDeviceId(event.target.value)}
        value={deviceId ?? ""}
      >
        {devices.map((device) => {
          return (
            <MenuItem
              key={device.label}
              value={device.deviceId}
            >
              {device.label}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

const RecordingControls = () => {
  const [recordingState] = useStorageValue(StorageKey.RecordingState);

  return (
    <ButtonGroup>
      <Button
        onClick={() => {
          if (recordingState === RecordingState.NotStarted) {
            sender.background
              .recordingStart()
              .catch((err) => console.error(err));
          } else {
            sender.background
              .recordingStop()
              .catch((err) => console.error(err));
          }
        }}
      >
        {recordingState === RecordingState.NotStarted ? "Start" : "Stop"}
      </Button>
      {recordingState !== RecordingState.NotStarted && (
        <Button
          onClick={() => {
            if (recordingState === RecordingState.OnPause) {
              sender.background
                .recordingResume()
                .catch((err) => console.error(err));
            } else {
              sender.background
                .recordingPause()
                .catch((err) => console.error(err));
            }
          }}
        >
          {recordingState === RecordingState.OnPause ? "Resume" : "Pause"}
        </Button>
      )}
      {recordingState === RecordingState.InProgress && (
        <Button
          onClick={() => {
            sender.background
              .recordingCancel()
              .catch((err) => console.error(err));
          }}
        >
          Delete
        </Button>
      )}
    </ButtonGroup>
  );
};

const Popup = () => {
  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      spacing={1}
    >
      <CameraBubbleControls />
      <MicControls />
      <DeviceSelector type="Mic" />
      <DeviceSelector type="Camera" />
      <RecordingControls />
    </Stack>
  );
};

export const PopupV2 = () => {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <div className="flex min-h-[106px] w-full flex-row items-center justify-between p-[10px]">
        <img src={lookup128} />
        <div className="flex h-full flex-grow flex-row items-start justify-end">
          <IconAssembly
            className="stroke-white hover:stroke-gray-400 active:stroke-white"
            stroke={2}
          />
        </div>
      </div>
      <div className="flex h-full w-full flex-col items-center justify-start">
        <div className="flex w-full flex-row items-center justify-between p-[10px]">
          <div className="flex flex-row items-center justify-start gap-[5px]">
            <IconVideo
              className="stroke-black hover:stroke-gray-500 active:stroke-black"
              stroke={2}
            />
            <IconMicrophone
              className="stroke-black hover:stroke-gray-500 active:stroke-black"
              stroke={2}
            />
          </div>
          <IconMenu2
            className="stroke-black hover:stroke-gray-500 active:stroke-black"
            stroke={2}
          />
        </div>
        <div className="flex h-full w-full flex-row items-center justify-center">
          <div className="bg-klack-red-500 hover:bg-klack-red-600 active:bg-klack-red-500 flex size-[64px] items-center justify-center rounded-full">
            <div className="relative size-[52px] rounded-[100%] border-4 border-white"></div>
          </div>
        </div>
        <div className="font-dosis flex w-full flex-row items-center justify-center p-[10px] text-2xl">
          01:23:45
        </div>
      </div>
    </div>
  );
};

export { Popup as default };
