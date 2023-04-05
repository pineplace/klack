import { jest } from "@jest/globals";

const defaultValues = {
  currentTabId: 1,
  cameraBubbleTabId: 2,
  recordingTabId: 3,
  currentWindowId: 4,
  recordingWindowId: 5,
  recordingInProgress: true,
  cameraBubbleVisible: true,
  microphoneAllowed: false,
};

globalThis.chrome = {
  storage: {
    local: {
      // @ts-expect-error Chrome methods mocking
      set: jest.fn().mockResolvedValue({}),
      // @ts-expect-error Chrome methods mocking
      get: jest.fn().mockResolvedValue({
        currentTabId: defaultValues.currentTabId,
        cameraBubbleTabId: defaultValues.cameraBubbleTabId,
        recordingTabId: defaultValues.recordingTabId,
        currentWindowId: defaultValues.currentWindowId,
        recordingWindowId: defaultValues.recordingWindowId,
        recordingInProgress: defaultValues.recordingInProgress,
        cameraBubbleVisible: defaultValues.cameraBubbleVisible,
        microphoneAllowed: defaultValues.microphoneAllowed,
      }),
    },
  },
};
const { storage } = await import("../storage");

test("currentTabId", async () => {
  await storage.set.currentTabId(defaultValues.currentTabId);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({
    currentTabId: defaultValues.currentTabId,
  });

  await expect(storage.get.currentTabId()).resolves.toBe(
    defaultValues.currentTabId
  );
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("currentTabId");
});

test("cameraBubbleTabId", async () => {
  await storage.set.cameraBubbleTabId(defaultValues.cameraBubbleTabId);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({
    cameraBubbleTabId: defaultValues.cameraBubbleTabId,
  });

  await expect(storage.get.cameraBubbleTabId()).resolves.toBe(
    defaultValues.cameraBubbleTabId
  );
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("cameraBubbleTabId");
});

test("recordingTabId", async () => {
  await storage.set.recordingTabId(defaultValues.recordingTabId);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({
    recordingTabId: defaultValues.recordingTabId,
  });

  await expect(storage.get.recordingTabId()).resolves.toBe(
    defaultValues.recordingTabId
  );
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("recordingTabId");
});

test("currentWindowId", async () => {
  await storage.set.currentWindowId(defaultValues.currentWindowId);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({
    currentWindowId: defaultValues.currentWindowId,
  });

  await expect(storage.get.currentWindowId()).resolves.toBe(
    defaultValues.currentWindowId
  );
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("currentWindowId");
});

test("recordignWindowId", async () => {
  await storage.set.recordingWindowId(defaultValues.recordingWindowId);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({
    recordingWindowId: defaultValues.recordingWindowId,
  });

  await expect(storage.get.recordingWindowId()).resolves.toBe(
    defaultValues.recordingWindowId
  );
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("recordingWindowId");
});

test("recordingInProgress", async () => {
  await storage.set.recordingInProgress(defaultValues.recordingInProgress);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({
    recordingInProgress: defaultValues.recordingInProgress,
  });

  await expect(storage.get.recordingInProgress()).resolves.toBe(
    defaultValues.recordingInProgress
  );
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("recordingInProgress");
});

test("cameraBubbleVisible", async () => {
  await storage.set.cameraBubbleVisible(defaultValues.cameraBubbleVisible);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({
    cameraBubbleVisible: defaultValues.cameraBubbleVisible,
  });

  await expect(storage.get.cameraBubbleVisible()).resolves.toBe(
    defaultValues.cameraBubbleVisible
  );
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("cameraBubbleVisible");
});

test("microphoneAllowed", async () => {
  await storage.set.microphoneAllowed(defaultValues.microphoneAllowed);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({
    microphoneAllowed: defaultValues.microphoneAllowed,
  });

  await expect(storage.get.microphoneAllowed()).resolves.toBe(
    defaultValues.microphoneAllowed
  );
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("microphoneAllowed");
});
