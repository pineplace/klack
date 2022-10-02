import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { Button, ButtonGroup, Stack } from "@mui/material";

import { RecordMode, RecordState } from "../islands/enums";
import { Request, Response } from "../islands/types";

const App = () => {
  const [recInProgress, setRecInProgress] = useState(false);

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
          disabled
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
          const state = recInProgress ? RecordState.Stop : RecordState.Start;
          sendRequest({ recordState: state })
            .then((resp) => {
              console.log(JSON.stringify(resp));
              setRecInProgress(state === RecordState.Start);
            })
            .catch((err) => console.error(err));
        }}
      >
        {recInProgress ? "Stop Record" : "Start Record"}
      </Button>
    </Stack>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as Element | DocumentFragment
);
root.render(<App />);
