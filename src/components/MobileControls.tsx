import { useCallback } from 'react';
import { LANES } from '../game/gameEngine';

interface Props {
  playerLane: number;
  onMove: (dir: 'left' | 'right') => void;
  onSetLane: (lane: number) => void;
  gameStatus: string;
}

export default function MobileControls({ playerLane, onMove, onSetLane, gameStatus }: Props) {
  if (gameStatus !== 'playing') return null;

  const btnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '16px 0',
    fontSize: 28,
    background: active ? 'rgba(59,130,246,0.35)' : 'rgba(30,41,59,0.8)',
    border: active ? '2px solid #3b82f6' : '2px solid #334155',
    borderRadius: 12,
    color: '#e2e8f0',
    cursor: 'pointer',
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    transition: 'background 0.1s, border 0.1s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  });

  const laneBtnStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px 4px',
    fontSize: 13,
    fontWeight: 700,
    background: isActive ? 'rgba(59,130,246,0.4)' : 'rgba(15,23,42,0.6)',
    border: isActive ? '2px solid #60a5fa' : '2px solid #1e293b',
    borderRadius: 8,
    color: isActive ? '#bfdbfe' : '#475569',
    cursor: 'pointer',
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    transition: 'background 0.1s',
    minHeight: 36,
  });

  const handleLeft = useCallback(() => onMove('left'), [onMove]);
  const handleRight = useCallback(() => onMove('right'), [onMove]);

  return (
    <div style={{
      width: '100%',
      maxWidth: 500,
      padding: '6px 10px 10px',
      background: 'rgba(15,23,42,0.95)',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      flexShrink: 0,
    }}>
      {/* Direct lane buttons */}
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: LANES }).map((_, i) => (
          <button
            key={i}
            style={laneBtnStyle(i === playerLane)}
            onPointerDown={(e) => { e.preventDefault(); onSetLane(i); }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Left / Right arrows */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          style={btnStyle(false)}
          onPointerDown={(e) => { e.preventDefault(); handleLeft(); }}
        >
          ◀
        </button>
        <button
          style={btnStyle(false)}
          onPointerDown={(e) => { e.preventDefault(); handleRight(); }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}
