/**
 * @jest-environment jsdom
 */
// NOTE: https://testing-library.com/docs/

/*
 * NOTE: `handlers.ts` depends on `storage.ts` that initializes
 *       `chrome.storage.local` on import and test fails without
 *       this override
 */
globalThis.chrome = {
  storage: {
    // @ts-expect-error Chrome methods mocking
    local: {
      set: jest.fn().mockResolvedValue({}),
      get: jest.fn().mockResolvedValue({}),
    },
  },
};

import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { builder, sender } from "../../messaging";
import CameraBubble from "../camera_bubble";
import { storage } from "../../storage";

jest.mock("../../storage");
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
      send: jest.fn().mockResolvedValue({ result: "OK" }),
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
    storage.get.recordingInProgress = jest.fn().mockResolvedValue(true);
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
    storage.get.recordingInProgress = jest.fn().mockResolvedValue(false);
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
