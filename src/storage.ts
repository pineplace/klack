const storageImpl = chrome.storage.local;

export interface Context {
  currentTabId: number;
  cameraBubbleTabId: number;
  recordingTabId: number;
  currentWindowId: number;
  recordingWindowId: number;
  recordingInProgress: boolean;
  recordingOnPause: boolean;
  cameraBubbleVisible: boolean;
  microphoneAllowed: boolean;
  microphoneDeviceId: string;
  cameraBubbleSize: { width: number; height: number };
  cameraBubblePosition: { x: number; y: number };
  cameraDeviceId: string;
}

function setCurrentTabId(tabId: number): Promise<void> {
  return storageImpl.set({ currentTabId: tabId } satisfies Partial<Context>);
}

async function getCurrentTabId(): Promise<number> {
  const { currentTabId } = await storageImpl.get("currentTabId");
  return currentTabId as number;
}

function setCameraBubbleTabId(tabId: number): Promise<void> {
  return storageImpl.set({
    cameraBubbleTabId: tabId,
  } satisfies Partial<Context>);
}

async function getCameraBubbleTabId(): Promise<number> {
  const { cameraBubbleTabId } = await storageImpl.get("cameraBubbleTabId");
  return cameraBubbleTabId as number;
}

function setRecordingTabId(tabId: number): Promise<void> {
  return storageImpl.set({ recordingTabId: tabId } satisfies Partial<Context>);
}

async function getRecordingTabId(): Promise<number> {
  const { recordingTabId } = await storageImpl.get("recordingTabId");
  return recordingTabId as number;
}

function setCurrentWindowId(windowId: number): Promise<void> {
  return storageImpl.set({
    currentWindowId: windowId,
  } satisfies Partial<Context>);
}

async function getCurrentWindowId(): Promise<number> {
  const { currentWindowId } = await storageImpl.get("currentWindowId");
  return currentWindowId as number;
}

function setRecordingWindowId(windowId: number): Promise<void> {
  return storageImpl.set({
    recordingWindowId: windowId,
  } satisfies Partial<Context>);
}

async function getRecordingWindowId(): Promise<number> {
  const { recordingWindowId } = await storageImpl.get("recordingWindowId");
  return recordingWindowId as number;
}

function setRecordingInProgress(value: boolean): Promise<void> {
  return storageImpl.set({
    recordingInProgress: value,
  } satisfies Partial<Context>);
}

async function getRecordingInProgress(): Promise<boolean> {
  const { recordingInProgress } = await storageImpl.get("recordingInProgress");
  return recordingInProgress as boolean;
}

function setRecordingOnPause(value: boolean): Promise<void> {
  return storageImpl.set({
    recordingOnPause: value,
  } satisfies Partial<Context>);
}

async function getRecordingOnPause(): Promise<boolean> {
  const { recordingOnPause } = await storageImpl.get("recordingOnPause");
  return recordingOnPause as boolean;
}

function setCameraBubbleVisible(value: boolean): Promise<void> {
  return storageImpl.set({
    cameraBubbleVisible: value,
  } satisfies Partial<Context>);
}

async function getCameraBubbleVisible(): Promise<boolean> {
  const { cameraBubbleVisible } = await storageImpl.get("cameraBubbleVisible");
  return cameraBubbleVisible as boolean;
}

function setMicrophoneAllowed(value: boolean): Promise<void> {
  return storageImpl.set({
    microphoneAllowed: value,
  } satisfies Partial<Context>);
}

async function getMicrophoneAllowed(): Promise<boolean> {
  const { microphoneAllowed } = await storageImpl.get("microphoneAllowed");
  return microphoneAllowed as boolean;
}

function setMicrophoneDeviceId(microphoneDeviceId: string): Promise<void> {
  return storageImpl.set({
    microphoneDeviceId,
  } satisfies Partial<Context>);
}

async function getMicrophoneDeviceId(): Promise<string> {
  const { microphoneDeviceId } = await storageImpl.get("microphoneDeviceId");
  return microphoneDeviceId as string;
}

function setCameraBubbleSize(cameraBubbleSize: {
  width: number;
  height: number;
}): Promise<void> {
  return storageImpl.set({
    cameraBubbleSize,
  } satisfies Partial<Context>);
}

async function getCameraBubbleSize(): Promise<{
  width: number;
  height: number;
}> {
  const { cameraBubbleSize } = await storageImpl.get("cameraBubbleSize");
  return cameraBubbleSize as { width: number; height: number };
}

function setCameraBubblePosition(cameraBubblePosition: {
  x: number;
  y: number;
}): Promise<void> {
  return storageImpl.set({
    cameraBubblePosition,
  });
}

async function getCameraBubblePosition(): Promise<{
  x: number;
  y: number;
}> {
  const { cameraBubblePosition } = await storageImpl.get(
    "cameraBubblePosition",
  );
  return cameraBubblePosition as { x: number; y: number };
}

function setCameraDeviceId(cameraDeviceId: string): Promise<void> {
  return storageImpl.set({
    cameraDeviceId,
  } satisfies Partial<Context>);
}

async function getCameraDeviceId(): Promise<string> {
  const { cameraDeviceId } = await storageImpl.get("cameraDeviceId");
  return cameraDeviceId as string;
}

export const storage = {
  set: {
    currentTabId: setCurrentTabId,
    cameraBubbleTabId: setCameraBubbleTabId,
    recordingTabId: setRecordingTabId,
    currentWindowId: setCurrentWindowId,
    recordingWindowId: setRecordingWindowId,
    recordingInProgress: setRecordingInProgress,
    recordingOnPause: setRecordingOnPause,
    cameraBubbleVisible: setCameraBubbleVisible,
    microphoneAllowed: setMicrophoneAllowed,
    microphoneDeviceId: setMicrophoneDeviceId,
    cameraBubbleSize: setCameraBubbleSize,
    cameraBubblePosition: setCameraBubblePosition,
    cameraDeviceId: setCameraDeviceId,
  },
  get: {
    currentTabId: getCurrentTabId,
    cameraBubbleTabId: getCameraBubbleTabId,
    recordingTabId: getRecordingTabId,
    currentWindowId: getCurrentWindowId,
    recordingWindowId: getRecordingWindowId,
    recordingInProgress: getRecordingInProgress,
    recordingOnPause: getRecordingOnPause,
    cameraBubbleVisible: getCameraBubbleVisible,
    microphoneAllowed: getMicrophoneAllowed,
    microphoneDeviceId: getMicrophoneDeviceId,
    cameraBubbleSize: getCameraBubbleSize,
    cameraBubblePosition: getCameraBubblePosition,
    cameraDeviceId: getCameraDeviceId,
  },
};
