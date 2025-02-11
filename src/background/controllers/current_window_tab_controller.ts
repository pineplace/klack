import { storage } from "@/app/storage";

chrome.tabs.onActivated.addListener((activatedTabInfo) => {
  console.log("Handle 'chrome.tabs.onActivated'");
  (async () => {
    await storage.current.tabId.set(activatedTabInfo.tabId);
  })().catch((err) => {
    console.error(
      `Error in 'chrome.tabs.onActivated' handler: ${(err as Error).toString()}`,
    );
  });
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  console.log("Handle 'chrome.windows.onFocusChanged'");
  (async () => {
    await storage.current.windowId.set(windowId);
  })().catch((err) => {
    console.error(
      `Error in 'chrome.windows.onFocusChanged' handler: ${(err as Error).toString()}`,
    );
  });
});
