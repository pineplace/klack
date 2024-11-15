import React from "react";
import ReactDOM from "react-dom/client";
import PopupMenu from "./components/popup_menu";

const root = document.getElementById("root");

if (!root) {
  console.error(`Can't find element with id 'root'`);
} else {
  ReactDOM.createRoot(root).render(<PopupMenu />);
}
