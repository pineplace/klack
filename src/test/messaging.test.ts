import { builder, Message, MessageResponse, Method } from "../messaging";

describe("builder", () => {
  test("buildStartRecording", () => {
    expect(builder.startRecording()).toEqual({
      method: Method.StartRecording,
      args: {},
    } as Message);
  });

  test("buildStopRecording", () => {
    expect(builder.stopRecording()).toEqual({
      method: Method.StopRecording,
      args: {},
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
      args: {},
    } as Message);
  });

  test("buildHideCameraBubble", () => {
    expect(builder.hideCameraBubble()).toEqual({
      method: Method.HideCameraBubble,
      args: {},
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

  test("buildOkResponse", () => {
    expect(builder.response.ok()).toEqual({
      result: "OK",
    } as MessageResponse);
  });

  test("buildErrorResponse", () => {
    expect(builder.response.error(new Error("Some error"))).toEqual({
      result: "Error",
      message: "Some error",
    } as MessageResponse);
  });
});
