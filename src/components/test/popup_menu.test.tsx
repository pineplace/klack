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
        isCameraBubbleVisible: jest.fn(),
      },
    },
    sender: {
      send: jest.fn().mockResolvedValue({ result: false }),
    },
  };
});

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test("ShowHideRecording switching", async () => {
  (sender.send as jest.Mock).mockResolvedValue({ result: false });

  await act(() => {
    return render(<PopupMenu />);
  });

  const button = screen.getByText("Show bubble");

  await act(() => {
    (sender.send as jest.Mock).mockResolvedValue({ result: true });
    fireEvent.click(button);
  });

  expect(builder.showCameraBubble).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  await waitFor(() => {
    expect(button.textContent).toEqual("Hide bubble");
  });

  await act(() => {
    (sender.send as jest.Mock).mockResolvedValue({ result: false });
    fireEvent.click(button);
  });

  expect(builder.hideCameraBubble).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  await waitFor(() => {
    expect(button.textContent).toEqual("Show bubble");
  });
});

test("StartStopRecording switching", async () => {
  (sender.send as jest.Mock).mockResolvedValue({ result: false });

  await act(() => {
    return render(<PopupMenu />);
  });

  const button = screen.getByText("Start");

  await act(() => {
    (sender.send as jest.Mock).mockResolvedValue({ result: true });
    fireEvent.click(button);
  });

  expect(builder.startRecording).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  await waitFor(() => {
    expect(button.textContent).toEqual("Stop");
  });

  await act(() => {
    (sender.send as jest.Mock).mockResolvedValue({ result: false });
    fireEvent.click(button);
  });

  expect(builder.stopRecording).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  await waitFor(() => {
    expect(button.textContent).toEqual("Start");
  });
});
