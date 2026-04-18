import type { ActiveEvent } from '../types/game';

interface Props {
  event: ActiveEvent | null;
}

export default function EventBanner({ event }: Props) {
  if (!event) return <div style={{ height: 36, flexShrink: 0 }} />;

  const progress = event.timeLeft / event.duration;
  const urgentColor = progress < 0.3 ? '#ef4444' : '#f59e0b';

  return (
    <div style={{
      width: '100%',
      maxWidth: 500,
      flexShrink: 0,
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      borderBottom: `2px solid ${urgentColor}`,
      padding: '4px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#c7d2fe', fontSize: 12, fontWeight: 700 }}>
          {event.name}
        </div>
        <div style={{ color: urgentColor, fontSize: 11, fontWeight: 700, minWidth: 28, textAlign: 'right' }}>
          {Math.ceil(event.timeLeft)}s
        </div>
      </div>
      <div style={{ color: '#818cf8', fontSize: 10 }}>
        {event.description}
      </div>
      {/* Progress bar */}
      <div style={{ height: 3, background: '#1e1b4b', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: urgentColor,
          transition: 'width 0.2s linear',
          borderRadius: 2,
        }} />
      </div>
    </div>
  );
}
