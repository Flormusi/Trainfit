import React, { useEffect, useState } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import axios from '@/services/axiosConfig';

interface RotationEntry {
  timestamp: string;
  env: string;
  rotated_by: string;
  token_masked: string;
}

const SecurityPage: React.FC = () => {
  const [rotations, setRotations] = useState<RotationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRotations = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get('/security/token-rotations', { params: { limit: 100 } });
        setRotations(res.data.rotations || []);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Error inesperado';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchRotations();
  }, []);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24, color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <ShieldCheckIcon style={{ width: 24, height: 24, color: '#E63946', marginRight: 8 }} />
        <h1 style={{ margin: 0 }}>Seguridad — Historial de Rotaciones</h1>
      </div>
      <p style={{ color: '#94a3b8', marginTop: 0 }}>
        Este listado muestra las rotaciones de <code>APPROVAL_TOKEN</code> registradas por el script de operaciones.
      </p>

      {loading && <div>Cargando historial...</div>}
      {error && <div style={{ color: '#ff5555' }}>Error: {error}</div>}

      {!loading && !error && (
        rotations.length === 0 ? (
          <div style={{ color: '#94a3b8' }}>No hay registros aún.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px' }}>Fecha</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px' }}>Entorno</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px' }}>Rotado por</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px' }}>Token (enmascarado)</th>
                </tr>
              </thead>
              <tbody>
                {rotations.map((r, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '8px 12px', color: '#ddd' }}>{new Date(r.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '8px 12px' }}>{r.env}</td>
                    <td style={{ padding: '8px 12px' }}>{r.rotated_by}</td>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{r.token_masked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <div style={{ marginTop: 24, color: '#94a3b8' }}>
        Para rotar manualmente en CI/CD, usa el workflow "Manual Approval Token Rotation" con <em>workflow_dispatch</em>.
      </div>
    </div>
  );
};

export default SecurityPage;