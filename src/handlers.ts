import { BrowserTabChange, MethodArgs } from "./messaging";

export async function handleRecordingStart(_args: MethodArgs): Promise<void> {
  console.log(`handleRecordingStart()`);

  const tabId = (await chrome.storage.local.get("currentTabId")) as unknown;
  await chrome.scripting.executeScript({
    target: { tabId: tabId as number },
    files: ["./screenCapture.bundle.mjs"],
  });
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function handleRecordingStop(_args: MethodArgs): Promise<void> {
  console.log("handleRecordingStop()");
  // TODO: Implement me and remove eslint-disable above
}

export async function handleShowCameraBubble(_args: MethodArgs): Promise<void> {
  // TODO: Implement me
  // await chrome.scripting.executeScript({
  // target: { tabId },
  // files: ["./cameraBubble.bundle.mjs"],
  // });
}

export async function handleHideCameraBubble(_args: MethodArgs): Promise<void> {
  // TODO: Implement me
  // await chrome.scripting.executeScript({
  // target: { tabId },
  // func: (componentId: string) => {
  // document.getElementById(componentId)?.remove();
  // },
  // args: ["rapidrec-camera-bubble"],
  // });
}

export async function handleTabChange(args: MethodArgs): Promise<void> {
  console.log(`handleTabChange(args=${JSON.stringify(args)})`);
  args = args as BrowserTabChange;

  await chrome.storage.local.set({
    currentTabId: args.newTabId,
  });
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function handleTabClosing(args: MethodArgs): Promise<void> {
  console.log(`handleTabClosing(args=${JSON.stringify(args)})`);
  // TODO: Implement me and remove eslint-disable above
}
