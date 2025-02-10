export enum MessageType {
  MediaRecorderPause = "MediaRecorderPause",
  MediaRecorderResume = "MediaRecorderResume",
  MediaRecorderStop = "MediaRecorderStop",
  RecordingDownload = "RecordingDownload",
  ResultOk = "ResultOk",
  ResultError = "ResultError",
  // Messages for background
  CameraBubbleShow = "CameraBubbleShow",
  CameraBubbleHide = "CameraBubbleHide",
  RecordingStart = "RecordingStart",
  RecordingStop = "RecordingStop",
  RecordingPause = "RecordingPause",
  RecordingResume = "RecordingResume",
  RecordingCancel = "RecordingCancel",
  RecordingSave = "RecordingSave",
  // Messages for offscreen
  RecorderCreate = "RecorderCreate",
  RecorderStart = "RecorderStart",
  RecorderStop = "RecorderStop",
  RecorderPause = "RecorderPause",
  RecorderResume = "RecorderResume",
  RecorderCancel = "RecorderCancel",
  RecorderDelete = "RecorderDelete",
}

export interface MediaRecorderStopOptions {
  downloadRecording: boolean;
}

export interface RecordingDownloadOptions {
  downloadUrl: string;
}

export interface TabStopMediaRecorderOptions {
  downloadRecording: boolean;
}

export interface RecordingSaveOptions {
  recordingUrl: string;
}

export interface RecorderCreateOptions {
  mic: {
    enabled: boolean;
    id: string;
  };
}

export type MessageOptions =
  | MediaRecorderStopOptions
  | RecordingDownloadOptions
  | TabStopMediaRecorderOptions
  | RecordingSaveOptions
  | RecorderCreateOptions
  | Record<string, never>;

export interface Message {
  type: MessageType;
  target?: "background" | "offscreen";
  options?: MessageOptions;
}

export interface MessageResponse {
  type: MessageType.ResultOk | MessageType.ResultError;
  reason?: string;
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

export const senderV2 = {
  background: {
    cameraBubbleShow: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.CameraBubbleShow,
        target: "background",
      } satisfies Message);
    },
    cameraBubbleHide: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.CameraBubbleHide,
        target: "background",
      } satisfies Message);
    },
    recordingStart: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecordingStart,
        target: "background",
      } satisfies Message);
    },
    recordingStop: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecordingStop,
        target: "background",
      } satisfies Message);
    },
    recordingPause: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecordingPause,
        target: "background",
      } satisfies Message);
    },
    recordingResume: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecordingResume,
        target: "background",
      } satisfies Message);
    },
    recordingCancel: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecordingCancel,
        target: "background",
      } satisfies Message);
    },
    recordingSave: (options: RecordingSaveOptions) => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecordingSave,
        target: "background",
        options,
      } satisfies Message);
    },
  },
  offscreen: {
    recorderCreate: (options: RecorderCreateOptions) => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecorderCreate,
        target: "offscreen",
        options,
      } satisfies Message);
    },
    recorderStart: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecorderStart,
        target: "offscreen",
      } satisfies Message);
    },
    recorderStop: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecorderStop,
        target: "offscreen",
      } satisfies Message);
    },
    recorderPause: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecorderPause,
        target: "offscreen",
      } satisfies Message);
    },
    recorderResume: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecorderResume,
        target: "offscreen",
      } satisfies Message);
    },
    recorderCancel: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecorderCancel,
        target: "offscreen",
      } satisfies Message);
    },
    recorderDelete: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecorderDelete,
        target: "offscreen",
      } satisfies Message);
    },
  },
};

export const sender = {
  send: (message: Message, tabId?: number): Promise<MessageResponse> => {
    if (tabId) {
      return chrome.tabs.sendMessage(tabId, message);
    }
    return chrome.runtime.sendMessage(message);
  },
};
