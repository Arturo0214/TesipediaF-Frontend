import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getProducto, PAQUETES, GUIAS } from '../data/guias';

const STORAGE_KEY = 'tesipedia_cart';
const CartContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids.filter((id) => getProducto(id)) : [];
  } catch { return []; }
}

// Sugerencia de paquete: si el carrito casi arma un paquete, propone cambiar y muestra el ahorro.
function suggestBundle(ids) {
  const guideIds = ids.filter((id) => !id.startsWith('paq-'));
  let best = null;
  for (const paq of PAQUETES) {
    const need = paq.incluyeIds;
    const have = need.filter((id) => guideIds.includes(id));
    const missing = need.filter((id) => !guideIds.includes(id));
    if (have.length >= 2 && missing.length <= 1) {
      const sumNeed = need.reduce((s, id) => s + (getProducto(id)?.precio || 0), 0);
      const ahorro = sumNeed - paq.precio;
      if (ahorro > 0) {
        const score = have.length * 10 - missing.length; // más solape, menos faltante
        if (!best || score > best.score) {
          best = {
            paq, have, missing, ahorro, sumNeed, score,
            missingNombre: missing[0] ? (getProducto(missing[0])?.nombre || missing[0]) : null,
          };
        }
      }
    }
  }
  return best;
}

export function CartProvider({ children }) {
  const [ids, setIds] = useState(loadCart);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch { /* ignore */ }
  }, [ids]);

  const add = useCallback((id) => {
    if (!getProducto(id)) return;
    setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setOpen(true);
  }, []);
  const remove = useCallback((id) => setIds((prev) => prev.filter((x) => x !== id)), []);
  const clear = useCallback(() => setIds([]), []);
  const has = useCallback((id) => ids.includes(id), [ids]);

  // Aceptar la sugerencia: quita las guías que arma el paquete y agrega el paquete.
  const applyBundle = useCallback((sug) => {
    setIds((prev) => {
      const withoutHave = prev.filter((id) => !sug.have.includes(id));
      return withoutHave.includes(sug.paq.id) ? withoutHave : [...withoutHave, sug.paq.id];
    });
  }, []);

  const value = useMemo(() => {
    const items = ids.map((id) => getProducto(id)).filter(Boolean);
    const total = items.reduce((s, p) => s + (p.precio || 0), 0);
    return {
      ids, items, count: items.length, total,
      add, remove, clear, has,
      open, setOpen,
      suggestion: suggestBundle(ids),
      applyBundle,
      GUIAS, PAQUETES,
    };
  }, [ids, add, remove, clear, has, open, applyBundle]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
