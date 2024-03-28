import React from "react";
import ReactDOM from "react-dom/client";
import RecordingStartCountdown from "../components/recording_start_countdown";

if (!document.getElementById("rapidrec-recording-start-countdown")) {
  const div = document.createElement("div");
  div.id = "rapidrec-recording-start-countdown";
  document.body.append(div);
  ReactDOM.createRoot(div).render(React.createElement(RecordingStartCountdown));
}

setTimeout(() => {
  document.getElementById("rapidrec-recording-start-countdown")?.remove();
}, 3 * 1000);
