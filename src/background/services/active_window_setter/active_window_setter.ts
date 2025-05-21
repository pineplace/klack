import { storage } from "@/shared/storage";

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
