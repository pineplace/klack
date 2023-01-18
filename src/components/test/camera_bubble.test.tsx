/**
 * @jest-environment jsdom
 */
// NOTE: https://testing-library.com/docs/
import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { builder, sender } from "../../messaging";
import CameraBubble from "../camera_bubble";

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

beforeEach(() => {
  globalThis.chrome = {
    // @ts-expect-error Chrome methods mocking
    runtime: {
      getURL: jest.fn().mockReturnValue("chrome-extension://some-url"),
    },
  };

  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test("CameraBubbleFrame", async () => {
  const { container } = await act(() => {
    return render(<CameraBubble />);
  });

  expect(container.getElementsByTagName("iframe")).toBeDefined();
});

test("StartStopRecording", async () => {
  const { container } = await act(() => {
    return render(<CameraBubble />);
  });

  const buttonGroup = container.getElementsByClassName(
    "MuiButtonGroup-root"
  )[0];
  const [startStopRecording] =
    buttonGroup.getElementsByClassName("MuiButtonBase-root") ?? [];

  act(() => {
    (sender.send as jest.Mock).mockResolvedValue({ result: true });
    fireEvent.click(startStopRecording);
  });

  expect(builder.startRecording).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  await waitFor(() => {
    expect(
      startStopRecording.firstElementChild?.getAttribute("data-testid")
    ).toEqual("StopCircleRoundedIcon");
  });

  act(() => {
    (sender.send as jest.Mock).mockResolvedValue({ result: false });
    fireEvent.click(startStopRecording);
  });

  expect(builder.stopRecording).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  await waitFor(() => {
    expect(
      startStopRecording.firstElementChild?.getAttribute("data-testid")
    ).toEqual("PlayCircleFilledRoundedIcon");
  });
});
