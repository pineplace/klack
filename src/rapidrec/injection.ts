/**
 * Implements the `Injector` and `DeInjector` abstractions
 * which can inject or remove already injected code from the tab
 */
import { cameraBubbleId } from "./identifiers";

// NOTE: Injection refers to bundled files in `ext` not original files
export enum Injection {
  ScreenCapture = "./ext/screenCapture.bundle.mjs",
  CameraBubble = "./ext/cameraBubble.bundle.mjs",
}

export class Injector {
  static async screenCapture(tabId: number): Promise<void> {
    console.log(`Trying to inject ${Injection.ScreenCapture ?? ""}`);
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [Injection.ScreenCapture],
    });
  }

  static async cameraBubble(tabId: number): Promise<void> {
    console.log(`Trying to inject ${Injection.CameraBubble ?? ""}`);
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [Injection.CameraBubble],
    });
  }
}

export class DeInjector {
  static async cameraBubble(tabId: number): Promise<void> {
    console.log(`Trying to remove injection ${Injection.CameraBubble ?? ""}`);
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (componentId: string) => {
        document.getElementById(componentId)?.remove();
      },
      args: [cameraBubbleId],
    });
  }
}
