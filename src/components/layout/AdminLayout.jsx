import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import './AdminLayout.css';

function AdminLayout() {
    // Añadir la clase 'admin-page' al body cuando el componente se monta
    // y quitarla cuando se desmonta
    useEffect(() => {
        document.body.classList.add('admin-page');

        // Función de limpieza para remover la clase cuando el componente se desmonta
        return () => {
            document.body.classList.remove('admin-page');
        };
    }, []);

    return (
        <div className="admin-root-layout">
            <div className="admin-content-wrapper">
                <div className="admin-layout">
                    <main className="admin-layout-content">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;

