import { RecordMode, Identifier, RecordState } from "../islands/enums";
import { Request, Response } from "../islands/types";

interface Context {
  tabId: number;
  recordMode: RecordMode;
  recordState: RecordState;
}
const ctx: Context = {
  tabId: 0,
  recordMode: RecordMode.None,
  recordState: RecordState.None,
};

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

async function startRecord(): Promise<void> {
  console.log("startRecord");
  if (ctx.recordMode === RecordMode.None) {
    console.warn("Current record mode is 'None', ignore startRecord");
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: ctx.tabId },
    files: ["./public/screensharing.bundle.mjs"],
  });
}

async function stopRecord(url: string): Promise<void> {
  // NOTE: https://developer.chrome.com/docs/extensions/reference/downloads/
  console.log("stopRecord, download url", url);
  await chrome.downloads.download({ url });
}

async function setRecordMode(recordMode: RecordMode): Promise<void> {
  ctx.recordMode = recordMode;

  switch (recordMode) {
    case RecordMode.ScreenAndCam:
      return showControls(ctx.tabId);
    case RecordMode.ScreenOnly:
      // TODO: Implement me
      console.log("Set Screen Only mode");
      return new Promise((resolve) => resolve);
    default:
      throw new Error(`Unknown record mode ${recordMode}`);
  }
}

async function setRecordState(req: Request): Promise<void> {
  ctx.recordState = req.recordState ?? RecordState.None;

  switch (req.recordState) {
    case RecordState.Start:
      return startRecord();
    case RecordState.Stop:
      return stopRecord(req.url ?? "");
    default:
      throw new Error(
        `Unknown recordState ${req.recordState ?? RecordState.None}`
      );
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
    promises.push(setRecordState(req));
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

    if (ctx.recordMode !== RecordMode.ScreenAndCam) {
      console.log("recordMode is not `Screen & Cam`, ignore onActivate");
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
  setRecordState({ recordState: RecordState.None } as Request)
    .then(() => console.log("Set recordState to None"))
    .catch((err) => console.error("onRemoved setRecordState error", err));
  setRecordMode(RecordMode.None)
    .then(() => console.log("Set recordMode to None"))
    .catch((err) => console.error("onRemoved setRecordMode error", err));
});
