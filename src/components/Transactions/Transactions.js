import React, { useState, useEffect } from 'react';
import { createExpense, fetchExpenses, updateTransaction, deleteTransaction } from '../../APIServices';
import Cookies from 'js-cookie';
import './Transactions.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons'; // Importer l'icône d'impression

const Transactions = () => {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDescriptionModal, setShowDescriptionModal] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const schoolId = Cookies.get('SchoolId');

    useEffect(() => {
        const loadTransactions = async () => {
            try {
                const data = await fetchExpenses(schoolId);
                setTransactions(data);
            } catch (error) {
                console.error("Erreur lors de la récupération des transactions :", error);
            }
        };
        loadTransactions();
    }, [schoolId]);

    useEffect(() => {
        const filtered = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return (
                transactionDate.getMonth() + 1 === parseInt(selectedMonth) &&
                transactionDate.getFullYear() === parseInt(selectedYear)
            );
        });
        setFilteredTransactions(filtered);
    }, [transactions, selectedMonth, selectedYear]);

    const handleAddExpense = async (e) => {
        e.preventDefault();
        const transactionData = {
            type: 'expense',
            amount: parseFloat(amount),
            date,
            description,
            school: parseInt(schoolId, 10),
        };
        try {
            const newTransaction = await createExpense(transactionData);
            setTransactions([...transactions, newTransaction]);
            setAmount('');
            setDate('');
            setDescription('');
        } catch (error) {
            console.error("Erreur lors de l'ajout de la transaction :", error);
        }
    };

    const handleDeleteTransaction = async (transactionId) => {
        try {
            await deleteTransaction(schoolId, transactionId);
            setTransactions(transactions.filter((transaction) => transaction.id !== transactionId));
        } catch (error) {
            console.error("Erreur lors de la suppression de la transaction :", error);
        }
    };

    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        setAmount(transaction.amount);
        setDate(transaction.date);
        setDescription(transaction.description);
        setShowEditModal(true);
    };

    const handleUpdateTransaction = async (e) => {
        e.preventDefault();
        const updatedData = {
            type: 'expense',
            amount: parseFloat(amount),
            date,
            description,
            school: parseInt(schoolId, 10),
        };
        try {
            const updatedTransaction = await updateTransaction(schoolId, editingTransaction.id, updatedData);
            setTransactions(transactions.map((transaction) =>
                transaction.id === editingTransaction.id ? updatedTransaction : transaction
            ));
            setShowEditModal(false);
            setEditingTransaction(null);
            setAmount('');
            setDate('');
            setDescription('');
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la transaction :", error);
        }
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingTransaction(null);
        setAmount('');
        setDate('');
        setDescription('');
    };

    const handleShowDescription = (fullDescription) => {
        setSelectedDescription(fullDescription);
        setShowDescriptionModal(true);
    };

    const closeDescriptionModal = () => {
        setShowDescriptionModal(false);
        setSelectedDescription('');
    };

    const getShortDescription = (description, maxLength = 20) => {
        if (description.length > maxLength) {
            return description.substring(0, maxLength) + '...';
        }
        return description;
    };

    const printTransactions = () => {
        const printContents = document.getElementById('transactions-printable').innerHTML;
        const newWindow = window.open('', '_blank', 'width=800,height=600');

        if (newWindow) {
            newWindow.document.open();
            newWindow.document.write(`
                <html>
                    <head>
                        <title>Liste des Dépenses</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 20px;
                            }
                            .transactions-table {
                                width: 100%;
                                border-collapse: collapse;
                            }
                            .transactions-table th, .transactions-table td {
                                border: 1px solid #ddd;
                                padding: 8px;
                                text-align: left;
                            }
                            .transactions-table th {
                                background-color: #f4f4f4;
                            }
                        </style>
                    </head>
                    <body>
                        ${printContents}
                    </body>
                </html>
            `);
            newWindow.document.close();
            newWindow.print();
            newWindow.close();
        }
    };

    return (
        <div className="transactions-container">
            <h2>Ajouter une Dépense</h2>
            <form onSubmit={handleAddExpense}>
                <div>
                    <label>Montant :</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Date :</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Description :</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <button type="submit">Ajouter Dépense</button>
            </form>

            <button onClick={printTransactions} className="transaction-print-button">
                    <FontAwesomeIcon icon={faPrint} /> Imprimer
            </button>
            <div className="transaction-history">
                <h3>Historique des Dépenses</h3>
                <div className="filter-container">
                    <label>Mois :</label>
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(0, i).toLocaleString('fr-FR', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                    <label>Année :</label>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        {Array.from({ length: 5 }, (_, i) => (
                            <option key={i} value={new Date().getFullYear() - i}>
                                {new Date().getFullYear() - i}
                            </option>
                        ))}
                    </select>
                </div>

                <div id="transactions-list">
                    <ul>
                        {filteredTransactions.map((transaction) => (
                            <li key={transaction.id}>
                                <span>{transaction.date}</span>
                                <span style={{ color: 'red', fontWeight: 'bold' }}>
                                    - {transaction.amount} DH
                                </span>
                                <span
                                    onClick={() => handleShowDescription(transaction.description)}
                                    style={{ cursor: 'pointer', color: '#4e7dad' }}
                                >
                                    {getShortDescription(transaction.description)}
                                </span>
                                <div className="button-group">
                                    <button onClick={() => handleEditTransaction(transaction)}>Modifier</button>
                                    <button onClick={() => handleDeleteTransaction(transaction.id)}>Supprimer</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div id="transactions-printable" style={{ display: 'none' }}>
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Montant</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td>{transaction.date}</td>
                                    <td>- {transaction.amount} DH</td>
                                    <td>{transaction.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showEditModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Modifier la Dépense</h2>
                        <form onSubmit={handleUpdateTransaction}>
                            <div>
                                <label>Montant :</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Date :</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Description :</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <button type="submit">Mettre à jour la Dépense</button>
                            <button type="button" onClick={closeEditModal}>Annuler</button>
                        </form>
                    </div>
                </div>
            )}

            {showDescriptionModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Description complète</h2>
                        <p>{selectedDescription}</p>
                        <button onClick={closeDescriptionModal}>Fermer</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;
