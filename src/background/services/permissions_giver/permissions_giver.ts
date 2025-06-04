chrome.runtime.onInstalled.addListener((_details) => {
  console.log("Handle 'chrome.runtime.onInstalled'");
  (async () => {
    await chrome.tabs.create({
      active: true,
      url: chrome.runtime.getURL("permissions.html"),
    });
  })().catch((err) => {
    console.error(
      `Error in 'chrome.runtime.onInstalled' handler: ${(err as Error).toString()}`,
    );
  });
});
