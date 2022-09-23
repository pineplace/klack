import modes from "../islands/modes.mjs";
import ids from "../islands/ids.mjs";

const context = {
  mode: modes.NONE,
  tabId: 0,
};

async function injectControlsOnTab(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["./public/controls.bundle.mjs"],
  });
}

async function removeInjectedControlsOnTab(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (id) => {
      document.getElementById(id)?.remove();
    },
    args: [ids.CONTROLS],
  });
}

async function updateMode(mode) {
  if (mode === modes.NONE) {
    // TODO @imblowfish: Implement me
  } else if (mode === modes.SCREEN_AND_CAMERA) {
    if (context.mode === mode) {
      // ignore double controls creation
      return;
    }
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    context.tabId = tab.id;
    injectControlsOnTab(context.tabId);
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

chrome.tabs.onActivated.addListener(async (tabInfo) => {
  if (context.mode !== modes.SCREEN_AND_CAMERA) {
    return;
  }
  await removeInjectedControlsOnTab(context.tabId);
  context.tabId = tabInfo.tabId;
  await injectControlsOnTab(context.tabId);
});

chrome.tabs.onRemoved.addListener(() => {
  updateMode(modes.NONE);
});
