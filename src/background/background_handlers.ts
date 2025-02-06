import { config } from "../config";
import { MessageType, RecordingSaveOptions, senderV2 } from "../messaging";
import { RecordingState, storage } from "../storage";

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
  _activeTabInfo: chrome.tabs.TabActiveInfo,
) {
  return new Promise<void>((resolve) => resolve());
}

export async function onEventTabReloaded(
  _tabId: number,
  _changeInfo: chrome.tabs.TabChangeInfo,
  _tab: chrome.tabs.Tab,
) {
  return new Promise<void>((resolve) => resolve());
}

export async function onEventWindowFocusChanged(_windowId: number) {
  return new Promise<void>((resolve) => resolve());
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
