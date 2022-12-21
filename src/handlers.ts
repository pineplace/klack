import {
  BrowserTabChangeArgs,
  DownloadRecordingArgs,
  MethodArgs,
  MethodResult,
} from "./messaging";

interface StorageContext {
  tabId: number;
  recordingInProgress: boolean;
}

chrome.storage.local
  .set({
    tabId: 0,
    recordingInProgress: false,
  } satisfies StorageContext)
  .then(() => {
    console.log("Storage has been initialized with initial values");
  })
  .catch((err) => {
    console.error(
      `Failed to initialize storage with default values: ${
        (err as Error).message
      }`
    );
  });

export async function handleStartRecording(_args: MethodArgs): Promise<void> {
  console.log(`handleStartRecording()`);

  const { tabId } = await chrome.storage.local.get("tabId");
  await chrome.scripting.executeScript({
    target: { tabId: tabId as number },
    files: ["./screenCapture.bundle.mjs"],
  });
  await chrome.storage.local.set({
    recordingInProgress: true,
  });
}

export async function handleStopRecording(_args: MethodArgs): Promise<void> {
  console.log("handleStopRecording()");

  await chrome.storage.local.set({
    recordingInProgress: false,
  });
}

export async function handleDownloadRecording(args: MethodArgs): Promise<void> {
  console.log("handleDownloadRecording");

  args = args as DownloadRecordingArgs;

  await chrome.downloads.download({
    url: args.downloadUrl,
  });

  await chrome.storage.local.set({
    recordingInProgress: false,
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

export async function handleGetRecordingInProgress(): Promise<MethodResult> {
  console.log("handleGetRecordingInProgress()");

  const { recordingInProgress } = await chrome.storage.local.get(
    "recordingInProgress"
  );
  return (recordingInProgress as boolean) ?? false;
}
