import { RapidRec } from "./rapidrec";
import {
  ActiveTabInfo,
  onMessage,
  onTabChange,
  onTabClosing,
  RemoveInfo,
} from "./callbacks";
import {
  BrowserTabChange,
  BrowserTabClosing,
  Failure,
  Message,
  MessageResponse,
  Method,
  MethodResult,
  RecMode,
  RecSetMode,
  RecStart,
  RecStop,
  Success,
} from "./communication";
import { ErrorCode } from "./errors";

jest.mock("./rapidrec");

beforeEach(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = () => jest.fn();
});

describe("onMessage", () => {
  describe("Methods", () => {
    test("RecSetMode", async () => {
      const mockedSetMode = jest.fn().mockReturnValue({
        result: MethodResult.Success,
      } as Success);
      RapidRec.setMode = mockedSetMode;

      const msg: RecSetMode = {
        method: Method.RecSetMode,
        params: {
          mode: RecMode.ScreenOnly,
        },
      };

      let response: MessageResponse = {} as MessageResponse;
      await onMessage(msg, {}, (msgResponse?) => {
        response = msgResponse ?? ({} as MessageResponse);
      });

      expect(mockedSetMode).toHaveBeenCalledTimes(1);
      expect(mockedSetMode).toHaveBeenCalledWith(msg);
      expect(response).toEqual({
        result: MethodResult.Success,
      } as Success);
    });

    test("RecStart", async () => {
      const mockedStartRecording = jest.fn().mockReturnValue({
        result: MethodResult.Success,
      } as Success);
      RapidRec.startRecording = mockedStartRecording;

      const msg: RecStart = {
        method: Method.RecStart,
      };

      let response: MessageResponse = {} as MessageResponse;
      await onMessage(msg, {}, (msgResponse?) => {
        response = msgResponse ?? ({} as MessageResponse);
      });

      expect(mockedStartRecording).toHaveBeenCalledTimes(1);
      expect(mockedStartRecording).toHaveBeenCalledWith(msg);
      expect(response).toEqual({
        result: MethodResult.Success,
      } as Success);
    });

    test("RecStop", async () => {
      const mockedStopRecording = jest.fn().mockReturnValue({
        result: MethodResult.Success,
      } as Success);
      RapidRec.stopRecording = mockedStopRecording;

      const msg: RecStop = {
        method: Method.RecStop,
        params: {
          downloadUrl: "http://some_download_url.com",
        },
      };

      let response: MessageResponse = {} as MessageResponse;
      await onMessage(msg, {}, (msgResponse?) => {
        response = msgResponse ?? ({} as MessageResponse);
      });

      expect(mockedStopRecording).toHaveBeenCalledTimes(1);
      expect(mockedStopRecording).toHaveBeenCalledWith(msg);
      expect(response).toEqual({
        result: MethodResult.Success,
      } as Success);
    });

    test("BrowserTabChange", async () => {
      const mockedHandleTabChange = jest.fn().mockReturnValue({
        result: MethodResult.Success,
      } as Success);
      RapidRec.handleTabChange = mockedHandleTabChange;

      const msg: BrowserTabChange = {
        method: Method.BrowserTabChange,
        params: {
          tabId: 12,
        },
      };

      let response: MessageResponse = {} as MessageResponse;
      await onMessage(msg, {}, (msgResponse?) => {
        response = msgResponse ?? ({} as MessageResponse);
      });

      expect(mockedHandleTabChange).toHaveBeenCalledTimes(1);
      expect(mockedHandleTabChange).toHaveBeenCalledWith(msg);
      expect(response).toEqual({
        result: MethodResult.Success,
      } as Success);
    });

    test("BrowserTabClosing", async () => {
      const mockedHandleTabClosing = jest.fn().mockReturnValue({
        result: MethodResult.Success,
      } as Success);
      RapidRec.handleTabClosing = mockedHandleTabClosing;

      const msg: BrowserTabClosing = {
        method: Method.BrowserTabClosing,
        params: {
          tabId: 12,
        },
      };

      let response: MessageResponse = {} as MessageResponse;
      await onMessage(msg, {}, (msgResponse?) => {
        response = msgResponse ?? ({} as MessageResponse);
      });

      expect(mockedHandleTabClosing).toHaveBeenCalledTimes(1);
      expect(mockedHandleTabClosing).toHaveBeenCalledWith(msg);
      expect(response).toEqual({
        result: MethodResult.Success,
      } as Success);
    });
  });

  describe("Invalid messages", () => {
    const unknownMethodResult = {
      result: MethodResult.Failed,
      errCode: ErrorCode.Some,
    };

    test("{} message", async () => {
      let response: MessageResponse = {} as MessageResponse;

      await expect(
        onMessage({} as Message, {}, (msgResponse?) => {
          response = msgResponse ?? ({} as MessageResponse);
        })
      ).rejects.toEqual({
        ...unknownMethodResult,
        message: "Invalid message with unknown method {}",
      } as Failure);
      expect(response).toEqual({
        ...unknownMethodResult,
        message: "Invalid message with unknown method {}",
      } as Failure);
    });

    test("Unknown message", async () => {
      const unknownMessage = {
        method: "123456",
        params: {
          a: "b",
        },
      };
      let response: MessageResponse = {} as MessageResponse;

      await expect(
        onMessage(unknownMessage as Message, {}, (msgResponse?) => {
          response = msgResponse ?? ({} as MessageResponse);
        })
      ).rejects.toEqual({
        ...unknownMethodResult,
        message: `Invalid message with unknown method ${JSON.stringify(
          unknownMessage
        )}`,
      } as Failure);
      expect(response).toEqual({
        ...unknownMethodResult,
        message: `Invalid message with unknown method ${JSON.stringify(
          unknownMessage
        )}`,
      } as Failure);
    });

    test("Method throws error", async () => {
      const mockedStartRecording = jest.fn().mockImplementationOnce(() => {
        throw new Error("Some error from correct method");
      });
      RapidRec.startRecording = mockedStartRecording;

      const msg: RecStart = {
        method: Method.RecStart,
      };

      let response: MessageResponse = {} as MessageResponse;

      await expect(
        onMessage(msg, {}, (msgResponse?) => {
          response = msgResponse ?? ({} as MessageResponse);
        })
      ).rejects.toEqual({
        ...unknownMethodResult,
        message: "Some error from correct method",
      } as Failure);
      expect(response).toEqual({
        ...unknownMethodResult,
        message: "Some error from correct method",
      } as Failure);
      expect(mockedStartRecording).toHaveBeenCalledTimes(1);
      expect(mockedStartRecording).toHaveBeenCalledWith(msg);
    });
  });
});

test("onTabChange", async () => {
  const mockedHandleTabChange = jest.fn().mockReturnValue({
    result: MethodResult.Success,
  } as Success);
  RapidRec.handleTabChange = mockedHandleTabChange;

  const tabInfo: ActiveTabInfo = {
    tabId: 11,
    windowId: 12,
  };
  await onTabChange(tabInfo);

  expect(mockedHandleTabChange).toHaveBeenCalledTimes(1);
  expect(mockedHandleTabChange).toHaveBeenCalledWith({
    method: Method.BrowserTabChange,
    params: {
      tabId: tabInfo.tabId,
    },
  } as BrowserTabChange);
});

test("onTabClosing", async () => {
  const mockedHandleTabClosing = jest.fn().mockReturnValue({
    result: MethodResult.Success,
  } as Success);
  RapidRec.handleTabClosing = mockedHandleTabClosing;

  const closedTabId = 11;

  await onTabClosing(closedTabId, {} as RemoveInfo);

  expect(mockedHandleTabClosing).toHaveBeenCalledTimes(1);
  expect(mockedHandleTabClosing).toHaveBeenCalledWith({
    method: Method.BrowserTabClosing,
    params: {
      tabId: closedTabId,
    },
  } as BrowserTabClosing);
});
