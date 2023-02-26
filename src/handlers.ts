import {
  BrowserTabChangeArgs,
  DownloadRecordingArgs,
  MethodArgs,
  builder,
  sender,
} from "./messaging";
import { storage } from "./storage";

export async function handleStartRecording(_args: MethodArgs): Promise<void> {
  console.log(`handleStartRecording()`);

  const activeWindow = await chrome.windows.getCurrent();

  const tab = await chrome.tabs.create({
    active: false,
    url: chrome.runtime.getURL("./screen_sharing.html"),
  });

  await chrome.windows.create({
    focused: true,
    tabId: tab.id,
    width: 650,
    height: 710,
  });

  await storage.set.recordingTabId(tab.id as number);
  await storage.set.currentWindowId(activeWindow.id as number);
  await storage.set.recordingInProgress(true);
}

export async function handleStopRecording(_args: MethodArgs): Promise<void> {
  console.log("handleStopRecording()");

  await sender.send(
    builder.tabStopMediaRecorder(),
    await storage.get.recordingTabId()
  );
}

export async function handleCancelRecording(_args: MethodArgs): Promise<void> {
  console.log("handleCancelRecording()");

  await storage.set.recordingTabId(0);
  await storage.set.recordingInProgress(false);
}

export async function handleDownloadRecording(args: MethodArgs): Promise<void> {
  console.log(`handleDownloadRecording(args=${JSON.stringify(args)})`);

  args = args as DownloadRecordingArgs;

  await chrome.downloads.download({
    url: args.downloadUrl,
  });

  await chrome.tabs.remove(await storage.get.recordingTabId());

  await storage.set.recordingTabId(0);
  await storage.set.recordingInProgress(false);
}

export async function handleShowCameraBubble(_args: MethodArgs): Promise<void> {
  console.log("handleShowCameraBubble");

  await chrome.scripting.executeScript({
    target: { tabId: await storage.get.currentTabId() },
    files: ["./cameraBubble.bundle.mjs"],
  });
  await storage.set.cameraBubbleVisible(true);
}

export async function handleHideCameraBubble(_args: MethodArgs): Promise<void> {
  console.log("handleHideCameraBubble");

  await chrome.scripting.executeScript({
    target: { tabId: await storage.get.currentTabId() },
    func: () => {
      document.getElementById("rapidrec-camera-bubble")?.remove();
    },
  });
  await storage.set.cameraBubbleVisible(false);
}

export async function handleAllowMicrophone(_args: MethodArgs): Promise<void> {
  console.log("handleAllowMicrophone");

  await storage.set.microphoneAllowed(true);
}

export async function handleDisallowMicrophone(
  _args: MethodArgs
): Promise<void> {
  console.log("handleDisallowMicrophone");

  await storage.set.microphoneAllowed(false);
}

export async function handleTabChange(args: MethodArgs): Promise<void> {
  console.log(`handleTabChange(args=${JSON.stringify(args)})`);

  args = args as BrowserTabChangeArgs;

  if ((await storage.get.recordingTabId()) === args.newTabId) {
    return;
  }

  await storage.set.currentTabId(args.newTabId);
}

export async function handleTabClosing(args: MethodArgs): Promise<void> {
  console.log(`handleTabClosing(args=${JSON.stringify(args)})`);

  await handleHideCameraBubble(args);
}

export async function handleTabUpdated(_args: MethodArgs): Promise<void> {
  console.log("handleTabUpdated()");

  if (await storage.get.cameraBubbleVisible()) {
    await handleShowCameraBubble({});
  }
}

export async function handleOpenUserActiveWindow(
  _args: MethodArgs
): Promise<void> {
  console.log("handleOpenUserActiveWindow()");

  await chrome.windows.update(await storage.get.currentWindowId(), {
    focused: true,
  });
}
