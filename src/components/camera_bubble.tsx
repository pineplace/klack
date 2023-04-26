import React, { useEffect, useState } from "react";
import Draggable from "react-draggable";
import { ButtonGroup, IconButton, Radio, Stack } from "@mui/material";
import {
  PlayCircleFilledRounded,
  StopCircleRounded,
  Close,
} from "@mui/icons-material";
import { builder, sender } from "../messaging";
import { storage } from "../storage";

const useCameraBubbleSize = () => {
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 200,
    height: 200,
  });

  useEffect(() => {
    const checkSizeUpdate = async () => {
      const newSize = await storage.get.cameraBubbleSize();

      if (newSize.width === size.width && newSize.height === size.height) {
        setTimeout(() => {
          checkSizeUpdate().catch((err) => console.error(err));
        });
        return;
      }

      setSize({ ...newSize });
    };

    checkSizeUpdate().catch((err) => console.error(err));
  }, [size]);

  return size;
};

const SizeSelector = () => {
  const [selectedValue, setSelectedValue] = useState("200x200");

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
  const size = useCameraBubbleSize();

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

const StartStopRecording = () => {
  const [inProgress, setInProgress] = useState(false);

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

  return (
    <IconButton
      onClick={() => {
        sender
          .send(inProgress ? builder.stopRecording() : builder.startRecording())
          .catch((err) => console.error(err));
      }}
    >
      {inProgress ? <StopCircleRounded /> : <PlayCircleFilledRounded />}
    </IconButton>
  );
};

const RecordingControl = () => {
  return (
    <ButtonGroup>
      <StartStopRecording />
    </ButtonGroup>
  );
};

const CameraBubble = () => {
  return (
    <Draggable>
      <Stack
        sx={{
          position: "fixed",
          bottom: "100px",
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
