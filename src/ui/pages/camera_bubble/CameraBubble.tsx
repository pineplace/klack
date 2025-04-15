import React, { useRef } from "react";
import Draggable from "react-draggable";
import { ButtonGroup, IconButton, Radio, Stack } from "@mui/material";
import {
  Delete,
  PlayCircleFilledRounded,
  StopCircleRounded,
  Close,
  PauseCircleFilledRounded,
} from "@mui/icons-material";
import { RecordingState, StorageKey, StorageValueType } from "@/app/storage";
import { sender } from "@/app/messaging";
import useStorageValue from "@/ui/hooks/useStorageValue";

const CameraBubbleControls = () => {
  const [cameraBubbleEnabled] = useStorageValue(
    StorageKey.UiCameraBubbleEnabled,
  );
  const [cameraBubbleSize, setCameraBubbleSize] = useStorageValue(
    StorageKey.UiCameraBubbleSize,
    { width: 200, height: 200 },
  );

  const onCameraBubbleSizeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (
      `${cameraBubbleSize?.width}x${cameraBubbleSize?.height}` ===
      event.target.value
    ) {
      return;
    }

    const [width, height] = event.target.value
      .split("x")
      .map((value) => Number(value));

    setCameraBubbleSize({ width, height });
  };

  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
    >
      {cameraBubbleEnabled ? (
        <IconButton
          onClick={() => {
            sender.background.cameraBubbleHide().catch((err) => {
              console.error(
                `Cannot hide camera bubble: ${(err as Error).toString()}`,
              );
            });
          }}
        >
          <Close />
        </IconButton>
      ) : undefined}
      <ButtonGroup>
        <Radio
          value="200x200"
          size="small"
          checked={
            `${cameraBubbleSize?.width}x${cameraBubbleSize?.height}` ===
            "200x200"
          }
          onChange={onCameraBubbleSizeChange}
        />
        <Radio
          value="300x300"
          checked={
            `${cameraBubbleSize?.width}x${cameraBubbleSize?.height}` ===
            "300x300"
          }
          onChange={onCameraBubbleSizeChange}
        />
      </ButtonGroup>
    </Stack>
  );
};

const CameraBubbleVideo = () => {
  const [cameraBubbleSize] = useStorageValue(StorageKey.UiCameraBubbleSize, {
    width: 200,
    height: 200,
  });

  return (
    <iframe
      style={{
        pointerEvents: "none",
        border: 0,
        display: "block",
        overflow: "hidden",
        borderRadius: "50%",
        ...cameraBubbleSize,
      }}
      allow="camera"
      src={chrome.runtime.getURL("camera_bubble_stream.html")}
      // FIXME: `scrolling` property is deprecated, but I didn't found another solution
      //        I tried to replace it with `overflow: hidden`, but it doesn't work
      scrolling="no"
    />
  );
};

const RecordingControls = () => {
  const [recordingState] = useStorageValue(StorageKey.RecordingState);

  const handleStart = () => {
    sender.background.recordingStart().catch((err) => {
      console.error(`Cannot start recording: ${(err as Error).toString()}`);
    });
  };

  const handleStop = () => {
    sender.background.recordingStop().catch((err) => {
      console.error(`Cannot stop recording: ${(err as Error).toString()}`);
    });
  };

  const handlePause = () => {
    sender.background.recordingPause().catch((err) => {
      console.error(`Cannot pause recording: ${(err as Error).toString()}`);
    });
  };

  const handleResume = () => {
    sender.background.recordingResume().catch((err) => {
      console.error(`Cannot resume recording: ${(err as Error).toString()}`);
    });
  };

  const handleCancel = () => {
    sender.background.recordingCancel().catch((err) => {
      console.error(`Cannot cancel recording: ${(err as Error).toString()}`);
    });
  };

  return (
    <ButtonGroup>
      {recordingState === RecordingState.NotStarted ? (
        <IconButton onClick={handleStart}>
          <PlayCircleFilledRounded />
        </IconButton>
      ) : undefined}
      {recordingState == RecordingState.InProgress ? (
        <>
          <IconButton onClick={handlePause}>
            <PauseCircleFilledRounded />
          </IconButton>
          <IconButton onClick={handleStop}>
            <StopCircleRounded />
          </IconButton>
          <IconButton onClick={handleCancel}>
            <Delete />
          </IconButton>
        </>
      ) : undefined}
      {recordingState == RecordingState.OnPause ? (
        <>
          <IconButton onClick={handleResume}>
            <PlayCircleFilledRounded />
          </IconButton>
          <IconButton onClick={handleStop}>
            <StopCircleRounded />
          </IconButton>
          <IconButton onClick={handleCancel}>
            <Delete />
          </IconButton>
        </>
      ) : undefined}
    </ButtonGroup>
  );
};

const CameraBubble = (props: {
  initialPosition?: StorageValueType<StorageKey.UiCameraBubblePosition>;
}) => {
  const refStack = useRef<HTMLDivElement | null>(null);
  const [cameraBubblePosition, setCameraBubblePosition] = useStorageValue(
    StorageKey.UiCameraBubblePosition,
    props.initialPosition,
  );
  // TODO: Return microphone indicator
  // const [microphoneLevel, setMicrophoneLevel] = useState(0);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     storage.devices.mic.volume
  //       .get()
  //       .then((microphoneLevel) => {
  //         setMicrophoneLevel(microphoneLevel);
  //       })
  //       .catch((err) => console.error(err));
  //   });

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);

  return (
    <Draggable
      onStop={() => {
        if (!refStack.current) {
          return;
        }
        const boundingRect = refStack.current.getBoundingClientRect();
        setCameraBubblePosition({
          x: boundingRect.x,
          y: boundingRect.y,
        });
      }}
    >
      <Stack
        ref={refStack}
        sx={{
          position: "fixed",
          left: cameraBubblePosition?.x || 0,
          top: cameraBubblePosition?.y || 0,
          zIndex: 2147483647,
          userSelect: "none",
        }}
        direction="column"
        alignItems="center"
        justifyContent="center"
        spacing={1}
      >
        <CameraBubbleControls />
        <CameraBubbleVideo />
        <RecordingControls />
        {/* <RecordingDuration /> */}
        {/* <Typography>Microphone indication: {microphoneLevel}</Typography> */}
      </Stack>
    </Draggable>
  );
};

export default CameraBubble;
