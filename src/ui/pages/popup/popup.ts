import React from "react";
import ReactDOM from "react-dom/client";
import { Popup } from "./Popup";

const root = document.getElementById("root");

if (!root) {
  console.error(`Can't find element with id 'root'`);
} else {
  ReactDOM.createRoot(root).render(React.createElement(Popup));
}
