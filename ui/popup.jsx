import React from "react";
import ReactDOM from "react-dom/client";
import { Button, ButtonGroup } from "@mui/material";

import modes from "../islands/modes.mjs";

const App = () => {
  return (
    <>
      <ButtonGroup variant='contained'>
        <Button
          onClick={() =>
            chrome.runtime.sendMessage({ mode: modes.SCREEN_AND_CAMERA })
          }
        >
          Screen & Camera
        </Button>
      </ButtonGroup>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
