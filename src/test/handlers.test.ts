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
      get: jest.fn().mockResolvedValue({
        userActiveTabId: 1,
        userActiveWindowId: 7,
        recordingInProgress: true,
        cameraBubbleVisible: true,
        microphoneAllowed: false,
        screenRecordingTabId: 9,
      }),
    },
  },
  // @ts-expect-error Chrome methods mocking
  tabs: {
    sendMessage: jest.fn(),
    create: jest.fn().mockResolvedValue({ id: 12 }),
    remove: jest.fn(),
  },
  // @ts-expect-error Chrome methods mocking
  windows: {
    create: jest.fn(),
    getCurrent: jest.fn().mockResolvedValue({ id: 7 }),
    update: jest.fn(),
  },
};

import {
  handleAllowMicrophone,
  handleCancelRecording,
  handleDisallowMicrophone,
  handleDownloadRecording,
  handleGetIsCameraBubbleVisible,
  handleGetIsMicrophoneAllowed,
  handleGetRecordingInProgress,
  handleHideCameraBubble,
  handleOpenUserActiveWindow,
  handleShowCameraBubble,
  handleStartRecording,
  handleStopRecording,
  handleTabChange,
  handleTabUpdated,
} from "../handlers";
import { Method } from "../messaging";

test("handleStartRecording", async () => {
  await handleStartRecording({});

  expect(chrome.windows.getCurrent).toHaveBeenCalled();
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
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toHaveBeenCalledWith({
    recordingInProgress: true,
    screenRecordingTabId: 12,
    userActiveWindowId: 7,
  });
});

test("handleStopRecording", async () => {
  await handleStopRecording({});
  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("screenRecordingTabId");

  expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(9, {
    method: Method.TabStopMediaRecorder,
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

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("screenRecordingTabId");

  expect(chrome.tabs.remove).toHaveBeenCalledWith(9);

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toHaveBeenCalledWith({
    recordingInProgress: false,
    screenRecordingTabId: 0,
  });
});

test("handleShowCameraBubble", async () => {
  await handleShowCameraBubble({});

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("userActiveTabId");
  expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
    target: { tabId: 1 },
    files: ["./cameraBubble.bundle.mjs"],
  });
});

test("handleHideCameraBubble", async () => {
  await handleHideCameraBubble({});

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("userActiveTabId");
  expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
    target: { tabId: 1 },
    func: expect.any(Function) as () => void,
  });
});

test("handleAllowMicrophone", async () => {
  await handleAllowMicrophone({});

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toHaveBeenCalledWith({
    microphoneAllowed: true,
  });
});

test("handleDisallowMicrophone", async () => {
  await handleDisallowMicrophone({});

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toHaveBeenCalledWith({
    microphoneAllowed: false,
  });
});

describe("handleTabChange", () => {
  test("`newTabId` is different from `screenRecordingTabId`", async () => {
    await handleTabChange({ newTabId: 2 });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(chrome.storage.local.get).toHaveBeenCalledWith(
      "screenRecordingTabId"
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(chrome.storage.local.set).toHaveBeenCalledWith({
      userActiveTabId: 2,
    });
  });

  test("`newTabId` is the same as `screenRecordingTabId`", async () => {
    chrome.storage.local.set = jest.fn();

    await handleTabChange({ newTabId: 9 });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(chrome.storage.local.set).not.toHaveBeenCalled();
  });
});

test("handleTabUpdated", async () => {
  await handleTabUpdated({});
  /* NOTE: `handleTabUpdated` calls `handleGetIsCameraBubbleVisible` and `handleShowCameraBubble`
           which are already checked in their own tests
   */
});

test("handleOpenUserActiveWindow", async () => {
  await handleOpenUserActiveWindow({});

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("userActiveWindowId");
  expect(chrome.windows.update).toHaveBeenCalledWith(7, {
    focused: true,
  });
});

test("handleGetRecordingInProgress", async () => {
  expect(await handleGetRecordingInProgress()).toEqual(true);
});

test("handleGetIsCameraBubbleVisible", async () => {
  expect(await handleGetIsCameraBubbleVisible()).toEqual(true);
});

test("handleGetIsMicrophoneAllowed", async () => {
  expect(await handleGetIsMicrophoneAllowed()).toEqual(false);

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("microphoneAllowed");
});
