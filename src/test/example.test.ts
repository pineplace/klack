import { test, expect } from "vitest";

test("2 + 2", () => {
  expect(2 + 2).toEqual(4);
  expect(2 + 2).not.toEqual(5);
});
