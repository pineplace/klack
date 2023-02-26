import React, { useEffect, useState } from "react";
import Draggable from "react-draggable";
import { ButtonGroup, IconButton, Stack } from "@mui/material";
import PlayCircleFilledRounded from "@mui/icons-material/PlayCircleFilledRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import { builder, sender } from "../messaging";
import { storage } from "../storage";

const CameraBubbleFrame = () => {
  return (
    <iframe
      style={{
        pointerEvents: "none",
        width: 200,
        height: 200,
        border: 0,
        display: "block",
        overflow: "hidden",
        borderRadius: "50%",
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
        .then(setInProgress)
        .catch((err) => console.error(err));
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
      {inProgress ? <StopCircleRoundedIcon /> : <PlayCircleFilledRounded />}
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
        <CameraBubbleFrame />
        <RecordingControl />
      </Stack>
    </Draggable>
  );
};

export { CameraBubble as default };
