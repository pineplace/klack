import React, { useState, useEffect } from "react";
import Draggable from "react-draggable";
import { Avatar, ButtonGroup, IconButton } from "@mui/material";
import { Stack } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CameraRoundedIcon from "@mui/icons-material/CameraRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import PauseCircleFilledRoundedIcon from "@mui/icons-material/PauseCircleFilledRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

import {
  Method,
  RecStart,
  RecStop,
  sendMessage,
} from "../rapidrec/communication";
import {
  CameraCaptureProperties,
  createCameraStream,
} from "../browser-side/stream";

// FIXME: I don't like it, get rid of it
const cameraCaptureProperties: CameraCaptureProperties = {
  width: 200,
  height: 200,
};

// NOTE @imblowfish: https://www.npmjs.com/package/react-draggable
export const CameraBubble = () => {
  const [cameraSrc, setCameraSrc] = useState<MediaStream | null>(null);
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    createCameraStream(cameraCaptureProperties)
      .then((stream) => {
        console.log("Set camera source", stream);
        setCameraSrc(stream);
      })
      .catch((err) => console.error("Can't capture camera stream", err));
  }, []);

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
        {cameraSrc ? (
          <Avatar
            sx={cameraCaptureProperties}
            component='video'
            ref={(ref: HTMLVideoElement) => {
              ref.srcObject = cameraSrc;
              ref.autoplay = true;
            }}
          />
        ) : (
          <Avatar sx={cameraCaptureProperties}>
            <CameraRoundedIcon fontSize='large' />
          </Avatar>
        )}
        <ButtonGroup>
          <IconButton disabled={!inProgress}>
            <DeleteRoundedIcon fontSize='large' />
          </IconButton>
          <IconButton
            onClick={() => {
              if (!inProgress) {
                sendMessage({
                  method: Method.RecStart,
                } as RecStart)
                  .then((response) => console.log(response))
                  .catch((err) => console.error(err));
              }
              setInProgress((value) => !value);
            }}
          >
            {inProgress ? (
              <PauseCircleFilledRoundedIcon fontSize='large' />
            ) : (
              <PlayCircleFilledRoundedIcon fontSize='large' />
            )}
          </IconButton>
          <IconButton
            disabled={!inProgress}
            onClick={() => {
              sendMessage({
                method: Method.RecStop,
              } as RecStop)
                .then((response) => console.log(response))
                .catch((err) => console.error(err));
            }}
          >
            <StopCircleRoundedIcon fontSize='large' />
          </IconButton>
        </ButtonGroup>
      </Stack>
    </Draggable>
  );
};
