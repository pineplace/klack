// NOTE @imblowfish: https://developer.chrome.com/docs/extensions/mv3/messaging/
chrome.runtime.onMessage.addListener(async (req, _sender, res) => {
  if (req?.mode === "Screen&Camera") {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["./public/controls.bundle.mjs"],
    });
    res({ res: "Ok" });
  }
});
