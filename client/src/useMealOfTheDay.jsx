import { useState, useEffect, useDebugValue } from "react";

export const useMealOfTheDay = () => {
  const [mealOfTheDay, setMealOfTheDay] = useState(null);
  useDebugValue(mealOfTheDay ? `${mealOfTheDay.id}` : "Loading...");

  useEffect(() => {
    async function fetchMealOfTheDay() {
      const response = await fetch("/api/meal-of-the-day");
      const data = await response.json();
      setMealOfTheDay(data);
    }
    fetchMealOfTheDay();
  }, []);

  return mealOfTheDay;
};
