import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMessages, sendMessage } from '../../APIServices';
import Cookies from 'js-cookie';
import './Chat.css';

const ChatPage = () => {
    const { chatRoomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentUserId = parseInt(Cookies.get('TeacherId'), 10);

    useEffect(() => {
        const loadMessages = async () => {
            try {
                if (!chatRoomId) throw new Error("Aucun ID de salle de chat fourni.");
                const fetchedMessages = await fetchMessages(chatRoomId);
                setMessages(fetchedMessages);
            } catch (err) {
                console.error('Erreur lors du chargement des messages :', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, [chatRoomId]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() && !selectedFile) {
            return;
        }

        try {
            const sentMessage = await sendMessage(chatRoomId, currentUserId, newMessage, selectedFile);
            setMessages([...messages, sentMessage]);
            setNewMessage('');
            setSelectedFile(null);
        } catch (err) {
            console.error('Erreur lors de l\'envoi du message :', err);
            setError('Impossible d\'envoyer le message.');
        }
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return <p>Chargement de la conversation...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="chat-container">
            <div className="messages-container">
                {messages.map((message) => (
                    <div key={message.id} className={`message-wrapper ${message.sender === currentUserId ? 'sent' : 'received'}`}>
                        <div className={`message ${message.sender === currentUserId ? 'sent' : 'received'}`}>
                            {message.content && <p>{message.content}</p>}
                            {message.file && (
                                <a href={message.file} target="_blank" rel="noopener noreferrer" className="file-link">
                                    Télécharger le fichier
                                </a>
                            )}
                        </div>
                        {/* Affichage de l'heure en dehors de la bulle */}
                        <div className="message-time">
                            {formatTime(message.created_at)}
                        </div>
                    </div>
                ))}
            </div>
            <div className="message-input-container">
                <label htmlFor="file-input" className="file-icon">
                    📁
                </label>
                <input
                    id="file-input"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden-file-input"
                />
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Écrivez un message..."
                    className="message-input"
                />
                <button onClick={handleSendMessage} className="send-button">
                    Envoyer
                </button>
            </div>
        </div>
    );
};

export default ChatPage;
