import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';
import './MainLayout.css';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Gère l'état de la Sidebar
    const [isMobile, setIsMobile] = useState(false); // État pour détecter les mobiles

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768); // Définit mobile si largeur <= 768px
        };

        handleResize(); // Vérifie à l'initialisation
        window.addEventListener('resize', handleResize); // Écoute les changements de taille

        return () => {
            window.removeEventListener('resize', handleResize); // Nettoie l'écouteur
        };
    }, []);

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            {/* Affiche uniquement la Sidebar sur mobile si elle est ouverte */}
            {!isMobile || !isSidebarOpen ? (
                <div
                    style={{
                        flexGrow: 1,
                        padding: '20px',
                        marginLeft: isMobile
                            ? isSidebarOpen
                                ? '0'
                                : '0'
                            : isSidebarOpen
                            ? '271px'
                            : '-20px',
                        transition: 'margin-left 0.3s ease',
                    }}
                >
                    <Navbar isSidebarOpen={isSidebarOpen} />
                    <div style={{ marginTop: '70px', padding: '20px', marginLeft:'20px' }}>
                        <Outlet isSidebarOpen={isSidebarOpen} />
                    </div>
                </div>  
            ) : null}
        </div>
    );
};

export default MainLayout;