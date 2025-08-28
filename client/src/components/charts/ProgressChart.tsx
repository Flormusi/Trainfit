import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ProgressChartProps {
  type: 'line' | 'bar';
  title: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
      tension?: number;
    }[];
  };
}

const ProgressChart: React.FC<ProgressChartProps> = ({ type, title, data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#ffffff',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: title,
        color: '#ffffff',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#aaaaaa',
        },
        grid: {
          color: '#404040',
        },
      },
      y: {
        ticks: {
          color: '#aaaaaa',
        },
        grid: {
          color: '#404040',
        },
      },
    },
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      {type === 'line' ? (
        <Line data={data} options={options} />
      ) : (
        <Bar data={data} options={options} />
      )}
    </div>
  );
};

export default ProgressChart;