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
} from "@mui/material";
import { RecordingState, storage } from "../storage";
import { builder, sender } from "../messaging";

const ShowHideCameraBubble = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      storage.ui.cameraBubble.enabled
        .get()
        .then(setIsVisible)
        .catch((err) => {
          if ((err as Error).message != "Extension context invalidated.") {
            console.error(err);
            return;
          }
          clearInterval(interval);
          console.log("Looks like extension was disabled, interval removed");
        });
    }, 500);

    return () => {
      clearInterval(interval);
    };
  });

  return (
    <Button
      onClick={() => {
        if (isVisible) {
          storage.ui.cameraBubble.enabled
            .set(false)
            .catch((err) => console.error(err));
        } else {
          storage.ui.cameraBubble.enabled
            .set(true)
            .catch((err) => console.error(err));
        }
      }}
    >
      {isVisible ? "Hide bubble" : "Show bubble"}
    </Button>
  );
};

const TurnOnTurnOffMic = () => {
  const [micEnabled, setMicAllowed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      storage.devices.mic.enabled
        .get()
        .then(setMicAllowed)
        .catch((err) => {
          if ((err as Error).message != "Extension context invalidated.") {
            console.error(err);
            return;
          }
          clearInterval(interval);
          console.log("Looks like extension was disabled, interval removed");
        });
    }, 500);

    return () => {
      clearInterval(interval);
    };
  });

  return (
    <Button
      onClick={() => {
        if (micEnabled) {
          storage.devices.mic.enabled
            .set(false)
            .catch((err) => console.error(err));
        } else {
          storage.devices.mic.enabled
            .set(true)
            .catch((err) => console.error(err));
        }
      }}
    >
      {micEnabled ? "Disallow Mic" : "Allow Mic"}
    </Button>
  );
};

const MicrophoneSelector = () => {
  const [activeMicroDeviceId, setActiveMicroDeviceId] = useState("");
  const [availableMicroIds, setAvailableMicroIds] = useState<MediaDeviceInfo[]>(
    [],
  );

  const getMicrophoneDevices = async () => {
    return (await navigator.mediaDevices.enumerateDevices()).filter(
      (device) => {
        return device.kind === "audioinput";
      },
    );
  };

  const getDefaultMicroId = async () => {
    let microDeviceId = await storage.devices.mic.id.get();
    if (microDeviceId) {
      return microDeviceId;
    }
    microDeviceId = (await getMicrophoneDevices()).at(0)?.deviceId ?? "";
    await storage.devices.mic.id.set(microDeviceId);
    return microDeviceId;
  };

  useEffect(() => {
    getMicrophoneDevices()
      .then((devices) => {
        setAvailableMicroIds(devices);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    getDefaultMicroId()
      .then((defaultMicroId) => {
        setActiveMicroDeviceId(defaultMicroId);
      })
      .catch((err) => console.error(err));
  });

  const handleChange = (event: SelectChangeEvent) => {
    const deviceId = event.target.value;
    storage.devices.mic.id.set(deviceId).catch((err) => {
      console.error(err);
    });
    setActiveMicroDeviceId(deviceId);
  };

  const deviceItems = availableMicroIds.map((micro) => {
    return (
      <MenuItem
        key={micro.deviceId}
        value={micro.deviceId}
      >
        {micro.label}
      </MenuItem>
    );
  });

  return (
    <FormControl sx={{ minWidth: "150px" }}>
      <InputLabel>Microphone</InputLabel>
      <Select
        label="Microphone"
        onChange={handleChange}
        value={activeMicroDeviceId}
      >
        {deviceItems}
      </Select>
    </FormControl>
  );
};

const CameraSelector = () => {
  const [activeCameraDeviceId, setActiveCameraDeviceId] = useState("");
  const [availableCameraIds, setAvailableCameraIds] = useState<
    MediaDeviceInfo[]
  >([]);

  const getCameraDevices = async () => {
    return (await navigator.mediaDevices.enumerateDevices()).filter(
      (device) => {
        return device.kind === "videoinput";
      },
    );
  };

  const getDefaultCameraId = async () => {
    let cameraDeviceId = await storage.devices.video.id.get();
    if (cameraDeviceId) {
      return cameraDeviceId;
    }
    cameraDeviceId = (await getCameraDevices()).at(0)?.deviceId ?? "";
    await storage.devices.video.id.set(cameraDeviceId);
    return cameraDeviceId;
  };

  useEffect(() => {
    getCameraDevices()
      .then((device) => {
        setAvailableCameraIds(device);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    getDefaultCameraId()
      .then((defaultCameraId) => {
        setActiveCameraDeviceId(defaultCameraId);
      })
      .catch((err) => console.error(err));
  });

  const handleChange = (event: SelectChangeEvent) => {
    const deviceId = event.target.value;
    storage.devices.video.id.set(deviceId).catch((err) => {
      console.error(err);
    });
    setActiveCameraDeviceId(deviceId);
  };

  const deviceItems = availableCameraIds.map((micro) => {
    return (
      <MenuItem
        key={micro.label}
        value={micro.deviceId}
      >
        {micro.label}
      </MenuItem>
    );
  });

  return (
    <FormControl sx={{ minWidth: "150px" }}>
      <InputLabel>Camera</InputLabel>
      <Select
        label="Microphone"
        onChange={handleChange}
        value={activeCameraDeviceId}
      >
        {deviceItems}
      </Select>
    </FormControl>
  );
};

const RecordingControl = () => {
  const [inProgress, setInProgress] = useState(false);
  const [onPause, setOnPause] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      storage.recording.state
        .get()
        .then((value) => {
          setInProgress(value === RecordingState.Started);
        })
        .catch((err) => {
          if ((err as Error).message != "Extension context invalidated.") {
            console.error(err);
            return;
          }
          clearInterval(interval);
          console.log("Looks like extension was disabled, interval removed");
        });
    }, 500);

    return () => {
      clearInterval(interval);
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      storage.recording.state
        .get()
        .then((value) => {
          setOnPause(value === RecordingState.Paused);
        })
        .catch((err) => {
          if ((err as Error).message != "Extension context invalidated.") {
            console.error(err);
            return;
          }
          clearInterval(interval);
          console.log("Looks like extension was disabled, interval removed");
        });
    }, 500);

    return () => {
      clearInterval(interval);
    };
  });

  return (
    <ButtonGroup>
      <Button
        onClick={() => {
          if (inProgress) {
            storage.recording.state
              .set(RecordingState.Stopped)
              .catch((err) => console.error(err));
          } else {
            storage.recording.state
              .set(RecordingState.Started)
              .catch((err) => console.error(err));
          }
        }}
      >
        {inProgress ? "Stop" : "Start"}
      </Button>
      {inProgress && (
        <Button
          onClick={() => {
            storage.recording.state
              .set(onPause ? RecordingState.Started : RecordingState.Paused)
              .catch((err) => console.error(err));
          }}
        >
          {onPause ? "Resume" : "Pause"}
        </Button>
      )}
      {inProgress && (
        <Button
          onClick={() => {
            storage.recording.state
              .set(RecordingState.Deleted)
              .catch((err) => console.error(err));
          }}
        >
          Delete
        </Button>
      )}
    </ButtonGroup>
  );
};

const PopupMenu = () => {
  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      spacing={1}
    >
      <ShowHideCameraBubble />
      <TurnOnTurnOffMic />
      <MicrophoneSelector />
      <CameraSelector />
      <RecordingControl />
    </Stack>
  );
};

export { PopupMenu as default };
