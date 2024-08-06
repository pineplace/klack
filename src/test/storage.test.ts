import { jest } from "@jest/globals";
import type { Context } from "../storage";

const defaultValues = {
  currentTabId: 1,
  cameraBubbleTabId: 2,
  recordingTabId: 3,
  currentWindowId: 4,
  recordingWindowId: 5,
  recordingInProgress: true,
  recordingOnPause: false,
  cameraBubbleVisible: true,
  microphoneAllowed: false,
  microphoneDeviceId: "aabbccdd123",
  microphoneVolumeLevel: 0,
  cameraBubbleSize: { width: 200, height: 200 },
  cameraBubblePosition: { x: 0, y: 0 },
  cameraDeviceId: "aabbccdd321",
  recordingDuration: 0,
} satisfies Context;

globalThis.chrome = {
  storage: {
    local: {
      // @ts-expect-error Chrome methods mocking
      set: jest.fn().mockResolvedValue({}),
      get: (jest.fn() as jest.Mock<() => Promise<Context>>).mockResolvedValue({
        currentTabId: defaultValues.currentTabId,
        cameraBubbleTabId: defaultValues.cameraBubbleTabId,
        recordingTabId: defaultValues.recordingTabId,
        currentWindowId: defaultValues.currentWindowId,
        recordingWindowId: defaultValues.recordingWindowId,
        recordingInProgress: defaultValues.recordingInProgress,
        recordingOnPause: defaultValues.recordingOnPause,
        cameraBubbleVisible: defaultValues.cameraBubbleVisible,
        microphoneAllowed: defaultValues.microphoneAllowed,
        microphoneDeviceId: "aabbccdd123",
        microphoneVolumeLevel: 0,
        cameraBubbleSize: defaultValues.cameraBubbleSize,
        cameraBubblePosition: { x: 0, y: 0 },
        cameraDeviceId: "aabbccdd321",
        recordingDuration: 0,
      } satisfies Context),
    },
  },
};
const { storage } = await import("../storage");

beforeEach(() => {
  // @ts-expect-error Chrome methods mocking
  globalThis.chrome.storage.local.set = jest.fn().mockResolvedValue({});
  globalThis.chrome.storage.local.get = (
    jest.fn() as jest.Mock<() => Promise<Context>>
  ).mockResolvedValue({
    currentTabId: defaultValues.currentTabId,
    cameraBubbleTabId: defaultValues.cameraBubbleTabId,
    recordingTabId: defaultValues.recordingTabId,
    currentWindowId: defaultValues.currentWindowId,
    recordingWindowId: defaultValues.recordingWindowId,
    recordingInProgress: defaultValues.recordingInProgress,
    recordingOnPause: defaultValues.recordingOnPause,
    cameraBubbleVisible: defaultValues.cameraBubbleVisible,
    microphoneAllowed: defaultValues.microphoneAllowed,
    microphoneDeviceId: "aabbccdd123",
    microphoneVolumeLevel: 0,
    cameraBubbleSize: defaultValues.cameraBubbleSize,
    cameraBubblePosition: { x: 0, y: 0 },
    cameraDeviceId: "aabbccdd321",
    recordingDuration: 0,
  } satisfies Context);
});

test("currentTabId", async () => {
  await storage.set.currentTabId(defaultValues.currentTabId);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({
    currentTabId: defaultValues.currentTabId,
  });

  await expect(storage.get.currentTabId()).resolves.toBe(
    defaultValues.currentTabId,
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
    defaultValues.cameraBubbleTabId,
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
    defaultValues.recordingTabId,
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
    defaultValues.currentWindowId,
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
    defaultValues.recordingWindowId,
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
    defaultValues.recordingInProgress,
  );
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("recordingInProgress");
});

test("recordingOnPause", async () => {
  await storage.set.recordingOnPause(true);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toHaveBeenCalledWith({
    recordingOnPause: true,
  });

  await expect(storage.get.recordingOnPause()).resolves.toBe(
    defaultValues.recordingOnPause,
  );
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("recordingOnPause");
});

test("cameraBubbleVisible", async () => {
  await storage.set.cameraBubbleVisible(defaultValues.cameraBubbleVisible);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({
    cameraBubbleVisible: defaultValues.cameraBubbleVisible,
  });

  await expect(storage.get.cameraBubbleVisible()).resolves.toBe(
    defaultValues.cameraBubbleVisible,
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
    defaultValues.microphoneAllowed,
  );
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("microphoneAllowed");
});

test("microphoneDeviceId", async () => {
  await storage.set.microphoneDeviceId(defaultValues.microphoneDeviceId);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({
    microphoneDeviceId: defaultValues.microphoneDeviceId,
  });

  await expect(storage.get.microphoneDeviceId()).resolves.toBe(
    defaultValues.microphoneDeviceId,
  );
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("microphoneDeviceId");
});

test("microphoneVolumeLevel", async () => {
  await storage.set.microphoneVolumeLevel(defaultValues.microphoneVolumeLevel);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toHaveBeenCalledWith({
    microphoneVolumeLevel: defaultValues.microphoneVolumeLevel,
  });

  await expect(storage.get.microphoneVolumeLevel()).resolves.toBe(
    defaultValues.microphoneVolumeLevel,
  );
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith(
    "microphoneVolumeLevel",
  );
});

test("cameraBubbleSize", async () => {
  await storage.set.cameraBubbleSize({ width: 100, height: 100 });
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({
    cameraBubbleSize: {
      width: 100,
      height: 100,
    },
  });

  await expect(storage.get.cameraBubbleSize()).resolves.toBe(
    defaultValues.cameraBubbleSize,
  );
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("cameraBubbleSize");
});

test("cameraBubblePosition", async () => {
  await storage.set.cameraBubblePosition({ x: 10, y: 350 });
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({
    cameraBubblePosition: {
      x: 10,
      y: 350,
    },
  });

  await expect(storage.get.cameraBubblePosition()).resolves.toStrictEqual(
    defaultValues.cameraBubblePosition,
  );
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("cameraBubblePosition");
});

test("cameraDeviceId", async () => {
  await storage.set.cameraDeviceId(defaultValues.cameraDeviceId);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({
    cameraDeviceId: defaultValues.cameraDeviceId,
  });

  await expect(storage.get.cameraDeviceId()).resolves.toStrictEqual(
    defaultValues.cameraDeviceId,
  );
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("cameraDeviceId");
});

test("recordingDuration", async () => {
  await storage.set.recordingDuration(defaultValues.recordingDuration);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({
    recordingDuration: defaultValues.recordingDuration,
  });

  await expect(storage.get.recordingDuration()).resolves.toStrictEqual(
    defaultValues.recordingDuration,
  );
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("recordingDuration");
});
