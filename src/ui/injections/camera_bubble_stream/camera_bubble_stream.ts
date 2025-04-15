import React from "react";
import ReactDOM from "react-dom/client";
import CameraBubbleStream from "./CameraBubbleStream";

const div = document.createElement("div");
document.body.append(div);
ReactDOM.createRoot(div).render(React.createElement(CameraBubbleStream));
