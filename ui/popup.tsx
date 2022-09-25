import React from "react";
import ReactDOM from "react-dom/client";
import { Button, ButtonGroup } from "@mui/material";

import { Mode } from "../islands/enums";
import { Request } from "../islands/types";

const App = () => {
  const sendRequest = (req: Request) => {
    chrome.runtime
      .sendMessage(req)
      .catch((err: DOMException) =>
        console.error(`Can't sendMessage ${JSON.stringify(err)}`)
      );
  };

  return (
    <>
      <ButtonGroup variant='contained'>
        <Button onClick={() => sendRequest({ mode: Mode.SCREEN_AND_CAMERA })}>
          Screen & Camera
        </Button>
      </ButtonGroup>
    </>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as Element | DocumentFragment
);
root.render(<App />);
