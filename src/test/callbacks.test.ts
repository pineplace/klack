import { onMessage, onTabChange, onTabClosing } from "../callbacks";
import { builder, MessageResponse } from "../messaging";

import { handleTabChange, handleTabClosing } from "../handlers";

beforeEach(() => {
  // @ts-expect-error module function mocking
  handleTabChange = jest.fn().mockResolvedValue();
  // @ts-expect-error module function mocking
  handleTabClosing = jest.fn().mockResolvedValue();
});

describe("onMessage", () => {
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
