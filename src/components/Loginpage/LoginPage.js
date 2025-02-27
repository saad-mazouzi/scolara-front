import React from 'react';
import LoginForm from '../Login/LoginForm';
import NavbarSignup from '../Navbarsignup/NavbarSignup';
import Footer from '../Footer/Footer';
import '../Signup/Signup.css';

const LoginPage = () => {
    return (
        <div>
            <NavbarSignup />
            <LoginForm/>
            <Footer />
        </div>
    );
};

export default LoginPage;
