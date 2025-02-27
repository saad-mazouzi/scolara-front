import React from 'react';
import Signup from '../Signup/Signup';
import NavbarSignup from '../Navbarsignup/NavbarSignup';
import SignupFooter from '../Footer/SignupFooter';
import './SignupPage.css';

const SignupPage = () => {
    return (
        <div>
            <NavbarSignup />
            <div className='whitetext'>Scolara</div>
            <div className='whitetext'>Scolara</div>

            <Signup />

            <SignupFooter />
        </div>
    );
};

export default SignupPage;
