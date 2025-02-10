import React, { useCallback, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import {
  ButtonGroup,
  IconButton,
  Radio,
  Stack,
  Typography,
} from "@mui/material";
import {
  Delete,
  PlayCircleFilledRounded,
  StopCircleRounded,
  Close,
  PauseCircleFilledRounded,
} from "@mui/icons-material";
import { RecordingState, storage } from "@/app/storage";
import { senderV2 } from "@/app/messaging";

const SizeSelector = () => {
  const [selectedValue, setSelectedValue] = useState("200x200");

  useEffect(() => {
    storage.ui.cameraBubble.size
      .get()
      .then((size) => {
        setSelectedValue(`${size.width}x${size.height}`);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [width, height] = event.target.value
      .split("x")
      .map((value) => Number(value));
    if (selectedValue !== event.target.value) {
      storage.ui.cameraBubble.size
        .set({ width, height })
        .catch((err) => console.error(err));
    }
    setSelectedValue(event.target.value);
  };

  return (
    <ButtonGroup>
      <Radio
        value="200x200"
        checked={selectedValue === "200x200"}
        onChange={handleChange}
        size="small"
      />
      <Radio
        value="300x300"
        checked={selectedValue === "300x300"}
        onChange={handleChange}
      />
    </ButtonGroup>
  );
};

const CloseCameraBubble = () => {
  return (
    <IconButton
      onClick={() => {
        storage.ui.cameraBubble.enabled
          .set(false)
          .catch((err) => console.error(err));
      }}
    >
      <Close />
    </IconButton>
  );
};

const CameraBubbleControl = () => {
  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      <CloseCameraBubble />
      <SizeSelector />
    </Stack>
  );
};

const CameraBubbleFrame = () => {
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 200,
    height: 200,
  });

  useEffect(() => {
    const checkSizeUpdate = async () => {
      const newSize = await storage.ui.cameraBubble.size.get();

      if (newSize.width === size.width && newSize.height === size.height) {
        return;
      }

      setSize({ ...newSize });
    };

    const interval = setInterval(() => {
      checkSizeUpdate().catch((err) => {
        console.error(err);
        clearInterval(interval);
      });
    });

    return () => {
      clearInterval(interval);
    };
  }, [size]);

  return (
    <iframe
      style={{
        pointerEvents: "none",
        border: 0,
        display: "block",
        overflow: "hidden",
        borderRadius: "50%",
        ...size,
      }}
      allow="camera"
      src={chrome.runtime.getURL("camera_bubble_stream.html")}
      // FIXME: `scrolling` property is deprecated, but I didn't found another solution
      //        I tried to replace it with `overflow: hidden`, but it doesn't work
      scrolling="no"
    />
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
          setInProgress(value === RecordingState.InProgress);
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
          setOnPause(value === RecordingState.OnPause);
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
      <IconButton
        onClick={() => {
          if (!inProgress) {
            storage.recording.state
              .set(RecordingState.InProgress)
              .catch((err) => console.error(err));
            return;
          }
          storage.recording.state
            .set(onPause ? RecordingState.InProgress : RecordingState.OnPause)
            .catch((err) => console.error(err));
        }}
      >
        {inProgress && !onPause ? (
          <PauseCircleFilledRounded />
        ) : (
          <PlayCircleFilledRounded />
        )}
      </IconButton>
      {inProgress && (
        <IconButton
          onClick={() => {
            storage.recording.state
              .set(RecordingState.NotStarted)
              .catch((err) => console.error(err));
          }}
        >
          <StopCircleRounded />
        </IconButton>
      )}
      {inProgress && (
        <IconButton
          onClick={() => {
            senderV2.background
              .recordingCancel()
              .catch((err) => console.error(err));
          }}
        >
          <Delete />
        </IconButton>
      )}
    </ButtonGroup>
  );
};

const RecordingDuration = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState("00:00");

  const updateRecordingDuration = useCallback(async () => {
    const recordingDurationInSeconds = await storage.recording.duration.get();

    const seconds = recordingDurationInSeconds % 60;
    const minutes = Math.floor(recordingDurationInSeconds / 60);

    const secondsString =
      seconds.toString().length < 2 ? `0${seconds}` : seconds;
    const minutesString =
      minutes.toString().length < 2 ? `0${minutes}` : minutes;

    setRecordingDuration(`${minutesString}:${secondsString}`);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      storage.recording.state
        .get()
        .then((res) => setIsVisible(res === RecordingState.InProgress))
        .catch((err) => console.error(err));
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateRecordingDuration().catch((err) => {
        console.error(err);
      });
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [updateRecordingDuration]);

  return isVisible ? (
    <Typography variant="h6">{recordingDuration}</Typography>
  ) : (
    <></>
  );
};

interface CameraBubbleProps {
  cameraBubblePosition: { x: number; y: number };
}

const CameraBubble = (props: CameraBubbleProps) => {
  const [currentPos, setCurrentPos] = useState({
    ...props.cameraBubblePosition,
  });
  const [microphoneLevel, setMicrophoneLevel] = useState(0);

  const refStack = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    storage.ui.cameraBubble.position
      .get()
      .then(setCurrentPos)
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      storage.devices.mic.volume
        .get()
        .then((microphoneLevel) => {
          setMicrophoneLevel(microphoneLevel);
        })
        .catch((err) => console.error(err));
    });

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Draggable
      onStop={() => {
        if (!refStack.current) {
          return;
        }

        const boundingRect = refStack.current.getBoundingClientRect();

        storage.ui.cameraBubble.position
          .set({
            x: boundingRect.x,
            y: boundingRect.y,
          })
          .catch((err) => console.error(err));
      }}
    >
      <Stack
        ref={refStack}
        sx={{
          position: "fixed",
          left: currentPos.x,
          top: currentPos.y,
          zIndex: 2147483647,
          userSelect: "none",
        }}
        direction="column"
        alignItems="center"
        justifyContent="center"
        spacing={1}
      >
        <CameraBubbleControl />
        <CameraBubbleFrame />
        <RecordingControl />
        <RecordingDuration />
        <Typography>Microphone indication: {microphoneLevel}</Typography>
      </Stack>
    </Draggable>
  );
};

export default CameraBubble;
