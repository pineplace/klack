import React, { forwardRef } from "react";

export const PlayButton = forwardRef<
  HTMLButtonElement,
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">
>((props, ref) => {
  return (
    <button
      ref={ref}
      className="bg-klack-charcoal-700 hover:bg-klack-charcoal-800 active:bg-klack-charcoal-700 flex size-[64px] items-center justify-center rounded-full pl-[5px]"
      {...props}
    >
      <div className="[height:0] [width:0] [border-bottom:16px_solid_transparent] [border-left:25px_solid_white] [border-top:16px_solid_transparent]" />
    </button>
  );
});
PlayButton.displayName = "PlayButton";
