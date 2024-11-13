import React from "react";
import ReactDOM from "react-dom/client";
import CameraBubble from "../components/camera_bubble";
import { storage } from "../storage";

async function injectCameraBubble() {
  if (!document.getElementById("klack-camera-bubble")) {
    /* NOTE: `@emotion/react` library used by `@mui` as a style library sets the value in
     *       `globalThis` to define double import. This is ok in case of normal use of `@mui`
     *       in web UI.
     *       But when show/hide the camera bubble via Chrome code injection, we expect
     *       the component using `@mui` to be injected and removed multiple times.
     *       Setting the value to `globalThis` in such a situation results in warning,
     *       which is displayed to the user in the `Errors` tab for extension.
     *       For this purpose, such a hack was invented
     *
     *       Problem is the same as https://github.com/imblowfish/klack/issues/118,
     *       but this fix is specific to sites that use material ui and you need to clear `global` before injecting
     *
     *       More info: https://github.com/imblowfish/klack/issues/143
     */
    const re = new RegExp(/__EMOTION_REACT_\d+__/);
    const emotionKey = Object.keys(globalThis).find((key) => re.test(key));
    if (emotionKey) {
      // @ts-expect-error `glob[alThis` uses `any`, we're trying to set the key to `string`, TS doesn't like that
      globalThis[emotionKey] = false;
    }

    const cameraBubblePosition = await storage.get.cameraBubblePosition();

    const div = document.createElement("div");
    div.id = "klack-camera-bubble";
    document.body.append(div);
    ReactDOM.createRoot(div).render(
      React.createElement(CameraBubble, {
        cameraBubblePosition,
      }),
    );
  }
}

injectCameraBubble().catch((err) => console.error(err));
