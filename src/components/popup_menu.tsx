import React, { useEffect, useState } from "react";
import { Button, Stack } from "@mui/material";
import { builder, sender } from "../messaging";

const ShowHideCameraBubble = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkIsCameraVisible = () => {
      sender
        .send(builder.getter.isCameraBubbleVisible())
        .then((response) => {
          if (!response) {
            return;
          }
          if (response.error) {
            throw new Error(response.error);
          }
          setIsVisible(response.result as boolean);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    const interval = setInterval(checkIsCameraVisible, 500);
    return () => {
      clearInterval(interval);
    };
  });

  return (
    <Button
      onClick={() => {
        sender
          .send(
            isVisible ? builder.hideCameraBubble() : builder.showCameraBubble()
          )
          .catch((err) => console.error(err));
      }}
    >
      {isVisible ? "Hide bubble" : "Show bubble"}
    </Button>
  );
};

const TurnOnTurnOffMic = () => {
  const [micAllowed, setMicAllowed] = useState(false);

  useEffect(() => {
    const checkTurnedOn = () => {
      sender
        .send(builder.getter.isMicrophoneAllowed())
        .then((response) => {
          if (!response) {
            return;
          }
          if (response.error) {
            throw new Error(response.error);
          }
          setMicAllowed(response.result as boolean);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    const interval = setInterval(checkTurnedOn, 500);
    return () => {
      clearInterval(interval);
    };
  });

  return (
    <Button
      onClick={() => {
        sender
          .send(
            micAllowed
              ? builder.disallowMicrophone()
              : builder.allowMicrophone()
          )
          .catch((err) => console.error(err));
      }}
    >
      {micAllowed ? "Disallow Mic" : "Allow Mic"}
    </Button>
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
          setInProgress(response.result as boolean);
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
    <Button
      onClick={() => {
        sender
          .send(inProgress ? builder.stopRecording() : builder.startRecording())
          .catch((err) => console.error(err));
      }}
    >
      {inProgress ? "Stop" : "Start"}
    </Button>
  );
};

const PopupMenu = () => {
  return (
    <Stack
      direction='column'
      alignItems='center'
      justifyContent='center'
      spacing={1}
    >
      <ShowHideCameraBubble />
      <TurnOnTurnOffMic />
      <StartStopRecording />
    </Stack>
  );
};

export { PopupMenu as default };
