import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import CartDrawer from '../cart/CartDrawer';

function ClientLayout() {
    useEffect(() => {
        document.body.classList.add('client-page');
        return () => {
            document.body.classList.remove('client-page');
        };
    }, []);

    return (
        <CartProvider>
            <div className="client-root-layout">
                <Outlet />
                {/* Carrito de la tienda de guías dentro de la cuenta */}
                <CartDrawer />
            </div>
        </CartProvider>
    );
}

export default ClientLayout;
