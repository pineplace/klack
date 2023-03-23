/**
 * @jest-environment jsdom
 */
// NOTE: https://testing-library.com/docs/
import React from "react";
import { jest } from "@jest/globals";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import type { Message, MessageResponse } from "../../messaging";
jest.unstable_mockModule("../../storage", () => {
  return {
    storage: {},
  };
});
const { storage: mockedStorage } = await import("../../storage");
jest.unstable_mockModule("../../messaging", () => {
  return {
    builder: {},
    sender: {},
  };
});
const { builder: mockedBuilder, sender: mockedSender } = await import(
  "../../messaging"
);
const { default: CameraBubble } = await import("../camera_bubble");

beforeEach(() => {
  globalThis.chrome = {
    runtime: {
      // @ts-expect-error Chrome methods mocking
      getURL: jest.fn().mockReturnValue("chrome-extension://some-url"),
    },
  };

  mockedBuilder.startRecording = (
    jest.fn() as jest.Mock<() => Message>
  ).mockReturnValue({} as Message);
  mockedBuilder.stopRecording = (
    jest.fn() as jest.Mock<() => Message>
  ).mockReturnValue({} as Message);

  mockedSender.send = (
    jest.fn() as jest.Mock<
      (message: Message, tabId?: number) => Promise<MessageResponse>
    >
  ).mockResolvedValue({ result: "OK" });

  // @ts-expect-error here we ignoring unused `storage` methods
  mockedStorage.get = {
    recordingInProgress: (
      jest.fn() as jest.Mock<() => Promise<boolean>>
    ).mockResolvedValue(false),
  };

  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test("CameraBubbleFrame", async () => {
  const { container, debug } = await act(() => {
    return render(<CameraBubble />);
  });

  debug();

  expect(container.querySelector("iframe")).not.toBeNull();
});

test("StartStopRecording", async () => {
  const { container, debug } = await act(() => {
    return render(<CameraBubble />);
  });

  debug();

  const buttonGroup = container.getElementsByClassName(
    "MuiButtonGroup-root"
  )[0];
  const [startStopRecording] =
    buttonGroup.getElementsByClassName("MuiButtonBase-root") ?? [];

  act(() => {
    mockedStorage.get.recordingInProgress = (
      jest.fn() as jest.Mock<() => Promise<boolean>>
    ).mockResolvedValue(true);
    fireEvent.click(startStopRecording);
  });

  expect(mockedBuilder.startRecording).toHaveBeenCalled();
  expect(mockedSender.send).toHaveBeenCalled();
  await waitFor(() => {
    expect(
      startStopRecording.firstElementChild?.getAttribute("data-testid")
    ).toEqual("StopCircleRoundedIcon");
  });

  act(() => {
    mockedStorage.get.recordingInProgress = (
      jest.fn() as jest.Mock<() => Promise<boolean>>
    ).mockResolvedValue(false);
    fireEvent.click(startStopRecording);
  });

  expect(mockedBuilder.stopRecording).toHaveBeenCalled();
  expect(mockedSender.send).toHaveBeenCalled();
  await waitFor(() => {
    expect(
      startStopRecording.firstElementChild?.getAttribute("data-testid")
    ).toEqual("PlayCircleFilledRoundedIcon");
  });
});
