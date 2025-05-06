import React from "react";
import { StorageKey } from "@/app/storage";
import useStorageValue from "@/ui/hooks/useStorageValue";
import { Draggable } from "./components/Draggable";

export const CameraBubble = () => {
  const [position, setPosition] = useStorageValue(
    StorageKey.UiCameraBubblePosition,
    {
      x: 100,
      y: 100,
    },
  );
  const [size] = useStorageValue(StorageKey.UiCameraBubbleSize, {
    width: 250,
    height: 250,
  });

  return (
    <Draggable
      x={position?.x}
      y={position?.y}
      onDragStop={(x, y) => {
        setPosition({ x, y });
      }}
    >
      <div
        className="select-none"
        style={{
          width: size?.width,
          height: size?.height,
        }}
      >
        <iframe
          className="pointer-events-none h-full w-full overflow-hidden rounded-full border-0"
          allow="camera"
          src={chrome.runtime.getURL("./camera_bubble_stream.html")}
        />
      </div>
    </Draggable>
  );
};
