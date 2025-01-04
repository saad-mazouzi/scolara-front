import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';
import axiosInstance from '../../axiosConfig';
import Cookies from 'js-cookie';

const MonthlyEarningsChart = () => {
    const [earningsData, setEarningsData] = useState([]);

    useEffect(() => {
        const fetchMonthlyEarnings = async () => {
            const schoolId = Cookies.get('SchoolId'); // Récupère SchoolId des cookies
            if (!schoolId) {
                console.error("SchoolId non trouvé dans les cookies");
                return;
            }

            try {
                const response = await axiosInstance.get(`transactions/monthly-earnings/?school_id=${schoolId}`);
                console.log("Données récupérées :", response.data);

                // Si les données existent, formatez-les
                if (response.data.length > 0) {
                    const formattedData = response.data.map((item) => ({
                        month: item.month,
                        montant: item.amount,
                    }));
                    setEarningsData(formattedData);
                } else {
                    // Si aucune donnée, définir des valeurs par défaut
                    setEarningsData([
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
                console.error("Erreur lors de la récupération des revenus mensuels :", error);
                // En cas d'erreur, afficher des valeurs par défaut
                setEarningsData([
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

        fetchMonthlyEarnings();
    }, []);

    return (
        <div className="earnings-chart-container">
            <h3>Revenus Mensuels</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={earningsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="montant"
                        stroke="#4e7dad"
                        strokeWidth={2}
                        dot={{ r: 5 }}
                        activeDot={{ r: 8 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MonthlyEarningsChart;
