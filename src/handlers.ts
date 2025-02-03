import {
  builder,
  MessageOptions,
  RecordingDownloadOptions,
  sender,
} from "./messaging";
import { storage } from "./storage";
import { debounce } from "./utils";

export async function onCameraBubbleHide(_options: MessageOptions) {
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

export async function onCameraBubbleShow(_options: MessageOptions) {
  const currentTabId = await storage.current.tabId.get();
  await chrome.scripting.executeScript({
    target: { tabId: currentTabId },
    files: ["./camera_bubble.bundle.mjs"],
  });
  await storage.ui.cameraBubble.tabId.set(currentTabId);
  await storage.ui.cameraBubble.enabled.set(true);
}

export async function onMicDisable(_options?: MessageOptions) {
  await storage.devices.mic.enabled.set(false);
}

export async function onMicEnable(_options?: MessageOptions) {
  await storage.devices.mic.enabled.set(true);
}

export async function onRecordingCancel(_options?: MessageOptions) {
  await chrome.tabs.remove(await storage.recording.tabId.get());
  await storage.recording.tabId.set(0);
  await storage.recording.inProgress.set(false);
  await storage.recording.onPause.set(false);
}

export async function onRecordingDelete(_options?: MessageOptions) {
  await sender.send(
    builder.mediaRecorder.stop(false),
    await storage.recording.tabId.get(),
  );
}

export async function onRecordingDownload(options: MessageOptions) {
  options = options as RecordingDownloadOptions;

  await chrome.downloads.download({
    url: options.downloadUrl,
  });

  await chrome.tabs.remove(await storage.recording.tabId.get());

  await storage.recording.tabId.set(0);
  await storage.recording.inProgress.set(false);
  await storage.recording.onPause.set(false);
}

export async function onRecordingPause(_options: MessageOptions) {
  await storage.recording.onPause.set(true);

  await sender.send(
    builder.mediaRecorder.pause(),
    await storage.recording.tabId.get(),
  );
}

export async function onRecordingResume(_options: MessageOptions) {
  await storage.recording.onPause.set(false);

  await sender.send(
    builder.mediaRecorder.resume(),
    await storage.recording.tabId.get(),
  );
}

export async function onRecordingStart(_options: MessageOptions) {
  const currentTab = await storage.current.tabId.get();
  await chrome.scripting.executeScript({
    target: { tabId: currentTab },
    files: ["recording_start_countdown.bundle.mjs"],
  });

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
  };

  setTimeout(() => {
    start().catch((err) => {
      console.error(err);
    });
  }, 3 * 1000);
}

export async function onRecordingStop(_options: MessageOptions) {
  await sender.send(
    builder.mediaRecorder.stop(true),
    await storage.recording.tabId.get(),
  );
}

export async function onTabChange(activeInfo: chrome.tabs.TabActiveInfo) {
  /* NOTE: We need to create a new tab where user can choose
   *       screen sharing mode and we can run all necessary streams.
   *       After that we return user back to last tab where user run
   *       `startRecording` command.
   *       That's why we ignoring new tab here if it's equals to
   *       `recordingTabId`
   */
  if ((await storage.recording.tabId.get()) === activeInfo.tabId) {
    console.warn("Ignore tab change, because recording tab equals new tab");
    return;
  }

  await storage.current.tabId.set(activeInfo.tabId);

  const cameraBubbleTabId = await storage.ui.cameraBubble.tabId.get();
  if (!cameraBubbleTabId) {
    return;
  }

  try {
    await onCameraBubbleHide({});
    await onCameraBubbleShow({});
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

export async function onTabClosing(
  _closedTabId: number,
  _removeInfo: { isWindowClosing: boolean; windowId: number },
) {
  /* NOTE: We don't call `handleHideCameraBubble` because this method
   *       tries to remove the script with camera bubble from current
   *       tab, but at the time the close tab callback is called,
   *       that tab is already closed and doesn't exist
   */
  await storage.ui.cameraBubble.enabled.set(false);
  await storage.recording.tabId.set(0);
}

export async function onTabUpdated(
  _tabId: number,
  _changeInfo: chrome.tabs.TabChangeInfo,
  _tab: chrome.tabs.Tab,
) {
  if (await storage.ui.cameraBubble.enabled.get()) {
    debounce(() => {
      onCameraBubbleShow({}).catch((err) => console.error(err));
    }, 2 * 1000);
  }
}

export async function onWindowChange(windowId: number) {
  if (windowId <= 0) {
    console.warn(`Ignore window change because newWindowId=${windowId}`);
    return;
  }

  if (windowId == (await storage.current.windowId.get())) {
    console.warn(
      "Ignore window change because newWindowId is a currentWindowId",
    );
    return;
  }

  // NOTE: Same reason as in `handleTabChange`
  if ((await storage.recording.windowId.get()) === windowId) {
    console.warn(
      "Ignore window change because newWindowId is a recordingWindowId",
    );
    return;
  }

  const tabs = await chrome.tabs.query({
    active: true,
    windowId: windowId,
  });
  await onTabChange({
    tabId: tabs[0].id as number,
    windowId,
  });
  await storage.current.windowId.set(windowId);
}

export async function handleOpenUserActiveWindow(
  _options: MessageOptions,
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
