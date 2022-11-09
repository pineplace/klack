import {
  BrowserTabChange,
  BrowserTabClosing,
  Failure,
  Method,
  MethodResult,
  RecMode,
  RecSetMode,
  RecStart,
  RecStop,
  Success,
} from "./communication";
import { ErrorCode } from "./errors";
import { DeInjector, Injector } from "./injection";
import { RapidRec, State } from "./rapidrec";

jest.mock("./injection");

beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = () => jest.fn();
});

describe("setMode", () => {
  test("ScreenOnly", async () => {
    const response = await RapidRec.setMode({
      method: Method.RecSetMode,
      params: {
        mode: RecMode.ScreenOnly,
      },
    } as RecSetMode);

    expect(RapidRec.ctx.mode).toEqual(RecMode.ScreenOnly);
    expect(response).toEqual({
      result: MethodResult.Success,
    } as Success);
  });

  test("ScreenAndCam", async () => {
    RapidRec.ctx.currentTab = 123;
    Injector.cameraBubble = jest.fn();

    const response = await RapidRec.setMode({
      method: Method.RecSetMode,
      params: {
        mode: RecMode.ScreenAndCam,
      },
    } as RecSetMode);

    expect(RapidRec.ctx.mode).toEqual(RecMode.ScreenAndCam);
    expect(response).toEqual({
      result: MethodResult.Success,
    } as Success);
    expect(Injector.cameraBubble).toHaveBeenCalledTimes(1);
    expect(Injector.cameraBubble).toHaveBeenCalledWith(RapidRec.ctx.currentTab);
  });

  test("Unknown mode", async () => {
    const response = await RapidRec.setMode({
      method: Method.RecSetMode,
      params: {
        mode: "ABCD" as RecMode,
      },
    } as RecSetMode);

    expect(response).toEqual({
      errCode: ErrorCode.RapidRecMethodExecution,
      message: "RapidRec setMode: Unknown record mode ABCD",
      result: MethodResult.Failed,
    } as Failure);
  });
});

describe("startRecording", () => {
  test("Current mode is empty", async () => {
    RapidRec.ctx.mode = null;
    Injector.screenCapture = jest.fn();

    const response = await RapidRec.startRecording({
      method: Method.RecStart,
    } as RecStart);

    expect(response).toEqual({
      errCode: ErrorCode.RapidRecMethodExecution,
      message:
        "RapidRec startRecording: Current mode is `null`, can't start recording",
      result: MethodResult.Failed,
    } as Failure);
    expect(Injector.screenCapture).not.toBeCalled();
  });

  test("Current mode not empty", async () => {
    RapidRec.ctx.mode = RecMode.ScreenOnly;
    RapidRec.ctx.currentTab = 777;
    Injector.screenCapture = jest.fn();

    const response = await RapidRec.startRecording({
      method: Method.RecStart,
    } as RecStart);

    expect(response).toEqual({
      result: MethodResult.Success,
    } as Success);
    expect(Injector.screenCapture).toHaveBeenCalledTimes(1);
    expect(Injector.screenCapture).toHaveBeenCalledWith(
      RapidRec.ctx.currentTab
    );
  });
});

describe("stopRecording", () => {
  test("Successful download", async () => {
    globalThis.chrome = {
      // @ts-expect-error Chrome global object doesn't implemented in jest context, but TS waiting for it
      downloads: {
        download: jest.fn(),
      },
    };
    const msg = {
      method: Method.RecStop,
      params: {
        downloadUrl: "http://some.com",
      },
    } as RecStop;

    const response = await RapidRec.stopRecording(msg);

    expect(response).toEqual({
      result: MethodResult.Success,
    } as Success);
    expect(chrome.downloads.download).toHaveBeenCalledTimes(1);
    expect(chrome.downloads.download).toHaveBeenCalledWith({
      url: msg.params.downloadUrl,
    });
  });

  test("Download failed", async () => {
    globalThis.chrome = {
      // @ts-expect-error Chrome global object doesn't implemented in jest context, but TS waiting for it
      downloads: {
        download: jest.fn().mockRejectedValue(new Error("Some download error")),
      },
    };
    const msg = {
      method: Method.RecStop,
      params: {
        downloadUrl: "http://some.com",
      },
    } as RecStop;

    const response = await RapidRec.stopRecording(msg);

    expect(response).toEqual({
      errCode: ErrorCode.RapidRecMethodExecution,
      message: "RapidRec stopRecording: Some download error",
      result: MethodResult.Failed,
    } as Failure);
    expect(chrome.downloads.download).toHaveBeenCalledTimes(1);
    expect(chrome.downloads.download).toHaveBeenCalledWith({
      url: msg.params.downloadUrl,
    });
  });
});

describe("handleTabChange", () => {
  test("Current tab is 0 and mode != ScreenAndCam", async () => {
    RapidRec.ctx.mode = null;
    RapidRec.ctx.currentTab = 0;
    Injector.cameraBubble = jest.fn();
    DeInjector.cameraBubble = jest.fn();

    const response = await RapidRec.handleTabChange({
      method: Method.BrowserTabChange,
      params: {
        tabId: 12,
      },
    } as BrowserTabChange);

    expect(response).toEqual({
      result: MethodResult.Success,
    } as Success);
    expect(RapidRec.ctx.currentTab).toEqual(12);
    expect(Injector.cameraBubble).not.toBeCalled();
    expect(DeInjector.cameraBubble).not.toBeCalled();
  });

  test("Current tab is not 0 and mode != ScreenAndCam", async () => {
    RapidRec.ctx.mode = RecMode.ScreenOnly;
    RapidRec.ctx.currentTab = 0;
    Injector.cameraBubble = jest.fn();
    DeInjector.cameraBubble = jest.fn();

    const response = await RapidRec.handleTabChange({
      method: Method.BrowserTabChange,
      params: {
        tabId: 13,
      },
    } as BrowserTabChange);

    expect(response).toEqual({
      result: MethodResult.Success,
    } as Success);
    expect(RapidRec.ctx.currentTab).toEqual(13);
    expect(Injector.cameraBubble).not.toBeCalled();
    expect(DeInjector.cameraBubble).not.toBeCalled();
  });

  test("Current tab is 0 and mode == ScreenAndCam", async () => {
    RapidRec.ctx.mode = RecMode.ScreenAndCam;
    RapidRec.ctx.currentTab = 0;
    Injector.cameraBubble = jest.fn();
    DeInjector.cameraBubble = jest.fn();

    const response = await RapidRec.handleTabChange({
      method: Method.BrowserTabChange,
      params: {
        tabId: 14,
      },
    } as BrowserTabChange);

    expect(response).toEqual({
      result: MethodResult.Success,
    } as Success);
    expect(RapidRec.ctx.currentTab).toEqual(14);
    expect(Injector.cameraBubble).toBeCalledTimes(1);
    expect(Injector.cameraBubble).toHaveBeenLastCalledWith(14);
    expect(DeInjector.cameraBubble).not.toBeCalled();
  });

  test("Current tab is not 0 and mode == ScreenAndCam", async () => {
    RapidRec.ctx.mode = RecMode.ScreenAndCam;
    RapidRec.ctx.currentTab = 15;
    Injector.cameraBubble = jest.fn();
    DeInjector.cameraBubble = jest.fn();

    const response = await RapidRec.handleTabChange({
      method: Method.BrowserTabChange,
      params: {
        tabId: 16,
      },
    } as BrowserTabChange);

    expect(response).toEqual({
      result: MethodResult.Success,
    } as Success);
    expect(RapidRec.ctx.currentTab).toEqual(16);
    expect(Injector.cameraBubble).toBeCalledTimes(1);
    expect(Injector.cameraBubble).toHaveBeenLastCalledWith(16);
    expect(DeInjector.cameraBubble).toBeCalledTimes(1);
    expect(DeInjector.cameraBubble).toHaveBeenLastCalledWith(15);
  });

  test("Injector error", async () => {
    RapidRec.ctx.mode = RecMode.ScreenAndCam;
    RapidRec.ctx.currentTab = 0;
    Injector.cameraBubble = jest
      .fn()
      .mockRejectedValue(new Error("Some Injector error"));
    DeInjector.cameraBubble = jest.fn();

    const response = await RapidRec.handleTabChange({
      method: Method.BrowserTabChange,
      params: {
        tabId: 123,
      },
    } as BrowserTabChange);

    expect(response).toEqual({
      errCode: ErrorCode.RapidRecMethodExecution,
      message: "RapidRec handleTabChange: Some Injector error",
      result: MethodResult.Failed,
    } as Failure);
    expect(RapidRec.ctx.currentTab).not.toEqual(123);
    expect(Injector.cameraBubble).toBeCalledTimes(1);
    expect(Injector.cameraBubble).toHaveBeenLastCalledWith(123);
    expect(DeInjector.cameraBubble).not.toBeCalled();
  });

  test("DeInjector error", async () => {
    RapidRec.ctx.mode = RecMode.ScreenAndCam;
    RapidRec.ctx.currentTab = 1;
    Injector.cameraBubble = jest.fn();
    DeInjector.cameraBubble = jest
      .fn()
      .mockRejectedValue(new Error("Some DeInjector error"));

    const response = await RapidRec.handleTabChange({
      method: Method.BrowserTabChange,
      params: {
        tabId: 321,
      },
    } as BrowserTabChange);

    expect(response).toEqual({
      errCode: ErrorCode.RapidRecMethodExecution,
      message: "RapidRec handleTabChange: Some DeInjector error",
      result: MethodResult.Failed,
    } as Failure);
    expect(RapidRec.ctx.currentTab).not.toEqual(321);
    expect(DeInjector.cameraBubble).toHaveBeenCalledTimes(1);
    expect(DeInjector.cameraBubble).toHaveBeenLastCalledWith(1);
    expect(Injector.cameraBubble).not.toBeCalled();
  });
});

describe("handleTabClosing", () => {
  test("Correct context", async () => {
    RapidRec.ctx.mode = RecMode.ScreenAndCam;
    RapidRec.ctx.state = State.Recording;
    RapidRec.ctx.currentTab = 111;

    const response = await RapidRec.handleTabClosing({
      method: Method.BrowserTabClosing,
    } as BrowserTabClosing);

    expect(response).toEqual({
      result: MethodResult.Success,
    } as Success);
    expect(RapidRec.ctx.mode).toEqual(null);
    expect(RapidRec.ctx.state).toEqual(State.Idle);
    expect(RapidRec.ctx.currentTab).toEqual(0);
  });

  test("Context is undefined", async () => {
    // @ts-expect-error: Here the meaning of the test is that the context is incorrect
    RapidRec.ctx = undefined;

    const response = await RapidRec.handleTabClosing({
      method: Method.BrowserTabClosing,
    } as BrowserTabClosing);

    expect(response).toEqual({
      errCode: ErrorCode.RapidRecMethodExecution,
      result: MethodResult.Failed,
      message:
        "RapidRec setMode: Cannot set properties of undefined (setting 'mode')",
    } as Failure);
  });
});
