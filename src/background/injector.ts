import type { Injection, InjectionElementId } from "@/shared/injections";

export class Injector {
  static inject(tabId: number, injection: Injection) {
    console.log(`Injector.inject(tabId=${tabId}, injection=${injection})`);
    return chrome.scripting.executeScript({
      target: {
        tabId,
      },
      files: [injection],
    });
  }

  static async deinject(tabId: number, elementId: InjectionElementId) {
    console.log(`Injector.deinject(tabId=${tabId}, elementId=${elementId})`);
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
