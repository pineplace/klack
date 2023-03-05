/*
 * NOTE: `storage.ts` initializes `chrome.storage.local`
 *       on import and test fails without this override
 */
globalThis.chrome = {
  storage: {
    // @ts-expect-error Chrome methods mocking
    local: {
      set: jest.fn().mockResolvedValue({}),
      get: jest.fn().mockResolvedValue({
        currentTabId: 1,
        recordingTabId: 2,
        currentWindowId: 3,
        recordingWindowId: 4,
        recordingInProgress: true,
        cameraBubbleVisible: true,
        microphoneAllowed: false,
      }),
    },
  },
};

import { storage } from "../storage";

test("currentTabId", async () => {
  await storage.set.currentTabId(1);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({ currentTabId: 1 });

  await expect(storage.get.currentTabId()).resolves.toBe(1);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("currentTabId");
});

test("recordingTabId", async () => {
  await storage.set.recordingTabId(2);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({ recordingTabId: 2 });

  await expect(storage.get.recordingTabId()).resolves.toBe(2);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("recordingTabId");
});

test("currentWindowId", async () => {
  await storage.set.currentWindowId(3);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({ currentWindowId: 3 });

  await expect(storage.get.currentWindowId()).resolves.toBe(3);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("currentWindowId");
});

test("recordignWindowId", async () => {
  await storage.set.recordingWindowId(4);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({ recordingWindowId: 4 });

  await expect(storage.get.recordingWindowId()).resolves.toBe(4);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("recordingWindowId");
});

test("recordingInProgress", async () => {
  await storage.set.recordingInProgress(true);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({
    recordingInProgress: true,
  });

  await expect(storage.get.recordingInProgress()).resolves.toBe(true);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("recordingInProgress");
});

test("cameraBubbleVisible", async () => {
  await storage.set.cameraBubbleVisible(true);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({
    cameraBubbleVisible: true,
  });

  await expect(storage.get.cameraBubbleVisible()).resolves.toBe(true);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("cameraBubbleVisible");
});

test("microphoneAllowed", async () => {
  await storage.set.microphoneAllowed(false);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toBeCalledWith({
    microphoneAllowed: false,
  });

  await expect(storage.get.microphoneAllowed()).resolves.toBe(false);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("microphoneAllowed");
});
