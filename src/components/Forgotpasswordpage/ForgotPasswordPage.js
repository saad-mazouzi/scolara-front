import React from 'react';
import ForgotPassword from '../Forgotpassword/ForgotPassword';
import NavbarSignup from '../Navbarsignup/NavbarSignup';
import Footer from '../Footer/Footer';
import '../Signup/Signup.css';

const ForgotPasswordPage = () => {
    return (
        <div>
            <NavbarSignup />
            <ForgotPassword/>
        </div>
    );
};

export default ForgotPasswordPage;
