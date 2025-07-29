import { useContext } from "react";
import { CartContext } from "./contexts";

export default function Header() {
  const [cart] = useContext(CartContext);

  return (
    <header>
      <h1 className="logo">Menu Order Pizza Party</h1>
      <div className="nav-cart">
        <span className="nav-cart-number">{cart.length}</span>
      </div>
    </header>
  );
}
