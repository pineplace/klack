import React from "react";
import ReactDOM from "react-dom/client";

import { PopupMenu } from "./components/popup_menu";

const App = () => {
  return <PopupMenu />;
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as Element | DocumentFragment
);
root.render(<App />);
