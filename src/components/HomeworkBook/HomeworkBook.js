import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { createHomeworkBook, fetchHomeworkBooks, deleteHomeworkBook } from '../../APIServices';
import './HomeworkBook.css'; // Assure-toi de créer ce fichier pour le styling

const AddHomeworkBook = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [homeworkDueDate, setHomeworkDueDate] = useState('');
    const [educationLevel, setEducationLevel] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [homeworkBooks, setHomeworkBooks] = useState([]);

    // Charger le TeacherId et le TeacherEducationLevel depuis les cookies
    useEffect(() => {
        const levelFromCookie = Cookies.get('TeacherEducationLevel');
        const teacherIdFromCookie = Cookies.get('TeacherId');
        
        if (levelFromCookie) {
            setEducationLevel(levelFromCookie);
        }

        if (teacherIdFromCookie) {
            setTeacherId(teacherIdFromCookie);
        }
    }, []);

    // Charger les cahiers de textes en fonction du niveau d'éducation et de l'enseignant
    useEffect(() => {
        const getHomeworkBooks = async () => {
            if (educationLevel && teacherId) {
                try {
                    const data = await fetchHomeworkBooks(educationLevel, teacherId);
                    setHomeworkBooks(data);
                } catch (error) {
                    console.error('Erreur lors de la récupération des cahiers de textes:', error);
                }
            }
        };

        getHomeworkBooks();
    }, [educationLevel, teacherId, successMessage]);

    // Fonction pour gérer l'ajout du HomeworkBook
    const handleSubmit = async (e) => {
        e.preventDefault();
        const homeworkBookData = {
            title,
            content,
            homework_due_date: homeworkDueDate,
            education_level: educationLevel,
            teacher: teacherId
        };

        try {
            await createHomeworkBook(homeworkBookData);
            setSuccessMessage('Le cahier de texte a été ajouté avec succès !');
            setTitle('');
            setContent('');
            setHomeworkDueDate('');
        } catch (error) {
            console.error('Échec de l\'ajout du cahier de texte:', error);
        }
    };

    // Fonction pour gérer la suppression
    const handleDelete = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce cahier de texte ?')) {
            try {
                await deleteHomeworkBook(id);
                // Mettre à jour l'affichage après suppression
                setHomeworkBooks(homeworkBooks.filter((book) => book.id !== id));
            } catch (error) {
                console.error('Échec de la suppression du cahier de texte:', error);
            }
        }
    };

    return (
        <div>
            <h3 className="student-list-title">Cahier de Texte</h3>
            <div className="form-container">
                <h2>Ajouter un Cahier de Texte</h2>
                {successMessage && (
                    <div className="success-message">
                        {successMessage}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Titre :</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Contenu :</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Date limite des devoirs :</label>
                        <input
                            type="date"
                            value={homeworkDueDate}
                            onChange={(e) => setHomeworkDueDate(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button">
                        Ajouter le Cahier de Texte
                    </button>
                </form>
            </div>

            <h3 className="homework-list-title">Liste des Cahiers de Texte</h3>
            <div className="homework-list">
                {homeworkBooks.length > 0 ? (
                    <ul>
                        {homeworkBooks.map((book) => (
                            <li key={book.id} className="homework-item">
                                <h4>{book.title}</h4>
                                <p>{book.content}</p>
                                <p><strong>Date limite :</strong> {book.homework_due_date}</p>
                                <span 
                                    className="homework-delete-icon" 
                                    onClick={() => handleDelete(book.id)}
                                >
                                    &#128465;
                                </span>
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

export default AddHomeworkBook;
