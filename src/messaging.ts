export type StartRecording = Record<string, never>;
export type StopRecording = Record<string, never>;

export interface BrowserTabChange {
  newTabId: number;
}
export interface BrowserTabClosing {
  closedTabId: number;
}

export enum Method {
  StartRecording,
  StopRecording,

  ShowCameraBubble,
  HideCameraBubble,

  BrowserTabChange,
  BrowserTabClosing,
}
export type MethodArgs =
  | StartRecording
  | StopRecording
  | BrowserTabChange
  | BrowserTabClosing;

export interface Message {
  method: Method;
  args: MethodArgs;
}
export type MessageResponse = {
  result: "OK" | "Error";
  message?: string;
};

function buildStartRecording(): Message {
  return {
    method: Method.StartRecording,
    args: {},
  };
}

function buildStopRecording(): Message {
  return {
    method: Method.StopRecording,
    args: {},
  };
}

function buildShowCameraBubble(): Message {
  return {
    method: Method.ShowCameraBubble,
    args: {},
  };
}

function buildHideCameraBubble(): Message {
  return {
    method: Method.HideCameraBubble,
    args: {},
  };
}

function buildBrowserTabChange(newTabId: number): Message {
  return {
    method: Method.BrowserTabChange,
    args: {
      newTabId,
    },
  };
}

function buildBrowserTabClosing(closedTabId: number): Message {
  return {
    method: Method.BrowserTabClosing,
    args: {
      closedTabId,
    },
  };
}

function buildOkResponse(): MessageResponse {
  return {
    result: "OK",
  };
}

function buildErrorResponse(err: Error): MessageResponse {
  return {
    result: "Error",
    message: err.message,
  };
}

export const builder = {
  startRecording: buildStartRecording,
  stopRecording: buildStopRecording,
  showCameraBubble: buildShowCameraBubble,
  hideCameraBubble: buildHideCameraBubble,
  internal: {
    browserTabChange: buildBrowserTabChange,
    browserTabClosing: buildBrowserTabClosing,
  },
  response: {
    ok: buildOkResponse,
    error: buildErrorResponse,
  },
};

export const sender = {
  send: async (message: Message): Promise<MessageResponse> => {
    return await chrome.runtime.sendMessage(message);
  },
};
