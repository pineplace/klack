import { storage } from "../../storage";

chrome.tabs.onActivated.addListener((activatedTabInfo) => {
  console.log(
    "[current_window_tab_controller.ts] Handle 'chrome.tabs.onActivated'",
  );
  (async () => {
    await storage.current.tabId.set(activatedTabInfo.tabId);
  })().catch((err) => {
    console.error(
      `[current_window_tab_controller.ts] Error in 'chrome.tabs.onActivated' handler: ${(err as Error).toString()}`,
    );
  });
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  console.log(
    "[current_window_tab_controller.ts] Handle 'chrome.windows.onFocusChanged'",
  );
  (async () => {
    await storage.current.windowId.set(windowId);
  })().catch((err) => {
    console.error(
      `[current_window_tab_controller.ts] Error in 'chrome.windows.onFocusChanged' handler: ${(err as Error).toString()}`,
    );
  });
});
