function generateSetGet<ValueType>(valueName: string) {
  return {
    set: (value: ValueType) => {
      return chrome.storage.local.set({
        [valueName]: value,
      });
    },
    get: async () => {
      const { [valueName]: value } = await chrome.storage.local.get(valueName);
      return value as ValueType;
    },
  };
}

chrome.storage.onChanged.addListener((changes) => {
  for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `[storage.ts] '${key}' '${JSON.stringify(oldValue)}'-->'${JSON.stringify(newValue)}'`,
    );
  }
});

export const storage = {
  version: 1,
  current: {
    windowId: generateSetGet<number>("current.windowId"),
    tabId: generateSetGet<number>("current.tabId"),
  },
  devices: {
    video: {
      enabled: generateSetGet<boolean>("devices.video.enabled"),
      id: generateSetGet<string>("devices.video.id"),
      name: generateSetGet<string>("devices.video.name"),
    },
    mic: {
      enabled: generateSetGet<boolean>("devices.mic.enabled"),
      id: generateSetGet<string>("devices.mic.id"),
      name: generateSetGet<string>("devices.mic.name"),
      volume: generateSetGet<number>("devices.mic.volume"),
    },
  },
  ui: {
    cameraBubble: {
      enabled: generateSetGet<boolean>("ui.cameraBubble.enabled"),
      windowId: generateSetGet<number>("ui.cameraBubble.windowId"),
      tabId: generateSetGet<number>("ui.cameraBubble.tabId"),
      position: generateSetGet<{ x: number; y: number }>(
        "ui.cameraBubble.position",
      ),
      size: generateSetGet<{ width: number; height: number }>(
        "ui.cameraBubble.size",
      ),
    },
  },
  recording: {
    windowId: generateSetGet<number>("recording.windowId"),
    tabId: generateSetGet<number>("recording.tabId"),
    /**
     * @deprecated Recording state should be moved to the database soon
     */
    inProgress: generateSetGet<boolean>("recording.inProgress"),
    /**
     * @deprecated Recording state should be moved to the database soon
     */
    onPause: generateSetGet<boolean>("recording.onPause"),
    uuid: generateSetGet<string>("recording.uuid"),
    duration: generateSetGet<number>("recording.duration"),
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
