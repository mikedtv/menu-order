import { useMealOfTheDay } from "./useMealOfTheDay";

const intl = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

const MealOfTheDay = () => {
  const mealOfTheDay = useMealOfTheDay();

  if (!mealOfTheDay) {
    return <div>Loading</div>;
  }

  return (
    <div className="meal-of-the-day">
      <h2>Meal of the Day</h2>
      <div>
        <div className="meal-of-the-day-info">
          <h3>{mealOfTheDay.name}</h3>
          <p>{mealOfTheDay.description}</p>
          <p className="meal-of-the-day-price">
            From: {intl.format(mealOfTheDay.sizes.S)}
          </p>
        </div>
        <img
          className="meal-of-the-day-image"
          src={mealOfTheDay.image}
          alt={mealOfTheDay.name}
        />
      </div>
    </div>
  );
};

export default MealOfTheDay;
