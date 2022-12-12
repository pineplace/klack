import { onMessage, onTabChange, onTabClosing } from "../callbacks";
import { builder, MessageResponse } from "../messaging";
import {
  handleDownloadRecording,
  handleHideCameraBubble,
  handleShowCameraBubble,
  handleStartRecording,
  handleStopRecording,
  handleTabChange,
  handleTabClosing,
} from "../handlers";

jest.mock("../handlers");

beforeEach(() => {
  // @ts-expect-error module function mocking
  handleTabChange = jest.fn().mockResolvedValue();
  // @ts-expect-error module function mocking
  handleTabClosing = jest.fn().mockResolvedValue();
});

describe("onMessage", () => {
  test("Correct StartRecording message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.startRecording(), {}, (resp) => {
      response = resp;
    });

    expect(handleStartRecording).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct StopRecording message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.stopRecording(), {}, (resp) => {
      response = resp;
    });

    expect(handleStopRecording).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct DownloadRecording message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.downloadRecording("some-video-url"), {}, (resp) => {
      response = resp;
    });

    expect(handleDownloadRecording).toHaveBeenCalledWith({
      downloadUrl: "some-video-url",
    });
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct ShowCameraBubble message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.showCameraBubble(), {}, (resp) => {
      response = resp;
    });

    expect(handleShowCameraBubble).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct HideCameraBubble message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.hideCameraBubble(), {}, (resp) => {
      response = resp;
    });

    expect(handleHideCameraBubble).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct BrowserTabChange message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.internal.browserTabChange(1), {}, (resp) => {
      response = resp;
    });

    expect(handleTabChange).toHaveBeenCalled();
    expect(handleTabChange).toHaveBeenCalledWith({ newTabId: 1 });
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct BrowserTabClosing message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.internal.browserTabClosing(2), {}, (resp) => {
      response = resp;
    });

    expect(handleTabClosing).toHaveBeenCalled();
    expect(handleTabClosing).toHaveBeenCalledWith({ closedTabId: 2 });
    expect(response).toEqual(builder.response.ok());
  });

  test("Unexpected method", async () => {
    let response: MessageResponse | undefined;

    await onMessage(
      {
        // @ts-expect-error We expect here that method is not a Method enum value
        method: "Incorrect method",
        params: {},
      },
      {},
      (resp) => {
        response = resp;
      }
    );

    expect(handleTabChange).not.toHaveBeenCalled();
    expect(handleTabClosing).not.toHaveBeenCalled();
    expect(response).toEqual(
      builder.response.error(new Error(`Unexpected method: Incorrect method`))
    );
  });
});

describe("onTabChange", () => {
  test("Correct message", async () => {
    await onTabChange({
      tabId: 1,
      windowId: 2,
    });

    expect(handleTabChange).toHaveBeenCalled();
    expect(handleTabChange).toHaveBeenCalledWith({ newTabId: 1 });
  });
});

describe("onTabClosing", () => {
  test("Correct message", async () => {
    await onTabClosing(3, {
      isWindowClosing: false,
      windowId: 2,
    });

    expect(handleTabClosing).toHaveBeenCalled();
    expect(handleTabClosing).toHaveBeenCalledWith({ closedTabId: 3 });
  });
});
