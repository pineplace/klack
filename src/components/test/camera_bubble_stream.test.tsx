/**
 * @jest-environment jsdom
 */
// NOTE: https://testing-library.com/docs/
import React from "react";
import { jest } from "@jest/globals";
import { act, render } from "@testing-library/react";
const { default: CameraBubbleStream } = await import("../camera_bubble_stream");

beforeAll(() => {
  Object.defineProperty(navigator, "mediaDevices", {
    value: {
      // @ts-expect-error Mock `navigator` object which isn't in jest environment
      getUserMedia: jest.fn().mockResolvedValue({}),
    },
  });
});

test("Rendering", async () => {
  const { container, debug } = await act(() => {
    return render(<CameraBubbleStream />);
  });

  debug();

  expect(container.querySelector("video")).not.toBeNull();
});
