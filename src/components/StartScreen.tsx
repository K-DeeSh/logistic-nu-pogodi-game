interface Props {
  highScore: number;
  onStart: () => void;
}

export default function StartScreen({ highScore, onStart }: Props) {
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
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 18 }}>
          Склад в хаосе. Кладовщик нужен.
        </p>

        {highScore > 0 && (
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
        )}

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
