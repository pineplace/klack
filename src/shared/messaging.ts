export enum MessageType {
  // background
  CameraBubbleShow = "CameraBubbleShow",
  CameraBubbleHide = "CameraBubbleHide",
  RecordingStart = "RecordingStart",
  RecordingComplete = "RecordingComplete",
  RecordingPause = "RecordingPause",
  RecordingResume = "RecordingResume",
  RecordingCancel = "RecordingCancel",
  RecordingSave = "RecordingSave",
  PermissionsTabOpen = "PermissionsPageOpen",
  PermissionsTabClose = "PermissionsPageClose",
  // offscreen
  RecorderCreate = "RecorderCreate",
  RecorderStart = "RecorderStart",
  RecorderStop = "RecorderStop",
  RecorderPause = "RecorderPause",
  RecorderResume = "RecorderResume",
  RecorderCancel = "RecorderCancel",
  RecorderDelete = "RecorderDelete",
}

export enum MessageResponseType {
  ResultOk = "ResultOk",
  ResultError = "ResultError",
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

export interface Message {
  type: MessageType;
  target?: "background" | "offscreen";
  options?: RecordingSaveOptions | RecorderCreateOptions;
}

export interface MessageResponse {
  type: MessageResponseType.ResultOk | MessageResponseType.ResultError;
  reason?: string;
}

export const sender = {
  background: {
    cameraBubbleShow: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.CameraBubbleShow,
        target: "background",
      });
    },
    cameraBubbleHide: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.CameraBubbleHide,
        target: "background",
      });
    },
    recordingStart: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecordingStart,
        target: "background",
      });
    },
    recordingComplete: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecordingComplete,
        target: "background",
      });
    },
    recordingPause: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecordingPause,
        target: "background",
      });
    },
    recordingResume: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecordingResume,
        target: "background",
      });
    },
    recordingCancel: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecordingCancel,
        target: "background",
      });
    },
    recordingSave: (options: RecordingSaveOptions) => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecordingSave,
        target: "background",
        options,
      });
    },
    permissionsTabOpen: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.PermissionsTabOpen,
        target: "background",
      });
    },
    permissionsTabClose: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.PermissionsTabClose,
        target: "background",
      });
    },
  },
  offscreen: {
    recorderCreate: (options: RecorderCreateOptions) => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecorderCreate,
        target: "offscreen",
        options,
      });
    },
    recorderStart: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecorderStart,
        target: "offscreen",
      });
    },
    recorderStop: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecorderStop,
        target: "offscreen",
      });
    },
    recorderPause: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecorderPause,
        target: "offscreen",
      });
    },
    recorderResume: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecorderResume,
        target: "offscreen",
      });
    },
    recorderCancel: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecorderCancel,
        target: "offscreen",
      });
    },
    recorderDelete: () => {
      return chrome.runtime.sendMessage<Message, MessageResponse>({
        type: MessageType.RecorderDelete,
        target: "offscreen",
      });
    },
  },
};
