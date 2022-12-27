import React, { useEffect, useState } from "react";
import { Button, Stack } from "@mui/material";
import { builder, sender } from "../messaging";

const ShowHideCameraBubble = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    sender
      .send(builder.getter.isCameraBubbleVisible())
      .then((response) => {
        if (!response) {
          return;
        }
        if (response.error) {
          throw new Error(response.error);
        }
        setIsVisible(response.result as boolean);
      })
      .catch((err) => {
        console.error(err);
      });
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

const StartStopRecording = () => {
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    sender
      .send(builder.getter.recordingInProgress())
      .then((response) => {
        if (!response) {
          return;
        }
        if (response.error) {
          throw new Error(response.error);
        }
        setInProgress(response.result as boolean);
      })
      .catch((err) => {
        console.error(err);
      });
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
      direction='column'
      alignItems='center'
      justifyContent='center'
      spacing={1}
    >
      <ShowHideCameraBubble />
      <StartStopRecording />
    </Stack>
  );
};

export { PopupMenu as default };
