/**
 * @jest-environment jsdom
 */
// NOTE: https://testing-library.com/docs/
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { builder, sender } from "../../messaging";
import PopupMenu from "../popup_menu";

jest.mock("../../messaging", () => {
  const mocked: object = jest.createMockFromModule("../../messaging");
  return {
    ...mocked,
    builder: {
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
      showCameraBubble: jest.fn(),
      hideCameraBubble: jest.fn(),
    },
    sender: {
      send: jest.fn().mockResolvedValue({}),
    },
  };
});

test("ShowHideRecording switching", () => {
  render(<PopupMenu />);

  const button = screen.getByText("Show bubble");

  fireEvent.click(button);

  expect(builder.showCameraBubble).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  expect(button.textContent).toEqual("Hide bubble");

  fireEvent.click(button);

  expect(builder.hideCameraBubble).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  expect(button.textContent).toEqual("Show bubble");
});

test("StartStopRecording switching", () => {
  render(<PopupMenu />);

  const button = screen.getByText("Start");

  fireEvent.click(button);

  expect(builder.startRecording).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  expect(button.textContent).toEqual("Stop");

  fireEvent.click(button);
  expect(builder.stopRecording).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  expect(button.textContent).toEqual("Start");
});
