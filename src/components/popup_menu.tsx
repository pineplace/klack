import React, { useState } from "react";
import { Button, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";

import {
  Method,
  RecMode,
  RecSetMode,
  RecStart,
  RecStop,
  sendMessage,
} from "../rapidrec/communication";

export const PopupMenu = () => {
  const [mode, setMode] = useState(RecMode.ScreenOnly);
  const [inProgress, setInProgress] = useState(false);

  return (
    <Stack
      direction='column'
      alignItems='center'
      justifyContent='center'
      spacing={1}
    >
      <ToggleButtonGroup
        color='primary'
        value={mode}
        onChange={(_event, newMode: RecMode) => {
          if (!newMode) {
            return;
          }
          setMode(newMode);
        }}
        exclusive
      >
        <ToggleButton
          value={RecMode.ScreenAndCam}
          onClick={() => {
            sendMessage({
              method: Method.RecSetMode,
              params: { mode: RecMode.ScreenAndCam },
            } as RecSetMode)
              .then((response) => console.log(JSON.stringify(response)))
              .catch((err) => console.error(err));
          }}
        >
          Screen & Cam
        </ToggleButton>
        <ToggleButton
          value={RecMode.ScreenOnly}
          onClick={() => {
            sendMessage({
              method: Method.RecSetMode,
              params: { mode: RecMode.ScreenOnly },
            } as RecSetMode)
              .then((response) => console.log(JSON.stringify(response)))
              .catch((err) => console.error(err));
          }}
        >
          Screen Only
        </ToggleButton>
      </ToggleButtonGroup>
      <Button
        onClick={() => {
          sendMessage({
            method: inProgress ? Method.RecStop : Method.RecStart,
          } as RecStart | RecStop)
            .then((response) => {
              console.log(JSON.stringify(response));
            })
            .catch((err) => console.error(err));
          setInProgress((prevValue) => !prevValue);
        }}
      >
        {inProgress ? "Stop" : "Start"}
      </Button>
    </Stack>
  );
};
