import React, { useEffect, useState } from "react";
import { Button, Stack } from "@mui/material";
import { builder, sender } from "../messaging";

const ShowHideCameraBubble = () => {
  const [isHidden, setIsHidden] = useState(true);

  return (
    <Button
      onClick={() => {
        sender
          .send(
            isHidden ? builder.showCameraBubble() : builder.hideCameraBubble()
          )
          .catch((err) => console.error(err));

        setIsHidden(!isHidden);
      }}
    >
      {isHidden ? "Show bubble" : "Hide bubble"}
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
        setInProgress((response.result as boolean) ?? inProgress);
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
