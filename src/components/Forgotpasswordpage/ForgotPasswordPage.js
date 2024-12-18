import React from 'react';
import ForgotPassword from '../Forgotpassword/ForgotPassword';
import NavbarSignup from '../Navbarsignup/NavbarSignup';
import Footer from '../Footer/Footer';
import '../Signup/Signup.css';

const ForgotPasswordPage = () => {
    return (
        <div>
            <NavbarSignup />
            {/* <div className='whitetext'> saad </div>
            <div className='whitetext'> saad </div>
            <div className='whitetext'> saad </div> */}

            {/* <div></div> */}
            <ForgotPassword/>
            <div className='whitetext'> saad </div>
            <Footer /> {/* Ajoutez le footer ici */}
        </div>
    );
};

export default ForgotPasswordPage;
