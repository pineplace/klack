import React from "react";
import ReactDOM from "react-dom/client";
import { Button, ButtonGroup } from "@mui/material";

// https://developer.chrome.com/docs/extensions/reference/
// https://mui.com/material-ui/
// https://stackoverflow.com/questions/56592426/inject-js-only-on-specific-tab-on-chrome-extension

const App = () => {
  return (
    <>
      <ButtonGroup variant='contained'>
        <Button
          onClick={() => chrome.runtime.sendMessage({ mode: "Screen&Camera" })}
        >
          Screen & Camera
        </Button>
      </ButtonGroup>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
