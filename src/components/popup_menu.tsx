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
import { builder, sender } from "../messaging";
import { storage } from "../storage";

const ShowHideCameraBubble = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      storage.get
        .cameraBubbleVisible()
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
        sender
          .send(
            isVisible ? builder.hideCameraBubble() : builder.showCameraBubble(),
          )
          .catch((err) => console.error(err));
      }}
    >
      {isVisible ? "Hide bubble" : "Show bubble"}
    </Button>
  );
};

const TurnOnTurnOffMic = () => {
  const [micAllowed, setMicAllowed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      storage.get
        .microphoneAllowed()
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
        sender
          .send(
            micAllowed
              ? builder.disallowMicrophone()
              : builder.allowMicrophone(),
          )
          .catch((err) => console.error(err));
      }}
    >
      {micAllowed ? "Disallow Mic" : "Allow Mic"}
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
    let microDeviceId = await storage.get.microphoneDeviceId();
    if (microDeviceId) {
      return microDeviceId;
    }
    microDeviceId = (await getMicrophoneDevices()).at(0)?.deviceId ?? "";
    await storage.set.microphoneDeviceId(microDeviceId);
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
    storage.set.microphoneDeviceId(deviceId).catch((err) => {
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
    let cameraDeviceId = await storage.get.cameraDeviceId();
    if (cameraDeviceId) {
      return cameraDeviceId;
    }
    cameraDeviceId = (await getCameraDevices()).at(0)?.deviceId ?? "";
    await storage.set.cameraDeviceId(cameraDeviceId);
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
    storage.set.cameraDeviceId(deviceId).catch((err) => {
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
      storage.get
        .recordingInProgress()
        .then(setInProgress)
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
      storage.get
        .recordingOnPause()
        .then(setOnPause)
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
          sender
            .send(
              inProgress ? builder.stopRecording() : builder.startRecording(),
            )
            .catch((err) => console.error(err));
        }}
      >
        {inProgress ? "Stop" : "Start"}
      </Button>
      {inProgress && (
        <Button
          onClick={() => {
            sender
              .send(
                onPause ? builder.resumeRecording() : builder.pauseRecording(),
              )
              .catch((err) => console.error(err));
          }}
        >
          {onPause ? "Resume" : "Pause"}
        </Button>
      )}
      {inProgress && (
        <Button
          onClick={() => {
            sender
              .send(builder.deleteRecording())
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
