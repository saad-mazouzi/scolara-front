import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { fetchHomeworkBooksByEducationLevel } from '../../APIServices';
import { PuffLoader } from 'react-spinners';
import './HomeworkBook.css';

const StudentHomeworkBook = () => {
    const [educationLevel, setEducationLevel] = useState('');
    const [homeworkBooks, setHomeworkBooks] = useState([]);
    const [loading, setLoading] = useState(false); 

    // Charger le education_level depuis les cookies
    useEffect(() => {
        const levelFromCookie = Cookies.get('education_level');
        if (levelFromCookie) {
            setEducationLevel(levelFromCookie);
        }
    }, []);

    // Charger les cahiers de textes en fonction du niveau d'éducation
    useEffect(() => {
        const getHomeworkBooks = async () => {
            setLoading(true);
            if (educationLevel) {
                try {
                    const data = await fetchHomeworkBooksByEducationLevel(educationLevel);
                    setHomeworkBooks(data);
                } catch (error) {
                    console.error('Erreur lors de la récupération des cahiers de textes:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        getHomeworkBooks();
    }, [educationLevel]);

    if (loading) {
        return (
            <div className="loading-container">
                <PuffLoader size={60} color="#ffcc00" loading={loading} />
            </div>
        );
    }

    return (
        <div>
            <h3 className="homework-list-title">Cahiers de Texte</h3>
            <div className="homework-list">
                {homeworkBooks.length > 0 ? (
                    <ul>
                        {homeworkBooks.map((book) => (
                            <li key={book.id} className="homework-item">
                                <h4>{book.title}</h4>
                                <p>{book.content}</p>
                                <p><strong>Date limite :</strong> {book.homework_due_date}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Aucun cahier de texte trouvé pour ce niveau d'éducation.</p>
                )}
            </div>
        </div>
    );
};

export default StudentHomeworkBook;
