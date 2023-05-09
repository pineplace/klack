import { jest } from "@jest/globals";
import { builder, MessageResponse, MethodArgs } from "../messaging";
jest.unstable_mockModule("../handlers", () => {
  return {
    handleStartRecording: (
      jest.fn() as jest.Mock<(args: MethodArgs) => Promise<void>>
    ).mockResolvedValue(),
    handleStopRecording: (
      jest.fn() as jest.Mock<(args: MethodArgs) => Promise<void>>
    ).mockResolvedValue(),
    handlePauseRecording: (
      jest.fn() as jest.Mock<(args: MethodArgs) => Promise<void>>
    ).mockResolvedValue(),
    handleResumeRecording: (
      jest.fn() as jest.Mock<(args: MethodArgs) => Promise<void>>
    ).mockResolvedValue(),
    handleDeleteRecording: (
      jest.fn() as jest.Mock<(args: MethodArgs) => Promise<void>>
    ).mockResolvedValue(),
    handleCancelRecording: (
      jest.fn() as jest.Mock<(args: MethodArgs) => Promise<void>>
    ).mockResolvedValue(),
    handleDownloadRecording: (
      jest.fn() as jest.Mock<(args: MethodArgs) => Promise<void>>
    ).mockResolvedValue(),
    handleShowCameraBubble: (
      jest.fn() as jest.Mock<(args: MethodArgs) => Promise<void>>
    ).mockResolvedValue(),
    handleHideCameraBubble: (
      jest.fn() as jest.Mock<(args: MethodArgs) => Promise<void>>
    ).mockResolvedValue(),
    handleAllowMicrophone: (
      jest.fn() as jest.Mock<(args: MethodArgs) => Promise<void>>
    ).mockResolvedValue(),
    handleDisallowMicrophone: (
      jest.fn() as jest.Mock<(args: MethodArgs) => Promise<void>>
    ).mockResolvedValue(),
    handleTabChange: (
      jest.fn() as jest.Mock<(args: MethodArgs) => Promise<void>>
    ).mockResolvedValue(),
    handleTabClosing: (
      jest.fn() as jest.Mock<(args: MethodArgs) => Promise<void>>
    ).mockResolvedValue(),
    handleTabUpdated: (
      jest.fn() as jest.Mock<(args: MethodArgs) => Promise<void>>
    ).mockResolvedValue(),
    handleWindowChange: (
      jest.fn() as jest.Mock<(args: MethodArgs) => Promise<void>>
    ).mockResolvedValue(),
    handleOpenUserActiveWindow: (
      jest.fn() as jest.Mock<(args: MethodArgs) => Promise<void>>
    ).mockResolvedValue(),
  };
});
const mockedHandlers = await import("../handlers");
const { onMessage, onTabChange, onTabClosing, onTabUpdated, onWindowChange } =
  await import("../callbacks");

describe("onMessage", () => {
  test("Correct StartRecording message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.startRecording(), {}, (resp) => {
      response = resp;
    });

    expect(mockedHandlers.handleStartRecording).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct StopRecording message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.stopRecording(), {}, (resp) => {
      response = resp;
    });

    expect(mockedHandlers.handleStopRecording).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct PauseRecording message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.pauseRecording(), {}, (resp) => {
      response = resp;
    });

    expect(mockedHandlers.handlePauseRecording).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct ResumeRecording message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.resumeRecording(), {}, (resp) => {
      response = resp;
    });

    expect(mockedHandlers.handleResumeRecording).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct DeleteRecording message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.deleteRecording(), {}, (resp) => {
      response = resp;
    });

    expect(mockedHandlers.handleDeleteRecording).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct CancelRecording message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.cancelRecording(), {}, (resp) => {
      response = resp;
    });

    expect(mockedHandlers.handleCancelRecording).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct DownloadRecording message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.downloadRecording("some-video-url"), {}, (resp) => {
      response = resp;
    });

    expect(mockedHandlers.handleDownloadRecording).toHaveBeenCalledWith({
      downloadUrl: "some-video-url",
    });
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct ShowCameraBubble message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.showCameraBubble(), {}, (resp) => {
      response = resp;
    });

    expect(mockedHandlers.handleShowCameraBubble).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct HideCameraBubble message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.hideCameraBubble(), {}, (resp) => {
      response = resp;
    });

    expect(mockedHandlers.handleHideCameraBubble).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct AllowMicrophone message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.allowMicrophone(), {}, (resp) => {
      response = resp;
    });

    expect(mockedHandlers.handleAllowMicrophone).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct DisallowMicrophone message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.disallowMicrophone(), {}, (resp) => {
      response = resp;
    });

    expect(mockedHandlers.handleDisallowMicrophone).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct BrowserTabChange message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.event.browserTabChange(1), {}, (resp) => {
      response = resp;
    });

    expect(mockedHandlers.handleTabChange).toHaveBeenCalled();
    expect(mockedHandlers.handleTabChange).toHaveBeenCalledWith({
      newTabId: 1,
    });
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct BrowserTabClosing message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.event.browserTabClosing(2), {}, (resp) => {
      response = resp;
    });

    expect(mockedHandlers.handleTabClosing).toHaveBeenCalled();
    expect(mockedHandlers.handleTabClosing).toHaveBeenCalledWith({
      closedTabId: 2,
    });
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct BrowserTabUpdated message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.event.browserTabUpdated(), {}, (resp) => {
      response = resp;
    });

    expect(mockedHandlers.handleTabUpdated).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct OpenUserActiveWindow", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.openUserActiveWindow(), {}, (resp) => {
      response = resp;
    });

    expect(mockedHandlers.handleOpenUserActiveWindow).toHaveBeenCalled();
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

    expect(mockedHandlers.handleTabChange).toHaveBeenCalled();
    expect(mockedHandlers.handleTabChange).toHaveBeenCalledWith({
      newTabId: 1,
    });
  });
});

describe("onTabClosing", () => {
  test("Correct message", async () => {
    await onTabClosing(3, {
      isWindowClosing: false,
      windowId: 2,
    });

    expect(mockedHandlers.handleTabClosing).toHaveBeenCalled();
    expect(mockedHandlers.handleTabClosing).toHaveBeenCalledWith({
      closedTabId: 3,
    });
  });
});

describe("onTabUpdated", () => {
  test("Correct message", async () => {
    // @ts-expect-error The 3rd parameter is ignored in `onTabUpdated` and has no value
    await onTabUpdated(0, {}, {});

    expect(mockedHandlers.handleTabUpdated).toHaveBeenCalled();
  });
});

describe("onWindowChange", () => {
  test("Correct message", async () => {
    await onWindowChange(11);

    expect(mockedHandlers.handleWindowChange).toHaveBeenCalledWith({
      newWindowId: 11,
    });
  });
});
