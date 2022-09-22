import React from "react";
import ReactDOM from "react-dom/client";
import { Button, ButtonGroup } from "@mui/material";

// https://developer.chrome.com/docs/extensions/reference/
// https://mui.com/material-ui/
// https://stackoverflow.com/questions/56592426/inject-js-only-on-specific-tab-on-chrome-extension

const App = () => {
  const onScreenAndCameraClick = () => {
    chrome.tabs
      .query({
        active: true,
        currentWindow: true,
      })
      .then(([tab]) => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["./public/controls.bundle.mjs"],
        });
      });
  };

  return (
    <>
      <ButtonGroup variant='contained'>
        <Button onClick={onScreenAndCameraClick}>Screen & Camera</Button>
      </ButtonGroup>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
