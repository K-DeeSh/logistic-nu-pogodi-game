import type { GameOverStats } from '../types/game';
import { getFunnySummary } from '../game/gameEngine';

interface Props {
  stats: GameOverStats;
  onRestart: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}м ${s}с` : `${s}с`;
}

export default function GameOver({ stats, onRestart }: Props) {
  const summary = getFunnySummary(stats);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.88)',
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
        padding: '24px 20px',
        maxWidth: 380,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
      }}>
        <div style={{ fontSize: 48 }}>📦</div>
        <h2 style={{ color: '#f1f5f9', fontSize: 22, fontWeight: 800, margin: '8px 0 4px' }}>
          Смена закончилась
        </h2>

        {stats.isNewHighScore && (
          <div style={{
            background: 'linear-gradient(135deg, #ca8a04, #eab308)',
            color: '#1c1917',
            borderRadius: 8,
            padding: '6px 12px',
            fontWeight: 800,
            fontSize: 13,
            marginBottom: 10,
            display: 'inline-block',
          }}>
            🏆 Новый рекорд!
          </div>
        )}

        {/* Score */}
        <div style={{
          background: '#0f172a',
          borderRadius: 12,
          padding: '12px 16px',
          margin: '10px 0',
          border: '1px solid #1e3a5f',
        }}>
          <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
            Итоговый счёт
          </div>
          <div style={{ color: '#fde047', fontSize: 36, fontWeight: 900, lineHeight: 1.1 }}>
            {stats.score}
          </div>
          {stats.isNewHighScore ? null : (
            <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>
              Рекорд: {stats.highScore}
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          margin: '10px 0',
        }}>
          {[
            { label: 'Поймано', value: stats.caught, icon: '✅' },
            { label: 'Пропущено', value: stats.missed, icon: '💨' },
            { label: 'Макс. комбо', value: `x${stats.maxCombo}`, icon: '🔥' },
            { label: 'Время', value: formatTime(stats.survivalTime), icon: '⏱️' },
            { label: 'Плохих поймано', value: stats.badCaught, icon: '🚫' },
            { label: 'Событий', value: stats.eventsLived, icon: '⚡' },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{
              background: '#0f172a',
              borderRadius: 8,
              padding: '8px 10px',
              border: '1px solid #1e293b',
            }}>
              <div style={{ fontSize: 16 }}>{icon}</div>
              <div style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 700 }}>{value}</div>
              <div style={{ color: '#64748b', fontSize: 10 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Funny summary */}
        <div style={{
          background: '#1e293b',
          borderRadius: 10,
          padding: '10px 14px',
          margin: '10px 0',
          color: '#94a3b8',
          fontSize: 13,
          fontStyle: 'italic',
          lineHeight: 1.4,
        }}>
          {summary}
        </div>

        {/* Restart */}
        <button
          onClick={onRestart}
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
            boxShadow: '0 4px 15px rgba(59,130,246,0.4)',
            touchAction: 'manipulation',
          }}
        >
          🔄 Ещё раз
        </button>
      </div>
    </div>
  );
}
