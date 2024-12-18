import React from 'react';
import Signup from '../Signup/Signup';
import NavbarSignup from '../Navbarsignup/NavbarSignup';
import Footer from '../Footer/Footer';
import './SignupPage.css';

const SignupPage = () => {
    return (
        <div>
            <NavbarSignup />
            <div className='whitetext'>Scolara</div>
            <div className='whitetext'>Scolara</div>

            <Signup />
            <div className='whitetext'> saad </div>
            <div className='whitetext'> saad </div>
            <div className='whitetext'> saad </div>

            <Footer />
        </div>
    );
};

export default SignupPage;
