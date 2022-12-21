/**
 * @jest-environment jsdom
 */
// NOTE: https://testing-library.com/docs/
import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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
      getter: {
        recordingInProgress: jest.fn(),
      },
    },
    sender: {
      send: jest.fn().mockResolvedValue({ result: false }),
    },
  };
});

test("ShowHideRecording switching", async () => {
  await act(() => {
    render(<PopupMenu />);
  });

  const button = screen.getByText("Show bubble");

  await act(() => {
    fireEvent.click(button);
  });

  expect(builder.showCameraBubble).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  expect(button.textContent).toEqual("Hide bubble");

  await act(() => {
    fireEvent.click(button);
  });

  expect(builder.hideCameraBubble).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  expect(button.textContent).toEqual("Show bubble");
});

test("StartStopRecording switching", async () => {
  const { rerender } = await act(() => {
    return render(<PopupMenu />);
  });

  const button = screen.getByText("Start");

  await act(() => {
    (sender.send as jest.Mock).mockResolvedValue({ result: true });
    fireEvent.click(button);
    rerender(<PopupMenu />);
  });

  expect(builder.startRecording).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  await waitFor(() => {
    expect(button.textContent).toEqual("Stop");
  });

  await act(() => {
    (sender.send as jest.Mock).mockResolvedValue({ result: false });
    fireEvent.click(button);
    rerender(<PopupMenu />);
  });

  expect(builder.stopRecording).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  await waitFor(() => {
    expect(button.textContent).toEqual("Start");
  });
});
