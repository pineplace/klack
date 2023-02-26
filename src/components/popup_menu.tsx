import React, { useEffect, useState } from "react";
import { Button, Stack } from "@mui/material";
import { builder, sender } from "../messaging";
import { storage } from "../storage";

const ShowHideCameraBubble = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      storage.get
        .cameraBubbleVisible()
        .then(setIsVisible)
        .catch((err) => console.error(err));
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
            isVisible ? builder.hideCameraBubble() : builder.showCameraBubble()
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
        .catch((err) => console.error(err));
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
              : builder.allowMicrophone()
          )
          .catch((err) => console.error(err));
      }}
    >
      {micAllowed ? "Disallow Mic" : "Allow Mic"}
    </Button>
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
    <Button
      onClick={() => {
        sender
          .send(inProgress ? builder.stopRecording() : builder.startRecording())
          .catch((err) => console.error(err));
      }}
    >
      {inProgress ? "Stop" : "Start"}
    </Button>
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
      <StartStopRecording />
    </Stack>
  );
};

export { PopupMenu as default };
