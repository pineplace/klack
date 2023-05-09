import { jest } from "@jest/globals";
import {
  builder,
  Message,
  MessageResponse,
  Method,
  sender,
} from "../messaging";

beforeEach(() => {
  globalThis.chrome = {
    runtime: {
      // @ts-expect-error Chrome methods mocking
      sendMessage: jest.fn(),
    },
    tabs: {
      // @ts-expect-error Chrome methods mocking
      sendMessage: jest.fn(),
    },
  };
});

describe("builder", () => {
  test("buildStartRecording", () => {
    expect(builder.startRecording()).toEqual({
      method: Method.StartRecording,
    } satisfies Message);
  });

  test("buildStopRecording", () => {
    expect(builder.stopRecording()).toEqual({
      method: Method.StopRecording,
    } satisfies Message);
  });

  test("buildPauseRecording", () => {
    expect(builder.pauseRecording()).toEqual({
      method: Method.PauseRecording,
    } satisfies Message);
  });

  test("buildResumeRecording", () => {
    expect(builder.resumeRecording()).toEqual({
      method: Method.ResumeRecording,
    } satisfies Message);
  });

  test("buildDeleteRecording", () => {
    expect(builder.deleteRecording()).toEqual({
      method: Method.DeleteRecording,
    } satisfies Message);
  });

  test("buildCancelRecording", () => {
    expect(builder.cancelRecording()).toEqual({
      method: Method.CancelRecording,
    } satisfies Message);
  });

  test("buildDownloadRecording", () => {
    expect(builder.downloadRecording("some-recording-url")).toEqual({
      method: Method.DownloadRecording,
      args: {
        downloadUrl: "some-recording-url",
      },
    } satisfies Message);
  });

  test("buildShowCameraBubble", () => {
    expect(builder.showCameraBubble()).toEqual({
      method: Method.ShowCameraBubble,
    } satisfies Message);
  });

  test("buildHideCameraBubble", () => {
    expect(builder.hideCameraBubble()).toEqual({
      method: Method.HideCameraBubble,
    } satisfies Message);
  });

  test("buildAllowMicrophone", () => {
    expect(builder.allowMicrophone()).toEqual({
      method: Method.AllowMicrophone,
    } satisfies Message);
  });

  test("buildDisallowMicrophone", () => {
    expect(builder.disallowMicrophone()).toEqual({
      method: Method.DisallowMicrophone,
    } satisfies Message);
  });

  test("buildBrowserTabChange", () => {
    expect(builder.event.browserTabChange(10)).toEqual({
      method: Method.BrowserTabChange,
      args: {
        newTabId: 10,
      },
    } satisfies Message);
  });

  test("buildBrowserTabClosing", () => {
    expect(builder.event.browserTabClosing(11)).toEqual({
      method: Method.BrowserTabClosing,
      args: {
        closedTabId: 11,
      },
    } satisfies Message);
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
    expect(builder.tabStopMediaRecorder(true)).toEqual({
      method: Method.TabStopMediaRecorder,
      args: {
        downloadRecording: true,
      },
    });
  });

  test("buildTabPauseMediaRecorder", () => {
    expect(builder.tabPauseMediaRecorder()).toEqual({
      method: Method.TabPauseMediaRecorder,
    });
  });

  test("buildTabResumeMediaRecorder", () => {
    expect(builder.tabResumeMediaRecorder()).toEqual({
      method: Method.TabResumeMediaRecorder,
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
      } satisfies MessageResponse);
    });
  });

  test("buildErrorResponse", () => {
    expect(builder.response.error(new Error("Some error"))).toEqual({
      error: "Some error",
    } satisfies MessageResponse);
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
