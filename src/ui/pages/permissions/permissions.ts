import React from "react";
import ReactDOM from "react-dom/client";
import { Permissions } from "./Permissions";

const root = document.getElementById("root");

if (!root) {
  console.error("Can't find element with id 'root");
} else {
  ReactDOM.createRoot(root).render(React.createElement(Permissions));
}
