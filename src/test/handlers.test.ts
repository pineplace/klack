import {
  handleHideCameraBubble,
  handleShowCameraBubble,
  handleStartRecording,
  handleStopRecording,
  handleTabChange,
} from "../handlers";

beforeEach(() => {
  globalThis.chrome = {
    // @ts-expect-error Chrome methods mocking
    scripting: {
      executeScript: jest.fn().mockResolvedValue({}),
    },
    storage: {
      // @ts-expect-error Chrome methods mocking
      local: {
        set: jest.fn().mockResolvedValue({}),
        get: jest.fn().mockResolvedValue(1),
      },
    },
  };
});

test("handleStartRecording", async () => {
  await handleStartRecording({});

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("currentTabId");
  expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
    target: { tabId: 1 },
    files: ["./screenCapture.bundle.mjs"],
  });
});

test("handleStopRecording", async () => {
  // Now do nothing
  await handleStopRecording({});
});

test("handleShowCameraBubble", async () => {
  await handleShowCameraBubble({});

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("currentTabId");
  expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
    target: { tabId: 1 },
    files: ["./cameraBubble.bundle.mjs"],
  });
});

test("handleHideCameraBubble", async () => {
  await handleHideCameraBubble({});

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalledWith("currentTabId");
  expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
    target: { tabId: 1 },
    func: expect.any(Function),
  });
});

test("handleTabChange", async () => {
  await handleTabChange({ newTabId: 2 });

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toHaveBeenCalledWith({
    currentTabId: 2,
  });
});
