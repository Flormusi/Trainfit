import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "../../services/axiosConfig";
import "./DashboardCharts.css";

interface ChartsData {
  weightData: { name: string; peso: number | null }[];
  trainingsData: { month: string; entrenamientos: number }[];
  clientsData: { month: string; nuevos: number }[];
}

const DashboardCharts: React.FC = () => {
  const [data, setData] = useState<ChartsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/trainer/analytics/charts');
        setData(res.data);
      } catch (e) {
        console.error('Error loading charts data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
        Cargando gráficos...
      </div>
    );
  }

  const hasTrainings = data?.trainingsData?.some(d => d.entrenamientos > 0);
  const hasClients = data?.clientsData?.some(d => d.nuevos > 0);
  const hasWeight = data?.weightData && data.weightData.length > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Peso actual por alumno */}
      <div className="chart-card">
        <h3 className="chart-title">Peso Actual — Alumnos</h3>
        {hasWeight ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data!.weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" unit=" kg" />
              <Tooltip formatter={(v: number) => [`${v} kg`, 'Peso']} />
              <Bar dataKey="peso" fill="#D62828" barSize={40} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 13 }}>
            Sin datos de peso registrados
          </div>
        )}
      </div>

      {/* Entrenamientos Completados */}
      <div className="chart-card">
        <h3 className="chart-title">Entrenamientos Completados</h3>
        {hasTrainings ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data!.trainingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#aaa" />
              <YAxis stroke="#aaa" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="entrenamientos" fill="#D62828" barSize={40} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 13 }}>
            Sin entrenamientos registrados aún
          </div>
        )}
      </div>

      {/* Nuevos Clientes por Mes */}
      <div className="chart-card">
        <h3 className="chart-title">Nuevos Clientes por Mes</h3>
        {hasClients ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data!.clientsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#aaa" />
              <YAxis stroke="#aaa" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="nuevos" fill="#D62828" barSize={40} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 13 }}>
            Sin nuevos clientes en los últimos 6 meses
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCharts;
