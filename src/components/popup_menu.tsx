import React from "react";
import { Button, ButtonGroup, Stack } from "@mui/material";

import {
  Method,
  RecSetMode,
  RecStart,
  sendMessage,
} from "../rapidrec/communication";
import { RecMode } from "../rapidrec/modes";

export const PopupMenu = () => {
  return (
    <Stack
      direction='column'
      alignItems='center'
      justifyContent='center'
      spacing={1}
    >
      <ButtonGroup variant='contained'>
        <Button
          disabled
          onClick={() => {
            sendMessage({
              method: Method.RecSetMode,
              params: {
                mode: RecMode.ScreenAndCam,
              },
            } as RecSetMode)
              .then((resp) => console.log(JSON.stringify(resp)))
              .catch((err) => console.error(err));
          }}
        >
          Screen & Cam
        </Button>
        <Button
          onClick={() => {
            sendMessage({
              method: Method.RecSetMode,
              params: {
                mode: RecMode.ScreenOnly,
              },
            } as RecSetMode)
              .then((resp) => console.log(JSON.stringify(resp)))
              .catch((err) => console.error(err));
          }}
        >
          Screen Only
        </Button>
      </ButtonGroup>
      <Button
        onClick={() => {
          sendMessage({
            method: Method.RecStart,
          } as RecStart)
            .then((resp) => console.log(JSON.stringify(resp)))
            .catch((err) => console.error(err));
        }}
      >
        Start Record
      </Button>
    </Stack>
  );
};
