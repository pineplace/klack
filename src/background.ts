import { RecordMode, Identifier, RecordState } from "../islands/enums";
import { Request, Response } from "../islands/types";

interface Context {
  tabId: number;
  recordMode?: RecordMode;
  recordState?: RecordState;
}
const ctx: Context = {
  tabId: 0,
};

// NOTE: Maybe useful in the future
// async function getCurrentTabId(): Promise<number> {
//   const [tab] = await chrome.tabs.query({
//     active: true,
//     currentWindow: true,
//   });
//   return tab.id ?? 0;
// }

async function showControls(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["./public/controls.bundle.mjs"],
  });
}

async function hideControls(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
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
      return showControls(ctx.tabId);
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

chrome.tabs.onActivated.addListener((tabInfo) => {
  const redrawControls = async () => {
    if (!ctx.tabId) {
      ctx.tabId = tabInfo.tabId;
      console.log(
        `Don't have previous tab id, just set new tabId ${ctx.tabId}`
      );
      return;
    }

    if (!ctx.recordMode) {
      console.log("recordMode is None, ignore onActivate");
      return;
    }

    console.log(`Hide controls from previous tab with id ${ctx.tabId}`);
    await hideControls(ctx.tabId);
    ctx.tabId = tabInfo.tabId;
    console.log(`Show controls on current tab with id ${ctx.tabId}`);
    await showControls(ctx.tabId);
  };

  redrawControls().catch((err) =>
    console.error("Can't redrawControls, error", err)
  );
});

chrome.tabs.onRemoved.addListener(() => {
  console.log("onRemoved");
  ctx.tabId = 0;
  console.log("set tabId = 0");
  setRecordState(RecordState.None)
    .then(() => console.log("Set recordState to None"))
    .catch((err) => console.error("onRemoved setRecordState error", err));
  setRecordMode(RecordMode.None)
    .then(() => console.log("Set recordMode to None"))
    .catch((err) => console.error("onRemoved setRecordMode error", err));
});
