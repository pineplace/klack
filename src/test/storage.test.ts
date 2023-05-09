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
  cameraBubbleSize: { width: 200, height: 200 },
} satisfies Context;

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
        recordingOnPause: defaultValues.recordingOnPause,
        cameraBubbleVisible: defaultValues.cameraBubbleVisible,
        microphoneAllowed: defaultValues.microphoneAllowed,
        cameraBubbleSize: defaultValues.cameraBubbleSize,
      } satisfies Context),
    },
  },
};
const { storage } = await import("../storage");

beforeEach(() => {
  // @ts-expect-error Chrome methods mocking
  globalThis.chrome.storage.local.set = jest.fn().mockResolvedValue({});
  // @ts-expect-error Chrome methods mocking
  globalThis.chrome.storage.local.get = jest.fn().mockResolvedValue({
    currentTabId: defaultValues.currentTabId,
    cameraBubbleTabId: defaultValues.cameraBubbleTabId,
    recordingTabId: defaultValues.recordingTabId,
    currentWindowId: defaultValues.currentWindowId,
    recordingWindowId: defaultValues.recordingWindowId,
    recordingInProgress: defaultValues.recordingInProgress,
    recordingOnPause: defaultValues.recordingOnPause,
    cameraBubbleVisible: defaultValues.cameraBubbleVisible,
    microphoneAllowed: defaultValues.microphoneAllowed,
    cameraBubbleSize: defaultValues.cameraBubbleSize,
  } satisfies Context);
});

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

test("recordingOnPause", async () => {
  await storage.set.recordingOnPause(true);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toHaveBeenCalledWith({
    recordingOnPause: true,
  });

  await expect(storage.get.recordingOnPause()).resolves.toBe(
    defaultValues.recordingOnPause
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
    defaultValues.cameraBubbleSize
  );
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("cameraBubbleSize");
});
