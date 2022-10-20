import React from "react";
import ReactDOM from "react-dom/client";

import { Menu } from "./components/menu";

const App = () => {
  return <Menu />;
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as Element | DocumentFragment
);
root.render(<App />);
