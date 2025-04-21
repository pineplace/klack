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

import { IconAssembly } from "@tabler/icons-react";
import imageBackground from "/assets/background.svg";
import imageLookup64 from "/assets/klack_lookup_64.png";

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
      className="flex h-[336px] w-[310px] flex-col items-center justify-center"
      style={{
        backgroundImage: `url(${imageBackground})`,
      }}
    >
      {/* Header */}
      <div className="flex h-[106px] w-full flex-row items-center justify-between">
        <img src={imageLookup64} />
        <div className="flex h-full w-full flex-row items-start justify-end p-[10px]">
          <IconAssembly
            color="white"
            stroke={2}
          />
        </div>
      </div>
      {/* Main */}
      <div className="flex h-full w-full flex-col items-center justify-start"></div>
    </div>
  );
};

export { Popup as default };
