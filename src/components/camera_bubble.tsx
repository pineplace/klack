import React, { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { ButtonGroup, IconButton, Radio, Stack } from "@mui/material";
import {
  Delete,
  PlayCircleFilledRounded,
  StopCircleRounded,
  Close,
  PauseCircleFilledRounded,
} from "@mui/icons-material";
import { builder, sender } from "../messaging";
import { storage } from "../storage";

const SizeSelector = () => {
  const [selectedValue, setSelectedValue] = useState("200x200");

  useEffect(() => {
    storage.get
      .cameraBubbleSize()
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
      storage.set
        .cameraBubbleSize({ width, height })
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
        sender
          .send(builder.hideCameraBubble())
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
      const newSize = await storage.get.cameraBubbleSize();

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
      storage.get
        .recordingInProgress()
        .then((value: boolean) => {
          setInProgress(value);
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
      storage.get
        .recordingOnPause()
        .then((value: boolean) => {
          setOnPause(value);
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
            sender
              .send(builder.startRecording())
              .catch((err) => console.error(err));
            return;
          }
          sender
            .send(
              onPause ? builder.resumeRecording() : builder.pauseRecording()
            )
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
            sender
              .send(builder.stopRecording())
              .catch((err) => console.error(err));
          }}
        >
          <StopCircleRounded />
        </IconButton>
      )}
      {inProgress && (
        <IconButton
          onClick={() => {
            sender
              .send(builder.deleteRecording())
              .catch((err) => console.error(err));
          }}
        >
          <Delete />
        </IconButton>
      )}
    </ButtonGroup>
  );
};

const CameraBubble = () => {
  const [currentPos, setCurrentPos] = useState({
    x: 0,
    y: 0,
  });

  const refStack = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    storage.get
      .cameraBubblePosition()
      .then(setCurrentPos)
      .catch((err) => console.error(err));
  }, []);

  return (
    <Draggable
      onStop={() => {
        if (!refStack.current) {
          return;
        }

        const boundingRect = refStack.current.getBoundingClientRect();

        storage.set
          .cameraBubblePosition({
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
      </Stack>
    </Draggable>
  );
};

export default CameraBubble;
