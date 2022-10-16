import { RecMode } from "./enums";
import {
  BrowserTabChange,
  BrowserTabClosing,
  Message,
  MessageResponse,
  MethodResult,
  RecSetMode,
  RecStop,
  Success,
} from "./communication";
import { Injector, DeInjector } from "./injection";

enum State {
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

  // TODO: Add try/catch below

  /* Public events */
  static async setMode(message: Message): Promise<MessageResponse> {
    console.log(`RapidRec setMode ${JSON.stringify(message)}`);
    message = message as RecSetMode;

    switch (message.params.mode) {
      case RecMode.ScreenOnly:
        // Do nothing
        break;
      case RecMode.ScreenAndCam:
        await Injector.camViewAndControls(RapidRec.ctx.currentTab);
        break;
      default:
        throw new Error(`Unknown record mode ${message.params.mode as string}`);
    }
    RapidRec.ctx.mode = message.params.mode;
    return { result: MethodResult.Success } as Success;
  }

  static async startRecording(message: Message): Promise<MessageResponse> {
    console.log(`RapidRec startRecording ${JSON.stringify(message)}`);
    if (!RapidRec.ctx.mode) {
      throw new Error("Current mode is `null`, can't start recording");
    }
    await Injector.screenCapture(RapidRec.ctx.currentTab);
    return { result: MethodResult.Success } as Success;
  }

  static async stopRecording(message: Message): Promise<MessageResponse> {
    console.log(`RapidRec stopRecording ${JSON.stringify(message)}`);
    message = message as RecStop;

    await chrome.downloads.download({
      url: message.params.downloadUrl,
    });
    return { result: MethodResult.Success } as Success;
  }

  /* Internal events */
  static async handleTabChange(message: Message): Promise<MessageResponse> {
    console.log(`RapidRec handleTabChange ${JSON.stringify(message)}`);
    message = message as BrowserTabChange;

    if (RapidRec.ctx.mode === RecMode.ScreenAndCam) {
      await DeInjector.camViewAndControls(RapidRec.ctx.currentTab);
      await Injector.camViewAndControls(message.params.tabId);
    }
    RapidRec.ctx.currentTab = message.params.tabId;
    return { result: MethodResult.Success } as Success;
  }

  static async handleTabClosing(message: Message): Promise<MessageResponse> {
    console.log(`RapidRec handleTabClosing ${JSON.stringify(message)}`);
    message as BrowserTabClosing;

    RapidRec.ctx.currentTab = 0;
    RapidRec.ctx.state = State.Idle;

    // NOTE @imblowfish: Just a hint for compatibility with other functions
    return new Promise((resolve) =>
      resolve({ result: MethodResult.Success } as Success)
    );
  }
}
