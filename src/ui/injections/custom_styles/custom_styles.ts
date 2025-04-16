import { Injection, InjectionElementId } from "@/app/injections";

function inject() {
  if (document.getElementById(Injection.CustomStyles)) {
    throw new Error("Current script already injected on this page");
  }

  const linkElement = document.createElement("link");
  linkElement.id = InjectionElementId.CustomStyles;
  linkElement.href = chrome.runtime.getURL("./klack_tailwind_global.css");
  linkElement.rel = "stylesheet";
  document.head.append(linkElement);
}

inject();
