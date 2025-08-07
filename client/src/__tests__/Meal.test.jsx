import { render, cleanup } from "@testing-library/react";
import { expect, test, afterEach } from "vitest";
import Pizza from "../Meal";

afterEach(cleanup);

test("alt text renders on image", async () => {
  const name = "My Favorite Meal";
  const src = "https://picsum.photos/200";
  const screen = render(
    <Pizza name={name} description="nutritious meal" image={src} />,
  );

  const img = screen.getByRole("img");
  expect(img.src).toBe(src);
  expect(img.alt).toBe(name);
});

test("to have a default image if none is provided", async () => {
  const screen = render(
    <Pizza name="My Favorite Meal" description="nutritious meal" />,
  );

  const img = screen.getByRole("img");
  expect(img.src).not.toBe("");
});
