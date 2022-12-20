import {
  BrowserTabChangeArgs,
  DownloadRecordingArgs,
  MethodArgs,
} from "./messaging";

export async function handleStartRecording(_args: MethodArgs): Promise<void> {
  console.log(`handleStartRecording()`);

  const { tabId } = await chrome.storage.local.get("tabId");
  await chrome.scripting.executeScript({
    target: { tabId: tabId as number },
    files: ["./screenCapture.bundle.mjs"],
  });
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function handleStopRecording(_args: MethodArgs): Promise<void> {
  console.log("handleStopRecording()");
  // TODO: Implement me and remove eslint-disable above
}

export async function handleDownloadRecording(args: MethodArgs): Promise<void> {
  console.log("handleDownloadRecording");

  args = args as DownloadRecordingArgs;

  await chrome.downloads.download({
    url: args.downloadUrl,
  });
}

export async function handleShowCameraBubble(_args: MethodArgs): Promise<void> {
  console.log("handleShowCameraBubble");

  const { tabId } = await chrome.storage.local.get("tabId");
  await chrome.scripting.executeScript({
    target: { tabId: tabId as number },
    files: ["./cameraBubble.bundle.mjs"],
  });
}

export async function handleHideCameraBubble(_args: MethodArgs): Promise<void> {
  console.log("handleHideCameraBubble");

  const { tabId } = await chrome.storage.local.get("tabId");
  await chrome.scripting.executeScript({
    target: { tabId: tabId as number },
    func: () => {
      document.getElementById("rapidrec-camera-bubble")?.remove();
    },
  });
}

export async function handleTabChange(args: MethodArgs): Promise<void> {
  console.log(`handleTabChange(args=${JSON.stringify(args)})`);

  args = args as BrowserTabChangeArgs;

  await chrome.storage.local.set({
    tabId: args.newTabId,
  });
}

export async function handleTabClosing(args: MethodArgs): Promise<void> {
  console.log(`handleTabClosing(args=${JSON.stringify(args)})`);

  await handleHideCameraBubble(args);
}
