import { useContext } from "react";
import { CartContext } from "./contexts";
import { Link } from "@tanstack/react-router";

export default function Header() {
  const [cart] = useContext(CartContext);

  return (
    <header>
      <Link to="/">
        <h1 className="logo">Menu Order Pizza Party</h1>
      </Link>
      <div className="nav-cart">
        <span className="nav-cart-number">{cart.length}</span>
      </div>
    </header>
  );
}
