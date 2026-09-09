import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import './CartButton.css';

export default function CartButton({ className = '' }) {
  const cart = useCart();
  if (!cart) return null;
  return (
    <button
      type="button"
      className={`cart-btn ${className}`}
      onClick={() => cart.setOpen(true)}
      aria-label={`Carrito${cart.count ? ` (${cart.count})` : ''}`}
    >
      <FaShoppingCart />
      {cart.count > 0 && <span className="cart-btn-badge">{cart.count}</span>}
    </button>
  );
}
