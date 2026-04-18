import type { GameState } from '../types/game';

interface Props {
  state: GameState;
}

export default function HUD({ state }: Props) {
  const { score, highScore, lives, chaos, combo } = state;

  const chaosColor =
    chaos >= 80 ? '#ef4444' : chaos >= 50 ? '#f59e0b' : '#10b981';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '6px 10px',
      background: 'rgba(15,23,42,0.95)',
      borderBottom: '1px solid #1e293b',
      width: '100%',
      maxWidth: 500,
      gap: 6,
      flexShrink: 0,
    }}>
      {/* Score */}
      <div style={{ textAlign: 'center', minWidth: 70 }}>
        <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
          Score
        </div>
        <div style={{ color: '#fde047', fontSize: 20, fontWeight: 800, lineHeight: 1 }}>
          {score}
        </div>
        <div style={{ color: '#475569', fontSize: 9 }}>
          Best: {highScore}
        </div>
      </div>

      {/* Lives */}
      <div style={{ textAlign: 'center', minWidth: 60 }}>
        <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
          Жизни
        </div>
        <div style={{ fontSize: 18, letterSpacing: 2 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} style={{ opacity: i < lives ? 1 : 0.2 }}>❤️</span>
          ))}
        </div>
      </div>

      {/* Combo */}
      <div style={{ textAlign: 'center', minWidth: 55 }}>
        <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
          Combo
        </div>
        <div style={{
          color: combo >= 5 ? '#f97316' : combo >= 3 ? '#fbbf24' : '#64748b',
          fontSize: 20,
          fontWeight: 800,
          lineHeight: 1,
          transition: 'color 0.2s',
        }}>
          {combo > 0 ? `x${combo}` : '—'}
        </div>
      </div>

      {/* Chaos */}
      <div style={{ textAlign: 'center', minWidth: 70 }}>
        <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
          Хаос
        </div>
        <div style={{
          background: '#1e293b',
          borderRadius: 6,
          height: 10,
          width: 64,
          overflow: 'hidden',
          marginTop: 4,
          border: '1px solid #334155',
        }}>
          <div style={{
            height: '100%',
            width: `${chaos}%`,
            background: chaosColor,
            transition: 'width 0.3s, background 0.3s',
            borderRadius: 6,
          }} />
        </div>
        <div style={{ color: chaosColor, fontSize: 10, marginTop: 2, fontWeight: 700 }}>
          {Math.round(chaos)}%
        </div>
      </div>
    </div>
  );
}
