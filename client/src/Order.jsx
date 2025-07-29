import { useEffect, useState, useContext } from "react";
import { CartContext } from "./contexts";
import Cart from "./Cart";
import Meal from "./Meal";

const intl = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

export default function Order() {
  const [mealTypes, setMealTypes] = useState([]);
  const [mealType, setMealType] = useState("pepperoni");
  const [mealSize, setMealSize] = useState("M");
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useContext(CartContext);

  async function checkout() {
    setLoading(true);

    await fetch("/api/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cart }),
    });

    setCart([]);
    setLoading(false);
  }

  let price, selectedMeal;
  if (!loading) {
    selectedMeal = mealTypes.find((meal) => mealType === meal.id);
    price = intl.format(selectedMeal.sizes ? selectedMeal.sizes[mealSize] : "");
  }

  async function fetchMealTypes() {
    const mealRes = await fetch("/api/meals");
    const mealJson = await mealRes.json();
    setMealTypes(mealJson);
    setLoading(false);
  }

  useEffect(() => {
    fetchMealTypes();
  }, []);

  return (
    <div className="order-page">
      <div className="order">
        <h2>Create Order</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCart([...cart, { meal: selectedMeal, size: mealSize, price }]);
          }}
        >
          <div>
            <div>
              <label htmlFor="meal-type">Meal Type</label>
              <select
                name="meal-type"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
              >
                {mealTypes.map((meal) => (
                  <option key={meal.id} value={meal.id}>
                    {meal.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="meal-size">Meal Size</label>
              <div>
                <span>
                  <input
                    checked={mealSize === "S"}
                    type="radio"
                    name="meal-size"
                    value="S"
                    id="meal-s"
                    onChange={(e) => setMealSize(e.target.value)}
                  />
                  <label htmlFor="meal-s">Small</label>
                </span>
                <span>
                  <input
                    checked={mealSize === "M"}
                    type="radio"
                    name="meal-size"
                    value="M"
                    id="meal-m"
                    onChange={(e) => setMealSize(e.target.value)}
                  />
                  <label htmlFor="meal-m">Medium</label>
                </span>
                <span>
                  <input
                    checked={mealSize === "L"}
                    type="radio"
                    name="meal-size"
                    value="L"
                    id="meal-l"
                    onChange={(e) => setMealSize(e.target.value)}
                  />
                  <label htmlFor="meal-l">Large</label>
                </span>
              </div>
            </div>
            <button type="submit">Add to Cart</button>
          </div>
          {loading ? (
            <h3>Loading meals…</h3>
          ) : (
            <div className="order-meal">
              <Meal
                name={selectedMeal.name}
                description={selectedMeal.description}
                image={selectedMeal.image}
              />
              <p>{price}</p>
            </div>
          )}
        </form>
      </div>
      {loading ? <h3>Loading…</h3> : <Cart cart={cart} checkout={checkout} />}
    </div>
  );
}
