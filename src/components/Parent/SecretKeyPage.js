import React from 'react';
import NavbarSignup from '../Navbarsignup/NavbarSignup';
import '../Signup/Signup.css';
import SecretKeyForm from './SecretKey';

const SecretKeyPage = () => {
    return (
        <div>
            <NavbarSignup />
            <SecretKeyForm/>
        </div>
    );
};

export default SecretKeyPage;
