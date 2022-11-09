/**
 * @jest-environment jsdom
 */
import React from "react";
import render from "react-test";

import {
  sendMessage, // eslint-disable-line
  Method,
  RecMode,
  RecSetMode,
  RecStart,
  RecStop,
} from "../rapidrec/communication";
import { PopupMenu } from "./popup_menu";

beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = () => jest.fn();
});

test("Default mode is `Screen Only`", () => {
  const component = render(<PopupMenu />);
  const toggleButtonGroup = component.children(":first-child");

  const screenAndCamBtn = toggleButtonGroup.children(":first-child");
  const screenOnlyBtn = toggleButtonGroup.children(":last-child");

  expect(screenAndCamBtn.is(".Mui-selected")).toEqual(false);
  expect(screenOnlyBtn.is(".Mui-selected")).toEqual(true);
});

test("When click on one mode then its disabled another", async () => {
  const mockedSendMessage = jest.fn().mockResolvedValue({});
  // @ts-expect-error Create mocked sendMessage
  sendMessage = mockedSendMessage;

  const component = render(<PopupMenu />);
  const toggleButtonGroup = component.children(":first-child");

  const screenAndCamBtn = toggleButtonGroup.children(":first-child");
  const screenOnlyBtn = toggleButtonGroup.children(":last-child");

  expect(screenAndCamBtn.is(".Mui-selected")).toEqual(false);
  expect(screenOnlyBtn.is(".Mui-selected")).toEqual(true);

  await screenAndCamBtn.click();

  expect(screenAndCamBtn.is(".Mui-selected")).toEqual(true);
  expect(screenOnlyBtn.is(".Mui-selected")).toEqual(false);
  expect(mockedSendMessage).toHaveBeenCalledTimes(1);
  expect(mockedSendMessage).toHaveBeenNthCalledWith(1, {
    method: Method.RecSetMode,
    params: { mode: RecMode.ScreenAndCam },
  } as RecSetMode);

  await screenOnlyBtn.click();

  expect(screenAndCamBtn.is(".Mui-selected")).toEqual(false);
  expect(screenOnlyBtn.is(".Mui-selected")).toEqual(true);
  expect(mockedSendMessage).toHaveBeenCalledTimes(2);
  expect(mockedSendMessage).toHaveBeenNthCalledWith(2, {
    method: Method.RecSetMode,
    params: { mode: RecMode.ScreenOnly },
  } as RecSetMode);
});

test("Switching between `Start` and `Stop` text in recording control button", async () => {
  const mockedSendMessage = jest.fn().mockResolvedValue({});
  // @ts-expect-error Create mocked sendMessage
  sendMessage = mockedSendMessage;

  const component = render(<PopupMenu />);
  const recordingControlButton = component.children(":last-child");

  expect(recordingControlButton.text()).toEqual("Start");

  await recordingControlButton.click();

  expect(recordingControlButton.text()).toEqual("Stop");
  expect(mockedSendMessage).toHaveBeenCalledTimes(1);
  expect(mockedSendMessage).toHaveBeenNthCalledWith(1, {
    method: Method.RecStart,
  } as RecStart);

  await recordingControlButton.click();

  expect(recordingControlButton.text()).toEqual("Start");
  expect(mockedSendMessage).toHaveBeenCalledTimes(2);
  expect(mockedSendMessage).toHaveBeenNthCalledWith(2, {
    method: Method.RecStop,
  } as RecStop);
});
