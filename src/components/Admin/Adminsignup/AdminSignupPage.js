import React from 'react';
import NavbarSignup from '../../Navbarsignup/NavbarSignup';
import Footer from '../../Footer/Footer';
import './AdminSignup.css';
import AdminSignup from './AdminSignup';

const AdminSignupPage = () => {
    return (
        <div>
            <NavbarSignup />
            <AdminSignup/>
        </div>
    );
};

export default AdminSignupPage;
