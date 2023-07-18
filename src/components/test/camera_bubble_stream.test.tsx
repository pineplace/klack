/**
 * @jest-environment jsdom
 */
// NOTE: https://testing-library.com/docs/
import React from "react";
import { jest } from "@jest/globals";
import { act, render, waitFor } from "@testing-library/react";
jest.unstable_mockModule("../../storage", () => {
  return {
    storage: {},
  };
});
const { storage: mockedStorage } = await import("../../storage");
const { default: CameraBubbleStream } = await import("../camera_bubble_stream");

beforeAll(() => {
  Object.defineProperty(navigator, "mediaDevices", {
    value: {
      // @ts-expect-error Mock `navigator` object which isn't in jest environment
      getUserMedia: jest.fn().mockResolvedValue({
        getTracks: jest.fn().mockReturnValue([]),
      }),
    },
  });
});

beforeEach(() => {
  // @ts-expect-error here we ignoring unused `storage` methods
  mockedStorage.get = {
    cameraBubbleSize: (
      jest.fn() as jest.Mock<() => Promise<{ width: number; height: number }>>
    ).mockResolvedValue({ width: 200, height: 200 }),
  };
});

test("Rendering", async () => {
  const { container, debug: _debug } = await act(async () => {
    const renderRes = render(<CameraBubbleStream />);
    await new Promise((resolve) => setTimeout(resolve));
    return renderRes;
  });

  // debug();

  await waitFor(() => {
    expect(
      container.querySelector('[data-testid="WithStream"]'),
    ).not.toBeNull();
  });

  await act(async () => {
    // @ts-expect-error here we ignoring unused `storage` methods
    mockedStorage.get = {
      cameraBubbleSize: (
        jest.fn() as jest.Mock<() => Promise<{ width: number; height: number }>>
      ).mockResolvedValue({ width: 300, height: 300 }),
    };
    await new Promise((resolve) => setTimeout(resolve));
  });
});
