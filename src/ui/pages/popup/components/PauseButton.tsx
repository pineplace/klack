import React from "react";

export const PauseButton = (
  props: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">,
) => {
  return (
    <button
      className="bg-klack-red-500 hover:bg-klack-red-600 active:bg-klack-red-500 flex size-[64px] items-center justify-center rounded-full"
      {...props}
    >
      <div className="flex size-[32px] flex-row-reverse items-center justify-center gap-x-2 px-[6px] py-1">
        <div className="relative h-[25px] w-[7px] bg-white"></div>
        <div className="relative h-[25px] w-[7px] bg-white"></div>
      </div>
    </button>
  );
};
PauseButton.displayName = "PauseButton";
