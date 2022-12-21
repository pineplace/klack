import React, { useEffect, useState } from "react";
import Draggable from "react-draggable";
import { Avatar, ButtonGroup, IconButton, Stack } from "@mui/material";
import PlayCircleFilledRounded from "@mui/icons-material/PlayCircleFilledRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import CameraRoundedIcon from "@mui/icons-material/CameraRounded";
import { builder, sender } from "../messaging";

const CameraStream = () => {
  const [source, setSource] = useState<MediaStream | undefined>();

  const createCameraStream = async () => {
    return await navigator.mediaDevices.getUserMedia({
      // audio: true,
      video: {
        width: 200,
        height: 200,
        facingMode: "environment",
      },
    });
  };

  useEffect(() => {
    createCameraStream()
      .then((mediaStream) => {
        setSource(mediaStream);
      })
      .catch((err) => console.error(err));
  }, []);

  if (source) {
    return (
      <Avatar
        sx={{ width: 200, height: 200 }}
        component='video'
        ref={(ref: HTMLVideoElement) => {
          if (!ref) {
            return;
          }
          ref.srcObject = source;
          ref.autoplay = true;
        }}
      />
    );
  }
  return (
    <Avatar sx={{ width: 200, height: 200 }}>
      <CameraRoundedIcon />
    </Avatar>
  );
};

const StartStopRecording = () => {
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    const checkInProgress = () => {
      sender
        .send(builder.getter.recordingInProgress())
        .then((response) => {
          if (!response) {
            return;
          }
          if (response.error) {
            throw new Error(response.error);
          }
          setInProgress((response.result as boolean) ?? inProgress);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    const interval = setInterval(checkInProgress, 500);
    return () => {
      clearInterval(interval);
    };
  });

  return (
    <IconButton
      onClick={() => {
        sender
          .send(inProgress ? builder.stopRecording() : builder.startRecording())
          .catch((err) => console.error(err));
      }}
    >
      {inProgress ? <StopCircleRoundedIcon /> : <PlayCircleFilledRounded />}
    </IconButton>
  );
};

const RecordingControl = () => {
  return (
    <ButtonGroup>
      <StartStopRecording />
    </ButtonGroup>
  );
};

const CameraBubble = () => {
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
        <CameraStream />
        <RecordingControl />
      </Stack>
    </Draggable>
  );
};

export { CameraBubble as default };
