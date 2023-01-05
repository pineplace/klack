import {
  BrowserTabChangeArgs,
  DownloadRecordingArgs,
  MethodArgs,
  MethodResult,
  builder,
  sender,
} from "./messaging";

interface StorageContext {
  tabId: number; // current tab
  recordingInProgress: boolean;
  cameraBubbleVisible: boolean;
  screenRecordingTabId: number; // tab where screen recording was started
}

chrome.storage.local
  .set({
    tabId: 0,
    recordingInProgress: false,
    cameraBubbleVisible: false,
    screenRecordingTabId: 0,
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
    files: ["./screenSharing.bundle.mjs"],
  });
  await chrome.storage.local.set({
    recordingInProgress: true,
    screenRecordingTabId: tabId as number,
  });
}

export async function handleStopRecording(_args: MethodArgs): Promise<void> {
  console.log("handleStopRecording()");

  const { screenRecordingTabId } = await chrome.storage.local.get(
    "screenRecordingTabId"
  );
  await sender.send(
    builder.internal.tabStopMediaRecorder(),
    screenRecordingTabId as number
  );
  await chrome.storage.local.set({
    recordingInProgress: false,
    screenRecordingTabId: 0,
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
  await chrome.storage.local.set({
    cameraBubbleVisible: true,
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
  await chrome.storage.local.set({
    cameraBubbleVisible: false,
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
  return recordingInProgress as boolean;
}

export async function handleGetIsCameraBubbleVisible(): Promise<MethodResult> {
  console.log("handleGetIsCameraBubbleVisible");

  const { cameraBubbleVisible } = await chrome.storage.local.get(
    "cameraBubbleVisible"
  );
  return cameraBubbleVisible as boolean;
}
