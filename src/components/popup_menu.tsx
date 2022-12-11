import React, { useState } from "react";
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
  const [label, setLabel] = useState("Start");
  return (
    <Button
      onClick={() => {
        sender
          .send(
            label === "Start"
              ? builder.startRecording()
              : builder.stopRecording()
          )
          .catch((err) => console.error(err));

        setLabel(label === "Start" ? "Stop" : "Start");
      }}
    >
      {label}
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
