import React from "react";
import ReactDOM from "react-dom/client";
import { Button, ButtonGroup, Stack } from "@mui/material";

import { RecordMode, RecordState } from "../islands/enums";
import { Request, Response } from "../islands/types";

const App = () => {
  const sendRequest = async (req: Request): Promise<Response> => {
    return await chrome.runtime.sendMessage(req);
  };

  return (
    <Stack
      direction='column'
      alignItems='center'
      justifyContent='center'
      spacing={1}
    >
      <ButtonGroup variant='contained'>
        <Button
          onClick={() => {
            sendRequest({ recordMode: RecordMode.ScreenAndCam })
              .then((resp) => console.log(JSON.stringify(resp)))
              .catch((err) => console.error(err));
          }}
        >
          Screen & Cam
        </Button>
        <Button
          onClick={() => {
            sendRequest({ recordMode: RecordMode.ScreenOnly })
              .then((resp) => console.log(JSON.stringify(resp)))
              .catch((err) => console.error(err));
          }}
        >
          Screen Only
        </Button>
      </ButtonGroup>
      <Button
        onClick={() => {
          sendRequest({ recordState: RecordState.Start })
            .then((resp) => console.log(JSON.stringify(resp)))
            .catch((err) => console.error(err));
        }}
      >
        Start Record
      </Button>
    </Stack>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as Element | DocumentFragment
);
root.render(<App />);
