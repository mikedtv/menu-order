import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MealOfTheDay from "./MealOfTheDay";
import Order from "./Order";

const App = () => {
  return (
    <StrictMode>
      <div>
        <h1 className="logo">Menu Order Pizza Party</h1>
        <Order />
        <MealOfTheDay />
      </div>
    </StrictMode>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
