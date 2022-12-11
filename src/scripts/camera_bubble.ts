import React from "react";
import ReactDOM from "react-dom/client";
import CameraBubble from "../components/camera_bubble";

const div = document.createElement("div");
div.id = "rapidrec-camera-bubble";

const body = document.getElementsByTagName("body")[0];
if (body) {
  body.prepend(div);
  ReactDOM.createRoot(div).render(React.createElement(CameraBubble));
}
