import {
  builder,
  Message,
  MessageResponse,
  Method,
  sender,
} from "../messaging";

beforeEach(() => {
  /*
   * NOTE: `handlers.ts` initializes `chrome.storage.local` on import
   * and test fails without this override
   */
  globalThis.chrome = {
    // @ts-expect-error Chrome methods mocking
    runtime: {
      sendMessage: jest.fn(),
    },
    // @ts-expect-error Chrome methods mocking
    tabs: {
      sendMessage: jest.fn(),
    },
  };
});

describe("builder", () => {
  test("buildStartRecording", () => {
    expect(builder.startRecording()).toEqual({
      method: Method.StartRecording,
    } as Message);
  });

  test("buildStopRecording", () => {
    expect(builder.stopRecording()).toEqual({
      method: Method.StopRecording,
    } as Message);
  });

  test("buildCancelRecording", () => {
    expect(builder.cancelRecording()).toEqual({
      method: Method.CancelRecording,
    } as Message);
  });

  test("buildDownloadRecording", () => {
    expect(builder.downloadRecording("some-recording-url")).toEqual({
      method: Method.DownloadRecording,
      args: {
        downloadUrl: "some-recording-url",
      },
    } as Message);
  });

  test("buildShowCameraBubble", () => {
    expect(builder.showCameraBubble()).toEqual({
      method: Method.ShowCameraBubble,
    } as Message);
  });

  test("buildHideCameraBubble", () => {
    expect(builder.hideCameraBubble()).toEqual({
      method: Method.HideCameraBubble,
    } as Message);
  });

  test("buildAllowMicrophone", () => {
    expect(builder.allowMicrophone()).toEqual({
      method: Method.AllowMicrophone,
    } as Message);
  });

  test("buildDisallowMicrophone", () => {
    expect(builder.disallowMicrophone()).toEqual({
      method: Method.DisallowMicrophone,
    } as Message);
  });

  test("buildBrowserTabChange", () => {
    expect(builder.event.browserTabChange(10)).toEqual({
      method: Method.BrowserTabChange,
      args: {
        newTabId: 10,
      },
    } as Message);
  });

  test("buildBrowserTabClosing", () => {
    expect(builder.event.browserTabClosing(11)).toEqual({
      method: Method.BrowserTabClosing,
      args: {
        closedTabId: 11,
      },
    } as Message);
  });

  test("buildBrowserWindowChange", () => {
    expect(builder.event.browserWindowChange(10)).toEqual({
      method: Method.BrowserWindowChange,
      args: {
        newWindowId: 10,
      },
    } satisfies Message);
  });

  test("buildBrowserTabUpdated", () => {
    expect(builder.event.browserTabUpdated()).toEqual({
      method: Method.BrowserTabUpdated,
    });
  });

  test("buildTabStopMediaRecorder", () => {
    expect(builder.tabStopMediaRecorder()).toEqual({
      method: Method.TabStopMediaRecorder,
    });
  });

  test("buildOpenUserActiveWindow", () => {
    expect(builder.openUserActiveWindow()).toEqual({
      method: Method.OpenUserActiveWindow,
    });
  });

  describe("buildOkResponse", () => {
    test("OK", () => {
      expect(builder.response.ok()).toEqual({
        result: "OK",
      } as MessageResponse);
    });

    test("RecordingInProgressResult", () => {
      expect(builder.response.ok(true)).toEqual({
        result: true,
      } as MessageResponse);

      expect(builder.response.ok(false)).toEqual({
        result: false,
      } as MessageResponse);
    });
  });

  test("buildErrorResponse", () => {
    expect(builder.response.error(new Error("Some error"))).toEqual({
      error: "Some error",
    } as MessageResponse);
  });
});

describe("sender", () => {
  test("send with tabId", async () => {
    await sender.send(builder.startRecording(), 11);
    expect(chrome.tabs.sendMessage).toHaveBeenCalled();
    expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
  });

  test("send without tabId", async () => {
    await sender.send(builder.startRecording());
    expect(chrome.runtime.sendMessage).toHaveBeenCalled();
    expect(chrome.tabs.sendMessage).not.toHaveBeenCalled();
  });
});
