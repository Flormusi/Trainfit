import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import "./DashboardCharts.css";

const weightData = [
  { month: "Ene", FlorenciaM: 71, Cliente2: 70 },
  { month: "Feb", FlorenciaM: 70, Cliente2: 69 },
  { month: "Mar", FlorenciaM: 69, Cliente2: 68 },
  { month: "Abr", FlorenciaM: 68, Cliente2: 67 },
  { month: "May", FlorenciaM: 67, Cliente2: 66 },
  { month: "Jun", FlorenciaM: 66, Cliente2: 65 },
];

const trainingsData = [
  { month: "Ene", entrenamientos: 10 },
  { month: "Feb", entrenamientos: 12 },
  { month: "Mar", entrenamientos: 14 },
  { month: "Abr", entrenamientos: 15 },
  { month: "May", entrenamientos: 17 },
  { month: "Jun", entrenamientos: 19 },
];

const clientsData = [
  { month: "Ene", nuevos: 2 },
  { month: "Feb", nuevos: 1 },
  { month: "Mar", nuevos: 3 },
  { month: "Abr", nuevos: 2 },
  { month: "May", nuevos: 4 },
  { month: "Jun", nuevos: 1 },
];

const DashboardCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Progreso de Peso */}
      <div className="chart-card">
        <h3 className="chart-title">Progreso de Peso - Clientes</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={weightData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="FlorenciaM"
              stroke="#e63946"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Cliente2"
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Entrenamientos Completados */}
      <div className="chart-card">
        <h3 className="chart-title">Entrenamientos Completados</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={trainingsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Bar dataKey="entrenamientos" fill="#e63946" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Nuevos Clientes por Mes */}
      <div className="chart-card">
        <h3 className="chart-title">Nuevos Clientes por Mes</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={clientsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Bar dataKey="nuevos" fill="#e63946" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;