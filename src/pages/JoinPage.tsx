import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const JoinPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await axios.get(`/auth/join/${token}`);
        setName(res.data.name || '');
      } catch {
        setInvalid(true);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await axios.post(`/auth/join/${token}`, { password });
      login(res.data.token, res.data.user);
      navigate('/client/dashboard');
    } catch {
      setError('Ocurrió un error. El link puede haber expirado.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#fff', fontSize: 16 }}>Cargando...</div>
    </div>
  );

  if (invalid) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
        <h2>Link inválido o expirado</h2>
        <p style={{ color: '#9ca3af' }}>Pedile a tu entrenador que te genere un nuevo link.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#111', borderRadius: 16, padding: 32, border: '1px solid #222' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ color: '#dc2626', fontWeight: 900, fontSize: 24, letterSpacing: 2, marginBottom: 8 }}>TRAINFIT</div>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>¡Hola, {name}!</h2>
          <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 8 }}>Elegí una contraseña para acceder a tu rutina</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ color: '#9ca3af', fontSize: 13, marginBottom: 6, display: 'block' }}>Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              style={{
                width: '100%', padding: '12px 14px', background: '#1a1a1a',
                border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 15,
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <label style={{ color: '#9ca3af', fontSize: 13, marginBottom: 6, display: 'block' }}>Repetí la contraseña</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repetí tu contraseña"
              required
              style={{
                width: '100%', padding: '12px 14px', background: '#1a1a1a',
                border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 15,
                outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8,
              padding: '14px', fontSize: 16, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1, marginTop: 4
            }}
          >
            {submitting ? 'Ingresando...' : 'Ingresar a TrainFit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinPage;
