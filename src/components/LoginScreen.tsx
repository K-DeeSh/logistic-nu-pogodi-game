import { useState } from 'react';

const LOGIN_KEY = 'player_login';

export function getSavedLogin(): string {
  return localStorage.getItem(LOGIN_KEY) ?? '';
}

function saveLogin(login: string) {
  localStorage.setItem(LOGIN_KEY, login);
}

interface Props {
  onLogin: (login: string) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Введи логин');
      return;
    }
    saveLogin(trimmed);
    onLogin(trimmed);
  }

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 16,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '2px solid #334155',
        borderRadius: 20,
        padding: '28px 22px',
        maxWidth: 380,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
      }}>
        <div style={{ fontSize: 56 }}>🏭</div>
        <h1 style={{
          color: '#f1f5f9',
          fontSize: 24,
          fontWeight: 900,
          margin: '10px 0 4px',
          letterSpacing: -0.5,
        }}>
          Warehouse Catcher
        </h1>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
          Как тебя зовут, кладовщик?
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={value}
            onChange={e => { setValue(e.target.value); setError(''); }}
            placeholder="Логин..."
            maxLength={32}
            autoFocus
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#0f172a',
              border: error ? '2px solid #ef4444' : '2px solid #334155',
              borderRadius: 10,
              color: '#f1f5f9',
              fontSize: 16,
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: error ? 4 : 16,
              textAlign: 'center',
            }}
          />
          {error && (
            <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 12 }}>{error}</p>
          )}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px 0',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: 0.5,
              boxShadow: '0 4px 20px rgba(59,130,246,0.5)',
              touchAction: 'manipulation',
            }}
          >
            🚀 Войти
          </button>
        </form>
      </div>
    </div>
  );
}
