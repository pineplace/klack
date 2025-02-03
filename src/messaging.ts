export enum MessageType {
  MediaRecorderPause,
  MediaRecorderResume,
  MediaRecorderStop,
  MicDisable,
  MicEnable,
  RecordingCancel,
  RecordingDelete,
  RecordingDownload,
  RecordingPause,
  RecordingResume,
  RecordingStart,
  RecordingStop,
  OpenUserActiveWindow,
  UserActiveWindowOpen,
}

export type MediaRecorderStopOptions = { downloadRecording: boolean };
export type RecordingCancelOptions = { reason: string };
export type RecordingDownloadOptions = { downloadUrl: string };
export type TabStopMediaRecorderOptions = { downloadRecording: boolean };

export type MessageOptions =
  | MediaRecorderStopOptions
  | RecordingCancelOptions
  | RecordingDownloadOptions
  | TabStopMediaRecorderOptions
  | Record<string, never>;

export interface Message {
  type: MessageType;
  options?: MessageOptions;
}

export const builder = {
  mediaRecorder: {
    pause: () => {
      return {
        type: MessageType.MediaRecorderPause,
      } satisfies Message;
    },
    resume: () => {
      return {
        type: MessageType.MediaRecorderResume,
      } satisfies Message;
    },
    stop: (downloadRecording: boolean) => {
      return {
        type: MessageType.MediaRecorderStop,
        options: {
          downloadRecording,
        } satisfies MediaRecorderStopOptions,
      } satisfies Message;
    },
  },
  mic: {
    disable: () => {
      return {
        type: MessageType.MicDisable,
      } satisfies Message;
    },
    enable: () => {
      return {
        type: MessageType.MicEnable,
      } satisfies Message;
    },
  },
  recording: {
    cancel: (reason: string) => {
      return {
        type: MessageType.RecordingCancel,
        options: {
          reason,
        } satisfies RecordingCancelOptions,
      } satisfies Message;
    },
    delete: () => {
      return {
        type: MessageType.RecordingDelete,
      } satisfies Message;
    },
    download: (downloadUrl: string) => {
      return {
        type: MessageType.RecordingDownload,
        options: {
          downloadUrl,
        } satisfies RecordingDownloadOptions,
      } satisfies Message;
    },
    pause: () => {
      return {
        type: MessageType.RecordingPause,
      } satisfies Message;
    },
    resume: () => {
      return {
        type: MessageType.RecordingResume,
      } satisfies Message;
    },
    start: () => {
      return {
        type: MessageType.RecordingStart,
      } satisfies Message;
    },
    stop: () => {
      return {
        type: MessageType.RecordingStop,
      } satisfies Message;
    },
  },
  userActiveWindow: {
    open: () => {
      return {
        type: MessageType.UserActiveWindowOpen,
      } satisfies Message;
    }
  }
};

export const sender = {
  send: (message: Message, tabId?: number): Promise<void> => {
    if (tabId) {
      return chrome.tabs.sendMessage(tabId, message);
    }
    return chrome.runtime.sendMessage(message);
  },
};
