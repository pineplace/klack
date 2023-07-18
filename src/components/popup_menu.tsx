import React, { useEffect, useState } from "react";
import { Button, ButtonGroup, Stack } from "@mui/material";
import { builder, sender } from "../messaging";
import { storage } from "../storage";

const ShowHideCameraBubble = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      storage.get
        .cameraBubbleVisible()
        .then(setIsVisible)
        .catch((err) => {
          if ((err as Error).message != "Extension context invalidated.") {
            console.error(err);
            return;
          }
          clearInterval(interval);
          console.log("Looks like extension was disabled, interval removed");
        });
    }, 500);

    return () => {
      clearInterval(interval);
    };
  });

  return (
    <Button
      onClick={() => {
        sender
          .send(
            isVisible ? builder.hideCameraBubble() : builder.showCameraBubble(),
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
    const interval = setInterval(() => {
      storage.get
        .microphoneAllowed()
        .then(setMicAllowed)
        .catch((err) => {
          if ((err as Error).message != "Extension context invalidated.") {
            console.error(err);
            return;
          }
          clearInterval(interval);
          console.log("Looks like extension was disabled, interval removed");
        });
    }, 500);

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
              : builder.allowMicrophone(),
          )
          .catch((err) => console.error(err));
      }}
    >
      {micAllowed ? "Disallow Mic" : "Allow Mic"}
    </Button>
  );
};

const RecordingControl = () => {
  const [inProgress, setInProgress] = useState(false);
  const [onPause, setOnPause] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      storage.get
        .recordingInProgress()
        .then(setInProgress)
        .catch((err) => {
          if ((err as Error).message != "Extension context invalidated.") {
            console.error(err);
            return;
          }
          clearInterval(interval);
          console.log("Looks like extension was disabled, interval removed");
        });
    }, 500);

    return () => {
      clearInterval(interval);
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      storage.get
        .recordingOnPause()
        .then(setOnPause)
        .catch((err) => {
          if ((err as Error).message != "Extension context invalidated.") {
            console.error(err);
            return;
          }
          clearInterval(interval);
          console.log("Looks like extension was disabled, interval removed");
        });
    }, 500);

    return () => {
      clearInterval(interval);
    };
  });

  return (
    <ButtonGroup>
      <Button
        onClick={() => {
          sender
            .send(
              inProgress ? builder.stopRecording() : builder.startRecording(),
            )
            .catch((err) => console.error(err));
        }}
      >
        {inProgress ? "Stop" : "Start"}
      </Button>
      {inProgress && (
        <Button
          onClick={() => {
            sender
              .send(
                onPause ? builder.resumeRecording() : builder.pauseRecording(),
              )
              .catch((err) => console.error(err));
          }}
        >
          {onPause ? "Resume" : "Pause"}
        </Button>
      )}
      {inProgress && (
        <Button
          onClick={() => {
            sender
              .send(builder.deleteRecording())
              .catch((err) => console.error(err));
          }}
        >
          Delete
        </Button>
      )}
    </ButtonGroup>
  );
};

const PopupMenu = () => {
  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      spacing={1}
    >
      <ShowHideCameraBubble />
      <TurnOnTurnOffMic />
      <RecordingControl />
    </Stack>
  );
};

export { PopupMenu as default };
