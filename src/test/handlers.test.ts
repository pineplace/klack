/*
 * NOTE: `handlers.ts` initializes `chrome.storage.local` on import
 * and test fails without this override
 */
globalThis.chrome = {
  // @ts-expect-error Chrome methods mocking
  downloads: {
    download: jest.fn().mockResolvedValue({}),
  },
  // @ts-expect-error Chrome methods mocking
  scripting: {
    executeScript: jest.fn().mockResolvedValue({}),
  },
  storage: {
    // @ts-expect-error Chrome methods mocking
    local: {
      set: jest.fn().mockResolvedValue({}),
      get: jest.fn().mockResolvedValue({
        tabId: 1,
        recordingInProgress: true,
        cameraBubbleVisible: true,
        screenRecordingTabId: 2,
      }),
    },
  },
  // @ts-expect-error Chrome methods mocking
  tabs: {
    sendMessage: jest.fn(),
  },
};

import {
  handleCancelRecording,
  handleDownloadRecording,
  handleGetIsCameraBubbleVisible,
  handleGetRecordingInProgress,
  handleHideCameraBubble,
  handleShowCameraBubble,
  handleStartRecording,
  handleStopRecording,
  handleTabChange,
} from "../handlers";
import { Method } from "../messaging";

test("handleStartRecording", async () => {
  await handleStartRecording({});

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("tabId");
  expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
    target: { tabId: 1 },
    files: ["./screenSharing.bundle.mjs"],
  });
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toHaveBeenCalledWith({
    recordingInProgress: true,
    screenRecordingTabId: 1,
  });
});

test("handleStopRecording", async () => {
  await handleStopRecording({});
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("screenRecordingTabId");

  expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(2, {
    method: Method.TabStopMediaRecorder,
  });

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toHaveBeenCalledWith({
    recordingInProgress: false,
    screenRecordingTabId: 0,
  });
});

test("handleCancelRecording", async () => {
  await handleCancelRecording({});

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toHaveBeenCalledWith({
    recordingInProgress: false,
    screenRecordingTabId: 0,
  });
});

test("handleDownloadRecording", async () => {
  await handleDownloadRecording({ downloadUrl: "some-recording-url" });

  expect(chrome.downloads.download).toHaveBeenCalledWith({
    url: "some-recording-url",
  });
});

test("handleShowCameraBubble", async () => {
  await handleShowCameraBubble({});

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("tabId");
  expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
    target: { tabId: 1 },
    files: ["./cameraBubble.bundle.mjs"],
  });
});

test("handleHideCameraBubble", async () => {
  await handleHideCameraBubble({});

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("tabId");
  expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
    target: { tabId: 1 },
    func: expect.any(Function) as () => void,
  });
});

test("handleTabChange", async () => {
  await handleTabChange({ newTabId: 2 });

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toHaveBeenCalledWith({
    tabId: 2,
  });
});

test("handleGetRecordingInProgress", async () => {
  expect(await handleGetRecordingInProgress()).toEqual(true);
});

test("handleGetIsCameraBubbleVisible", async () => {
  expect(await handleGetIsCameraBubbleVisible()).toEqual(true);
});
