import { Mode, Id } from "../islands/enums";
import { Request } from "../islands/types";

const context = {
  mode: Mode.NONE,
  tabId: 0,
};

async function injectControlsOnTab(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["./public/controls.bundle.mjs"],
  });
}

async function removeInjectedControlsOnTab(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (id) => {
      document.getElementById(id)?.remove();
    },
    args: [Id.CONTROLS],
  });
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
    updateMode(req.mode).catch((err: DOMException) => {
      console.error(`Can't update mode ${JSON.stringify(err)}`);
    });
  }
});

chrome.tabs.onActivated.addListener((tabInfo: chrome.tabs.TabActiveInfo) => {
  if (context.mode !== Mode.SCREEN_AND_CAMERA) {
    return;
  }
  removeInjectedControlsOnTab(context.tabId)
    .then(() => {
      context.tabId = tabInfo.tabId;
      injectControlsOnTab(context.tabId).catch((err: DOMException) => {
        console.error(
          `Can't inject code into ${context.tabId}, cause ${JSON.stringify(
            err
          )}`
        );
      });
    })
    .catch((err: DOMException) => {
      console.error(
        `Can't remove injected code from tab ${
          context.tabId
        }, cause ${JSON.stringify(err)}`
      );
    });
});

chrome.tabs.onRemoved.addListener(() => {
  updateMode(Mode.NONE).catch((err: DOMException) => {
    console.error(`Can't update mode to NONE ${JSON.stringify(err)}`);
  });
});
