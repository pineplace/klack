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
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { builder, sender } from "../../messaging";
import PopupMenu from "../popup_menu";
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
      allowMicrophone: jest.fn(),
      disallowMicrophone: jest.fn(),
    },
    sender: {
      send: jest.fn().mockResolvedValue({ result: false }),
    },
  };
});

beforeEach(() => {
  jest.useFakeTimers();

  storage.get.cameraBubbleVisible = jest.fn().mockResolvedValue(false);
  storage.get.microphoneAllowed = jest.fn().mockResolvedValue(true);
  storage.get.recordingInProgress = jest.fn().mockResolvedValue(false);
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test("ShowHideRecording switching", async () => {
  act(() => {
    render(<PopupMenu />);
  });

  const button = screen.getByText("Show bubble");

  act(() => {
    storage.get.cameraBubbleVisible = jest.fn().mockResolvedValue(true);
    fireEvent.click(button);
  });

  expect(builder.showCameraBubble).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  await waitFor(() => {
    expect(button.textContent).toEqual("Hide bubble");
  });

  act(() => {
    storage.get.cameraBubbleVisible = jest.fn().mockResolvedValue(false);
    fireEvent.click(button);
  });

  expect(builder.hideCameraBubble).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  await waitFor(() => {
    expect(button.textContent).toEqual("Show bubble");
  });
});

test("TurnOnTurnOffMic switching", async () => {
  act(() => {
    render(<PopupMenu />);
  });

  const button = screen.getByText("Allow Mic");

  act(() => {
    storage.get.microphoneAllowed = jest.fn().mockResolvedValue(true);
    fireEvent.click(button);
  });

  expect(builder.allowMicrophone).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  await waitFor(() => {
    expect(button.textContent).toEqual("Disallow Mic");
  });

  act(() => {
    storage.get.microphoneAllowed = jest.fn().mockResolvedValue(false);
    fireEvent.click(button);
  });

  expect(builder.disallowMicrophone).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  await waitFor(() => {
    expect(button.textContent).toEqual("Allow Mic");
  });
});

test("StartStopRecording switching", async () => {
  act(() => {
    render(<PopupMenu />);
  });

  const button = screen.getByText("Start");

  act(() => {
    storage.get.recordingInProgress = jest.fn().mockResolvedValue(true);
    fireEvent.click(button);
  });

  expect(builder.startRecording).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  await waitFor(() => {
    expect(button.textContent).toEqual("Stop");
  });

  act(() => {
    storage.get.recordingInProgress = jest.fn().mockResolvedValue(false);
    fireEvent.click(button);
  });

  expect(builder.stopRecording).toHaveBeenCalled();
  expect(sender.send).toHaveBeenCalled();
  await waitFor(() => {
    expect(button.textContent).toEqual("Start");
  });
});
