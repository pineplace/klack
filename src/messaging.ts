export enum Method {
  StartRecording,
  StopRecording,
  PauseRecording,
  ResumeRecording,
  DeleteRecording,
  CancelRecording,
  DownloadRecording,

  ShowCameraBubble,
  HideCameraBubble,

  AllowMicrophone,
  DisallowMicrophone,

  BrowserTabChange,
  BrowserTabClosing,
  BrowserTabUpdated,
  TabStopMediaRecorder,
  TabPauseMediaRecorder,
  TabResumeMediaRecorder,
  OpenUserActiveWindow,
  BrowserWindowChange,
}

export type CancelRecordingArgs = { reason: string };
export type DownloadRecordingArgs = { downloadUrl: string };
export type BrowserTabChangeArgs = { newTabId: number };
export type BrowserTabClosingArgs = { closedTabId: number };
export type TabStopMediaRecorderArgs = { downloadRecording: boolean };
export type BrowserWindowChangeArgs = { newWindowId: number };

export type MethodArgs =
  | CancelRecordingArgs
  | DownloadRecordingArgs
  | BrowserTabChangeArgs
  | BrowserTabClosingArgs
  | TabStopMediaRecorderArgs
  | BrowserWindowChangeArgs
  | Record<string, never>;

export type MethodResult = "OK";

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

function buildPauseRecording(): Message {
  return {
    method: Method.PauseRecording,
  };
}

function buildResumeRecording(): Message {
  return {
    method: Method.ResumeRecording,
  };
}

function buildDeleteRecording(): Message {
  return {
    method: Method.DeleteRecording,
  };
}

function buildCancelRecording(reason: string): Message {
  return {
    method: Method.CancelRecording,
    args: {
      reason,
    },
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

function buildAllowMicrophone(): Message {
  return {
    method: Method.AllowMicrophone,
  };
}

function buildDisallowMicrophone(): Message {
  return {
    method: Method.DisallowMicrophone,
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

function buildBrowserTabUpdated(): Message {
  return {
    method: Method.BrowserTabUpdated,
  };
}

function buildBrowserWindowChange(newWindowId: number): Message {
  return {
    method: Method.BrowserWindowChange,
    args: {
      newWindowId,
    },
  };
}

function buildTabStopMediaRecorder(downloadRecording: boolean): Message {
  return {
    method: Method.TabStopMediaRecorder,
    args: {
      downloadRecording,
    },
  };
}

function buildTabPauseMediaRecorder(): Message {
  return {
    method: Method.TabPauseMediaRecorder,
  };
}

function buildTabResumeMediaRecorder(): Message {
  return {
    method: Method.TabResumeMediaRecorder,
  };
}

function buildOpenUserActiveWindow(): Message {
  return {
    method: Method.OpenUserActiveWindow,
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
  pauseRecording: buildPauseRecording,
  resumeRecording: buildResumeRecording,
  deleteRecording: buildDeleteRecording,
  cancelRecording: buildCancelRecording,
  downloadRecording: buildDownloadRecording,
  showCameraBubble: buildShowCameraBubble,
  hideCameraBubble: buildHideCameraBubble,
  allowMicrophone: buildAllowMicrophone,
  disallowMicrophone: buildDisallowMicrophone,
  tabStopMediaRecorder: buildTabStopMediaRecorder,
  tabPauseMediaRecorder: buildTabPauseMediaRecorder,
  tabResumeMediaRecorder: buildTabResumeMediaRecorder,
  openUserActiveWindow: buildOpenUserActiveWindow,
  event: {
    browserTabChange: buildBrowserTabChange,
    browserTabClosing: buildBrowserTabClosing,
    browserTabUpdated: buildBrowserTabUpdated,
    browserWindowChange: buildBrowserWindowChange,
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
