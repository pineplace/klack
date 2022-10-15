import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import Draggable from "react-draggable";
import { Avatar, ButtonGroup, IconButton } from "@mui/material";
import { Stack } from "@mui/system";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CameraRoundedIcon from "@mui/icons-material/CameraRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import PauseCircleFilledRoundedIcon from "@mui/icons-material/PauseCircleFilledRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

import { camViewAndControlsId } from "../config";

// NOTE @imblowfish: https://www.npmjs.com/package/react-draggable
const Controls = () => {
  const [isPlay, setIsPlay] = useState(false);

  return (
    <Draggable>
      <Stack
        sx={{
          position: "fixed",
          bottom: "100px",
          zIndex: 2147483647,
        }}
        direction='column'
        alignItems='center'
        justifyContent='center'
        spacing={1}
      >
        <IconButton>
          <CloseRoundedIcon fontSize='large' />
        </IconButton>
        <Avatar sx={{ width: 200, height: 200 }}>
          <CameraRoundedIcon fontSize='large' />
        </Avatar>
        <ButtonGroup>
          <IconButton disabled={!isPlay}>
            <DeleteRoundedIcon fontSize='large' />
          </IconButton>
          <IconButton onClick={() => setIsPlay((value) => !value)}>
            {isPlay ? (
              <PauseCircleFilledRoundedIcon fontSize='large' />
            ) : (
              <PlayCircleFilledRoundedIcon fontSize='large' />
            )}
          </IconButton>
          <IconButton disabled={!isPlay}>
            <StopCircleRoundedIcon fontSize='large' />
          </IconButton>
        </ButtonGroup>
      </Stack>
    </Draggable>
  );
};

const body = document.getElementsByTagName("body")[0];
const div = document.createElement("div");
div.id = camViewAndControlsId;
if (body) {
  body.prepend(div);
}

const root = ReactDOM.createRoot(
  document.getElementById(div.id) as Element | DocumentFragment
);
root.render(<Controls />);
