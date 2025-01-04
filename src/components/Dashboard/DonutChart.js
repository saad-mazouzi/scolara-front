import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChart = ({ maleCount = 0, femaleCount = 0 }) => {
    console.log("Male count:", maleCount, "Female count:", femaleCount);

    // Assurez-vous que les données ne sont jamais nulles ou undefined
    const hasData = maleCount > 0 || femaleCount > 0;

    const data = {
        labels: ['Mâle', 'Femelle'],
        datasets: [
            {
                data: hasData ? [maleCount, femaleCount] : [1, 1], // Valeurs par défaut pour l'affichage
                backgroundColor: ['#4e7dad', '#ffcc00'],
                hoverBackgroundColor: ['#4e7dad', '#ffcc00'],
            },
        ],
    };

    const options = {
        cutout: '70%',
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        return `${tooltipItem.label}: ${
                            hasData ? tooltipItem.raw.toLocaleString() : '0'
                        }`;
                    },
                },
            },
        },
    };

    return (
        <div className="donut-chart-container">
            <h4>Étudiants</h4>
            <Doughnut data={data} options={options} />
            <div className="donut-chart-legend">
                <div>
                    <span
                        className="legend-color"
                        style={{ backgroundColor: '#4e7dad' }}
                    ></span>
                    Mâle: {hasData ? maleCount.toLocaleString() : '0'}
                </div>
                <div>
                    <span
                        className="legend-color"
                        style={{ backgroundColor: '#ffcc00' }}
                    ></span>
                    Femelle: {hasData ? femaleCount.toLocaleString() : '0'}
                </div>
            </div>
        </div>
    );
};

export default DonutChart;
