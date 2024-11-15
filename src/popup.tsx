import React from "react";
import ReactDOM from "react-dom/client";
import PopupMenu from "./components/popup_menu";
import { database } from "./database";

const root = document.getElementById("root");

async function showDatabase() {
  await database.recordings.each((recording) => {
    console.info(`(popup.ts) recording ${JSON.stringify(recording)}`);
  });
}

showDatabase().catch((err) => console.error(err));

if (!root) {
  console.error(`Can't find element with id 'root'`);
} else {
  ReactDOM.createRoot(root).render(<PopupMenu />);
}
