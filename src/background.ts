import { RecordMode, Identifier, RecordState } from "../islands/enums";
import { Request, Response } from "../islands/types";

interface Context {
  tab?: chrome.tabs.Tab;
  recordMode?: RecordMode;
  recordState?: RecordState;
}
const ctx: Context = {};

async function getCurrentTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return tab;
}

async function showControls(tab?: chrome.tabs.Tab): Promise<void> {
  const { id } = tab ?? (await getCurrentTab());
  await chrome.scripting.executeScript({
    target: { tabId: id ?? 0 },
    files: ["./public/controls.bundle.mjs"],
  });
}

async function hideControls(tab?: chrome.tabs.Tab): Promise<void> {
  const { id } = tab ?? (await getCurrentTab());
  await chrome.scripting.executeScript({
    target: { tabId: id ?? 0 },
    func: (controlsElementId) => {
      document.getElementById(controlsElementId)?.remove();
    },
    args: [Identifier.Controls],
  });
}


async function setRecordMode(recordMode: RecordMode): Promise<void> {
  ctx.recordMode = recordMode;
  switch (recordMode) {
    case RecordMode.ScreenAndCam:
      return showControls(ctx?.tab);
  }
}

async function setRecordState(recordState: RecordState): Promise<void> {
  ctx.recordState = recordState;

  switch (recordState) {
    case RecordState.Start:
      // TODO: Implement me
      return new Promise((resolve) => {
        console.log("Start record");
        resolve();
      });
  }
}

// NOTE @imblowfish: https://developer.chrome.com/docs/extensions/mv3/messaging/
chrome.runtime.onMessage.addListener((req: Request, sender, sendResponse) => {
  console.log("onMessage", req);
  if (sender.tab?.active) {
    ctx.tab = sender.tab;
    console.log("Set new tab", ctx.tab);
  }

  const promises = [];

  if (req.recordMode) {
    console.log("Set new record mode", req.recordMode);
    promises.push(setRecordMode(req.recordMode));
  }
  if (req.recordState) {
    console.log("Set new record state", req.recordState);
    promises.push(setRecordState(req.recordState));
  }

  Promise.all(promises)
    .then((promises) => {
      for (const promise of promises) {
        console.log("Successfully done promise", promise);
      }
      sendResponse({ success: true } as Response);
    })
    .catch((err) => {
      console.error(err);
      sendResponse({ success: false } as Response);
    });
});

chrome.tabs.onActivated.addListener((/* tabInfo */) => {
  if (!ctx.recordMode) {
    console.warn("Tab activated, current mode is empty");
    return;
  }
  getCurrentTab()
    .then((tab) => {
      ctx.tab = tab;
      hideControls(ctx.tab)
        .then(() => {
          showControls().catch((err) =>
            console.error("Can't show controls on current tab", err)
          );
        })
        .catch((err) =>
          console.error("Can't hide controls on previous tab", err)
        );
    })
    .catch((err) => console.error("Can't get current tab", err));
});

chrome.tabs.onRemoved.addListener(() => {
  setRecordMode(RecordMode.Undefined).catch((err) =>
    console.error("onRemoved error", err)
  );
});
