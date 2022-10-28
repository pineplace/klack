/**
 * @jest-environment jsdom
 */
import React from "react";
import render from "react-test";

import { CameraBubble } from "./camera_bubble";

// https://react-test.dev/documentation#getting-started
// TODO: Its just a simple example tests

test("`bin` and `stop` buttons disabled by default", () => {
  const component = render(<CameraBubble />);
  const buttonGroup = component.children(":last-child");
  const disabledButtons = buttonGroup.children(".Mui-disabled").array().length;

  expect(disabledButtons).toEqual(2);
});
