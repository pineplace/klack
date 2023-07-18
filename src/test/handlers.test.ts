import { jest } from "@jest/globals";
import { Method } from "../messaging";
jest.unstable_mockModule("../storage", () => {
  return {
    storage: {
      set: {
        currentTabId: (
          jest.fn() as jest.Mock<() => Promise<void>>
        ).mockResolvedValue(),
        cameraBubbleTabId: (
          jest.fn() as jest.Mock<() => Promise<void>>
        ).mockResolvedValue(),
        recordingTabId: (
          jest.fn() as jest.Mock<() => Promise<void>>
        ).mockResolvedValue(),
        currentWindowId: (
          jest.fn() as jest.Mock<() => Promise<void>>
        ).mockResolvedValue(),
        recordingWindowId: (
          jest.fn() as jest.Mock<() => Promise<void>>
        ).mockResolvedValue(),
        recordingInProgress: (
          jest.fn() as jest.Mock<() => Promise<void>>
        ).mockResolvedValue(),
        recordingOnPause: (
          jest.fn() as jest.Mock<() => Promise<void>>
        ).mockResolvedValue(),
        cameraBubbleVisible: (
          jest.fn() as jest.Mock<() => Promise<void>>
        ).mockResolvedValue(),
        microphoneAllowed: (
          jest.fn() as jest.Mock<() => Promise<void>>
        ).mockResolvedValue(),
        cameraBubbleSize: (
          jest.fn() as jest.Mock<() => Promise<void>>
        ).mockResolvedValue(),
        cameraBubblePosition: (
          jest.fn() as jest.Mock<() => Promise<void>>
        ).mockResolvedValue(),
      },
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
  handlePauseRecording,
  handleResumeRecording,
  handleDeleteRecording,
  handleTabChange,
  handleTabClosing,
  handleTabUpdated,
  handleWindowChange,
} = await import("../handlers");

const defaultValues = {
  currentTabId: 1,
  cameraBubbleTabId: 2,
  recordingTabId: 3,
  currentWindowId: 4,
  recordingWindowId: 5,
  cameraBubbleVisible: false,
};

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
  ).mockResolvedValue(defaultValues.currentTabId);

  mockedStorage.set.cameraBubbleTabId = (
    jest.fn() as jest.Mock<(tabId: number) => Promise<void>>
  ).mockResolvedValue();
  mockedStorage.get.cameraBubbleTabId = (
    jest.fn() as jest.Mock<() => Promise<number>>
  ).mockResolvedValue(defaultValues.cameraBubbleTabId);

  mockedStorage.set.recordingTabId = (
    jest.fn() as jest.Mock<(tabId: number) => Promise<void>>
  ).mockResolvedValue();
  mockedStorage.get.recordingTabId = (
    jest.fn() as jest.Mock<() => Promise<number>>
  ).mockResolvedValue(defaultValues.recordingTabId);

  mockedStorage.set.currentWindowId = (
    jest.fn() as jest.Mock<(windowId: number) => Promise<void>>
  ).mockResolvedValue();
  mockedStorage.get.currentWindowId = (
    jest.fn() as jest.Mock<() => Promise<number>>
  ).mockResolvedValue(defaultValues.currentWindowId);

  mockedStorage.set.recordingWindowId = (
    jest.fn() as jest.Mock<(windowId: number) => Promise<void>>
  ).mockResolvedValue();
  mockedStorage.get.recordingWindowId = (
    jest.fn() as jest.Mock<() => Promise<number>>
  ).mockResolvedValue(defaultValues.recordingWindowId);

  mockedStorage.set.recordingInProgress = (
    jest.fn() as jest.Mock<(value: boolean) => Promise<void>>
  ).mockResolvedValue();

  mockedStorage.set.recordingOnPause = (
    jest.fn() as jest.Mock<(value: boolean) => Promise<void>>
  ).mockResolvedValue();

  mockedStorage.set.cameraBubbleVisible = (
    jest.fn() as jest.Mock<(value: boolean) => Promise<void>>
  ).mockResolvedValue();
  mockedStorage.get.cameraBubbleVisible = (
    jest.fn() as jest.Mock<() => Promise<boolean>>
  ).mockResolvedValue(defaultValues.cameraBubbleVisible);

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
  expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
    defaultValues.recordingTabId,
    {
      method: Method.TabStopMediaRecorder,
      args: {
        downloadRecording: true,
      },
    },
  );
});

test("handlePauseRecording", async () => {
  await handlePauseRecording({});

  expect(mockedStorage.set.recordingOnPause).toHaveBeenCalledWith(true);
  expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
    defaultValues.recordingTabId,
    {
      method: Method.TabPauseMediaRecorder,
    },
  );
});

test("handleResumeRecording", async () => {
  await handleResumeRecording({});

  expect(mockedStorage.set.recordingOnPause).toHaveBeenCalledWith(false);
  expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
    defaultValues.recordingTabId,
    {
      method: Method.TabResumeMediaRecorder,
    },
  );
});

test("handleDeleteRecording", async () => {
  await handleDeleteRecording({});

  expect(mockedStorage.get.recordingTabId).toHaveBeenCalled();
  expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
    defaultValues.recordingTabId,
    {
      method: Method.TabStopMediaRecorder,
      args: {
        downloadRecording: false,
      },
    },
  );
});

test("handleCancelRecording", async () => {
  await handleCancelRecording({});

  expect(chrome.tabs.remove).toHaveBeenCalledWith(defaultValues.recordingTabId);
  expect(mockedStorage.set.recordingTabId).toHaveBeenCalledWith(0);
  expect(mockedStorage.set.recordingInProgress).toHaveBeenCalledWith(false);
  expect(mockedStorage.set.recordingOnPause).toHaveBeenCalledWith(false);
});

test("handleDownloadRecording", async () => {
  await handleDownloadRecording({ downloadUrl: "some-recording-url" });

  expect(chrome.downloads.download).toHaveBeenCalledWith({
    url: "some-recording-url",
  });

  expect(mockedStorage.get.recordingTabId).toHaveBeenCalled();
  expect(chrome.tabs.remove).toHaveBeenCalledWith(defaultValues.recordingTabId);
  expect(mockedStorage.set.recordingInProgress).toHaveBeenCalledWith(false);
  expect(mockedStorage.set.recordingTabId).toHaveBeenCalledWith(0);
  expect(mockedStorage.set.recordingOnPause).toHaveBeenCalledWith(false);
});

test("handleShowCameraBubble", async () => {
  await handleShowCameraBubble({});

  expect(mockedStorage.get.currentTabId).toHaveBeenCalled();
  expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
    target: { tabId: defaultValues.currentTabId },
    files: ["./cameraBubble.bundle.mjs"],
  });
  expect(mockedStorage.set.cameraBubbleTabId).toHaveBeenCalledWith(
    defaultValues.currentTabId,
  );
  expect(mockedStorage.set.cameraBubbleVisible).toHaveBeenCalledWith(true);
});

test("handleHideCameraBubble", async () => {
  await handleHideCameraBubble({});

  expect(mockedStorage.get.cameraBubbleTabId).toHaveBeenCalled();
  expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
    target: { tabId: defaultValues.cameraBubbleTabId },
    func: expect.any(Function) as () => void,
  });
  expect(mockedStorage.set.cameraBubbleTabId).toHaveBeenCalledWith(0);
  expect(mockedStorage.set.cameraBubbleVisible).toHaveBeenCalledWith(false);
  expect(mockedStorage.set.cameraBubbleSize).toHaveBeenCalledWith({
    width: 200,
    height: 200,
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
  test("`newTabId` is different from `screenRecordingTabId` and `cameraBubbleTabId` equals 0", async () => {
    mockedStorage.get.cameraBubbleTabId = (
      jest.fn() as jest.Mock<() => Promise<number>>
    ).mockResolvedValue(0);

    await handleTabChange({ newTabId: defaultValues.currentTabId + 1 });

    expect(mockedStorage.get.recordingTabId).toHaveBeenCalled();
    expect(mockedStorage.set.currentTabId).toHaveBeenCalledWith(
      defaultValues.currentTabId + 1,
    );

    expect(chrome.scripting.executeScript).not.toBeCalled();
    expect(mockedStorage.set.cameraBubbleTabId).not.toBeCalledTimes(2);
  });

  test("`newTabId` is different from `screenRecordingTabId` and `cameraBubbleTabId` not 0", async () => {
    // @ts-expect-error Chrome methods mocking
    globalThis.chrome.scripting.executeScript = jest
      .fn()
      // @ts-expect-error Chrome methods mocking
      .mockRejectedValueOnce({});
    // @ts-expect-error Chrome methods mocking
    globalThis.chrome.scripting.executeScript = jest
      .fn()
      // @ts-expect-error Chrome methods mocking
      .mockResolvedValueOnce({});

    await handleTabChange({ newTabId: defaultValues.currentTabId + 1 });

    expect(mockedStorage.get.recordingTabId).toHaveBeenCalled();
    expect(mockedStorage.set.currentTabId).toHaveBeenCalledWith(
      defaultValues.currentTabId + 1,
    );

    // NOTE: From `handleTabChange` and `handleHideCameraBubble`
    expect(mockedStorage.get.cameraBubbleTabId).toHaveBeenCalledTimes(2);
    // NOTE: From `setStorageDefaultValues` and `handleTabChange`
    expect(mockedStorage.set.cameraBubbleTabId).toHaveBeenCalledTimes(2);
  });

  test("`newTabId` is the same as `screenRecordingTabId`", async () => {
    await handleTabChange({ newTabId: defaultValues.recordingTabId });

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

describe("handleOpenUserActiveWindow", () => {
  test("currentWindowId > 0", async () => {
    await handleOpenUserActiveWindow({});

    expect(mockedStorage.get.currentWindowId).toHaveBeenCalled();
    expect(chrome.windows.update).toHaveBeenCalledWith(
      defaultValues.currentWindowId,
      {
        focused: true,
      },
    );
  });

  test("currentWindowId <= 0", async () => {
    mockedStorage.get.currentWindowId = (
      jest.fn() as jest.Mock<() => Promise<number>>
    ).mockResolvedValue(-1);

    await handleOpenUserActiveWindow({});

    expect(mockedStorage.get.currentWindowId).toHaveBeenCalled();
    expect(chrome.windows.update).not.toHaveBeenCalled();
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

    expect(mockedStorage.get.currentWindowId).not.toHaveBeenCalled();
    expect(mockedStorage.get.recordingWindowId).not.toHaveBeenCalled();
  });

  test("newWindowId equals to currentWindowId", async () => {
    await handleWindowChange({ newWindowId: defaultValues.currentWindowId });

    expect(mockedStorage.get.currentWindowId).toHaveBeenCalled();
    expect(mockedStorage.get.recordingWindowId).not.toHaveBeenCalled();
    expect(mockedStorage.get.recordingWindowId).not.toHaveBeenCalled();
  });

  test("newWindowId equals to recordingWindowId", async () => {
    await handleWindowChange({ newWindowId: defaultValues.recordingWindowId });

    expect(mockedStorage.get.recordingWindowId).toHaveBeenCalled();
    expect(mockedStorage.get.currentWindowId).toHaveBeenCalled();
    expect(mockedStorage.set.currentWindowId).not.toHaveBeenCalled();
  });
});
