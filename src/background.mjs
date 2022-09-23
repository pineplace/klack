import modes from "../islands/modes.mjs";

const context = {
  mode: modes.NONE,
};

async function updateMode(mode) {
  if (mode === modes.NONE) {
    // TODO @imblowfish: Implement me
  } else if (mode === modes.SCREEN_AND_CAMERA) {
    if (context.mode === mode) {
      // ignore double controls creation
      return;
    }
    const tab = await chrome.tabs.getCurrent();
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["./public/controls.bundle.mjs"],
    });
  } else {
    console.error(`Unknown mode ${mode}`);
    return;
  }
  context.mode = mode;
}

// NOTE @imblowfish: https://developer.chrome.com/docs/extensions/mv3/messaging/
chrome.runtime.onMessage.addListener(async (req /*, sender, res */) => {
  if (req?.mode) {
    updateMode(req.mode);
  }
});

chrome.tabs.onRemoved.addListener(() => {
  updateMode(modes.NONE);
});
