// @vitest-environment happy-dom
import { expect, test } from "vitest";
import { render } from "@testing-library/react";

test("Render test", () => {
  const { getByText } = render(<h1>Hello world!</h1>);
  expect(getByText("Hello world!")).toBeDefined();
});
