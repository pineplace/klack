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

export type CurrentTabId = number;
export type CurrentWindowId = number;
export type DevicesMicEnabled = boolean;
export type DevicesMicId = string;
export type DevicesMicName = string;
export type DevicesMicVolume = number;
export type DevicesVideoEnabled = boolean;
export type DevicesVideoId = string;
export type DevicesVideoName = string;
export enum RecordingState {
  NotStarted = "NotStarted",
  Started = "InProgress",
  Paused = "Paused",
  Canceled = "Canceled",
  Stopped = "Stopped",
  Deleted = "Deleted",
}
export type RecordingDuration = number;
export type RecordingTabId = number;
export type RecordingUuid = string;
export type RecordingWindowId = number;
export type UiCameraBubbleEnabled = boolean;
export type UiCameraBubblePosition = { x: number; y: number };
export type UiCameraBubbleSize = { width: number; height: number };
export type UiCameraBubbleTabId = number;
export type UiCameraBubbleWindowId = number;

function generateSetGet<ValueType>(storageKey: StorageKey) {
  return {
    key: storageKey,
    set: (value: ValueType) => {
      return chrome.storage.local.set({
        [storageKey]: value,
      });
    },
    get: async () => {
      const { [storageKey]: value } =
        await chrome.storage.local.get(storageKey);
      return value as ValueType;
    },
  };
}

export const storage = {
  version: 1,
  current: {
    tabId: generateSetGet<CurrentTabId>(StorageKey.CurrentTabId),
    windowId: generateSetGet<CurrentWindowId>(StorageKey.CurrentWindowId),
  },
  devices: {
    mic: {
      enabled: generateSetGet<DevicesMicEnabled>(StorageKey.DevicesMicEnabled),
      id: generateSetGet<DevicesMicId>(StorageKey.DevicesMicId),
      name: generateSetGet<DevicesMicName>(StorageKey.DevicesMicName),
      volume: generateSetGet<DevicesMicVolume>(StorageKey.DevicesMicVolume),
    },
    video: {
      enabled: generateSetGet<DevicesVideoEnabled>(
        StorageKey.DevicesVideoEnabled,
      ),
      id: generateSetGet<DevicesVideoId>(StorageKey.DevicesVideoId),
      name: generateSetGet<DevicesVideoName>(StorageKey.DevicesVideoName),
    },
  },
  recording: {
    duration: generateSetGet<RecordingDuration>(StorageKey.RecordingDuration),
    state: generateSetGet<RecordingState>(StorageKey.RecordingState),
    tabId: generateSetGet<RecordingTabId>(StorageKey.RecordingTabId),
    uuid: generateSetGet<RecordingUuid>(StorageKey.RecordingUuid),
    windowId: generateSetGet<RecordingWindowId>(StorageKey.RecordingWindowId),
  },
  ui: {
    cameraBubble: {
      enabled: generateSetGet<UiCameraBubbleEnabled>(
        StorageKey.UiCameraBubbleEnabled,
      ),
      position: generateSetGet<UiCameraBubblePosition>(
        StorageKey.UiCameraBubblePosition,
      ),
      size: generateSetGet<UiCameraBubbleSize>(StorageKey.UiCameraBubbleSize),
      tabId: generateSetGet<UiCameraBubbleTabId>(
        StorageKey.UiCameraBubbleTabId,
      ),
      windowId: generateSetGet<UiCameraBubbleWindowId>(
        StorageKey.UiCameraBubbleWindowId,
      ),
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

chrome.storage.onChanged.addListener((changes) => {
  for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `[storage.ts] '${key}' '${JSON.stringify(oldValue)}'-->'${JSON.stringify(newValue)}'`,
    );
  }
});
