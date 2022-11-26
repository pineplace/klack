/**
 * @jest-environment jsdom
 */
// NOTE: https://testing-library.com/docs/
import React from "react";
import { fireEvent, render } from "@testing-library/react";

import { createCameraStream } from "../browser-side/stream"; // eslint-disable-line

import { Method, RecStart, RecStop, sendMessage } from "../rapidrec/communication"; // eslint-disable-line
import { CameraBubble } from "./camera_bubble";

jest.mock("../browser-side/stream");

beforeEach(() => {
  globalThis.chrome = {
    // @ts-expect-error Chrome global object doesn't implemented in jest context, but TS waiting for it
    scripting: {
      executeScript: jest.fn(),
    },
  };
});

describe("Buttons on start", () => {
  const createCameraStreamMocking = jest.fn().mockResolvedValue({});
  // @ts-expect-error Create mocked createCameraStream
  createCameraStream = createCameraStreamMocking;

  const { container } = render(<CameraBubble />);

  const buttonsGroup = container.getElementsByClassName(
    "MuiButtonGroup-root"
  )[0];
  const [deleteBtn, playPauseBtn, stopBtn] =
    buttonsGroup.getElementsByClassName("MuiButtonBase-root") ?? [];

  test("`Play/Pause` is enabled", () => {
    expect(playPauseBtn.className.includes("Mui-disabled")).toEqual(false);
  });

  test("`Play/Pause` icon is `Play`", () => {
    expect(playPauseBtn.firstElementChild?.getAttribute("data-testid")).toEqual(
      "PlayCircleFilledRoundedIcon"
    );
  });

  test("`Stop` is disabled", () => {
    expect(stopBtn.className.includes("Mui-disabled")).toEqual(true);
  });

  test("`Delete` is disabled", () => {
    expect(deleteBtn.className.includes("Mui-disabled")).toEqual(true);
  });
});

describe("Click on various buttons", () => {
  const createCameraStreamMocking = jest.fn().mockResolvedValue({});
  // @ts-expect-error Create mocked createCameraStream
  createCameraStream = createCameraStreamMocking;

  const { container } = render(<CameraBubble />);

  const buttonsGroup = container.getElementsByClassName(
    "MuiButtonGroup-root"
  )[0];
  const [deleteBtn, playPauseBtn, stopBtn] =
    buttonsGroup.getElementsByClassName("MuiButtonBase-root") ?? [];

  describe("Clicking on `Play/Pause`", () => {
    const mockedSendMessage = jest.fn().mockResolvedValue({});
    // @ts-expect-error Create mocked sendMessage
    sendMessage = mockedSendMessage;

    fireEvent.click(playPauseBtn);

    test("`Delete` and `Stop` are available", () => {
      expect(deleteBtn.className.includes("Mui-disabled")).toEqual(false);
      expect(stopBtn.className.includes("Mui-disabled")).toEqual(false);
    });

    test("Start recording message was sent", () => {
      expect(mockedSendMessage).toHaveBeenLastCalledWith({
        method: Method.RecStart,
      } as RecStart);
    });

    test("Icon was changed to `Pause`", () => {
      expect(
        playPauseBtn.firstElementChild?.getAttribute("data-testid")
      ).toEqual("PauseCircleFilledRoundedIcon");
    });
  });

  describe("Clicking on `Stop`", () => {
    const mockedSendMessage = jest.fn().mockResolvedValue({});
    // @ts-expect-error Create mocked sendMessage
    sendMessage = mockedSendMessage;

    fireEvent.click(stopBtn);

    test("Start recording message was sent", () => {
      expect(mockedSendMessage).toHaveBeenLastCalledWith({
        method: Method.RecStop,
      } as RecStop);
    });
  });
});
