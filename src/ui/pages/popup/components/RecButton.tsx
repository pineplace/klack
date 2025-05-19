import React from "react";

export const RecButton = (
  props: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">,
) => {
  return (
    <button
      className="bg-klack-red-500 hover:bg-klack-red-600 active:bg-klack-red-500 flex size-[64px] items-center justify-center rounded-full"
      {...props}
    >
      <div className="relative size-[52px] rounded-[100%] border-4 border-white"></div>
    </button>
  );
};
RecButton.displayName = "RecButton";
