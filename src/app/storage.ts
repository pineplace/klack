export enum StorageKey {
  CurrentTabId = "current.tabId",
  CurrentWindowId = "current.windowId",
  DevicesMicEnabled = "devices.mic.enabled",
  DevicesMicId = "devices.mic.id",
  DevicesMicName = "devices.mic.name",
  DevicesMicVolume = "devices.mic.volume",
  DevicesVideoEnabled = "devices.video.enabled",
  DevicesVideoId = "devices.video.id",
  DevicesVideoName = "devices.video.name",
  RecordingDuration = "recording.duration",
  RecordingState = "recording.state",
  RecordingTabId = "recording.tabId",
  RecordingUuid = "recording.uuid",
  RecordingWindowId = "recording.windowId",
  UiCameraBubbleEnabled = "ui.cameraBubble.enabled",
  UiCameraBubblePosition = "ui.cameraBubble.position",
  UiCameraBubbleSize = "ui.cameraBubble.size",
  UiCameraBubbleTabId = "ui.cameraBubble.tabId",
  UiCameraBubbleWindowId = "ui.cameraBubble.windowId",
}

export enum RecordingState {
  NotStarted = "NotStarted",
  InProgress = "InProgress",
  OnPause = "OnPause",
}

type StorageValueTypeMap = {
  [StorageKey.CurrentTabId]: number;
  [StorageKey.CurrentWindowId]: number;
  [StorageKey.DevicesMicEnabled]: boolean;
  [StorageKey.DevicesMicId]: string;
  [StorageKey.DevicesMicName]: string;
  [StorageKey.DevicesMicVolume]: number;
  [StorageKey.DevicesVideoEnabled]: boolean;
  [StorageKey.DevicesVideoId]: string;
  [StorageKey.DevicesVideoName]: string;
  [StorageKey.RecordingState]: RecordingState;
  [StorageKey.RecordingDuration]: number;
  [StorageKey.RecordingTabId]: number;
  [StorageKey.RecordingUuid]: string;
  [StorageKey.RecordingWindowId]: number;
  [StorageKey.UiCameraBubbleEnabled]: boolean;
  [StorageKey.UiCameraBubblePosition]: { x: number; y: number };
  [StorageKey.UiCameraBubbleSize]: { width: number; height: number };
  [StorageKey.UiCameraBubbleTabId]: number;
  [StorageKey.UiCameraBubbleWindowId]: number;
};

export type StorageValueType<K extends StorageKey> = StorageValueTypeMap[K];

export function createStorageSetter<Key extends StorageKey>(storageKey: Key) {
  return (value: StorageValueType<Key>) => {
    return chrome.storage.local.set({
      [storageKey]: value,
    });
  };
}

export function createStorageGetter<Key extends StorageKey>(storageKey: Key) {
  return async () => {
    const { [storageKey]: value } = await chrome.storage.local.get(storageKey);
    return value as StorageValueType<Key>;
  };
}

function createStorageSetterGetter<Key extends StorageKey>(storageKey: Key) {
  return {
    set: createStorageSetter(storageKey),
    get: createStorageGetter(storageKey),
  };
}

export const storage = {
  version: 1,
  current: {
    tabId: createStorageSetterGetter(StorageKey.CurrentTabId),
    windowId: createStorageSetterGetter(StorageKey.CurrentWindowId),
  },
  devices: {
    mic: {
      enabled: createStorageSetterGetter(StorageKey.DevicesMicEnabled),
      id: createStorageSetterGetter(StorageKey.DevicesMicId),
      name: createStorageSetterGetter(StorageKey.DevicesMicName),
      volume: createStorageSetterGetter(StorageKey.DevicesMicVolume),
    },
    video: {
      enabled: createStorageSetterGetter(StorageKey.DevicesVideoEnabled),
      id: createStorageSetterGetter(StorageKey.DevicesVideoId),
      name: createStorageSetterGetter(StorageKey.DevicesVideoName),
    },
  },
  recording: {
    duration: createStorageSetterGetter(StorageKey.RecordingDuration),
    state: createStorageSetterGetter(StorageKey.RecordingState),
    tabId: createStorageSetterGetter(StorageKey.RecordingTabId),
    uuid: createStorageSetterGetter(StorageKey.RecordingUuid),
    windowId: createStorageSetterGetter(StorageKey.RecordingWindowId),
  },
  ui: {
    cameraBubble: {
      enabled: createStorageSetterGetter(StorageKey.UiCameraBubbleEnabled),
      position: createStorageSetterGetter(StorageKey.UiCameraBubblePosition),
      size: createStorageSetterGetter(StorageKey.UiCameraBubbleSize),
      tabId: createStorageSetterGetter(StorageKey.UiCameraBubbleTabId),
      windowId: createStorageSetterGetter(StorageKey.UiCameraBubbleWindowId),
    },
  },
  clear: () => {
    return chrome.storage.local.clear();
  },
  getBytesInUse: () => {
    return chrome.storage.local.getBytesInUse();
  },
  getEntireStorage: () => {
    return chrome.storage.local.get();
  },
};

export type Storage = typeof storage;
