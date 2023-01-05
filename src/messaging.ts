export enum Method {
  StartRecording,
  StopRecording,
  CancelRecording,
  DownloadRecording,

  ShowCameraBubble,
  HideCameraBubble,

  BrowserTabChange,
  BrowserTabClosing,
  TabStopMediaRecorder,

  GetterRecordingInProgress,
  GetterIsCameraBubbleVisible,
}

export type DownloadRecordingArgs = { downloadUrl: string };
export type BrowserTabChangeArgs = { newTabId: number };
export type BrowserTabClosingArgs = { closedTabId: number };

export type RecordingInProgressResult = boolean;
export type IsCameraBubbleVisibleResult = boolean;

export type MethodArgs =
  | DownloadRecordingArgs
  | BrowserTabChangeArgs
  | BrowserTabClosingArgs
  | Record<string, never>;

export type MethodResult =
  | RecordingInProgressResult
  | IsCameraBubbleVisibleResult
  | "OK";

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

function buildCancelRecording(): Message {
  return {
    method: Method.CancelRecording,
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

function buildIsCameraBubbleVisible(): Message {
  return {
    method: Method.GetterIsCameraBubbleVisible,
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

function buildTabStopMediaRecorder(): Message {
  return {
    method: Method.TabStopMediaRecorder,
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
  cancelRecording: buildCancelRecording,
  downloadRecording: buildDownloadRecording,
  showCameraBubble: buildShowCameraBubble,
  hideCameraBubble: buildHideCameraBubble,
  getter: {
    recordingInProgress: buildRecordingInProgress,
    isCameraBubbleVisible: buildIsCameraBubbleVisible,
  },
  internal: {
    browserTabChange: buildBrowserTabChange,
    browserTabClosing: buildBrowserTabClosing,
    tabStopMediaRecorder: buildTabStopMediaRecorder,
  },
  response: {
    ok: buildOkResponse,
    error: buildErrorResponse,
  },
};

export const sender = {
  send: (message: Message, tabId?: number): Promise<MessageResponse> => {
    if (!tabId) {
      return chrome.runtime.sendMessage(message);
    }
    console.log(`Send message to tab ${tabId}`);
    return chrome.tabs.sendMessage(tabId, message);
  },
};
