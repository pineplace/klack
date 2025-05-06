import React, { useRef, useState, useEffect, ReactNode } from "react";

export const Draggable = ({
  children,
  x,
  y,
  onDragStop,
}: {
  children: ReactNode;
  x?: number;
  y?: number;
  onDragStop?: (x: number, y: number) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const [position, setPosition] = useState({
    x: x || 100,
    y: y || 100,
  });
  const [dragging, setDragging] = useState(false);

  // NOTE: We need to sync internal change if props change.
  //       Otherwise the `Draggable` will always mount at `{ x: 100, y: 100 }`
  useEffect(() => {
    if (!dragging) {
      setPosition({ x: x || 100, y: y || 100 });
    }
  }, [x, y, dragging]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!dragging) {
        return;
      }
      setPosition({
        x: event.clientX - offsetRef.current.x,
        y: event.clientY - offsetRef.current.y,
      });
    };

    const handleMouseUp = () => {
      onDragStop?.(position.x, position.y);
      setDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, position, onDragStop]);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    offsetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    setDragging(true);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      className="fixed z-[9999] cursor-grab active:cursor-grabbing"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      {children}
    </div>
  );
};
