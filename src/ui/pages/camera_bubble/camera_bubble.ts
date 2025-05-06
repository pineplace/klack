import React from "react";
import ReactDOM from "react-dom/client";
import { Injection, InjectionElementId } from "@/app/injections";
import { storage } from "@/app/storage";
import { CameraBubble } from "./CameraBubble";

async function inject() {
  if (document.getElementById(Injection.CameraBubble)) {
    throw new Error("Current script already injected on this page");
  }

  const cameraBubbleContainer = document.createElement("div");
  cameraBubbleContainer.id = InjectionElementId.CameraBubble;

  const shadowRoot = cameraBubbleContainer.attachShadow({ mode: "open" });
  const linkElement = document.createElement("link");
  linkElement.href = chrome.runtime.getURL("./klack_tailwind_global.css");
  linkElement.rel = "stylesheet";
  shadowRoot.append(linkElement);

  document.body.append(cameraBubbleContainer);
  ReactDOM.createRoot(shadowRoot).render(
    React.createElement(CameraBubble, {
      initialPosition: await storage.ui.cameraBubble.position.get(),
    }),
  );
}

inject().catch((err) => {
  console.error(`Injection has been failed: ${(err as Error).toString()}`);
});
