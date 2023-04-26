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
  screen,
  waitFor,
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
const { default: PopupMenu } = await import("../popup_menu");

beforeEach(() => {
  mockedBuilder.startRecording = (
    jest.fn() as jest.Mock<() => Message>
  ).mockReturnValue({} as Message);
  mockedBuilder.stopRecording = (
    jest.fn() as jest.Mock<() => Message>
  ).mockReturnValue({} as Message);
  mockedBuilder.deleteRecording = (
    jest.fn() as jest.Mock<() => Message>
  ).mockReturnValue({} as Message);
  mockedBuilder.showCameraBubble = (
    jest.fn() as jest.Mock<() => Message>
  ).mockReturnValue({} as Message);
  mockedBuilder.hideCameraBubble = (
    jest.fn() as jest.Mock<() => Message>
  ).mockReturnValue({} as Message);
  mockedBuilder.allowMicrophone = (
    jest.fn() as jest.Mock<() => Message>
  ).mockReturnValue({} as Message);
  mockedBuilder.disallowMicrophone = (
    jest.fn() as jest.Mock<() => Message>
  ).mockReturnValue({} as Message);

  mockedSender.send = (
    jest.fn() as jest.Mock<
      (message: Message, tabId?: number) => Promise<MessageResponse>
    >
  ).mockResolvedValue({ result: false });

  // @ts-expect-error here we ignoring unused `storage` methods
  mockedStorage.get = {
    cameraBubbleVisible: (
      jest.fn() as jest.Mock<() => Promise<boolean>>
    ).mockResolvedValue(false),
    recordingInProgress: (
      jest.fn() as jest.Mock<() => Promise<boolean>>
    ).mockResolvedValue(false),
    microphoneAllowed: (
      jest.fn() as jest.Mock<() => Promise<boolean>>
    ).mockResolvedValue(true),
  };

  jest.useFakeTimers();
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
    mockedStorage.get.cameraBubbleVisible = (
      jest.fn() as jest.Mock<() => Promise<boolean>>
    ).mockResolvedValue(true);
    fireEvent.click(button);
  });

  expect(mockedBuilder.showCameraBubble).toHaveBeenCalled();
  expect(mockedSender.send).toHaveBeenCalled();
  await waitFor(() => {
    expect(button.textContent).toEqual("Hide bubble");
  });

  act(() => {
    mockedStorage.get.cameraBubbleVisible = (
      jest.fn() as jest.Mock<() => Promise<boolean>>
    ).mockResolvedValue(false);
    fireEvent.click(button);
  });

  expect(mockedBuilder.hideCameraBubble).toHaveBeenCalled();
  expect(mockedSender.send).toHaveBeenCalled();
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
    fireEvent.click(button);
  });

  expect(mockedBuilder.allowMicrophone).toHaveBeenCalled();
  expect(mockedSender.send).toHaveBeenCalled();
  await waitFor(() => {
    expect(button.textContent).toEqual("Disallow Mic");
  });

  act(() => {
    mockedStorage.get.microphoneAllowed = (
      jest.fn() as jest.Mock<() => Promise<boolean>>
    ).mockResolvedValue(false);
    fireEvent.click(button);
  });

  expect(mockedBuilder.disallowMicrophone).toHaveBeenCalled();
  expect(mockedSender.send).toHaveBeenCalled();
  await waitFor(() => {
    expect(button.textContent).toEqual("Allow Mic");
  });
});

describe("RecordingControl", () => {
  test("Start and Stop recording", async () => {
    act(() => {
      render(<PopupMenu />);
    });

    const button = screen.getByText("Start");

    act(() => {
      mockedStorage.get.recordingInProgress = (
        jest.fn() as jest.Mock<() => Promise<boolean>>
      ).mockResolvedValue(true);
      fireEvent.click(button);
    });

    expect(mockedBuilder.startRecording).toHaveBeenCalled();
    expect(mockedSender.send).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(button.textContent).toEqual("Stop");
    });

    act(() => {
      mockedStorage.get.recordingInProgress = (
        jest.fn() as jest.Mock<() => Promise<boolean>>
      ).mockResolvedValue(false);
      fireEvent.click(button);
    });

    expect(mockedBuilder.stopRecording).toHaveBeenCalled();
    expect(mockedSender.send).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(button.textContent).toEqual("Start");
    });
  });

  test("Start and Delete recording", async () => {
    act(() => {
      render(<PopupMenu />);
    });

    const button = screen.getByText("Start");

    act(() => {
      mockedStorage.get.recordingInProgress = (
        jest.fn() as jest.Mock<() => Promise<boolean>>
      ).mockResolvedValue(true);
      fireEvent.click(button);
    });

    expect(mockedBuilder.startRecording).toHaveBeenCalled();
    expect(mockedSender.send).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByText("Delete")).not.toBeNull();
    });

    const deleteBtn = screen.getByText("Delete");

    act(() => {
      mockedStorage.get.recordingInProgress = (
        jest.fn() as jest.Mock<() => Promise<boolean>>
      ).mockResolvedValue(false);
      fireEvent.click(deleteBtn);
    });

    expect(mockedBuilder.deleteRecording).toHaveBeenCalled();
    expect(mockedSender.send).toHaveBeenCalledTimes(2);

    await waitFor(() => {
      expect(button.textContent).toEqual("Start");
    });
  });
});
