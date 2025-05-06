import React, { forwardRef } from "react";

export const RecButton = forwardRef<
  HTMLButtonElement,
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">
>((props, ref) => {
  return (
    <button
      ref={ref}
      className="bg-klack-red-500 hover:bg-klack-red-600 active:bg-klack-red-500 flex size-[64px] items-center justify-center rounded-full"
      {...props}
    >
      <div className="relative size-[52px] rounded-[100%] border-4 border-white"></div>
    </button>
  );
});
RecButton.displayName = "RecButton";
