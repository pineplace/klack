import { builder, Message, MessageResponse, Method } from "../messaging";

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

  test("buildRecordingInProgress", () => {
    expect(builder.getter.recordingInProgress()).toEqual({
      method: Method.GetterRecordingInProgress,
    } as Message);
  });

  test("buildBrowserTabChange", () => {
    expect(builder.internal.browserTabChange(10)).toEqual({
      method: Method.BrowserTabChange,
      args: {
        newTabId: 10,
      },
    } as Message);
  });

  test("buildBrowserTabClosing", () => {
    expect(builder.internal.browserTabClosing(11)).toEqual({
      method: Method.BrowserTabClosing,
      args: {
        closedTabId: 11,
      },
    } as Message);
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
