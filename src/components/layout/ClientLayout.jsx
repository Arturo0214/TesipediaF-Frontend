import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

function ClientLayout() {
    useEffect(() => {
        document.body.classList.add('client-page');
        return () => {
            document.body.classList.remove('client-page');
        };
    }, []);

    return (
        <div className="client-root-layout">
            <Outlet />
        </div>
    );
}

export default ClientLayout;
