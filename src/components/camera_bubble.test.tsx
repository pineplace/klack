/**
 * @jest-environment jsdom
 */
import React from "react";
import render from "react-test";
import {
  Method,
  RecStart,
  RecStop,
  sendMessage, // eslint-disable-line
} from "../rapidrec/communication";

import { CameraBubble } from "./camera_bubble";

beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = () => jest.fn();
});

describe("Buttons on start", () => {
  const component = render(<CameraBubble />);
  const buttonGroup = component.children(":last-child");

  const deleteBtn = buttonGroup.children(":nth-child(1)");
  const playPauseBtn = buttonGroup.children(":nth-child(2)");
  const stopBtn = buttonGroup.children(":nth-child(3)");

  test("`Play/Pause` is enabled", () => {
    expect(playPauseBtn.is(".Mui-disabled")).toEqual(false);
  });

  test("`Play/Pause` icon is Play", () => {
    expect(playPauseBtn.html().includes("PlayCircleFilledRoundedIcon")).toEqual(
      true
    );
  });

  test("`Stop` is disabled", () => {
    expect(stopBtn.is(".Mui-disabled")).toEqual(true);
  });

  test("`Delete` is disabled", () => {
    expect(deleteBtn.is(".Mui-disabled")).toEqual(true);
  });
});

describe("Click on various buttons", () => {
  const mockedSendMessage = jest.fn().mockResolvedValue({});
  // @ts-expect-error Create mocked sendMessage
  sendMessage = mockedSendMessage;

  const component = render(<CameraBubble />);
  const buttonGroup = component.children(":last-child");

  const deleteBtn = buttonGroup.children(":nth-child(1)");
  const playPauseBtn = buttonGroup.children(":nth-child(2)");
  const stopBtn = buttonGroup.children(":nth-child(3)");

  describe("Clicking on`Play/Pause`", () => {
    test("Enable `Delete` and `Stop` on `Play` click", async () => {
      await playPauseBtn.click();

      expect(stopBtn.is(".Mui-disabled")).toEqual(false);
      expect(deleteBtn.is(".Mui-disabled")).toEqual(false);
    });

    test("Start recording message was sent on `Play` click", () => {
      expect(mockedSendMessage).toHaveBeenCalledTimes(1);
      expect(mockedSendMessage).toHaveBeenNthCalledWith(1, {
        method: Method.RecStart,
      } as RecStart);
    });

    test("After clicking on `Play` icon was changed to `Pause`", () => {
      expect(
        playPauseBtn.html().includes("PauseCircleFilledRoundedIcon")
      ).toEqual(true);
    });
  });

  describe("Clicking on `Stop`", () => {
    test("Stop recording message send on `Stop` click", async () => {
      await stopBtn.click();

      expect(mockedSendMessage).toHaveBeenCalledTimes(2);
      expect(mockedSendMessage).toHaveBeenNthCalledWith(2, {
        method: Method.RecStop,
      } as RecStop);
    });
  });
});
