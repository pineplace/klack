/**
 * @jest-environment jsdom
 */
// NOTE: https://testing-library.com/docs/
import React from "react";
import { jest } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  waitForElementToBeRemoved,
} from "@testing-library/react";
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
  mockedBuilder.hideCameraBubble = (
    jest.fn() as jest.Mock<() => Message>
  ).mockReturnValue({} as Message);

  mockedSender.send = (
    jest.fn() as jest.Mock<
      (message: Message, tabId?: number) => Promise<MessageResponse>
    >
  ).mockResolvedValue({ result: "OK" });

  // @ts-expect-error here we ignoring unused `storage` methods
  mockedStorage.set = {
    cameraBubbleSize: (
      jest.fn() as jest.Mock<
        (size: { width: number; height: number }) => Promise<void>
      >
    ).mockResolvedValue(),
  };

  // @ts-expect-error here we ignoring unused `storage` methods
  mockedStorage.get = {
    recordingInProgress: (
      jest.fn() as jest.Mock<() => Promise<boolean>>
    ).mockResolvedValue(true),
    cameraBubbleSize: (
      jest.fn() as jest.Mock<() => Promise<{ width: number; height: number }>>
    ).mockResolvedValue({ width: 200, height: 200 }),
  };

  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test("CloseCameraBubble", async () => {
  const { container, debug: _debug } = await act(() => {
    return render(<CameraBubble />);
  });

  // debug();

  const closeCameraBubbleBtn = container.querySelector(
    '[data-testid="CloseIcon"]'
  );

  expect(closeCameraBubbleBtn).not.toBeNull();

  act(() => {
    fireEvent.click(closeCameraBubbleBtn as Element);
  });

  expect(mockedBuilder.hideCameraBubble).toHaveBeenCalled();
  expect(mockedSender.send).toHaveBeenCalled();
});

test("CameraBubbleFrame", async () => {
  const { container, debug: _debug } = await act(() => {
    return render(<CameraBubble />);
  });

  // debug();

  expect(container.querySelector("iframe")).not.toBeNull();
});

test("StartStopRecording", async () => {
  const { container, debug: _debug } = await act(() => {
    return render(<CameraBubble />);
  });

  // debug();

  const playBtn = container.querySelector(
    '[data-testid="PlayCircleFilledRoundedIcon"]'
  );

  expect(playBtn).not.toBeNull();
  act(() => {
    mockedStorage.get.recordingInProgress = (
      jest.fn() as jest.Mock<() => Promise<boolean>>
    ).mockResolvedValue(true);
    fireEvent.click(playBtn as Element);
  });
  expect(mockedBuilder.startRecording).toHaveBeenCalled();
  expect(mockedSender.send).toHaveBeenCalledTimes(1);
  await waitForElementToBeRemoved(playBtn);

  const stopBtn = container.querySelector(
    '[data-testid="StopCircleRoundedIcon"]'
  );

  expect(stopBtn).not.toBeNull();
  act(() => {
    mockedStorage.get.recordingInProgress = (
      jest.fn() as jest.Mock<() => Promise<boolean>>
    ).mockResolvedValue(false);
    fireEvent.click(stopBtn as Element);
  });
  expect(mockedBuilder.stopRecording).toHaveBeenCalled();
  expect(mockedSender.send).toHaveBeenCalledTimes(2);
  await waitForElementToBeRemoved(stopBtn);

  expect(
    container.querySelector('[data-testid="PlayCircleFilledRoundedIcon"]')
  ).not.toBeNull();
});

test("Resize camera bubble", async () => {
  const { container, debug: _debug } = await act(() => {
    return render(<CameraBubble />);
  });

  // debug();

  const iframe = container.querySelector("iframe");

  expect(iframe).not.toBeNull();
  expect(iframe?.style.width).toEqual("200px");
  expect(iframe?.style.height).toEqual("200px");

  const smallSizeBtn = container.querySelector('input[value="200x200"]');
  const mediumSizeBtn = container.querySelector('input[value="300x300"]');

  expect(smallSizeBtn).not.toBeNull();
  expect(smallSizeBtn?.hasAttribute("checked")).toEqual(true);
  expect(mediumSizeBtn).not.toBeNull();
  expect(mediumSizeBtn?.hasAttribute("checked")).toEqual(false);

  act(() => {
    fireEvent.click(mediumSizeBtn as Element);
  });

  expect(mockedStorage.set.cameraBubbleSize).toHaveBeenCalledWith({
    width: 300,
    height: 300,
  });
});
