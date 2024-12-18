// components/Modal.js
import React from 'react';
import './Modal.css'; // Importez le fichier CSS pour le modal

const Modal = ({ message, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Notification</h3>
                <div className='whitetext'>_</div>
                <p>{message}</p>
                <button onClick={onClose}>Fermer</button>
            </div>
        </div>
    );
};

export default Modal;
