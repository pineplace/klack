import { config } from "../../config";
import { MessageType, RecordingSaveOptions, senderV2 } from "../../messaging";
import { RecordingState, storage } from "../../storage";
import { debounce } from "../../utils";

export async function onEventExtensionInstalled(
  _details: chrome.runtime.InstalledDetails,
) {
  await storage.current.windowId.set(0);
  await storage.current.tabId.set(0);

  await storage.devices.video.enabled.set(true);
  await storage.devices.video.id.set("");
  await storage.devices.video.name.set("");

  await storage.devices.mic.enabled.set(true);
  await storage.devices.mic.id.set("");
  await storage.devices.mic.name.set("");
  await storage.devices.mic.volume.set(0);

  await storage.ui.cameraBubble.enabled.set(false);
  await storage.ui.cameraBubble.windowId.set(0);
  await storage.ui.cameraBubble.tabId.set(0);
  await storage.ui.cameraBubble.position.set({ x: 0, y: 0 });
  await storage.ui.cameraBubble.size.set({ width: 200, height: 200 });

  await storage.recording.windowId.set(0);
  await storage.recording.tabId.set(0);
  await storage.recording.state.set(RecordingState.NotStarted);
  await storage.recording.uuid.set("");
  await storage.recording.duration.set(0);

  console.log(
    `[background.ts] Configuration: ${JSON.stringify(config, undefined, 2)}`,
  );
  console.log(
    `[background.ts] Storage: ${JSON.stringify(await storage.getEntireStorage(), undefined, 2)}`,
  );
}

export async function onEventTabChanged(
  activeTabInfo: chrome.tabs.TabActiveInfo,
) {
  await storage.current.tabId.set(activeTabInfo.tabId);

  if (!(await storage.ui.cameraBubble.enabled.get())) {
    return;
  }

  if ((await storage.ui.cameraBubble.tabId.get()) !== 0) {
    // NOTE: If tab with camera bubble has been closed then `tabId` should be
    //       '0' after the `onEventTabClosed` event handler
    await chrome.scripting.executeScript({
      target: { tabId: await storage.ui.cameraBubble.tabId.get() },
      func: () => {
        document.getElementById("klack-camera-bubble")?.remove();
      },
    });
  }

  await chrome.scripting.executeScript({
    target: { tabId: activeTabInfo.tabId },
    files: ["./camera_bubble.bundle.mjs"],
  });
  await storage.ui.cameraBubble.tabId.set(activeTabInfo.tabId);
}

export async function onEventTabReloaded(
  _tabId: number,
  _changeInfo: chrome.tabs.TabChangeInfo,
  _tab: chrome.tabs.Tab,
) {
  if (!(await storage.ui.cameraBubble.enabled.get())) {
    return;
  }

  debounce(() => {
    (async () => {
      const currentTabId = await storage.current.tabId.get();
      await chrome.scripting.executeScript({
        target: { tabId: currentTabId },
        files: ["./camera_bubble.bundle.mjs"],
      });
      await storage.ui.cameraBubble.tabId.set(currentTabId);
      await storage.ui.cameraBubble.enabled.set(true);
    })().catch((err) => {
      console.error(
        `[background.ts] Cannot redraw camera bubble on page reload: ${(err as Error).toString()}`,
      );
    });
  }, 2 * 1000);
}

export async function onEventTabClosed(
  _closedTabId: number,
  _removeInfo: { isWindowClosing: boolean; windowId: number },
) {
  if (!(await storage.ui.cameraBubble.enabled.get())) {
    return;
  }
  await storage.ui.cameraBubble.tabId.set(0);
}

export async function onEventWindowFocusChanged(windowId: number) {
  if (windowId === (await storage.current.windowId.get()) || windowId === -1) {
    return;
  }

  await storage.current.windowId.set(windowId);

  if (!(await storage.ui.cameraBubble.enabled.get())) {
    return;
  }

  const tabs = await chrome.tabs.query({
    active: true,
    windowId,
  });

  return onEventTabChanged({
    tabId: tabs[0].id as number,
    windowId,
  });
}

export async function onMessageCameraBubbleShow() {
  const currentTabId = await storage.current.tabId.get();
  await chrome.scripting.executeScript({
    target: { tabId: currentTabId },
    files: ["./camera_bubble.bundle.mjs"],
  });
  await storage.ui.cameraBubble.tabId.set(currentTabId);
  await storage.ui.cameraBubble.enabled.set(true);
}

export async function onMessageCameraBubbleHide() {
  await chrome.scripting.executeScript({
    target: { tabId: await storage.ui.cameraBubble.tabId.get() },
    func: () => {
      document.getElementById("klack-camera-bubble")?.remove();
    },
  });
  await storage.ui.cameraBubble.tabId.set(0);
  await storage.ui.cameraBubble.enabled.set(false);
}

export async function onMessageRecordingStart() {
  if (await chrome.offscreen.hasDocument()) {
    console.warn("[background.ts] Offscreen document is already created");
  } else {
    await chrome.offscreen.createDocument({
      url: chrome.runtime.getURL("offscreen.html"),
      reasons: [chrome.offscreen.Reason.USER_MEDIA],
      justification: "Offscreen launched to start media recorder",
    });
  }
  const response = await senderV2.offscreen.recorderCreate({
    mic: {
      enabled: await storage.devices.mic.enabled.get(),
      id: await storage.devices.mic.id.get(),
    },
  });
  if (response.type !== MessageType.ResultOk) {
    if (!response.reason?.includes("NotAllowedError: Permission denied")) {
      console.error(
        `[background.ts] Recording creation failed: ${JSON.stringify(response)}`,
      );
      return;
    }
    console.log("[background.ts] Recorder creation has been canceled");
    await senderV2.offscreen.recorderDelete();
    await chrome.offscreen.closeDocument();
    return;
  }
  await senderV2.offscreen.recorderStart();
  await storage.recording.state.set(RecordingState.InProgress);
}

export async function onMessageRecordingStop() {
  if (!(await chrome.offscreen.hasDocument())) {
    return;
  }
  await senderV2.offscreen.recorderStop();
  await storage.recording.state.set(RecordingState.Stopped);
}

export async function onMessageRecordingPause() {
  if (!(await chrome.offscreen.hasDocument())) {
    return;
  }
  await senderV2.offscreen.recorderPause();
  await storage.recording.state.set(RecordingState.OnPause);
}

export async function onMessageRecordingResume() {
  if (!(await chrome.offscreen.hasDocument())) {
    return;
  }
  await senderV2.offscreen.recorderResume();
  await storage.recording.state.set(RecordingState.InProgress);
}

export async function onMessageRecordingCancel() {
  if (!(await chrome.offscreen.hasDocument())) {
    return;
  }
  await senderV2.offscreen.recorderCancel();
  await senderV2.offscreen.recorderDelete();
  await chrome.offscreen.closeDocument();
  await storage.recording.state.set(RecordingState.NotStarted);
}

export async function onMessageRecordingSave(options: RecordingSaveOptions) {
  if (!(await chrome.offscreen.hasDocument())) {
    return;
  }
  await chrome.downloads.download({
    url: options.recordingUrl,
  });
  await senderV2.offscreen.recorderDelete();
  await chrome.offscreen.closeDocument();
  await storage.recording.state.set(RecordingState.NotStarted);
}
