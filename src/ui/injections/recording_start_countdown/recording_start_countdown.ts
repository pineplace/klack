import React from "react";
import ReactDOM from "react-dom/client";
import { Injection, InjectionElementId } from "@/app/injections";
import RecordingStartCountdown from "./RecordingStartCountdown";

function inject() {
  if (document.getElementById(Injection.RecordingStartCounter)) {
    throw new Error("Current script already injected on this page");
  }

  const startCounterContainer = document.createElement("div");
  startCounterContainer.id = InjectionElementId.RecordingStartCounter;
  document.body.append(startCounterContainer);
  ReactDOM.createRoot(startCounterContainer).render(
    React.createElement(RecordingStartCountdown),
  );

  setTimeout(() => {
    startCounterContainer.remove();
  }, 3 * 1000);
}

try {
  inject();
} catch (err) {
  console.error(
    `[recording_start_counter_injection.ts] Injection has been failed: ${(err as Error).toString()}`,
  );
}
