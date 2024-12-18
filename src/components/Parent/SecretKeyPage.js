import React from 'react';
import NavbarSignup from '../Navbarsignup/NavbarSignup';
import Footer from '../Footer/Footer';
import '../Signup/Signup.css';
import SecretKeyForm from './SecretKey';

const SecretKeyPage = () => {
    return (
        <div>
            <NavbarSignup />
            <SecretKeyForm/>
            <Footer /> 
        </div>
    );
};

export default SecretKeyPage;
