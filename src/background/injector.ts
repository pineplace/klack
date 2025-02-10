import type { Injection, InjectionElementId } from "@/app/injections";

export class Injector {
  static inject(tabId: number, injection: Injection) {
    console.log(
      `[injector.ts] Injector::inject(tabId=${tabId}, injection=${injection})`,
    );
    return chrome.scripting.executeScript({
      target: {
        tabId,
      },
      files: [injection],
    });
  }

  static async deinject(tabId: number, elementId: InjectionElementId) {
    console.log(
      `[injector.ts] Injector::deinject(tabId=${tabId}, elementId=${elementId})`,
    );
    return chrome.scripting.executeScript({
      target: {
        tabId,
      },
      args: [elementId],
      func: (elementId: InjectionElementId) => {
        document.getElementById(elementId)?.remove();
      },
    });
  }
}
