import { storage } from "@/shared/storage";

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
