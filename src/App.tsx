import { useRef, useEffect, useCallback, useState } from 'react';
import type { GameState } from './types/game';
import {
  createInitialState,
  startGame,
  updateGame,
  movePlayer,
  setPlayerLane,
  getGameOverStats,
} from './game/gameEngine';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import EventBanner from './components/EventBanner';
import MobileControls from './components/MobileControls';
import GameOver from './components/GameOver';
import StartScreen from './components/StartScreen';

const MAX_CANVAS_W = 480;
const CANVAS_ASPECT = 0.6; // width/height ratio → width = height * 0.6

export default function App() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const rafRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  // ── Canvas sizing ────────────────────────────────────────────────
  const [canvasSize, setCanvasSize] = useState({ w: 320, h: 480 });

  useEffect(() => {
    function measure() {
      // HUD ~ 60px, EventBanner ~ 56px, MobileControls ~ 110px
      const reservedH = 60 + 56 + 110;
      const availH = Math.max(200, window.innerHeight - reservedH - 8);
      const availW = Math.min(window.innerWidth, MAX_CANVAS_W);
      const w = Math.min(availW, availH * CANVAS_ASPECT);
      const h = w / CANVAS_ASPECT;
      setCanvasSize({ w: Math.floor(w), h: Math.floor(h) });
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // ── Game loop ────────────────────────────────────────────────────
  const tick = useCallback((ts: number) => {
    if (lastTimeRef.current === 0) lastTimeRef.current = ts;
    const rawDt = (ts - lastTimeRef.current) / 1000;
    lastTimeRef.current = ts;
    const dt = Math.min(rawDt, 0.05); // cap at 50ms to avoid huge jumps

    setGameState((prev) => {
      if (prev.status !== 'playing') return prev;
      return updateGame(prev, dt, canvasSize.h);
    });

    rafRef.current = requestAnimationFrame(tick);
  }, [canvasSize.h]);

  useEffect(() => {
    if (gameState.status === 'playing') {
      lastTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current !== undefined) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = undefined;
      }
    }
    return () => {
      if (rafRef.current !== undefined) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = undefined;
      }
    };
  }, [gameState.status, tick]);

  // ── Keyboard input ───────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const s = stateRef.current;
      if (s.status !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setGameState((prev) => movePlayer(prev, 'left'));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setGameState((prev) => movePlayer(prev, 'right'));
      } else if (e.key === '1') setGameState((prev) => setPlayerLane(prev, 0));
      else if (e.key === '2') setGameState((prev) => setPlayerLane(prev, 1));
      else if (e.key === '3') setGameState((prev) => setPlayerLane(prev, 2));
      else if (e.key === '4') setGameState((prev) => setPlayerLane(prev, 3));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Swipe input on canvas ────────────────────────────────────────
  const touchStartX = useRef(0);
  const touchStartLane = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartLane.current = stateRef.current.playerLane;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const dx = e.touches[0].clientX - touchStartX.current;
    const laneDelta = Math.round(dx / (canvasSize.w / 4));
    const newLane = Math.max(0, Math.min(3, touchStartLane.current + laneDelta));
    setGameState((prev) => setPlayerLane(prev, newLane));
  }, [canvasSize.w]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleStart = useCallback(() => {
    setGameState((prev) => startGame(prev));
  }, []);

  const handleRestart = useCallback(() => {
    setGameState((prev) => startGame(prev));
  }, []);

  const handleMove = useCallback((dir: 'left' | 'right') => {
    setGameState((prev) => movePlayer(prev, dir));
  }, []);

  const handleSetLane = useCallback((lane: number) => {
    setGameState((prev) => setPlayerLane(prev, lane));
  }, []);

  const gameOverStats = gameState.status === 'gameover'
    ? getGameOverStats(gameState)
    : null;

  return (
    <div style={{
      height: '100dvh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      background: '#0a0f1e',
      overflowY: 'auto',
    }}>
      {/* Title bar */}
      <div style={{
        width: '100%',
        maxWidth: MAX_CANVAS_W,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 12px 2px',
        flexShrink: 0,
      }}>
        <span style={{ color: '#475569', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
          📦 Warehouse Catcher
        </span>
      </div>

      {/* HUD */}
      <HUD state={gameState} />

      {/* Event Banner */}
      <EventBanner event={gameState.activeEvent} />

      {/* Game area */}
      <div style={{
        position: 'relative',
        width: canvasSize.w,
        height: canvasSize.h,
        flexShrink: 0,
        overflow: 'hidden',
      }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <GameCanvas
          state={gameState}
          canvasWidth={canvasSize.w}
          canvasHeight={canvasSize.h}
        />

        {gameState.status === 'idle' && (
          <StartScreen highScore={gameState.highScore} onStart={handleStart} />
        )}
        {gameState.status === 'gameover' && gameOverStats && (
          <GameOver stats={gameOverStats} onRestart={handleRestart} />
        )}
      </div>

      {/* Mobile controls */}
      <MobileControls
        playerLane={gameState.playerLane}
        onMove={handleMove}
        onSetLane={handleSetLane}
        gameStatus={gameState.status}
      />
    </div>
  );
}
