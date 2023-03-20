import {
  BrowserTabChangeArgs,
  BrowserWindowChangeArgs,
  DownloadRecordingArgs,
  MethodArgs,
  builder,
  sender,
} from "./messaging";
import { storage } from "./storage";

storage
  .reset()
  .catch((err) =>
    console.error(`Can't reset storage values ${(err as Error).message}`)
  );

export async function handleStartRecording(_args: MethodArgs): Promise<void> {
  console.log(`handleStartRecording()`);

  const tab = await chrome.tabs.create({
    active: false,
    url: chrome.runtime.getURL("./screen_sharing.html"),
  });

  const window = await chrome.windows.create({
    focused: true,
    tabId: tab.id,
    width: 650,
    height: 710,
  });

  await storage.set.recordingTabId(tab.id as number);
  await storage.set.recordingWindowId(window.id as number);
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

  /* NOTE: We need new to create a new tab where user can choose
   *       screen sharing mode and we can run all necessary streams.
   *       After that we return user back to last tab where user run
   *       `startRecording` command.
   *       That's why we ignoring new tab here if it's equals to
   *       `recordingTabId`
   */
  if ((await storage.get.recordingTabId()) === args.newTabId) {
    console.warn("Ignore tab change, because recording tab equals new tab");
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

export async function handleWindowChange(args: MethodArgs): Promise<void> {
  console.log(`handleWindowChange(args=${JSON.stringify(args)})`);

  args = args as BrowserWindowChangeArgs;

  if (args.newWindowId <= 0) {
    console.warn(
      `Ignore window change because newWindowId=${args.newWindowId}`
    );
    return;
  }
  // NOTE: Same reason as in `handleTabChange`
  if ((await storage.get.recordingWindowId()) === args.newWindowId) {
    console.warn(
      `Ignore window change because newWindowId is a recordingWindowId`
    );
    return;
  }

  const tabs = await chrome.tabs.query({
    active: true,
    windowId: args.newWindowId,
  });
  await handleTabChange({ newTabId: tabs[0].id as number });
  await storage.set.currentWindowId(args.newWindowId);
}

export async function handleOpenUserActiveWindow(
  _args: MethodArgs
): Promise<void> {
  console.log("handleOpenUserActiveWindow()");

  await chrome.windows.update(await storage.get.currentWindowId(), {
    focused: true,
  });
}
