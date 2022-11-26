/**
 * @jest-environment jsdom
 */
// NOTE: https://testing-library.com/docs/
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { PopupMenu } from "./popup_menu";
import {
  Method,
  RecMode,
  RecSetMode,
  RecStart,
  RecStop,
  sendMessage, // eslint-disable-line
} from "../rapidrec/communication";

beforeEach(() => {
  globalThis.chrome = {
    // @ts-expect-error Chrome global object doesn't implemented in jest context, but TS waiting for it
    scripting: {
      executeScript: jest.fn(),
    },
  };
});

test("Default mode is `Screen Only`", () => {
  render(<PopupMenu />);

  const screenAndCamBtn = screen.getByText("Screen & Cam");
  const screenOnlyBtn = screen.getByText("Screen Only");

  expect(screenAndCamBtn.className.includes("Mui-selected")).toEqual(false);
  expect(screenOnlyBtn.className.includes("Mui-selected")).toEqual(true);
});

test("When click on one mode then it's disabled another", () => {
  const mockedSendMessage = jest.fn().mockResolvedValue({});
  // @ts-expect-error Create mocked sendMessage
  sendMessage = mockedSendMessage;

  render(<PopupMenu />);

  const screenAndCamBtn = screen.getByText("Screen & Cam");
  const screenOnlyBtn = screen.getByText("Screen Only");

  fireEvent.click(screenAndCamBtn);

  expect(screenAndCamBtn.className.includes("Mui-selected")).toEqual(true);
  expect(screenOnlyBtn.className.includes("Mui-selected")).toEqual(false);
  expect(mockedSendMessage).toHaveBeenCalledTimes(1);
  expect(mockedSendMessage).toHaveBeenNthCalledWith(1, {
    method: Method.RecSetMode,
    params: { mode: RecMode.ScreenAndCam },
  } as RecSetMode);

  fireEvent.click(screenOnlyBtn);

  expect(screenAndCamBtn.className.includes("Mui-selected")).toEqual(false);
  expect(screenOnlyBtn.className.includes("Mui-selected")).toEqual(true);
  expect(mockedSendMessage).toHaveBeenCalledTimes(2);
  expect(mockedSendMessage).toHaveBeenNthCalledWith(2, {
    method: Method.RecSetMode,
    params: { mode: RecMode.ScreenOnly },
  } as RecSetMode);
});

test("Switching between `Start` and `Stop` text in recording control button", () => {
  const mockedSendMessage = jest.fn().mockResolvedValue({});
  // @ts-expect-error Create mocked sendMessage
  sendMessage = mockedSendMessage;

  render(<PopupMenu />);

  const recControlBtn = screen.getByText("Start");

  fireEvent.click(recControlBtn);

  expect(recControlBtn.textContent).toEqual("Stop");
  expect(mockedSendMessage).toHaveBeenCalledTimes(1);
  expect(mockedSendMessage).toHaveBeenNthCalledWith(1, {
    method: Method.RecStart,
  } as RecStart);

  fireEvent.click(recControlBtn);

  expect(recControlBtn.textContent).toEqual("Start");
  expect(mockedSendMessage).toHaveBeenCalledTimes(2);
  expect(mockedSendMessage).toHaveBeenNthCalledWith(2, {
    method: Method.RecStop,
  } as RecStop);
});
