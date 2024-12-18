import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
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
                const formattedData = response.data.map((item) => ({
                    month: item.month,
                    montant: item.amount, // Renomme "amount" en "montant"
                }));
                setExpensesData(formattedData);
            } catch (error) {
                console.error("Erreur lors de la récupération des dépenses mensuelles :", error);
            }
        };
    
        fetchMonthlyExpenses();
    }, []);
    
    const colors = ['#4e7dad', '#ffcc00']; // Bleu et jaune

    return (
        <div className="expenses-chart-container">
            <h3>Dépenses Mensuelles</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expensesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="montant"> {/* Remplace "amount" par "montant" */}
                        {expensesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % 2]} />
                        ))}
                        <LabelList
                            dataKey="montant" // Remplace "amount" par "montant"
                            position="top"
                            formatter={(value) => `${value} DH`} // Ajoute "DH" après chaque montant
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MonthlyExpensesChart;
