import React from "react";
import ReactDOM from "react-dom/client";
import Draggable from "react-draggable";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

// NOTE @imblowfish: https://www.npmjs.com/package/react-draggable

const Controls = () => {
  return (
    <Draggable>
      <Fab
        color='primary'
        aria-label='add'
      >
        <AddIcon />
      </Fab>
    </Draggable>
  );
};

const rootId = "rapidrec-controls";
const body = document.getElementsByTagName("body")[0];
const div = document.createElement("div");

div.id = rootId;
if (body) {
  body.prepend(div);
}

const root = ReactDOM.createRoot(document.getElementById(rootId));
root.render(<Controls />);
