/**
 * This code implements the creation on the current tab of the component
 * to display the camera bubble
 */
import React from "react";
import ReactDOM from "react-dom/client";

import { cameraBubbleId } from "../rapidrec/identifiers";
import { CameraBubble } from "../components/camera_bubble";

const body = document.getElementsByTagName("body")[0];
const div = document.createElement("div");
div.id = cameraBubbleId;
if (body) {
  body.prepend(div);
}

const root = ReactDOM.createRoot(
  document.getElementById(div.id) as Element | DocumentFragment
);
root.render(<CameraBubble />);
