import { jest } from "@jest/globals";
import { Method } from "../messaging";
jest.unstable_mockModule("../storage", () => {
  return {
    storage: {
      reset: (jest.fn() as jest.Mock<() => Promise<void>>).mockResolvedValue(),
      set: {},
      get: {},
    },
  };
});
const { storage: mockedStorage } = await import("../storage");
const {
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
  handleTabClosing,
  handleTabUpdated,
  handleWindowChange,
} = await import("../handlers");

beforeEach(() => {
  globalThis.chrome = {
    downloads: {
      // @ts-expect-error Chrome methods mocking
      download: jest.fn().mockResolvedValue(1),
    },
    runtime: {
      // @ts-expect-error Chrome methods mocking
      getURL: jest
        .fn()
        .mockReturnValue("chrome-extension://mocked-url-for-getURL"),
    },
    scripting: {
      // @ts-expect-error Chrome methods mocking
      executeScript: jest.fn().mockResolvedValue({}),
    },
    tabs: {
      // @ts-expect-error Chrome methods mocking
      sendMessage: jest.fn().mockResolvedValue(),
      // @ts-expect-error Chrome methods mocking
      create: jest.fn().mockResolvedValue({ id: 1 }),
      // @ts-expect-error Chrome methods mocking
      remove: jest.fn().mockResolvedValue(),
      // @ts-expect-error Chrome methods mocking
      query: jest.fn().mockResolvedValue([{ id: 2 }]),
    },
    windows: {
      // @ts-expect-error Chrome methods mocking
      create: jest.fn().mockResolvedValue({ id: 3 }),
      // @ts-expect-error Chrome methods mocking
      update: jest.fn(),
    },
  };

  mockedStorage.set.currentTabId = (
    jest.fn() as jest.Mock<(tabId: number) => Promise<void>>
  ).mockResolvedValue();
  mockedStorage.get.currentTabId = (
    jest.fn() as jest.Mock<() => Promise<number>>
  ).mockResolvedValue(1);

  mockedStorage.set.recordingTabId = (
    jest.fn() as jest.Mock<(tabId: number) => Promise<void>>
  ).mockResolvedValue();
  mockedStorage.get.recordingTabId = (
    jest.fn() as jest.Mock<() => Promise<number>>
  ).mockResolvedValue(2);

  mockedStorage.set.currentWindowId = (
    jest.fn() as jest.Mock<(windowId: number) => Promise<void>>
  ).mockResolvedValue();
  mockedStorage.get.currentWindowId = (
    jest.fn() as jest.Mock<() => Promise<number>>
  ).mockResolvedValue(3);

  mockedStorage.set.recordingWindowId = (
    jest.fn() as jest.Mock<(windowId: number) => Promise<void>>
  ).mockResolvedValue();
  mockedStorage.get.recordingWindowId = (
    jest.fn() as jest.Mock<() => Promise<number>>
  ).mockResolvedValue(4);

  mockedStorage.set.recordingInProgress = (
    jest.fn() as jest.Mock<(value: boolean) => Promise<void>>
  ).mockResolvedValue();

  mockedStorage.set.cameraBubbleVisible = (
    jest.fn() as jest.Mock<(value: boolean) => Promise<void>>
  ).mockResolvedValue();
  mockedStorage.get.cameraBubbleVisible = (
    jest.fn() as jest.Mock<() => Promise<boolean>>
  ).mockResolvedValue(false);

  mockedStorage.set.microphoneAllowed = (
    jest.fn() as jest.Mock<(value: boolean) => Promise<void>>
  ).mockResolvedValue();
});

test("handleStartRecording", async () => {
  await handleStartRecording({});

  expect(chrome.tabs.create).toHaveBeenCalledWith({
    active: false,
    url: "chrome-extension://mocked-url-for-getURL",
  });
  expect(chrome.windows.create).toHaveBeenCalledWith({
    focused: true,
    tabId: 1,
    width: 650,
    height: 710,
  });
  expect(mockedStorage.set.recordingTabId).toHaveBeenCalledWith(1);
  expect(mockedStorage.set.recordingWindowId).toHaveBeenCalledWith(3);
  expect(mockedStorage.set.recordingInProgress).toHaveBeenCalledWith(true);
});

test("handleStopRecording", async () => {
  await handleStopRecording({});

  expect(mockedStorage.get.recordingTabId).toHaveBeenCalled();
  expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(2, {
    method: Method.TabStopMediaRecorder,
  });
});

test("handleCancelRecording", async () => {
  await handleCancelRecording({});

  expect(mockedStorage.set.recordingTabId).toHaveBeenCalledWith(0);
  expect(mockedStorage.set.recordingInProgress).toHaveBeenCalledWith(false);
});

test("handleDownloadRecording", async () => {
  await handleDownloadRecording({ downloadUrl: "some-recording-url" });

  expect(chrome.downloads.download).toHaveBeenCalledWith({
    url: "some-recording-url",
  });

  expect(mockedStorage.get.recordingTabId).toHaveBeenCalled();
  expect(chrome.tabs.remove).toHaveBeenCalledWith(2);
  expect(mockedStorage.set.recordingInProgress).toHaveBeenCalledWith(false);
  expect(mockedStorage.set.recordingTabId).toHaveBeenCalledWith(0);
});

test("handleShowCameraBubble", async () => {
  await handleShowCameraBubble({});

  expect(mockedStorage.get.currentTabId).toHaveBeenCalled();
  expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
    target: { tabId: 1 },
    files: ["./cameraBubble.bundle.mjs"],
  });
});

test("handleHideCameraBubble", async () => {
  await handleHideCameraBubble({});

  expect(mockedStorage.get.currentTabId).toHaveBeenCalled();
  expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
    target: { tabId: 1 },
    func: expect.any(Function) as () => void,
  });
});

test("handleAllowMicrophone", async () => {
  await handleAllowMicrophone({});

  expect(mockedStorage.set.microphoneAllowed).toHaveBeenCalledWith(true);
});

test("handleDisallowMicrophone", async () => {
  await handleDisallowMicrophone({});

  expect(mockedStorage.set.microphoneAllowed).toHaveBeenCalledWith(false);
});

describe("handleTabChange", () => {
  test("`newTabId` is different from `screenRecordingTabId`", async () => {
    await handleTabChange({ newTabId: 3 });

    expect(mockedStorage.get.recordingTabId).toHaveBeenCalled();
    expect(mockedStorage.set.currentTabId).toHaveBeenCalledWith(3);
  });

  test("`newTabId` is the same as `screenRecordingTabId`", async () => {
    await handleTabChange({ newTabId: 2 });

    expect(mockedStorage.set.currentTabId).not.toHaveBeenCalled();
  });
});

test("handleTabClosing", async () => {
  await handleTabClosing({ closedTabId: 12 });

  expect(mockedStorage.set.cameraBubbleVisible).toHaveBeenCalledWith(false);
  expect(mockedStorage.set.recordingTabId).toHaveBeenCalledWith(0);
});

test("handleTabUpdated", async () => {
  await handleTabUpdated({});

  expect(mockedStorage.get.cameraBubbleVisible).toHaveBeenCalled();
});

test("handleOpenUserActiveWindow", async () => {
  await handleOpenUserActiveWindow({});

  expect(mockedStorage.get.currentWindowId).toHaveBeenCalled();
  expect(chrome.windows.update).toHaveBeenCalledWith(3, {
    focused: true,
  });
});

describe("handleWindowChange", () => {
  test("Is not equals to recordingId and >= 0", async () => {
    await handleWindowChange({ newWindowId: 10 });

    expect(mockedStorage.get.recordingWindowId).toHaveBeenCalled();
    expect(chrome.tabs.query).toHaveBeenCalledWith({
      active: true,
      windowId: 10,
    });
    expect(mockedStorage.set.currentWindowId).toHaveBeenCalledWith(10);
  });

  test("newWindowId <= 0", async () => {
    await handleWindowChange({ newWindowId: -1 });

    expect(mockedStorage.get.recordingWindowId).not.toHaveBeenCalled();
  });

  test("newWindowId equals to recordingWindowId", async () => {
    await handleWindowChange({ newWindowId: 4 });

    expect(mockedStorage.get.recordingWindowId).toHaveBeenCalled();
    expect(mockedStorage.set.currentWindowId).not.toHaveBeenCalled();
  });
});
