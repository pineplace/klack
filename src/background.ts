import { Mode, Id } from "../islands/enums";
import { Request } from "../islands/types";

interface Context {
  mode: Mode;
  tabId: number;
}

const context: Context = {
  mode: Mode.NONE,
  tabId: 0,
};

async function injectControlsOnTab(tabId: number): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["./public/controls.bundle.mjs"],
    });
  } catch (err) {
    console.error("injectedControlsOnTab error", err);
  }
}

async function removeInjectedControlsOnTab(tabId: number): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (id) => {
        document.getElementById(id)?.remove();
      },
      args: [Id.CONTROLS],
    });
  } catch (err) {
    console.error("removeInjectedControlsOnTab error", err);
  }
}

async function updateMode(mode: Mode): Promise<void> {
  if (mode === Mode.NONE) {
    // TODO @imblowfish: Implement me
  } else if (mode === Mode.SCREEN_AND_CAMERA) {
    if (context.mode === mode) {
      // ignore double controls creation
      return;
    }
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    context.tabId = tab.id ?? 0;
    await injectControlsOnTab(context.tabId);
  } else {
    console.error(`Unknown mode ${mode as string}`);
    return;
  }
  context.mode = mode;
}

// NOTE @imblowfish: https://developer.chrome.com/docs/extensions/mv3/messaging/
chrome.runtime.onMessage.addListener((req: Request /*, sender, res */) => {
  if (req?.mode) {
    updateMode(req.mode).catch((err) => {
      console.error("Can't update mode", err);
    });
  }
});

async function updateTab(tabId: number) {
  await removeInjectedControlsOnTab(context.tabId);
  await injectControlsOnTab(tabId);
  context.tabId = tabId;
}

chrome.tabs.onActivated.addListener((tabInfo: chrome.tabs.TabActiveInfo) => {
  if (context.mode !== Mode.SCREEN_AND_CAMERA) {
    return;
  }
  updateTab(tabInfo.tabId).catch((err: DOMException) =>
    console.error("Can't update tab", err)
  );
});

chrome.tabs.onRemoved.addListener(() => {
  updateMode(Mode.NONE).catch((err: DOMException) => {
    console.error(`Can't update mode to NONE ${JSON.stringify(err)}`);
  });
});
