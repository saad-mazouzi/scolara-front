import React from 'react';
import { Outlet } from 'react-router-dom';
import DriverSidebar from '../Sidebar/DriverSidebar';
import Navbar from '../Navbar/Navbar';

const DriverLayout = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <DriverSidebar /> {/* Sidebar à gauche */}
      <div 
        style={{ 
          flexGrow: 1, 
          padding: '20px', 
          marginLeft: '271px',
          marginTop:'100px', // Décale le contenu de l'Outlet plus à droite 
        }}
      >
        <Navbar />
        </div>
      <div 
        style={{ 
          flexGrow: 2000, 
          padding: '20px', 
          marginLeft: '1px',
          marginTop:'100px', 
          marginright:'900px',// Décale le contenu de l'Outlet plus à droite 
        }}
      >
        <Outlet /> {/* Contenu dynamique selon la route */}
      </div>
    </div>
  );
};

export default DriverLayout;
