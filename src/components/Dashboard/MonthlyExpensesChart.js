import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, LabelList, CartesianGrid } from 'recharts';
import axiosInstance from '../../axiosConfig';
import Cookies from 'js-cookie';

const MonthlyExpensesChart = () => {
    const [expensesData, setExpensesData] = useState([]);

    useEffect(() => {
        const fetchMonthlyExpenses = async () => {
            const schoolId = Cookies.get('SchoolId'); // Récupère SchoolId des cookies
            if (!schoolId) {
                console.error("SchoolId non trouvé dans les cookies");
                return;
            }

            try {
                const response = await axiosInstance.get(`transactions/monthly-expenses/?school_id=${schoolId}`);
                console.log("Données récupérées :", response.data);

                if (response.data.length > 0) {
                    // Formate les données si elles existent
                    const formattedData = response.data.map((item) => ({
                        month: item.month,
                        montant: item.amount, // Renomme "amount" en "montant"
                    }));
                    setExpensesData(formattedData);
                } else {
                    // Définit des données par défaut si aucune donnée n'est récupérée
                    setExpensesData([
                        { month: 'Janvier', montant: 0 },
                        { month: 'Février', montant: 0 },
                        { month: 'Mars', montant: 0 },
                        { month: 'Avril', montant: 0 },
                        { month: 'Mai', montant: 0 },
                        { month: 'Juin', montant: 0 },
                        { month: 'Juillet', montant: 0 },
                        { month: 'Août', montant: 0 },
                        { month: 'Septembre', montant: 0 },
                        { month: 'Octobre', montant: 0 },
                        { month: 'Novembre', montant: 0 },
                        { month: 'Décembre', montant: 0 },
                    ]);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des dépenses mensuelles :", error);
                // Définit des données par défaut en cas d'erreur
                setExpensesData([
                    { month: 'Janvier', montant: 0 },
                    { month: 'Février', montant: 0 },
                    { month: 'Mars', montant: 0 },
                    { month: 'Avril', montant: 0 },
                    { month: 'Mai', montant: 0 },
                    { month: 'Juin', montant: 0 },
                    { month: 'Juillet', montant: 0 },
                    { month: 'Août', montant: 0 },
                    { month: 'Septembre', montant: 0 },
                    { month: 'Octobre', montant: 0 },
                    { month: 'Novembre', montant: 0 },
                    { month: 'Décembre', montant: 0 },
                ]);
            }
        };

        fetchMonthlyExpenses();
    }, []);

    const colors = ['#4e7dad', '#ffcc00']; // Bleu et jaune

    return (
        <div className="expenses-chart-container">
            <h3>Dépenses Mensuelles</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={expensesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="montant">
                        {expensesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % 2]} />
                        ))}
                        <LabelList
                            dataKey="montant"
                            position="top"
                            formatter={(value) => `${value} DH`}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MonthlyExpensesChart;
