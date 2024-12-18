import React from 'react';
import LoginForm from '../Login/LoginForm';
import NavbarSignup from '../Navbarsignup/NavbarSignup';
import Footer from '../Footer/Footer';
import '../Signup/Signup.css';

const LoginPage = () => {
    return (
        <div>
            <NavbarSignup />
            {/* <div className='whitetext'> saad </div>
            <div className='whitetext'> saad </div>
            <div className='whitetext'> saad </div> */}

            {/* <div></div> */}
            <LoginForm/>
            <div className='whitetext'> saad </div>
            <Footer /> {/* Ajoutez le footer ici */}
        </div>
    );
};

export default LoginPage;
