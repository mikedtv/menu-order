import { expect, test, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import createFetchMock from "vitest-fetch-mock";
import { useMealOfTheDay } from "../useMealOfTheDay";

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

const testMeal = {
  id: "calabrese",
  name: "The Calabrese Pizza",
  category: "Supreme",
  description:
    "Salami, Pancetta, Tomatoes, Red Onions, Friggitello Peppers, Garlic",
  image: "/public/pizzas/calabrese.webp",
  sizes: { S: 12.25, M: 16.25, L: 20.25 },
};

test("to be null on initial load", async () => {
  fetch.mockResponseOnce(JSON.stringify(testMeal));
  const { result } = renderHook(() => useMealOfTheDay(""));
  expect(result.current).toBeNull();
});

test("to call the API and give back the pizza of the day", async () => {
  fetch.mockResponseOnce(JSON.stringify(testMeal));
  const { result } = renderHook(() => useMealOfTheDay(""));
  await waitFor(() => {
    expect(result.current).toEqual(testMeal);
  });
  expect(fetchMocker).toBeCalledWith("/api/meal-of-the-day");
});
