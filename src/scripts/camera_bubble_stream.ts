import React from "react";
import ReactDOM from "react-dom/client";
import CameraBubbleStream from "../components/camera_bubble_stream";

const div = document.createElement("div");
document.body.append(div);
ReactDOM.createRoot(div).render(React.createElement(CameraBubbleStream));
