/**
 * @jest-environment jsdom
 */
// NOTE: https://testing-library.com/docs/
import React from "react";
import { act, render } from "@testing-library/react";
import CameraBubbleStream from "../camera_bubble_stream";

beforeAll(() => {
  Object.defineProperty(navigator, "mediaDevices", {
    value: {
      getUserMedia: jest.fn().mockResolvedValue({}),
    },
  });
});

test("Rendering", async () => {
  const { container } = await act(() => {
    return render(<CameraBubbleStream />);
  });

  expect(container.getElementsByTagName("video")).toBeDefined();
});
