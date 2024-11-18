import {
  BrowserTabChangeArgs,
  BrowserWindowChangeArgs,
  CancelRecordingArgs,
  DownloadRecordingArgs,
  MethodArgs,
  builder,
  sender,
} from "./messaging";
import { storage } from "./storage";
import { debounce } from "./utils";

export async function handleStartRecording(_args: MethodArgs): Promise<void> {
  console.log(`handleStartRecording()`);

  const currentTab = await storage.current.tabId.get();
  await chrome.scripting.executeScript({
    target: { tabId: currentTab },
    files: ["recording_start_countdown.bundle.mjs"],
  });

  console.log("handleStartRecording(), 3 seconds countdown has been started");

  const start = async () => {
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

    await storage.recording.tabId.set(tab.id as number);
    await storage.recording.windowId.set(window.id as number);
    await storage.recording.inProgress.set(true);

    console.log("handleStartRecording(), recording has been started");
  };

  setTimeout(() => {
    start().catch((err) => {
      console.error(err);
    });
  }, 3 * 1000);
}

export async function handleStopRecording(_args: MethodArgs): Promise<void> {
  console.log("handleStopRecording()");

  await sender.send(
    builder.tabStopMediaRecorder(true),
    await storage.recording.tabId.get(),
  );
}

export async function handlePauseRecording(_args: MethodArgs): Promise<void> {
  console.log("handlePauseRecording()");

  await storage.recording.onPause.set(true);

  await sender.send(
    builder.tabPauseMediaRecorder(),
    await storage.recording.tabId.get(),
  );
}

export async function handleResumeRecording(_args: MethodArgs): Promise<void> {
  console.log("handleResumeRecording");

  await storage.recording.onPause.set(false);

  await sender.send(
    builder.tabResumeMediaRecorder(),
    await storage.recording.tabId.get(),
  );
}

export async function handleDeleteRecording(_args: MethodArgs): Promise<void> {
  console.log("handleDeleteRecording");

  await sender.send(
    builder.tabStopMediaRecorder(false),
    await storage.recording.tabId.get(),
  );
}

export async function handleCancelRecording(args: MethodArgs): Promise<void> {
  args = args as CancelRecordingArgs;

  console.log(`handleCancelRecording, reason: ${args.reason}`);

  await chrome.tabs.remove(await storage.recording.tabId.get());
  await storage.recording.tabId.set(0);
  await storage.recording.inProgress.set(false);
  await storage.recording.onPause.set(false);
}

export async function handleDownloadRecording(args: MethodArgs): Promise<void> {
  console.log(`handleDownloadRecording(args=${JSON.stringify(args)})`);

  args = args as DownloadRecordingArgs;

  await chrome.downloads.download({
    url: args.downloadUrl,
  });

  await chrome.tabs.remove(await storage.recording.tabId.get());

  await storage.recording.tabId.set(0);
  await storage.recording.inProgress.set(false);
  await storage.recording.onPause.set(false);
}

export async function handleShowCameraBubble(_args: MethodArgs): Promise<void> {
  console.log("handleShowCameraBubble");

  const currentTabId = await storage.current.tabId.get();
  await chrome.scripting.executeScript({
    target: { tabId: currentTabId },
    files: ["./camera_bubble.bundle.mjs"],
  });
  await storage.ui.cameraBubble.tabId.set(currentTabId);
  await storage.ui.cameraBubble.enabled.set(true);
}

export async function handleHideCameraBubble(_args: MethodArgs): Promise<void> {
  console.log("handleHideCameraBubble");

  await chrome.scripting.executeScript({
    target: { tabId: await storage.ui.cameraBubble.tabId.get() },
    func: () => {
      document.getElementById("klack-camera-bubble")?.remove();
      /* NOTE: `@emotion/react` library used by `@mui` as a style library sets the value in
       *       `globalThis` to define double import. This is ok in case of normal use of `@mui`
       *       in web UI.
       *       But when show/hide the camera bubble via Chrome code injection, we expect
       *       the component using `@mui` to be injected and removed multiple times.
       *       Setting the value to `globalThis` in such a situation results in warning,
       *       which is displayed to the user in the `Errors` tab for extension.
       *       For this purpose, such a hack was invented
       *
       *       More info: https://github.com/imblowfish/klack/issues/118
       */
      const re = new RegExp(/__EMOTION_REACT_\d+__/);
      const emotionKey = Object.keys(globalThis).find((key) => re.test(key));
      if (!emotionKey) {
        return;
      }
      // @ts-expect-error `globalThis` uses `any`, we're trying to set the key to `string`, TS doesn't like that
      globalThis[emotionKey] = false;
    },
  });
  await storage.ui.cameraBubble.tabId.set(0);
  await storage.ui.cameraBubble.enabled.set(false);
}

export async function handleAllowMicrophone(_args: MethodArgs): Promise<void> {
  console.log("handleAllowMicrophone");

  await storage.devices.mic.enabled.set(true);
}

export async function handleDisallowMicrophone(
  _args: MethodArgs,
): Promise<void> {
  console.log("handleDisallowMicrophone");

  await storage.devices.mic.enabled.set(false);
}

export async function handleTabChange(args: MethodArgs): Promise<void> {
  console.log(`handleTabChange(args=${JSON.stringify(args)})`);

  args = args as BrowserTabChangeArgs;

  /* NOTE: We need to create a new tab where user can choose
   *       screen sharing mode and we can run all necessary streams.
   *       After that we return user back to last tab where user run
   *       `startRecording` command.
   *       That's why we ignoring new tab here if it's equals to
   *       `recordingTabId`
   */
  if ((await storage.recording.tabId.get()) === args.newTabId) {
    console.warn("Ignore tab change, because recording tab equals new tab");
    return;
  }

  await storage.current.tabId.set(args.newTabId);

  const cameraBubbleTabId = await storage.ui.cameraBubble.tabId.get();
  if (!cameraBubbleTabId) {
    return;
  }

  try {
    await handleHideCameraBubble(args);
    await handleShowCameraBubble(args);
  } catch (err) {
    console.warn(
      `Can't show camera bubble on current tab ${(err as Error).message}`,
    );

    await chrome.scripting.executeScript({
      target: { tabId: cameraBubbleTabId },
      files: ["./camera_bubble.bundle.mjs"],
    });

    await storage.ui.cameraBubble.tabId.set(cameraBubbleTabId);
  }
}

export async function handleTabClosing(args: MethodArgs): Promise<void> {
  console.log(`handleTabClosing(args=${JSON.stringify(args)})`);

  /* NOTE: We don't call `handleHideCameraBubble` because this method
   *       tries to remove the script with camera bubble from current
   *       tab, but at the time the close tab callback is called,
   *       that tab is already closed and doesn't exist
   */
  await storage.ui.cameraBubble.enabled.set(false);
  await storage.recording.tabId.set(0);
}

export async function handleTabUpdated(_args: MethodArgs): Promise<void> {
  console.log("handleTabUpdated()");

  if (await storage.ui.cameraBubble.enabled.get()) {
    debounce(() => {
      handleShowCameraBubble({}).catch((err) => console.error(err));
    }, 2 * 1000);
  }
}

export async function handleWindowChange(args: MethodArgs): Promise<void> {
  console.log(`handleWindowChange(args=${JSON.stringify(args)})`);

  args = args as BrowserWindowChangeArgs;

  if (args.newWindowId <= 0) {
    console.warn(
      `Ignore window change because newWindowId=${args.newWindowId}`,
    );
    return;
  }

  if (args.newWindowId == (await storage.current.windowId.get())) {
    console.warn(
      "Ignore window change because newWindowId is a currentWindowId",
    );
    return;
  }

  // NOTE: Same reason as in `handleTabChange`
  if ((await storage.recording.windowId.get()) === args.newWindowId) {
    console.warn(
      "Ignore window change because newWindowId is a recordingWindowId",
    );
    return;
  }

  const tabs = await chrome.tabs.query({
    active: true,
    windowId: args.newWindowId,
  });
  await handleTabChange({ newTabId: tabs[0].id as number });
  await storage.current.windowId.set(args.newWindowId);
}

export async function handleOpenUserActiveWindow(
  _args: MethodArgs,
): Promise<void> {
  console.log("handleOpenUserActiveWindow()");

  const currentWindowId = await storage.current.windowId.get();
  if (currentWindowId <= 0) {
    console.warn(
      "No data on the last window opened, most likely because the extension was recently reloaded",
    );
    return;
  }
  await chrome.windows.update(await storage.current.windowId.get(), {
    focused: true,
  });
}
