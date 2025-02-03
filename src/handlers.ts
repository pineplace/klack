import {
  builder,
  MessageOptions,
  RecordingDownloadOptions,
  sender,
} from "./messaging";
import { storage, StorageChange, UiCameraBubbleEnabled } from "./storage";
import { debounce } from "./utils";

export async function onBrowserEventTabChange(
  activeInfo: chrome.tabs.TabActiveInfo,
) {
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
    await storage.ui.cameraBubble.enabled.set(false);
    await storage.ui.cameraBubble.enabled.set(true);
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

export async function onBrowserEventTabClosing(
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

export async function onBrowserEventTabUpdated(
  _tabId: number,
  _changeInfo: chrome.tabs.TabChangeInfo,
  _tab: chrome.tabs.Tab,
) {
  const redrawCameraBubble = async () => {
    await storage.ui.cameraBubble.enabled.set(false);
    await storage.ui.cameraBubble.enabled.set(true);
  };

  if (await storage.ui.cameraBubble.enabled.get()) {
    debounce(() => {
      redrawCameraBubble().catch((err) => console.error(err));
    }, 2 * 1000);
  }
}

export async function onBrowserEventWindowChange(windowId: number) {
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
  await onBrowserEventTabChange({
    tabId: tabs[0].id as number,
    windowId,
  });
  await storage.current.windowId.set(windowId);
}

export async function onMessageRecordingCancel(_options?: MessageOptions) {
  await chrome.tabs.remove(await storage.recording.tabId.get());
  await storage.recording.tabId.set(0);
  await storage.recording.inProgress.set(false);
  await storage.recording.onPause.set(false);
}

export async function onMessageRecordingDelete(_options?: MessageOptions) {
  await sender.send(
    builder.mediaRecorder.stop(false),
    await storage.recording.tabId.get(),
  );
}

export async function onMessageRecordingDownload(options: MessageOptions) {
  options = options as RecordingDownloadOptions;

  await chrome.downloads.download({
    url: options.downloadUrl,
  });

  await chrome.tabs.remove(await storage.recording.tabId.get());

  await storage.recording.tabId.set(0);
  await storage.recording.inProgress.set(false);
  await storage.recording.onPause.set(false);
}

export async function onMessageRecordingPause(_options: MessageOptions) {
  await storage.recording.onPause.set(true);

  await sender.send(
    builder.mediaRecorder.pause(),
    await storage.recording.tabId.get(),
  );
}

export async function onMessageRecordingResume(_options: MessageOptions) {
  await storage.recording.onPause.set(false);

  await sender.send(
    builder.mediaRecorder.resume(),
    await storage.recording.tabId.get(),
  );
}

export async function onMessageRecordingStart(_options: MessageOptions) {
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

export async function onMessageRecordingStop(_options: MessageOptions) {
  await sender.send(
    builder.mediaRecorder.stop(true),
    await storage.recording.tabId.get(),
  );
}

export async function onStorageChangeUiCameraBubbleEnabled(
  change: StorageChange<unknown>,
) {
  change = change as StorageChange<UiCameraBubbleEnabled>;

  if (change.oldValue === change.newValue) {
    return;
  }

  if (change.oldValue === false && change.newValue === true) {
    const currentTabId = await storage.current.tabId.get();
    await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      files: ["./camera_bubble.bundle.mjs"],
    });
    await storage.ui.cameraBubble.tabId.set(currentTabId);
  } else if (change.oldValue === true && change.newValue === false) {
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
  }
}
