import {
  BrowserTabChange,
  BrowserTabClosing,
  Method,
  MethodResult,
  RecMode,
  RecSetMode,
  RecStart,
  RecStop,
  Success,
} from "./communication";
import { DeInjector, Injector } from "./injection";
import { RapidRec, State } from "./rapidrec";

jest.mock("./injection");

beforeEach(() => {
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
    await expect(
      RapidRec.setMode({
        method: Method.RecSetMode,
        params: {
          mode: "ABCD" as RecMode,
        },
      } as RecSetMode)
    ).rejects.toThrow("Unknown record mode ABCD");
  });
});

describe("startRecording", () => {
  test("Current mode is empty", async () => {
    RapidRec.ctx.mode = null;
    Injector.screenCapture = jest.fn();

    await expect(
      RapidRec.startRecording({
        method: Method.RecStart,
      } as RecStart)
    ).rejects.toThrow("Current mode is `null`, can't start recording");

    expect(Injector.screenCapture).not.toBeCalled();
  });

  test("Current mode not empty", async () => {
    RapidRec.ctx.mode = RecMode.ScreenOnly;
    RapidRec.ctx.currentTab = 777;
    Injector.screenCapture = jest.fn();

    await RapidRec.startRecording({
      method: Method.RecStart,
    } as RecStart);

    expect(Injector.screenCapture).toHaveBeenCalledTimes(1);
    expect(Injector.screenCapture).toHaveBeenCalledWith(
      RapidRec.ctx.currentTab
    );
  });
});

test("stopRecording", async () => {
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

  await RapidRec.stopRecording(msg);

  expect(chrome.downloads.download).toHaveBeenCalledTimes(1);
  expect(chrome.downloads.download).toHaveBeenCalledWith({
    url: msg.params.downloadUrl,
  });
});

describe("handleTabChange", () => {
  test("Current tab is 0 and mode != ScreenAndCam", async () => {
    RapidRec.ctx.mode = null;
    RapidRec.ctx.currentTab = 0;
    Injector.cameraBubble = jest.fn();
    DeInjector.cameraBubble = jest.fn();

    await RapidRec.handleTabChange({
      method: Method.BrowserTabChange,
      params: {
        tabId: 12,
      },
    } as BrowserTabChange);

    expect(RapidRec.ctx.currentTab).toEqual(12);
    expect(Injector.cameraBubble).not.toBeCalled();
    expect(DeInjector.cameraBubble).not.toBeCalled();
  });

  test("Current tab is not 0 and mode != ScreenAndCam", async () => {
    RapidRec.ctx.mode = RecMode.ScreenOnly;
    RapidRec.ctx.currentTab = 0;
    Injector.cameraBubble = jest.fn();
    DeInjector.cameraBubble = jest.fn();

    await RapidRec.handleTabChange({
      method: Method.BrowserTabChange,
      params: {
        tabId: 13,
      },
    } as BrowserTabChange);

    expect(RapidRec.ctx.currentTab).toEqual(13);
    expect(Injector.cameraBubble).not.toBeCalled();
    expect(DeInjector.cameraBubble).not.toBeCalled();
  });

  test("Current tab is 0 and mode == ScreenAndCam", async () => {
    RapidRec.ctx.mode = RecMode.ScreenAndCam;
    RapidRec.ctx.currentTab = 0;
    Injector.cameraBubble = jest.fn();
    DeInjector.cameraBubble = jest.fn();

    await RapidRec.handleTabChange({
      method: Method.BrowserTabChange,
      params: {
        tabId: 14,
      },
    } as BrowserTabChange);

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

    await RapidRec.handleTabChange({
      method: Method.BrowserTabChange,
      params: {
        tabId: 16,
      },
    } as BrowserTabChange);

    expect(RapidRec.ctx.currentTab).toEqual(16);
    expect(Injector.cameraBubble).toBeCalledTimes(1);
    expect(Injector.cameraBubble).toHaveBeenLastCalledWith(16);
    expect(DeInjector.cameraBubble).toBeCalledTimes(1);
    expect(DeInjector.cameraBubble).toHaveBeenLastCalledWith(15);
  });
});

test("handleTabClosing", async () => {
  RapidRec.ctx.mode = RecMode.ScreenAndCam;
  RapidRec.ctx.state = State.Recording;
  RapidRec.ctx.currentTab = 111;

  await RapidRec.handleTabClosing({
    method: Method.BrowserTabClosing,
  } as BrowserTabClosing);

  expect(RapidRec.ctx.mode).toEqual(null);
  expect(RapidRec.ctx.state).toEqual(State.Idle);
  expect(RapidRec.ctx.currentTab).toEqual(0);
});
