import { useEffect, useState } from 'react';
import { fetchLeaderboard, type LeaderboardEntry } from '../api';

interface Props {
  highScore: number;
  login: string;
  onStart: () => void;
}

export default function StartScreen({ highScore, login, onStart }: Props) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetchLeaderboard(10).then(setLeaderboard);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflowY: 'auto',
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
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>
          Склад в хаосе. Кладовщик нужен.
        </p>
        {login && (
          <p style={{ color: '#3b82f6', fontSize: 13, marginBottom: 14, fontWeight: 700 }}>
            👋 {login}
          </p>
        )}

        {leaderboard.length > 0 ? (
          <div style={{
            background: '#0f172a',
            borderRadius: 12,
            padding: '12px 14px',
            margin: '0 0 14px',
            textAlign: 'left',
            border: '1px solid #1e293b',
          }}>
            <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              🌐 Глобальный топ
            </div>
            {leaderboard.slice(0, 5).map((entry, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: 6,
                alignItems: 'center',
                fontSize: 12,
                padding: '2px 0',
                color: entry.login === login ? '#fde047' : '#94a3b8',
                fontWeight: entry.login === login ? 700 : 400,
              }}>
                <span style={{ color: '#475569', width: 16, textAlign: 'right' }}>{i + 1}.</span>
                <span style={{ color: '#fde047', fontWeight: 700, minWidth: 40 }}>{entry.score}</span>
                <span>{entry.login}</span>
                {entry.duration_seconds ? (
                  <span style={{ color: '#475569', marginLeft: 'auto', fontSize: 10 }}>
                    {Math.floor(entry.duration_seconds / 60)}м{Math.floor(entry.duration_seconds % 60)}с
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ) : highScore > 0 ? (
          <div style={{
            color: '#fde047',
            fontSize: 13,
            marginBottom: 16,
            background: 'rgba(253,224,71,0.08)',
            borderRadius: 8,
            padding: '6px 12px',
            display: 'inline-block',
          }}>
            🏆 Рекорд: {highScore}
          </div>
        ) : null}

        {/* How to play */}
        <div style={{
          background: '#0f172a',
          borderRadius: 12,
          padding: '14px',
          margin: '0 0 18px',
          textAlign: 'left',
          border: '1px solid #1e293b',
        }}>
          <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            Как играть
          </div>
          {[
            ['◀ ▶', 'Стрелки / A D — движение'],
            ['1234', 'Кнопки дорожек на телефоне'],
            ['📦', 'Ловите хорошие товары'],
            ['🚫', 'Плохие товары — штраф!'],
            ['👻', 'Тролли выглядят как обычные'],
            ['⚡', 'Хаос-события меняют правила'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 14, minWidth: 28, textAlign: 'center' }}>{icon}</span>
              <span style={{ color: '#94a3b8', fontSize: 12 }}>{text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          style={{
            width: '100%',
            padding: '16px 0',
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            fontSize: 18,
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: 0.5,
            boxShadow: '0 4px 20px rgba(59,130,246,0.5)',
            touchAction: 'manipulation',
          }}
        >
          🚀 Начать смену
        </button>
      </div>
    </div>
  );
}
