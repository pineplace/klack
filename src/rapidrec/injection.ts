/**
 * Implements the `Injector` and `DeInjector` abstractions
 * which can inject or remove already injected code from the tab
 */
import { camViewAndControlsId } from "./identifiers";

// NOTE: Injection refers to bundled files in `public` not original files
enum Injection {
  ScreenCapture = "./public/screenCapture.bundle.mjs",
  CamViewAndControls = "./public/camViewAndControls.bundle.mjs",
}

export class Injector {
  static async screenCapture(tabId: number): Promise<void> {
    console.log(`Trying to inject ${Injection.ScreenCapture ?? ""}`);
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [Injection.ScreenCapture],
    });
  }

  static async camViewAndControls(tabId: number): Promise<void> {
    console.log(`Trying to inject ${Injection.CamViewAndControls ?? ""}`);
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [Injection.CamViewAndControls],
    });
  }
}

export class DeInjector {
  static async camViewAndControls(tabId: number): Promise<void> {
    console.log(
      `Trying to remove injection ${Injection.CamViewAndControls ?? ""}`
    );
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (componentId: string) => {
        document.getElementById(componentId)?.remove();
      },
      args: [camViewAndControlsId],
    });
  }
}
