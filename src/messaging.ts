export enum Method {
  StartRecording,
  StopRecording,
  DownloadRecording,

  ShowCameraBubble,
  HideCameraBubble,

  BrowserTabChange,
  BrowserTabClosing,

  GetterRecordingInProgress,
}

export type DownloadRecordingArgs = { downloadUrl: string };
export type BrowserTabChangeArgs = { newTabId: number };
export type BrowserTabClosingArgs = { closedTabId: number };

export type RecordingInProgressResult = boolean;

export type MethodArgs =
  | DownloadRecordingArgs
  | BrowserTabChangeArgs
  | BrowserTabClosingArgs
  | Record<string, never>;

export type MethodResult = RecordingInProgressResult | "OK";

export interface Message {
  method: Method;
  args?: MethodArgs;
}
export type MessageResponse = {
  result?: MethodResult;
  error?: string;
};

function buildStartRecording(): Message {
  return {
    method: Method.StartRecording,
  };
}

function buildStopRecording(): Message {
  return {
    method: Method.StopRecording,
  };
}

function buildDownloadRecording(downloadUrl: string): Message {
  return {
    method: Method.DownloadRecording,
    args: {
      downloadUrl,
    },
  };
}

function buildShowCameraBubble(): Message {
  return {
    method: Method.ShowCameraBubble,
  };
}

function buildHideCameraBubble(): Message {
  return {
    method: Method.HideCameraBubble,
  };
}

function buildRecordingInProgress(): Message {
  return {
    method: Method.GetterRecordingInProgress,
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

function buildOkResponse(result: MethodResult = "OK"): MessageResponse {
  return {
    result,
  };
}

function buildErrorResponse(err: Error): MessageResponse {
  return {
    error: err.message,
  };
}

export const builder = {
  startRecording: buildStartRecording,
  stopRecording: buildStopRecording,
  downloadRecording: buildDownloadRecording,
  showCameraBubble: buildShowCameraBubble,
  hideCameraBubble: buildHideCameraBubble,
  getter: {
    recordingInProgress: buildRecordingInProgress,
  },
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
