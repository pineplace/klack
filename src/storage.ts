const storageImpl = chrome.storage.local;

interface Context {
  currentTabId: number;
  recordingTabId: number;
  currentWindowId: number;
  recordingInProgress: boolean;
  cameraBubbleVisible: boolean;
  microphoneAllowed: boolean;
}

storageImpl
  .set({
    currentTabId: 0,
    recordingTabId: 0,
    currentWindowId: 0,
    recordingInProgress: false,
    cameraBubbleVisible: false,
    microphoneAllowed: true,
  } satisfies Context)
  .then(() => console.log("Storage has been initialized with default values"))
  .catch((err) =>
    console.error(
      `Storage hasn't been initialized with default value ${
        (err as Error).message
      }`
    )
  );

async function setCurrentTabId(tabId: number): Promise<void> {
  await storageImpl.set({ currentTabId: tabId });
}

async function getCurrentTabId(): Promise<number> {
  const { currentTabId } = await storageImpl.get("currentTabId");
  return currentTabId as number;
}

async function setRecordingTabId(tabId: number): Promise<void> {
  await storageImpl.set({ recordingTabId: tabId });
}

async function getRecordingTabId(): Promise<number> {
  const { recordingTabId } = await storageImpl.get("recordingTabId");
  return recordingTabId as number;
}

async function setCurrentWindowId(windowId: number): Promise<void> {
  await storageImpl.set({ currentWindowId: windowId });
}

async function getCurrentWindowId(): Promise<number> {
  const { currentWindowId } = await storageImpl.get("currentWindowId");
  return currentWindowId as number;
}

async function setRecordingInProgress(value: boolean): Promise<void> {
  await storageImpl.set({ recordingInProgress: value });
}

async function getRecordingInProgress(): Promise<boolean> {
  const { recordingInProgress } = await storageImpl.get("recordingInProgress");
  return recordingInProgress as boolean;
}

async function setCameraBubbleVisible(value: boolean): Promise<void> {
  await storageImpl.set({ cameraBubbleVisible: value });
}

async function getCameraBubbleVisible(): Promise<boolean> {
  const { cameraBubbleVisible } = await storageImpl.get("cameraBubbleVisible");
  return cameraBubbleVisible as boolean;
}

async function setMicrophoneAllowed(value: boolean): Promise<void> {
  await storageImpl.set({ microphoneAllowed: value });
}

async function getMicrophoneAllowed(): Promise<boolean> {
  const { microphoneAllowed } = await storageImpl.get("microphoneAllowed");
  return microphoneAllowed as boolean;
}

export const storage = {
  set: {
    currentTabId: setCurrentTabId,
    recordingTabId: setRecordingTabId,
    currentWindowId: setCurrentWindowId,
    recordingInProgress: setRecordingInProgress,
    cameraBubbleVisible: setCameraBubbleVisible,
    microphoneAllowed: setMicrophoneAllowed,
  },
  get: {
    currentTabId: getCurrentTabId,
    recordingTabId: getRecordingTabId,
    currentWindowId: getCurrentWindowId,
    recordingInProgress: getRecordingInProgress,
    cameraBubbleVisible: getCameraBubbleVisible,
    microphoneAllowed: getMicrophoneAllowed,
  },
};
