import { useState, useEffect } from 'react';

export default function PWAInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    const android = /android/i.test(ua);
    const isInStandaloneMode =
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    const dismissed = localStorage.getItem('pwa-banner-dismissed');

    if (!isInStandaloneMode && !dismissed) {
      const desktop = !ios && !android;
      setIsIOS(ios);
      setIsDesktop(desktop);
      setTimeout(() => setVisible(true), 2000);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('pwa-banner-dismissed', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: '#1a1a1a',
      borderTop: '1px solid #333',
      borderRadius: '20px 20px 0 0',
      padding: '20px 20px 36px',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.6)',
    }}>
      <button
        onClick={dismiss}
        style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', color: '#6b7280', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}
      >
        ×
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <img src="/icons/icon-76x76.png" style={{ width: 48, height: 48, borderRadius: 12 }} alt="TrainFit" />
        <div>
          <p style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: 16 }}>Instalá TrainFit</p>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: 13 }}>Accedé más rápido desde tu pantalla de inicio</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isIOS ? (
          <>
            <Step n={1} text={<>Tocá el botón <strong style={{ color: '#fff' }}>Compartir</strong> <ShareIcon /> en la barra de Safari</>} />
            <Step n={2} text={<>Deslizá y tocá <strong style={{ color: '#fff' }}>"Agregar a pantalla de inicio"</strong></>} />
            <Step n={3} text={<>Tocá <strong style={{ color: '#fff' }}>"Agregar"</strong> arriba a la derecha</>} />
          </>
        ) : isDesktop ? (
          <>
            <Step n={1} text={<>En Chrome, hacé clic en el ícono <strong style={{ color: '#fff' }}>⊕</strong> que aparece en la barra de direcciones (arriba a la derecha)</>} />
            <Step n={2} text={<>Hacé clic en <strong style={{ color: '#fff' }}>"Instalar"</strong> en el mensaje que aparece</>} />
            <Step n={3} text={<>TrainFit se abre como una app independiente en tu escritorio</>} />
          </>
        ) : (
          <>
            <Step n={1} text={<>Tocá el menú <strong style={{ color: '#fff' }}>⋮</strong> arriba a la derecha en Chrome</>} />
            <Step n={2} text={<>Tocá <strong style={{ color: '#fff' }}>"Agregar a pantalla de inicio"</strong></>} />
            <Step n={3} text={<>Tocá <strong style={{ color: '#fff' }}>"Instalar"</strong> en el mensaje que aparece</>} />
          </>
        )}
      </div>

      <button
        onClick={dismiss}
        style={{ marginTop: 18, width: '100%', background: 'transparent', border: '1px solid #444', color: '#9ca3af', borderRadius: 10, padding: '10px 0', fontSize: 14, cursor: 'pointer' }}
      >
        Ya lo instalé, no mostrar más
      </button>
    </div>
  );
}

function Step({ n, text }: { n: number; text: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ minWidth: 26, height: 26, borderRadius: '50%', background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
        {n}
      </div>
      <p style={{ margin: 0, color: '#d1d5db', fontSize: 14, lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }}>
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}
