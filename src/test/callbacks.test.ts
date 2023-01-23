/*
 * NOTE: `handlers.ts` initializes `chrome.storage.local` on import
 * and test fails without this override
 */
globalThis.chrome = {
  // @ts-expect-error Chrome methods mocking
  downloads: {
    download: jest.fn().mockResolvedValue({}),
  },
  // @ts-expect-error Chrome methods mocking
  scripting: {
    executeScript: jest.fn().mockResolvedValue({}),
  },
  storage: {
    // @ts-expect-error Chrome methods mocking
    local: {
      set: jest.fn().mockResolvedValue({}),
      get: jest.fn().mockResolvedValue({ tabId: 1 }),
    },
  },
};

import {
  onMessage,
  onTabChange,
  onTabClosing,
  onTabUpdated,
} from "../callbacks";
import { builder, MessageResponse } from "../messaging";
import {
  handleAllowMicrophone,
  handleCancelRecording,
  handleDisallowMicrophone,
  handleDownloadRecording,
  handleGetIsCameraBubbleVisible,
  handleGetIsMicrophoneAllowed,
  handleGetRecordingInProgress,
  handleHideCameraBubble,
  handleOpenUserActiveWindow,
  handleShowCameraBubble,
  handleStartRecording,
  handleStopRecording,
  handleTabChange,
  handleTabClosing,
  handleTabUpdated,
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

  test("Correct CancelRecording message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.cancelRecording(), {}, (resp) => {
      response = resp;
    });

    expect(handleCancelRecording).toHaveBeenCalled();
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

  test("Correct AllowMicrophone message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.allowMicrophone(), {}, (resp) => {
      response = resp;
    });

    expect(handleAllowMicrophone).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct DisallowMicrophone message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.disallowMicrophone(), {}, (resp) => {
      response = resp;
    });

    expect(handleDisallowMicrophone).toHaveBeenCalled();
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

  test("Correct BrowserTabUpdated message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.internal.browserTabUpdated(), {}, (resp) => {
      response = resp;
    });

    expect(handleTabUpdated).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct OpenUserActiveWindow", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.internal.openUserActiveWindow(), {}, (resp) => {
      response = resp;
    });

    expect(handleOpenUserActiveWindow).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct GetterRecordingInProgress message", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.getter.recordingInProgress(), {}, (resp) => {
      response = resp;
    });

    expect(handleGetRecordingInProgress).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct GetterIsCameraBubbleVisible", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.getter.isCameraBubbleVisible(), {}, (resp) => {
      response = resp;
    });

    expect(handleGetIsCameraBubbleVisible).toHaveBeenCalled();
    expect(response).toEqual(builder.response.ok());
  });

  test("Correct GetterIsMicrophoneAllowed", async () => {
    let response: MessageResponse | undefined;

    await onMessage(builder.getter.isMicrophoneAllowed(), {}, (resp) => {
      response = resp;
    });

    expect(handleGetIsMicrophoneAllowed).toHaveBeenCalled();
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

describe("onTabUpdated", () => {
  test("Correct message", async () => {
    // @ts-expect-error The 3rd parameter is ignored in `onTabUpdated` and has no value
    await onTabUpdated(0, {}, {});

    expect(handleTabUpdated).toHaveBeenCalled();
  });
});
