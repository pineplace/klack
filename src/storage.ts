const storageImpl = chrome.storage.local;

interface Context {
  currentTabId: number;
  recordingTabId: number;
  currentWindowId: number;
  recordingWindowId: number;
  recordingInProgress: boolean;
  cameraBubbleVisible: boolean;
  microphoneAllowed: boolean;
}

async function setCurrentTabId(tabId: number): Promise<void> {
  await storageImpl.set({ currentTabId: tabId } satisfies Partial<Context>);
}

async function getCurrentTabId(): Promise<number> {
  const { currentTabId } = await storageImpl.get("currentTabId");
  return currentTabId as number;
}

async function setRecordingTabId(tabId: number): Promise<void> {
  await storageImpl.set({ recordingTabId: tabId } satisfies Partial<Context>);
}

async function getRecordingTabId(): Promise<number> {
  const { recordingTabId } = await storageImpl.get("recordingTabId");
  return recordingTabId as number;
}

async function setCurrentWindowId(windowId: number): Promise<void> {
  await storageImpl.set({
    currentWindowId: windowId,
  } satisfies Partial<Context>);
}

async function getCurrentWindowId(): Promise<number> {
  const { currentWindowId } = await storageImpl.get("currentWindowId");
  return currentWindowId as number;
}

async function setRecordingWindowId(windowId: number): Promise<void> {
  await storageImpl.set({
    recordingWindowId: windowId,
  } satisfies Partial<Context>);
}

async function getRecordingWindowId(): Promise<number> {
  const { recordingWindowId } = await storageImpl.get("recordingWindowId");
  return recordingWindowId as number;
}

async function setRecordingInProgress(value: boolean): Promise<void> {
  await storageImpl.set({
    recordingInProgress: value,
  } satisfies Partial<Context>);
}

async function getRecordingInProgress(): Promise<boolean> {
  const { recordingInProgress } = await storageImpl.get("recordingInProgress");
  return recordingInProgress as boolean;
}

async function setCameraBubbleVisible(value: boolean): Promise<void> {
  await storageImpl.set({
    cameraBubbleVisible: value,
  } satisfies Partial<Context>);
}

async function getCameraBubbleVisible(): Promise<boolean> {
  const { cameraBubbleVisible } = await storageImpl.get("cameraBubbleVisible");
  return cameraBubbleVisible as boolean;
}

async function setMicrophoneAllowed(value: boolean): Promise<void> {
  await storageImpl.set({
    microphoneAllowed: value,
  } satisfies Partial<Context>);
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
    recordingWindowId: setRecordingWindowId,
    recordingInProgress: setRecordingInProgress,
    cameraBubbleVisible: setCameraBubbleVisible,
    microphoneAllowed: setMicrophoneAllowed,
  },
  get: {
    currentTabId: getCurrentTabId,
    recordingTabId: getRecordingTabId,
    currentWindowId: getCurrentWindowId,
    recordingWindowId: getRecordingWindowId,
    recordingInProgress: getRecordingInProgress,
    cameraBubbleVisible: getCameraBubbleVisible,
    microphoneAllowed: getMicrophoneAllowed,
  },
};
