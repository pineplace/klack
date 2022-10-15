import { camViewAndControlsId } from "../config";

enum Injection {
  ScreenCapture = "./public/screen_capture.bundle.mjs",
  CamViewAndControls = "./public/cam_view_and_controls.mjs",
}

const injectionOriginalFile = new Map([
  [Injection.ScreenCapture, "./src/injections/screen_capture.ts"],
  [Injection.CamViewAndControls, "./src/injections/cam_view_and_controls.mjs"],
]);

export class Injector {
  static async screenCapture(tabId: number): Promise<void> {
    console.log(
      `Trying to inject ${
        injectionOriginalFile.get(Injection.ScreenCapture) ?? ""
      }`
    );
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [Injection.ScreenCapture],
    });
  }

  static async camViewAndControls(tabId: number): Promise<void> {
    console.log(
      `Trying to inject ${
        injectionOriginalFile.get(Injection.CamViewAndControls) ?? ""
      }`
    );
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [Injection.CamViewAndControls],
    });
  }
}

export class DeInjector {
  static async camViewAndControls(tabId: number): Promise<void> {
    console.log(
      `Trying to remove injection ${
        injectionOriginalFile.get(Injection.CamViewAndControls) ?? ""
      }`
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
