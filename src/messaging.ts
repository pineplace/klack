export enum MessageType {
  MediaRecorderPause = "MediaRecorderPause",
  MediaRecorderResume = "MediaRecorderResume",
  MediaRecorderStop = "MediaRecorderStop",
  RecordingDownload = "RecordingDownload",
}

export type MediaRecorderStopOptions = { downloadRecording: boolean };
export type RecordingDownloadOptions = { downloadUrl: string };
export type TabStopMediaRecorderOptions = { downloadRecording: boolean };

export type MessageOptions =
  | MediaRecorderStopOptions
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
  recording: {
    download: (downloadUrl: string) => {
      return {
        type: MessageType.RecordingDownload,
        options: {
          downloadUrl,
        } satisfies RecordingDownloadOptions,
      } satisfies Message;
    },
  },
};

export const sender = {
  send: (message: Message, tabId?: number): Promise<void> => {
    if (tabId) {
      return chrome.tabs.sendMessage(tabId, message);
    }
    return chrome.runtime.sendMessage(message);
  },
};
