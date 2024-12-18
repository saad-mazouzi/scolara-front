import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChart = ({ maleCount = 0, femaleCount = 0 }) => {
    console.log("Male count:", maleCount, "Female count:", femaleCount);

    const data = {
        labels: ['Mâle', 'Femelle'],
        datasets: [
            {
                data: [maleCount, femaleCount],
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
                        return `${tooltipItem.label}: ${tooltipItem.raw.toLocaleString()}`;
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
                    <span className="legend-color" style={{ backgroundColor: '#4e7dad' }}></span>
                    Mâle: {maleCount.toLocaleString()}
                </div>
                <div>
                    <span className="legend-color" style={{ backgroundColor: '#ffcc00' }}></span>
                    Femelle: {femaleCount.toLocaleString()}
                </div>
            </div>
        </div>
    );
};

export default DonutChart;
