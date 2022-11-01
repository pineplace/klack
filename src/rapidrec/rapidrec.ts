/**
 * Implements high-level extension functions that are
 * called from a `callbacks.ts` file
 */
import {
  BrowserTabChange,
  BrowserTabClosing,
  Failure,
  Message,
  MessageResponse,
  MethodResult,
  RecMode,
  RecSetMode,
  RecStop,
  Success,
} from "./communication";
import { ErrorCode } from "./errors";
import { Injector, DeInjector } from "./injection";

export enum State {
  Idle,
  Recording,
}

interface Context {
  mode: RecMode | null;
  state: State;
  currentTab: number;
}

export class RapidRec {
  static ctx: Context = {
    mode: null,
    state: State.Idle,
    currentTab: 0,
  };

  /* Public events */
  static async setMode(message: Message): Promise<MessageResponse> {
    console.log(`RapidRec setMode ${JSON.stringify(message)}`);
    message = message as RecSetMode;

    try {
      switch (message.params.mode) {
        case RecMode.ScreenOnly:
          // Do nothing
          break;
        case RecMode.ScreenAndCam:
          await Injector.cameraBubble(RapidRec.ctx.currentTab);
          break;
        default:
          throw new Error(
            `Unknown record mode ${message.params.mode as string}`
          );
      }
      RapidRec.ctx.mode = message.params.mode;
      return { result: MethodResult.Success } as Success;
    } catch (err) {
      return {
        result: MethodResult.Failed,
        errCode: ErrorCode.Some,
        message: `RapidRec setMode: ${(err as Error).message}`,
      } as Failure;
    }
  }

  static async startRecording(message: Message): Promise<MessageResponse> {
    console.log(`RapidRec startRecording ${JSON.stringify(message)}`);

    try {
      if (!RapidRec.ctx.mode) {
        throw new Error("Current mode is `null`, can't start recording");
      }
      await Injector.screenCapture(RapidRec.ctx.currentTab);
      return { result: MethodResult.Success } as Success;
    } catch (err) {
      return {
        result: MethodResult.Failed,
        errCode: ErrorCode.Some,
        message: `RapidRec startRecording: ${(err as Error).message}`,
      } as Failure;
    }
  }

  static async stopRecording(message: Message): Promise<MessageResponse> {
    console.log(`RapidRec stopRecording ${JSON.stringify(message)}`);
    message = message as RecStop;

    try {
      await chrome.downloads.download({
        url: message.params.downloadUrl,
      });
      return { result: MethodResult.Success } as Success;
    } catch (err) {
      return {
        result: MethodResult.Failed,
        errCode: ErrorCode.Some,
        message: `RapidRec stopRecording: ${(err as Error).message}`,
      } as Failure;
    }
  }

  /* Internal events */
  static async handleTabChange(message: Message): Promise<MessageResponse> {
    console.log(`RapidRec handleTabChange ${JSON.stringify(message)}`);
    message = message as BrowserTabChange;

    try {
      if (RapidRec.ctx.mode === RecMode.ScreenAndCam) {
        if (RapidRec.ctx.currentTab) {
          await DeInjector.cameraBubble(RapidRec.ctx.currentTab);
        }
        await Injector.cameraBubble(message.params.tabId);
      }
      RapidRec.ctx.currentTab = message.params.tabId;
      return { result: MethodResult.Success } as Success;
    } catch (err) {
      return {
        result: MethodResult.Failed,
        errCode: ErrorCode.Some,
        message: `RapidRec handleTabChange: ${(err as Error).message}`,
      } as Failure;
    }
  }

  static handleTabClosing(message: Message): Promise<MessageResponse> {
    console.log(`RapidRec handleTabClosing ${JSON.stringify(message)}`);
    message as BrowserTabClosing;

    // NOTE @imblowfish: Just a hint for compatibility with other functions
    return new Promise((resolve) => {
      try {
        RapidRec.ctx.mode = null;
        RapidRec.ctx.state = State.Idle;
        RapidRec.ctx.currentTab = 0;
        resolve({ result: MethodResult.Success } as Success);
      } catch (err) {
        resolve({
          result: MethodResult.Failed,
          errCode: ErrorCode.Some,
          message: `RapidRec setMode: ${(err as Error).message}`,
        } as Failure);
      }
    });
  }
}
