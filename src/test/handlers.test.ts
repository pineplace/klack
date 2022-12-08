import { handleRecordingStart, handleTabChange } from "../handlers";

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
        get: jest.fn().mockResolvedValue({}),
      },
    },
  };
});

test("handleRecordingStart", async () => {
  await handleRecordingStart({});

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.get).toHaveBeenCalled();
  expect(chrome.scripting.executeScript).toHaveBeenCalled();
});

test("handleTabChange", async () => {
  await handleTabChange({});

  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(chrome.storage.local.set).toHaveBeenCalled();
});
