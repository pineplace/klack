/*
 * NOTE: `handlers.ts` depends on `storage.ts` that initializes
 *       `chrome.storage.local` on import and test fails without
 *       this override
 */
globalThis.chrome = {
  // @ts-expect-error Chrome methods mocking
  downloads: {
    download: jest.fn().mockResolvedValue({}),
  },
  // @ts-expect-error Chrome methods mocking
  runtime: {
    getURL: jest.fn().mockReturnValue("chrome-extension://some-url"),
  },
  // @ts-expect-error Chrome methods mocking
  scripting: {
    executeScript: jest.fn().mockResolvedValue({}),
  },
  storage: {
    // @ts-expect-error Chrome methods mocking
    local: {
      set: jest.fn().mockResolvedValue({}),
      get: jest.fn().mockResolvedValue({}),
    },
  },
  // @ts-expect-error Chrome methods mocking
  tabs: {
    sendMessage: jest.fn(),
    create: jest.fn().mockResolvedValue({ id: 12 }),
    remove: jest.fn(),
    query: jest.fn().mockResolvedValue([{ id: 111 }]),
  },
  // @ts-expect-error Chrome methods mocking
  windows: {
    create: jest.fn().mockResolvedValue({ id: 777 }),
    getCurrent: jest.fn().mockResolvedValue({ id: 7 }),
    update: jest.fn(),
  },
};

import {
  handleAllowMicrophone,
  handleCancelRecording,
  handleDisallowMicrophone,
  handleDownloadRecording,
  handleHideCameraBubble,
  handleOpenUserActiveWindow,
  handleShowCameraBubble,
  handleStartRecording,
  handleStopRecording,
  handleTabChange,
  handleTabUpdated,
  handleWindowChange,
} from "../handlers";
import { Method } from "../messaging";
jest.mock("../storage", () => {
  return {
    storage: {
      reset: jest.fn().mockResolvedValue({}),
      set: {},
      get: {},
    },
  };
});
import { storage } from "../storage";

beforeEach(() => {
  storage.set.currentTabId = jest.fn();
  storage.set.recordingWindowId = jest.fn();
  storage.set.currentWindowId = jest.fn();
  storage.set.recordingTabId = jest.fn();
  storage.set.cameraBubbleVisible = jest.fn();
  storage.set.microphoneAllowed = jest.fn();
  storage.set.recordingInProgress = jest.fn();

  storage.get.currentTabId = jest.fn().mockResolvedValue(1);
  storage.get.currentWindowId = jest.fn().mockResolvedValue(7);
  storage.get.recordingWindowId = jest.fn().mockResolvedValue(8);
  storage.get.recordingTabId = jest.fn().mockResolvedValue(9);
  storage.get.cameraBubbleVisible = jest.fn().mockResolvedValue(false);
});

test("handleStartRecording", async () => {
  await handleStartRecording({});

  expect(chrome.tabs.create).toHaveBeenCalledWith({
    active: false,
    url: "chrome-extension://some-url",
  });
  expect(chrome.windows.create).toHaveBeenCalledWith({
    focused: true,
    tabId: 12,
    width: 650,
    height: 710,
  });
  expect(storage.set.recordingTabId).toHaveBeenCalledWith(12);
  expect(storage.set.recordingWindowId).toHaveBeenCalledWith(777);
  expect(storage.set.recordingInProgress).toHaveBeenCalledWith(true);
});

test("handleStopRecording", async () => {
  await handleStopRecording({});

  expect(storage.get.recordingTabId).toHaveBeenCalled();
  expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(9, {
    method: Method.TabStopMediaRecorder,
  });
});

test("handleCancelRecording", async () => {
  await handleCancelRecording({});

  expect(storage.set.recordingTabId).toHaveBeenCalledWith(0);
  expect(storage.set.recordingInProgress).toHaveBeenCalledWith(false);
});

test("handleDownloadRecording", async () => {
  await handleDownloadRecording({ downloadUrl: "some-recording-url" });

  expect(chrome.downloads.download).toHaveBeenCalledWith({
    url: "some-recording-url",
  });

  expect(storage.get.recordingTabId).toHaveBeenCalled();
  expect(chrome.tabs.remove).toHaveBeenCalledWith(9);
  expect(storage.set.recordingInProgress).toHaveBeenCalledWith(false);
  expect(storage.set.recordingTabId).toHaveBeenCalledWith(0);
});

test("handleShowCameraBubble", async () => {
  await handleShowCameraBubble({});

  expect(storage.get.currentTabId).toHaveBeenCalled();
  expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
    target: { tabId: 1 },
    files: ["./cameraBubble.bundle.mjs"],
  });
});

test("handleHideCameraBubble", async () => {
  await handleHideCameraBubble({});

  expect(storage.get.currentTabId).toHaveBeenCalled();
  expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
    target: { tabId: 1 },
    func: expect.any(Function) as () => void,
  });
});

test("handleAllowMicrophone", async () => {
  await handleAllowMicrophone({});

  expect(storage.set.microphoneAllowed).toHaveBeenCalledWith(true);
});

test("handleDisallowMicrophone", async () => {
  await handleDisallowMicrophone({});

  expect(storage.set.microphoneAllowed).toHaveBeenCalledWith(false);
});

describe("handleTabChange", () => {
  test("`newTabId` is different from `screenRecordingTabId`", async () => {
    await handleTabChange({ newTabId: 2 });

    expect(storage.get.recordingTabId).toHaveBeenCalled();
    expect(storage.set.currentTabId).toHaveBeenCalledWith(2);
  });

  test("`newTabId` is the same as `screenRecordingTabId`", async () => {
    storage.get.recordingTabId = jest.fn().mockResolvedValue(9);

    await handleTabChange({ newTabId: 9 });

    expect(storage.set.currentTabId).not.toHaveBeenCalled();
  });
});

test("handleTabUpdated", async () => {
  await handleTabUpdated({});

  expect(storage.get.cameraBubbleVisible).toHaveBeenCalled();
});

test("handleOpenUserActiveWindow", async () => {
  await handleOpenUserActiveWindow({});

  expect(storage.get.currentWindowId).toHaveBeenCalled();
  expect(chrome.windows.update).toHaveBeenCalledWith(7, {
    focused: true,
  });
});

describe("handleWindowChange", () => {
  test("Non recordingId or <= 0", async () => {
    await handleWindowChange({ newWindowId: 10 });

    expect(storage.get.recordingWindowId).toHaveBeenCalled();
    expect(chrome.tabs.query).toHaveBeenCalled();
    expect(storage.set.currentWindowId).toHaveBeenCalledWith(10);
  });

  test("newWindowId <= 0", async () => {
    await handleWindowChange({ newWindowId: -1 });

    expect(storage.get.recordingWindowId).not.toHaveBeenCalled();
  });

  test("newWindowId equals to recordingWindowId", async () => {
    await handleWindowChange({ newWindowId: 8 });

    expect(storage.get.recordingWindowId).toHaveBeenCalled();
    expect(storage.set.currentWindowId).not.toHaveBeenCalled();
  });
});
