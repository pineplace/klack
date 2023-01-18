import React from "react";
import ReactDOM from "react-dom/client";
import CameraBubble from "../components/camera_bubble";

const div = document.createElement("div");
div.id = "rapidrec-camera-bubble";
document.body.append(div);
ReactDOM.createRoot(div).render(React.createElement(CameraBubble));
